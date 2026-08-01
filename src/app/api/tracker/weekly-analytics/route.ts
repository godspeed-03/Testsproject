import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import {
  getEffectiveUserId,
  calculateAndSaveWeeklyData
} from '@/lib/weeklyAnalyticsEngine';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    await connectToDatabase();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId);
    return NextResponse.json(weeklyDoc);
  } catch (error: any) {
    console.error('Error in weekly analytics GET route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getUserFromCookies();
    await connectToDatabase();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId);
    return NextResponse.json({
      success: true,
      data: weeklyDoc,
      calculatedAt: weeklyDoc.calculatedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    console.error('Error in recalculate weekly POST route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
