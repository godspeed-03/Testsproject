import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import SyllabusRuleSet from '@/models/SyllabusRuleSet';
import TestLog from '@/models/TestLog';
import TopicRevision from '@/models/TopicRevision';
import HabitItem from '@/models/HabitItem';
import CheckList from '@/models/CheckList';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';
import { calcOverdueStatus } from '@/lib/topicRevisionEngine';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    const todayStr = new Date().toISOString().split('T')[0];
    const userFilter = { $or: [{ userId }, { userId: '000000000000000000000000' }] };
    const habits = await HabitItem.find(userFilter).lean();
    const lists = await CheckList.find(userFilter).lean();
    const syllabus = await SyllabusItem.find(userFilter).lean();
    const testLogs = await TestLog.find(userFilter).sort({ createdAt: -1 }).lean();
    const topicRevisions = await TopicRevision.find(userFilter).lean();
    const dbRuleSets = await SyllabusRuleSet.find(userFilter).lean();

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
      code: item.code,
      date: item.date,
      subject: item.subject,
      score: item.score,
      accuracy: item.accuracy,
      concept: item.concept,
      silly: item.silly,
      timeP: item.timeP,
      takeaway: item.takeaway
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

    return NextResponse.json({
      habits: formattedHabits,
      lists: formattedLists,
      topicRevisions: formattedTopicRevisions,
      syllabusList: formattedSyllabus,
      testLogs: formattedTestLogs,
      exportedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Export tracker data error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
