import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';
import SyllabusRuleSet from '@/models/SyllabusRuleSet';
import TestLog from '@/models/TestLog';
import TopicRevision from '@/models/TopicRevision';
import { calcOverdueStatus } from '@/lib/topicRevisionEngine';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';

async function cleanupCorruptedSyllabusItems(userId: string) {
  try {
    const allSyllabus = await SyllabusItem.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }]
    });

    const knownCategories = ['gs1', 'gs2', 'gs3', 'gs4', 'maths', 'csat', 'optional', 'essay', 'general', 'study'];
    const toDeleteIds: string[] = [];
    const subjectMap = new Map<string, any[]>();

    for (const item of allSyllabus) {
      const sName = item.subject?.trim().toLowerCase();
      if (!sName) {
        toDeleteIds.push(item._id.toString());
        continue;
      }
      if (!subjectMap.has(sName)) {
        subjectMap.set(sName, []);
      }
      subjectMap.get(sName)!.push(item);
    }

    for (const [sName, items] of subjectMap.entries()) {
      if (items.length > 1) {
        const validItems = items.filter(i => knownCategories.some(k => i.category?.toLowerCase().includes(k)));
        if (validItems.length > 0) {
          const keepId = validItems[0]._id.toString();
          items.forEach(i => {
            if (i._id.toString() !== keepId) {
              toDeleteIds.push(i._id.toString());
            }
          });
        } else {
          const keepId = items[0]._id.toString();
          items.forEach(i => {
            if (i._id.toString() !== keepId) {
              toDeleteIds.push(i._id.toString());
            }
          });
        }
      } else if (items.length === 1) {
        const item = items[0];
        const catLower = item.category?.trim().toLowerCase() || '';
        const isKnown = knownCategories.some(k => catLower.includes(k));
        if (!isKnown) {
          const safeCat = item.category?.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const isTopic = await TopicRevision.exists({
            $or: [{ userId }, { userId: '000000000000000000000000' }],
            topic: { $regex: new RegExp(`^${safeCat}$`, 'i') }
          });
          if (isTopic) {
            toDeleteIds.push(item._id.toString());
          }
        }
      }
    }

    if (toDeleteIds.length > 0) {
      await SyllabusItem.deleteMany({ _id: { $in: toDeleteIds } });
    }
  } catch (err) {
    console.error('Failed to clean up corrupted SyllabusItems:', err);
  }
}

export async function GET() {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    await cleanupCorruptedSyllabusItems(userId);

    const todayStr = new Date().toISOString().split('T')[0];
    const userFilter = { $or: [{ userId }, { userId: '000000000000000000000000' }] };
    const syllabus = await SyllabusItem.find(userFilter).lean();
    const testLogs = await TestLog.find(userFilter).sort({ createdAt: -1 }).lean();
    const topicRevisions = await TopicRevision.find(userFilter).lean();
    const dbRuleSets = await SyllabusRuleSet.find(userFilter).lean();

    // Format for frontend cleanly with dynamic rules array
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

    const formattedTestLogs = testLogs.map((item: any) => ({
      id: item.customId || item._id.toString(),
      code: item.code,
      date: item.date,
      subject: item.subject,
      score: item.score,
      accuracy: item.accuracy,
      concept: item.concept,
      silly: item.silly,
      timeP: item.timeP,
      takeaway: item.takeaway
    }));

    const formattedTopicRevisions = topicRevisions.map((t: any) => {
      const overdueInfo = t.nextScheduledDate ? calcOverdueStatus(t.nextScheduledDate, todayStr) : { isOverdue: false, overdueDays: 0 };
      return {
        id: t.customId || t._id.toString(),
        subject: t.subject,
        category: t.category,
        topic: t.topic,
        firstReadDate: t.firstReadDate,
        lastRevisedDate: t.lastRevisedDate,
        status: t.status,
        isAugmentedRevision: t.isAugmentedRevision,
        isOverdue: overdueInfo.isOverdue,
        overdueDays: overdueInfo.overdueDays,
        nextScheduledDate: t.nextScheduledDate,
        revisions: t.revisions || []
      };
    });

    return NextResponse.json({
      syllabusList: formattedSyllabus,
      testLogs: formattedTestLogs,
      topicRevisions: formattedTopicRevisions
    });
  } catch (error: any) {
    console.error('Fetch tracker data error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    await SyllabusItem.deleteMany({ userId: user.userId });
    await TestLog.deleteMany({ userId: user.userId });
    await TopicRevision.deleteMany({ userId: user.userId });

    await SyllabusItem.deleteMany({});
    await TestLog.deleteMany({});
    await TopicRevision.deleteMany({});

    return NextResponse.json({
      message: 'All dummy data wiped successfully. Blank sheet initialized!',
      syllabusList: [],
      testLogs: [],
      topicRevisions: []
    });
  } catch (error: any) {
    console.error('Wipe data error:', error);
    return NextResponse.json({ error: 'Failed to wipe data' }, { status: 500 });
  }
}
