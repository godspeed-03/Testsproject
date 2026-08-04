import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';
import { calcOverdueStatus } from '@/lib/topicRevisionEngine';
import {
  getMonthKey,
  getMonthName,
  getEffectiveUserId,
  runFullConsistencyPipeline,
} from '@/lib/consistencyEngineV3';
import { calculateAndSaveWeeklyData } from '@/lib/weeklyAnalyticsEngine';
import { computeConsistencyBreakdown } from '@/lib/consistencyBreakdown';

function getGradeLabel(score: number): string {
  if (score >= 90) return 'S-TIER CONSISTENT';
  if (score >= 75) return 'A-TIER CONSISTENT';
  if (score >= 60) return 'B-TIER STABLE';
  return 'NEEDS FOCUS';
}

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = await getEffectiveUserId(user.userId);
    const todayStr = new Date().toISOString().split('T')[0];
    const monthKey = getMonthKey();

    const [
      userRecord,
      habits,
      lists,
      syllabus,
      testLogs,
      topicRevisions,
      dbRuleSets,
      dailySnapshots,
      monthlySnapshots,
      allTimeSnapshot,
      pipelineRes,
      weeklyDoc,
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.habitItem.findMany({ where: { userId } }),
      prisma.checkList.findMany({ where: { userId } }),
      prisma.syllabusItem.findMany({ where: { userId } }),
      prisma.testLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.topicRevision.findMany({ where: { userId } }),
      prisma.syllabusRuleSet.findMany({ where: { userId } }),
      prisma.dailySnapshot.findMany({ where: { userId }, orderBy: { studyDayKey: 'asc' } }),
      prisma.monthlySnapshot.findMany({ where: { userId }, orderBy: { monthKey: 'asc' } }),
      prisma.allTimeSnapshot.findUnique({ where: { userId } }),
      runFullConsistencyPipeline(userId),
      calculateAndSaveWeeklyData(userId),
    ]);

    const { habitsList, subjectsList, categoriesList } = await computeConsistencyBreakdown(userId);

    // ---- Habits (daily agenda) ----
    const todosAndHabits = habits.map((h) => ({
      id: h.id,
      type: h.type,
      title: h.title,
      category: h.category,
      frequency: h.frequency,
      target: h.target,
      startDate: h.startDate,
      endDate: h.endDate,
      isStudyTask: h.isStudyTask,
      subject: h.subject,
      streakCurrent: h.streakCurrent,
      streakBest: h.streakBest,
      historyCount: Array.isArray(h.history) ? h.history.length : 0,
    }));

    // ---- Syllabus matrix ----
    const syllabusMatrix = syllabus.map((item) => ({
      subject: item.subject,
      category: item.category || 'GS1',
      status: item.status || 'Not Started',
      source: item.source || '',
      date: item.date || '',
      nextRev: item.nextRev || '',
      rules: buildDynamicRulesFromLegacy(item, dbRuleSets),
    }));

    // ---- Test logs ----
    const formattedTestLogs = testLogs.map((item) => ({
      testName: item.testName || item.code || 'Untitled Mock Test',
      type: item.type || 'PRELIMS',
      category: item.category || 'GS1',
      date: item.date || '',
      subject: item.subject || 'General Studies',
      score: item.score || 0,
      maxScore: item.maxScore || 200,
      percent: item.percent || 0,
      accuracy: item.accuracy || '0%',
      takeaway: item.takeaway || '',
    }));

    // ---- Topic revisions ----
    const formattedTopicRevisions = topicRevisions.map((t) => {
      const overdueInfo = t.nextScheduledDate ? calcOverdueStatus(t.nextScheduledDate, todayStr) : { isOverdue: false, overdueDays: 0 };
      return {
        subject: t.subject,
        category: t.category,
        topic: t.topic,
        status: t.status,
        isOverdue: overdueInfo.isOverdue,
        overdueDays: overdueInfo.overdueDays,
        nextScheduledDate: t.nextScheduledDate,
      };
    });

    // ---- Consistency (per-habit / per-subject / per-category scores) ----
    const consistencyMonthly = {
      monthKey,
      monthName: getMonthName(monthKey),
      overallScore: pipelineRes?.monthly?.avgConsistencyScore || 0,
      grade: getGradeLabel(pipelineRes?.monthly?.avgConsistencyScore || 0),
      habits: habitsList,
      subjects: subjectsList,
      categories: categoriesList,
    };

    const consistencyAllTime = {
      overallScore: allTimeSnapshot?.overallConsistencyScore || 0,
      grade: getGradeLabel(allTimeSnapshot?.overallConsistencyScore || 0),
      totalStudyHours: allTimeSnapshot?.totalStudyHours || 0,
      totalDaysLogged: allTimeSnapshot?.totalDaysLogged || 0,
      bestStreakDays: allTimeSnapshot?.bestStreakDays || 0,
      currentStreakDays: allTimeSnapshot?.currentStreakDays || 0,
      categoryBreakdown: allTimeSnapshot?.categoryBreakdown || {},
      subjectBreakdown: allTimeSnapshot?.subjectBreakdown || {},
    };

    // ---- Weekly analytics ----
    const weeklyBreakdown = (weeklyDoc?.breakdown as any) || {};
    const weeklyAnalytics = {
      weekKey: weeklyDoc?.weekKey || '',
      totalHours: weeklyDoc?.totalHours || 0,
      weeklyScore: weeklyDoc?.weeklyScore || 0,
      completedHabitsCount: weeklyDoc?.completedHabitsCount || 0,
      completedTopicsCount: weeklyDoc?.completedTopicsCount || 0,
      ...weeklyBreakdown,
    };

    return NextResponse.json({
      user: {
        name: userRecord?.name || '',
        email: userRecord?.email || '',
      },
      generatedAt: new Date().toISOString(),
      todosAndHabits,
      lists,
      syllabusMatrix,
      topicRevisions: formattedTopicRevisions,
      testLogs: formattedTestLogs,
      dailySnapshots,
      monthlySnapshots,
      consistencyMonthly,
      consistencyAllTime,
      weeklyAnalytics,
    });
  } catch (error: any) {
    console.error('Generate tracker report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
