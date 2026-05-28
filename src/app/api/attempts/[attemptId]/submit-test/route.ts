import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status === 'completed') {
      return NextResponse.json({ error: 'Attempt is already completed' }, { status: 400 });
    }

    const test = await Test.findOne({ testId: attempt.testId });
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Calculate score and section scores
    let score = 0;
    const sectionScores: Record<string, number> = {};

    for (const section of test.testJSON.sections || []) {
      sectionScores[section.sectionId] = 0;
      for (const question of section.questions || []) {
        const response = attempt.responses.find(r => r.questionId === question.questionId);
        if (response && response.isCorrect) {
          score += 1;
          sectionScores[section.sectionId] += 1;
        }
      }
    }

    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.score = score;
    attempt.sectionScores = sectionScores;
    
    await attempt.save();

    return NextResponse.json({ 
      message: 'Test submitted successfully', 
      score: attempt.score,
      totalQuestions: test.totalQuestions
    });
    
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
