import { NextRequest, NextResponse } from 'next/server';
import { Db } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { speakingSeeds } from '@/lib/seeds';
import { getUserFromRequest } from '@/lib/auth';

async function ensureSeeded(db: Db) {
  const col = db.collection('speaking_questions');
  const count = await col.countDocuments();
  if (count === 0) {
    const docs = speakingSeeds.map(s => ({ ...s, isActive: true, createdAt: new Date() }));
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
    const part = searchParams.get('part');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { isActive: true };
    if (topic) filter.topic = topic;
    if (part) filter.part = part;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await db.collection('speaking_questions')
      .find(filter)
      .limit(limit)
      .toArray();

    return NextResponse.json(questions);
  } catch (err) {
    console.error('Speaking questions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get a random speaking question the user has NOT already answered.
 */
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const client = await clientPromise;
    const db = client.db('ielts_coach');
    await ensureSeeded(db);

    const body = await req.json().catch(() => ({}));
    const { topic, part, difficulty } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { isActive: true };
    if (topic) filter.topic = topic;
    if (part) filter.part = part;
    if (difficulty) filter.difficulty = difficulty;

    // Exclude questions already answered by this user
    if (user) {
      const seenEvals = await db.collection('speaking_evaluations')
        .find({ userId: user.userId }, { projection: { questionId: 1 } })
        .toArray();
      const seenIds = seenEvals.map(e => e.questionId).filter(Boolean);
      if (seenIds.length > 0) {
        const { ObjectId } = await import('mongodb');
        filter._id = { $nin: seenIds.map((id: string) => { try { return new ObjectId(id); } catch { return id; } }) };
      }
    }

    let count = await db.collection('speaking_questions').countDocuments(filter);
    if (count === 0) {
      delete filter._id;
      count = await db.collection('speaking_questions').countDocuments(filter);
      if (count === 0) {
        return NextResponse.json({ error: 'No questions found' }, { status: 404 });
      }
    }

    const skip = Math.floor(Math.random() * count);
    const question = await db.collection('speaking_questions')
      .find(filter)
      .skip(skip)
      .limit(1)
      .next();

    return NextResponse.json(question);
  } catch (err) {
    console.error('Random speaking question error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
