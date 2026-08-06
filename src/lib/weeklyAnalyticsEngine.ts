import prisma from "@/lib/prisma";

export function getStudyDayKey(d: Date = new Date()): string {
  const adjusted = new Date(d);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const y = adjusted.getFullYear();
  const m = String(adjusted.getMonth() + 1).padStart(2, "0");
  const day = String(adjusted.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekRange(d: Date = new Date()) {
  const now = new Date(d);
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMon);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
}

export function getWeekKey(d: Date = new Date()): string {
  const { start, end } = getWeekRange(d);
  const startKey = getStudyDayKey(start);
  const endKey = getStudyDayKey(end);
  return `${startKey}_to_${endKey}`;
}

export function formatWeekLabel(weekKey: string): string {
  const [startStr, endStr] = weekKey.split("_to_");
  if (!startStr || !endStr) return weekKey;

  const startDate = new Date(startStr + "T00:00:00");
  const endDate = new Date(endStr + "T00:00:00");

  const startFormatted = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFormatted = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const yearStr = endDate.getFullYear();

  return weekKey === getWeekKey(new Date())
    ? `This Week (${startFormatted} – ${endFormatted})`
    : `${startFormatted} – ${endFormatted}, ${yearStr}`;
}

export async function getEffectiveUserId(userId?: string): Promise<string> {
  return userId || "";
}

export function formatMinutes(totalMins: number): string {
  const roundedMins = Math.round(totalMins);
  if (roundedMins < 60) {
    return `${roundedMins} mins`;
  }
  const hrs = Math.floor(roundedMins / 60);
  const remMins = roundedMins % 60;
  if (remMins === 0) {
    return `${hrs} ${hrs === 1 ? "hr" : "hrs"}`;
  }
  return `${hrs} ${hrs === 1 ? "hr" : "hrs"} ${remMins} mins`;
}

export function isHabitScheduledOnDate(h: any, dayKey: string): boolean {
  if (h.startDate && h.startDate > dayKey) return false;
  if (h.endDate && h.endDate < dayKey) return false;

  const freq = typeof h.frequency === "object" && h.frequency !== null ? (h.frequency as any) : {};
  const mode = freq.mode || "daily";

  if (mode === "daily" || mode === "everyday") return true;

  if (mode === "once") return h.startDate === dayKey;

  if (mode === "specific_days" || mode === "specific" || mode === "weekly") {
    const days = freq.days || [];
    if (days.length === 0) return true;
    const dayObj = new Date(dayKey + "T00:00:00");
    const dayShort = dayObj.toLocaleString("en-US", { weekday: "short" }).toLowerCase();
    const dayFull = dayObj.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    return days.some((d: any) => {
      const lowerD = String(d).toLowerCase().trim();
      return lowerD === dayShort || lowerD === dayFull || lowerD.startsWith(dayShort) || dayShort.startsWith(lowerD);
    });
  }

  if (mode === "monthly") {
    const dayObj = new Date(dayKey + "T00:00:00");
    const targetDay = freq.monthlyDay || 1;
    return dayObj.getDate() === targetDay;
  }

  return true;
}

function isTimeBasedActivity(h: any): boolean {
  const targetObj = typeof h.target === "object" && h.target !== null ? (h.target as any) : {};
  const unit = (targetObj.unit || "").toLowerCase().trim();
  return ["hrs", "hr", "hours", "hour", "mins", "min", "minutes", "minute"].includes(unit);
}

function getHabitItemHours(h: any, entry: any): number {
  if (!isTimeBasedActivity(h)) return 0;

  const targetObj = typeof h.target === "object" && h.target !== null ? (h.target as any) : {};
  const unit = (targetObj.unit || "").toLowerCase().trim();
  const val = Number(entry?.value || 0);

  if (val <= 0 && entry?.status !== "done") return 0;

  const effectiveVal = val > 0 ? val : entry?.status === "done" ? Number(targetObj.value || 0) : 0;

  if (["hrs", "hr", "hours", "hour"].includes(unit)) return effectiveVal;
  if (["mins", "min", "minutes", "minute"].includes(unit)) return effectiveVal / 60;

  return 0;
}

const INVALID_SUBJECT_NAMES = new Set([
  "study",
  "general",
  "gs1",
  "gs2",
  "gs3",
  "gs4",
  "csat",
  "reading",
  "revision",
  "task",
  "habit",
  "uncategorized",
]);

function resolveValidSubject(
  rawSubj: string | undefined,
  title: string | undefined,
  validSyllabusSubjects: string[],
): string | null {
  const cleanSubj = (rawSubj || "").trim();
  if (cleanSubj && !INVALID_SUBJECT_NAMES.has(cleanSubj.toLowerCase())) return cleanSubj;

  if (title && title.includes(":")) {
    const candidate = title.split(":")[0].trim();
    if (candidate && !INVALID_SUBJECT_NAMES.has(candidate.toLowerCase())) return candidate;
  }

  if (title) {
    const cleanTitle = title.replace(/^\[R[123]\s+Revision\]\s*/i, "").trim();
    const matched = validSyllabusSubjects.find((s) => cleanTitle.toLowerCase().includes(s.toLowerCase()));
    if (matched) return matched;

    if (cleanTitle && !INVALID_SUBJECT_NAMES.has(cleanTitle.toLowerCase())) {
      return cleanTitle;
    }
  }

  return null;
}

export async function calculateAndSaveWeeklyData(
  userId?: string,
  targetDate: Date = new Date(),
  customStart?: string,
  customEnd?: string,
) {
  const effectiveUserId = await getEffectiveUserId(userId);
  let weekKey: string;
  const dayKeys: string[] = [];
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData: Array<{ day: string; dateKey: string; hours: number; tasksCount: number; target: number }> = [];

  if (customStart && customEnd) {
    weekKey = `${customStart}_to_${customEnd}`;
    const startD = new Date(customStart + "T00:00:00");
    const endD = new Date(customEnd + "T00:00:00");
    const diffDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 3600 * 24)) + 1);

    for (let i = 0; i < diffDays; i++) {
      const d = new Date(startD);
      d.setDate(startD.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dayKey = `${y}-${m}-${day}`;
      dayKeys.push(dayKey);

      const dayLabel = d.toLocaleString("en-US", { weekday: "short" });
      weeklyData.push({
        day: dayLabel,
        dateKey: dayKey,
        hours: 0,
        tasksCount: 0,
        target: 8.0,
      });
    }
  } else {
    weekKey = getWeekKey(targetDate);
    const dayOfWeek = targetDate.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + diffToMon);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
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
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-purple-500",
    "bg-blue-500",
  ];

  habits.forEach((h, idx) => {
    if (h.type === "habit") {
      const targetObj = typeof h.target === "object" && h.target !== null ? (h.target as any) : {};
      const unit = (targetObj.unit || "times").trim();
      const val = typeof targetObj.value === "number" && targetObj.value > 0 ? targetObj.value : null;

      const scheduledDaysCount = dayKeys.filter((dk) => isHabitScheduledOnDate(h, dk)).length;

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
    ]),
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

      if (entry && (entry.status === "done" || (entry.value && entry.value > 0))) {
        if (entry.status === "done") {
          dayTasksCount++;
          totalTasksDone++;
        }

        if (habitStatsMap[hId]) {
          const val = entry.value || 1;
          habitStatsMap[hId].totalValue += val;
          if (entry.status === "done") {
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
                subjectHoursMap[subj] = {
                  subject: subj,
                  hours: 0,
                  color: colors[Object.keys(subjectHoursMap).length % colors.length],
                };
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
    const freq = typeof h.frequency === "object" && h.frequency !== null ? (h.frequency as any) : {};
    if (freq.mode === "once" || h.type === "event") return false;
    const stats = habitStatsMap[h.id];
    if (!stats) return false;
    // Only include habits scheduled for this week or with logged progress
    return stats.scheduledDaysCount > 0 || stats.completedDays > 0 || stats.totalValue > 0;
  });
  const totalHabitsCount = recurringHabits.length;
  let totalPointsEarned = 0;
  let totalPossiblePoints = totalHabitsCount * 100;
  let consistencyPct = 0;

  if (totalHabitsCount > 0) {
    recurringHabits.forEach((h: any) => {
      const stats = habitStatsMap[h.id];
      if (!stats) return;

      const unitLower = (stats.unit || "").toLowerCase().trim();
      let habitPct = 0;
      const effectiveScheduledDays = Math.max(1, stats.scheduledDaysCount);

      if (unitLower === "time" || h.target?.targetTime || /wake\s*up/i.test(h.title || "")) {
        const history = Array.isArray(h.history) ? h.history : [];
        let habitWakeUpPtsSum = 0;
        dayKeys.forEach((dk) => {
          if (isHabitScheduledOnDate(h, dk)) {
            const entry = history.find((e: any) => e.date === dk);
            if (entry) {
              if (typeof entry.pts === "number") {
                habitWakeUpPtsSum += entry.pts;
              } else if (entry.status === "done") {
                habitWakeUpPtsSum += 100;
              }
            }
          }
        });
        const maxPossibleWakePts = effectiveScheduledDays * 100;
        habitPct = maxPossibleWakePts > 0 ? (habitWakeUpPtsSum / maxPossibleWakePts) * 100 : 0;
      } else if (["yes_no", "boolean"].includes(unitLower) || !stats.targetValue) {
        habitPct = (stats.completedDays / effectiveScheduledDays) * 100;
      } else {
        const weeklyTarget = stats.targetValue * effectiveScheduledDays;
        if (weeklyTarget > 0) {
          habitPct = (stats.totalValue / weeklyTarget) * 100;
        }
      }

      // Each habit target is worth 100 points maximum
      const habitPoints = Math.min(100, Math.max(0, habitPct));
      totalPointsEarned += habitPoints;
    });

    totalPointsEarned = Number(totalPointsEarned.toFixed(1));
    consistencyPct = Number((totalPointsEarned / totalHabitsCount).toFixed(1));
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
    .filter((h) => h.scheduledDaysCount > 0 || h.completedDays > 0 || h.totalValue > 0)
    .map((h) => {
      const unitLower = h.unit.toLowerCase();
      let formattedVal = "";
      let pct = 0;
      const effectiveScheduledDays = Math.max(1, h.scheduledDaysCount);

      if (["yes_no", "boolean"].includes(unitLower) || h.targetValue === null) {
        formattedVal = `${h.completedDays} / ${effectiveScheduledDays} days`;
        pct = Math.min(100, Math.round((h.completedDays / effectiveScheduledDays) * 100));
      } else if (["hrs", "hr", "hours", "hour"].includes(unitLower)) {
        const weeklyTargetHours = h.targetValue * effectiveScheduledDays;
        const loggedMins = Math.round(h.totalValue * 60);
        const weeklyTargetMins = Math.round(weeklyTargetHours * 60);
        formattedVal = `${formatMinutes(loggedMins)} / ${formatMinutes(weeklyTargetMins)}`;
        pct = Math.min(100, Math.round((h.totalValue / Math.max(0.1, weeklyTargetHours)) * 100));
      } else if (["mins", "min", "minutes", "minute"].includes(unitLower)) {
        const weeklyTargetMins = h.targetValue * effectiveScheduledDays;
        const loggedMins = h.totalValue;
        formattedVal = `${formatMinutes(loggedMins)} / ${formatMinutes(weeklyTargetMins)}`;
        pct = Math.min(100, Math.round((h.totalValue / Math.max(1, weeklyTargetMins)) * 100));
      } else {
        const weeklyTarget = h.targetValue * effectiveScheduledDays;
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
    totalPointsEarned,
    totalPossiblePoints,
    totalHabitsCount,
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

export async function getLatestWeeklyData(userId?: string, targetDate: Date = new Date()) {
  const effectiveUserId = await getEffectiveUserId(userId);
  const weekKey = getWeekKey(targetDate);

  let weeklyDoc = await prisma.weeklyData.findUnique({
    where: {
      userId_weekKey: {
        userId: effectiveUserId,
        weekKey,
      },
    },
  });

  if (!weeklyDoc) {
    weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId, targetDate);
  }
  return weeklyDoc;
}

export async function getAllAvailableWeeks(userId?: string) {
  const effectiveUserId = await getEffectiveUserId(userId);
  const currentWeekKey = getWeekKey(new Date());

  const docs = await prisma.weeklyData.findMany({
    where: { userId: effectiveUserId },
    select: { weekKey: true, updatedAt: true },
    orderBy: { weekKey: "desc" },
  });

  const weekKeySet = new Set(docs.map((d) => d.weekKey));
  weekKeySet.add(currentWeekKey);

  // Auto-include up to 12 historical past weeks
  const now = new Date();
  for (let offset = 0; offset >= -12; offset--) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset * 7);
    weekKeySet.add(getWeekKey(d));
  }

  const sortedKeys = Array.from(weekKeySet).sort().reverse();

  return sortedKeys.map((wk) => {
    return {
      weekKey: wk,
      label: formatWeekLabel(wk),
      startDate: wk.split("_to_")[0],
      endDate: wk.split("_to_")[1],
      isCurrent: wk === currentWeekKey,
    };
  });
}
