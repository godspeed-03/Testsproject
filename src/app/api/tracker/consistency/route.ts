import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import {
  getMonthKey,
  getMonthName,
  getEffectiveUserId,
  runFullConsistencyPipeline,
} from '@/lib/consistencyEngineV3';

function getGradeLabel(score: number): string {
  if (score >= 90) return 'S-TIER CONSISTENT';
  if (score >= 75) return 'A-TIER CONSISTENT';
  if (score >= 60) return 'B-TIER STABLE';
  return 'NEEDS FOCUS';
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';
    const monthKey = searchParams.get('monthKey') || getMonthKey();
    const habitIdFilter = searchParams.get('habitId');
    const subjectFilter = searchParams.get('subject');

    const pipelineRes = await runFullConsistencyPipeline(effectiveUserId);
    let monthlyDoc = await prisma.monthlySnapshot.findUnique({
      where: {
        userId_monthKey: {
          userId: effectiveUserId,
          monthKey,
        },
      },
    });

    if (!monthlyDoc) {
      monthlyDoc = pipelineRes.monthly as any;
    }
    const allTimeDoc = pipelineRes.allTime as any;

    if (range === 'month') {
      const dailyDocs = await prisma.dailySnapshot.findMany({
        where: { userId: effectiveUserId, monthKey },
        orderBy: { studyDayKey: 'asc' },
      });

      const currentMonthDoc = monthlyDoc || {
        avgConsistencyScore: 0,
        activeDaysCount: 0,
      };

      const overallScore = currentMonthDoc.avgConsistencyScore || 0;

      const categoryFilter = searchParams.get('category');

      const trend = dailyDocs.map((d) => ({
        studyDayKey: d.studyDayKey,
        overallScore: d.finalConsistencyScore,
        habitScore: Math.round(d.habitsCompletionRatio * 100),
        taskScore: d.finalConsistencyScore,
        revisionScore: d.finalConsistencyScore,
      }));

      return NextResponse.json({
        range: 'month',
        monthKey,
        monthName: getMonthName(monthKey),
        overallScore,
        habitScore: overallScore,
        taskScore: overallScore,
        revisionScore: overallScore,
        grade: getGradeLabel(overallScore),
        trend,
        habits: [],
        categories: [],
        subjects: [],
        calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    const monthlyDocs = await prisma.monthlySnapshot.findMany({
      where: { userId: effectiveUserId },
      orderBy: { monthKey: 'asc' },
    });

    const overallScore = allTimeDoc?.overallConsistencyScore || 0;

    const trend = monthlyDocs.map((m) => ({
      studyDayKey: m.monthKey,
      overallScore: m.avgConsistencyScore,
      habitScore: m.avgConsistencyScore,
      taskScore: m.avgConsistencyScore,
      revisionScore: m.avgConsistencyScore,
    }));

    return NextResponse.json({
      range: 'alltime',
      overallScore,
      habitScore: overallScore,
      taskScore: overallScore,
      revisionScore: overallScore,
      grade: getGradeLabel(overallScore),
      trend,
      habits: [],
      categories: [],
      subjects: [],
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error('Error in consistency API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
