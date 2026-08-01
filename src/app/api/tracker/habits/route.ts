import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import HabitItem from '@/models/HabitItem';
import CheckList from '@/models/CheckList';
import SyllabusItem from '@/models/SyllabusItem';
import TopicRevision from '@/models/TopicRevision';
import { processTopicTag } from '@/lib/topicRevisionEngine';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function createSrsTasksForTopic(userId: string, subject: string, topic: string, startDateStr: string, category?: any, isAugmentedRevision?: boolean) {
  if (!subject || !topic || !startDateStr) return;
  if (isAugmentedRevision === false) return;

  const revisions = [
    { stage: 'R1 Revision (+7 Days)', days: 7, tag: '[R1 Revision]' },
    { stage: 'R2 Revision (+21 Days)', days: 21, tag: '[R2 Revision]' },
    { stage: 'R3 Revision (+45 Days)', days: 45, tag: '[R3 Revision]' }
  ];

  for (const r of revisions) {
    const revDate = addDaysStr(startDateStr, r.days);
    const revTitle = `${r.tag} ${subject.trim()}: ${topic.trim()}`;

    const existingRevTask = await HabitItem.findOne({
      userId,
      title: revTitle,
      startDate: revDate
    });

    if (!existingRevTask) {
      await HabitItem.create({
        userId,
        type: 'task',
        title: revTitle,
        category: { id: 'study', label: 'Study & UPSC', icon: '📚', color: '#8B5CF6' },
        description: `Automated Spaced Repetition (${r.stage}) for topic read on ${startDateStr}`,
        priority: 'high',
        frequency: { mode: 'once', days: [] },
        target: { value: 1, unit: 'times' },
        reminders: [{ time: '09:00', enabled: true }],
        startDate: revDate,
        endDate: null,
        isStudyTask: true,
        isAugmentedRevision: true,
        subject: subject.trim(),
        topic: topic.trim(),
        color: '#8B5CF6',
        icon: '🔄',
        streakCurrent: 0,
        streakBest: 0,
        history: []
      });
    }
  }
}

function recalculateHabitStreak(habit: any) {
  if (habit.history && Array.isArray(habit.history)) {
    const targetVal = habit.target?.value;
    const unit = habit.target?.unit;
    const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';
    if (isNumericGoal) {
      habit.history.forEach((h: any) => {
        const val = h.value || 0;
        if (val < targetVal && h.status === 'done') {
          h.status = 'pending';
        }
      });
    }
  }

  const doneDatesArr: string[] = Array.from(
    new Set<string>(
      (habit.history || [])
        .filter((h: any) => h.status === 'done')
        .map((h: any) => String(h.date))
    )
  ).sort();

  if (doneDatesArr.length === 0) {
    habit.streakCurrent = 0;
    habit.streakBest = 0;
    return habit;
  }

  const doneDatesSet = new Set(doneDatesArr);

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isScheduledForIso = (dateIso: string): boolean => {
    if (habit.startDate && habit.startDate > dateIso) return false;
    if (habit.endDate && habit.endDate < dateIso) return false;

    const mode = habit.frequency?.mode || habit.recurrence || 'daily';
    if (mode === 'daily') return true;

    if (mode === 'once') {
      return habit.startDate === dateIso;
    }

    if (mode === 'specific_days' || mode === 'weekly') {
      const dateObj = new Date(dateIso + 'T00:00:00');
      const dayShortNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayFullNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIdx = dateObj.getDay();

      const shortName = dayShortNames[dayIdx];
      const fullName = dayFullNames[dayIdx];

      const activeDays: string[] = (habit.frequency?.days || habit.selectedDays || []).map((d: any) =>
        String(d).toLowerCase().trim()
      );

      if (activeDays.length > 0) {
        return activeDays.some(
          (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d)
        );
      }
      return true;
    }

    if (mode === 'monthly') {
      const dateObj = new Date(dateIso + 'T00:00:00');
      const targetDay = habit.frequency?.monthlyDay || habit.monthlyDay || 1;
      return dateObj.getDate() === targetDay;
    }

    return true;
  };

  // 1. Calculate Best Streak across all completed dates in history
  let maxStreak = 0;
  const evaluatedDates = new Set<string>();

  for (let d = doneDatesArr.length - 1; d >= 0; d--) {
    const startIso = doneDatesArr[d];
    if (evaluatedDates.has(startIso)) continue;

    let chain = 0;
    const cursor = new Date(startIso + 'T00:00:00');

    for (let i = 0; i < 365; i++) {
      const currentIso = formatDateStr(cursor);
      const scheduled = isScheduledForIso(currentIso);

      if (scheduled) {
        if (doneDatesSet.has(currentIso)) {
          chain++;
          evaluatedDates.add(currentIso);
        } else {
          break;
        }
      }
      cursor.setDate(cursor.getDate() - 1);
    }

    if (chain > maxStreak) {
      maxStreak = chain;
    }
  }

  // 2. Calculate Current Streak from the most recent active/done period
  const now = new Date();
  const todayIso = formatDateStr(now);
  const latestDoneIso = doneDatesArr[doneDatesArr.length - 1];
  const startCheckIso = latestDoneIso > todayIso ? latestDoneIso : todayIso;

  let currentStreak = 0;
  const cursor = new Date(startCheckIso + 'T00:00:00');

  const isStartDone = doneDatesSet.has(startCheckIso);
  const isStartScheduled = isScheduledForIso(startCheckIso);

  if (!isStartDone && isStartScheduled) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const currentIso = formatDateStr(cursor);
    const scheduled = isScheduledForIso(currentIso);

    if (scheduled) {
      if (doneDatesSet.has(currentIso)) {
        currentStreak++;
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  habit.streakCurrent = currentStreak;
  habit.streakBest = Math.max(maxStreak, currentStreak);

  return habit;
}

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

async function backfillTopicRevisions(userId: string) {
  try {
    const studyTasks = await HabitItem.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }],
      isStudyTask: true
    }).lean();

    for (const task of studyTasks) {
      let subj = task.subject?.trim() || '';
      let top = task.topic?.trim() || '';
      if (!subj || !top) {
        const cleanTitle = (task.title || '').replace(/^\[R[123]\s+Revision\]\s*/i, '').trim();
        if (cleanTitle.includes(':')) {
          const parts = cleanTitle.split(':');
          if (parts.length >= 2) {
            subj = parts[0].trim();
            top = parts.slice(1).join(':').trim();
          }
        }
      }
      if (subj && top) {
        const cat = typeof task.category === 'string' ? task.category : (task.category?.label || task.category?.id || 'GS1');
        const startDate = task.startDate || new Date().toISOString().split('T')[0];
        await processTopicTag(userId, { subject: subj, topic: top, category: cat }, startDate);
      }
    }
  } catch (err) {
    console.error('Failed to backfill TopicRevisions:', err);
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    // Backfill missing isAugmentedRevision field for existing MongoDB HabitItem documents
    await HabitItem.updateMany(
      { isAugmentedRevision: { $exists: false } },
      { $set: { isAugmentedRevision: true } }
    );

    // Clear legacy default seed items
    await HabitItem.deleteMany({
      $or: [
        { userId: '000000000000000000000000' },
        { title: { $in: ['Daily GS Revision & Answer Practice', 'Hydration Goal: 3 Liters Water', 'Submit Weekly PYQ Analysis Test', 'PW Online Mentorship Meeting'] } }
      ]
    });

    // Clean up any corrupted SyllabusItems created by topic-as-category bug
    await cleanupCorruptedSyllabusItems(userId);

    // Unset legacy flat fields from existing MongoDB documents
    await TopicRevision.updateMany(
      {},
      {
        $unset: {
          r1ScheduledDate: "",
          r1CompletedDate: "",
          r1Status: "",
          r2ScheduledDate: "",
          r2CompletedDate: "",
          r2Status: "",
          r3ScheduledDate: "",
          r3CompletedDate: "",
          r3Status: "",
          isCluster: "",
          subTopics: "",
          extraRevisions: "",
          revisionLogs: ""
        }
      }
    );

    // Purge any orphaned HabitItem revision tasks for topics where isAugmentedRevision is false
    const nonAugTopicRevisions = await TopicRevision.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }],
      isAugmentedRevision: false
    }).lean();

    for (const tr of nonAugTopicRevisions) {
      if (tr.subject && tr.topic) {
        const safeSubj = tr.subject.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const safeTop = tr.topic.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        await HabitItem.deleteMany({
          userId,
          title: { $regex: new RegExp(`^\\[R[123] Revision\\] ${safeSubj}: ${safeTop}$`, 'i') }
        });
      }
    }

    // Backfill TopicRevisions & populate topicRevisionIds for all subjects
    await backfillTopicRevisions(userId);

    // Auto-sync TopicRevisions with HabitItem tasks for scheduled revisions
    const topicRevisions = await TopicRevision.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }]
    }).lean();

    for (const tr of topicRevisions) {
      if (tr.subject && tr.topic && tr.firstReadDate) {
        const isAug = tr.isAugmentedRevision !== false;

        if (isAug) {
          await createSrsTasksForTopic(userId, tr.subject, tr.topic, tr.firstReadDate, tr.category, true);
        }
      }
    }

    let habits = await HabitItem.find({ userId }).lean();
    habits = habits.map((h: any) => recalculateHabitStreak(h));
    let lists = await CheckList.find({ userId }).lean();

    const syllabusItems = await SyllabusItem.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }]
    }).lean();

    const habitSubjects = Array.from(
      new Set(habits.map((h: any) => h.subject).filter(Boolean))
    );

    const syllabusSubjects = Array.from(
      new Set([
        ...syllabusItems.map((s: any) => s.subject).filter(Boolean),
        ...habitSubjects
      ])
    );

    const categories = Array.from(
      new Set(syllabusItems.map((s: any) => s.category).filter(Boolean))
    );

    return NextResponse.json({ habits, lists, syllabusSubjects, syllabusItems, categories });
  } catch (error: any) {
    console.error('Failed to fetch habit tracker data:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();
    const body = await req.json();
    const { action } = body;

    // Action: toggle_log (log habit completion for a specific date)
    if (action === 'toggle_log') {
      const { habitId, date, status, value, note } = body;
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        return NextResponse.json({ error: 'Backdating is disabled. Completion cannot be modified for past dates.' }, { status: 400 });
      }

      const habit = await HabitItem.findOne({
        _id: habitId,
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      });

      if (!habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
      }

      const existingIdx = habit.history.findIndex((h: any) => h.date === date);

      if (existingIdx >= 0) {
        if (status === 'toggle') {
          const currentStatus = habit.history[existingIdx].status;
          habit.history[existingIdx].status = currentStatus === 'done' ? 'pending' : 'done';
          habit.history[existingIdx].value = habit.history[existingIdx].status === 'done' ? habit.target.value : 0;
        } else {
          habit.history[existingIdx].status = status;
          if (value !== undefined) {
            if (body.increment || body.mode === 'increment') {
              const prev = habit.history[existingIdx].value || 0;
              habit.history[existingIdx].value = Number((prev + value).toFixed(2));
            } else {
              habit.history[existingIdx].value = value;
            }
          }
          if (note !== undefined) habit.history[existingIdx].note = note;

          // Auto-adjust status based on numeric target goal progress
          const targetVal = habit.target?.value;
          const unit = habit.target?.unit;
          const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';
          if (isNumericGoal) {
            const currentVal = habit.history[existingIdx].value || 0;
            habit.history[existingIdx].status = currentVal >= targetVal ? 'done' : 'pending';
          }
        }
      } else {
        const newStatus = status === 'toggle' ? 'done' : status;
        const newValue = value !== undefined ? value : (newStatus === 'done' ? habit.target.value : 0);
        let finalStatus = newStatus;
        const targetVal = habit.target?.value;
        const unit = habit.target?.unit;
        const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';
        if (isNumericGoal && status !== 'toggle') {
          finalStatus = newValue >= targetVal ? 'done' : 'pending';
        }
        habit.history.push({
          date,
          status: finalStatus,
          value: newValue,
          note: note || ''
        });
      }

      // Recalculate current and best streaks dynamically from completed history & recurrence schedule
      recalculateHabitStreak(habit);
      await habit.save();

      // Synchronize TopicRevision & SyllabusItem status when tasks are toggled
      if (habit.isStudyTask || habit.subject || habit.topic || habit.title.includes(':')) {
        try {
          const isDone = habit.history.some((h: any) => h.date === date && h.status === 'done');
          let cleanSubj = habit.subject?.trim() || '';
          let cleanTop = habit.topic?.trim() || '';

          if (!cleanSubj || !cleanTop) {
            const cleanTitle = habit.title.replace(/^\[R[123]\s+Revision\]\s*/i, '').trim();
            if (cleanTitle.includes(':')) {
              const parts = cleanTitle.split(':');
              if (parts.length >= 2) {
                cleanSubj = parts[0].trim();
                cleanTop = parts.slice(1).join(':').trim();
              }
            }
          }

          if (cleanSubj && cleanTop) {
            const safeSubj = cleanSubj.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const safeTop = cleanTop.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            // 1. Sync with TopicRevision (SRS Engine)
            const topicDoc = await TopicRevision.findOne({
              $or: [{ userId }, { userId: '000000000000000000000000' }],
              subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') },
              topic: { $regex: new RegExp(`^${safeTop}$`, 'i') }
            });

            if (topicDoc) {
              if (!topicDoc.revisions) topicDoc.revisions = [];
              let targetStage = 'First Read';
              if (habit.title.startsWith('[R1 Revision]')) targetStage = 'R1';
              else if (habit.title.startsWith('[R2 Revision]')) targetStage = 'R2';
              else if (habit.title.startsWith('[R3 Revision]')) targetStage = 'R3';

              let revEntry = topicDoc.revisions.find((r: any) => r.stage === targetStage);
              if (!revEntry && targetStage !== 'First Read') {
                revEntry = { stage: targetStage, scheduledDate: date, completedDate: '', status: 'Pending' };
                topicDoc.revisions.push(revEntry);
              }

              if (revEntry) {
                revEntry.status = isDone ? 'Completed' : 'Pending';
                revEntry.completedDate = isDone ? date : '';
              }
              if (isDone) topicDoc.lastRevisedDate = date;
              if (isDone && targetStage === 'First Read' && !topicDoc.firstReadDate) {
                topicDoc.firstReadDate = date;
              }

              // Update next scheduled date and overdue status for GS
              if (topicDoc.isAugmentedRevision !== false) {
                const r1 = topicDoc.revisions.find((r: any) => r.stage === 'R1');
                const r2 = topicDoc.revisions.find((r: any) => r.stage === 'R2');
                const r3 = topicDoc.revisions.find((r: any) => r.stage === 'R3');

                if (r1 && r1.status !== 'Completed') {
                  topicDoc.nextScheduledDate = r1.scheduledDate || '';
                } else if (r2 && r2.status !== 'Completed') {
                  topicDoc.nextScheduledDate = r2.scheduledDate || '';
                } else if (r3 && r3.status !== 'Completed') {
                  topicDoc.nextScheduledDate = r3.scheduledDate || '';
                } else {
                  topicDoc.nextScheduledDate = '';
                }
              }
              topicDoc.isOverdue = false;

              await topicDoc.save();
            }

            // 2. Sync with SyllabusItem
            let sysItem = await SyllabusItem.findOne({
              $or: [{ userId }, { userId: '000000000000000000000000' }],
              subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') }
            });

            if (sysItem) {
              let targetKey = 'firstRead';
              if (habit.title.startsWith('[R1 Revision]')) {
                targetKey = 'rev1';
              } else if (habit.title.startsWith('[R2 Revision]')) {
                targetKey = 'rev2';
              }
              const itemRules = buildDynamicRulesFromLegacy(sysItem);
              const ruleIdx = itemRules.findIndex((r: any) => r.key === targetKey || r.key.includes(targetKey));
              if (ruleIdx !== -1) {
                itemRules[ruleIdx].completed = isDone;
              }
              sysItem.rules = itemRules;
              sysItem.status = isDone ? 'In Progress' : 'Not Started';
              sysItem.date = date;
              await sysItem.save();
            }
          }
        } catch (err) {
          console.error('Failed to sync completion status with TopicRevision / SyllabusItem:', err);
        }
      }

      const habits = await HabitItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      return NextResponse.json({ message: 'Log updated', habits: habits.map((h: any) => recalculateHabitStreak(h)) });
    }

    // Action: create (add new habit / task / event)
    if (action === 'create' || action === 'create_habit') {
      const { title, type, category, description, priority, frequency, target, reminders, startDate, endDate, isStudyTask, subject, topic, color, icon, isAugmentedRevision } = body;

      const cleanSubject = (subject || '').trim();
      const categoryLabel = typeof category === 'string' ? category : (category?.label || category?.id || 'GS1');
      const resolvedIsAugmented = isAugmentedRevision !== undefined
        ? Boolean(isAugmentedRevision)
        : !(/csat|maths|mathematics|math/i.test(cleanSubject) || /csat|maths|mathematics|math/i.test(categoryLabel));

      const newHabit = new HabitItem({
        userId,
        type: type || 'habit',
        title,
        category: category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' },
        description: description || '',
        priority: priority || 'medium',
        frequency: frequency || { mode: 'daily', days: [] },
        target: target || { value: 1, unit: 'times' },
        reminders: reminders || [{ time: '08:00', enabled: true }],
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || null,
        isStudyTask: !!isStudyTask,
        isAugmentedRevision: resolvedIsAugmented,
        subject: cleanSubject,
        topic: (topic || '').trim(),
        color: color || '#6366F1',
        icon: icon || '🏃',
        streakCurrent: 0,
        streakBest: 0,
        history: []
      });

      await newHabit.save();

      // Automatically link One-Time Study Tasks to Syllabus Matrix & TopicRevision
      if (isStudyTask && frequency?.mode === 'once' && subject && topic) {
        try {
          const taskStartDate = startDate || new Date().toISOString().split('T')[0];
          const cleanSubject = subject.trim();
          const cleanTopic = topic.trim();
          const categoryLabel = typeof category === 'string' ? category : (category?.label || category?.id || 'GS1');

          // 1. Link to existing Subject in Syllabus Matrix if it exists
          const safeSubj = cleanSubject.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          let sysItem = await SyllabusItem.findOne({
            $or: [{ userId }, { userId: '000000000000000000000000' }],
            subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') }
          });

          if (sysItem) {
            if (sysItem.status === 'Not Started') {
              sysItem.status = 'In Progress';
            }
            const knownCats = ['gs1', 'gs2', 'gs3', 'gs4', 'maths', 'csat', 'optional', 'essay', 'general', 'study'];
            const isCurrCatKnown = knownCats.some(k => sysItem.category?.toLowerCase().includes(k));
            if (!isCurrCatKnown && categoryLabel) {
              sysItem.category = categoryLabel;
            }
            await sysItem.save();
          }

          const NON_AUGMENTED_REGEX = /csat|math|maths|mathematics|series|reasoning|aptitude|mental|comprehension|verbal/i;
          const isAugmentedRevision = body.isAugmentedRevision !== undefined
            ? Boolean(body.isAugmentedRevision)
            : !(NON_AUGMENTED_REGEX.test(cleanSubject) || NON_AUGMENTED_REGEX.test(categoryLabel));

          // 2. ALWAYS create TopicRevision with explicit isAugmentedRevision flag
          await processTopicTag(
            userId,
            {
              subject: cleanSubject,
              topic: cleanTopic,
              category: categoryLabel,
              isAugmentedRevision
            },
            taskStartDate
          );

          // 3. Schedule automated SRS revision tasks if isAugmentedRevision is true, otherwise purge any stray revision tasks
          if (isAugmentedRevision) {
            await createSrsTasksForTopic(userId, cleanSubject, cleanTopic, taskStartDate, category, true);
          } else {
            const safeSubj = cleanSubject.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const safeTop = cleanTopic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            await HabitItem.deleteMany({
              userId,
              title: { $regex: new RegExp(`^\\[R[123] Revision\\] ${safeSubj}: ${safeTop}$`, 'i') }
            });
          }
        } catch (err) {
          console.error('Failed to sync study task with TopicRevision & Syllabus Matrix:', err);
        }
      }

      const habits = await HabitItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      const syllabusItems = await SyllabusItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      const studyTaskSubjects = habits
        .filter((h: any) => h.isStudyTask && h.subject)
        .map((h: any) => h.subject.trim());

      const syllabusSubjects = Array.from(
        new Set([
          ...syllabusItems.map((s: any) => s.subject).filter(Boolean),
          ...studyTaskSubjects
        ])
      );

      return NextResponse.json({ message: 'Item created', habits, syllabusSubjects });
    }

    // Action: update (edit habit / task / event)
    if (action === 'update' || action === 'update_habit') {
      const { id, title, type, category, description, priority, frequency, target, reminders, startDate, endDate, isStudyTask, subject, topic, color, icon, isAugmentedRevision } = body;

      const habit = await HabitItem.findOne({
        _id: id,
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      });

      if (habit) {
        if (title !== undefined) habit.title = title;
        if (type !== undefined) habit.type = type;
        if (category !== undefined) habit.category = category;
        if (description !== undefined) habit.description = description;
        if (priority !== undefined) habit.priority = priority;
        if (frequency !== undefined) habit.frequency = frequency;
        if (target !== undefined) habit.target = target;
        if (reminders !== undefined) habit.reminders = reminders;
        if (startDate !== undefined) habit.startDate = startDate;
        if (endDate !== undefined) habit.endDate = endDate;
        if (isStudyTask !== undefined) habit.isStudyTask = !!isStudyTask;
        if (isAugmentedRevision !== undefined) habit.isAugmentedRevision = Boolean(isAugmentedRevision);
        if (subject !== undefined) habit.subject = subject;
        if (topic !== undefined) habit.topic = topic;
        if (color !== undefined) habit.color = color;
        if (icon !== undefined) habit.icon = icon;

        await habit.save();
      }

      const habits = await HabitItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      return NextResponse.json({ message: 'Item updated', habits });
    }

    // Action: delete
    if (action === 'delete') {
      const { id } = body;
      let targetHabit = null;

      if (id && mongoose.Types.ObjectId.isValid(id)) {
        targetHabit = await HabitItem.findById(id);
      }
      if (!targetHabit && id) {
        targetHabit = await HabitItem.findOne({ $or: [{ _id: id }, { customId: id }] });
      }

      if (targetHabit) {
        let subject = targetHabit.subject?.trim() || '';
        let topic = targetHabit.topic?.trim() || '';

        // If subject/topic missing from fields, extract from title if formatted as "Subject: Topic" or "[R1 Revision] Subject: Topic"
        if (!subject || !topic) {
          const cleanTitle = targetHabit.title.replace(/^\[R[123]\s+Revision\]\s*/i, '').trim();
          if (cleanTitle.includes(':')) {
            const parts = cleanTitle.split(':');
            if (parts.length >= 2) {
              subject = parts[0].trim();
              topic = parts.slice(1).join(':').trim();
            }
          }
        }

        // Perform multi-schema cascading deletion if topic is present
        if (topic) {
          const safeTopic = topic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const topicRegex = new RegExp(`^${safeTopic}$`, 'i');

          if (subject) {
            const safeSubj = subject.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const subjRegex = new RegExp(`^${safeSubj}$`, 'i');

            // 1. Delete all HabitItem entries matching subject & topic
            await HabitItem.deleteMany({
              $or: [
                { subject: subjRegex, topic: topicRegex },
                { title: new RegExp(`${safeSubj}:\\s*${safeTopic}`, 'i') }
              ]
            });

            // 2. Delete from SyllabusItem model
            await SyllabusItem.deleteMany({
              subject: subjRegex,
              category: topicRegex
            });

            // 3. Delete from TopicRevision model (Spaced Repetition engine)
            await TopicRevision.deleteMany({
              subject: subjRegex,
              topic: topicRegex
            });
          } else {
            // Delete by topic only if subject was not specified
            await HabitItem.deleteMany({
              $or: [{ topic: topicRegex }, { title: topicRegex }]
            });

            await TopicRevision.deleteMany({
              topic: topicRegex
            });
          }
        }

        await HabitItem.deleteMany({
          $or: [{ _id: targetHabit._id }, { customId: id }]
        });
      } else if (id) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          await HabitItem.findByIdAndDelete(id);
        }
        await HabitItem.deleteMany({ customId: id });
      }

      const habits = await HabitItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      const syllabusItems = await SyllabusItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      const studyTaskSubjects = habits
        .filter((h: any) => h.isStudyTask && h.subject)
        .map((h: any) => h.subject.trim());

      const syllabusSubjects = Array.from(
        new Set([
          ...syllabusItems.map((s: any) => s.subject).filter(Boolean),
          ...studyTaskSubjects
        ])
      );

      return NextResponse.json({ message: 'Item deleted', habits, syllabusSubjects });
    }

    // Action: create_list / toggle_list_item
    if (action === 'toggle_list_item') {
      const { listId, itemId } = body;
      const list = await CheckList.findById(listId);
      if (list) {
        const item = list.items.find((i) => i.id === itemId);
        if (item) {
          item.checked = !item.checked;
          await list.save();
        }
      }
      const lists = await CheckList.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();
      return NextResponse.json({ message: 'List item toggled', lists });
    }

    if (action === 'create_list') {
      const { title, color, items } = body;
      const newList = new CheckList({
        userId,
        title,
        color: color || '#6366F1',
        items: items || []
      });
      await newList.save();

      const lists = await CheckList.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      return NextResponse.json({ message: 'List created', lists });
    }

    if (action === 'delete_list') {
      const { listId } = body;
      await CheckList.deleteOne({ _id: listId, $or: [{ userId }, { userId: '000000000000000000000000' }] });
      const lists = await CheckList.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();
      return NextResponse.json({ message: 'List deleted', lists });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to update habit item:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
