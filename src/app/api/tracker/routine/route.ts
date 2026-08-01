import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import RoutineConfig from '@/models/RoutineConfig';

/**
 * Recursively strips all Mongo metadata (_id, __v, userId, createdAt, updatedAt)
 * from an object and all nested arrays/objects.
 */
function deepCleanMongo(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(deepCleanMongo);
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (['_id', '__v', 'userId', 'createdAt', 'updatedAt'].includes(key)) continue;
    result[key] = deepCleanMongo(obj[key]);
  }
  return result;
}

/**
 * Unwraps configPayload nesting and deep-cleans the result.
 */
function cleanRoutinePayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  let data = obj;

  // Prefer configPayload if it has actual cell/table data
  if (data.configPayload && typeof data.configPayload === 'object') {
    const cp = data.configPayload;
    if (cp.cells?.length || cp.timeSlots?.length || cp.tables?.length || cp.satakGoals?.length) {
      data = cp;
    }
  }

  return deepCleanMongo(data);
}

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    const config = await RoutineConfig.findOne({ userId }).lean();

    if (!config) {
      return NextResponse.json({
        routineConfig: null
      });
    }

    const cleanPayload = cleanRoutinePayload(config);

    return NextResponse.json({
      routineConfig: cleanPayload
    });
  } catch (error: any) {
    console.error('Fetch routine config error:', error);
    return NextResponse.json(
      { routineConfig: null, error: 'Database fetch failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    const body = await req.json();
    let rawRoutineData = body.routineConfig || body;

    if (!rawRoutineData) {
      return NextResponse.json({ error: 'Invalid routine configuration JSON payload' }, { status: 400 });
    }

    const routineData = cleanRoutinePayload(rawRoutineData);

    await connectToDatabase();

    const updateDoc: any = {
      userId,
      configPayload: routineData,
      title: routineData.title || 'Master Routine & Schedule',
      subtitle: routineData.subtitle || '',
      timeSlots: routineData.timeSlots || [],
      cells: routineData.cells || [],
      metrics: routineData.metrics || {},
      satakGoals: routineData.satakGoals || [],
      tables: routineData.tables || undefined,
      weeklySummary: routineData.weeklySummary || undefined,
      updatedAt: new Date()
    };

    await RoutineConfig.findOneAndUpdate(
      { userId },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      routineConfig: routineData
    });
  } catch (error: any) {
    console.error('Save routine config error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save routine config' },
      { status: 500 }
    );
  }
}
