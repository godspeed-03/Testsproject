import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import DailyLog from '@/models/DailyLog';
import TestLog from '@/models/TestLog';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { syllabusList, dailyLogs, testLogs } = await req.json();

    if (Array.isArray(syllabusList)) {
      await SyllabusItem.deleteMany({ userId: user.userId });
      const syllabusDocs = syllabusList.map((item: any) => ({
        userId: user.userId,
        customId: item.id || 'sub_' + Math.random().toString(36).substring(2, 9),
        subject: item.subject,
        topic: item.topic,
        subtopic: item.subtopic,
        status: item.status || 'Not Started',
        source: item.source || '',
        date: item.date || '',
        nextRev: item.nextRev || ''
      }));
      await SyllabusItem.insertMany(syllabusDocs);
    }

    if (Array.isArray(dailyLogs)) {
      await DailyLog.deleteMany({ userId: user.userId });
      const dailyDocs = dailyLogs.map((l: any) => ({
        userId: user.userId,
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
        weakest: l.weakest || ''
      }));
      await DailyLog.insertMany(dailyDocs);
    }

    if (Array.isArray(testLogs)) {
      await TestLog.deleteMany({ userId: user.userId });
      const testDocs = testLogs.map((t: any) => ({
        userId: user.userId,
        customId: t.id || 't_' + Math.random().toString(36).substring(2, 9),
        code: t.code,
        date: t.date || '',
        subject: t.subject || '',
        score: t.score || '',
        accuracy: t.accuracy || '',
        concept: t.concept || 0,
        silly: t.silly || 0,
        timeP: t.timeP || 0,
        takeaway: t.takeaway || ''
      }));
      await TestLog.insertMany(testDocs);
    }

    const updatedSyllabus = await SyllabusItem.find({ userId: user.userId }).lean();
    const updatedDaily = await DailyLog.find({ userId: user.userId }).sort({ date: -1 }).lean();
    const updatedTest = await TestLog.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      syllabusList: updatedSyllabus.map((i: any) => ({ ...i, id: i.customId })),
      dailyLogs: updatedDaily.map((i: any) => ({ ...i, id: i._id.toString() })),
      testLogs: updatedTest.map((i: any) => ({ ...i, id: i.customId }))
    });
  } catch (error: any) {
    console.error('Import backup error:', error);
    return NextResponse.json({ error: 'Failed to import backup data' }, { status: 500 });
  }
}
