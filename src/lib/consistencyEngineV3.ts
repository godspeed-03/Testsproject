import connectToDatabase from '@/lib/mongodb';
import HabitItem from '@/models/HabitItem';
import TopicRevision from '@/models/TopicRevision';
import DailySnapshot from '@/models/DailySnapshot';
import MonthlySnapshot from '@/models/MonthlySnapshot';
import AllTimeSnapshot from '@/models/AllTimeSnapshot';
import SyllabusItem from '@/models/SyllabusItem';

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
  await connectToDatabase();
  const effectiveUserId = await getEffectiveUserId(userId);
  const dayKey = studyDayKey || getStudyDayKey();
  const monthKey = dayKey.substring(0, 7);
  const monthName = getMonthName(monthKey);

  // Fetch all habits, topic revisions & syllabus items concurrently from DB using effective user ID
  const [habits, topicRevisions, syllabusItems] = await Promise.all([
    HabitItem.find({ userId: effectiveUserId }).lean(),
    TopicRevision.find({ userId: effectiveUserId }).lean(),
    SyllabusItem.find({ userId: effectiveUserId }).lean()
  ]);

  // Separate Habits & Tasks: Include all routines/habits in habitItems unless marked as one-time
  const habitItems = habits.filter((h: any) => h.frequency?.mode !== 'once');
  const taskItems = habits.filter((h: any) => h.type === 'task' && h.frequency?.mode !== 'once');

  // A. Daily Habit Score
  let habitSchedCount = 0;
  let habitDoneCount = 0;
  const habitBreakdown: any[] = [];

  habitItems.forEach((h) => {
    if (h.startDate && h.startDate > dayKey) return;

    // Check frequency
    const mode = h.frequency?.mode || 'daily';
    let isScheduled = true;

    if (mode === 'specific_days' || mode === 'weekly') {
      const days = h.frequency?.days || [];
      if (days.length > 0) {
        const dayObj = new Date(dayKey);
        const dayName = dayObj.toLocaleString('en-US', { weekday: 'short' });
        isScheduled = days.some((d: string) => d.toLowerCase().startsWith(dayName.toLowerCase()));
      }
    }

    const entry = (h.history || []).find((e: any) => e.date === dayKey);
    const isDone = entry ? entry.status === 'done' : false;

    if (isScheduled) {
      habitSchedCount++;
      if (isDone) habitDoneCount++;
    }

    habitBreakdown.push({
      habitId: h._id.toString(),
      title: h.title,
      type: h.type || 'habit',
      icon: h.icon || (h.type === 'habit' ? '🏃' : '📚'),
      category: h.category?.label || h.subject || 'General',
      subject: h.subject || h.category?.label || 'General',
      scheduled: isScheduled,
      done: isDone,
      score: isScheduled ? (isDone ? 100 : 0) : 0
    });
  });

  const habitScore = habitSchedCount > 0 ? Math.round((habitDoneCount / habitSchedCount) * 100) : -1;

  // B. Daily Task Score
  let taskSchedCount = 0;
  let taskDoneCount = 0;

  taskItems.forEach((h) => {
    if (h.startDate && h.startDate > dayKey) return;

    taskSchedCount++;
    const entry = (h.history || []).find((e: any) => e.date === dayKey);
    if (entry && entry.status === 'done') {
      taskDoneCount++;
    }
  });

  const taskScore = taskSchedCount > 0 ? Math.round((taskDoneCount / taskSchedCount) * 100) : -1;

  // C. Daily Revision Score (SRS Model with Asymmetric Weighting)
  const categoryMap: Record<string, { due: number; done: number; missed: number; topicsRead: number }> = {};
  const subjectMap: Record<string, { due: number; done: number; missed: number; topicsRead: number; category: string }> = {};

  // Initialize Categories from live DB records (SyllabusItems + TopicRevisions only)
  const dynamicCategories = Array.from(
    new Set([
      ...topicRevisions.map((tr) => tr.category).filter(Boolean),
      ...syllabusItems.map((si) => si.category).filter(Boolean)
    ])
  );
  if (dynamicCategories.length === 0) dynamicCategories.push('General');
  dynamicCategories.forEach((c) => {
    categoryMap[c] = { due: 0, done: 0, missed: 0, topicsRead: 0 };
  });

  // Initialize Subjects from Syllabus Matrix
  const dynamicSubjects = Array.from(
    new Set([
      ...syllabusItems.map((si) => si.subject).filter(Boolean),
      ...topicRevisions.map((tr) => tr.subject).filter(Boolean)
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
      category: relatedSi?.category || relatedTr?.category || 'General'
    };
  });

  topicRevisions.forEach((tr) => {
    const cat = tr.category || 'General';
    const subj = tr.subject || 'General';

    if (!categoryMap[cat]) categoryMap[cat] = { due: 0, done: 0, missed: 0, topicsRead: 0 };
    if (!subjectMap[subj]) subjectMap[subj] = { due: 0, done: 0, missed: 0, topicsRead: 0, category: cat };

    if (tr.firstReadDate === dayKey) {
      categoryMap[cat].topicsRead++;
      subjectMap[subj].topicsRead++;
    }

    // Check revision stages
    const stages = (tr.revisions && tr.revisions.length > 0)
      ? tr.revisions.map((r: any) => ({ sched: r.scheduledDate, comp: r.completedDate, stat: r.status }))
      : [];

    stages.forEach((st) => {
      if (st.sched && st.sched <= dayKey && tr.firstReadDate && tr.firstReadDate <= st.sched) {
        categoryMap[cat].due++;
        subjectMap[subj].due++;

        if (st.comp && st.comp <= dayKey) {
          categoryMap[cat].done++;
          subjectMap[subj].done++;
        } else if (st.stat === 'Done' || st.stat === 'done' || st.stat === 'Completed') {
          categoryMap[cat].done++;
          subjectMap[subj].done++;
        } else {
          // Check grace window
          const schedDateObj = new Date(st.sched);
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

  // Calculate Revision Credit per category, subject & overall
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
      const rawCredit = (data.done * W_DONE - data.missed * W_MISS) / data.due * 100;
      catScore = Math.max(0, Math.min(100, Math.round(rawCredit)));
    }

    categoryBreakdown.push({
      category: cat,
      subject: cat,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: catScore,
      topicsReadToday: data.topicsRead
    });
  });

  const subjectBreakdown: any[] = [];
  Object.keys(subjectMap).forEach((subj) => {
    const data = subjectMap[subj];
    let subjScore = 0;
    if (data.due > 0) {
      const rawCredit = (data.done * W_DONE - data.missed * W_MISS) / data.due * 100;
      subjScore = Math.max(0, Math.min(100, Math.round(rawCredit)));
    }

    subjectBreakdown.push({
      subject: subj,
      category: data.category,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: subjScore,
      topicsReadToday: data.topicsRead
    });
  });

  let revisionScore = 0;
  if (totalRevDue > 0) {
    const overallRevCredit = (totalRevDone * W_DONE - totalRevMissed * W_MISS) / totalRevDue * 100;
    revisionScore = Math.max(0, Math.min(100, Math.round(overallRevCredit)));
  }

  // D. Weighted Composite Overall Score (Redistribute if component has 0 scheduled)
  let activeComponents = 0;
  let weightSum = 0;
  let scoreSum = 0;

  if (habitScore >= 0) {
    activeComponents++;
    weightSum += 0.4;
    scoreSum += 0.4 * habitScore;
  }
  if (taskScore >= 0) {
    activeComponents++;
    weightSum += 0.3;
    scoreSum += 0.3 * taskScore;
  }
  if (totalRevDue > 0) {
    activeComponents++;
    weightSum += 0.3;
    scoreSum += 0.3 * revisionScore;
  }

  let finalOverallScore = 0;
  if (weightSum > 0) {
    finalOverallScore = Math.round(scoreSum / weightSum);
  }

  const finalHabitScore = habitScore >= 0 ? habitScore : 0;
  const finalTaskScore = taskScore >= 0 ? taskScore : 0;

  // Upsert DailySnapshot
  const dailyDoc = await DailySnapshot.findOneAndUpdate(
    { userId: effectiveUserId, studyDayKey: dayKey },
    {
      userId: effectiveUserId,
      studyDayKey: dayKey,
      monthKey,
      monthName,
      habitScore: finalHabitScore,
      taskScore: finalTaskScore,
      revisionScore,
      overallScore: finalOverallScore,
      habitBreakdown,
      categoryBreakdown,
      subjectBreakdown,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    { upsert: true, returnDocument: 'after' }
  );

  return dailyDoc;
}

// 2. Recalculate MonthlySnapshot
export async function recalculateMonthlySnapshot(userId: string, monthKey?: string) {
  await connectToDatabase();
  const effectiveUserId = await getEffectiveUserId(userId);
  const mKey = monthKey || getMonthKey();
  const monthName = getMonthName(mKey);

  // A. Re-run V4 daily calculation for all recorded daily snapshots in this month to purge legacy default scores
  const existingDailyDocs = await DailySnapshot.find({ userId: effectiveUserId, monthKey: mKey });
  if (existingDailyDocs.length === 0) {
    await recalculateDailySnapshot(effectiveUserId);
  } else {
    await Promise.all(existingDailyDocs.map((d) => recalculateDailySnapshot(effectiveUserId, d.studyDayKey)));
  }

  const dailyDocs = await DailySnapshot.find({ userId: effectiveUserId, monthKey: mKey }).sort({ studyDayKey: 1 });
  const daysWithData = dailyDocs.length;
  const sumOverall = dailyDocs.reduce((acc, d) => acc + d.overallScore, 0);
  const sumHabit = dailyDocs.reduce((acc, d) => acc + d.habitScore, 0);
  const sumTask = dailyDocs.reduce((acc, d) => acc + d.taskScore, 0);
  const sumRevision = dailyDocs.reduce((acc, d) => acc + d.revisionScore, 0);

  const overallScore = Math.round(sumOverall / daysWithData);
  const habitScore = Math.round(sumHabit / daysWithData);
  const taskScore = Math.round(sumTask / daysWithData);
  const revisionScore = Math.round(sumRevision / daysWithData);

  // B. Aggregate Habit Breakdown
  const habitAggMap: Record<string, { title: string; category: string; sched: number; comp: number }> = {};
  dailyDocs.forEach((d) => {
    (d.habitBreakdown || []).forEach((hb: any) => {
      if (!habitAggMap[hb.habitId]) {
        habitAggMap[hb.habitId] = { title: hb.title, category: hb.category || 'General', sched: 0, comp: 0 };
      }
      if (hb.scheduled) habitAggMap[hb.habitId].sched++;
      if (hb.scheduled && hb.done) habitAggMap[hb.habitId].comp++;
    });
  });

  const habitItems = await HabitItem.find({ userId: effectiveUserId });
  const activeHabitItems = habitItems.filter((h) => h.frequency?.mode !== 'once');

  const habitBreakdown = activeHabitItems.map((habitObj) => {
    const hId = habitObj._id.toString();
    const item = habitAggMap[hId] || { title: habitObj.title, category: (habitObj as any).category?.label || habitObj.subject || 'General', sched: 0, comp: 0 };
    const score = item.sched > 0 ? Math.round((item.comp / item.sched) * 100) : 0;

    return {
      habitId: hId,
      title: habitObj.title,
      type: habitObj.type || 'habit',
      icon: habitObj.icon || (habitObj.type === 'habit' ? '🏃' : '📚'),
      category: item.category,
      scheduledDays: item.sched,
      completedDays: item.comp,
      score,
      streakCurrent: habitObj.streakCurrent || 0,
      streakBest: habitObj.streakBest || 0
    };
  });

  // C. Aggregate Category Breakdown
  const catAggMap: Record<string, { due: number; done: number; missed: number; topics: number }> = {};
  
  const syllabusItems = await SyllabusItem.find({ userId: effectiveUserId });
  const topicRevisions = await TopicRevision.find({ userId: effectiveUserId });

  const allDbCategories = Array.from(
    new Set([
      ...topicRevisions.map((tr) => tr.category).filter(Boolean),
      ...syllabusItems.map((si) => si.category).filter(Boolean)
    ])
  );
  if (allDbCategories.length === 0) allDbCategories.push('General');
  allDbCategories.forEach((c) => {
    catAggMap[c] = { due: 0, done: 0, missed: 0, topics: 0 };
  });

  dailyDocs.forEach((d) => {
    ((d as any).categoryBreakdown || []).forEach((cb: any) => {
      const cat = cb.category || 'General';
      if (!catAggMap[cat]) {
        catAggMap[cat] = { due: 0, done: 0, missed: 0, topics: 0 };
      }
      catAggMap[cat].due += cb.revisionsDue || 0;
      catAggMap[cat].done += cb.revisionsDone || 0;
      catAggMap[cat].missed += cb.revisionsMissed || 0;
      catAggMap[cat].topics += cb.topicsReadToday || 0;
    });
  });

  const categoryBreakdown = Object.keys(catAggMap).map((cat) => {
    const data = catAggMap[cat];
    let catScore = 0;
    if (data.due > 0) {
      const credit = (data.done * W_DONE - data.missed * W_MISS) / data.due * 100;
      catScore = Math.max(0, Math.min(100, Math.round(credit)));
    }

    return {
      category: cat,
      subject: cat,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: catScore,
      topicsRead: data.topics
    };
  });

  // D. Aggregate Subject Breakdown
  const subjAggMap: Record<string, { category: string; due: number; done: number; missed: number; topics: number }> = {};
  dailyDocs.forEach((d) => {
    (d.subjectBreakdown || []).forEach((sb: any) => {
      const subj = sb.subject || 'General';
      if (!subjAggMap[subj]) {
        subjAggMap[subj] = { category: sb.category || 'General', due: 0, done: 0, missed: 0, topics: 0 };
      }
      subjAggMap[subj].due += sb.revisionsDue || 0;
      subjAggMap[subj].done += sb.revisionsDone || 0;
      subjAggMap[subj].missed += sb.revisionsMissed || 0;
      subjAggMap[subj].topics += sb.topicsReadToday || 0;
    });
  });

  const subjectBreakdown = Object.keys(subjAggMap).map((subj) => {
    const data = subjAggMap[subj];
    let subjScore = 0;
    if (data.due > 0) {
      const credit = (data.done * W_DONE - data.missed * W_MISS) / data.due * 100;
      subjScore = Math.max(0, Math.min(100, Math.round(credit)));
    }

    return {
      subject: subj,
      category: data.category,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: subjScore,
      topicsRead: data.topics
    };
  });

  // Upsert MonthlySnapshot
  const monthlyDoc = await MonthlySnapshot.findOneAndUpdate(
    { userId: effectiveUserId, monthKey: mKey },
    {
      userId: effectiveUserId,
      monthKey: mKey,
      monthName,
      overallScore,
      habitScore,
      taskScore,
      revisionScore,
      daysWithData,
      habitBreakdown,
      categoryBreakdown,
      subjectBreakdown,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    { upsert: true, returnDocument: 'after' }
  );

  return monthlyDoc;
}

// 3. Recalculate AllTimeSnapshot
export async function recalculateAllTimeSnapshot(userId: string) {
  await connectToDatabase();
  const effectiveUserId = await getEffectiveUserId(userId);

  const monthlyDocs = await MonthlySnapshot.find({ userId: effectiveUserId });
  if (monthlyDocs.length === 0) {
    await recalculateMonthlySnapshot(effectiveUserId);
    return await AllTimeSnapshot.findOne({ userId: effectiveUserId });
  }

  // Weighted Average by daysWithData
  let totalDays = 0;
  let weightedOverallSum = 0;
  let weightedHabitSum = 0;
  let weightedTaskSum = 0;
  let weightedRevisionSum = 0;

  monthlyDocs.forEach((m) => {
    const weight = Math.max(1, m.daysWithData);
    totalDays += weight;
    weightedOverallSum += m.overallScore * weight;
    weightedHabitSum += m.habitScore * weight;
    weightedTaskSum += m.taskScore * weight;
    weightedRevisionSum += m.revisionScore * weight;
  });

  const overallScore = totalDays > 0 ? Math.round(weightedOverallSum / totalDays) : 0;
  const habitScore = totalDays > 0 ? Math.round(weightedHabitSum / totalDays) : 0;
  const taskScore = totalDays > 0 ? Math.round(weightedTaskSum / totalDays) : 0;
  const revisionScore = totalDays > 0 ? Math.round(weightedRevisionSum / totalDays) : 0;

  // Aggregate Habit Breakdown across all months
  const habitMap: Record<string, { title: string; category: string; sched: number; comp: number; streakCurrent: number; streakBest: number }> = {};
  monthlyDocs.forEach((m) => {
    (m.habitBreakdown || []).forEach((hb) => {
      if (!habitMap[hb.habitId]) {
        habitMap[hb.habitId] = {
          title: hb.title,
          category: hb.category || 'General',
          sched: 0,
          comp: 0,
          streakCurrent: hb.streakCurrent || 0,
          streakBest: hb.streakBest || 0
        };
      }
      habitMap[hb.habitId].sched += hb.scheduledDays || 0;
      habitMap[hb.habitId].comp += hb.completedDays || 0;
      habitMap[hb.habitId].streakCurrent = Math.max(habitMap[hb.habitId].streakCurrent, hb.streakCurrent || 0);
      habitMap[hb.habitId].streakBest = Math.max(habitMap[hb.habitId].streakBest, hb.streakBest || 0);
    });
  });

  const habitItems = await HabitItem.find({ userId: effectiveUserId });
  const activeHabitItems = habitItems.filter((h) => h.frequency?.mode !== 'once');

  const habitBreakdown = activeHabitItems.map((habitObj) => {
    const hId = habitObj._id.toString();
    const item = habitMap[hId] || { title: habitObj.title, category: (habitObj as any).category?.label || habitObj.subject || 'General', sched: 0, comp: 0, streakCurrent: habitObj.streakCurrent || 0, streakBest: habitObj.streakBest || 0 };
    const score = item.sched > 0 ? Math.round((item.comp / item.sched) * 100) : 0;
    return {
      habitId: hId,
      title: habitObj.title,
      type: habitObj.type || 'habit',
      icon: habitObj.icon || (habitObj.type === 'habit' ? '🏃' : '📚'),
      category: item.category,
      scheduledDays: item.sched,
      completedDays: item.comp,
      score,
      streakCurrent: item.streakCurrent || habitObj.streakCurrent || 0,
      streakBest: item.streakBest || habitObj.streakBest || 0
    };
  });

  // Aggregate Category Breakdown across all months
  const catMap: Record<string, { due: number; done: number; missed: number; topics: number }> = {};
  
  const syllabusItems = await SyllabusItem.find({ userId: effectiveUserId });
  const topicRevisions = await TopicRevision.find({ userId: effectiveUserId });

  const allDbCategories = Array.from(
    new Set([
      ...topicRevisions.map((tr) => tr.category).filter(Boolean),
      ...syllabusItems.map((si) => si.category).filter(Boolean)
    ])
  );
  if (allDbCategories.length === 0) allDbCategories.push('General');
  allDbCategories.forEach((c) => {
    catMap[c] = { due: 0, done: 0, missed: 0, topics: 0 };
  });
  monthlyDocs.forEach((m) => {
    ((m as any).categoryBreakdown || []).forEach((cb: any) => {
      const cat = cb.category || 'General';
      if (!catMap[cat]) {
        catMap[cat] = { due: 0, done: 0, missed: 0, topics: 0 };
      }
      catMap[cat].due += cb.revisionsDue || 0;
      catMap[cat].done += cb.revisionsDone || 0;
      catMap[cat].missed += cb.revisionsMissed || 0;
      catMap[cat].topics += cb.topicsRead || 0;
    });
  });

  const categoryBreakdown = Object.keys(catMap).map((cat) => {
    const data = catMap[cat];
    let catScore = 0;
    if (data.due > 0) {
      const credit = (data.done * W_DONE - data.missed * W_MISS) / data.due * 100;
      catScore = Math.max(0, Math.min(100, Math.round(credit)));
    }
    return {
      category: cat,
      subject: cat,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: catScore,
      topicsRead: data.topics
    };
  });

  // Aggregate Subject Breakdown across all months
  const subjMap: Record<string, { category: string; due: number; done: number; missed: number; topics: number }> = {};
  monthlyDocs.forEach((m) => {
    (m.subjectBreakdown || []).forEach((sb: any) => {
      const subj = sb.subject || 'General';
      if (!subjMap[subj]) {
        subjMap[subj] = { category: sb.category || 'General', due: 0, done: 0, missed: 0, topics: 0 };
      }
      subjMap[subj].due += sb.revisionsDue || 0;
      subjMap[subj].done += sb.revisionsDone || 0;
      subjMap[subj].missed += sb.revisionsMissed || 0;
      subjMap[subj].topics += sb.topicsRead || 0;
    });
  });

  const subjectBreakdown = Object.keys(subjMap).map((subj) => {
    const data = subjMap[subj];
    let subjScore = 0;
    if (data.due > 0) {
      const credit = (data.done * W_DONE - data.missed * W_MISS) / data.due * 100;
      subjScore = Math.max(0, Math.min(100, Math.round(credit)));
    }
    return {
      subject: subj,
      category: data.category,
      revisionsDue: data.due,
      revisionsDone: data.done,
      revisionsMissed: data.missed,
      score: subjScore,
      topicsRead: data.topics
    };
  });

  const allTimeDoc = await AllTimeSnapshot.findOneAndUpdate(
    { userId: effectiveUserId },
    {
      userId: effectiveUserId,
      overallScore,
      habitScore,
      taskScore,
      revisionScore,
      totalDaysRecorded: totalDays,
      habitBreakdown,
      categoryBreakdown,
      subjectBreakdown,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    { upsert: true, returnDocument: 'after' }
  );

  return allTimeDoc;
}

// 4. Combined Full Pipeline Trigger
export async function runFullConsistencyPipeline(userId: string) {
  const daily = await recalculateDailySnapshot(userId);
  const monthly = await recalculateMonthlySnapshot(userId);
  const allTime = await recalculateAllTimeSnapshot(userId);
  return { daily, monthly, allTime };
}


