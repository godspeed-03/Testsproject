import prisma from '@/lib/prisma';

// Tuning constants as per spec
const W_DONE = 1.0;
const W_MISS = 1.3;
const REVISION_GRACE_DAYS = 1;

export function getStudyDayKey(d: Date = new Date()): string {
  const adjusted = new Date(d);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const y = adjusted.getFullYear();
  const m = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMonthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getMonthName(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export async function getEffectiveUserId(userId?: string): Promise<string> {
  if (userId && userId !== '000000000000000000000000') return userId;
  return userId || '000000000000000000000000';
}

// 1. Recalculate Atomic DailySnapshot
export async function recalculateDailySnapshot(userId: string, studyDayKey?: string) {
  const effectiveUserId = await getEffectiveUserId(userId);
  const dayKey = studyDayKey || getStudyDayKey();
  const monthKey = dayKey.substring(0, 7);

  // Fetch all habits, topic revisions & syllabus items concurrently from DB
  const [habits, topicRevisions, syllabusItems] = await Promise.all([
    prisma.habitItem.findMany({ where: { userId: effectiveUserId } }),
    prisma.topicRevision.findMany({ where: { userId: effectiveUserId } }),
    prisma.syllabusItem.findMany({ where: { userId: effectiveUserId } }),
  ]);

  const habitItems = habits.filter((h: any) => {
    const freq = typeof h.frequency === 'object' && h.frequency !== null ? (h.frequency as any) : {};
    return freq.mode !== 'once';
  });

  const taskItems = habits.filter((h: any) => {
    const freq = typeof h.frequency === 'object' && h.frequency !== null ? (h.frequency as any) : {};
    return h.type === 'task' && freq.mode !== 'once';
  });

  // A. Daily Habit Score
  let habitSchedCount = 0;
  let habitDoneCount = 0;
  const habitBreakdown: any[] = [];

  habitItems.forEach((h: any) => {
    if (h.startDate && h.startDate > dayKey) return;
    if (h.endDate && h.endDate < dayKey) return;

    const freq = typeof h.frequency === 'object' && h.frequency !== null ? (h.frequency as any) : {};
    const mode = freq.mode || 'daily';
    let isScheduled = true;

    if (mode === 'once') {
      isScheduled = h.startDate === dayKey;
    } else if (mode === 'specific_days' || mode === 'weekly') {
      const days = freq.days || [];
      if (days.length > 0) {
        const dayObj = new Date(dayKey + 'T00:00:00');
        const dayShort = dayObj.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
        const dayFull = dayObj.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        isScheduled = days.some((d: string) => {
          const lowerD = String(d).toLowerCase().trim();
          return lowerD === dayShort || lowerD === dayFull || lowerD.startsWith(dayShort) || dayShort.startsWith(lowerD);
        });
      }
    }

    const history = Array.isArray(h.history) ? h.history : [];
    const entry = history.find((e: any) => e.date === dayKey);
    const targetObj = typeof h.target === 'object' && h.target !== null ? (h.target as any) : {};
    const targetVal = targetObj.value;
    const unit = targetObj.unit;
    const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';

    const isDone = entry
      ? (entry.status === 'done' || (isNumericGoal && typeof entry.value === 'number' && entry.value >= targetVal))
      : false;

    if (isScheduled) {
      habitSchedCount++;
      if (isDone) habitDoneCount++;
    }

    const categoryObj = typeof h.category === 'object' && h.category !== null ? (h.category as any) : {};

    habitBreakdown.push({
      habitId: h.id,
      title: h.title,
      type: h.type || 'habit',
      icon: h.icon || (h.type === 'habit' ? '🏃' : '📚'),
      category: categoryObj.label || h.subject || 'General',
      subject: h.subject || categoryObj.label || 'General',
      scheduled: isScheduled,
      done: isDone,
      score: isScheduled ? (isDone ? 100 : 0) : 100,
    });
  });

  const habitScore = habitSchedCount > 0 ? Math.round((habitDoneCount / habitSchedCount) * 100) : -1;

  // B. Daily Task Score
  let taskSchedCount = 0;
  let taskDoneCount = 0;

  taskItems.forEach((h: any) => {
    if (h.startDate && h.startDate > dayKey) return;
    if (h.endDate && h.endDate < dayKey) return;

    taskSchedCount++;
    const history = Array.isArray(h.history) ? h.history : [];
    const entry = history.find((e: any) => e.date === dayKey);
    const isDone = entry ? entry.status === 'done' : false;
    if (isDone) taskDoneCount++;
  });

  const taskScore = taskSchedCount > 0 ? Math.round((taskDoneCount / taskSchedCount) * 100) : -1;

  // C. Daily Revision Score
  const categoryMap: Record<string, { due: number; done: number; missed: number; topicsRead: number }> = {};
  const subjectMap: Record<string, { due: number; done: number; missed: number; topicsRead: number; category: string }> = {};

  const dynamicCategories = Array.from(
    new Set([
      ...topicRevisions.map((tr) => tr.category).filter(Boolean),
      ...syllabusItems.map((si) => si.category).filter(Boolean),
    ])
  );
  if (dynamicCategories.length === 0) dynamicCategories.push('General');
  dynamicCategories.forEach((c) => {
    categoryMap[c] = { due: 0, done: 0, missed: 0, topicsRead: 0 };
  });

  const dynamicSubjects = Array.from(
    new Set([
      ...syllabusItems.map((si) => si.subject).filter(Boolean),
      ...topicRevisions.map((tr) => tr.subject).filter(Boolean),
    ])
  );
  if (dynamicSubjects.length === 0) dynamicSubjects.push('General');
  dynamicSubjects.forEach((s) => {
    const relatedSi = syllabusItems.find((si) => si.subject === s);
    const relatedTr = topicRevisions.find((tr) => tr.subject === s);
    subjectMap[s] = {
      due: 0,
      done: 0,
      missed: 0,
      topicsRead: 0,
      category: relatedSi?.category || relatedTr?.category || 'General',
    };
  });

  topicRevisions.forEach((tr: any) => {
    const cat = tr.category || 'General';
    const subj = tr.subject || 'General';

    if (!categoryMap[cat]) categoryMap[cat] = { due: 0, done: 0, missed: 0, topicsRead: 0 };
    if (!subjectMap[subj]) subjectMap[subj] = { due: 0, done: 0, missed: 0, topicsRead: 0, category: cat };

    if (tr.firstReadDate === dayKey) {
      categoryMap[cat].topicsRead++;
      subjectMap[subj].topicsRead++;
    }

    const revisionsArr = Array.isArray(tr.revisions) ? tr.revisions : [];
    revisionsArr.forEach((st: any) => {
      if (st.scheduledDate && st.scheduledDate <= dayKey && tr.firstReadDate && tr.firstReadDate <= st.scheduledDate) {
        categoryMap[cat].due++;
        subjectMap[subj].due++;

        if (st.completedDate && st.completedDate <= dayKey) {
          categoryMap[cat].done++;
          subjectMap[subj].done++;
        } else if (st.status === 'Done' || st.status === 'done' || st.status === 'Completed') {
          categoryMap[cat].done++;
          subjectMap[subj].done++;
        } else {
          const schedDateObj = new Date(st.scheduledDate + 'T00:00:00');
          schedDateObj.setDate(schedDateObj.getDate() + REVISION_GRACE_DAYS);
          const graceIso = schedDateObj.toISOString().split('T')[0];

          if (dayKey > graceIso) {
            categoryMap[cat].missed++;
            subjectMap[subj].missed++;
          }
        }
      }
    });
  });

  let totalRevDue = 0;
  let totalRevDone = 0;
  let totalRevMissed = 0;

  const categoryBreakdown: any[] = [];
  Object.keys(categoryMap).forEach((cat) => {
    const data = categoryMap[cat];
    totalRevDue += data.due;
    totalRevDone += data.done;
    totalRevMissed += data.missed;

    let catScore = 0;
    if (data.due > 0) {
      const rawCredit = ((data.done * W_DONE - data.missed * W_MISS) / data.due) * 100;
      catScore = Math.max(0, Math.min(100, Math.round(rawCredit)));
    }

    categoryBreakdown.push({
      category: cat,
      subject: cat,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: catScore,
      topicsReadToday: data.topicsRead,
    });
  });

  const subjectBreakdown: any[] = [];
  Object.keys(subjectMap).forEach((subj) => {
    const data = subjectMap[subj];
    let subjScore = 0;
    if (data.due > 0) {
      const rawCredit = ((data.done * W_DONE - data.missed * W_MISS) / data.due) * 100;
      subjScore = Math.max(0, Math.min(100, Math.round(rawCredit)));
    }

    subjectBreakdown.push({
      subject: subj,
      category: data.category,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: subjScore,
      topicsReadToday: data.topicsRead,
    });
  });

  let revisionScore = 0;
  if (totalRevDue > 0) {
    const overallRevCredit = ((totalRevDone * W_DONE - totalRevMissed * W_MISS) / totalRevDue) * 100;
    revisionScore = Math.max(0, Math.min(100, Math.round(overallRevCredit)));
  }

  let weightSum = 0;
  let scoreSum = 0;

  if (habitScore >= 0) {
    weightSum += 0.4;
    scoreSum += 0.4 * habitScore;
  }
  if (taskScore >= 0) {
    weightSum += 0.3;
    scoreSum += 0.3 * taskScore;
  }
  if (totalRevDue > 0) {
    weightSum += 0.3;
    scoreSum += 0.3 * revisionScore;
  }

  const finalOverallScore = weightSum > 0 ? Math.round(scoreSum / weightSum) : 0;
  const finalHabitScore = habitScore >= 0 ? habitScore : 0;
  const finalTaskScore = taskScore >= 0 ? taskScore : 0;

  const detailedBreakdown = {
    habitScore: finalHabitScore,
    taskScore: finalTaskScore,
    revisionScore,
    overallScore: finalOverallScore,
    habitBreakdown,
    categoryBreakdown,
    subjectBreakdown,
    calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const dailyDoc = await prisma.dailySnapshot.upsert({
    where: {
      userId_studyDayKey: {
        userId: effectiveUserId,
        studyDayKey: dayKey,
      },
    },
    update: {
      monthKey,
      rawConsistencyScore: finalOverallScore,
      finalConsistencyScore: finalOverallScore,
      habitsCompletionRatio: finalHabitScore / 100,
      detailedBreakdown,
    },
    create: {
      userId: effectiveUserId,
      studyDayKey: dayKey,
      monthKey,
      rawConsistencyScore: finalOverallScore,
      finalConsistencyScore: finalOverallScore,
      habitsCompletionRatio: finalHabitScore / 100,
      detailedBreakdown,
    },
  });

  return dailyDoc;
}

// 2. Recalculate MonthlySnapshot
export async function recalculateMonthlySnapshot(userId: string, monthKey?: string) {
  const effectiveUserId = await getEffectiveUserId(userId);
  const mKey = monthKey || getMonthKey();

  const todayKey = getStudyDayKey();
  const currentMonthKeyStr = getMonthKey();
  const [yearNum, monthNum] = mKey.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

  let maxDay = daysInMonth;
  if (mKey === currentMonthKeyStr) {
    const todayDayNum = Number(todayKey.split('-')[2]);
    maxDay = Math.min(daysInMonth, todayDayNum);
  }

  const dayKeysSet = new Set<string>();
  for (let d = 1; d <= maxDay; d++) {
    const dayStr = String(d).padStart(2, '0');
    dayKeysSet.add(`${mKey}-${dayStr}`);
  }

  const habitItems = await prisma.habitItem.findMany({ where: { userId: effectiveUserId } });
  habitItems.forEach((h: any) => {
    const history = Array.isArray(h.history) ? h.history : [];
    history.forEach((e: any) => {
      if (e.date && e.date.startsWith(mKey)) {
        dayKeysSet.add(e.date);
      }
    });
  });

  const sortedDayKeys = Array.from(dayKeysSet).sort();
  await Promise.all(sortedDayKeys.map((dayKey) => recalculateDailySnapshot(effectiveUserId, dayKey)));

  const dailyDocs = await prisma.dailySnapshot.findMany({
    where: { userId: effectiveUserId, monthKey: mKey },
    orderBy: { studyDayKey: 'asc' },
  });

  const daysWithData = dailyDocs.length || 1;
  const sumOverall = dailyDocs.reduce((acc, d) => acc + d.finalConsistencyScore, 0);

  const overallScore = Math.round(sumOverall / daysWithData);

  const monthlyDoc = await prisma.monthlySnapshot.upsert({
    where: {
      userId_monthKey: {
        userId: effectiveUserId,
        monthKey: mKey,
      },
    },
    update: {
      avgConsistencyScore: overallScore,
      activeDaysCount: daysWithData,
    },
    create: {
      userId: effectiveUserId,
      monthKey: mKey,
      avgConsistencyScore: overallScore,
      activeDaysCount: daysWithData,
    },
  });

  return monthlyDoc;
}

// 3. Recalculate AllTimeSnapshot
export async function recalculateAllTimeSnapshot(userId: string) {
  const effectiveUserId = await getEffectiveUserId(userId);

  const monthlyDocs = await prisma.monthlySnapshot.findMany({ where: { userId: effectiveUserId } });
  if (monthlyDocs.length === 0) {
    await recalculateMonthlySnapshot(effectiveUserId);
    return await prisma.allTimeSnapshot.findUnique({ where: { userId: effectiveUserId } });
  }

  let totalDays = 0;
  let weightedOverallSum = 0;

  monthlyDocs.forEach((m) => {
    const weight = Math.max(1, m.activeDaysCount);
    totalDays += weight;
    weightedOverallSum += m.avgConsistencyScore * weight;
  });

  const overallScore = totalDays > 0 ? Math.round(weightedOverallSum / totalDays) : 0;

  const allTimeDoc = await prisma.allTimeSnapshot.upsert({
    where: { userId: effectiveUserId },
    update: {
      overallConsistencyScore: overallScore,
      totalDaysLogged: totalDays,
    },
    create: {
      userId: effectiveUserId,
      overallConsistencyScore: overallScore,
      totalDaysLogged: totalDays,
    },
  });

  return allTimeDoc;
}

// 4. Combined Full Pipeline Trigger
export async function runFullConsistencyPipeline(userId: string) {
  const daily = await recalculateDailySnapshot(userId);
  const monthly = await recalculateMonthlySnapshot(userId);
  const allTime = await recalculateAllTimeSnapshot(userId);
  return { daily, monthly, allTime };
}
