import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import SyllabusRuleSet from '@/models/SyllabusRuleSet';
import TopicRevision from '@/models/TopicRevision';
import TestLog from '@/models/TestLog';
import HabitItem from '@/models/HabitItem';
import CheckList from '@/models/CheckList';
import DailySnapshot from '@/models/DailySnapshot';
import MonthlySnapshot from '@/models/MonthlySnapshot';
import ConsistencySnapshot from '@/models/ConsistencySnapshot';
import AllTimeSnapshot from '@/models/AllTimeSnapshot';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';

function sanitizeBson(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeBson);
  
  if (obj.$oid) return obj.$oid;
  if (obj.$date) return new Date(obj.$date);

  const clean: any = {};
  for (const key of Object.keys(obj)) {
    clean[key] = sanitizeBson(obj[key]);
  }
  return clean;
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();
    const rawData = await req.json();
    const data = sanitizeBson(rawData);

    // Flexible collection matching (handles mongo export names and app export names)
    const habitsInput = data.habits || data.habitItems || [];
    const listsInput = data.lists || data.checkLists || [];
    const topicRevisionsInput = data.topicrevisions || data.topicRevisions || [];
    const syllabusInput = data.syllabusitems || data.syllabusList || data.syllabus || [];
    const testLogsInput = data.testlogs || data.testLogs || [];
    const ruleSetsInput = data.rulesets || data.ruleSets || data.syllabusRuleSets || [];
    const dailySnapshotsInput = data.dailysnapshots || data.dailySnapshots || [];
    const monthlySnapshotsInput = data.monthlysnapshots || data.monthlySnapshots || [];
    const consistencySnapshotsInput = data.consistencysnapshots || data.consistencySnapshots || [];
    const allTimeSnapshotInput = data.alltimesnapshot || data.allTimeSnapshot || null;

    // 1. Process Habits & Agenda Items
    if (Array.isArray(habitsInput) && habitsInput.length > 0) {
      await HabitItem.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = habitsInput.map((h: any) => ({
        userId,
        type: h.type || 'habit',
        title: h.title || 'Untitled',
        category: h.category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' },
        description: h.description || '',
        priority: h.priority || 'medium',
        frequency: h.frequency || { mode: 'daily', days: [] },
        target: h.target || { value: 1, unit: 'times' },
        reminders: h.reminders || [{ time: '08:00', enabled: true }],
        startDate: h.startDate || new Date().toISOString().split('T')[0],
        endDate: h.endDate || null,
        isStudyTask: !!h.isStudyTask,
        isAugmentedRevision: h.isAugmentedRevision !== undefined ? !!h.isAugmentedRevision : true,
        subject: h.subject || '',
        topic: h.topic || '',
        color: h.color || '#6366F1',
        icon: h.icon || '🏃',
        streakCurrent: h.streakCurrent || 0,
        streakBest: h.streakBest || 0,
        history: h.history || []
      }));
      await HabitItem.insertMany(docs);
    }

    // 2. Process Checklists
    if (Array.isArray(listsInput) && listsInput.length > 0) {
      await CheckList.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = listsInput.map((l: any) => ({
        userId,
        title: l.title || 'Untitled List',
        color: l.color || '#6366F1',
        items: l.items || []
      }));
      await CheckList.insertMany(docs);
    }

    // 3. Process Topic Revisions
    if (Array.isArray(topicRevisionsInput) && topicRevisionsInput.length > 0) {
      await TopicRevision.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = topicRevisionsInput.map((t: any) => ({
        userId,
        customId: t.customId || t.id || 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        subject: t.subject || 'General Studies',
        category: t.category || 'GS1',
        topic: t.topic || 'General Topic',
        firstReadDate: t.firstReadDate || t.date || '',
        lastRevisedDate: t.lastRevisedDate || '',
        isAugmentedRevision: t.isAugmentedRevision !== undefined ? t.isAugmentedRevision : true,
        isOverdue: !!t.isOverdue,
        overdueDays: t.overdueDays || 0,
        nextScheduledDate: t.nextScheduledDate || '',
        revisions: t.revisions || []
      }));
      await TopicRevision.insertMany(docs);
    }

    // 4. Process Syllabus Items
    if (Array.isArray(syllabusInput) && syllabusInput.length > 0) {
      await SyllabusItem.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = syllabusInput.map((item: any) => ({
        userId,
        customId: item.customId || item.id || 'subj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        subject: item.subject,
        category: item.category || 'GS1',
        status: item.status || 'Not Started',
        source: item.source || '',
        date: item.date || '',
        nextRev: item.nextRev || '',
        rules: item.rules || buildDynamicRulesFromLegacy(item),
        topicRevisionIds: item.topicRevisionIds || []
      }));
      await SyllabusItem.insertMany(docs);
    }

    // 5. Process Test Logs
    if (Array.isArray(testLogsInput) && testLogsInput.length > 0) {
      await TestLog.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = testLogsInput.map((t: any) => ({
        userId,
        customId: t.customId || t.id || 'test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        code: t.code || 'TEST-01',
        date: t.date || '',
        subject: t.subject || 'General Studies',
        score: t.score || 0,
        accuracy: t.accuracy || 0,
        concept: t.concept || 0,
        silly: t.silly || 0,
        timeP: t.timeP || 0,
        takeaway: t.takeaway || ''
      }));
      await TestLog.insertMany(docs);
    }

    // 6. Process Syllabus Rule Sets
    if (Array.isArray(ruleSetsInput) && ruleSetsInput.length > 0) {
      await SyllabusRuleSet.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = ruleSetsInput.map((r: any) => ({
        userId,
        name: r.name || 'Custom Rule Set',
        category: r.category || 'General',
        rules: r.rules || []
      }));
      await SyllabusRuleSet.insertMany(docs);
    }

    // 7. Process Daily Snapshots
    if (Array.isArray(dailySnapshotsInput) && dailySnapshotsInput.length > 0) {
      await DailySnapshot.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = dailySnapshotsInput.map((d: any) => ({
        userId,
        studyDayKey: d.studyDayKey,
        monthKey: d.monthKey,
        monthName: d.monthName,
        habitScore: d.habitScore || 0,
        taskScore: d.taskScore || 0,
        revisionScore: d.revisionScore || 0,
        overallScore: d.overallScore || 0,
        habitBreakdown: d.habitBreakdown || [],
        categoryBreakdown: d.categoryBreakdown || [],
        subjectBreakdown: d.subjectBreakdown || [],
        calculatedAt: d.calculatedAt || new Date().toISOString()
      }));
      await DailySnapshot.insertMany(docs);
    }

    // 8. Process Monthly Snapshots
    if (Array.isArray(monthlySnapshotsInput) && monthlySnapshotsInput.length > 0) {
      await MonthlySnapshot.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = monthlySnapshotsInput.map((m: any) => ({
        userId,
        monthKey: m.monthKey,
        monthName: m.monthName,
        overallScore: m.overallScore || 0,
        habitScore: m.habitScore || 0,
        taskScore: m.taskScore || 0,
        revisionScore: m.revisionScore || 0,
        daysWithData: m.daysWithData || 0,
        habitBreakdown: m.habitBreakdown || [],
        categoryBreakdown: m.categoryBreakdown || [],
        subjectBreakdown: m.subjectBreakdown || [],
        calculatedAt: m.calculatedAt || new Date().toISOString()
      }));
      await MonthlySnapshot.insertMany(docs);
    }

    // 9. Process Consistency Snapshots
    if (Array.isArray(consistencySnapshotsInput) && consistencySnapshotsInput.length > 0) {
      await ConsistencySnapshot.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = consistencySnapshotsInput.map((c: any) => ({
        userId,
        studyDayKey: c.studyDayKey,
        monthKey: c.monthKey,
        monthName: c.monthName,
        overallScore: c.overallScore || 0,
        tillDateScore: c.tillDateScore || 100,
        habitScore: c.habitScore || 0,
        taskScore: c.taskScore || 0,
        revisionScore: c.revisionScore || 0,
        totalDone: c.totalDone || 0,
        habitBreakdown: c.habitBreakdown || [],
        categoryBreakdown: c.categoryBreakdown || [],
        calculatedAt: c.calculatedAt || new Date().toISOString()
      }));
      await ConsistencySnapshot.insertMany(docs);
    }

    // 10. Process All-Time Snapshot
    if (allTimeSnapshotInput) {
      await AllTimeSnapshot.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      await AllTimeSnapshot.create({
        userId,
        overallScore: allTimeSnapshotInput.overallScore || 0,
        habitScore: allTimeSnapshotInput.habitScore || 0,
        taskScore: allTimeSnapshotInput.taskScore || 0,
        revisionScore: allTimeSnapshotInput.revisionScore || 0,
        totalDaysRecorded: allTimeSnapshotInput.totalDaysRecorded || 0,
        habitBreakdown: allTimeSnapshotInput.habitBreakdown || [],
        categoryBreakdown: allTimeSnapshotInput.categoryBreakdown || [],
        subjectBreakdown: allTimeSnapshotInput.subjectBreakdown || [],
        calculatedAt: allTimeSnapshotInput.calculatedAt || new Date().toISOString()
      });
    }

    // Fetch updated dataset
    const updatedHabits = await HabitItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedLists = await CheckList.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedSyllabus = await SyllabusItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedTestLogs = await TestLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ createdAt: -1 }).lean();
    const updatedTopicRevisions = await TopicRevision.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedRuleSets = await SyllabusRuleSet.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();

    return NextResponse.json({
      message: 'Data imported successfully across all 10 models!',
      habits: updatedHabits,
      lists: updatedLists,
      syllabusList: updatedSyllabus,
      testLogs: updatedTestLogs,
      topicRevisions: updatedTopicRevisions,
      ruleSets: updatedRuleSets
    });
  } catch (error: any) {
    console.error('Import data error:', error);
    return NextResponse.json({ error: 'Failed to import JSON data' }, { status: 500 });
  }
}
