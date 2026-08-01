import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import TopicRevision from '@/models/TopicRevision';
import TestLog from '@/models/TestLog';
import HabitItem from '@/models/HabitItem';
import CheckList from '@/models/CheckList';

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
        r1ScheduledDate: t.r1ScheduledDate || '',
        r1CompletedDate: t.r1CompletedDate || '',
        r1Status: t.r1Status || 'Pending',
        r2ScheduledDate: t.r2ScheduledDate || '',
        r2CompletedDate: t.r2CompletedDate || '',
        r2Status: t.r2Status || 'Pending',
        r3ScheduledDate: t.r3ScheduledDate || '',
        r3CompletedDate: t.r3CompletedDate || '',
        r3Status: t.r3Status || 'Pending',
        isOverdue: !!t.isOverdue,
        overdueDays: t.overdueDays || 0,
        nextScheduledDate: t.nextScheduledDate || '',
        isCluster: !!t.isCluster,
        subTopics: t.subTopics || [],
        extraRevisions: t.extraRevisions || [],
        revisionLogs: t.revisionLogs || []
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
        firstRead: !!item.firstRead,
        rev1: !!item.rev1,
        rev2: !!item.rev2,
        preNotes: !!item.preNotes,
        mainsNotes: !!item.mainsNotes,
        questionBank: !!item.questionBank,
        prePyq: !!item.prePyq,
        mainsPyq: !!item.mainsPyq,
        ansWriting: !!item.ansWriting,
        preFinalRev: !!item.preFinalRev,
        mainsFinalRev: !!item.mainsFinalRev,
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

    // Fetch updated dataset
    const updatedHabits = await HabitItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedLists = await CheckList.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedSyllabus = await SyllabusItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedTestLogs = await TestLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ createdAt: -1 }).lean();
    const updatedTopicRevisions = await TopicRevision.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();

    return NextResponse.json({
      message: 'Data imported successfully!',
      habits: updatedHabits,
      lists: updatedLists,
      syllabusList: updatedSyllabus,
      testLogs: updatedTestLogs,
      topicRevisions: updatedTopicRevisions
    });
  } catch (error: any) {
    console.error('Import data error:', error);
    return NextResponse.json({ error: 'Failed to import JSON data' }, { status: 500 });
  }
}
