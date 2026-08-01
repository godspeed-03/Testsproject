import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import SyllabusRuleSet from '@/models/SyllabusRuleSet';
import { buildDynamicRulesFromLegacy, getDefaultRulesForCategory } from '@/lib/syllabusRules';

function addDaysStr(dateStr: string, days: number) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();
    const body = await req.json();
    const {
      action,
      id,
      subject,
      category,
      status,
      source,
      date,
      nextRev,
      rules,
      ruleKey,
      completed
    } = body;

    const isMongoId = id && id.match(/^[0-9a-fA-F]{24}$/);
    const userFilter = { $or: [{ userId }, { userId: '000000000000000000000000' }] };

    const queryFilter = isMongoId
      ? { $and: [userFilter, { $or: [{ customId: id }, { _id: id }] }] }
      : { $and: [userFilter, { $or: [{ customId: id }, { subject: id }] }] };

    const dbRuleSets = await SyllabusRuleSet.find(userFilter).lean();

    if (action === 'delete') {
      await SyllabusItem.deleteOne(queryFilter);
    } else if (action === 'toggle_rule' || action === 'toggle_milestone') {
      let item = await SyllabusItem.findOne(queryFilter);
      if (item) {
        item.userId = userId;
        let itemRules = buildDynamicRulesFromLegacy(item, dbRuleSets);

        const targetKey = ruleKey || Object.keys(body).find((k) => !['action', 'id'].includes(k));
        if (targetKey) {
          const ruleIdx = itemRules.findIndex((r) => r.key === targetKey || r.label === targetKey);
          if (ruleIdx !== -1) {
            const nextCompleted = completed !== undefined ? !!completed : !itemRules[ruleIdx].completed;
            itemRules[ruleIdx].completed = nextCompleted;
          }
        }

        item.rules = itemRules;
        await item.save();
      }
    } else if (action === 'update' || action === 'update_rules') {
      let item = await SyllabusItem.findOne(queryFilter);
      if (item) {
        item.userId = userId;
        const todayStr = new Date().toISOString().split('T')[0];
        item.subject = subject ?? item.subject;
        item.category = category ?? item.category;
        item.status = status ?? item.status;
        item.source = source ?? item.source;
        item.date = date ?? (item.date || todayStr);
        item.nextRev = nextRev ?? (item.nextRev || addDaysStr(item.date || todayStr, 7));

        if (rules && Array.isArray(rules)) {
          item.rules = rules;
        } else {
          item.rules = buildDynamicRulesFromLegacy(item, dbRuleSets);
        }

        await item.save();
      }
    } else if (action === 'create') {
      const customId = 'subj_' + Date.now();
      const todayStr = new Date().toISOString().split('T')[0];
      const initialDate = date || todayStr;
      const initialNextRev = nextRev || addDaysStr(initialDate, 7);

      let initialRules = rules && Array.isArray(rules) && rules.length > 0
        ? rules
        : getDefaultRulesForCategory(category || '', dbRuleSets).map((t) => ({
            key: t.key,
            label: t.label,
            short: t.short,
            completed: false
          }));

      await SyllabusItem.create({
        userId,
        customId,
        subject,
        category: category || 'GS1',
        status: status || 'Not Started',
        source: source || '',
        date: initialDate,
        nextRev: initialNextRev,
        rules: initialRules
      });
    }

    const syllabus = await SyllabusItem.find(userFilter).lean();

    const formattedSyllabus = syllabus.map((item: any) => ({
      id: item.customId || item._id.toString(),
      subject: item.subject,
      category: item.category || 'GS1',
      status: item.status || 'Not Started',
      source: item.source || '',
      date: item.date || '',
      nextRev: item.nextRev || '',
      rules: buildDynamicRulesFromLegacy(item, dbRuleSets)
    }));

    return NextResponse.json({ syllabusList: formattedSyllabus });
  } catch (error: any) {
    console.error('Syllabus mutation error:', error);
    return NextResponse.json({ error: 'Failed to modify subject' }, { status: 500 });
  }
}
