import { NextRequest, NextResponse } from 'next/server';
import { Db } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { writingTask2Seeds } from '@/lib/seeds';
import { getUserFromRequest } from '@/lib/auth';

async function ensureSeeded(db: Db) {
  const col = db.collection('writing_task2_questions');
  const count = await col.countDocuments();
  if (count === 0) {
    const docs = writingTask2Seeds.map(s => ({ ...s, isActive: true, createdAt: new Date() }));
    await col.insertMany(docs);
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('ielts_coach');
    await ensureSeeded(db);

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');
    const taskType = searchParams.get('taskType');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { isActive: true };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (taskType) filter.taskType = taskType;

    const questions = await db.collection('writing_task2_questions')
      .find(filter)
      .limit(limit)
      .toArray();

    return NextResponse.json(questions);
  } catch (err) {
    console.error('Writing questions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get a random question that the user has NOT already been shown.
 * Falls back to any random question if the user has seen them all.
 */
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const client = await clientPromise;
    const db = client.db('ielts_coach');
    await ensureSeeded(db);

    const body = await req.json().catch(() => ({}));
    const { topic, difficulty, taskType } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { isActive: true };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (taskType) filter.taskType = taskType;

    // If authenticated, exclude questions the user already answered
    if (user) {
      const seenEvals = await db.collection('writing_evaluations')
        .find({ userId: user.userId }, { projection: { prompt: 1 } })
        .toArray();
      const seenPrompts = seenEvals.map(e => e.prompt).filter(Boolean);
      if (seenPrompts.length > 0) {
        filter.prompt = { $nin: seenPrompts };
      }
    }

    // Count and pick random
    let count = await db.collection('writing_task2_questions').countDocuments(filter);
    if (count === 0) {
      // fallback: remove the $nin filter
      delete filter.prompt;
      count = await db.collection('writing_task2_questions').countDocuments(filter);
      if (count === 0) {
        return NextResponse.json({ error: 'No questions found' }, { status: 404 });
      }
    }

    const skip = Math.floor(Math.random() * count);
    const question = await db.collection('writing_task2_questions')
      .find(filter)
      .skip(skip)
      .limit(1)
      .next();

    return NextResponse.json(question);
  } catch (err) {
    console.error('Random writing question error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
