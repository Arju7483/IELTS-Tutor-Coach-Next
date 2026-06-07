# Rate Limiting Implementation

This application implements rate limiting to protect against abuse and manage API costs, especially for expensive AI-powered endpoints.

## Rate Limit Tiers

### 1. **AI Evaluation Endpoints** (Most Expensive)
- **Endpoints**: `/api/evaluate-writing`, `/api/evaluate-speaking`
- **Limit**: 5 requests per minute per user
- **Reason**: These endpoints call Google Gemini API for AI-powered essay/speech evaluation, which is the most expensive operation

### 2. **AI Generation Endpoints** (Moderate Cost)
- **Endpoints**: 
  - `/api/vocab/generate`
  - `/api/writing-task2/generate`
  - `/api/speaking-questions/generate`
- **Limit**: 10 requests per minute per user
- **Reason**: These endpoints generate content via Gemini API but are less intensive than full evaluations

### 3. **Authentication Endpoints** (Security Critical)
- **Endpoints**: `/api/auth/login`, `/api/auth/register`
- **Limit**: 15 requests per 15 minutes per IP
- **Reason**: Balances security against brute force attacks while allowing legitimate users to recover from typos or connection issues. This allows roughly 1 attempt per minute, which is reasonable for normal usage but prevents automated attacks.

### 4. **Standard CRUD Operations** (Default)
- **Limit**: 30 requests per minute per user
- **Reason**: Standard database operations with minimal cost

## Implementation Details

### Current Approach: In-Memory Storage
- Uses a JavaScript `Map` to track rate limits
- Automatically cleans up expired entries every 10 minutes
- **Pros**: Simple, no external dependencies, works for single-server deployments
- **Cons**: Not suitable for multi-server/distributed deployments (each server has its own memory)

### Response Headers
When a request is rate limited, the API returns:
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

With HTTP headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when the limit resets
- `Retry-After`: Seconds until user can retry

### Client Identification
Rate limits are tracked by:
1. **User ID** (for authenticated requests) - Format: `user:{userId}`
2. **IP Address** (fallback for unauthenticated/failed auth) - Format: `ip:{ipAddress}`

## Upgrading to Production

### Recommended: Redis/Upstash
For production deployments with multiple servers, replace the in-memory implementation with Redis:

```bash
npm install @upstash/redis
```

Update `src/lib/rateLimit.ts` to use Upstash Redis:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.pexpire(key, config.interval);
  }
  
  const ttl = await redis.pttl(key);
  
  return {
    success: count <= config.uniqueTokenPerInterval,
    limit: config.uniqueTokenPerInterval,
    remaining: Math.max(0, config.uniqueTokenPerInterval - count),
    reset: now + ttl,
  };
}
```

### Alternative: Vercel Edge Config
For Vercel deployments, you can use Vercel's Edge Config or KV storage.

## Testing Rate Limits

### Manual Testing
```bash
# Test AI evaluation endpoint (should fail after 5 requests in 1 minute)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/evaluate-writing \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"essay":"test essay content here"}' \
    && echo "\nRequest $i succeeded"
done
```

### Expected Behavior
- Requests 1-5: Success (200 OK)
- Request 6: Rate limited (429 Too Many Requests)

## Monitoring

Consider adding monitoring to track:
- Rate limit hit frequency
- Users hitting limits repeatedly
- API cost per user
- Peak usage times

## Future Enhancements

1. **Tiered Plans**: Different rate limits for free vs paid users
2. **Burst Allowance**: Allow temporary bursts above the limit
3. **Adaptive Limits**: Increase limits for users with good history
4. **Grace Period**: Warning before hard blocking
5. **Admin Override**: Whitelist certain users/IPs
