import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    const ruleSets = await prisma.syllabusRuleSet.findMany({
      where: { userId },
    });

    const formatted = ruleSets.map((rs) => ({
      id: rs.id,
      name: rs.name,
      category: rs.category,
      rules: Array.isArray(rs.rules) ? rs.rules : [],
    }));

    return NextResponse.json({ ruleSets: formatted });
  } catch (error: any) {
    console.error('Fetch syllabus rule sets error:', error);
    return NextResponse.json({ error: 'Failed to fetch rule sets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, name, category, rules } = body;

    if (action === 'create') {
      if (!name || !Array.isArray(rules)) {
        return NextResponse.json({ error: 'Name and rules array are required' }, { status: 400 });
      }
      await prisma.syllabusRuleSet.create({
        data: {
          userId: user.userId,
          name,
          category: category || 'General',
          rules,
        },
      });
    } else if (action === 'update' && id) {
      const rs = await prisma.syllabusRuleSet.findFirst({
        where: { id, userId: user.userId },
      });
      if (rs) {
        await prisma.syllabusRuleSet.update({
          where: { id: rs.id },
          data: {
            name: name !== undefined ? name : rs.name,
            category: category !== undefined ? category : rs.category,
            rules: (rules !== undefined && Array.isArray(rules)) ? rules : (rs.rules as any),
          },
        });
      }
    } else if (action === 'delete' && id) {
      await prisma.syllabusRuleSet.deleteMany({
        where: { id, userId: user.userId },
      });
    }

    const ruleSets = await prisma.syllabusRuleSet.findMany({
      where: { userId: user.userId },
    });

    const formatted = ruleSets.map((rs) => ({
      id: rs.id,
      name: rs.name,
      category: rs.category,
      rules: Array.isArray(rs.rules) ? rs.rules : [],
    }));

    return NextResponse.json({ ruleSets: formatted });
  } catch (error: any) {
    console.error('Syllabus rule set mutation error:', error);
    return NextResponse.json({ error: 'Failed to update rule set' }, { status: 500 });
  }
}
