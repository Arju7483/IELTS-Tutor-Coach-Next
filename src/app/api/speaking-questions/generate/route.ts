import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { generateSpeakingQuestions } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count = 5, topic, part = 'Part 2', difficulty = 'Medium' } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const questions = await generateSpeakingQuestions(
      Math.min(count, 15),
      topic,
      part,
      difficulty
    );

    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const docs = questions.map(q => ({
      ...q,
      isActive: true,
      createdAt: new Date(),
      generatedBy: user.userId,
    }));

    if (docs.length > 0) {
      await db.collection('speaking_questions').insertMany(docs);
    }

    return NextResponse.json({ questions: docs, totalGenerated: docs.length });
  } catch (err) {
    console.error('Speaking question generation error:', err);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
