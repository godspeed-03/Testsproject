import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { runFullConsistencyPipeline, getEffectiveUserId } from '@/lib/consistencyEngineV3';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = { mode: 'manual' };
    }

    const mode = body.mode || 'manual';

    const result = await runFullConsistencyPipeline(effectiveUserId);

    return NextResponse.json({
      success: true,
      mode,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      daily: result.daily,
      monthly: result.monthly,
      allTime: result.allTime
    });
  } catch (error: any) {
    console.error('Error recalculating consistency score:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
