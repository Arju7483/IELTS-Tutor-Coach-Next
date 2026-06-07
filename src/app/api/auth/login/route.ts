import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { comparePassword, signToken } from '@/lib/auth';
import { applyRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
import { seedDatabase } from '@/lib/seeds';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting to prevent brute force attacks
    const rateLimitResponse = applyRateLimit(
      getClientIdentifier(req),
      RATE_LIMITS.AUTH
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ielts_coach');
    const users = db.collection('users');

    // Ensure seed data exists
    await seedDatabase(db);

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!comparePassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
