import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { writingTask2Seeds } from '@/lib/seeds';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('ielts_coach');
    const col = db.collection('writing_task2_questions');

    // Ensure seeded
    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(writingTask2Seeds.map(s => ({ ...s, isActive: true, createdAt: new Date() })));
    }

    const topics = await col.distinct('topic', { isActive: true });
    const difficulties = await col.distinct('difficulty', { isActive: true });
    const taskTypes = await col.distinct('taskType', { isActive: true });

    return NextResponse.json({
      topics: topics.sort(),
      difficulties: ['Easy', 'Medium', 'Hard'].filter(d => difficulties.includes(d)),
      taskTypes: taskTypes.sort(),
    });
  } catch (err) {
    console.error('Writing metadata error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
