import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import {
  getMonthKey,
  getMonthName,
  getEffectiveUserId,
  runFullConsistencyPipeline,
} from '@/lib/consistencyEngineV3';

function getGradeLabel(score: number): string {
  if (score >= 90) return 'S-TIER CONSISTENT';
  if (score >= 75) return 'A-TIER CONSISTENT';
  if (score >= 60) return 'B-TIER STABLE';
  return 'NEEDS FOCUS';
}

function calculateStreak(habit: any) {
  if (!habit || !Array.isArray(habit.history)) {
    return { current: 0, best: 0 };
  }
  const historyMap = new Set<string>(
    habit.history
      .filter((entry: any) => entry.status === 'done' || (entry.value && entry.value > 0))
      .map((entry: any) => entry.date as string)
  );

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().split('T')[0];

  let checkDate = historyMap.has(todayIso) ? today : (historyMap.has(yesterdayIso) ? yesterday : null);

  if (checkDate) {
    const cur = new Date(checkDate);
    while (true) {
      const iso = cur.toISOString().split('T')[0];
      if (historyMap.has(iso)) {
        currentStreak++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const sortedDates = Array.from(historyMap).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { current: currentStreak, best: bestStreak };
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    const effectiveUserId = await getEffectiveUserId(user?.userId);

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';
    const monthKey = searchParams.get('monthKey') || getMonthKey();
    const habitIdFilter = searchParams.get('habitId');
    const subjectFilter = searchParams.get('subject');
    const categoryFilter = searchParams.get('category');

    const pipelineRes = await runFullConsistencyPipeline(effectiveUserId);
    let monthlyDoc = await prisma.monthlySnapshot.findUnique({
      where: {
        userId_monthKey: {
          userId: effectiveUserId,
          monthKey,
        },
      },
    });

    if (!monthlyDoc) {
      monthlyDoc = pipelineRes.monthly as any;
    }
    const allTimeDoc = pipelineRes.allTime as any;

    // Fetch DB collections for habits, subjects, and categories breakdowns
    const [allHabits, syllabusItems, topicRevisions] = await Promise.all([
      prisma.habitItem.findMany({ where: { userId: effectiveUserId } }),
      prisma.syllabusItem.findMany({ where: { userId: effectiveUserId } }),
      prisma.topicRevision.findMany({ where: { userId: effectiveUserId } }),
    ]);

    // Build habits breakdown (filter to type === 'habit')
    const habitsList = allHabits
      .filter((h: any) => h.type === 'habit')
      .map((h: any) => {
      const history = Array.isArray(h.history) ? h.history : [];
      const streak = calculateStreak(h);
      const completedEntries = history.filter((e: any) => e.status === 'done' || (e.value && e.value > 0));
      const scheduledDays = Math.max(1, history.length || 7);
      const completedDays = completedEntries.length;
      const score = Math.min(100, Math.round((completedDays / scheduledDays) * 100));

      return {
        habitId: h.id,
        title: h.title,
        type: h.type || 'habit',
        icon: h.icon || '🏃',
        category: h.category || 'General',
        scheduledDays,
        completedDays,
        score,
        streakCurrent: streak.current,
        streakBest: streak.best,
      };
    });

    // Build subjects breakdown
    const todayStr = new Date().toISOString().split('T')[0];
    const subjectMap: Record<string, { subject: string; category: string; revisionsDue: number; revisionsDone: number; revisionsMissed: number; topicsRead: number }> = {};

    syllabusItems.forEach((item: any) => {
      const subj = item.subject?.trim();
      if (!subj) return;
      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          subject: subj,
          category: item.category || 'GS',
          revisionsDue: 0,
          revisionsDone: 0,
          revisionsMissed: 0,
          topicsRead: item.status === 'Completed' || item.status === 'done' ? 1 : 0,
        };
      } else if (item.status === 'Completed' || item.status === 'done') {
        subjectMap[subj].topicsRead++;
      }
    });

    topicRevisions.forEach((tr: any) => {
      const subj = tr.subject?.trim();
      if (!subj) return;
      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          subject: subj,
          category: tr.category || 'GS',
          revisionsDue: 0,
          revisionsDone: 0,
          revisionsMissed: 0,
          topicsRead: 1,
        };
      }

      const revs = Array.isArray(tr.revisions) ? tr.revisions : [];
      revs.forEach((r: any) => {
        if (r.status === 'Completed' || r.status === 'done') {
          subjectMap[subj].revisionsDone++;
          subjectMap[subj].revisionsDue++;
        } else if (r.status === 'Missed' || (r.scheduledDate && r.scheduledDate < todayStr)) {
          subjectMap[subj].revisionsMissed++;
          subjectMap[subj].revisionsDue++;
        } else if (r.scheduledDate) {
          subjectMap[subj].revisionsDue++;
        }
      });
    });

    const subjectsList = Object.values(subjectMap).map((s) => {
      const due = Math.max(1, s.revisionsDue);
      const rawCredit = ((s.revisionsDone * 1.0 - s.revisionsMissed * 1.3) / due) * 100;
      const score = Math.max(0, Math.min(100, Math.round(rawCredit)));
      return {
        ...s,
        score,
      };
    });

    // Build categories breakdown
    const categoryMap: Record<string, { category: string; revisionsDue: number; revisionsDone: number; revisionsMissed: number; topicsRead: number }> = {};

    subjectsList.forEach((s) => {
      const cat = s.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          revisionsDue: s.revisionsDue,
          revisionsDone: s.revisionsDone,
          revisionsMissed: s.revisionsMissed,
          topicsRead: s.topicsRead,
        };
      } else {
        categoryMap[cat].revisionsDue += s.revisionsDue;
        categoryMap[cat].revisionsDone += s.revisionsDone;
        categoryMap[cat].revisionsMissed += s.revisionsMissed;
        categoryMap[cat].topicsRead += s.topicsRead;
      }
    });

    const categoriesList = Object.values(categoryMap).map((c) => {
      const due = Math.max(1, c.revisionsDue);
      const rawCredit = ((c.revisionsDone * 1.0 - c.revisionsMissed * 1.3) / due) * 100;
      const score = Math.max(0, Math.min(100, Math.round(rawCredit)));
      return {
        ...c,
        score,
      };
    });

    if (range === 'month') {
      const dailyDocs = await prisma.dailySnapshot.findMany({
        where: { userId: effectiveUserId, monthKey },
        orderBy: { studyDayKey: 'asc' },
      });

      // Recalculate habit scheduledDays & completedDays from actual daily snapshots for accuracy
      const habitStatsFromSnapshots: Record<string, { scheduledDays: number; completedDays: number }> = {};
      dailyDocs.forEach((d: any) => {
        const habitBreakdown = Array.isArray(d.habitBreakdown) ? d.habitBreakdown : [];
        habitBreakdown.forEach((hb: any) => {
          if (hb.scheduled) {
            if (!habitStatsFromSnapshots[hb.habitId]) {
              habitStatsFromSnapshots[hb.habitId] = { scheduledDays: 0, completedDays: 0 };
            }
            habitStatsFromSnapshots[hb.habitId].scheduledDays += 1;
            if (hb.done) {
              habitStatsFromSnapshots[hb.habitId].completedDays += 1;
            }
          }
        });
      });

      const updatedHabitsList = habitsList.map((h) => {
        const stats = habitStatsFromSnapshots[h.habitId];
        if (stats && stats.scheduledDays > 0) {
          const scheduledDays = stats.scheduledDays;
          const completedDays = stats.completedDays;
          const score = Math.round((completedDays / scheduledDays) * 100);
          return {
            ...h,
            scheduledDays,
            completedDays,
            score,
          };
        }
        return h;
      });

      const currentMonthDoc = monthlyDoc || {
        avgConsistencyScore: 0,
        activeDaysCount: 0,
      };

      const overallScore = currentMonthDoc.avgConsistencyScore || 0;

      const trend = dailyDocs
        .map((d: any) => {
          const habitBreakdown = Array.isArray(d.habitBreakdown) ? d.habitBreakdown : [];
          const categoryBreakdown = Array.isArray(d.categoryBreakdown) ? d.categoryBreakdown : [];
          const subjectBreakdown = Array.isArray(d.subjectBreakdown) ? d.subjectBreakdown : [];

          if (habitIdFilter) {
            const hMatch = habitBreakdown.find((h: any) => String(h.habitId) === String(habitIdFilter));
            if (!hMatch || !hMatch.scheduled) {
              return null;
            }
            const itemScore = typeof hMatch.score === 'number' ? hMatch.score : (hMatch.done ? 100 : 0);
            return {
              studyDayKey: d.studyDayKey,
              overallScore: itemScore,
              habitScore: itemScore,
              taskScore: itemScore,
              revisionScore: itemScore,
            };
          }

          if (subjectFilter) {
            const sLower = subjectFilter.toLowerCase().trim();
            const hMatches = habitBreakdown.filter((h: any) => h.scheduled && (String(h.subject || '').toLowerCase().trim() === sLower || String(h.category || '').toLowerCase().trim() === sLower || String(h.title || '').toLowerCase().trim().includes(sLower)));
            const sMatch = subjectBreakdown.find((s: any) => String(s.subject || '').toLowerCase().trim() === sLower);

            const hasRevisions = sMatch && (sMatch.due > 0 || sMatch.done > 0 || sMatch.topicsRead > 0);
            const hasHabits = hMatches.length > 0;

            if (!hasRevisions && !hasHabits) {
              return null;
            }

            let score = 0;
            if (hasHabits) {
              const doneCount = hMatches.filter((h: any) => h.done).length;
              score = Math.round((doneCount / hMatches.length) * 100);
            } else if (sMatch && sMatch.due > 0) {
              const rawCredit = ((sMatch.done * 1.0 - (sMatch.missed || 0) * 1.3) / sMatch.due) * 100;
              score = Math.max(0, Math.min(100, Math.round(rawCredit)));
            } else if (sMatch && sMatch.topicsRead > 0) {
              score = 100;
            }

            return {
              studyDayKey: d.studyDayKey,
              overallScore: score,
              habitScore: score,
              taskScore: score,
              revisionScore: score,
            };
          }

          if (categoryFilter) {
            const cLower = categoryFilter.toLowerCase().trim();
            const hMatches = habitBreakdown.filter((h: any) => h.scheduled && (String(h.category || '').toLowerCase().trim() === cLower));
            const cMatch = categoryBreakdown.find((c: any) => String(c.category || '').toLowerCase().trim() === cLower);

            const hasRevisions = cMatch && (cMatch.due > 0 || cMatch.done > 0 || cMatch.topicsRead > 0);
            const hasHabits = hMatches.length > 0;

            if (!hasRevisions && !hasHabits) {
              return null;
            }

            let score = 0;
            if (hasHabits) {
              const doneCount = hMatches.filter((h: any) => h.done).length;
              score = Math.round((doneCount / hMatches.length) * 100);
            } else if (cMatch && cMatch.due > 0) {
              const rawCredit = ((cMatch.done * 1.0 - (cMatch.missed || 0) * 1.3) / cMatch.due) * 100;
              score = Math.max(0, Math.min(100, Math.round(rawCredit)));
            } else if (cMatch && cMatch.topicsRead > 0) {
              score = 100;
            }

            return {
              studyDayKey: d.studyDayKey,
              overallScore: score,
              habitScore: score,
              taskScore: score,
              revisionScore: score,
            };
          }

          return {
            studyDayKey: d.studyDayKey,
            overallScore: d.finalConsistencyScore,
            habitScore: Math.round(d.habitsCompletionRatio * 100),
            taskScore: d.finalConsistencyScore,
            revisionScore: d.finalConsistencyScore,
          };
        })
        .filter(Boolean);

      return NextResponse.json({
        range: 'month',
        monthKey,
        monthName: getMonthName(monthKey),
        overallScore,
        habitScore: overallScore,
        taskScore: overallScore,
        revisionScore: overallScore,
        grade: getGradeLabel(overallScore),
        trend,
        habits: updatedHabitsList,
        categories: categoriesList,
        subjects: subjectsList,
        calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    const monthlyDocs = await prisma.monthlySnapshot.findMany({
      where: { userId: effectiveUserId },
      orderBy: { monthKey: 'asc' },
    });

    const overallScore = allTimeDoc?.overallConsistencyScore || 0;

    const trend = monthlyDocs.map((m) => ({
      studyDayKey: m.monthKey,
      overallScore: m.avgConsistencyScore,
      habitScore: m.avgConsistencyScore,
      taskScore: m.avgConsistencyScore,
      revisionScore: m.avgConsistencyScore,
    }));

    return NextResponse.json({
      range: 'alltime',
      overallScore,
      habitScore: overallScore,
      taskScore: overallScore,
      revisionScore: overallScore,
      grade: getGradeLabel(overallScore),
      trend,
      habits: habitsList,
      categories: categoriesList,
      subjects: subjectsList,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error('Error in consistency API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
