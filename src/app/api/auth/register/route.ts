import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword, signToken } from '@/lib/auth';
import { applyRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
import { seedDatabase } from '@/lib/seeds';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting to prevent abuse
    const rateLimitResponse = applyRateLimit(
      getClientIdentifier(req),
      RATE_LIMITS.AUTH
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ielts_coach');
    const users = db.collection('users');

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Seed the database with initial data
    await seedDatabase(db);

    const result = await users.insertOne({
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      name: name || null,
      createdAt: new Date(),
    });

    const token = signToken({ userId: result.insertedId.toString(), email: email.toLowerCase() });

    return NextResponse.json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: email.toLowerCase(),
        name: name || null,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    
    // Check if it's a MongoDB connection error
    if (err instanceof Error) {
      if (err.message.includes('ECONNREFUSED') || err.message.includes('MongoNetworkError')) {
        return NextResponse.json({ 
          error: 'Database connection failed. Please ensure MongoDB is running or check your connection string.' 
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
