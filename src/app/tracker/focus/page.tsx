"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw, CheckCircle2, Flag, Zap, BookOpen, ListOrdered, Plus, Loader2 } from "lucide-react";
import { useTracker, getTodayIso } from "../TrackerContext";
import ShadcnSelect from "@/components/ui/ShadcnSelect";

interface SessionLap {
  id: string;
  timeStr: string;
  durationSecs: number;
  habitTitle: string;
  timestamp: string;
}

export default function FocusPage() {
  const {
    habits,
    saving,
    timerHabitId,
    setTimerHabitId,
    timerRunning,
    timerElapsed,
    laps,
    setLaps,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    syncTimerToStorage,
    handleToggleLog,
  } = useTracker();

  const [logSuccessMessage, setLogSuccessMessage] = useState<string | null>(null);

  const cardBg = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80";
  const textTitle = "text-slate-900 dark:text-slate-100";
  const textMuted = "text-slate-500 dark:text-slate-400";

  const todayStr = getTodayIso();

  // Helper to check if a habit is scheduled on today's agenda
  const isScheduledForToday = (h: any): boolean => {
    if (h.startDate && h.startDate > todayStr) return false;
    if (h.endDate && h.endDate < todayStr) return false;

    const mode = h.frequency?.mode || h.recurrence || "daily";
    if (mode === "daily") return true;
    if (mode === "once") return h.startDate === todayStr;

    if (mode === "specific_days" || mode === "weekly") {
      const todayObj = new Date();
      const dayShortNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const dayFullNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayIdx = todayObj.getDay();

      const shortName = dayShortNames[dayIdx];
      const fullName = dayFullNames[dayIdx];

      const activeDays: string[] = (h.frequency?.days || h.selectedDays || []).map((d: any) =>
        String(d).toLowerCase().trim(),
      );

      if (activeDays.length > 0) {
        return activeDays.some(
          (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d),
        );
      }
      return true;
    }
    return true;
  };

  // Filter ONLY items on TODAY's Agenda that have time goals (hours or minutes ONLY)
  const finalHabitList = habits.filter((h: any) => {
    // 1. Must be scheduled on Today's Agenda
    if (!isScheduledForToday(h)) return false;

    // 2. Unit MUST be time-based (hours or minutes)
    const unit = (h.target?.unit || "").toLowerCase().trim();
    const isTimeGoal =
      unit === "hours" ||
      unit === "hrs" ||
      unit === "hour" ||
      unit === "hr" ||
      unit === "mins" ||
      unit === "minutes" ||
      unit === "min" ||
      unit === "minute";

    return isTimeGoal;
  });

  useEffect(() => {
    if (finalHabitList.length > 0) {
      const exists = finalHabitList.some((h: any) => (h.id || h._id) === timerHabitId);
      if (!exists) {
        setTimerHabitId(finalHabitList[0].id || finalHabitList[0]._id);
      }
    } else {
      setTimerHabitId("");
    }
  }, [finalHabitList, timerHabitId]);

  const activeHabit = habits.find((h: any) => (h.id || h._id) === timerHabitId) || finalHabitList[0];

  // Current session duration metrics
  const sessionHoursNum = Number((timerElapsed / 3600).toFixed(2));

  // Goal & Logged Progress for Active Habit
  const existingEntry = activeHabit ? (activeHabit.history || []).find((e: any) => e.date === todayStr) : null;
  const currentLoggedHours = existingEntry ? Number((existingEntry.value || 0).toFixed(2)) : 0;
  const targetGoalHours = activeHabit?.target?.value || 3;
  const projectedTotalHours = Number((currentLoggedHours + sessionHoursNum).toFixed(2));
  const goalProgressPct = Math.min(100, Math.round((projectedTotalHours / Math.max(1, targetGoalHours)) * 100));

  // Helper to format decimal hours to human readable X hr Y mins
  const formatHoursAndMins = (hrsDecimal: number) => {
    const totalMins = Math.round(hrsDecimal * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h} hr ${m} mins`;
    if (h > 0) return `${h} hr${h > 1 ? "s" : ""}`;
    return `${m} mins`;
  };

  // Format Stopwatch Display Time (HH:MM:SS)
  const formatDisplayTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const displayTime = formatDisplayTime(timerElapsed);

  // Dynamic Ring Dashoffset (rotates continuously every 60 seconds)
  const secondsCycle = timerElapsed % 60;
  const progressPct = (secondsCycle / 60) * 100;

  // Record Split / Lap
  const handleLapRecord = () => {
    if (timerElapsed <= 0) return;

    const newLap: SessionLap = {
      id: Date.now().toString(),
      timeStr: displayTime,
      durationSecs: timerElapsed,
      habitTitle: activeHabit?.title || "Today Agenda Task",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [newLap, ...(laps || [])];
    setLaps(updated);
    if (typeof syncTimerToStorage === "function") {
      syncTimerToStorage(timerRunning, null, timerElapsed, timerHabitId, updated);
    }
  };

  // INCREMENT & Log Focus Session
  const handleSessionComplete = async () => {
    if (!activeHabit) return;

    if (timerElapsed <= 0) {
      setLogSuccessMessage("⚠️ Start the stopwatch first before saving time.");
      setTimeout(() => setLogSuccessMessage(null), 3000);
      return;
    }

    const focusMinutes = Math.max(1, Math.round(timerElapsed / 60));
    const focusHours = Number((focusMinutes / 60).toFixed(2));
    const newTotalVal = Number((currentLoggedHours + focusHours).toFixed(2));

    const targetVal = activeHabit.target?.value || 0;
    const isYesNoUnit = activeHabit.target?.unit === "yes_no" || activeHabit.target?.unit === "boolean";
    const isGoalMet = isYesNoUnit || targetVal === 0 || newTotalVal >= targetVal;
    const targetStatus = isGoalMet ? "done" : "pending";

    await handleToggleLog(activeHabit.id || activeHabit._id, todayStr, targetStatus, focusHours, true);

    if (isGoalMet) {
      setLogSuccessMessage(
        `🎉 Goal Reached! Saved +${formatHoursAndMins(focusHours)} to "${activeHabit.title}". Total: ${formatHoursAndMins(newTotalVal)} / ${formatHoursAndMins(targetGoalHours)}`,
      );
    } else {
      setLogSuccessMessage(
        `⏱ Saved +${formatHoursAndMins(focusHours)} to "${activeHabit.title}". Daily Total: ${formatHoursAndMins(newTotalVal)} / ${formatHoursAndMins(targetGoalHours)} (Pending completion)`,
      );
    }

    resetStopwatch();
    setTimeout(() => setLogSuccessMessage(null), 5000);
  };

  const totalFocusSeconds = (laps || []).reduce((acc: number, l: any) => acc + (l.durationSecs || 0), 0) + timerElapsed;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={`text-lg sm:text-xl font-black ${textTitle} tracking-tight flex items-center gap-2`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Clock className="text-white" size={16} />
            </div>
            Study Focus Timer
          </h2>
          <p className={`text-[10px] sm:text-xs ${textMuted} mt-0.5`}>
            Persistent stopwatch — tracks focus time for today's agenda tasks.
          </p>
        </div>
        {timerRunning && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            RECORDING
          </span>
        )}
      </div>

      {/* Success Toast */}
      {logSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{logSuccessMessage}</span>
        </div>
      )}

      {/* MAIN TIMER CARD — Theme Aware */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800/50">
        {/* Background — light: white gradient, dark: dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/5 dark:from-indigo-600/10 via-transparent to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Task Selector */}
          <div className="bg-slate-100/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 space-y-2 relative z-40">
            <label className="font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen size={12} className="text-indigo-600 dark:text-indigo-400" />
              Active Study Task
            </label>
            <ShadcnSelect
              value={timerHabitId}
              onChange={(val: string) => {
                setTimerHabitId(val);
                if (typeof syncTimerToStorage === "function") {
                  syncTimerToStorage(timerRunning, null, timerElapsed, val, laps);
                }
              }}
              options={
                finalHabitList.length > 0
                  ? finalHabitList.map((h: any) => {
                      const hist = (h.history || []).find((e: any) => e.date === todayStr);
                      const valNum = hist ? hist.value || 0 : 0;
                      const tgtNum = h.target?.value || 0;
                      const progressStr =
                        valNum > 0
                          ? ` [${formatHoursAndMins(valNum)} / ${formatHoursAndMins(tgtNum)}]`
                          : ` [Goal: ${formatHoursAndMins(tgtNum)}]`;
                      return {
                        value: h.id || h._id,
                        label: `${h.icon || "📚"} ${h.title}${progressStr}`,
                      };
                    })
                  : [{ value: "", label: "No time-based tasks scheduled for today" }]
              }
            />
          </div>

          {/* CIRCULAR CLOCK DISPLAY — Inspired by shadcn timer tools */}
          <div className="flex flex-col items-center py-4 sm:py-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Outer glow ring */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-700 ${
                  timerRunning
                    ? "shadow-[0_0_50px_rgba(99,102,241,0.25)] dark:shadow-[0_0_60px_rgba(99,102,241,0.35)]"
                    : ""
                }`}
              />

              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  strokeWidth="3"
                  className="stroke-slate-200 dark:stroke-white/10"
                  fill="transparent"
                />
                {/* Precision Dial Tick Marks (60 ticks around circumference) */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = (i / 60) * 360 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const isMajor = i % 5 === 0;
                  const r1 = isMajor ? 41 : 43.5;
                  const r2 = 46;
                  return (
                    <line
                      key={i}
                      x1={50 + r1 * Math.cos(rad)}
                      y1={50 + r1 * Math.sin(rad)}
                      x2={50 + r2 * Math.cos(rad)}
                      y2={50 + r2 * Math.sin(rad)}
                      className={
                        isMajor
                          ? "stroke-indigo-500 dark:stroke-indigo-400"
                          : "stroke-slate-300 dark:stroke-white/20"
                      }
                      strokeWidth={isMajor ? 1.2 : 0.6}
                    />
                  );
                })}
                {/* Active progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="url(#focusTimerGrad)"
                  strokeWidth="4"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * progressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-linear"
                  fill="transparent"
                />
                {/* Goal progress ring (inner) */}
                <circle
                  cx="50"
                  cy="50"
                  r="37"
                  strokeWidth="2"
                  className="stroke-slate-100 dark:stroke-white/5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="37"
                  stroke="url(#goalProgressGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="232"
                  strokeDashoffset={232 - (232 * goalProgressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="focusTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="goalProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Digital Display — Inspired by shadcn timer UI */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="flex items-center gap-1 sm:gap-1.5 font-display font-black text-slate-900 dark:text-white">
                  {displayTime.split("").map((char, idx) => {
                    if (char === ":") {
                      return (
                        <span key={idx} className="text-indigo-600 dark:text-indigo-400 animate-pulse text-lg sm:text-2xl font-black px-0.5">
                          :
                        </span>
                      );
                    }
                    return (
                      <span
                        key={idx}
                        className="w-6 h-9 sm:w-8 sm:h-11 md:w-10 md:h-13 bg-slate-100 dark:bg-slate-950/90 border border-slate-300/80 dark:border-indigo-500/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xs font-display text-slate-900 dark:text-indigo-300 text-sm sm:text-xl md:text-2xl font-black"
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-2.5 sm:mt-4 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider max-w-[140px] sm:max-w-[180px] truncate px-2.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20">
                    {activeHabit ? activeHabit.title : "Study Task"}
                  </span>
                  <span
                    className={`text-[9px] font-bold ${timerRunning ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
                  >
                    {timerRunning ? "⚡ Focus Active" : "⏸ Paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SESSION STATS STRIP */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-white/10 p-3 text-center">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Logged Today
              </p>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {formatHoursAndMins(currentLoggedHours)}
              </p>
            </div>
            <div className="bg-slate-100/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-white/10 p-3 text-center">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                This Session
              </p>
              <p className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {formatHoursAndMins(sessionHoursNum)}
              </p>
            </div>
            <div className="bg-slate-100/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-white/10 p-3 text-center">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Daily Goal
              </p>
              <p className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {formatHoursAndMins(targetGoalHours)}
              </p>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
              <span>Daily Progress</span>
              <span
                className={
                  goalProgressPct >= 100
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-indigo-600 dark:text-indigo-400"
                }
              >
                {goalProgressPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  goalProgressPct >= 100
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-indigo-600 via-violet-500 to-emerald-500"
                }`}
                style={{ width: `${Math.min(100, goalProgressPct)}%` }}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-1 flex-wrap">
            {/* Start / Pause — Hero Button */}
            <button
              type="button"
              onClick={() => {
                if (timerRunning) {
                  pauseStopwatch();
                } else {
                  startStopwatch();
                }
              }}
              className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer ${
                timerRunning
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/40"
                  : "bg-accent-gradient hover:opacity-90 shadow-md"
              }`}
            >
              {timerRunning ? <Pause size={16} /> : <Play size={16} />}
              <span>{timerRunning ? "Pause" : "Start Focus"}</span>
            </button>

            {/* Record Split */}
            <button
              type="button"
              onClick={handleLapRecord}
              disabled={!timerRunning && timerElapsed === 0}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 backdrop-blur-sm text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-20 cursor-pointer border border-slate-200 dark:border-white/10"
              title="Record Split"
            >
              <Flag size={16} />
            </button>

            {/* Save to DB */}
            <button
              type="button"
              onClick={handleSessionComplete}
              disabled={timerElapsed === 0 || saving}
              className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Save Study Hours"
            >
              {saving ? <Loader2 size={15} className="animate-spin text-white" /> : <Plus size={15} />}
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save Session"}</span>
              <span className="sm:hidden">{saving ? "Saving" : "Save"}</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={resetStopwatch}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 backdrop-blur-sm text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-95 cursor-pointer border border-slate-200 dark:border-white/10"
              title="Reset Stopwatch"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* RECORDED LAPS & SPLITS */}
      {laps && laps.length > 0 && (
        <div className={`p-5 sm:p-6 rounded-2xl border ${cardBg} space-y-3 shadow-xs`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-black text-xs sm:text-sm ${textTitle} flex items-center gap-2`}>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <ListOrdered size={14} />
              </div>
              Session Laps
            </h3>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-800">
              {laps.length} {laps.length === 1 ? "lap" : "laps"}
            </span>
          </div>

          <div className="space-y-2">
            {laps.map((lap: any, index: number) => {
              const lapMins = Math.max(1, Math.round(lap.durationSecs / 60));
              const lapHrs = (lapMins / 60).toFixed(2);

              return (
                <div
                  key={lap.id || index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[10px] border border-indigo-500/20">
                      {laps.length - index}
                    </span>
                    <div>
                      <span className="font-black text-xs text-slate-900 dark:text-slate-100 block">
                        {lap.habitTitle}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">{lap.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-xs block">
                      {lap.timeStr}
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{lapMins}m ({lapHrs}h)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
