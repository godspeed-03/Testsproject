'use client';

import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Edit2,
  Trash2,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Loader2,
  Award,
  Calendar as CalendarIcon,
  Coffee,
} from 'lucide-react';
import { useTracker, getTargetGoalLabel, calculateHabitStreak, isHabitScheduledForDate, getTodayIso, getHabitProgressColor, confirmDeleteWithSonner } from '../TrackerContext';
import HabitCellTooltip from '@/components/HabitCellTooltip';

export default function HabitsPage() {
  const {
    habits,
    saving,
    deletingId,
    togglingId,
    handleDeleteHabit,
    handleOpenEditModal,
    handleOpenCreateModal,
    handleItemClick,
    handleMarkRestDay,
    habitWeekOffsets,
    setHabitWeekOffsets
  } = useTracker();

  // Centralized view mode for ALL habits ('month' | 'week')
  const [globalViewMode, setGlobalViewMode] = useState<'month' | 'week'>('month');
  // State to track month offset per habit (0 = current month, -1 = prev, +1 = next)
  const [habitMonthOffsets, setHabitMonthOffsets] = useState<Record<string, number>>({});
  // Month transition loading state per habit card
  const [transitioningHabits, setTransitioningHabits] = useState<Record<string, boolean>>({});

  const handleMonthChange = (habitId: string, delta: number) => {
    setTransitioningHabits((prev) => ({ ...prev, [habitId]: true }));
    setHabitMonthOffsets((prev) => ({ ...prev, [habitId]: (prev[habitId] || 0) + delta }));
    setTimeout(() => {
      setTransitioningHabits((prev) => ({ ...prev, [habitId]: false }));
    }, 180);
  };

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  const todayIso = getTodayIso();
  const habitList = habits
    .filter((h: any) => {
      if (h.type === 'task' || h.type === 'todo') return false;
      if (h.isStudyTask) return false;
      if (h.isBatchRevision || h.isBatchedRevision) return false;
      if (h.frequency?.mode === 'once') return false;
      if (typeof h.title === 'string' && (/^\[R[123]\s+Revision\]/i.test(h.title.trim()) || /automated spaced repetition/i.test(h.description || ''))) return false;
      return true;
    })
    .sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));

  const getMonthDaysForOffset = (offsetMonths: number = 0) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offsetMonths, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const monthName = targetDate.toLocaleString('default', { month: 'long' });

    // Day of week for 1st of month: 0=Sun, 1=Mon, ..., 6=Sat
    const firstDayIndex = targetDate.getDay();
    // Monday-first offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const paddingDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const monthDays: { dayNum: number; iso: string }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      const monthStr = String(targetMonth + 1).padStart(2, '0');
      const iso = `${targetYear}-${monthStr}-${dayStr}`;
      monthDays.push({ dayNum: i, iso });
    }

    return { year: targetYear, monthName, monthDays, paddingDays };
  };

  const getWeekDaysForOffset = (offsetWeeks: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sundayOffset = dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - sundayOffset + offsetWeeks * 7);

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const curr = new Date(startOfWeek);
      curr.setDate(startOfWeek.getDate() + i);

      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const dayNumStr = String(curr.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${dayNumStr}`;

      days.push({
        iso,
        dayName: dayNames[curr.getDay()],
        dayNum: curr.getDate(),
        isToday: iso === todayIso
      });
    }
    return days;
  };

  const getRecurrenceLabel = (h: any) => {
    const mode = h.frequency?.mode || 'daily';
    if (mode === 'daily') return 'Everyday';
    if (mode === 'once') return 'One-time';
    if (mode === 'specific_days' || mode === 'weekly') {
      const days = h.frequency?.days || h.selectedDays || [];
      return days.length > 0 ? `${days.join(', ')} (${days.length} days/wk)` : 'Custom Days';
    }
    if (mode === 'monthly') {
      return `Day ${h.frequency?.monthlyDay || 1} of month`;
    }
    return 'Custom';
  };

  return (
    <div className="space-y-4">
      {/* Top Header with Centralized Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-base sm:text-lg font-black ${textTitle}`}>Habits & Streaks</h2>
          <p className={`text-xs ${textMuted}`}>Monitor consistency across your custom weekly and monthly schedules.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Centralized View Mode Toggle for ALL Habits */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setGlobalViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                globalViewMode === 'month'
                  ? 'bg-accent-gradient text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <CalendarIcon size={13} /> Month View
            </button>
            <button
              type="button"
              onClick={() => setGlobalViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                globalViewMode === 'week'
                  ? 'bg-accent-gradient text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <BarChart2 size={13} /> 7-Day View
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateModal('habit')}
            className="bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95"
          >
            <Plus size={15} /> New Habit
          </button>
        </div>
      </div>

      {habitList.length === 0 ? (
        <div className={`p-10 rounded-2xl border ${cardBg} text-center space-y-3`}>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Flame size={24} />
          </div>
          <h4 className={`font-black text-base ${textTitle}`}>No Recurring Habits Created Yet</h4>
          <p className={`text-xs ${textMuted} max-w-sm mx-auto`}>
            Build your streak engine by adding daily or weekly study habits.
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal('habit')}
            className="px-4 py-2 rounded-xl bg-accent-gradient text-white font-bold text-xs inline-block"
          >
            Create Habit Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {habitList.map((h: any) => {
            const habitId = h.id || h._id;
            const streak = calculateHabitStreak(h);
            const offset = habitWeekOffsets[habitId] || 0;
            const weekDays = getWeekDaysForOffset(offset);
            const mOffset = habitMonthOffsets[habitId] || 0;
            const { year: mYear, monthName: mName, monthDays, paddingDays } = getMonthDaysForOffset(mOffset);

            const todayHist = (h.history || []).find((entry: any) => entry.date === todayIso);
            const todayVal = todayHist ? (todayHist.value || 0) : 0;
            const isNumeric = h.target?.unit !== 'yes_no' && h.target?.unit !== 'boolean';
            const isTodayDone = todayHist?.status === 'done';
            const isTodayFailed = todayHist?.status === 'failed' || todayHist?.status === 'false';

            const todayTier = getHabitProgressColor(todayVal, h.target?.value || 1, h.target?.unit, todayHist?.status);

            const habitCardBg = cardBg;

            return (
              <div key={habitId} className={`p-3.5 sm:p-4 rounded-2xl border ${habitCardBg} space-y-2.5 shadow-xs transition-all`}>
                {/* Space-Optimized Dual-Row Executive Header */}
                <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  {/* Row 1: Left Corner = Icon + Title | Right Corner = Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm sm:text-base shrink-0 shadow-inner"
                        style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}
                      >
                        {h.icon || '🏃'}
                      </div>

                      <div className="min-w-0">
                        <h3 className={`font-black text-sm sm:text-base ${textTitle} truncate`}>{h.title}</h3>
                        {h.description && <p className={`text-2xs ${textMuted} truncate`}>{h.description}</p>}
                      </div>
                    </div>

                    {/* Right Corner Badges */}
                    <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                      {h.target?.unit === 'time' || h.target?.customUnit === 'time' || h.target?.targetTime ? (
                        (() => {
                          const formatTime12 = (t?: string) => {
                            if (!t) return '04:00 AM';
                            if (t.includes('AM') || t.includes('PM')) return t;
                            let [hStr, mStr] = t.split(':');
                            let hour = parseInt(hStr || '4', 10);
                            if (isNaN(hour)) return t;
                            const isPm = hour >= 12;
                            const h12 = hour % 12 === 0 ? 12 : hour % 12;
                            return `${String(h12).padStart(2, '0')}:${mStr || '00'} ${isPm ? 'PM' : 'AM'}`;
                          };

                          const target12 = formatTime12(h.target?.targetTime || '04:00');

                          return (
                            <span className="px-2 py-0.5 rounded-lg border text-2xs font-black flex items-center gap-1 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 border-indigo-500/30">
                              ⏰ Target: {target12}
                            </span>
                          );
                        })()
                      ) : isNumeric ? (
                        <span className={`px-2 py-0.5 rounded-lg border text-2xs font-black ${
                          todayVal > 0
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 border-indigo-500/30'
                        }`}>
                          🎯 {(() => {
                            const u = (h.target?.unit || 'times').toLowerCase().trim();
                            if (['mins', 'minutes', 'min', 'minute', 'hours', 'hrs', 'hour'].includes(u)) {
                              const loggedMins = ['hours', 'hrs', 'hour'].includes(u) ? Math.round(todayVal * 60) : todayVal;
                              const targetMins = ['hours', 'hrs', 'hour'].includes(u) ? Math.round((h.target?.value || 1) * 60) : (h.target?.value || 1);
                              const formatMin = (m: number) => {
                                if (m <= 0) return '0 mins';
                                if (m < 60) return `${m} mins`;
                                const hrs = Math.floor(m / 60);
                                const rem = m % 60;
                                if (hrs > 0 && rem > 0) return `${hrs} hr ${rem} mins`;
                                return `${hrs} hr${hrs > 1 ? 's' : ''}`;
                              };
                              return `${formatMin(loggedMins)} / ${formatMin(targetMins)}`;
                            }
                            return `${todayVal} / ${h.target?.value || 1} ${h.target?.unit || 'times'}`;
                          })()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 border border-indigo-500/30 text-2xs font-black">
                          🎯 {getTargetGoalLabel(h)}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-2xs font-black flex items-center gap-1">
                        <Flame size={12} /> {streak.current}d (🏆 {streak.best})
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Left Corner = Month Navigator | Right Corner = Edit & Delete Actions */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {globalViewMode === 'month' ? (
                      <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleMonthChange(habitId, -1)}
                          className="p-0.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <span className="text-xs font-bold px-1 text-center text-slate-700 dark:text-slate-200 normal-case">
                          {mName.slice(0, 3)} {mYear}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMonthChange(habitId, 1)}
                          className="p-0.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(h)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        type="button"
                        disabled={saving || deletingId === habitId}
                        onClick={() => {
                          confirmDeleteWithSonner(`Delete habit "${h.title}"?`, () => handleDeleteHabit(habitId));
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete Habit"
                      >
                        {deletingId === habitId ? <Loader2 size={15} className="animate-spin text-rose-500" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TRACKER GRID BASED ON GLOBAL VIEW MODE */}
                {globalViewMode === 'month' ? (
                  transitioningHabits[habitId] ? (
                    <div className="pt-2 space-y-1.5 animate-pulse">
                      {/* Day of Week Headers Skeleton */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase pb-0.5 opacity-40">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                      {/* Skeleton Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 28 }).map((_, idx) => (
                          <div key={`skel-${idx}`} className="h-[28px] w-full rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-1.5">
                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase pb-0.5">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>

                      {/* Calendar Cells Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Leading Empty Padding Days */}
                        {Array.from({ length: paddingDays }).map((_, idx) => (
                          <div key={`pad-${idx}`} className="min-h-[28px] w-full" />
                        ))}

                      {monthDays.map((d) => {
                        const scheduled = isHabitScheduledForDate(h, d.iso);
                        const hist = (h.history || []).find((entry: any) => entry.date === d.iso);
                        const isDone = hist?.status === 'done';
                        const isSkipped = hist?.status === 'skipped' || hist?.status === 'rest';
                        const val = hist ? (hist.value || 0) : 0;
                        const isFailed = !isSkipped && (hist?.status === 'failed' || hist?.status === 'false') && val === 0;
                        const isPast = d.iso < todayIso;
                        const isToday = d.iso === todayIso;
                        const pTier = getHabitProgressColor(val, h.target?.value || 1, h.target?.unit, hist?.status);

                        let cellStyle = '';

                        if (!scheduled) {
                          cellStyle = 'bg-slate-100/30 dark:bg-slate-950/20 text-slate-400/50 dark:text-slate-600/50 border border-transparent';
                        } else if (isSkipped) {
                          cellStyle = 'bg-violet-600 text-white font-black shadow-md shadow-violet-500/40 border border-violet-400 ring-2 ring-violet-500/50';
                        } else if (isDone || pTier === 'done') {
                          cellStyle = 'bg-emerald-500 text-white font-black shadow-xs shadow-emerald-500/20 border border-emerald-400';
                        } else if (pTier === 'p75') {
                          cellStyle = 'bg-lime-500 text-slate-950 font-black shadow-xs shadow-lime-500/20 border border-lime-400';
                        } else if (pTier === 'p50') {
                          cellStyle = 'bg-amber-500 text-slate-950 font-black shadow-xs shadow-amber-500/20 border border-amber-400';
                        } else if (pTier === 'p25') {
                          cellStyle = 'bg-orange-500 text-white font-black shadow-xs shadow-orange-500/20 border border-orange-400';
                        } else if (isFailed) {
                          cellStyle = 'bg-rose-500 text-white font-black shadow-xs shadow-rose-500/20 border border-rose-400';
                        } else if (isToday) {
                          cellStyle = 'bg-accent-gradient text-white font-black shadow-xs shadow-accent/20 border border-accent-primary ring-2 ring-accent-primary/40';
                        } else if (isPast) {
                          cellStyle = 'bg-rose-500/80 text-white font-bold shadow-xs shadow-rose-500/10 border border-rose-400/80';
                        } else {
                          cellStyle = 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-accent-primary';
                        }

                        return (
                          <HabitCellTooltip
                            key={d.iso}
                            dateIso={d.iso}
                            habit={h}
                            hist={hist}
                            scheduled={scheduled}
                            isDone={isDone}
                            isFailed={isFailed}
                            isPast={isPast}
                          >
                            <div
                              className={`py-1 px-1 rounded-lg text-center transition-all flex items-center justify-center min-h-[28px] w-full cursor-default ${cellStyle}`}
                            >
                              {!scheduled ? (
                                <span className="text-[10px] font-semibold text-slate-400/40 dark:text-slate-600/40">{d.dayNum}</span>
                              ) : (
                                <span className="text-[11px] font-black font-display">{d.dayNum}</span>
                              )}
                            </div>
                          </HabitCellTooltip>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                  /* 7-DAY GRID */
                  <div className="pt-1 space-y-2">
                    {offset !== 0 && (
                      <div className="flex justify-end text-2xs font-extrabold uppercase">
                        <button
                          type="button"
                          onClick={() => setHabitWeekOffsets((prev: any) => ({ ...prev, [habitId]: 0 }))}
                          className="text-accent-primary hover:underline"
                        >
                          Reset Week
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHabitWeekOffsets((prev: any) => ({ ...prev, [habitId]: offset - 1 }))}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all shrink-0"
                        title="Previous Week"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="grid grid-cols-7 gap-2 flex-1">
                        {weekDays.map((w: any) => {
                          const scheduled = isHabitScheduledForDate(h, w.iso);
                          const hist = (h.history || []).find((entry: any) => entry.date === w.iso);
                          const isDone = hist?.status === 'done';
                          const isSkipped = hist?.status === 'skipped' || hist?.status === 'rest';
                          const val = hist ? (hist.value || 0) : 0;
                          const isFailed = !isSkipped && (hist?.status === 'failed' || hist?.status === 'false') && val === 0;
                          const isPast = w.iso < todayIso;

                          const pTier = getHabitProgressColor(val, h.target?.value || 1, h.target?.unit, hist?.status);

                          let cardStyle = '';
                          if (!scheduled) {
                            cardStyle = 'bg-slate-100/50 dark:bg-slate-950/30 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 opacity-60';
                          } else if (isSkipped) {
                            cardStyle = 'bg-violet-600 text-white font-black shadow-md shadow-violet-500/40 border border-violet-400 ring-2 ring-violet-500/50';
                          } else if (isDone || pTier === 'done') {
                            cardStyle = 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20 border border-emerald-400';
                          } else if (pTier === 'p75') {
                            cardStyle = 'bg-lime-500 text-slate-950 font-black shadow-md shadow-lime-500/20 border border-lime-400';
                          } else if (pTier === 'p50') {
                            cardStyle = 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 border border-amber-400';
                          } else if (pTier === 'p25') {
                            cardStyle = 'bg-orange-500 text-white font-black shadow-md shadow-orange-500/20 border border-orange-400';
                          } else if (isFailed) {
                            cardStyle = 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20 border border-rose-400';
                          } else if (w.isToday) {
                            cardStyle = 'bg-accent-gradient text-white font-black shadow-md shadow-accent/20 border border-accent-primary';
                          } else if (isPast) {
                            cardStyle = 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20 border border-rose-400';
                          } else {
                            cardStyle = 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-accent-primary';
                          }

                          const getTooltipText = () => {
                            if (!scheduled) return `${w.iso}: Scheduled Off`;
                            if (isDone) return `${w.iso}: Completed (100%)`;
                            if (isFailed) return `${w.iso}: Failed / Missed`;

                            const targetVal = h.target?.value || 1;
                            const unitStr = (h.target?.unit || '').toLowerCase().trim();

                            if (val > 0) {
                              let normVal = val;
                              let normTarget = targetVal;

                              if (['hours', 'hrs', 'hour'].includes(unitStr) && normVal <= 24 && normTarget <= 24) {
                                normVal = Math.round(val * 60);
                                normTarget = Math.round(targetVal * 60);
                              }

                              const formatMin = (m: number) => {
                                if (m < 60) return `${m} mins`;
                                const hrs = Math.floor(m / 60);
                                const rem = m % 60;
                                return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
                              };

                              const isTime = ['hours', 'hrs', 'hour', 'mins', 'minutes', 'min'].includes(unitStr);
                              const loggedStr = isTime ? formatMin(normVal) : `${val} ${unitStr}`;
                              const targetStr = isTime ? formatMin(normTarget) : `${targetVal} ${unitStr}`;

                              const pct = Math.min(100, Math.round((normVal / (normTarget || 1)) * 100));
                              return `${w.iso}: Logged ${loggedStr} / ${targetStr} target (${pct}% completed)`;
                            }

                            if (isPast) return `${w.iso}: Missed (0%)`;
                            return `${w.iso}: Scheduled`;
                          };

                          return (
                            <HabitCellTooltip
                              key={w.iso}
                              dateIso={w.iso}
                              habit={h}
                              hist={hist}
                              scheduled={scheduled}
                              isDone={isDone}
                              isFailed={isFailed}
                              isPast={isPast}
                            >
                              <div
                                className={`p-2 sm:p-2.5 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[64px] w-full cursor-default ${cardStyle}`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider">{w.dayName}</span>
                                {!scheduled ? (
                                  <span className="text-[9px] font-bold uppercase opacity-60">Off</span>
                                ) : (
                                  <span className="text-xs font-black">{w.dayNum}</span>
                                )}
                              </div>
                            </HabitCellTooltip>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setHabitWeekOffsets((prev: any) => ({ ...prev, [habitId]: offset + 1 }))}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all shrink-0"
                        title="Next Week"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
