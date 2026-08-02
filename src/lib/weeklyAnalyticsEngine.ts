import connectToDatabase from '@/lib/mongodb';
import WeeklyData from '@/models/WeeklyData';
import HabitItem from '@/models/HabitItem';
import TopicRevision from '@/models/TopicRevision';
import SyllabusItem from '@/models/SyllabusItem';
import DailySnapshot from '@/models/DailySnapshot';

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
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Mon
  const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const monKey = getStudyDayKey(mon);
  const sunKey = getStudyDayKey(sun);
  return `${monKey}_to_${sunKey}`;
}

export async function getEffectiveUserId(userId?: string): Promise<string> {
  if (userId && userId !== '000000000000000000000000') return userId;
  return userId || '000000000000000000000000';
}

/**
 * Checks if a habit/task represents a study session or time-based activity.
 * Non-time habits (e.g. Water in liters, Gym with yes_no or times) are excluded from study hours.
 */
function isTimeBasedActivity(h: any): boolean {
  if (h.isStudyTask) return true;

  const unit = (h.target?.unit || '').toLowerCase().trim();
  const nonStudyUnits = ['yes_no', 'boolean', 'times', 'time', 'count', 'liters', 'liter', 'glass', 'glasses', 'ml', 'l', 'steps', 'kg', 'reps'];

  if (nonStudyUnits.includes(unit)) {
    return false;
  }

  if (['hrs', 'hr', 'hours', 'hour', 'mins', 'min', 'minutes', 'minute'].includes(unit)) {
    return true;
  }

  return false;
}

/**
 * Gets hours spent on a habit/task item based on its target unit and history.
 */
function getHabitItemHours(h: any, entry: any): number {
  if (!isTimeBasedActivity(h)) return 0;

  const unit = (h.target?.unit || '').toLowerCase().trim();
  let val = entry?.value;

  if (val === undefined || val === null || val === 0) {
    if (entry?.status === 'done') {
      val = h.target?.value || 1;
    } else {
      val = 0;
    }
  }

  if (['hrs', 'hr', 'hours', 'hour'].includes(unit)) {
    return val;
  }

  if (['mins', 'min', 'minutes', 'minute'].includes(unit)) {
    return val / 60;
  }

  // Fallback to item duration or default 1.0 hr for study tasks
  const itemMin = h.durationMinutes || h.timeNeededMinutes || 60;
  return val > 0 ? (val * (itemMin / 60)) : (entry?.status === 'done' ? (itemMin / 60) : 0);
}

const INVALID_SUBJECT_NAMES = new Set(['study', 'general', 'gs1', 'gs2', 'gs3', 'gs4', 'csat', 'reading', 'revision', 'task', 'habit', 'uncategorized']);

/**
 * Resolves a valid Subject name matching the Syllabus Matrix.
 * Never allows generic category names like 'Study' or 'GS1' to masquerade as subjects.
 */
function resolveValidSubject(rawSubj: string | undefined, title: string | undefined, validSyllabusSubjects: string[]): string | null {
  const cleanSubj = (rawSubj || '').trim();

  if (cleanSubj && !INVALID_SUBJECT_NAMES.has(cleanSubj.toLowerCase())) {
    return cleanSubj;
  }

  // Check if title has "Subject: Topic" pattern (e.g. "Differential Calculas: ghsgdhgsd")
  if (title && title.includes(':')) {
    const candidate = title.split(':')[0].trim();
    if (candidate && !INVALID_SUBJECT_NAMES.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  // Match title against known syllabus subjects
  if (title) {
    const matched = validSyllabusSubjects.find((s) => title.toLowerCase().includes(s.toLowerCase()));
    if (matched) return matched;
  }

  return null;
}

/**
 * Calculates 7-day study velocity and subject/habit distributions directly from DB models,
 * then persists the record into the WeeklyData MongoDB collection.
 */
export async function calculateAndSaveWeeklyData(userId?: string) {
  await connectToDatabase();
  const effectiveUserId = await getEffectiveUserId(userId);

  const now = new Date();
  const weekKey = getWeekKey(now);

  const dayKeys: string[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData: Array<{ day: string; dateKey: string; hours: number; tasksCount: number; target: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = getStudyDayKey(d);
    dayKeys.push(dayKey);
    const dayName = daysOfWeek[d.getDay()];
    weeklyData.push({
      day: dayName,
      dateKey: dayKey,
      hours: 0,
      tasksCount: 0,
      target: 8.0
    });
  }

  const startDate = dayKeys[0];
  const endDate = dayKeys[dayKeys.length - 1];

  // Fetch daily snapshots for these 7 days
  const dailyDocs = await DailySnapshot.find({
    userId: effectiveUserId,
    studyDayKey: { $in: dayKeys }
  });

  const dailyDocMap: Record<string, any> = {};
  dailyDocs.forEach((doc) => {
    dailyDocMap[doc.studyDayKey] = doc;
  });

  // Fetch habits & tasks
  const habits = await HabitItem.find({ userId: effectiveUserId });

  // Fetch syllabus items & revisions for subject distribution
  const syllabusItems = await SyllabusItem.find({ userId: effectiveUserId });
  const topicRevisions = await TopicRevision.find({ userId: effectiveUserId });

  let totalTasksDone = 0;
  const habitStatsMap: Record<
    string,
    {
      title: string;
      unit: string;
      totalValue: number;
      completedDays: number;
      color: string;
    }
  > = {};
  const subjectHoursMap: Record<string, { subject: string; hours: number; color: string }> = {};

  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500', 'bg-blue-500'];

  // Initialize habitStatsMap ONLY for actual habits (excluding tasks / study tasks)
  habits.forEach((h, idx) => {
    if (h.type === 'habit' && !h.isStudyTask) {
      habitStatsMap[h._id.toString()] = {
        title: h.title,
        unit: (h.target?.unit || 'times').trim(),
        totalValue: 0,
        completedDays: 0,
        color: colors[idx % colors.length]
      };
    }
  });

  const validSyllabusSubjects = Array.from(
    new Set([
      ...syllabusItems.map((s) => s.subject).filter(Boolean),
      ...topicRevisions.map((t) => t.subject).filter(Boolean)
    ])
  ).filter((s) => !INVALID_SUBJECT_NAMES.has(s.toLowerCase()));

  validSyllabusSubjects.forEach((subj, idx) => {
    subjectHoursMap[subj] = {
      subject: subj,
      hours: 0,
      color: colors[idx % colors.length]
    };
  });

  weeklyData.forEach((dayObj) => {
    const dKey = dayObj.dateKey;
    let dayEstimatedHours = 0;
    let dayTasksCount = 0;

    habits.forEach((h) => {
      const hId = h._id.toString();
      const entry = (h.history || []).find((e: any) => e.date === dKey);
      
      if (entry && (entry.status === 'done' || (entry.value && entry.value > 0))) {
        // Task/habit count ONLY for completed items
        if (entry.status === 'done') {
          dayTasksCount++;
          totalTasksDone++;
        }

        // Track stats for actual Habits section (includes partial progress for display)
        if (habitStatsMap[hId]) {
          const val = entry.value || 1;
          habitStatsMap[hId].totalValue += val;
          if (entry.status === 'done') {
            habitStatsMap[hId].completedDays += 1;
          }
        }

        // Track study hours & subject distribution for Study Tasks / Time-based activities
        if (isTimeBasedActivity(h)) {
          const itemHours = getHabitItemHours(h, entry);
          if (itemHours > 0) {
            dayEstimatedHours += itemHours;

            const subj = resolveValidSubject(h.subject, h.title, validSyllabusSubjects);
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

    topicRevisions.forEach((tr) => {
      const subj = resolveValidSubject(tr.subject, tr.topic, validSyllabusSubjects);
      const stages = tr.revisions || [];
      stages.forEach((st: any) => {
        if (st.completedDate === dKey || (st.status === 'done' && st.scheduledDate === dKey)) {
          totalTasksDone++;
          dayTasksCount++;
          const revHours = 1.5;
          dayEstimatedHours += revHours;
          if (subj) {
            if (!subjectHoursMap[subj]) {
              subjectHoursMap[subj] = { subject: subj, hours: 0, color: colors[Object.keys(subjectHoursMap).length % colors.length] };
            }
            subjectHoursMap[subj].hours += revHours;
          }
        }
      });
    });

    dayObj.hours = Number(dayEstimatedHours.toFixed(1));
    dayObj.tasksCount = dayTasksCount;
  });

  const weeklyTotalHours = Number(weeklyData.reduce((acc, d) => acc + d.hours, 0).toFixed(1));
  const dailyAverageHours = Number((weeklyTotalHours / 7).toFixed(1));
  // Calculate Weekly Consistency Score based on Habit 2+ Days Consistency Rule in current 7 days
  // Only count recurring habits/tasks (exclude one-time events and frequency.mode === 'once')
  const recurringHabits = habits.filter((h) => h.frequency?.mode !== 'once' && h.type !== 'event');
  const totalHabitsCount = recurringHabits.length;
  let consistentHabitsCount = 0;
  let consistencyPct = 0;

  if (totalHabitsCount > 0) {
    recurringHabits.forEach((h) => {
      let completedDaysInWeek = 0;
      weeklyData.forEach((dayObj) => {
        const dKey = dayObj.dateKey;
        const entry = (h.history || []).find((e: any) => e.date === dKey);
        // Only count days where the task/habit was actually completed
        if (entry && entry.status === 'done') {
          completedDaysInWeek++;
        }
      });

      // A habit is consistent if completed >= 2 days in current week's 7 days
      if (completedDaysInWeek >= 2) {
        consistentHabitsCount++;
      }
    });

    const weightPerHabit = 100 / totalHabitsCount;
    consistencyPct = Number((consistentHabitsCount * weightPerHabit).toFixed(1));
  } else {
    // Fallback if no habits defined: check active study days in current week
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
      color: s.color
    }))
    .sort((a, b) => b.pct - a.pct);

  const habitDistribution = Object.values(habitStatsMap)
    .filter((h) => h.completedDays > 0 || h.totalValue > 0)
    .map((h) => {
      const unitLower = h.unit.toLowerCase();
      let formattedVal = '';

      if (['yes_no', 'boolean'].includes(unitLower)) {
        formattedVal = `${h.completedDays} days`;
      } else if (['hrs', 'hr', 'hours', 'hour'].includes(unitLower)) {
        formattedVal = `${h.totalValue.toFixed(1)} hrs`;
      } else if (['mins', 'min', 'minutes', 'minute'].includes(unitLower)) {
        formattedVal = `${h.totalValue} mins`;
      } else {
        formattedVal = `${h.totalValue} ${h.unit}`;
      }

      const pct = Math.min(100, Math.round((h.completedDays / 7) * 100));

      return {
        subject: h.title,
        hours: formattedVal,
        pct,
        color: h.color
      };
    })
    .sort((a, b) => b.pct - a.pct);

  const calculatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Save / Upsert into MongoDB WeeklyData collection
  const weeklyDoc = await WeeklyData.findOneAndUpdate(
    { userId: effectiveUserId, weekKey },
    {
      userId: effectiveUserId,
      weekKey,
      startDate,
      endDate,
      weeklyTotalHours,
      dailyAverageHours,
      consistencyPct,
      totalTasksDone,
      weeklyData,
      subjectDistribution,
      habitDistribution,
      calculatedAt
    },
    { upsert: true, returnDocument: 'after' }
  );

  return weeklyDoc;
}

export async function getLatestWeeklyData(userId?: string) {
  await connectToDatabase();
  const effectiveUserId = await getEffectiveUserId(userId);
  const weekKey = getWeekKey();

  let weeklyDoc = await WeeklyData.findOne({ userId: effectiveUserId, weekKey });
  if (!weeklyDoc) {
    weeklyDoc = await calculateAndSaveWeeklyData(effectiveUserId);
  }
  return weeklyDoc;
}
