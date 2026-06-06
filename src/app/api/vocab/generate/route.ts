import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { generateVocabWords } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count = 5, topic, difficulty = 'band8' } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const words = await generateVocabWords(
      Math.min(count, 15),
      topic,
      difficulty
    );

    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const docs = words.map(w => ({
      ...w,
      userId: user.userId,
      createdAt: new Date(),
    }));

    if (docs.length > 0) {
      await db.collection('vocab_words').insertMany(docs);
    }

    return NextResponse.json({ words: docs, totalGenerated: docs.length });
  } catch (err) {
    console.error('Vocab generation error:', err);
    return NextResponse.json({ error: 'Failed to generate vocabulary' }, { status: 500 });
  }
}
