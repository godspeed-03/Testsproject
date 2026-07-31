import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import HabitItem from '@/models/HabitItem';
import CheckList from '@/models/CheckList';
import SyllabusItem from '@/models/SyllabusItem';
import TopicRevision from '@/models/TopicRevision';
import { processTopicTag } from '@/lib/topicRevisionEngine';

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function createSrsTasksForTopic(userId: string, subject: string, topic: string, startDateStr: string) {
  if (!subject || !topic || !startDateStr) return;
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

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();

    // Clear legacy default seed items if present
    await HabitItem.deleteMany({
      $or: [
        { userId: '000000000000000000000000' },
        { title: { $in: ['Daily GS Revision & Answer Practice', 'Hydration Goal: 3 Liters Water', 'Submit Weekly PYQ Analysis Test', 'PW Online Mentorship Meeting'] } }
      ]
    });

    // Auto-sync TopicRevisions with HabitItem tasks for scheduled revisions
    const topicRevisions = await TopicRevision.find({
      $or: [{ userId }, { userId: '000000000000000000000000' }]
    }).lean();

    for (const tr of topicRevisions) {
      if (tr.subject && tr.topic && tr.firstReadDate) {
        await createSrsTasksForTopic(userId, tr.subject, tr.topic, tr.firstReadDate);
      }
    }

    let habits = await HabitItem.find({ userId }).lean();
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

    return NextResponse.json({ habits, lists, syllabusSubjects });
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
          if (value !== undefined) habit.history[existingIdx].value = value;
          if (note !== undefined) habit.history[existingIdx].note = note;
        }
      } else {
        const newStatus = status === 'toggle' ? 'done' : status;
        const newValue = value !== undefined ? value : (newStatus === 'done' ? habit.target.value : 0);
        habit.history.push({
          date,
          status: newStatus,
          value: newValue,
          note: note || ''
        });
      }

      // Recalculate streak
      const doneDates = new Set(habit.history.filter((h: any) => h.status === 'done').map((h: any) => h.date));
      let currentStreak = 0;
      let checkDate = new Date();

      for (let i = 0; i < 365; i++) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (doneDates.has(dStr)) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }

      habit.streakCurrent = currentStreak;
      if (currentStreak > habit.streakBest) {
        habit.streakBest = currentStreak;
      }

      await habit.save();

      // Auto-generate 3 Spaced Repetition Tasks (+7d, +21d, +45d) when a study task is completed
      if (habit.isStudyTask && habit.topic && habit.subject) {
        try {
          const logIdx = habit.history.findIndex((h: any) => h.date === date);
          if (logIdx >= 0 && habit.history[logIdx].status === 'done') {
            // Sync status with SyllabusItem
            const trimmedSubj = habit.subject.trim();
            const trimmedTopic = habit.topic.trim();

            let sysItem = await SyllabusItem.findOne({
              $or: [{ userId }, { userId: '000000000000000000000000' }],
              subject: trimmedSubj,
              category: trimmedTopic
            });

            if (sysItem) {
              sysItem.firstRead = true;
              sysItem.status = 'In Progress';
              sysItem.date = date;
              sysItem.nextRev = addDaysStr(date, 7);
              await sysItem.save();
            } else {
              await SyllabusItem.create({
                userId,
                subject: trimmedSubj,
                category: trimmedTopic,
                status: 'In Progress',
                firstRead: true,
                date: date,
                nextRev: addDaysStr(date, 7)
              });
            }

            const isSrsTask = habit.title.startsWith('[R1 Revision]') || habit.title.startsWith('[R2 Revision]') || habit.title.startsWith('[R3 Revision]');
            if (!isSrsTask) {
              const revisions = [
                { stage: 'R1 Revision (+7 Days)', days: 7, tag: '[R1 Revision]' },
                { stage: 'R2 Revision (+21 Days)', days: 21, tag: '[R2 Revision]' },
                { stage: 'R3 Revision (+45 Days)', days: 45, tag: '[R3 Revision]' }
              ];

              for (const r of revisions) {
                const revDate = addDaysStr(date, r.days);
                const revTitle = `${r.tag} ${habit.subject}: ${habit.topic}`;

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
                    description: `Automated Spaced Repetition (${r.stage}) for topic read on ${date}`,
                    priority: 'high',
                    frequency: { mode: 'once', days: [] },
                    target: { value: 1, unit: 'times' },
                    reminders: [{ time: '09:00', enabled: true }],
                    startDate: revDate,
                    endDate: null,
                    isStudyTask: true,
                    subject: habit.subject,
                    topic: habit.topic,
                    color: '#8B5CF6',
                    icon: '🔄',
                    streakCurrent: 0,
                    streakBest: 0,
                    history: []
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to generate automated Spaced Repetition tasks:', err);
        }
      }

      const habits = await HabitItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      return NextResponse.json({ message: 'Log updated', habits });
    }

    // Action: create (add new habit / task / event)
    if (action === 'create') {
      const { title, type, category, description, priority, frequency, target, reminders, startDate, endDate, isStudyTask, subject, topic, color, icon } = body;

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
        subject: subject || '',
        topic: topic || '',
        color: color || '#6366F1',
        icon: icon || '🏃',
        streakCurrent: 0,
        streakBest: 0,
        history: []
      });

      await newHabit.save();

      // Automatically link One-Time Study Tasks to Syllabus Matrix & TopicRevision (SRS)
      if (isStudyTask && frequency?.mode === 'once' && subject && topic) {
        try {
          const taskStartDate = startDate || new Date().toISOString().split('T')[0];
          await processTopicTag(
            userId,
            {
              subject: subject.trim(),
              topic: topic.trim(),
              category: 'GS1'
            },
            taskStartDate
          );
          await createSrsTasksForTopic(userId, subject, topic, taskStartDate);
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
    if (action === 'update') {
      const { id, title, type, category, description, priority, frequency, target, reminders, startDate, endDate, isStudyTask, subject, topic, color, icon } = body;

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
      const targetHabit = await HabitItem.findOne({
        _id: id,
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      });

      if (targetHabit) {
        if (targetHabit.isStudyTask || (targetHabit.subject && targetHabit.topic)) {
          const { subject, topic } = targetHabit;
          if (subject && topic) {
            const safeSubj = subject.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const safeTopic = topic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            await HabitItem.deleteMany({
              $or: [{ userId }, { userId: '000000000000000000000000' }],
              subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') },
              topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') }
            });
          }
        }

        await HabitItem.deleteOne({ _id: id });
      }

      const habits = await HabitItem.find({
        $or: [{ userId }, { userId: '000000000000000000000000' }]
      }).lean();

      return NextResponse.json({ message: 'Item deleted', habits });
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
