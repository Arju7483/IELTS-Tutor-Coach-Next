import { NextRequest, NextResponse } from 'next/server';
import { Db } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { vocabSeeds } from '@/lib/seeds';
import { getUserFromRequest } from '@/lib/auth';

async function ensureSeeded(db: Db) {
  const col = db.collection('vocab_words');
  const count = await col.countDocuments();
  if (count === 0) {
    const docs = vocabSeeds.map(v => ({ ...v, userId: 'system', createdAt: new Date() }));
    await col.insertMany(docs);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const client = await clientPromise;
    const db = client.db('ielts_coach');
    await ensureSeeded(db);

    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    // Show system words + user's own words
    if (user) {
      filter.$or = [
        { userId: 'system' },
        { userId: '' },
        { userId: user.userId },
      ];
    } else {
      filter.$or = [{ userId: 'system' }, { userId: '' }];
    }

    if (difficulty) filter.difficulty = difficulty;

    const words = await db.collection('vocab_words')
      .find(filter)
      .sort({ word: 1 })
      .toArray();

    return NextResponse.json(words);
  } catch (err) {
    console.error('Vocab list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { word, phonetic, partOfSpeech, definition, example, synonyms, difficulty } = body;

    if (!word || !definition) {
      return NextResponse.json({ error: 'Word and definition are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const doc = {
      userId: user.userId,
      word,
      phonetic: phonetic || null,
      partOfSpeech: partOfSpeech || null,
      definition,
      example: example || '',
      synonyms: synonyms || [],
      difficulty: difficulty || 'band8',
      createdAt: new Date(),
    };

    const result = await db.collection('vocab_words').insertOne(doc);

    return NextResponse.json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error('Create vocab error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
