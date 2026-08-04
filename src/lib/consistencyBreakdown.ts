import prisma from '@/lib/prisma';

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
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { current: currentStreak, best: bestStreak };
}

/**
 * Computes a per-habit, per-subject and per-category consistency score
 * ("consistency score for each thing"). Mirrors the base logic used by
 * /api/tracker/consistency so the PDF report matches the in-app numbers.
 */
export async function computeConsistencyBreakdown(userId: string) {
  const [allHabits, syllabusItems, topicRevisions] = await Promise.all([
    prisma.habitItem.findMany({ where: { userId } }),
    prisma.syllabusItem.findMany({ where: { userId } }),
    prisma.topicRevision.findMany({ where: { userId } }),
  ]);

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

  const todayStr = new Date().toISOString().split('T')[0];
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
    return { ...s, score };
  });

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
    return { ...c, score };
  });

  return { habitsList, subjectsList, categoriesList };
}
