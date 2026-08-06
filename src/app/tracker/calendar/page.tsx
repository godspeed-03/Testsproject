'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  Layers,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  MinusCircle,
  TrendingUp,
  Percent,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Label,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useTracker, calculateHabitStreak, isHabitScheduledForDate, getTodayIso, getHabitProgressColor } from '../TrackerContext';
import HabitCellTooltip from '@/components/HabitCellTooltip';

export default function CalendarPage() {
  const { habits } = useTracker();
  const [viewMode, setViewMode] = useState<'calendar' | 'graph'>('graph');
  const [activeHabitId, setActiveHabitId] = useState<string>('all');
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  const todayIso = getTodayIso();
  const habitList = habits.filter((h: any) => h.type === 'habit');
  const isAllView = activeHabitId === 'all';
  const activeHabit = isAllView
    ? null
    : habitList.find((h: any) => (h._id || h.id) === activeHabitId) || habitList[0];

  // Helper for calculating month days based on offset
  const getMonthData = (offset: number) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const monthName = targetDate.toLocaleString('default', { month: 'long' });

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const monthDays: { dayNum: number; iso: string }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      const monthStr = String(targetMonth + 1).padStart(2, '0');
      const iso = `${targetYear}-${monthStr}-${dayStr}`;
      monthDays.push({ dayNum: i, iso });
    }

    return { year: targetYear, month: targetMonth, monthName, daysInMonth, monthDays };
  };

  const { year, monthName, monthDays } = getMonthData(monthOffset);

  // Compute daily overall stats for graph view
  const dailyStats = monthDays.map((d) => {
    const isPast = d.iso < todayIso;
    const isToday = d.iso === todayIso;

    const scheduledItems = (isAllView ? habitList : activeHabit ? [activeHabit] : habitList).filter((h: any) =>
      isHabitScheduledForDate(h, d.iso)
    );
    const totalSched = scheduledItems.length;

    const doneCount = scheduledItems.filter((h: any) =>
      (h.history || []).some((entry: any) => entry.date === d.iso && entry.status === 'done')
    ).length;

    const notDoneCount = totalSched - doneCount;
    const pct = totalSched > 0 ? Math.round((doneCount / totalSched) * 100) : 0;

    return {
      ...d,
      isPast,
      isToday,
      totalSched,
      doneCount,
      notDoneCount,
      pct,
    };
  });

  // Calculate overall monthly average percentage
  const totalScheduledMonth = dailyStats.reduce((acc, curr) => acc + curr.totalSched, 0);
  const totalDoneMonth = dailyStats.reduce((acc, curr) => acc + curr.doneCount, 0);
  const monthOverallPct = totalScheduledMonth > 0 ? Math.round((totalDoneMonth / totalScheduledMonth) * 100) : 0;

  // Chart Data for 2-Line Recharts (Green: Completed / Achieved, Red: Total Scheduled Target)
  // Omit unscheduled dates (total === 0) so non-scheduled days are not plotted on the trend line
  const rawChartData = monthDays.map((d) => {
    if (isAllView) {
      const scheduledItems = habitList.filter((h: any) => isHabitScheduledForDate(h, d.iso));
      const totalSched = scheduledItems.length;

      const doneCount = scheduledItems.filter((h: any) =>
        (h.history || []).some((entry: any) => entry.date === d.iso && entry.status === 'done')
      ).length;

      return {
        dayLabel: String(d.dayNum),
        iso: d.iso,
        done: doneCount,
        total: totalSched,
        unitStr: 'items',
      };
    } else {
      const scheduled = isHabitScheduledForDate(activeHabit, d.iso);
      const rawUnit = (activeHabit?.target?.unit || 'yes_no').toLowerCase().trim();
      const rawTarget = activeHabit?.target?.value || 1;
      const isYesNo = rawUnit === 'yes_no' || rawUnit === 'boolean' || rawUnit === 'mark_done';
      const isTime = ['hours', 'hrs', 'hour'].includes(rawUnit);

      let targetVal = rawTarget;
      let unitStr = rawUnit;

      if (isYesNo) {
        targetVal = 1;
        unitStr = '';
      } else if (isTime) {
        unitStr = 'hrs';
      }

      if (!scheduled) {
        return {
          dayLabel: String(d.dayNum),
          iso: d.iso,
          done: 0,
          total: 0,
          unitStr,
        };
      }

      const hist = (activeHabit?.history || []).find((entry: any) => entry.date === d.iso);
      let doneVal = 0;

      if (hist && hist.value > 0) {
        if (isTime && hist.value > 24 && rawTarget <= 24) {
          doneVal = Math.round((hist.value / 60) * 100) / 100;
        } else {
          doneVal = hist.value;
        }
      } else if (hist?.status === 'done') {
        doneVal = targetVal;
      }

      return {
        dayLabel: String(d.dayNum),
        iso: d.iso,
        done: doneVal,
        total: targetVal,
        unitStr,
      };
    }
  });

  const chartData = rawChartData.filter((item) => item.total > 0);

  const CustomGraphTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold rounded-2xl shadow-xl border border-slate-700 space-y-2 min-w-[180px]">
          <div className="text-slate-400 text-3xs uppercase tracking-wider font-extrabold border-b border-slate-800 pb-1">
            {monthName} {data.dayLabel}, {year} ({data.iso})
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-black">
              <span className="flex items-center gap-1">🟢 Completed:</span>
              <span>{data.done} {data.unitStr}</span>
            </div>
            <div className="flex items-center justify-between text-rose-400 font-black">
              <span className="flex items-center gap-1">🔴 Target:</span>
              <span>{data.total} {data.unitStr}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-300 font-extrabold pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Completion Rate:</span>
            <span className="text-indigo-400">{data.total > 0 ? Math.round((data.done / data.total) * 100) : 0}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg sm:text-xl font-black font-display ${textTitle}`}>Monthly Habit Tracking</h2>
          <p className={`text-xs ${textMuted}`}>Switch between Calendar Heatmap and Smooth Line Trend Graphs.</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="grid grid-cols-2 w-full sm:w-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              viewMode === 'calendar'
                ? 'bg-accent-secondary text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CalendarIcon size={15} />
            <span>Calendar View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              viewMode === 'graph'
                ? 'bg-accent-secondary text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Activity size={15} />
            <span>Line Graph & Matrix</span>
          </button>
        </div>
      </div>

      {habitList.length === 0 ? (
        <div className={`p-10 rounded-2xl border ${cardBg} text-center space-y-3`}>
          <CalendarIcon size={32} className="text-accent-primary mx-auto" />
          <h4 className={`font-black text-base ${textTitle}`}>No Habits Available</h4>
          <p className={`text-xs ${textMuted}`}>Create habits in the Habits tab to view monthly statistics.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Habit Filter Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveHabitId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                isAllView
                  ? 'bg-accent-gradient shadow-neon-glow ring-2 ring-accent-primary/50 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Layers size={14} />
              <span>All Habits Combined</span>
            </button>

            {habitList.map((h: any, idx: number) => {
              const hId = h._id || h.id;
              const pillTheme = idx % 2 === 0 ? 'bg-accent-tertiary' : 'bg-accent-quinary';
              return (
                <button
                  key={hId}
                  type="button"
                  onClick={() => setActiveHabitId(hId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                    activeHabitId === hId
                      ? `${pillTheme} text-white shadow-md`
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{h.icon || '🏃'}</span>
                  <span>{h.title}</span>
                </button>
              );
            })}
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg} space-y-4 shadow-xs`}>
            {/* Header Info & Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner"
                  style={{
                    backgroundColor: isAllView ? 'var(--accent-glow)' : `${activeHabit?.color || 'var(--accent)'}20`,
                    color: isAllView ? 'var(--accent)' : activeHabit?.color || 'var(--accent)',
                    border: `1px solid ${isAllView ? 'var(--accent)' : `${activeHabit?.color || 'var(--accent)'}40`}`
                  }}
                >
                  {isAllView ? <Layers size={18} /> : activeHabit?.icon || '🏃'}
                </div>
                <div>
                  <h3 className={`font-black text-sm sm:text-base ${textTitle}`}>
                    {isAllView ? 'All Habits Combined' : activeHabit?.title}
                  </h3>
                  <p className={`text-xs ${textMuted}`}>
                    {monthName} {year} {viewMode === 'calendar' ? 'Heatmap Matrix' : 'Completion Line Trend & Boolean Matrix'}
                  </p>
                </div>
              </div>

              {/* Month Navigation & Overall Metric */}
              <div className="flex items-center gap-3">
                {/* Overall Month Completion % Badge */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-accent-quaternary text-white shadow-md font-extrabold text-xs">
                  <Percent size={14} />
                  <span>Month Avg: {monthOverallPct}%</span>
                </div>

                {monthOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMonthOffset(0)}
                    className="px-3.5 py-1.5 rounded-full bg-accent-light text-accent-primary border border-accent-primary/30 text-xs font-black hover:brightness-110 transition-all"
                  >
                    Current Month
                  </button>
                )}

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMonthOffset((prev) => prev - 1)}
                    className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-xs font-black px-2 min-w-[90px] text-center text-slate-800 dark:text-slate-200">
                    {monthName} {year}
                  </span>

                  <button
                    type="button"
                    onClick={() => setMonthOffset((prev) => prev + 1)}
                    className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* VIEW MODE 1: CALENDAR MATRIX */}
            {viewMode === 'calendar' && (
              <div className="space-y-4">
                {/* Visual Legend Bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-xs" />
                    <span className="text-emerald-600 dark:text-emerald-400">Completed Dot (Green)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-xs" />
                    <span className="text-rose-600 dark:text-rose-400">Missed Dot (Red)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-950 border border-emerald-500/50" />
                    <span className="text-slate-600 dark:text-slate-300">100% Tier Shading</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-rose-950 border border-rose-500/50" />
                    <span className="text-slate-600 dark:text-slate-300">Low / Missed Shading</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300" />
                    <span className="text-slate-500">Off / Not Scheduled</span>
                  </div>
                </div>

                {/* Month Heatmap Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {monthName} {year} Heatmap Matrix
                  </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {monthDays.map((d) => {
                      const isPast = d.iso < todayIso;
                      const isToday = d.iso === todayIso;

                      if (isAllView) {
                        const scheduledItems = habitList.filter((h: any) => isHabitScheduledForDate(h, d.iso));
                        const totalSched = scheduledItems.length;

                        const doneCount = scheduledItems.filter((h: any) =>
                          (h.history || []).some((entry: any) => entry.date === d.iso && entry.status === 'done')
                        ).length;

                        const notDoneCount = totalSched - doneCount;
                        const percent = totalSched > 0 ? Math.round((doneCount / totalSched) * 100) : 0;

                        const dots: { color: string }[] = [];
                        for (let i = 0; i < doneCount; i++) {
                          dots.push({ color: 'bg-emerald-500 shadow-xs ring-1 ring-emerald-600/30' });
                        }
                        for (let i = 0; i < notDoneCount; i++) {
                          if (isPast) {
                            dots.push({ color: 'bg-rose-500 shadow-xs ring-1 ring-rose-600/30' });
                          } else if (isToday) {
                            dots.push({ color: 'bg-accent-primary shadow-xs ring-1 ring-accent-primary/30' });
                          } else {
                            dots.push({ color: 'bg-slate-300 dark:bg-slate-700' });
                          }
                        }

                        let cellClass = 'p-2.5 sm:p-3 rounded-xl text-center flex flex-col items-center justify-between min-h-[72px] border transition-all';

                        if (totalSched === 0) {
                          cellClass += ' bg-slate-100/50 dark:bg-slate-950/30 text-slate-400 border-dashed border-slate-200 dark:border-slate-800 opacity-50';
                        } else if (percent === 100) {
                          cellClass += ' bg-emerald-950/80 dark:bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/50 font-black';
                        } else if (percent >= 75) {
                          cellClass += ' bg-lime-950/80 dark:bg-lime-950/90 text-lime-300 border-lime-500/50 shadow-md shadow-lime-950/50 font-black';
                        } else if (percent >= 50) {
                          cellClass += ' bg-amber-950/80 dark:bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/50 font-black';
                        } else if (percent > 0) {
                          cellClass += ' bg-rose-950/80 dark:bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950/50 font-black';
                        } else if (isPast) {
                          cellClass += ' bg-slate-900/90 dark:bg-slate-950 text-slate-400 border-slate-800/80 font-black';
                        } else {
                          cellClass += ' bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                        }

                        return (
                          <div key={d.iso} className={cellClass}>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-black">{d.dayNum}</span>
                              {totalSched > 0 && <span className="text-[10px] font-extrabold opacity-80">{percent}%</span>}
                            </div>

                            {totalSched > 0 && (
                              <div className="flex flex-wrap items-center justify-center gap-1 mt-1 max-w-[60px]">
                                {dots.map((dot, idx) => (
                                  <span key={idx} className={`w-2.5 h-2.5 rounded-full ${dot.color}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        const scheduled = isHabitScheduledForDate(activeHabit, d.iso);
                        const hist = (activeHabit?.history || []).find((entry: any) => entry.date === d.iso);
                        const isDone = hist?.status === 'done';
                        const isFailed = hist?.status === 'failed' || hist?.status === 'false';
                        const val = hist ? (hist.value || 0) : 0;
                        const pTier = getHabitProgressColor(val, activeHabit?.target?.value || 1, activeHabit?.target?.unit, hist?.status);

                        let cellStyle = '';

                        if (!scheduled) {
                          cellStyle = 'bg-slate-100/50 dark:bg-slate-950/30 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 opacity-50';
                        } else if (isDone || pTier === 'done') {
                          cellStyle = 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20 border border-emerald-400';
                        } else if (pTier === 'p75') {
                          cellStyle = 'bg-lime-500 text-slate-950 font-black shadow-md shadow-lime-500/20 border border-lime-400';
                        } else if (pTier === 'p50') {
                          cellStyle = 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 border border-amber-400';
                        } else if (pTier === 'p25') {
                          cellStyle = 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20 border border-orange-400';
                        } else if (isFailed) {
                          cellStyle = 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20 border border-rose-400';
                        } else if (isPast) {
                          cellStyle = 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20 border border-rose-400';
                        } else if (isToday) {
                          cellStyle = 'bg-accent-gradient text-white font-black shadow-md shadow-accent/20 border border-accent-primary';
                        } else {
                          cellStyle = 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                        }

                        return (
                          <HabitCellTooltip
                            key={d.iso}
                            dateIso={d.iso}
                            habit={activeHabit}
                            hist={hist}
                            scheduled={scheduled}
                            isDone={isDone}
                            isFailed={isFailed}
                            isPast={isPast}
                          >
                            <div
                              className={`p-3 rounded-xl text-center flex items-center justify-center min-h-[56px] transition-all cursor-pointer ${cellStyle}`}
                            >
                              <span className="text-sm font-black">{d.dayNum}</span>
                            </div>
                          </HabitCellTooltip>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: RECHARTS SMOOTH LINE / AREA GRAPH (TARGET VS DONE) */}
            {viewMode === 'graph' && (() => {
              const activeUnitRaw = (activeHabit?.target?.unit || 'yes_no').toLowerCase().trim();
              const yAxisLabelText = isAllView
                ? 'Tasks Count'
                : ['yes_no', 'boolean', 'mark_done'].includes(activeUnitRaw)
                ? 'Status (0 or 1)'
                : ['hours', 'hrs', 'hour'].includes(activeUnitRaw)
                ? 'Hours (hrs)'
                : activeHabit?.target?.unit || 'Units';

              return (
                <div className="space-y-8">
                  {/* 1. Recharts Smooth Line / Area Chart */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-400" />
                        Scheduled Target vs. Achieved Trend Graph
                      </h4>
                    </div>

                    {/* Line Chart Container */}
                    <div className="w-full h-80 pt-2 pb-2">
                      {isMounted && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: 10, bottom: 20 }}>
                            <defs>
                              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                              </linearGradient>
                              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415525" />
                            <XAxis
                              dataKey="dayLabel"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                            >
                              <Label
                                value={`Day of ${monthName}`}
                                position="insideBottom"
                                offset={-12}
                                style={{ fill: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}
                              />
                            </XAxis>
                            <YAxis
                              domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                            >
                              <Label
                                value={yAxisLabelText}
                                angle={-90}
                                position="insideLeft"
                                offset={-5}
                                style={{ fill: '#64748B', fontSize: 10, fontWeight: 800, textAnchor: 'middle', letterSpacing: '0.05em' }}
                              />
                            </YAxis>
                            <RechartsTooltip content={<CustomGraphTooltip />} />

                            {/* Red Line: Scheduled Target */}
                            <Area
                              type="monotone"
                              dataKey="total"
                              name="Total Target"
                              stroke="#F43F5E"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              fillOpacity={1}
                              fill="url(#redGradient)"
                              dot={{ r: 3.5, fill: '#F43F5E', strokeWidth: 1, stroke: '#ffffff' }}
                            />

                            {/* Green Line: Completed / Achieved */}
                            <Area
                              type="monotone"
                              dataKey="done"
                              name="Completed / Achieved"
                              stroke="#10B981"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#greenGradient)"
                              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
                              activeDot={{ r: 7, fill: '#10B981', strokeWidth: 3, stroke: '#ffffff' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-bold space-y-1">
                          <span>No scheduled dates found for {monthName} {year}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
