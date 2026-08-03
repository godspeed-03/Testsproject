import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';
import { calcOverdueStatus } from '@/lib/topicRevisionEngine';

function deepClean(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClean);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (['_id', '__v', 'userId', 'createdAt', 'updatedAt', 'configPayload'].includes(key)) continue;
    result[key] = deepClean(obj[key]);
  }
  return result;
}

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      habits,
      lists,
      syllabus,
      testLogs,
      topicRevisions,
      dbRuleSets,
      dailySnapshots,
      monthlySnapshots,
      consistencySnapshots,
      allTimeSnapshot,
      routineConfig,
    ] = await Promise.all([
      prisma.habitItem.findMany({ where: { userId } }),
      prisma.checkList.findMany({ where: { userId } }),
      prisma.syllabusItem.findMany({ where: { userId } }),
      prisma.testLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.topicRevision.findMany({ where: { userId } }),
      prisma.syllabusRuleSet.findMany({ where: { userId } }),
      prisma.dailySnapshot.findMany({ where: { userId } }),
      prisma.monthlySnapshot.findMany({ where: { userId } }),
      prisma.consistencySnapshot.findMany({ where: { userId } }),
      prisma.allTimeSnapshot.findUnique({ where: { userId } }),
      prisma.routineConfig.findUnique({ where: { userId } }),
    ]);

    const formattedHabits = habits.map((h) => ({
      ...h,
      id: h.id,
    }));

    const formattedLists = lists.map((l) => ({
      ...l,
      id: l.id,
    }));

    const formattedSyllabus = syllabus.map((item) => ({
      id: item.customId || item.id,
      customId: item.customId || item.id,
      subject: item.subject,
      category: item.category || 'GS1',
      status: item.status || 'Not Started',
      source: item.source || '',
      date: item.date || '',
      nextRev: item.nextRev || '',
      rules: buildDynamicRulesFromLegacy(item, dbRuleSets),
    }));

    const formattedTestLogs = testLogs.map((item) => ({
      id: item.customId || item.id,
      customId: item.customId || item.id,
      testName: item.testName || item.code || 'Untitled Mock Test',
      code: item.code || 'MOCK',
      type: item.type || 'PRELIMS',
      category: item.category || 'GS1',
      date: item.date || '',
      subject: item.subject || 'General Studies',
      score: item.score || 0,
      maxScore: item.maxScore || 200,
      percent: item.percent || 0,
      benchmarkCutoff: item.benchmarkCutoff || 95,
      durationMins: item.durationMins || 120,
      accuracy: item.accuracy || '0%',
      correctCount: item.correctCount || 0,
      incorrectCount: item.incorrectCount || 0,
      unattemptedCount: item.unattemptedCount || 0,
      concept: item.concept || 0,
      silly: item.silly || 0,
      timeP: item.timeP || 0,
      weakAreas: item.weakAreas || [],
      takeaway: item.takeaway || '',
    }));

    const formattedTopicRevisions = topicRevisions.map((t) => {
      const overdueInfo = t.nextScheduledDate ? calcOverdueStatus(t.nextScheduledDate, todayStr) : { isOverdue: false, overdueDays: 0 };
      return {
        id: t.customId || t.id,
        customId: t.customId || t.id,
        subject: t.subject,
        category: t.category,
        topic: t.topic,
        firstReadDate: t.firstReadDate,
        lastRevisedDate: t.lastRevisedDate,
        status: t.status,
        isAugmentedRevision: t.isAugmentedRevision,
        isOverdue: overdueInfo.isOverdue,
        overdueDays: overdueInfo.overdueDays,
        nextScheduledDate: t.nextScheduledDate,
        revisions: t.revisions || [],
      };
    });

    const formattedRuleSets = dbRuleSets.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      rules: r.rules || [],
    }));

    let formattedRoutineConfig = null;
    if (routineConfig) {
      const payload = typeof routineConfig.configPayload === 'object' ? routineConfig.configPayload : routineConfig;
      formattedRoutineConfig = deepClean(payload);
    }

    return NextResponse.json({
      habits: formattedHabits,
      lists: formattedLists,
      topicRevisions: formattedTopicRevisions,
      syllabusList: formattedSyllabus,
      testLogs: formattedTestLogs,
      ruleSets: formattedRuleSets,
      dailySnapshots,
      monthlySnapshots,
      consistencySnapshots,
      allTimeSnapshot,
      routineConfig: formattedRoutineConfig,
      exportedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Export tracker data error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
