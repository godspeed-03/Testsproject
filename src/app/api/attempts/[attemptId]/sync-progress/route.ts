import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

function evaluateAnswer(question: any, selectedAnswer: any): boolean {
  if (question.type === 'mcq-single') {
    // Array with single element or single number
    const correctAnswer = Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer;
    const submitted = Array.isArray(selectedAnswer) ? selectedAnswer[0] : selectedAnswer;
    return String(correctAnswer) === String(submitted);
  }
  
  if (question.type === 'mcq-multiple') {
    if (!Array.isArray(selectedAnswer)) return false;
    const correctStr = [...question.correctAnswer].sort().map(String);
    const selectedStr = [...selectedAnswer].sort().map(String);
    if (correctStr.length !== selectedStr.length) return false;
    return correctStr.every((val, index) => val === selectedStr[index]);
  }
  
  if (question.type === 'true-false') {
    const correctAnswer = Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer;
    const submitted = Array.isArray(selectedAnswer) ? selectedAnswer[0] : selectedAnswer;
    return String(correctAnswer) === String(submitted);
  }
  
  if (question.type === 'matching') {
    if (typeof selectedAnswer !== 'object' || selectedAnswer === null) return false;
    const correctMatches = question.correctMatches || {};
    const keys = Object.keys(correctMatches);
    if (keys.length !== Object.keys(selectedAnswer).length) return false;
    
    return keys.every(key => String(correctMatches[key]) === String(selectedAnswer[key]));
  }
  
  return false;
}

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { questionId, selectedAnswer, timeTaken, timeLeft, status } = await req.json();

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

    // Find the question to evaluate
    let questionToEvaluate = null;
    let sectionId = null;

    for (const section of test.testJSON.sections || []) {
      const q = (section.questions || []).find((q: any) => q.questionId === questionId);
      if (q) {
        questionToEvaluate = q;
        sectionId = section.sectionId;
        break;
      }
    }

    if (!questionToEvaluate) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = evaluateAnswer(questionToEvaluate, selectedAnswer);

    // Update or add response atomically to avoid VersionError during rapid syncs
    const existingResponseIndex = attempt.responses.findIndex((r: any) => r.questionId === questionId);
    if (existingResponseIndex !== -1) {
      const updateData: any = {
        [`responses.${existingResponseIndex}.selectedAnswer`]: selectedAnswer,
        [`responses.${existingResponseIndex}.isCorrect`]: isCorrect,
        [`responses.${existingResponseIndex}.timeTaken`]: timeTaken,
        [`responses.${existingResponseIndex}.status`]: status
      };
      if (timeLeft !== undefined) updateData.timeLeft = timeLeft;
      await Attempt.updateOne({ _id: attempt._id }, { $set: updateData });
    } else {
      const pushData = { questionId, selectedAnswer, isCorrect, timeTaken, status };
      const updateObj: any = { $push: { responses: pushData } };
      if (timeLeft !== undefined) updateObj.$set = { timeLeft };
      await Attempt.updateOne({ _id: attempt._id }, updateObj);
    }

    if (attempt.mode === 'practice' && status === 'answered') {
      // In practice mode, return immediate feedback including explanation only if answered
      return NextResponse.json({
        isCorrect,
        correctAnswer: questionToEvaluate.correctAnswer || questionToEvaluate.correctMatches,
        explanation: questionToEvaluate.explanation
      });
    }

    // In test mode, do not leak answer
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
