import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const testJSON = await req.json();

    if (!testJSON.testId || !testJSON.testName || !testJSON.sections) {
      return NextResponse.json({ error: 'Invalid JSON structure' }, { status: 400 });
    }

    const existingTest = await Test.findOne({ testId: testJSON.testId });
    if (existingTest) {
      return NextResponse.json({ error: 'Test with this ID already exists' }, { status: 400 });
    }

    const { settings } = testJSON;
    const testSettings = settings || { isLive: true, strictSectionOrder: false };

    // Calculate total questions and time
    let totalQuestions = 0;
    let totalTime = testJSON.totalTime || 0;

    testJSON.sections.forEach((section: any) => {
      if (section.questions) {
        totalQuestions += section.questions.length;
      }
    });

    const test = await Test.create({
      testId: testJSON.testId,
      testName: testJSON.testName,
      testJSON: testJSON,
      createdBy: user.userId,
      totalQuestions,
      totalTime,
      settings: testSettings
    });

    return NextResponse.json({ message: 'Test created successfully', testId: test.testId });
  } catch (error) {
    console.error('Test creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
