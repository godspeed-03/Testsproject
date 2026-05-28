import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Admin only needs metadata, not full JSON for listing
    const tests = await Test.find({}, '-testJSON')
                            .sort({ createdAt: -1 })
                            .lean();

    return NextResponse.json({ tests });
  } catch (error) {
    console.error('List tests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
