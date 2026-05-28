import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find all attempts for this user
    const allAttempts = await Attempt.find({ userId: user.userId }).sort({ startTime: -1 }).lean();
    
    // Enrich with test metadata
    const testIds = allAttempts.map(a => a.testId);
    const tests = await Test.find({ testId: { $in: testIds } }, 'testId testName totalQuestions totalTime settings').lean();
    
    const testMap = new Map(tests.map(t => [t.testId, t]));
    
    const now = Date.now();

    const enrichedAttempts = await Promise.all(allAttempts.map(async (attempt: any) => {
      const test = testMap.get(attempt.testId);
      
      // Auto-complete if expired
      if (attempt.status === 'in-progress' && test?.settings?.goLiveDate) {
        const goLiveTime = new Date(test.settings.goLiveDate).getTime();
        const totalTimeMs = (test.totalTime || 0) * 1000;
        const twelveHoursMs = 12 * 60 * 60 * 1000;
        const expiryTime = goLiveTime + totalTimeMs + twelveHoursMs;
        
        if (now > expiryTime) {
          await Attempt.findByIdAndUpdate(attempt._id, { status: 'completed' });
          attempt.status = 'completed';
        }
      }

      return {
        ...attempt,
        testName: test?.testName || 'Unknown Test',
        totalTime: test?.totalTime || 0,
        totalQuestions: test?.totalQuestions || 0
      };
    }));

    return NextResponse.json({ attempts: enrichedAttempts });
  } catch (error) {
    console.error('Ongoing attempts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
