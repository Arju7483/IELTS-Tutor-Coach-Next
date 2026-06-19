import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// GET - Fetch user's session history
export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const sessions = await db
      .collection('voice_sessions')
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST - Save completed session
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const session = {
      userId: new ObjectId(decoded.userId),
      topic: body.topic || 'Open conversation',
      duration: body.duration || 0,
      transcript: body.transcript || [],
      createdAt: new Date(),
    };

    const result = await db.collection('voice_sessions').insertOne(session);

    return NextResponse.json({
      success: true,
      sessionId: result.insertedId,
    });
  } catch (error) {
    console.error('Session save error:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
