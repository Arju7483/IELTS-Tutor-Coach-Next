import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { generateWritingQuestions } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count = 5, topic, difficulty, taskType } = await req.json();

    const questions = await generateWritingQuestions(
      Math.min(count, 20),
      topic,
      difficulty,
      taskType
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
      await db.collection('writing_task2_questions').insertMany(docs);
    }

    return NextResponse.json({ questions: docs, totalGenerated: docs.length });
  } catch (err) {
    console.error('Writing question generation error:', err);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
