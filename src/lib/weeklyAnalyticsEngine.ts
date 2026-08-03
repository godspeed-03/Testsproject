import prisma from '@/lib/prisma';

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

export function getWeekKey(d: Date = new Date()): string {
  const now = new Date(d);
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const monKey = getStudyDayKey(mon);
  const sunKey = getStudyDayKey(sun);
  return `${monKey}_to_${sunKey}`;
}

export async function getEffectiveUserId(userId?: string): Promise<string> {
  return userId || '';
}

export function formatMinutes(totalMins: number): string {
  const roundedMins = Math.round(totalMins);
  if (roundedMins < 60) {
    return `${roundedMins} mins`;
  }
  const hrs = Math.floor(roundedMins / 60);
  const remMins = roundedMins % 60;
  if (remMins === 0) {
    return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
  }
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${remMins} mins`;
}

export function isHabitScheduledOnDate(h: any, dayKey: string): boolean {
  if (h.startDate && h.startDate > dayKey) return false;
  if (h.endDate && h.endDate < dayKey) return false;

  const freq = typeof h.frequency === 'object' && h.frequency !== null ? (h.frequency as any) : {};
  const mode = freq.mode || 'daily';

  if (mode === 'daily' || mode === 'everyday') return true;

  if (mode === 'once') return h.startDate === dayKey;

  if (mode === 'specific_days' || mode === 'specific' || mode === 'weekly') {
    const days = freq.days || [];
    if (days.length === 0) return true;
    const dayObj = new Date(dayKey + 'T00:00:00');
    const dayShort = dayObj.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
    const dayFull = dayObj.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    return days.some((d: any) => {
      const lowerD = String(d).toLowerCase().trim();
      return lowerD === dayShort || lowerD === dayFull || lowerD.startsWith(dayShort) || dayShort.startsWith(lowerD);
    });
  }

  if (mode === 'monthly') {
    const dayObj = new Date(dayKey + 'T00:00:00');
    const targetDay = freq.monthlyDay || 1;
    return dayObj.getDate() === targetDay;
  }

  return true;
}

function isTimeBasedActivity(h: any): boolean {
  const targetObj = typeof h.target === 'object' && h.target !== null ? (h.target as any) : {};
  const unit = (targetObj.unit || '').toLowerCase().trim();
  return ['hrs', 'hr', 'hours', 'hour', 'mins', 'min', 'minutes', 'minute'].includes(unit);
}

function getHabitItemHours(h: any, entry: any): number {
  if (!isTimeBasedActivity(h)) return 0;

  const targetObj = typeof h.target === 'object' && h.target !== null ? (h.target as any) : {};
  const unit = (targetObj.unit || '').toLowerCase().trim();
  const val = Number(entry?.value || 0);

  if (val <= 0 && entry?.status !== 'done') return 0;

  const effectiveVal = val > 0 ? val : (entry?.status === 'done' ? Number(targetObj.value || 0) : 0);

  if (['hrs', 'hr', 'hours', 'hour'].includes(unit)) return effectiveVal;
  if (['mins', 'min', 'minutes', 'minute'].includes(unit)) return effectiveVal / 60;

  return 0;
}

const INVALID_SUBJECT_NAMES = new Set(['study', 'general', 'gs1', 'gs2', 'gs3', 'gs4', 'csat', 'reading', 'revision', 'task', 'habit', 'uncategorized']);

function resolveValidSubject(rawSubj: string | undefined, title: string | undefined, validSyllabusSubjects: string[]): string | null {
  const cleanSubj = (rawSubj || '').trim();
  if (cleanSubj && !INVALID_SUBJECT_NAMES.has(cleanSubj.toLowerCase())) return cleanSubj;

  if (title && title.includes(':')) {
    const candidate = title.split(':')[0].trim();
    if (candidate && !INVALID_SUBJECT_NAMES.has(candidate.toLowerCase())) return candidate;
  }

  if (title) {
    const cleanTitle = title.replace(/^\[R[123]\s+Revision\]\s*/i, '').trim();
    const matched = validSyllabusSubjects.find((s) => cleanTitle.toLowerCase().includes(s.toLowerCase()));
    if (matched) return matched;

    if (cleanTitle && !INVALID_SUBJECT_NAMES.has(cleanTitle.toLowerCase())) {
      return cleanTitle;
    }
  }

  return null;
}

export async function calculateAndSaveWeeklyData(userId?: string) {
  const effectiveUserId = await getEffectiveUserId(userId);
  const now = new Date();
  const weekKey = getWeekKey(now);

  // Find Monday of current calendar week
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const dayKeys: string[] = [];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData: Array<{ day: string; dateKey: string; hours: number; tasksCount: number; target: number }> = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayKey = `${y}-${m}-${day}`;
    dayKeys.push(dayKey);
    weeklyData.push({
      day: daysOfWeek[i],
      dateKey: dayKey,
      hours: 0,
      tasksCount: 0,
      target: 8.0,
    });
  }

  const startDate = dayKeys[0];
  const endDate = dayKeys[dayKeys.length - 1];

  const [dailyDocs, habits, syllabusItems, topicRevisions] = await Promise.all([
    prisma.dailySnapshot.findMany({
      where: { userId: effectiveUserId, studyDayKey: { in: dayKeys } },
    }),
    prisma.habitItem.findMany({ where: { userId: effectiveUserId } }),
    prisma.syllabusItem.findMany({ where: { userId: effectiveUserId } }),
    prisma.topicRevision.findMany({ where: { userId: effectiveUserId } }),
  ]);

  let totalTasksDone = 0;
  const habitStatsMap: Record<
    string,
    {
      title: string;
      unit: string;
      targetValue: number | null;
      scheduledDaysCount: number;
      totalValue: number;
      completedDays: number;
      color: string;
    }
  > = {};
  const subjectHoursMap: Record<string, { subject: string; hours: number; color: string }> = {};
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500', 'bg-blue-500'];

  habits.forEach((h, idx) => {
    if (h.type === 'habit') {
      const targetObj = typeof h.target === 'object' && h.target !== null ? (h.target as any) : {};
      const unit = (targetObj.unit || 'times').trim();
      const val = typeof targetObj.value === 'number' && targetObj.value > 0 ? targetObj.value : null;

      const scheduledDaysCount = dayKeys.filter((dk) => isHabitScheduledOnDate(h, dk)).length || 1;

      habitStatsMap[h.id] = {
        title: h.title,
        unit,
        targetValue: val,
        scheduledDaysCount,
        totalValue: 0,
        completedDays: 0,
        color: colors[idx % colors.length],
      };
    }
  });

  const validSyllabusSubjects = Array.from(
    new Set([
      ...syllabusItems.map((s) => s.subject).filter(Boolean),
      ...topicRevisions.map((t) => t.subject).filter(Boolean),
    ])
  ).filter((s) => !INVALID_SUBJECT_NAMES.has(s.toLowerCase()));

  validSyllabusSubjects.forEach((subj, idx) => {
    subjectHoursMap[subj] = {
      subject: subj,
      hours: 0,
      color: colors[idx % colors.length],
    };
  });

  weeklyData.forEach((dayObj) => {
    const dKey = dayObj.dateKey;
    let dayEstimatedHours = 0;
    let dayTasksCount = 0;

    habits.forEach((h: any) => {
      const hId = h.id;
      const history = Array.isArray(h.history) ? h.history : [];
      const entry = history.find((e: any) => e.date === dKey);

      if (entry && (entry.status === 'done' || (entry.value && entry.value > 0))) {
        if (entry.status === 'done') {
          dayTasksCount++;
          totalTasksDone++;
        }

        if (habitStatsMap[hId]) {
          const val = entry.value || 1;
          habitStatsMap[hId].totalValue += val;
          if (entry.status === 'done') {
            habitStatsMap[hId].completedDays += 1;
          }
        }

        if (isTimeBasedActivity(h)) {
          const itemHours = getHabitItemHours(h, entry);
          if (itemHours > 0) {
            dayEstimatedHours += itemHours;

            const subj = resolveValidSubject(h.subject || undefined, h.title, validSyllabusSubjects);
            if (subj) {
              if (!subjectHoursMap[subj]) {
                subjectHoursMap[subj] = { subject: subj, hours: 0, color: colors[Object.keys(subjectHoursMap).length % colors.length] };
              }
              subjectHoursMap[subj].hours += itemHours;
            }
          }
        }
      }
    });

    // dayTasksCount and totalTasksDone are accurately counted from habits collection above

    dayObj.hours = Number(dayEstimatedHours.toFixed(1));
    dayObj.tasksCount = dayTasksCount;
  });

  const weeklyTotalHours = Number(weeklyData.reduce((acc, d) => acc + d.hours, 0).toFixed(1));
  const dailyAverageHours = Number((weeklyTotalHours / 7).toFixed(1));

  const recurringHabits = habits.filter((h: any) => {
    const freq = typeof h.frequency === 'object' && h.frequency !== null ? (h.frequency as any) : {};
    return freq.mode !== 'once' && h.type !== 'event';
  });
  const totalHabitsCount = recurringHabits.length;
  let consistentHabitsCount = 0;
  let consistencyPct = 0;

  if (totalHabitsCount > 0) {
    recurringHabits.forEach((h: any) => {
      let completedDaysInWeek = 0;
      weeklyData.forEach((dayObj) => {
        const dKey = dayObj.dateKey;
        const history = Array.isArray(h.history) ? h.history : [];
        const entry = history.find((e: any) => e.date === dKey);
        if (entry && entry.status === 'done') {
          completedDaysInWeek++;
        }
      });

      if (completedDaysInWeek >= 2) {
        consistentHabitsCount++;
      }
    });

    const weightPerHabit = 100 / totalHabitsCount;
    consistencyPct = Number((consistentHabitsCount * weightPerHabit).toFixed(1));
  } else {
    const activeStudyDays = weeklyData.filter((d) => d.hours > 0 || d.tasksCount > 0).length;
    consistencyPct = Number(((activeStudyDays / 7) * 100).toFixed(1));
  }

  const totalSubjHours = Object.values(subjectHoursMap).reduce((acc, s) => acc + s.hours, 0) || 1;
  const subjectDistribution = Object.values(subjectHoursMap)
    .filter((s) => s.hours > 0)
    .map((s) => ({
      subject: s.subject,
      hours: `${s.hours.toFixed(1)} hrs`,
      pct: Math.round((s.hours / totalSubjHours) * 100) || 0,
      color: s.color,
    }))
    .sort((a, b) => b.pct - a.pct);

  const habitDistribution = Object.values(habitStatsMap)
    .map((h) => {
      const unitLower = h.unit.toLowerCase();
      let formattedVal = '';
      let pct = 0;

      if (['yes_no', 'boolean'].includes(unitLower) || h.targetValue === null) {
        formattedVal = `${h.completedDays} / ${h.scheduledDaysCount} days`;
        pct = Math.min(100, Math.round((h.completedDays / Math.max(1, h.scheduledDaysCount)) * 100));
      } else if (['hrs', 'hr', 'hours', 'hour'].includes(unitLower)) {
        const weeklyTargetHours = h.targetValue * h.scheduledDaysCount;
        const loggedMins = Math.round(h.totalValue * 60);
        const weeklyTargetMins = Math.round(weeklyTargetHours * 60);
        formattedVal = `${formatMinutes(loggedMins)} / ${formatMinutes(weeklyTargetMins)}`;
        pct = Math.min(100, Math.round((h.totalValue / Math.max(0.1, weeklyTargetHours)) * 100));
      } else if (['mins', 'min', 'minutes', 'minute'].includes(unitLower)) {
        const weeklyTargetMins = h.targetValue * h.scheduledDaysCount;
        const loggedMins = h.totalValue;
        formattedVal = `${formatMinutes(loggedMins)} / ${formatMinutes(weeklyTargetMins)}`;
        pct = Math.min(100, Math.round((h.totalValue / Math.max(1, weeklyTargetMins)) * 100));
      } else {
        const weeklyTarget = h.targetValue * h.scheduledDaysCount;
        formattedVal = `${h.totalValue} / ${weeklyTarget} ${h.unit}`;
        pct = Math.min(100, Math.round((h.totalValue / Math.max(0.1, weeklyTarget)) * 100));
      }

      return {
        subject: h.title,
        hours: formattedVal,
        pct,
        color: h.color,
      };
    })
    .sort((a, b) => b.pct - a.pct);

  const breakdown = {
    weeklyTotalHours,
    dailyAverageHours,
    consistencyPct,
    totalTasksDone,
    weeklyData,
    subjectDistribution,
    habitDistribution,
  };

  const weeklyDoc = await prisma.weeklyData.upsert({
    where: {
      userId_weekKey: {
        userId: effectiveUserId,
        weekKey,
      },
    },
    update: {
      totalHours: weeklyTotalHours,
      weeklyScore: consistencyPct,
      completedTopicsCount: totalTasksDone,
      breakdown,
    },
    create: {
      userId: effectiveUserId,
      weekKey,
      totalHours: weeklyTotalHours,
      weeklyScore: consistencyPct,
      completedTopicsCount: totalTasksDone,
      breakdown,
    },
  });

  return weeklyDoc;
}

export async function getLatestWeeklyData(userId?: string) {
  const effectiveUserId = await getEffectiveUserId(userId);
  const weekKey = getWeekKey();

  let weeklyDoc = await prisma.weeklyData.findUnique({
    where: {
      userId_weekKey: {
        userId: effectiveUserId,
        weekKey,
      },
    },
  });

  if (!weeklyDoc) {
    weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId);
  }
  return weeklyDoc;
}
