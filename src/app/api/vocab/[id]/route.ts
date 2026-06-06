import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { ObjectId } = await import('mongodb');

    const client = await clientPromise;
    const db = client.db('ielts_coach');

    const result = await db.collection('vocab_words').deleteOne({
      _id: new ObjectId(id),
      userId: user.userId, // only delete user's own words
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Word not found or not yours to delete' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete vocab error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
