import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import {
  getEffectiveUserId,
  calculateAndSaveWeeklyData,
  getAllAvailableWeeks,
} from '@/lib/weeklyAnalyticsEngine';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const { searchParams } = new URL(req.url);
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0', 10);
    const weekKey = searchParams.get('weekKey');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let targetDate = new Date();
    let customStart: string | undefined;
    let customEnd: string | undefined;

    if (startDate && endDate) {
      customStart = startDate;
      customEnd = endDate;
    } else if (weekKey) {
      const [startStr, endStr] = weekKey.split('_to_');
      if (startStr && endStr) {
        customStart = startStr;
        customEnd = endStr;
      } else if (startStr) {
        targetDate = new Date(startStr + 'T00:00:00');
      }
    } else if (weekOffset !== 0) {
      targetDate.setDate(targetDate.getDate() + weekOffset * 7);
    }

    const [weeklyDoc, availableWeeks] = await Promise.all([
      calculateAndSaveWeeklyData(effectiveUserId, targetDate, customStart, customEnd),
      getAllAvailableWeeks(effectiveUserId),
    ]);

    const breakdown = (weeklyDoc?.breakdown as any) || {};

    return NextResponse.json({
      ...weeklyDoc,
      ...breakdown,
      availableWeeks,
      weekOffset,
    });
  } catch (error: any) {
    console.error('Error in weekly analytics GET route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    let weekOffset = 0;
    let weekKey: string | null = null;
    let startDate: string | null = null;
    let endDate: string | null = null;

    try {
      const body = await req.json();
      if (body.weekOffset !== undefined) weekOffset = Number(body.weekOffset);
      if (body.weekKey) weekKey = body.weekKey;
      if (body.startDate) startDate = body.startDate;
      if (body.endDate) endDate = body.endDate;
    } catch (e) {}

    let targetDate = new Date();
    let customStart: string | undefined;
    let customEnd: string | undefined;

    if (startDate && endDate) {
      customStart = startDate;
      customEnd = endDate;
    } else if (weekKey) {
      const [startStr, endStr] = weekKey.split('_to_');
      if (startStr && endStr) {
        customStart = startStr;
        customEnd = endStr;
      } else if (startStr) {
        targetDate = new Date(startStr + 'T00:00:00');
      }
    } else if (weekOffset !== 0) {
      targetDate.setDate(targetDate.getDate() + weekOffset * 7);
    }

    const [weeklyDoc, availableWeeks] = await Promise.all([
      calculateAndSaveWeeklyData(effectiveUserId, targetDate, customStart, customEnd),
      getAllAvailableWeeks(effectiveUserId),
    ]);

    const breakdown = (weeklyDoc?.breakdown as any) || {};
    const responseData = {
      ...weeklyDoc,
      ...breakdown,
      availableWeeks,
      weekOffset,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      ...responseData,
      calculatedAt: weeklyDoc.updatedAt
        ? new Date(weeklyDoc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error('Error in recalculate weekly POST route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
