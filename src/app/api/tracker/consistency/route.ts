import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import DailySnapshot from '@/models/DailySnapshot';
import MonthlySnapshot from '@/models/MonthlySnapshot';
import AllTimeSnapshot from '@/models/AllTimeSnapshot';
import {
  getMonthKey,
  getMonthName,
  getEffectiveUserId,
  runFullConsistencyPipeline
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
    await connectToDatabase();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month'; // 'month' | 'alltime'
    const monthKey = searchParams.get('monthKey') || getMonthKey(); // 'YYYY-MM'
    const scope = searchParams.get('scope') || 'overall'; // 'overall' | 'habit' | 'subject'
    const habitIdFilter = searchParams.get('habitId');
    const subjectFilter = searchParams.get('subject');

    // Check if snapshots exist; if not or if categoryBreakdown is missing/empty, trigger calculation pipeline
    let monthlyDoc = await MonthlySnapshot.findOne({ userId: effectiveUserId, monthKey });
    let allTimeDoc = await AllTimeSnapshot.findOne({ userId: effectiveUserId });

    if (
      !monthlyDoc ||
      !allTimeDoc ||
      !monthlyDoc.categoryBreakdown ||
      monthlyDoc.categoryBreakdown.length === 0 ||
      !allTimeDoc.categoryBreakdown ||
      allTimeDoc.categoryBreakdown.length === 0
    ) {
      const pipelineRes = await runFullConsistencyPipeline(effectiveUserId);
      monthlyDoc = pipelineRes.monthly as any;
      allTimeDoc = pipelineRes.allTime as any;
    }

    // 1. THIS MONTH RANGE
    if (range === 'month') {
      const dailyDocs = await DailySnapshot.find({ userId: effectiveUserId, monthKey }).sort({ studyDayKey: 1 });
      const currentMonthDoc = monthlyDoc || {
        overallScore: 0,
        habitScore: 0,
        taskScore: 0,
        revisionScore: 0,
        habitBreakdown: [],
        categoryBreakdown: [],
        subjectBreakdown: [],
        calculatedAt: ''
      };

      const habits = currentMonthDoc.habitBreakdown || [];
      const categories = (currentMonthDoc as any).categoryBreakdown || [];
      const subjects = currentMonthDoc.subjectBreakdown || [];

      const categoryFilter = searchParams.get('category');

      let overallScore = currentMonthDoc.overallScore;
      let habitScore = currentMonthDoc.habitScore;
      let taskScore = currentMonthDoc.taskScore;
      let revisionScore = currentMonthDoc.revisionScore;

      // Item-specific score calculation if filtered
      if (habitIdFilter) {
        const foundHabit = habits.find((h: any) => h.habitId === habitIdFilter);
        if (foundHabit) {
          overallScore = foundHabit.score;
          habitScore = foundHabit.score;
        }
      } else if (categoryFilter) {
        const foundCat = categories.find((c: any) => (c.category || c.subject) === categoryFilter);
        if (foundCat) {
          overallScore = foundCat.score;
          revisionScore = foundCat.score;
        }
      } else if (subjectFilter) {
        const foundSubj = subjects.find((s: any) => s.subject === subjectFilter);
        if (foundSubj) {
          overallScore = foundSubj.score;
          revisionScore = foundSubj.score;
        }
      }

      const trend = dailyDocs.map((d) => {
        let itemScore = d.overallScore;
        if (habitIdFilter) {
          const match = (d.habitBreakdown || []).find((h: any) => h.habitId === habitIdFilter);
          itemScore = match ? match.score : 0;
        } else if (categoryFilter) {
          const match = ((d as any).categoryBreakdown || []).find((c: any) => (c.category || c.subject) === categoryFilter);
          itemScore = match ? match.score : 0;
        } else if (subjectFilter) {
          const match = (d.subjectBreakdown || []).find((s: any) => s.subject === subjectFilter);
          itemScore = match ? match.score : 0;
        }

        return {
          studyDayKey: d.studyDayKey,
          overallScore: itemScore,
          habitScore: d.habitScore,
          taskScore: d.taskScore,
          revisionScore: d.revisionScore
        };
      });

      return NextResponse.json({
        range: 'month',
        monthKey,
        monthName: getMonthName(monthKey),
        overallScore,
        habitScore,
        taskScore,
        revisionScore,
        grade: getGradeLabel(overallScore),
        trend,
        habits,
        categories,
        subjects,
        calculatedAt: currentMonthDoc.calculatedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    // 2. ALL-TIME RANGE
    const currentAllTimeDoc = allTimeDoc || {
      overallScore: 0,
      habitScore: 0,
      taskScore: 0,
      revisionScore: 0,
      habitBreakdown: [],
      categoryBreakdown: [],
      subjectBreakdown: [],
      calculatedAt: ''
    };

    const monthlyDocs = await MonthlySnapshot.find({ userId: effectiveUserId }).sort({ monthKey: 1 });

    const habits = currentAllTimeDoc.habitBreakdown || [];
    const categories = (currentAllTimeDoc as any).categoryBreakdown || [];
    const subjects = currentAllTimeDoc.subjectBreakdown || [];

    const categoryFilter = searchParams.get('category');

    let overallScore = currentAllTimeDoc.overallScore;
    let habitScore = currentAllTimeDoc.habitScore;
    let taskScore = currentAllTimeDoc.taskScore;
    let revisionScore = currentAllTimeDoc.revisionScore;

    if (habitIdFilter) {
      const foundHabit = habits.find((h: any) => h.habitId === habitIdFilter);
      if (foundHabit) {
        overallScore = foundHabit.score;
        habitScore = foundHabit.score;
      }
    } else if (categoryFilter) {
      const foundCat = categories.find((c: any) => (c.category || c.subject) === categoryFilter);
      if (foundCat) {
        overallScore = foundCat.score;
        revisionScore = foundCat.score;
      }
    } else if (subjectFilter) {
      const foundSubj = subjects.find((s: any) => s.subject === subjectFilter);
      if (foundSubj) {
        overallScore = foundSubj.score;
        revisionScore = foundSubj.score;
      }
    }

    const trend = monthlyDocs.map((m) => {
      let itemScore = m.overallScore;
      if (habitIdFilter) {
        const match = (m.habitBreakdown || []).find((h: any) => h.habitId === habitIdFilter);
        itemScore = match ? match.score : 0;
      } else if (categoryFilter) {
        const match = ((m as any).categoryBreakdown || []).find((c: any) => (c.category || c.subject) === categoryFilter);
        itemScore = match ? match.score : 0;
      } else if (subjectFilter) {
        const match = (m.subjectBreakdown || []).find((s: any) => s.subject === subjectFilter);
        itemScore = match ? match.score : 0;
      }

      return {
        studyDayKey: m.monthKey,
        overallScore: itemScore,
        habitScore: m.habitScore,
        taskScore: m.taskScore,
        revisionScore: m.revisionScore
      };
    });

    return NextResponse.json({
      range: 'alltime',
      overallScore: currentAllTimeDoc.overallScore,
      habitScore: currentAllTimeDoc.habitScore,
      taskScore: currentAllTimeDoc.taskScore,
      revisionScore: currentAllTimeDoc.revisionScore,
      grade: getGradeLabel(currentAllTimeDoc.overallScore),
      trend,
      habits,
      categories,
      subjects,
      calculatedAt: currentAllTimeDoc.calculatedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    console.error('Error in consistency API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
