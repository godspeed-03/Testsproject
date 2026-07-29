import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import TestLog from '@/models/TestLog';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { action, id, code, date, subject, score, accuracy, concept, silly, timeP, takeaway } = body;

    if (action === 'delete') {
      await TestLog.deleteOne({ userId: user.userId, customId: id });
    } else {
      const customId = id || 't_' + Date.now();
      await TestLog.create({
        userId: user.userId,
        customId,
        code,
        date: date || '',
        subject: subject || '',
        score: score || '',
        accuracy: accuracy || '',
        concept: concept || 0,
        silly: silly || 0,
        timeP: timeP || 0,
        takeaway: takeaway || ''
      });
    }

    const testLogs = await TestLog.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
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

    return NextResponse.json({ testLogs: formattedTestLogs });
  } catch (error: any) {
    console.error('Test log mutation error:', error);
    return NextResponse.json({ error: 'Failed to modify test log' }, { status: 500 });
  }
}
