import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

function sanitizeTestJSON(testJSON: any) {
  // Deep clone to avoid mutating the original
  const sanitized = JSON.parse(JSON.stringify(testJSON));
  
  if (sanitized.sections) {
    sanitized.sections.forEach((section: any) => {
      if (section.questions) {
        section.questions.forEach((question: any) => {
          delete question.correctAnswer;
          delete question.correctMatches;
          delete question.explanation;
        });
      }
    });
  }
  return sanitized;
}

export async function GET(req: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params;
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const test = await Test.findOne({ testId }).lean();
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Admins get the full test JSON including answers for editing/previewing
    // Users get a sanitized version without answers
    if (user.role === 'admin') {
      return NextResponse.json({ test });
    } else {
      const sanitizedTestJSON = sanitizeTestJSON(test.testJSON);
      return NextResponse.json({ 
        test: {
          ...test,
          testJSON: sanitizedTestJSON
        } 
      });
    }

  } catch (error) {
    console.error('Get test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params;
    const user = await getUserFromCookies();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const updateData = await req.json();

    // Prevent testId modification
    delete updateData.testId;

    // Recalculate totals if JSON is being fully updated
    if (updateData.testJSON) {
      let totalQuestions = 0;
      let totalTime = updateData.testJSON.totalTime || updateData.totalTime || 0;
      
      updateData.testJSON.sections?.forEach((section: any) => {
        totalQuestions += section.questions?.length || 0;
      });
      
      updateData.totalQuestions = totalQuestions;
      if (updateData.testJSON.totalTime) {
        updateData.totalTime = updateData.testJSON.totalTime;
      }
    }

    const test = await Test.findOneAndUpdate(
      { testId },
      { $set: updateData },
      { new: true }
    );

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Test updated successfully', test });
  } catch (error) {
    console.error('Update test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params;
    const user = await getUserFromCookies();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const test = await Test.findOneAndDelete({ testId });
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
