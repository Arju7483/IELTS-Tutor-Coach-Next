import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter using a Map
 * For production, consider using Redis or Upstash for distributed rate limiting
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Rate limit checker
 * @param identifier - Unique identifier (typically userId or IP)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining count
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, uniqueTokenPerInterval: 10 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetTime < now) {
    // First request or expired window - create new entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval,
    };
  }

  // Existing entry within time window
  if (entry.count >= config.uniqueTokenPerInterval) {
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitMap.set(identifier, entry);

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 * @param identifier - Unique identifier (typically userId or IP)
 * @param config - Rate limit configuration
 * @returns NextResponse with 429 status if rate limit exceeded, null otherwise
 */
export function applyRateLimit(
  identifier: string,
  config?: RateLimitConfig
): NextResponse | null {
  const result = checkRateLimit(identifier, config);

  if (!result.success) {
    const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: resetInSeconds,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': resetInSeconds.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Get client identifier from request (userId or IP as fallback)
 */
export function getClientIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Predefined rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // AI evaluation endpoints (expensive)
  AI_EVALUATION: {
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 5, // 5 evaluations per minute
  },
  
  // AI generation endpoints (moderate cost)
  AI_GENERATION: {
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 generations per minute
  },
  
  // Standard CRUD operations
  STANDARD: {
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 30, // 30 requests per minute
  },
  
  // Auth endpoints (balance security with usability)
  AUTH: {
    interval: 900000, // 15 minutes
    uniqueTokenPerInterval: 15, // 15 attempts per 15 minutes (1 per minute average)
  },
} as const;
