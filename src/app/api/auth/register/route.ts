import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
