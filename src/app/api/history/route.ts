import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const history = await db.collection('score_history')
      .find({ userId: user.userId })
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(history);
  } catch (err) {
    console.error('History fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
