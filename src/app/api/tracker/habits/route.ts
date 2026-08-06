import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";
import { processTopicTag } from "@/lib/topicRevisionEngine";
import { buildDynamicRulesFromLegacy } from "@/lib/syllabusRules";
import { runFullConsistencyPipeline } from "@/lib/consistencyEngineV3";

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function createSrsTasksForTopic(
  userId: string,
  subject: string,
  topic: string,
  startDateStr: string,
  category?: any,
  isAugmentedRevision?: boolean,
) {
  if (!subject || !topic || !startDateStr) return;
  if (isAugmentedRevision === false) return;

  const revisions = [
    { stage: "R1 Revision (+7 Days)", days: 7, tag: "[R1 Revision]" },
    { stage: "R2 Revision (+21 Days)", days: 21, tag: "[R2 Revision]" },
    { stage: "R3 Revision (+45 Days)", days: 45, tag: "[R3 Revision]" },
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
          type: "task",
          title: revTitle,
          category: { id: "study", label: "Study & UPSC", icon: "📚", color: "#8B5CF6" },
          description: `Automated Spaced Repetition (${r.stage}) for topic read on ${startDateStr}`,
          frequency: { mode: "once", days: [] },
          target: { value: 1, unit: "times" },
          startDate: revDate,
          endDate: null,
          isStudyTask: true,
          isAugmentedRevision: true,
          subject: subject.trim(),
          topic: topic.trim(),
          color: "#8B5CF6",
          icon: "🔄",
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
  const targetObj = typeof habit.target === "object" && habit.target !== null ? habit.target : {};
  const targetVal = targetObj.value;
  const unit = targetObj.unit;
  const isNumericGoal = typeof targetVal === "number" && targetVal > 0 && unit !== "yes_no" && unit !== "boolean";

  if (isNumericGoal) {
    history.forEach((h: any) => {
      const val = h.value || 0;
      if (val < targetVal && h.status === "done") {
        h.status = "pending";
      }
    });
  }

  const doneDatesArr: string[] = Array.from(
    new Set<string>(history.filter((h: any) => h.status === "done").map((h: any) => String(h.date))),
  ).sort();

  if (doneDatesArr.length === 0) {
    habit.streakCurrent = 0;
    habit.streakBest = 0;
    return habit;
  }

  const doneDatesSet = new Set(doneDatesArr);
  const skippedDatesSet = new Set<string>(
    history.filter((h: any) => h.status === "skipped" || h.status === "rest").map((h: any) => String(h.date)),
  );
  const frozenDatesSet = new Set<string>(
    history
      .filter((h: any) => h.tier === 2 || h.streakAction === "freeze")
      .map((h: any) => String(h.date)),
  );

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const isScheduledForIso = (dateIso: string): boolean => {
    const startIso = habit.startDate ? String(habit.startDate).split("T")[0] : null;
    const endIso = habit.endDate ? String(habit.endDate).split("T")[0] : null;
    if (startIso && startIso > dateIso) return false;
    if (endIso && endIso < dateIso) return false;

    const freq = typeof habit.frequency === "object" && habit.frequency !== null ? habit.frequency : {};
    const mode = freq.mode || "daily";
    if (mode === "daily") return true;
    if (mode === "once") return startIso === dateIso;

    if (mode === "specific_days" || mode === "weekly") {
      const dateObj = new Date(dateIso + "T00:00:00");
      const dayShortNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const dayFullNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayIdx = dateObj.getDay();

      const shortName = dayShortNames[dayIdx];
      const fullName = dayFullNames[dayIdx];

      const activeDays: string[] = (freq.days || []).map((d: any) => String(d).toLowerCase().trim());
      if (activeDays.length > 0) {
        return activeDays.some(
          (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d),
        );
      }
      return true;
    }

    if (mode === "monthly") {
      const dateObj = new Date(dateIso + "T00:00:00");
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
    const cursor = new Date(startIso + "T00:00:00");

    for (let i = 0; i < 365; i++) {
      const currentIso = formatDateStr(cursor);
      const scheduled = isScheduledForIso(currentIso);

      if (scheduled) {
        if (doneDatesSet.has(currentIso)) {
          if (!frozenDatesSet.has(currentIso)) {
            chain++;
          }
          evaluatedDates.add(currentIso);
        } else if (skippedDatesSet.has(currentIso)) {
          // Rest Day: streak is preserved
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
  const cursor = new Date(startCheckIso + "T00:00:00");

  const isStartDone = doneDatesSet.has(startCheckIso);
  const isStartSkipped = skippedDatesSet.has(startCheckIso);
  const isStartScheduled = isScheduledForIso(startCheckIso);

  if (!isStartDone && !isStartSkipped && isStartScheduled) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const currentIso = formatDateStr(cursor);
    const scheduled = isScheduledForIso(currentIso);

    if (scheduled) {
      if (doneDatesSet.has(currentIso)) {
        if (!frozenDatesSet.has(currentIso)) {
          currentStreak++;
        }
      } else if (skippedDatesSet.has(currentIso)) {
        // Rest Day: streak is preserved
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.userId;

    const [habitsRaw, lists, syllabusItems, topicRevisions, batchedRevisions] = await Promise.all([
      prisma.habitItem.findMany({ where: { userId } }),
      prisma.checkList.findMany({ where: { userId } }),
      prisma.syllabusItem.findMany({ where: { userId } }),
      prisma.topicRevision.findMany({ where: { userId } }),
      prisma.batchedRevisionItem.findMany({ where: { userId } }),
    ]);

    const formattedTopicRevisions = topicRevisions.map((t) => ({
      id: t.customId || t.id,
      subject: t.subject,
      category: t.category,
      topic: t.topic,
      firstReadDate: t.firstReadDate,
      lastRevisedDate: t.lastRevisedDate,
      status: t.status,
      isAugmentedRevision: t.isAugmentedRevision,
      isBatchedRevision: t.isBatchedRevision,
      nextScheduledDate: t.nextScheduledDate,
      isOverdue: t.isOverdue,
      overdueDays: t.overdueDays,
      revisions: Array.isArray(t.revisions) ? t.revisions : [],
    }));

    const nowIst = new Date(new Date().getTime() + 5.5 * 3600000 + new Date().getTimezoneOffset() * 60000);
    const todayIso = nowIst.toISOString().split("T")[0];

    const habits = await Promise.all(
      habitsRaw.map(async (h: any) => {
        let modified = false;
        const history = Array.isArray(h.history) ? [...h.history] : [];
        const startDate = h.startDate || todayIso;

        const yesterdayObj = new Date(nowIst);
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterdayIso = yesterdayObj.toISOString().split("T")[0];

        let curr = startDate;
        const minDateObj = new Date(nowIst);
        minDateObj.setDate(minDateObj.getDate() - 30);
        const minIso = minDateObj.toISOString().split("T")[0];
        if (curr < minIso) curr = minIso;

        const checkScheduled = (dateIso: string): boolean => {
          if (h.startDate && h.startDate > dateIso) return false;
          if (h.endDate && h.endDate < dateIso) return false;
          const freq = typeof h.frequency === "object" && h.frequency !== null ? h.frequency : {};
          const mode = freq.mode || "daily";
          if (mode === "daily") return true;
          if (mode === "once") return h.startDate === dateIso;
          if (mode === "specific_days" || mode === "weekly") {
            const dateObj = new Date(dateIso + "T00:00:00");
            const dayShortNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            const dayFullNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const dayIdx = dateObj.getDay();
            const shortName = dayShortNames[dayIdx];
            const fullName = dayFullNames[dayIdx];
            const activeDays: string[] = (freq.days || []).map((d: any) => String(d).toLowerCase().trim());
            if (activeDays.length > 0) {
              return activeDays.some(
                (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d),
              );
            }
            return true;
          }
          if (mode === "monthly") {
            const dateObj = new Date(dateIso + "T00:00:00");
            return dateObj.getDate() === (freq.monthlyDay || 1);
          }
          return true;
        };

        while (curr <= yesterdayIso) {
          if (checkScheduled(curr)) {
            const existingIdx = history.findIndex((e: any) => e.date === curr);
            if (existingIdx === -1) {
              history.push({ date: curr, status: "failed", value: 0 });
              modified = true;
            } else {
              const entry = history[existingIdx];
              if (
                entry.status !== "done" &&
                entry.status !== "failed" &&
                entry.status !== "false" &&
                entry.status !== "skipped" &&
                entry.status !== "rest"
              ) {
                history[existingIdx] = { ...entry, status: "failed" };
                modified = true;
              }
            }
          }
          const dObj = new Date(curr + "T00:00:00");
          dObj.setDate(dObj.getDate() + 1);
          const y = dObj.getFullYear();
          const m = String(dObj.getMonth() + 1).padStart(2, "0");
          const day = String(dObj.getDate()).padStart(2, "0");
          curr = `${y}-${m}-${day}`;
        }

        if (modified) {
          h.history = history;
          await prisma.habitItem.update({
            where: { id: h.id },
            data: { history },
          });
        }

        if (h.target && ["hours", "hrs", "hour"].includes((h.target.unit || "").toLowerCase().trim())) {
          h.target = {
            unit: "minutes",
            value: Math.round((h.target.value || 1) * 60),
          };
        }
        return recalculateHabitStreak(h);
      }),
    );

    const habitSubjects = Array.from(new Set(habits.map((h: any) => h.subject).filter(Boolean)));
    const syllabusSubjects = Array.from(
      new Set([...syllabusItems.map((s: any) => s.subject).filter(Boolean), ...habitSubjects]),
    );

    const CATEGORY_ORDER = ["gs1", "gs2", "gs3", "gs4", "maths", "csat"];
    const dbCategories = syllabusItems.map((s: any) => String(s.category || "").trim()).filter(Boolean);
    const categories = Array.from(new Set(dbCategories)).sort((a, b) => {
      const aLower = a.toLowerCase().trim();
      const bLower = b.toLowerCase().trim();
      const aIdx = CATEGORY_ORDER.findIndex((c) => aLower === c || aLower.startsWith(c));
      const bIdx = CATEGORY_ORDER.findIndex((c) => bLower === c || bLower.startsWith(c));
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });

    return NextResponse.json({
      habits,
      lists,
      syllabusSubjects,
      syllabusItems,
      topicRevisions: formattedTopicRevisions,
      batchedRevisions,
      categories,
    });
  } catch (error: any) {
    console.error("Failed to fetch habit tracker data:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.userId;

    const body = await req.json();
    const { action } = body;

    // Action: mark_rest_day
    if (action === "mark_rest_day") {
      const { date } = body;
      const nowIst = new Date(new Date().getTime() + 5.5 * 3600000 + new Date().getTimezoneOffset() * 60000);
      const todayIso = nowIst.toISOString().split("T")[0];
      const targetDate = date || todayIso;

      const dObj = new Date(targetDate + "T00:00:00");
      dObj.setDate(dObj.getDate() + 1);
      const y = dObj.getFullYear();
      const m = String(dObj.getMonth() + 1).padStart(2, "0");
      const day = String(dObj.getDate()).padStart(2, "0");
      const nextDateIso = `${y}-${m}-${day}`;

      const userHabits = await prisma.habitItem.findMany({ where: { userId } });

      const checkScheduled = (h: any, dateIso: string): boolean => {
        const startIso = h.startDate ? String(h.startDate).split("T")[0] : null;
        const endIso = h.endDate ? String(h.endDate).split("T")[0] : null;

        if (startIso && startIso > dateIso) return false;
        if (endIso && endIso < dateIso) return false;
        const freq = typeof h.frequency === "object" && h.frequency !== null ? h.frequency : {};
        const mode = freq.mode || "daily";
        if (mode === "daily") return true;
        if (mode === "once") return startIso === dateIso;
        if (mode === "specific_days" || mode === "weekly") {
          const dateObj = new Date(dateIso + "T00:00:00");
          const dayShortNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
          const dayFullNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const dayIdx = dateObj.getDay();
          const shortName = dayShortNames[dayIdx];
          const fullName = dayFullNames[dayIdx];
          const activeDays: string[] = (freq.days || []).map((d: any) => String(d).toLowerCase().trim());
          if (activeDays.length > 0) {
            return activeDays.some(
              (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d),
            );
          }
          return true;
        }
        if (mode === "monthly") {
          const dateObj = new Date(dateIso + "T00:00:00");
          return dateObj.getDate() === (freq.monthlyDay || 1);
        }
        return true;
      };

      let shiftedTasksCount = 0;
      let restHabitsCount = 0;

      for (const h of userHabits) {
        if (!checkScheduled(h, targetDate)) continue;

        const history = Array.isArray(h.history) ? [...(h.history as any[])] : [];
        const targetHist = history.find((e: any) => e.date === targetDate);
        const isDone = targetHist?.status === "done";

        const hAny = h as any;
        if (h.type !== "habit") {
          if (!isDone) {
            await prisma.habitItem.update({
              where: { id: h.id },
              data: { startDate: nextDateIso },
            });
            shiftedTasksCount++;

            // Shift linked TopicRevision schedules if applicable
            if (hAny.topicRevisionId || h.type === "revision" || h.type === "batch_revision") {
              const topicRevId = hAny.topicRevisionId;
              const topicDoc = topicRevId
                ? await prisma.topicRevision.findFirst({ where: { id: topicRevId, userId } })
                : await prisma.topicRevision.findFirst({
                    where: {
                      userId,
                      topic: { equals: hAny.topic || h.title, mode: "insensitive" },
                      ...(hAny.subject ? { subject: { equals: hAny.subject, mode: "insensitive" } } : {}),
                    },
                  });

              if (topicDoc) {
                const revisions = Array.isArray(topicDoc.revisions) ? [...(topicDoc.revisions as any[])] : [];
                let revUpdated = false;
                revisions.forEach((r: any) => {
                  if (r.status === "Pending" && (r.scheduledDate === targetDate || !r.scheduledDate)) {
                    r.scheduledDate = nextDateIso;
                    revUpdated = true;
                  }
                });
                let nextSched = topicDoc.nextScheduledDate;
                if (nextSched === targetDate || !nextSched) {
                  nextSched = nextDateIso;
                  revUpdated = true;
                }
                if (revUpdated) {
                  await prisma.topicRevision.update({
                    where: { id: topicDoc.id },
                    data: {
                      nextScheduledDate: nextSched,
                      revisions,
                    },
                  });
                }
              }
            }
          }
        } else {
          if (!isDone) {
            if (targetHist) {
              targetHist.status = "skipped";
              targetHist.value = 0;
              targetHist.note = "Rest Day";
            } else {
              history.push({ date: targetDate, status: "skipped", value: 0, note: "Rest Day" });
            }
            const updatedH = recalculateHabitStreak({ ...h, history });
            await prisma.habitItem.update({
              where: { id: h.id },
              data: { history, streakCurrent: updatedH.streakCurrent, streakBest: updatedH.streakBest },
            });
            restHabitsCount++;
          }
        }
      }

      // Sweep through TopicRevision table to shift any remaining pending revisions scheduled for targetDate
      const uncompletedTopicRevs = await prisma.topicRevision.findMany({
        where: {
          userId,
          status: { not: "Completed" },
          OR: [{ nextScheduledDate: targetDate }, { firstReadDate: targetDate }],
        },
      });

      for (const tr of uncompletedTopicRevs) {
        const revisions = Array.isArray(tr.revisions) ? [...(tr.revisions as any[])] : [];
        let updated = false;
        revisions.forEach((r: any) => {
          if (r.status === "Pending" && r.scheduledDate === targetDate) {
            r.scheduledDate = nextDateIso;
            updated = true;
          }
        });
        let nextSched = tr.nextScheduledDate;
        if (nextSched === targetDate) {
          nextSched = nextDateIso;
          updated = true;
        }
        if (updated) {
          await prisma.topicRevision.update({
            where: { id: tr.id },
            data: {
              nextScheduledDate: nextSched,
              revisions,
            },
          });
        }
      }

      await runFullConsistencyPipeline(userId);

      const [updatedHabits, updatedTopicRevisions, updatedBatchedRevisions, updatedSyllabusItems] = await Promise.all([
        prisma.habitItem.findMany({ where: { userId } }),
        prisma.topicRevision.findMany({ where: { userId } }),
        prisma.batchedRevisionItem.findMany({ where: { userId } }),
        prisma.syllabusItem.findMany({ where: { userId } }),
      ]);

      return NextResponse.json({
        success: true,
        habits: updatedHabits,
        topicRevisions: updatedTopicRevisions,
        batchedRevisions: updatedBatchedRevisions,
        syllabusItems: updatedSyllabusItems,
        shiftedTasksCount,
        restHabitsCount,
        nextDateIso,
      });
    }

    // Action: toggle_log
    if (action === "toggle_log") {
      const { habitId, date, status, value, note } = body;
      const todayStr = new Date().toISOString().split("T")[0];
      if (date < todayStr) {
        return NextResponse.json(
          { error: "Backdating is disabled. Completion cannot be modified for past dates." },
          { status: 400 },
        );
      }

      const habit = await prisma.habitItem.findFirst({
        where: { id: habitId, userId },
      });

      if (!habit) {
        return NextResponse.json({ error: "Habit not found" }, { status: 404 });
      }

      const history: any[] = Array.isArray(habit.history) ? [...(habit.history as any[])] : [];
      const existingIdx = history.findIndex((h: any) => h.date === date);

      const targetObj = typeof habit.target === "object" && habit.target !== null ? (habit.target as any) : {};
      const targetVal = targetObj.value;

      if (existingIdx >= 0) {
        if (body.completedTopics !== undefined) {
          history[existingIdx].completedTopics = body.completedTopics;
        }
        if (status === "toggle") {
          const currentStatus = history[existingIdx].status;
          if (currentStatus === "done") {
            history[existingIdx].status = "failed";
            history[existingIdx].value = 0;
          } else if (currentStatus === "failed" || currentStatus === "false") {
            history.splice(existingIdx, 1);
          } else {
            history[existingIdx].status = "done";
            history[existingIdx].value = targetVal || 1;
          }
        } else {
          history[existingIdx].status = status;
          if (value !== undefined) {
            if (body.increment || body.mode === "increment") {
              const prev = history[existingIdx].value || 0;
              history[existingIdx].value = Number((prev + value).toFixed(2));
            } else {
              history[existingIdx].value = value;
            }
          }
          if (note !== undefined) history[existingIdx].note = note;
          if (body.wakeTime !== undefined) history[existingIdx].wakeTime = body.wakeTime;
          if (body.tier !== undefined) {
            history[existingIdx].tier = body.tier;
            if (body.tier === 2) history[existingIdx].streakAction = "freeze";
          }
          if (body.pts !== undefined) history[existingIdx].pts = body.pts;

          const unit = targetObj.unit;
          const isNumericGoal =
            typeof targetVal === "number" && targetVal > 0 && unit !== "yes_no" && unit !== "boolean" && unit !== "time";
          if (isNumericGoal) {
            const currentVal = history[existingIdx].value || 0;
            history[existingIdx].status = currentVal >= targetVal ? "done" : "pending";
          }
        }
      } else {
        const newStatus = status === "toggle" ? "done" : status;
        const newValue = value !== undefined ? value : newStatus === "done" ? targetVal || 1 : 0;
        let finalStatus = newStatus;
        const unit = targetObj.unit;
        const isNumericGoal = typeof targetVal === "number" && targetVal > 0 && unit !== "yes_no" && unit !== "boolean" && unit !== "time";
        if (isNumericGoal && status !== "toggle") {
          finalStatus = newValue >= targetVal ? "done" : "pending";
        }
        history.push({
          date,
          status: finalStatus,
          value: newValue,
          note: note || (body.wakeTime ? `Wake-Up at ${body.wakeTime}` : ""),
          wakeTime: body.wakeTime,
          tier: body.tier,
          pts: body.pts,
          streakAction: body.tier === 2 ? "freeze" : undefined,
          ...(body.completedTopics !== undefined ? { completedTopics: body.completedTopics } : {}),
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
        console.error("Error auto-updating consistency pipeline after habit update:", err),
      );

      // Synchronize TopicRevision & SyllabusItem status when tasks are toggled
      const habitAny = habit as any;
      if (
        habit.isStudyTask ||
        habit.subject ||
        habit.topic ||
        habit.title.includes(":") ||
        habitAny.selectedMicroTopicsCluster ||
        habitAny.isBatchRevision
      ) {
        try {
          const isDone = history.some((h: any) => h.date === date && h.status === "done");
          const currentHist = history.find((h: any) => h.date === date);
          const completedTopicsSet = new Set<string>(
            Array.isArray(currentHist?.completedTopics) ? currentHist.completedTopics : [],
          );

          // Assemble list of topics to sync
          let topicsToSync: Array<{ subject: string; topic: string; isTopicDone: boolean }> = [];

          const habitObj = habit as any;
          const existingBatchRecord = await prisma.batchedRevisionItem.findFirst({
            where: { userId, habitId: habit.id },
          });

          const cluster =
            Array.isArray(habitObj.selectedMicroTopicsCluster) && habitObj.selectedMicroTopicsCluster.length > 0
              ? habitObj.selectedMicroTopicsCluster
              : Array.isArray(existingBatchRecord?.topicStatuses) && (existingBatchRecord?.topicStatuses as any[]).length > 0
                ? (existingBatchRecord?.topicStatuses as any[])
                : [];

          if (cluster.length > 0) {
            topicsToSync = cluster.map((item: any) => {
              const itemTopic = String(item.topic || item.topicId || "")
                .trim()
                .toLowerCase();
              const itemSubj = String(item.subject || "")
                .trim()
                .toLowerCase();

              const isTopicDone =
                isDone ||
                Array.from(completedTopicsSet).some((savedKey: string) => {
                  const s = String(savedKey).trim().toLowerCase();
                  return s === itemTopic || s.endsWith(`|${itemTopic}`) || s.includes(`|${itemSubj}|${itemTopic}`);
                });

              return {
                subject: item.subject || habit.subject || "General",
                topic: item.topic || item.topicId,
                isTopicDone,
              };
            });
          } else {
            let cleanSubj = habit.subject?.trim() || "";
            let cleanTop = habit.topic?.trim() || "";

            if (!cleanSubj || !cleanTop) {
              const cleanTitle = habit.title.replace(/^\[R[123]\s+Revision\]\s*/i, "").trim();
              if (cleanTitle.includes(":")) {
                const parts = cleanTitle.split(":");
                if (parts.length >= 2) {
                  cleanSubj = parts[0].trim();
                  cleanTop = parts.slice(1).join(":").trim();
                }
              }
            }

            if (cleanSubj && cleanTop) {
              const subTopics = cleanTop
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean);
              topicsToSync = subTopics.map((topName: string) => ({
                subject: cleanSubj,
                topic: topName,
                isTopicDone: isDone,
              }));
            }
          }

          const isBatchRevision = Boolean(habit.isBatchRevision);

          // Loop & sync each TopicRevision record in DB ONLY when all topics of its subject are 100% completed
          for (const item of topicsToSync) {
            if (!item.subject || !item.topic) continue;

            const subjectTopics = topicsToSync.filter(
              (t) => t.subject.toLowerCase().trim() === item.subject.toLowerCase().trim(),
            );
            const isSubjectFullyDone = subjectTopics.length > 0 && subjectTopics.every((t) => t.isTopicDone);

            let topicDoc = await prisma.topicRevision.findFirst({
              where: {
                userId,
                subject: { equals: item.subject, mode: "insensitive" },
                topic: { equals: item.topic, mode: "insensitive" },
              },
            });

            if (!topicDoc && isSubjectFullyDone) {
              topicDoc = await processTopicTag(
                userId,
                {
                  subject: item.subject,
                  topic: item.topic,
                  category: "GS1",
                  isRevision: true,
                  isAugmentedRevision: true,
                },
                date,
              );
            }

            if (topicDoc && isSubjectFullyDone) {
              const revisionsArr: any[] = Array.isArray(topicDoc.revisions) ? [...(topicDoc.revisions as any[])] : [];

              if (isBatchRevision) {
                const extraStageName = `Extra Revision (Batch: ${habit.title || "Cluster"})`;
                let extraEntry = revisionsArr.find((r: any) => r.stage === extraStageName && r.completedDate === date);
                if (!extraEntry) {
                  revisionsArr.push({
                    stage: extraStageName,
                    scheduledDate: date,
                    completedDate: date,
                    status: "Completed",
                    note: "Logged via Batched Revision Task",
                  });
                }

                await prisma.topicRevision.update({
                  where: { id: topicDoc.id },
                  data: {
                    revisions: revisionsArr,
                    lastRevisedDate: date,
                  },
                });
              } else {
                let targetStage = "";
                if (habit.title.startsWith("[R1 Revision]")) targetStage = "R1";
                else if (habit.title.startsWith("[R2 Revision]")) targetStage = "R2";
                else if (habit.title.startsWith("[R3 Revision]")) targetStage = "R3";
                else {
                  const pendingRev = revisionsArr.find((r: any) => r.status === "Pending" || !r.completedDate);
                  targetStage = pendingRev
                    ? pendingRev.stage
                    : revisionsArr.length > 0
                      ? `R${revisionsArr.length}`
                      : "First Read";
                }

                let revEntry = revisionsArr.find((r: any) => r.stage === targetStage);
                if (!revEntry) {
                  revEntry = { stage: targetStage, scheduledDate: date, completedDate: "", status: "Pending" };
                  revisionsArr.push(revEntry);
                }

                revEntry.status = "Completed";
                revEntry.completedDate = date;

                let nextSched = topicDoc.nextScheduledDate || "";
                if (targetStage === "First Read" || targetStage === "R1") {
                  nextSched = addDaysStr(date, 14);
                } else if (targetStage === "R2") {
                  nextSched = addDaysStr(date, 24);
                } else if (targetStage === "R3") {
                  nextSched = addDaysStr(date, 30);
                }

                await prisma.topicRevision.update({
                  where: { id: topicDoc.id },
                  data: {
                    revisions: revisionsArr,
                    lastRevisedDate: date,
                    firstReadDate: topicDoc.firstReadDate || date,
                    nextScheduledDate: nextSched,
                    isOverdue: false,
                    overdueDays: 0,
                    status: "Completed",
                  },
                });
              }
            }
          }

          // Sync linked BatchedRevisionItem table record in PostgreSQL ONLY if it is a Batch Revision item
          try {
            const existingBatchRecord = await prisma.batchedRevisionItem.findFirst({
              where: { userId, habitId: habit.id },
            });

            if (existingBatchRecord || isBatchRevision) {
              const existingStatuses: any[] = Array.isArray(existingBatchRecord?.topicStatuses)
                ? (existingBatchRecord.topicStatuses as any[])
                : [];
              const existingRevIds: any[] = Array.isArray(existingBatchRecord?.topicRevisionIds)
                ? (existingBatchRecord.topicRevisionIds as any[])
                : [];

              const topicRevDocs =
                topicsToSync.length > 0
                  ? await prisma.topicRevision.findMany({
                      where: {
                        userId,
                        OR: topicsToSync.map((t) => ({
                          subject: { equals: t.subject, mode: "insensitive" },
                          topic: { equals: t.topic, mode: "insensitive" },
                        })),
                      },
                    })
                  : [];

              const updatedStatuses = topicsToSync.map((t) => {
                const matchedRevDoc = topicRevDocs.find(
                  (rd) =>
                    rd.subject.toLowerCase() === t.subject.toLowerCase() &&
                    rd.topic.toLowerCase() === t.topic.toLowerCase(),
                );
                const prevStatus = existingStatuses.find(
                  (s: any) => String(s.topic).toLowerCase() === t.topic.toLowerCase(),
                );
                return {
                  topicId: prevStatus?.topicId || t.topic,
                  topic: t.topic,
                  subject: t.subject,
                  category: prevStatus?.category || (t as any).category || "GS1",
                  syllabusItemId: prevStatus?.syllabusItemId || null,
                  isDone: t.isTopicDone,
                  completedDate: t.isTopicDone ? date : "",
                  topicRevisionId: matchedRevDoc?.id || prevStatus?.topicRevisionId || null,
                };
              });

              const currentTopicRevIds = updatedStatuses.map((t) => t.topicRevisionId).filter(Boolean);
              const combinedTopicRevIds = Array.from(new Set([...existingRevIds, ...currentTopicRevIds]));

              const uniqueSubjectIds = Array.from(
                new Set(updatedStatuses.flatMap((t: any) => [t.subject, t.syllabusItemId, t.topicId]).filter(Boolean)),
              );

              const isAllTopicsDone = topicsToSync.length > 0 && topicsToSync.every((t) => t.isTopicDone);

              if (existingBatchRecord) {
                await prisma.batchedRevisionItem.update({
                  where: { id: existingBatchRecord.id },
                  data: {
                    title: habit.title,
                    topicRevisionIds: combinedTopicRevIds as any,
                    subjectIds: uniqueSubjectIds as any,
                    topicStatuses: updatedStatuses as any,
                    isAllDone: isAllTopicsDone,
                    completedDate: isAllTopicsDone ? date : "",
                  },
                });
              } else if (isBatchRevision) {
                await prisma.batchedRevisionItem.create({
                  data: {
                    userId,
                    habitId: habit.id,
                    topicRevisionIds: combinedTopicRevIds as any,
                    title: habit.title,
                    subjectIds: uniqueSubjectIds as any,
                    topicStatuses: updatedStatuses as any,
                    isAllDone: isAllTopicsDone,
                    completedDate: isAllTopicsDone ? date : "",
                  },
                });
              }
            }
          } catch (batchErr) {
            console.error("Failed to sync BatchedRevisionItem table:", batchErr);
          }

          let cleanSubj = habit.subject?.trim() || "";
          if (!cleanSubj) {
            const cleanTitle = habit.title.replace(/^\[R[123]\s+Revision\]\s*/i, "").trim();
            if (cleanTitle.includes(":")) {
              const parts = cleanTitle.split(":");
              if (parts.length >= 2) {
                cleanSubj = parts[0].trim();
              }
            }
          }

          if (cleanSubj) {
            const sysItem = await prisma.syllabusItem.findFirst({
              where: {
                userId,
                subject: { equals: cleanSubj, mode: "insensitive" },
              },
            });

            if (sysItem) {
              let targetKey = "firstRead";
              if (habit.title.startsWith("[R1 Revision]")) targetKey = "rev1";
              else if (habit.title.startsWith("[R2 Revision]")) targetKey = "rev2";

              const itemRules = buildDynamicRulesFromLegacy(sysItem);
              const ruleIdx = itemRules.findIndex((r: any) => r.key === targetKey || r.key.includes(targetKey));
              if (ruleIdx !== -1) {
                itemRules[ruleIdx].completed = isDone;
              }

              await prisma.syllabusItem.update({
                where: { id: sysItem.id },
                data: {
                  rules: itemRules as any,
                  status: isDone ? "In Progress" : "Not Started",
                  date,
                },
              });
            }
          }
        } catch (err) {
          console.error("Failed to sync completion status with TopicRevision / SyllabusItem:", err);
        }
      }

      const habits = await prisma.habitItem.findMany({ where: { userId } });
      return NextResponse.json({ message: "Log updated", habits: habits.map((h: any) => recalculateHabitStreak(h)) });
    }

    // Action: create
    if (action === "create" || action === "create_habit") {
      const {
        title,
        type,
        category,
        description,
        frequency,
        target,
        startDate,
        endDate,
        isStudyTask,
        subject,
        topic,
        color,
        icon,
        isAugmentedRevision,
      } = body;

      const cleanSubject = (subject || "").trim();
      const categoryLabel = typeof category === "string" ? category : category?.label || category?.id || "GS1";
      const isBatchRevTask = Boolean(body.isBatchRevision);

      const resolvedIsAugmented = isBatchRevTask
        ? false
        : isAugmentedRevision !== undefined
          ? Boolean(isAugmentedRevision)
          : !(/csat|maths|mathematics|math/i.test(cleanSubject) || /csat|maths|mathematics|math/i.test(categoryLabel));

      const rawTarget = target || { value: null, unit: "yes_no" };
      const rawUnitStr = (rawTarget.unit || "yes_no").toLowerCase().trim();
      const isYesNoUnit = rawUnitStr === "yes_no" || rawUnitStr === "boolean";
      let targetUnit = rawTarget.unit || "yes_no";
      let targetVal = isYesNoUnit ? null : rawTarget.value !== undefined ? rawTarget.value : 1;

      if (["hours", "hrs", "hour"].includes(rawUnitStr)) {
        targetUnit = "minutes";
        targetVal = targetVal !== null ? Math.round(targetVal * 60) : 60;
      }

      const cleanTarget = {
        unit: targetUnit,
        value: targetVal,
      };

      const newHabit = await prisma.habitItem.create({
        data: {
          userId,
          type: type || "habit",
          title,
          category: category || { id: "general", label: "General", icon: "📌", color: "#6366F1" },
          description: description || "",
          frequency: frequency || { mode: "daily", days: [] },
          target: cleanTarget,
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate: endDate || null,
          isStudyTask: !!isStudyTask,
          isAugmentedRevision: resolvedIsAugmented,
          isBatchRevision: isBatchRevTask,
          subject: cleanSubject,
          topic: isBatchRevTask ? (topic || "").trim() || title || "Batched Revision" : (topic || "").trim(),
          color: color || "#6366F1",
          icon: icon || "🏃",
          streakCurrent: 0,
          streakBest: 0,
          history: [],
        },
      });

      const taskStartDate = startDate || new Date().toISOString().split("T")[0];
      const rawCluster: Array<{ category?: string; subject?: string; topic?: string }> =
        Array.isArray(body.selectedMicroTopicsCluster) && body.selectedMicroTopicsCluster.length > 0
          ? body.selectedMicroTopicsCluster
          : [];

      if (isBatchRevTask && rawCluster.length > 0) {
        try {
          const batchTitle = newHabit.title || "Batched Revision";

          // 1. Group cluster topics by distinct subject
          const distinctSubjectsMap = new Map<string, string>(); // subject -> category
          const resolvedItemsMap = new Map<string, { subject: string; category: string }>();

          for (const rawItem of rawCluster) {
            const itemObj = (typeof rawItem === "string" ? { topic: rawItem } : rawItem || {}) as any;
            const itemTopic = String(itemObj.topic || itemObj.name || itemObj.topicName || itemObj.title || "").trim();
            if (!itemTopic) continue;

            let itemSubj = String(itemObj.subject || itemObj.subjectName || "").trim();
            if (!itemSubj || itemSubj.toLowerCase() === "weekly revision" || itemSubj.toLowerCase() === "batch revision") {
              const matchingSys = await prisma.syllabusItem.findFirst({
                where: {
                  userId,
                  category: { equals: itemTopic, mode: "insensitive" },
                },
              });
              if (matchingSys?.subject) {
                itemSubj = matchingSys.subject;
              } else {
                const matchingRev = await prisma.topicRevision.findFirst({
                  where: {
                    userId,
                    topic: { equals: itemTopic, mode: "insensitive" },
                  },
                });
                if (matchingRev?.subject) {
                  itemSubj = matchingRev.subject;
                } else {
                  itemSubj = cleanSubject || "Weekly Revision";
                }
              }
            }

            let itemCat = String(itemObj.category || itemObj.categoryLabel || "").trim();
            if (!itemCat || itemCat === "REV" || itemCat === "N/A") {
              itemCat = categoryLabel || "GS1";
            }

            resolvedItemsMap.set(itemTopic, { subject: itemSubj, category: itemCat });

            if (!distinctSubjectsMap.has(itemSubj)) {
              distinctSubjectsMap.set(itemSubj, itemCat);
            }
          }

          if (distinctSubjectsMap.size === 0) {
            const fallbackSubj = cleanSubject || "Weekly Revision";
            distinctSubjectsMap.set(fallbackSubj, categoryLabel || "REV");
          }

          // 2. Create ONE TopicRevision row for EACH distinct subject in the cluster (topic = batchTitle)
          const subjectToRevIdMap: Record<string, string> = {};
          const createdTopicRevIds: string[] = [];

          for (const [subj, cat] of Array.from(distinctSubjectsMap.entries())) {
            const topicDoc = await processTopicTag(
              userId,
              {
                subject: subj,
                topic: batchTitle,
                category: cat,
                isAugmentedRevision: false,
                isBatchedRevision: true,
              },
              taskStartDate,
            );

            if (topicDoc?.id) {
              subjectToRevIdMap[subj] = topicDoc.id;
              createdTopicRevIds.push(topicDoc.id);
            }
          }

          // 3. Build micro-topic statuses list linking each topic to its subject's TopicRevision ID
          const topicStatusesList: Array<{
            topicId: string;
            topicRevisionId?: string | null;
            syllabusItemId?: string | null;
            topic: string;
            subject: string;
            category: string;
            isDone: boolean;
          }> = [];

          for (const rawItem of rawCluster) {
            const itemObj = (typeof rawItem === "string" ? { topic: rawItem } : rawItem || {}) as any;
            const itemTopic = String(itemObj.topic || itemObj.name || itemObj.topicName || itemObj.title || "").trim();
            if (!itemTopic) continue;

            const resolved = resolvedItemsMap.get(itemTopic) || {
              subject: cleanSubject || "Weekly Revision",
              category: categoryLabel || "GS1",
            };
            const itemSubj = resolved.subject;
            const itemCat = resolved.category;
            const topicRevId = subjectToRevIdMap[itemSubj] || createdTopicRevIds[0] || null;

            const sysItem = await prisma.syllabusItem.findFirst({
              where: { userId, subject: { equals: itemSubj, mode: "insensitive" } },
            });

            if (sysItem) {
              await prisma.syllabusItem.update({
                where: { id: sysItem.id },
                data: {
                  status: sysItem.status === "Not Started" ? "In Progress" : sysItem.status,
                  category: itemCat !== "N/A" ? itemCat : sysItem.category,
                },
              });
            }

            topicStatusesList.push({
              topicId: topicRevId || itemTopic,
              topicRevisionId: topicRevId,
              syllabusItemId: sysItem?.id || null,
              topic: itemTopic,
              subject: itemSubj,
              category: itemCat,
              isDone: false,
            });
          }

          const uniqueSubjectIds = Array.from(
            new Set([
              ...Array.from(distinctSubjectsMap.keys()),
              ...createdTopicRevIds,
              ...topicStatusesList
                .flatMap((t) => [t.subject, t.syllabusItemId, t.topicRevisionId, t.topicId])
                .filter(Boolean),
            ]),
          );

          // 4. Create linked BatchedRevisionItem record in PostgreSQL with createdTopicRevIds array
          await prisma.batchedRevisionItem.create({
            data: {
              userId,
              habitId: newHabit.id,
              topicRevisionIds: createdTopicRevIds as any,
              title: newHabit.title,
              subjectIds: uniqueSubjectIds as any,
              topicStatuses: topicStatusesList as any,
              isAllDone: false,
              completedDate: "",
            },
          });
        } catch (err) {
          console.error("Failed to sync batch revision cluster topics:", err);
        }
      } else if (
        isStudyTask &&
        (topic || (Array.isArray(body.selectedMicroTopics) && body.selectedMicroTopics.length > 0))
      ) {
        try {
          const effectiveSubj = cleanSubject || "All";
          const effectiveCat = categoryLabel || "N/A";

          const sysItem = await prisma.syllabusItem.findFirst({
            where: { userId, subject: { equals: effectiveSubj, mode: "insensitive" } },
          });

          if (sysItem) {
            await prisma.syllabusItem.update({
              where: { id: sysItem.id },
              data: {
                status: sysItem.status === "Not Started" ? "In Progress" : sysItem.status,
                category: effectiveCat !== "N/A" ? effectiveCat : sysItem.category,
              },
            });
          }

          const topicList: string[] =
            Array.isArray(body.selectedMicroTopics) && body.selectedMicroTopics.length > 0
              ? body.selectedMicroTopics
              : typeof topic === "string" && topic.includes(",")
                ? topic
                    .split(",")
                    .map((t: string) => t.trim())
                    .filter(Boolean)
                : [topic?.trim()].filter(Boolean);

          for (const singleTopic of topicList) {
            if (!singleTopic) continue;
            await processTopicTag(
              userId,
              {
                subject: effectiveSubj,
                topic: singleTopic,
                category: effectiveCat,
                isAugmentedRevision: resolvedIsAugmented,
              },
              taskStartDate,
            );

            if (resolvedIsAugmented) {
              await createSrsTasksForTopic(userId, effectiveSubj, singleTopic, taskStartDate, category, true);
            }
          }
        } catch (err) {
          console.error("Failed to sync study task with TopicRevision & Syllabus Matrix:", err);
        }
      }

      const [habits, syllabusItems, batchedRevisions, topicRevisions] = await Promise.all([
        prisma.habitItem.findMany({ where: { userId } }),
        prisma.syllabusItem.findMany({ where: { userId } }),
        prisma.batchedRevisionItem.findMany({ where: { userId } }),
        prisma.topicRevision.findMany({ where: { userId } }),
      ]);

      const studyTaskSubjects = habits.filter((h: any) => h.isStudyTask && h.subject).map((h: any) => h.subject.trim());

      const syllabusSubjects = Array.from(
        new Set([...syllabusItems.map((s: any) => s.subject).filter(Boolean), ...studyTaskSubjects]),
      );

      return NextResponse.json({ message: "Item created", habits, syllabusSubjects, batchedRevisions, topicRevisions });
    }

    // Action: update
    if (action === "update" || action === "update_habit") {
      const {
        id,
        title,
        type,
        category,
        description,
        frequency,
        target,
        startDate,
        endDate,
        isStudyTask,
        subject,
        topic,
        color,
        icon,
        isAugmentedRevision,
      } = body;

      const habit = await prisma.habitItem.findFirst({
        where: { id, userId },
      });

      if (habit) {
        const oldStartDate = habit.startDate;
        const newStartDate = startDate !== undefined ? startDate : habit.startDate;
        const oldSubject = habit.subject?.trim() || "";
        const oldTopic = habit.topic?.trim() || "";
        const newSubject = (subject !== undefined ? subject : habit.subject || "").trim();
        const newTopic = (topic !== undefined ? topic : habit.topic || "").trim();

        let targetToSave = target !== undefined ? target : habit.target;
        if (targetToSave && ["hours", "hrs", "hour"].includes((targetToSave.unit || "").toLowerCase().trim())) {
          targetToSave = {
            unit: "minutes",
            value: Math.round((targetToSave.value || 1) * 60),
          };
        }

        await prisma.habitItem.update({
          where: { id: habit.id },
          data: {
            title: title !== undefined ? title : habit.title,
            type: type !== undefined ? type : habit.type,
            category: category !== undefined ? category : habit.category,
            description: description !== undefined ? description : habit.description,
            frequency: frequency !== undefined ? frequency : habit.frequency,
            target: targetToSave,
            startDate: newStartDate,
            endDate: endDate !== undefined ? endDate : habit.endDate,
            isStudyTask: isStudyTask !== undefined ? !!isStudyTask : habit.isStudyTask,
            isAugmentedRevision:
              isAugmentedRevision !== undefined ? Boolean(isAugmentedRevision) : habit.isAugmentedRevision,
            subject: newSubject,
            topic: newTopic,
            color: color !== undefined ? color : habit.color,
            icon: icon !== undefined ? icon : habit.icon,
          },
        });

        // Reschedule SRS revision tasks & TopicRevision if startDate, subject or topic changed
        const subjToUse = newSubject || oldSubject;
        const topToUse = newTopic || oldTopic;

        if (
          subjToUse &&
          topToUse &&
          (oldStartDate !== newStartDate || oldSubject !== newSubject || oldTopic !== newTopic)
        ) {
          const revisions = [
            { stage: "R1 Revision (+7 Days)", days: 7, tag: "[R1 Revision]" },
            { stage: "R2 Revision (+21 Days)", days: 21, tag: "[R2 Revision]" },
            { stage: "R3 Revision (+45 Days)", days: 45, tag: "[R3 Revision]" },
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
              subject: { equals: subjToUse, mode: "insensitive" },
              topic: { equals: topToUse, mode: "insensitive" },
            },
          });

          if (topicDoc) {
            const r1Date = addDaysStr(newStartDate, 7);
            const r2Date = addDaysStr(newStartDate, 21);
            const r3Date = addDaysStr(newStartDate, 45);

            const revisionsArr: any[] = Array.isArray(topicDoc.revisions) ? [...(topicDoc.revisions as any[])] : [];
            revisionsArr.forEach((rev: any) => {
              if (rev.stage === "First Read" && rev.status !== "Completed") rev.scheduledDate = newStartDate;
              if (rev.stage === "R1" && rev.status !== "Completed") rev.scheduledDate = r1Date;
              if (rev.stage === "R2" && rev.status !== "Completed") rev.scheduledDate = r2Date;
              if (rev.stage === "R3" && rev.status !== "Completed") rev.scheduledDate = r3Date;
            });

            let nextScheduledDate = topicDoc.nextScheduledDate;
            const r1 = revisionsArr.find((r: any) => r.stage === "R1");
            const r2 = revisionsArr.find((r: any) => r.stage === "R2");
            const r3 = revisionsArr.find((r: any) => r.stage === "R3");

            if (r1 && r1.status !== "Completed") nextScheduledDate = r1.scheduledDate || r1Date;
            else if (r2 && r2.status !== "Completed") nextScheduledDate = r2.scheduledDate || r2Date;
            else if (r3 && r3.status !== "Completed") nextScheduledDate = r3.scheduledDate || r3Date;

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
      return NextResponse.json({ message: "Item updated", habits });
    }

    // Action: delete
    if (action === "delete") {
      const { id } = body;
      const targetHabit = await prisma.habitItem.findFirst({
        where: { id, userId },
      });

      if (targetHabit) {
        // 1. Find and clean up linked BatchedRevisionItem record and associated SRS sub-tasks
        const existingBatchItem = await prisma.batchedRevisionItem.findFirst({
          where: { userId, habitId: targetHabit.id },
        });

        if (existingBatchItem) {
          const topicStatuses = Array.isArray(existingBatchItem.topicStatuses)
            ? (existingBatchItem.topicStatuses as any[])
            : [];
          const statusRevIds = topicStatuses.map((t) => t.topicRevisionId).filter(Boolean);
          const batchRevIds = Array.isArray(existingBatchItem.topicRevisionIds)
            ? (existingBatchItem.topicRevisionIds as string[])
            : [];
          const allRevIdsToDelete = Array.from(
            new Set([...batchRevIds, ...statusRevIds].filter((id): id is string => Boolean(id))),
          );

          if (allRevIdsToDelete.length > 0) {
            await prisma.topicRevision.deleteMany({
              where: { id: { in: allRevIdsToDelete }, userId, isBatchedRevision: true },
            });
          }

          for (const tItem of topicStatuses) {
            if (tItem.subject && tItem.topic) {
              // Clean up Extra Revision logs from TopicRevision
              const tDoc = await prisma.topicRevision.findFirst({
                where: {
                  userId,
                  subject: { equals: tItem.subject, mode: "insensitive" },
                  topic: { equals: tItem.topic, mode: "insensitive" },
                },
              });

              if (tDoc) {
                const revs = Array.isArray(tDoc.revisions) ? (tDoc.revisions as any[]) : [];
                const cleanRevs = revs.filter(
                  (r: any) => !(r.stage && String(r.stage).includes("Extra Revision (Batch")),
                );

                await prisma.topicRevision.update({
                  where: { id: tDoc.id },
                  data: { revisions: cleanRevs },
                });
              }
            }
          }
        }

        const targetHabitAny = targetHabit as any;
        const clusterItems = Array.isArray(targetHabitAny.selectedMicroTopicsCluster)
          ? (targetHabitAny.selectedMicroTopicsCluster as any[])
          : [];

        for (const item of clusterItems) {
          if (item.subject && item.topic) {
            await prisma.topicRevision.deleteMany({
              where: {
                userId,
                subject: { equals: item.subject, mode: "insensitive" },
                topic: { equals: item.topic, mode: "insensitive" },
                isBatchedRevision: true,
              },
            });
          }
        }

        await prisma.batchedRevisionItem.deleteMany({
          where: { userId, habitId: targetHabit.id },
        });

        let subject = targetHabit.subject?.trim() || "";
        let topic = targetHabit.topic?.trim() || "";

        if (!subject || !topic) {
          const cleanTitle = targetHabit.title.replace(/^\[R[123]\s+Revision\]\s*/i, "").trim();
          if (cleanTitle.includes(":")) {
            const parts = cleanTitle.split(":");
            if (parts.length >= 2) {
              subject = parts[0].trim();
              topic = parts.slice(1).join(":").trim();
            }
          }
        }

        const isBatchHabit = Boolean(targetHabit.isBatchRevision);

        if (topic && !isBatchHabit) {
          if (subject) {
            await prisma.habitItem.deleteMany({
              where: {
                userId,
                subject: { equals: subject, mode: "insensitive" },
                topic: { equals: topic, mode: "insensitive" },
              },
            });

            await prisma.syllabusItem.deleteMany({
              where: {
                userId,
                subject: { equals: subject, mode: "insensitive" },
                category: { equals: topic, mode: "insensitive" },
              },
            });

            await prisma.topicRevision.deleteMany({
              where: {
                userId,
                subject: { equals: subject, mode: "insensitive" },
                topic: { equals: topic, mode: "insensitive" },
              },
            });
          } else {
            await prisma.habitItem.deleteMany({
              where: {
                userId,
                topic: { equals: topic, mode: "insensitive" },
              },
            });

            await prisma.topicRevision.deleteMany({
              where: {
                userId,
                topic: { equals: topic, mode: "insensitive" },
              },
            });
          }
        }

        await prisma.habitItem.deleteMany({ where: { id: targetHabit.id } });
      } else if (id) {
        await prisma.batchedRevisionItem.deleteMany({ where: { userId, habitId: id } });
        await prisma.habitItem.deleteMany({ where: { id, userId } });
      }

      const [habits, syllabusItems, batchedRevisions, topicRevisions] = await Promise.all([
        prisma.habitItem.findMany({ where: { userId } }),
        prisma.syllabusItem.findMany({ where: { userId } }),
        prisma.batchedRevisionItem.findMany({ where: { userId } }),
        prisma.topicRevision.findMany({ where: { userId } }),
      ]);

      const studyTaskSubjects = habits.filter((h: any) => h.isStudyTask && h.subject).map((h: any) => h.subject.trim());

      const syllabusSubjects = Array.from(
        new Set([...syllabusItems.map((s: any) => s.subject).filter(Boolean), ...studyTaskSubjects]),
      );

      return NextResponse.json({
        message: "Habit deleted",
        habits,
        syllabusSubjects,
        batchedRevisions,
        topicRevisions,
      });
    }

    if (action === "delete_topic") {
      const { topicId, subject, topic } = body;
      if (topicId) {
        await prisma.topicRevision.deleteMany({ where: { id: topicId, userId } });
      }
      if (subject && topic) {
        await prisma.topicRevision.deleteMany({
          where: {
            userId,
            subject: { equals: subject, mode: "insensitive" },
            topic: { equals: topic, mode: "insensitive" },
          },
        });
        await prisma.habitItem.deleteMany({
          where: {
            userId,
            subject: { equals: subject, mode: "insensitive" },
            topic: { equals: topic, mode: "insensitive" },
          },
        });
      }
      const topicRevisions = await prisma.topicRevision.findMany({ where: { userId } });
      const habits = await prisma.habitItem.findMany({ where: { userId } });
      return NextResponse.json({ message: "Topic deleted", topicRevisions, habits });
    }

    // Action: list items
    if (action === "toggle_list_item") {
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
      return NextResponse.json({ message: "List item toggled", lists });
    }

    if (action === "create_list") {
      const { title, color, items } = body;
      await prisma.checkList.create({
        data: {
          userId,
          title,
          color: color || "#6366F1",
          items: items || [],
        },
      });

      const lists = await prisma.checkList.findMany({ where: { userId } });
      return NextResponse.json({ message: "List created", lists });
    }

    if (action === "delete_list") {
      const { listId } = body;
      await prisma.checkList.deleteMany({ where: { id: listId, userId } });
      const lists = await prisma.checkList.findMany({ where: { userId } });
      return NextResponse.json({ message: "List deleted", lists });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to update habit item:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
