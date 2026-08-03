import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import {
  getEffectiveUserId,
  calculateAndSaveWeeklyData,
} from '@/lib/weeklyAnalyticsEngine';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId);
    const breakdown = (weeklyDoc?.breakdown as any) || {};

    return NextResponse.json({
      ...weeklyDoc,
      ...breakdown,
    });
  } catch (error: any) {
    console.error('Error in weekly analytics GET route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId);
    const breakdown = (weeklyDoc?.breakdown as any) || {};
    const responseData = {
      ...weeklyDoc,
      ...breakdown,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      ...responseData,
      calculatedAt: weeklyDoc.updatedAt ? new Date(weeklyDoc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error('Error in recalculate weekly POST route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
