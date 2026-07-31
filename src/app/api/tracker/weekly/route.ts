import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import WeeklyTarget from '@/models/WeeklyTarget';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { startOfWeek, targets } = await req.json();

    if (!startOfWeek || !Array.isArray(targets)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const doc = await WeeklyTarget.findOneAndUpdate(
      { userId: user.userId, startOfWeek },
      { userId: user.userId, startOfWeek, targets },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      message: 'Weekly targets saved to DB successfully',
      weeklyTargetsList: doc.targets
    });
  } catch (error: any) {
    console.error('Failed to save weekly targets in DB', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
