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

    // Prepare analytics data
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const totalTimeTaken = attempt.responses.reduce((sum: number, r: any) => sum + r.timeTaken, 0);

    const questionAnalysis = [];
    const topicPerformance: Record<string, { correct: number, total: number }> = {};
    const difficultyAnalysis: Record<string, { correct: number, total: number }> = {};
    
    const globalCorrectMarks = test.testJSON.correctMarks ?? 1;
    
    let maxScore = 0;
    
    for (const section of test.testJSON.sections || []) {
      const sectionCorrectMarks = section.correctMarks ?? globalCorrectMarks;
      for (const question of section.questions || []) {
        const qCorrectMarks = question.correctMarks ?? sectionCorrectMarks;
        maxScore += qCorrectMarks;
        
        const response = attempt.responses.find((r: any) => r.questionId === question.questionId);
        
        // Topic metrics
        const topic = question.topic || 'General';
        if (!topicPerformance[topic]) topicPerformance[topic] = { correct: 0, total: 0 };
        topicPerformance[topic].total += 1;
        
        // Difficulty metrics
        const difficulty = question.difficulty || 'medium';
        if (!difficultyAnalysis[difficulty]) difficultyAnalysis[difficulty] = { correct: 0, total: 0 };
        difficultyAnalysis[difficulty].total += 1;

        if (!response) {
          unansweredCount += 1;
          questionAnalysis.push({
            questionId: question.questionId,
            status: 'unanswered',
            timeTaken: 0,
            topic,
            difficulty
          });
        } else {
          if (response.isCorrect) {
            correctCount += 1;
            topicPerformance[topic].correct += 1;
            difficultyAnalysis[difficulty].correct += 1;
          } else {
            incorrectCount += 1;
          }
          questionAnalysis.push({
            questionId: question.questionId,
            status: response.isCorrect ? 'correct' : 'incorrect',
            timeTaken: response.timeTaken,
            topic,
            difficulty,
            selectedAnswer: response.selectedAnswer,
            correctAnswer: question.correctAnswer || question.correctMatches, // Provide answer in analytics
            explanation: question.explanation
          });
        }
      }
    }

    // fallback to totalQuestions if maxScore is 0 for some reason (e.g. empty test)
    const divisor = maxScore > 0 ? maxScore : (test.totalQuestions > 0 ? test.totalQuestions : 1);
    const accuracy = attempt.score !== undefined 
      ? (attempt.score / divisor) * 100 
      : 0;

    return NextResponse.json({ 
      analytics: {
        score: attempt.score,
        maxScore,
        totalQuestions: test.totalQuestions,
        accuracy,
        correctCount,
        incorrectCount,
        unansweredCount,
        totalTimeTaken,
        avgTimePerQuestion: attempt.responses.length > 0 ? totalTimeTaken / attempt.responses.length : 0,
        sectionScores: attempt.sectionScores,
        questionAnalysis,
        topicPerformance,
        difficultyAnalysis
      },
      testName: test.testName
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
