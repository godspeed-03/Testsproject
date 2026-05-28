import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const attempt = await Attempt.findById(attemptId).lean();
    if (!attempt || attempt.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    const test = await Test.findOne({ testId: attempt.testId }).lean();
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Check expiry
    if (test.settings?.goLiveDate && attempt.status === 'in-progress') {
      const goLiveTime = new Date(test.settings.goLiveDate).getTime();
      const totalTimeMs = (test.totalTime || 0) * 1000;
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const expiryTime = goLiveTime + totalTimeMs + twelveHoursMs;
      
      if (Date.now() > expiryTime) {
        // Auto-complete the attempt if it expired while in-progress
        await Attempt.findByIdAndUpdate(attemptId, { status: 'completed' });
        attempt.status = 'completed';
      }
    }

    const isPracticeMode = attempt.mode === 'practice';
    const answeredQuestionIds = new Set(
      attempt.responses?.filter((r: any) => r.status === 'answered' || r.isCorrect !== undefined).map((r: any) => r.questionId) || []
    );

    // Strip answers from the test JSON for security
    const sanitizedJSON = JSON.parse(JSON.stringify(test.testJSON));
    sanitizedJSON.sections.forEach((section: any) => {
      section.questions.forEach((q: any) => {
        if (!isPracticeMode || !answeredQuestionIds.has(q.questionId)) {
          delete q.correctAnswer;
          delete q.explanation;
          delete q.correctMatches;
        }
      });
    });

    test.testJSON = sanitizedJSON;

    return NextResponse.json({ attempt, test });
  } catch (error) {
    console.error('Fetch attempt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
