import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Users only need minimal info to display available tests, filter out drafts and future scheduled tests
    const tests = await Test.find(
      { 
        'settings.isLive': { $ne: false },
        $or: [
          { 'settings.goLiveDate': { $exists: false } },
          { 'settings.goLiveDate': null },
          { 'settings.goLiveDate': { $lte: new Date() } }
        ]
      }, 
      'testId testName totalQuestions totalTime createdAt settings'
    ).sort({ createdAt: -1 }).lean();

    const now = Date.now();
    const filteredTests = tests.filter((test: any) => {
      if (!test.settings?.goLiveDate) return true; // Drafts are filtered by query, if it has no goLive but isLive=true, we assume it's always available
      
      const goLiveTime = new Date(test.settings.goLiveDate).getTime();
      const totalTimeMs = (test.totalTime || 0) * 1000;
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const expiryTime = goLiveTime + totalTimeMs + twelveHoursMs;
      
      return now <= expiryTime;
    });

    return NextResponse.json({ tests: filteredTests });
  } catch (error) {
    console.error('List available tests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
