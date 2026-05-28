import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { testId, mode, timingMode } = await req.json();

    if (!testId || !['practice', 'test'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid testId or mode' }, { status: 400 });
    }
    
    let resolvedTimingMode = timingMode;
    if (resolvedTimingMode && !['full', 'per-question'].includes(resolvedTimingMode)) {
      resolvedTimingMode = 'full';
    }

    const test = await Test.findOne({ testId });
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (test.settings?.goLiveDate) {
      const goLiveTime = new Date(test.settings.goLiveDate).getTime();
      const totalTimeMs = (test.totalTime || 0) * 1000;
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const expiryTime = goLiveTime + totalTimeMs + twelveHoursMs;
      
      if (Date.now() > expiryTime) {
        return NextResponse.json({ error: 'This test has expired.' }, { status: 403 });
      }
    }

    const attempt = await Attempt.create({
      userId: user.userId,
      testId: testId,
      mode: mode,
      timingMode: resolvedTimingMode || test.settings?.timingMode || 'full',
      responses: [],
      status: 'in-progress',
      startTime: new Date()
    });

    return NextResponse.json({ 
      message: 'Attempt started', 
      attemptId: attempt._id 
    });
  } catch (error) {
    console.error('Start attempt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
