import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ testId: string }> }) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const params = await props.params;
    const { testId } = params;

    const test = await Test.findOne({ testId }).lean();
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const attempts = await Attempt.find({
      userId: user.userId,
      testId: testId,
      status: 'completed'
    }).sort({ startTime: -1 }).lean();

    const questionTopics: Record<string, string> = {};
    test.testJSON?.sections?.forEach((sec: any) => {
      sec.questions?.forEach((q: any) => {
        questionTopics[q.questionId] = q.topic || 'Uncategorized';
      });
    });

    let testCorrect = 0;
    let testAnswered = 0;
    const testTopics: Record<string, { total: number, correct: number }> = {};

    attempts.forEach(attempt => {
      attempt.responses?.forEach((r: any) => {
        if (r.status === 'answered' || r.isCorrect !== undefined) {
          testAnswered++;
          const isCorr = r.isCorrect;
          if (isCorr) testCorrect++;
          
          const topic = questionTopics[r.questionId] || 'Uncategorized';
          if (!testTopics[topic]) {
            testTopics[topic] = { total: 0, correct: 0 };
          }
          testTopics[topic].total++;
          if (isCorr) testTopics[topic].correct++;
        }
      });
    });

    return NextResponse.json({
      testName: test.testName,
      attempts,
      testAccuracy: testAnswered > 0 ? Math.round((testCorrect / testAnswered) * 100) : 0,
      testTopics
    });

  } catch (error) {
    console.error('Fetch test analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
