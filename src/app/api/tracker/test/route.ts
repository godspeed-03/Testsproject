import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import TestLog from '@/models/TestLog';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();
    const body = await req.json();
    const {
      action,
      id,
      code,
      testName,
      type,
      category,
      date,
      subject,
      score,
      maxScore,
      percent,
      correctCount,
      incorrectCount,
      unattemptedCount,
      durationMins,
      benchmarkCutoff,
      accuracy,
      concept,
      silly,
      timeP,
      weakAreas,
      takeaway
    } = body;

    const userFilter = { $or: [{ userId }, { userId: '000000000000000000000000' }] };

    if (action === 'delete') {
      await TestLog.deleteOne({ ...userFilter, customId: id });
    } else {
      const customId = id || 't_' + Date.now();
      const numScore = parseFloat(score) || 0;
      const numMax = parseFloat(maxScore) || 200;
      const pct = percent !== undefined ? percent : Math.round((numScore / numMax) * 100);

      await TestLog.create({
        userId,
        customId,
        testName: testName || code || 'Untitled Mock Test',
        code: code || testName || 'MOCK',
        type: type || 'PRELIMS',
        category: category || subject || 'GS1',
        subject: subject || category || 'General Studies',
        date: date || new Date().toISOString().split('T')[0],
        score: numScore,
        maxScore: numMax,
        percent: pct,
        correctCount: correctCount || 0,
        incorrectCount: incorrectCount || 0,
        unattemptedCount: unattemptedCount || 0,
        durationMins: durationMins || 120,
        benchmarkCutoff: benchmarkCutoff || 100,
        accuracy: accuracy || '',
        concept: concept || 0,
        silly: silly || 0,
        timeP: timeP || 0,
        weakAreas: Array.isArray(weakAreas) ? weakAreas : (weakAreas ? weakAreas.split(',').map((s: string) => s.trim()) : []),
        takeaway: takeaway || ''
      });
    }

    const testLogs = await TestLog.find(userFilter).sort({ createdAt: -1 }).lean();
    const formattedTestLogs = testLogs.map((item: any) => ({
      id: item.customId || item._id.toString(),
      testName: item.testName || item.code,
      code: item.code,
      type: item.type || 'PRELIMS',
      category: item.category || 'GS1',
      subject: item.subject,
      date: item.date,
      score: item.score,
      maxScore: item.maxScore || 200,
      percent: item.percent || 0,
      correctCount: item.correctCount || 0,
      incorrectCount: item.incorrectCount || 0,
      unattemptedCount: item.unattemptedCount || 0,
      durationMins: item.durationMins || 120,
      benchmarkCutoff: item.benchmarkCutoff || 100,
      accuracy: item.accuracy,
      concept: item.concept,
      silly: item.silly,
      timeP: item.timeP,
      weakAreas: item.weakAreas || [],
      takeaway: item.takeaway
    }));

    return NextResponse.json({ testLogs: formattedTestLogs });
  } catch (error: any) {
    console.error('Test log mutation error:', error);
    return NextResponse.json({ error: 'Failed to modify test log' }, { status: 500 });
  }
}
