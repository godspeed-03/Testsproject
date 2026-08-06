import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';
import { runFullConsistencyPipeline } from '@/lib/consistencyEngineV3';

function sanitizeBson(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeBson);

  if (obj.$oid) return obj.$oid;
  if (obj.$date) return new Date(obj.$date);

  const clean: any = {};
  for (const key of Object.keys(obj)) {
    clean[key] = sanitizeBson(obj[key]);
  }
  return clean;
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const rawData = await req.json();
    const data = sanitizeBson(rawData);

    const habitsInput = data.habits || data.habitItems || [];
    const listsInput = data.lists || data.checkLists || data.checklists || [];
    const topicRevisionsInput = data.topicrevisions || data.topicRevisions || [];
    const syllabusInput = data.syllabusitems || data.syllabusList || data.syllabus || [];
    const testLogsInput = data.testlogs || data.testLogs || [];
    const ruleSetsInput = data.rulesets || data.ruleSets || data.syllabusRuleSets || [];
    const routineConfigInput = data.routineconfig || data.routineConfig || data.tables || null;
    const batchedRevisionsInput = data.batchedrevisions || data.batchedRevisions || data.batchedRevisionItems || [];
    const weeklyDataInput = data.weeklydata || data.weeklyData || [];

    // 1. Process Habits (Clean payload without legacy reminders column)
    if (Array.isArray(habitsInput) && habitsInput.length > 0) {
      await prisma.habitItem.deleteMany({ where: { userId } });
      const docs = habitsInput.map((h: any) => ({
        userId,
        type: h.type || 'habit',
        title: h.title || 'Untitled',
        category: h.category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' },
        description: h.description || '',
        frequency: h.frequency || { mode: 'daily', days: [] },
        target: h.target || { value: 1, unit: 'times' },
        startDate: h.startDate || new Date().toISOString().split('T')[0],
        endDate: h.endDate || null,
        isStudyTask: !!h.isStudyTask,
        isAugmentedRevision: h.isAugmentedRevision !== undefined ? !!h.isAugmentedRevision : true,
        isBatchRevision: h.isBatchRevision !== undefined ? !!h.isBatchRevision : false,
        subject: h.subject || '',
        topic: h.topic || '',
        color: h.color || '#6366F1',
        icon: h.icon || '🏃',
        streakCurrent: h.streakCurrent || 0,
        streakBest: h.streakBest || 0,
        history: h.history || [],
      }));
      await prisma.habitItem.createMany({ data: docs });
    }

    // 2. Process Checklists
    if (Array.isArray(listsInput) && listsInput.length > 0) {
      await prisma.checkList.deleteMany({ where: { userId } });
      const docs = listsInput.map((l: any) => ({
        userId,
        title: l.title || 'Untitled List',
        color: l.color || '#6366F1',
        items: (l.items || []).map((item: any, idx: number) => ({
          id: String(item.id || item._id || `item_${idx}_${Date.now()}`),
          text: String(item.text || ''),
          checked: item.checked !== undefined ? !!item.checked : !!item.completed,
        })),
      }));
      await prisma.checkList.createMany({ data: docs });
    }

    // 3. Process Topic Revisions
    if (Array.isArray(topicRevisionsInput) && topicRevisionsInput.length > 0) {
      await prisma.topicRevision.deleteMany({ where: { userId } });
      const docs = topicRevisionsInput.map((t: any) => ({
        userId,
        customId: t.customId || t.id || 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        subject: t.subject || 'General Studies',
        category: t.category || 'GS1',
        topic: t.topic || 'General Topic',
        firstReadDate: t.firstReadDate || t.date || '',
        lastRevisedDate: t.lastRevisedDate || '',
        status: t.status || 'Pending',
        isAugmentedRevision: t.isAugmentedRevision !== undefined ? !!t.isAugmentedRevision : true,
        isBatchedRevision: t.isBatchedRevision !== undefined ? !!t.isBatchedRevision : false,
        isOverdue: !!t.isOverdue,
        overdueDays: t.overdueDays || 0,
        nextScheduledDate: t.nextScheduledDate || '',
        revisions: t.revisions || [],
      }));
      await prisma.topicRevision.createMany({ data: docs });
    }

    // 3b. Process Batched Revisions
    if (Array.isArray(batchedRevisionsInput) && batchedRevisionsInput.length > 0) {
      await prisma.batchedRevisionItem.deleteMany({ where: { userId } });
      const docs = batchedRevisionsInput.map((b: any) => ({
        userId,
        habitId: b.habitId || null,
        topicRevisionIds: b.topicRevisionIds || (b.topicRevisionId ? [b.topicRevisionId] : []),
        title: b.title || '',
        subjectIds: b.subjectIds || [],
        topicStatuses: b.topicStatuses || [],
        isAllDone: !!b.isAllDone,
        completedDate: b.completedDate || '',
      }));
      await prisma.batchedRevisionItem.createMany({ data: docs });
    }

    // 4. Process Syllabus Items
    if (Array.isArray(syllabusInput) && syllabusInput.length > 0) {
      await prisma.syllabusItem.deleteMany({ where: { userId } });
      const docs = syllabusInput.map((item: any) => ({
        userId,
        customId: item.customId || item.id || 'subj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        subject: item.subject,
        category: item.category || 'GS1',
        status: item.status || 'Not Started',
        date: item.date || '',
        nextRev: item.nextRev || '',
        color: item.color || '',
        icon: item.icon || '',
        rules: item.rules || buildDynamicRulesFromLegacy(item),
      }));
      await prisma.syllabusItem.createMany({ data: docs });
    }

    // 5. Process Test Logs
    if (Array.isArray(testLogsInput) && testLogsInput.length > 0) {
      await prisma.testLog.deleteMany({ where: { userId } });
      const docs = testLogsInput.map((t: any) => ({
        userId,
        customId: t.customId || t.id || 'test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        testName: t.testName || t.code || 'Untitled Mock Test',
        code: t.code || t.testName || 'MOCK',
        type: t.type || 'PRELIMS',
        category: t.category || t.subject || 'GS1',
        date: t.date || '',
        subject: t.subject || t.category || 'General Studies',
        score: t.score || 0,
        maxScore: t.maxScore || 200,
        percent: t.percent !== undefined ? t.percent : (t.maxScore ? Math.round(((t.score || 0) / t.maxScore) * 100) : 0),
        benchmarkCutoff: t.benchmarkCutoff || 95,
        durationMins: t.durationMins || 120,
        accuracy: t.accuracy || '0%',
        correctCount: t.correctCount || 0,
        incorrectCount: t.incorrectCount || 0,
        unattemptedCount: t.unattemptedCount || 0,
        concept: t.concept || 0,
        silly: t.silly || 0,
        timeP: t.timeP || 0,
        weakAreas: Array.isArray(t.weakAreas) ? t.weakAreas : [],
        takeaway: t.takeaway || '',
      }));
      await prisma.testLog.createMany({ data: docs });
    }

    // 6. Process Syllabus Rule Sets
    if (Array.isArray(ruleSetsInput) && ruleSetsInput.length > 0) {
      await prisma.syllabusRuleSet.deleteMany({ where: { userId } });
      const docs = ruleSetsInput.map((r: any) => ({
        userId,
        name: r.name || 'Custom Rule Set',
        category: r.category || 'General',
        rules: r.rules || [],
      }));
      await prisma.syllabusRuleSet.createMany({ data: docs });
    }

    // 7. Process Weekly Data
    if (Array.isArray(weeklyDataInput) && weeklyDataInput.length > 0) {
      await prisma.weeklyData.deleteMany({ where: { userId } });
      const docs = weeklyDataInput.map((w: any) => ({
        userId,
        weekKey: w.weekKey || `week_${Date.now()}`,
        totalHours: w.totalHours || 0,
        weeklyScore: w.weeklyScore || 0,
        completedHabitsCount: w.completedHabitsCount || 0,
        completedTopicsCount: w.completedTopicsCount || 0,
        breakdown: w.breakdown || {},
      }));
      await prisma.weeklyData.createMany({ data: docs });
    }

    // 8. Process Routine Config
    if (routineConfigInput) {
      let payload = routineConfigInput;
      while (payload && payload.configPayload && typeof payload.configPayload === 'object' && !payload.timeSlots && !payload.tables && !payload.satakGoals) {
        payload = payload.configPayload;
      }
      if (typeof payload === 'object' && !Array.isArray(payload)) {
        const { _id, userId: uId, __v, createdAt, updatedAt, ...cleanPayload } = payload;
        payload = cleanPayload;
      }
      const finalPayload = Array.isArray(payload) ? { tables: payload } : payload;

      await prisma.routineConfig.upsert({
        where: { userId },
        update: { configPayload: finalPayload },
        create: { userId, configPayload: finalPayload },
      });
    }

    // Recalculate full consistency pipeline asynchronously for instant data synchronization
    runFullConsistencyPipeline(userId).catch((err) => {
      console.error('Post-import consistency engine recalculation error:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'System data imported successfully into PostgreSQL database',
      importedCount: {
        habits: habitsInput.length,
        lists: listsInput.length,
        topicRevisions: topicRevisionsInput.length,
        batchedRevisions: batchedRevisionsInput.length,
        syllabus: syllabusInput.length,
        testLogs: testLogsInput.length,
        ruleSets: ruleSetsInput.length,
        weeklyData: weeklyDataInput.length,
        routineConfig: routineConfigInput ? 1 : 0,
      },
    });
  } catch (error: any) {
    console.error('Import tracker error:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
