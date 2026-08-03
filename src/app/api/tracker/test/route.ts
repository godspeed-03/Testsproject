import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

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
      takeaway,
    } = body;

    if (action === 'delete') {
      await prisma.testLog.deleteMany({
        where: {
          userId,
          OR: [{ id }, { customId: id }],
        },
      });
    } else {
      const customId = id || 't_' + Date.now();
      const numScore = parseFloat(score) || 0;
      const numMax = parseFloat(maxScore) || 200;
      const pct = percent !== undefined ? percent : Math.round((numScore / numMax) * 100);

      await prisma.testLog.create({
        data: {
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
          takeaway: takeaway || '',
        },
      });
    }

    const testLogs = await prisma.testLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTestLogs = testLogs.map((item) => ({
      id: item.customId || item.id,
      testName: item.testName || item.code || 'Untitled Mock Test',
      code: item.code || item.testName || 'MOCK',
      type: item.type || 'PRELIMS',
      category: item.category || item.subject || 'GS1',
      subject: item.subject || item.category || 'General Studies',
      date: item.date || '',
      score: item.score || 0,
      maxScore: item.maxScore || 200,
      percent: item.percent !== null && item.percent !== undefined ? item.percent : Math.round(((item.score || 0) / (item.maxScore || 200)) * 100),
      correctCount: item.correctCount ?? Math.round((((item.percent || Math.round(((item.score || 0) / (item.maxScore || 200)) * 100)) / 100) * 100) * 0.5),
      incorrectCount: item.incorrectCount ?? Math.round((((100 - (item.percent || Math.round(((item.score || 0) / (item.maxScore || 200)) * 100))) / 100) * 100) * 0.2),
      unattemptedCount: item.unattemptedCount ?? 30,
      negMarks: item.negMarks ?? Math.round((item.incorrectCount || 10) * 0.66),
      accuracy: item.accuracy || `${item.percent || Math.round(((item.score || 0) / (item.maxScore || 200)) * 100)}%`,
      concept: item.concept || 0,
      silly: item.silly || 0,
      timeP: item.timeP || 0,
      weakAreas: Array.isArray(item.weakAreas) ? item.weakAreas : [],
      takeaway: item.takeaway || '',
    }));

    return NextResponse.json({ testLogs: formattedTestLogs });
  } catch (error: any) {
    console.error('Test log mutation error:', error);
    return NextResponse.json({ error: 'Failed to modify test log' }, { status: 500 });
  }
}
