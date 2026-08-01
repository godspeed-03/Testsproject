import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import RoutineConfig from '@/models/RoutineConfig';
import { DEFAULT_MASTER_ROUTINE_CONFIG } from '@/lib/routineDefaultConfig';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    const config = await RoutineConfig.findOne({
      $or: [{ userId }, { userId: '000000000000000000000000' }]
    }).lean();

    if (!config) {
      return NextResponse.json({
        routineConfig: DEFAULT_MASTER_ROUTINE_CONFIG
      });
    }

    return NextResponse.json({
      routineConfig: (config as any).configPayload || ((config as any).tables ? { tables: (config as any).tables } : config)
    });
  } catch (error: any) {
    console.error('Fetch routine config error:', error);
    return NextResponse.json(
      { routineConfig: DEFAULT_MASTER_ROUTINE_CONFIG, error: 'Database fetch failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    const body = await req.json();
    const routineData = body.routineConfig || body;

    if (!routineData) {
      return NextResponse.json({ error: 'Invalid routine configuration JSON payload' }, { status: 400 });
    }

    await connectToDatabase();

    const updateDoc: any = {
      userId,
      configPayload: routineData
    };

    if (routineData.tables) {
      updateDoc.tables = routineData.tables;
    }
    if (routineData.title) updateDoc.title = routineData.title;
    if (routineData.subtitle) updateDoc.subtitle = routineData.subtitle;
    if (routineData.timeSlots) updateDoc.timeSlots = routineData.timeSlots;
    if (routineData.cells) updateDoc.cells = routineData.cells;
    if (routineData.metrics) updateDoc.metrics = routineData.metrics;
    if (routineData.satakGoals) updateDoc.satakGoals = routineData.satakGoals;

    const updated = await RoutineConfig.findOneAndUpdate(
      { userId },
      updateDoc,
      { upsert: true, new: true, runValidators: false }
    ).lean();

    return NextResponse.json({
      message: 'Master Routine configuration saved to MongoDB database successfully!',
      routineConfig: (updated as any).configPayload || updated
    });
  } catch (error: any) {
    console.error('Save routine config error:', error);
    return NextResponse.json({ error: 'Failed to save routine to MongoDB' }, { status: 500 });
  }
}
