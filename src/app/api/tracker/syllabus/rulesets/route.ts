import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusRuleSet from '@/models/SyllabusRuleSet';
import { DEFAULT_RULESETS } from '@/lib/syllabusRules';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    let ruleSets = await SyllabusRuleSet.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }]
    }).lean();

    if (ruleSets.length === 0) {
      // Seed defaults for user
      const seedDocs = DEFAULT_RULESETS.map((rs) => ({
        userId,
        name: rs.name,
        category: rs.category,
        rules: rs.rules
      }));
      await SyllabusRuleSet.insertMany(seedDocs);
      ruleSets = await SyllabusRuleSet.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();
    }

    const formatted = ruleSets.map((rs: any) => ({
      id: rs._id.toString(),
      name: rs.name,
      category: rs.category,
      rules: rs.rules || []
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

    await connectToDatabase();
    const body = await req.json();
    const { action, id, name, category, rules } = body;

    if (action === 'create') {
      if (!name || !Array.isArray(rules)) {
        return NextResponse.json({ error: 'Name and rules array are required' }, { status: 400 });
      }
      await SyllabusRuleSet.create({
        userId: user.userId,
        name,
        category: category || 'General',
        rules
      });
    } else if (action === 'update' && id) {
      const rs = await SyllabusRuleSet.findOne({ _id: id, userId: user.userId });
      if (rs) {
        if (name !== undefined) rs.name = name;
        if (category !== undefined) rs.category = category;
        if (rules !== undefined && Array.isArray(rules)) rs.rules = rules;
        await rs.save();
      }
    } else if (action === 'delete' && id) {
      await SyllabusRuleSet.deleteOne({ _id: id, userId: user.userId });
    }

    const ruleSets = await SyllabusRuleSet.find({ userId: user.userId }).lean();
    const formatted = ruleSets.map((rs: any) => ({
      id: rs._id.toString(),
      name: rs.name,
      category: rs.category,
      rules: rs.rules || []
    }));

    return NextResponse.json({ ruleSets: formatted });
  } catch (error: any) {
    console.error('Syllabus rule set mutation error:', error);
    return NextResponse.json({ error: 'Failed to update rule set' }, { status: 500 });
  }
}
