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
    let maxScore = 0;
    const sectionScores: Record<string, number> = {};

    const globalCorrectMarks = test.testJSON.correctMarks ?? 1;
    const globalIncorrectMarks = test.testJSON.incorrectMarks ?? 0.25;

    for (const section of test.testJSON.sections || []) {
      sectionScores[section.sectionId] = 0;
      const sectionCorrectMarks = section.correctMarks ?? globalCorrectMarks;
      const sectionIncorrectMarks = section.incorrectMarks ?? globalIncorrectMarks;

      for (const question of section.questions || []) {
        const qCorrectMarks = question.correctMarks ?? sectionCorrectMarks;
        const qIncorrectMarks = question.incorrectMarks ?? sectionIncorrectMarks;

        maxScore += qCorrectMarks;

        const response = attempt.responses.find(r => r.questionId === question.questionId);
        
        if (response && response.isCorrect === true) {
          score += qCorrectMarks;
          sectionScores[section.sectionId] += qCorrectMarks;
        } else if (response && response.isCorrect === false && response.selectedAnswer !== null && response.selectedAnswer !== undefined) {
          // Subtract incorrect marks only if a wrong answer was selected
          // Depending on schema, it might be positive number indicating deduction
          score -= Math.abs(qIncorrectMarks);
          sectionScores[section.sectionId] -= Math.abs(qIncorrectMarks);
        }
      }
    }

    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.score = score;
    attempt.sectionScores = sectionScores;
    // You might want to define maxScore in Attempt schema if needed, but for now we can just store it in an unstructured way or return it
    // attempt.maxScore = maxScore;
    
    await attempt.save();

    return NextResponse.json({ 
      message: 'Test submitted successfully', 
      score: attempt.score,
      maxScore: maxScore,
      totalQuestions: test.totalQuestions
    });
    
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
