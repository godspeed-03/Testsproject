import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import DailyLog from '@/models/DailyLog';
import TestLog from '@/models/TestLog';
import WeeklyTarget from '@/models/WeeklyTarget';
import TopicRevision from '@/models/TopicRevision';
import { calcOverdueStatus } from '@/lib/topicRevisionEngine';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    const todayStr = new Date().toISOString().split('T')[0];
    const syllabus = await SyllabusItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
    const dailyLogs = await DailyLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ date: -1 }).lean();
    const testLogs = await TestLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ createdAt: -1 }).lean();
    const weeklyDoc = await WeeklyTarget.findOne({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ createdAt: -1 }).lean();
    const topicRevisions = await TopicRevision.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();

    // Format for frontend
    const formattedSyllabus = syllabus.map((item: any) => ({
      id: item.customId || item._id.toString(),
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
      mainsFinalRev: !!item.mainsFinalRev
    }));

    const formattedDailyLogs = dailyLogs.map((item: any) => {
      let resolvedTags: any[] = [];
      if (item.topicRevisionIds && Array.isArray(item.topicRevisionIds) && item.topicRevisionIds.length > 0) {
        resolvedTags = item.topicRevisionIds
          .map((trId: any) => {
            const strId = trId.toString();
            const tr = topicRevisions.find((t: any) => t._id.toString() === strId || t.customId === strId);
            if (tr) {
              return {
                id: tr._id.toString(),
                subject: tr.subject,
                category: tr.category,
                topic: tr.topic,
                isRevision: tr.firstReadDate !== item.date
              };
            }
            return null;
          })
          .filter(Boolean);
      }
      if (resolvedTags.length === 0 && item.subjectTags && Array.isArray(item.subjectTags)) {
        resolvedTags = item.subjectTags;
      }

      return {
        id: item._id.toString(),
        date: item.date,
        isOff: item.isOff,
        total: item.total,
        gs: item.gs,
        maths: item.maths,
        ca: item.ca,
        ans: item.ans,
        newH: item.newH,
        revH: item.revH,
        caDone: item.caDone,
        ansCount: item.ansCount,
        focus: item.focus,
        weakest: item.weakest,
        topicsRead: item.topicsRead || '',
        selectedSubject: item.selectedSubject || '',
        topicRevisionIds: (item.topicRevisionIds || []).map((id: any) => id.toString()),
        subjectTags: resolvedTags,
        completedRevisions: item.completedRevisions || []
      };
    });

    const formattedTestLogs = testLogs.map((item: any) => ({
      id: item.customId || item._id.toString(),
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
        subject: t.subject,
        category: t.category,
        topic: t.topic,
        firstReadDate: t.firstReadDate,
        lastRevisedDate: t.lastRevisedDate,
        status: t.status,
        r1ScheduledDate: t.r1ScheduledDate,
        r1CompletedDate: t.r1CompletedDate,
        r1Status: t.r1Status,
        r2ScheduledDate: t.r2ScheduledDate,
        r2CompletedDate: t.r2CompletedDate,
        r2Status: t.r2Status,
        r3ScheduledDate: t.r3ScheduledDate,
        r3CompletedDate: t.r3CompletedDate,
        r3Status: t.r3Status,
        isOverdue: overdueInfo.isOverdue,
        overdueDays: overdueInfo.overdueDays,
        nextScheduledDate: t.nextScheduledDate,
        subTopics: t.subTopics || [],
        extraRevisions: t.extraRevisions || [],
        revisionLogs: t.revisionLogs || []
      };
    });

    return NextResponse.json({
      syllabusList: formattedSyllabus,
      dailyLogs: formattedDailyLogs,
      testLogs: formattedTestLogs,
      weeklyTargetsList: weeklyDoc?.targets || null,
      savedTargetWeek: weeklyDoc?.startOfWeek || null,
      topicRevisions: formattedTopicRevisions
    });
  } catch (error: any) {
    console.error('Fetch tracker data error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Wipe all user records in MongoDB for a completely blank sheet!
    await SyllabusItem.deleteMany({ userId: user.userId });
    await DailyLog.deleteMany({ userId: user.userId });
    await TestLog.deleteMany({ userId: user.userId });
    await WeeklyTarget.deleteMany({ userId: user.userId });
    await TopicRevision.deleteMany({ userId: user.userId });

    // Also wipe all records in general if unauthenticated/global
    await SyllabusItem.deleteMany({});
    await DailyLog.deleteMany({});
    await TestLog.deleteMany({});
    await WeeklyTarget.deleteMany({});
    await TopicRevision.deleteMany({});

    return NextResponse.json({
      message: 'All dummy data wiped successfully. Blank sheet initialized!',
      syllabusList: [],
      dailyLogs: [],
      testLogs: [],
      weeklyTargetsList: [],
      topicRevisions: []
    });
  } catch (error: any) {
    console.error('Wipe data error:', error);
    return NextResponse.json({ error: 'Failed to wipe data' }, { status: 500 });
  }
}
