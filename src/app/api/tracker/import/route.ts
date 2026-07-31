import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import DailyLog from '@/models/DailyLog';
import TopicRevision from '@/models/TopicRevision';
import TestLog from '@/models/TestLog';

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
    const topicRevisionsInput = data.topicrevisions || data.topicRevisions || [];
    const syllabusInput = data.syllabusitems || data.syllabusList || data.syllabus || [];
    const dailyLogsInput = data.dailylogs || data.dailyLogs || [];
    const testLogsInput = data.testlogs || data.testLogs || [];

    // 1. Process Topic Revisions
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

    // 2. Process Syllabus Items
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

    // 3. Process Daily Logs
    if (Array.isArray(dailyLogsInput) && dailyLogsInput.length > 0) {
      await DailyLog.deleteMany({ $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const docs = dailyLogsInput.map((l: any) => ({
        userId,
        date: l.date,
        isOff: !!l.isOff,
        total: l.total || 0,
        gs: l.gs || 0,
        maths: l.maths || 0,
        ca: l.ca || 0,
        ans: l.ans || 0,
        newH: l.newH || 0,
        revH: l.revH || 0,
        caDone: l.caDone || 'NO',
        ansCount: l.ansCount || 0,
        focus: l.focus || 3,
        weakest: l.weakest || '',
        topicsRead: l.topicsRead || '',
        selectedSubject: l.selectedSubject || '',
        topicRevisionIds: l.topicRevisionIds || [],
        subjectTags: l.subjectTags || [],
        completedRevisions: l.completedRevisions || []
      }));
      await DailyLog.insertMany(docs);
    }

    // Fetch updated dataset
    const updatedSyllabus = await SyllabusItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedDaily = await DailyLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ date: -1 }).lean();
    const updatedRevisions = await TopicRevision.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const updatedTest = await TestLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      syllabusList: updatedSyllabus.map((i: any) => ({ ...i, id: i.customId || i._id.toString() })),
      dailyLogs: updatedDaily.map((i: any) => ({ ...i, id: i._id.toString() })),
      topicRevisions: updatedRevisions.map((i: any) => ({ ...i, id: i.customId || i._id.toString() })),
      testLogs: updatedTest.map((i: any) => ({ ...i, id: i.customId || i._id.toString() }))
    });
  } catch (error: any) {
    console.error('Import JSON database error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import JSON data' }, { status: 500 });
  }
}
