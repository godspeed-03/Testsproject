import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import SyllabusRuleSet from '@/models/SyllabusRuleSet';
import TestLog from '@/models/TestLog';
import TopicRevision from '@/models/TopicRevision';
import HabitItem from '@/models/HabitItem';
import CheckList from '@/models/CheckList';
import DailySnapshot from '@/models/DailySnapshot';
import MonthlySnapshot from '@/models/MonthlySnapshot';
import ConsistencySnapshot from '@/models/ConsistencySnapshot';
import AllTimeSnapshot from '@/models/AllTimeSnapshot';
import RoutineConfig from '@/models/RoutineConfig';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';
import { calcOverdueStatus } from '@/lib/topicRevisionEngine';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    const todayStr = new Date().toISOString().split('T')[0];
    const userFilter = { $or: [{ userId }, { userId: '000000000000000000000000' }] };

    // Fetch all 11 data models
    const habits = await HabitItem.find(userFilter).lean();
    const lists = await CheckList.find(userFilter).lean();
    const syllabus = await SyllabusItem.find(userFilter).lean();
    const testLogs = await TestLog.find(userFilter).sort({ createdAt: -1 }).lean();
    const topicRevisions = await TopicRevision.find(userFilter).lean();
    const dbRuleSets = await SyllabusRuleSet.find(userFilter).lean();
    const dailySnapshots = await DailySnapshot.find(userFilter).lean();
    const monthlySnapshots = await MonthlySnapshot.find(userFilter).lean();
    const consistencySnapshots = await ConsistencySnapshot.find(userFilter).lean();
    const allTimeSnapshot = await AllTimeSnapshot.findOne(userFilter).lean();
    const routineConfig = await RoutineConfig.findOne(userFilter).lean();

    const formattedHabits = habits.map((h: any) => ({
      ...h,
      id: h.customId || h._id.toString(),
      _id: undefined
    }));

    const formattedLists = lists.map((l: any) => ({
      ...l,
      id: l._id.toString(),
      _id: undefined
    }));

    const formattedSyllabus = syllabus.map((item: any) => ({
      id: item.customId || item._id.toString(),
      customId: item.customId || item._id.toString(),
      subject: item.subject,
      category: item.category || 'GS1',
      status: item.status || 'Not Started',
      source: item.source || '',
      date: item.date || '',
      nextRev: item.nextRev || '',
      rules: buildDynamicRulesFromLegacy(item, dbRuleSets)
    }));

    const formattedTestLogs = testLogs.map((item: any) => ({
      id: item.customId || item._id.toString(),
      customId: item.customId || item._id.toString(),
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
      takeaway: item.takeaway || ''
    }));

    const formattedTopicRevisions = topicRevisions.map((t: any) => {
      const overdueInfo = t.nextScheduledDate ? calcOverdueStatus(t.nextScheduledDate, todayStr) : { isOverdue: false, overdueDays: 0 };
      return {
        id: t.customId || t._id.toString(),
        customId: t.customId || t._id.toString(),
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
        revisions: t.revisions || []
      };
    });

    const formattedRuleSets = dbRuleSets.map((r: any) => ({
      id: r._id.toString(),
      name: r.name,
      category: r.category,
      rules: r.rules || []
    }));

    const formattedDailySnapshots = dailySnapshots.map((d: any) => ({
      ...d,
      _id: undefined
    }));

    const formattedMonthlySnapshots = monthlySnapshots.map((m: any) => ({
      ...m,
      _id: undefined
    }));

    const formattedConsistencySnapshots = consistencySnapshots.map((c: any) => ({
      ...c,
      _id: undefined
    }));

    const formattedAllTimeSnapshot = allTimeSnapshot ? {
      ...allTimeSnapshot,
      _id: undefined
    } : null;

    const formattedRoutineConfig = routineConfig ? {
      ...routineConfig,
      _id: undefined
    } : null;

    return NextResponse.json({
      habits: formattedHabits,
      lists: formattedLists,
      topicRevisions: formattedTopicRevisions,
      syllabusList: formattedSyllabus,
      testLogs: formattedTestLogs,
      ruleSets: formattedRuleSets,
      dailySnapshots: formattedDailySnapshots,
      monthlySnapshots: formattedMonthlySnapshots,
      consistencySnapshots: formattedConsistencySnapshots,
      allTimeSnapshot: formattedAllTimeSnapshot,
      routineConfig: formattedRoutineConfig,
      exportedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Export tracker data error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
