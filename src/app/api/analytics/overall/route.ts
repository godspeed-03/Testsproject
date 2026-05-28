import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const attempts = await Attempt.find({
      userId: user.userId,
      status: 'completed'
    }).lean();

    // Group by testId
    const testMap: Record<string, {
      testId: string;
      testName: string;
      totalAttempts: number;
      practiceAttempts: number;
      testAttempts: number;
      highestScore: number;
      totalTimeSpent: number;
    }> = {};

    // Get all test IDs
    const testIds = [...new Set(attempts.map(a => a.testId))];
    const tests = await Test.find({ testId: { $in: testIds } }).lean();
    const testNames: Record<string, string> = {};
    const questionTopics: Record<string, Record<string, string>> = {}; // testId -> questionId -> topic
    
    tests.forEach((t: any) => {
      testNames[t.testId] = t.testName;
      questionTopics[t.testId] = {};
      t.testJSON?.sections?.forEach((sec: any) => {
        sec.questions?.forEach((q: any) => {
          questionTopics[t.testId][q.questionId] = q.topic || 'Uncategorized';
        });
      });
    });

    let globalCorrect = 0;
    let globalAnswered = 0;
    const globalTopics: Record<string, { total: number, correct: number }> = {};

    attempts.forEach(attempt => {
      const tId = attempt.testId;
      if (!testMap[tId]) {
        testMap[tId] = {
          testId: tId,
          testName: testNames[tId] || 'Unknown Test',
          totalAttempts: 0,
          practiceAttempts: 0,
          testAttempts: 0,
          highestScore: 0,
          totalTimeSpent: 0
        };
      }

      testMap[tId].totalAttempts++;
      if (attempt.mode === 'practice') {
        testMap[tId].practiceAttempts++;
      } else {
        testMap[tId].testAttempts++;
      }

      if (attempt.score && attempt.score > testMap[tId].highestScore) {
        testMap[tId].highestScore = attempt.score;
      }

      const timeSpent = attempt.responses?.reduce((acc: number, r: any) => acc + (r.timeTaken || 0), 0) || 0;
      testMap[tId].totalTimeSpent += timeSpent;

      // Accuracy and Topics
      attempt.responses?.forEach((r: any) => {
        if (r.status === 'answered' || r.isCorrect !== undefined) {
          globalAnswered++;
          const isCorr = r.isCorrect;
          if (isCorr) globalCorrect++;
          
          const topic = questionTopics[tId]?.[r.questionId] || 'Uncategorized';
          if (!globalTopics[topic]) {
            globalTopics[topic] = { total: 0, correct: 0 };
          }
          globalTopics[topic].total++;
          if (isCorr) globalTopics[topic].correct++;
        }
      });
    });

    const overallStats = {
      totalTestsTaken: Object.keys(testMap).length,
      totalAttempts: attempts.length,
      totalTimeSpent: Object.values(testMap).reduce((acc, t) => acc + t.totalTimeSpent, 0),
      globalAccuracy: globalAnswered > 0 ? Math.round((globalCorrect / globalAnswered) * 100) : 0,
      globalTopics
    };

    return NextResponse.json({
      overallStats,
      tests: Object.values(testMap)
    });

  } catch (error) {
    console.error('Fetch overall analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
