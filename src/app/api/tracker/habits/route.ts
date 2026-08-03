import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { processTopicTag } from '@/lib/topicRevisionEngine';
import { buildDynamicRulesFromLegacy } from '@/lib/syllabusRules';
import { runFullConsistencyPipeline } from '@/lib/consistencyEngineV3';

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
    { stage: 'R3 Revision (+45 Days)', days: 45, tag: '[R3 Revision]' },
  ];

  for (const r of revisions) {
    const revDate = addDaysStr(startDateStr, r.days);
    const revTitle = `${r.tag} ${subject.trim()}: ${topic.trim()}`;

    const existingRevTask = await prisma.habitItem.findFirst({
      where: {
        userId,
        title: revTitle,
        startDate: revDate,
      },
    });

    if (!existingRevTask) {
      await prisma.habitItem.create({
        data: {
          userId,
          type: 'task',
          title: revTitle,
          category: { id: 'study', label: 'Study & UPSC', icon: '📚', color: '#8B5CF6' },
          description: `Automated Spaced Repetition (${r.stage}) for topic read on ${startDateStr}`,
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
          history: [],
        },
      });
    }
  }
}

function recalculateHabitStreak(habit: any) {
  const history = Array.isArray(habit.history) ? [...habit.history] : [];
  const targetObj = typeof habit.target === 'object' && habit.target !== null ? habit.target : {};
  const targetVal = targetObj.value;
  const unit = targetObj.unit;
  const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';

  if (isNumericGoal) {
    history.forEach((h: any) => {
      const val = h.value || 0;
      if (val < targetVal && h.status === 'done') {
        h.status = 'pending';
      }
    });
  }

  const doneDatesArr: string[] = Array.from(
    new Set<string>(
      history
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

    const freq = typeof habit.frequency === 'object' && habit.frequency !== null ? habit.frequency : {};
    const mode = freq.mode || 'daily';
    if (mode === 'daily') return true;
    if (mode === 'once') return habit.startDate === dateIso;

    if (mode === 'specific_days' || mode === 'weekly') {
      const dateObj = new Date(dateIso + 'T00:00:00');
      const dayShortNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayFullNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIdx = dateObj.getDay();

      const shortName = dayShortNames[dayIdx];
      const fullName = dayFullNames[dayIdx];

      const activeDays: string[] = (freq.days || []).map((d: any) => String(d).toLowerCase().trim());
      if (activeDays.length > 0) {
        return activeDays.some(
          (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d)
        );
      }
      return true;
    }

    if (mode === 'monthly') {
      const dateObj = new Date(dateIso + 'T00:00:00');
      const targetDay = freq.monthlyDay || 1;
      return dateObj.getDate() === targetDay;
    }

    return true;
  };

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

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const [habitsRaw, lists, syllabusItems] = await Promise.all([
      prisma.habitItem.findMany({ where: { userId } }),
      prisma.checkList.findMany({ where: { userId } }),
      prisma.syllabusItem.findMany({ where: { userId } })
    ]);
    const habits = habitsRaw.map((h: any) => recalculateHabitStreak(h));

    const habitSubjects = Array.from(new Set(habits.map((h: any) => h.subject).filter(Boolean)));
    const syllabusSubjects = Array.from(
      new Set([
        ...syllabusItems.map((s: any) => s.subject).filter(Boolean),
        ...habitSubjects,
      ])
    );

    const dbCategories = syllabusItems.map((s: any) => String(s.category || '').trim()).filter(Boolean);
    const categories = Array.from(new Set(dbCategories));

    return NextResponse.json({ habits, lists, syllabusSubjects, syllabusItems, categories });
  } catch (error: any) {
    console.error('Failed to fetch habit tracker data:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const body = await req.json();
    const { action } = body;

    // Action: toggle_log
    if (action === 'toggle_log') {
      const { habitId, date, status, value, note } = body;
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        return NextResponse.json({ error: 'Backdating is disabled. Completion cannot be modified for past dates.' }, { status: 400 });
      }

      const habit = await prisma.habitItem.findFirst({
        where: { id: habitId, userId },
      });

      if (!habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
      }

      const history: any[] = Array.isArray(habit.history) ? [...(habit.history as any[])] : [];
      const existingIdx = history.findIndex((h: any) => h.date === date);

      const targetObj = typeof habit.target === 'object' && habit.target !== null ? (habit.target as any) : {};
      const targetVal = targetObj.value;

      if (existingIdx >= 0) {
        if (status === 'toggle') {
          const currentStatus = history[existingIdx].status;
          history[existingIdx].status = currentStatus === 'done' ? 'pending' : 'done';
          history[existingIdx].value = history[existingIdx].status === 'done' ? targetVal || 1 : 0;
        } else {
          history[existingIdx].status = status;
          if (value !== undefined) {
            if (body.increment || body.mode === 'increment') {
              const prev = history[existingIdx].value || 0;
              history[existingIdx].value = Number((prev + value).toFixed(2));
            } else {
              history[existingIdx].value = value;
            }
          }
          if (note !== undefined) history[existingIdx].note = note;

          const unit = targetObj.unit;
          const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';
          if (isNumericGoal) {
            const currentVal = history[existingIdx].value || 0;
            history[existingIdx].status = currentVal >= targetVal ? 'done' : 'pending';
          }
        }
      } else {
        const newStatus = status === 'toggle' ? 'done' : status;
        const newValue = value !== undefined ? value : (newStatus === 'done' ? targetVal || 1 : 0);
        let finalStatus = newStatus;
        const unit = targetObj.unit;
        const isNumericGoal = typeof targetVal === 'number' && targetVal > 0 && unit !== 'yes_no' && unit !== 'boolean';
        if (isNumericGoal && status !== 'toggle') {
          finalStatus = newValue >= targetVal ? 'done' : 'pending';
        }
        history.push({
          date,
          status: finalStatus,
          value: newValue,
          note: note || '',
        });
      }

      const updatedHabitObj = recalculateHabitStreak({ ...habit, history });

      await prisma.habitItem.update({
        where: { id: habit.id },
        data: {
          history,
          streakCurrent: updatedHabitObj.streakCurrent,
          streakBest: updatedHabitObj.streakBest,
        },
      });

      runFullConsistencyPipeline(userId).catch((err) =>
        console.error('Error auto-updating consistency pipeline after habit update:', err)
      );

      // Synchronize TopicRevision & SyllabusItem status when tasks are toggled
      if (habit.isStudyTask || habit.subject || habit.topic || habit.title.includes(':')) {
        try {
          const isDone = history.some((h: any) => h.date === date && h.status === 'done');
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
            const topicDoc = await prisma.topicRevision.findFirst({
              where: {
                userId,
                subject: { equals: cleanSubj, mode: 'insensitive' },
                topic: { equals: cleanTop, mode: 'insensitive' },
              },
            });

            if (topicDoc) {
              const revisionsArr: any[] = Array.isArray(topicDoc.revisions) ? [...(topicDoc.revisions as any[])] : [];
              let targetStage = 'First Read';
              if (habit.title.startsWith('[R1 Revision]')) targetStage = 'R1';
              else if (habit.title.startsWith('[R2 Revision]')) targetStage = 'R2';
              else if (habit.title.startsWith('[R3 Revision]')) targetStage = 'R3';

              let revEntry = revisionsArr.find((r: any) => r.stage === targetStage);
              if (!revEntry && targetStage !== 'First Read') {
                revEntry = { stage: targetStage, scheduledDate: date, completedDate: '', status: 'Pending' };
                revisionsArr.push(revEntry);
              }

              if (revEntry) {
                revEntry.status = isDone ? 'Completed' : 'Pending';
                revEntry.completedDate = isDone ? date : '';
              }

              let nextScheduledDate = topicDoc.nextScheduledDate;
              if (topicDoc.isAugmentedRevision !== false) {
                const r1 = revisionsArr.find((r: any) => r.stage === 'R1');
                const r2 = revisionsArr.find((r: any) => r.stage === 'R2');
                const r3 = revisionsArr.find((r: any) => r.stage === 'R3');

                if (r1 && r1.status !== 'Completed') nextScheduledDate = r1.scheduledDate || '';
                else if (r2 && r2.status !== 'Completed') nextScheduledDate = r2.scheduledDate || '';
                else if (r3 && r3.status !== 'Completed') nextScheduledDate = r3.scheduledDate || '';
                else nextScheduledDate = '';
              }

              await prisma.topicRevision.update({
                where: { id: topicDoc.id },
                data: {
                  revisions: revisionsArr,
                  lastRevisedDate: isDone ? date : topicDoc.lastRevisedDate,
                  firstReadDate: (isDone && targetStage === 'First Read' && !topicDoc.firstReadDate) ? date : topicDoc.firstReadDate,
                  nextScheduledDate,
                  isOverdue: false,
                },
              });
            }

            const sysItem = await prisma.syllabusItem.findFirst({
              where: {
                userId,
                subject: { equals: cleanSubj, mode: 'insensitive' },
              },
            });

            if (sysItem) {
              let targetKey = 'firstRead';
              if (habit.title.startsWith('[R1 Revision]')) targetKey = 'rev1';
              else if (habit.title.startsWith('[R2 Revision]')) targetKey = 'rev2';

              const itemRules = buildDynamicRulesFromLegacy(sysItem);
              const ruleIdx = itemRules.findIndex((r: any) => r.key === targetKey || r.key.includes(targetKey));
              if (ruleIdx !== -1) {
                itemRules[ruleIdx].completed = isDone;
              }

              await prisma.syllabusItem.update({
                where: { id: sysItem.id },
                data: {
                  rules: itemRules as any,
                  status: isDone ? 'In Progress' : 'Not Started',
                  date,
                },
              });
            }
          }
        } catch (err) {
          console.error('Failed to sync completion status with TopicRevision / SyllabusItem:', err);
        }
      }

      const habits = await prisma.habitItem.findMany({ where: { userId } });
      return NextResponse.json({ message: 'Log updated', habits: habits.map((h: any) => recalculateHabitStreak(h)) });
    }

    // Action: create
    if (action === 'create' || action === 'create_habit') {
      const { title, type, category, description, frequency, target, reminders, startDate, endDate, isStudyTask, subject, topic, color, icon, isAugmentedRevision } = body;

      const cleanSubject = (subject || '').trim();
      const categoryLabel = typeof category === 'string' ? category : (category?.label || category?.id || 'GS1');
      const resolvedIsAugmented = isAugmentedRevision !== undefined
        ? Boolean(isAugmentedRevision)
        : !(/csat|maths|mathematics|math/i.test(cleanSubject) || /csat|maths|mathematics|math/i.test(categoryLabel));

      const rawTarget = target || { value: null, unit: 'yes_no' };
      const isYesNoUnit = rawTarget.unit === 'yes_no' || rawTarget.unit === 'boolean';
      const cleanTarget = {
        unit: rawTarget.unit || 'yes_no',
        value: isYesNoUnit ? null : (rawTarget.value !== undefined ? rawTarget.value : 1),
      };

      const newHabit = await prisma.habitItem.create({
        data: {
          userId,
          type: type || 'habit',
          title,
          category: category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' },
          description: description || '',
          frequency: frequency || { mode: 'daily', days: [] },
          target: cleanTarget,
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
          history: [],
        },
      });

      if (isStudyTask && frequency?.mode === 'once' && subject && topic) {
        try {
          const taskStartDate = startDate || new Date().toISOString().split('T')[0];
          const cleanTopic = topic.trim();

          const sysItem = await prisma.syllabusItem.findFirst({
            where: { userId, subject: { equals: cleanSubject, mode: 'insensitive' } },
          });

          if (sysItem) {
            await prisma.syllabusItem.update({
              where: { id: sysItem.id },
              data: {
                status: sysItem.status === 'Not Started' ? 'In Progress' : sysItem.status,
                category: categoryLabel,
              },
            });
          }

          await processTopicTag(
            userId,
            {
              subject: cleanSubject,
              topic: cleanTopic,
              category: categoryLabel,
              isAugmentedRevision: resolvedIsAugmented,
            },
            taskStartDate
          );

          if (resolvedIsAugmented) {
            await createSrsTasksForTopic(userId, cleanSubject, cleanTopic, taskStartDate, category, true);
          }
        } catch (err) {
          console.error('Failed to sync study task with TopicRevision & Syllabus Matrix:', err);
        }
      }

      const habits = await prisma.habitItem.findMany({ where: { userId } });
      const syllabusItems = await prisma.syllabusItem.findMany({ where: { userId } });

      const studyTaskSubjects = habits
        .filter((h: any) => h.isStudyTask && h.subject)
        .map((h: any) => h.subject.trim());

      const syllabusSubjects = Array.from(
        new Set([
          ...syllabusItems.map((s: any) => s.subject).filter(Boolean),
          ...studyTaskSubjects,
        ])
      );

      return NextResponse.json({ message: 'Item created', habits, syllabusSubjects });
    }

    // Action: update
    if (action === 'update' || action === 'update_habit') {
      const { id, title, type, category, description, frequency, target, reminders, startDate, endDate, isStudyTask, subject, topic, color, icon, isAugmentedRevision } = body;

      const habit = await prisma.habitItem.findFirst({
        where: { id, userId },
      });

      if (habit) {
        const oldStartDate = habit.startDate;
        const newStartDate = startDate !== undefined ? startDate : habit.startDate;
        const oldSubject = habit.subject?.trim() || '';
        const oldTopic = habit.topic?.trim() || '';
        const newSubject = (subject !== undefined ? subject : habit.subject || '').trim();
        const newTopic = (topic !== undefined ? topic : habit.topic || '').trim();

        await prisma.habitItem.update({
          where: { id: habit.id },
          data: {
            title: title !== undefined ? title : habit.title,
            type: type !== undefined ? type : habit.type,
            category: category !== undefined ? category : habit.category,
            description: description !== undefined ? description : habit.description,
            frequency: frequency !== undefined ? frequency : habit.frequency,
            target: target !== undefined ? target : habit.target,
            reminders: reminders !== undefined ? reminders : habit.reminders,
            startDate: newStartDate,
            endDate: endDate !== undefined ? endDate : habit.endDate,
            isStudyTask: isStudyTask !== undefined ? !!isStudyTask : habit.isStudyTask,
            isAugmentedRevision: isAugmentedRevision !== undefined ? Boolean(isAugmentedRevision) : habit.isAugmentedRevision,
            subject: newSubject,
            topic: newTopic,
            color: color !== undefined ? color : habit.color,
            icon: icon !== undefined ? icon : habit.icon,
          },
        });

        // Reschedule SRS revision tasks & TopicRevision if startDate, subject or topic changed
        const subjToUse = newSubject || oldSubject;
        const topToUse = newTopic || oldTopic;

        if (subjToUse && topToUse && (oldStartDate !== newStartDate || oldSubject !== newSubject || oldTopic !== newTopic)) {
          const revisions = [
            { stage: 'R1 Revision (+7 Days)', days: 7, tag: '[R1 Revision]' },
            { stage: 'R2 Revision (+21 Days)', days: 21, tag: '[R2 Revision]' },
            { stage: 'R3 Revision (+45 Days)', days: 45, tag: '[R3 Revision]' },
          ];

          for (const r of revisions) {
            const revDate = addDaysStr(newStartDate, r.days);
            const oldRevTitlePattern = `${r.tag} ${oldSubject || subjToUse}: ${oldTopic || topToUse}`;
            const newRevTitle = `${r.tag} ${subjToUse}: ${topToUse}`;

            const existingRev = await prisma.habitItem.findFirst({
              where: {
                userId,
                OR: [
                  { title: oldRevTitlePattern },
                  { title: newRevTitle },
                  { AND: [{ subject: subjToUse }, { topic: topToUse }, { title: { startsWith: r.tag } }] },
                ],
              },
            });

            if (existingRev) {
              await prisma.habitItem.update({
                where: { id: existingRev.id },
                data: {
                  startDate: revDate,
                  title: newRevTitle,
                  subject: subjToUse,
                  topic: topToUse,
                  description: `Automated Spaced Repetition (${r.stage}) for topic read on ${newStartDate}`,
                },
              });
            }
          }

          // Update TopicRevision record
          const topicDoc = await prisma.topicRevision.findFirst({
            where: {
              userId,
              subject: { equals: subjToUse, mode: 'insensitive' },
              topic: { equals: topToUse, mode: 'insensitive' },
            },
          });

          if (topicDoc) {
            const r1Date = addDaysStr(newStartDate, 7);
            const r2Date = addDaysStr(newStartDate, 21);
            const r3Date = addDaysStr(newStartDate, 45);

            const revisionsArr: any[] = Array.isArray(topicDoc.revisions) ? [...(topicDoc.revisions as any[])] : [];
            revisionsArr.forEach((rev: any) => {
              if (rev.stage === 'First Read' && rev.status !== 'Completed') rev.scheduledDate = newStartDate;
              if (rev.stage === 'R1' && rev.status !== 'Completed') rev.scheduledDate = r1Date;
              if (rev.stage === 'R2' && rev.status !== 'Completed') rev.scheduledDate = r2Date;
              if (rev.stage === 'R3' && rev.status !== 'Completed') rev.scheduledDate = r3Date;
            });

            let nextScheduledDate = topicDoc.nextScheduledDate;
            const r1 = revisionsArr.find((r: any) => r.stage === 'R1');
            const r2 = revisionsArr.find((r: any) => r.stage === 'R2');
            const r3 = revisionsArr.find((r: any) => r.stage === 'R3');

            if (r1 && r1.status !== 'Completed') nextScheduledDate = r1.scheduledDate || r1Date;
            else if (r2 && r2.status !== 'Completed') nextScheduledDate = r2.scheduledDate || r2Date;
            else if (r3 && r3.status !== 'Completed') nextScheduledDate = r3.scheduledDate || r3Date;

            await prisma.topicRevision.update({
              where: { id: topicDoc.id },
              data: {
                firstReadDate: newStartDate,
                revisions: revisionsArr,
                nextScheduledDate,
              },
            });
          }
        }
      }

      const habits = await prisma.habitItem.findMany({ where: { userId } });
      return NextResponse.json({ message: 'Item updated', habits });
    }

    // Action: delete
    if (action === 'delete') {
      const { id } = body;
      const targetHabit = await prisma.habitItem.findFirst({
        where: { id, userId },
      });

      if (targetHabit) {
        let subject = targetHabit.subject?.trim() || '';
        let topic = targetHabit.topic?.trim() || '';

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

        if (topic) {
          if (subject) {
            await prisma.habitItem.deleteMany({
              where: {
                userId,
                subject: { equals: subject, mode: 'insensitive' },
                topic: { equals: topic, mode: 'insensitive' },
              },
            });

            await prisma.syllabusItem.deleteMany({
              where: {
                userId,
                subject: { equals: subject, mode: 'insensitive' },
                category: { equals: topic, mode: 'insensitive' },
              },
            });

            await prisma.topicRevision.deleteMany({
              where: {
                userId,
                subject: { equals: subject, mode: 'insensitive' },
                topic: { equals: topic, mode: 'insensitive' },
              },
            });
          } else {
            await prisma.habitItem.deleteMany({
              where: {
                userId,
                topic: { equals: topic, mode: 'insensitive' },
              },
            });

            await prisma.topicRevision.deleteMany({
              where: {
                userId,
                topic: { equals: topic, mode: 'insensitive' },
              },
            });
          }
        }

        await prisma.habitItem.deleteMany({ where: { id: targetHabit.id } });
      } else if (id) {
        await prisma.habitItem.deleteMany({ where: { id, userId } });
      }

      const habits = await prisma.habitItem.findMany({ where: { userId } });
      const syllabusItems = await prisma.syllabusItem.findMany({ where: { userId } });

      const studyTaskSubjects = habits
        .filter((h: any) => h.isStudyTask && h.subject)
        .map((h: any) => h.subject.trim());

      const syllabusSubjects = Array.from(
        new Set([
          ...syllabusItems.map((s: any) => s.subject).filter(Boolean),
          ...studyTaskSubjects,
        ])
      );

      return NextResponse.json({ message: 'Item deleted', habits, syllabusSubjects });
    }

    // Action: list items
    if (action === 'toggle_list_item') {
      const { listId, itemId } = body;
      const list = await prisma.checkList.findUnique({ where: { id: listId } });
      if (list) {
        const itemsArr: any[] = Array.isArray(list.items) ? [...(list.items as any[])] : [];
        const item = itemsArr.find((i: any) => i.id === itemId);
        if (item) {
          item.checked = !item.checked;
          await prisma.checkList.update({
            where: { id: list.id },
            data: { items: itemsArr },
          });
        }
      }
      const lists = await prisma.checkList.findMany({ where: { userId } });
      return NextResponse.json({ message: 'List item toggled', lists });
    }

    if (action === 'create_list') {
      const { title, color, items } = body;
      await prisma.checkList.create({
        data: {
          userId,
          title,
          color: color || '#6366F1',
          items: items || [],
        },
      });

      const lists = await prisma.checkList.findMany({ where: { userId } });
      return NextResponse.json({ message: 'List created', lists });
    }

    if (action === 'delete_list') {
      const { listId } = body;
      await prisma.checkList.deleteMany({ where: { id: listId, userId } });
      const lists = await prisma.checkList.findMany({ where: { userId } });
      return NextResponse.json({ message: 'List deleted', lists });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to update habit item:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
