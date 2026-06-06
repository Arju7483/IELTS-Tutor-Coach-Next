import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { speakingSeeds } from '@/lib/seeds';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('ielts_coach');
    const col = db.collection('speaking_questions');

    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(speakingSeeds.map(s => ({ ...s, isActive: true, createdAt: new Date() })));
    }

    const topics = await col.distinct('topic', { isActive: true });
    const parts = await col.distinct('part', { isActive: true });
    const difficulties = await col.distinct('difficulty', { isActive: true });

    return NextResponse.json({
      topics: topics.sort(),
      parts: ['Part 1', 'Part 2', 'Part 3'].filter(p => parts.includes(p)),
      difficulties: ['Easy', 'Medium', 'Hard'].filter(d => difficulties.includes(d)),
    });
  } catch (err) {
    console.error('Speaking metadata error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
