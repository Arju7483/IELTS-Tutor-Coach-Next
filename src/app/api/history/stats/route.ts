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

    // Get all scores for this user
    const history = await db.collection('score_history')
      .find({ userId: user.userId })
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    const writingScores = history.filter(h => h.type === 'writing').map(h => h.score);
    const speakingScores = history.filter(h => h.type === 'speaking').map(h => h.score);

    const avg = (arr: number[]) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
    const allScores = [...writingScores, ...speakingScores];

    return NextResponse.json({
      writingAvg: Math.round(avg(writingScores) * 2) / 2,
      speakingAvg: Math.round(avg(speakingScores) * 2) / 2,
      totalSessions: history.length,
      bestScore: allScores.length > 0 ? Math.max(...allScores) : 0,
      recentHistory: history.slice(0, 20),
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
