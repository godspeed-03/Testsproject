import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';

function deepClean(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(deepClean);
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (['_id', '__v', 'userId', 'createdAt', 'updatedAt'].includes(key)) continue;
    result[key] = deepClean(obj[key]);
  }
  return result;
}

function cleanRoutinePayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  let data = obj;

  if (data.configPayload && typeof data.configPayload === 'object') {
    const cp = data.configPayload;
    if (cp.cells?.length || cp.timeSlots?.length || cp.tables?.length || cp.satakGoals?.length) {
      data = cp;
    }
  }

  return deepClean(data);
}

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const config = await prisma.routineConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      return NextResponse.json({
        routineConfig: null,
      });
    }

    const payload = typeof config.configPayload === 'object' ? config.configPayload : config;
    const cleanPayload = cleanRoutinePayload(payload);

    return NextResponse.json({
      routineConfig: cleanPayload,
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
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const body = await req.json();
    let rawRoutineData = body.routineConfig || body;

    if (!rawRoutineData) {
      return NextResponse.json({ error: 'Invalid routine configuration JSON payload' }, { status: 400 });
    }

    const routineData = cleanRoutinePayload(rawRoutineData);

    const routineConfig = await prisma.routineConfig.upsert({
      where: { userId },
      update: {
        configPayload: routineData,
      },
      create: {
        userId,
        configPayload: routineData,
      },
    });

    return NextResponse.json({
      success: true,
      routineConfig: routineData,
    });
  } catch (error: any) {
    console.error('Save routine config error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save routine config' },
      { status: 500 }
    );
  }
}
