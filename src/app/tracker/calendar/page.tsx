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
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useTracker, calculateHabitStreak, isHabitScheduledForDate } from '../TrackerContext';

export default function CalendarPage() {
  const { habits } = useTracker();
  const [viewMode, setViewMode] = useState<'calendar' | 'graph'>('calendar');
  const [activeHabitId, setActiveHabitId] = useState<string>('all');
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  const todayIso = new Date().toISOString().split('T')[0];
  const habitList = habits.filter((h: any) => h.type === 'habit');
  const isAllView = activeHabitId === 'all';
  const activeHabit = isAllView ? null : habits.find((h: any) => h._id === activeHabitId) || habitList[0] || habits[0];

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

    const scheduledItems = (isAllView ? habits : activeHabit ? [activeHabit] : habits).filter((h: any) =>
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

  // Chart Data for Recharts
  const chartData = dailyStats.map((stat) => ({
    dayLabel: String(stat.dayNum),
    iso: stat.iso,
    percentage: stat.pct,
    done: stat.doneCount,
    total: stat.totalSched,
  }));

  const CustomGraphTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold rounded-xl shadow-xl border border-slate-700 space-y-1">
          <div className="text-slate-400 text-3xs uppercase tracking-wider">{data.iso}</div>
          <div className="flex items-center gap-2 text-sm font-black text-indigo-400">
            <span>{data.percentage}% Completed</span>
          </div>
          <div className="text-2xs text-slate-300">
            {data.done} of {data.total} tasks/habits completed
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
          <h2 className={`text-lg sm:text-xl font-black ${textTitle}`}>Monthly Habit Tracking</h2>
          <p className={`text-xs ${textMuted}`}>Switch between Calendar Heatmap and Smooth Line Trend Graphs.</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              viewMode === 'calendar'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CalendarIcon size={15} />
            <span>Calendar View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              viewMode === 'graph'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Activity size={15} />
            <span>Line Graph & 0/1 Matrix</span>
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className={`p-10 rounded-2xl border ${cardBg} text-center space-y-3`}>
          <CalendarIcon size={32} className="text-indigo-500 mx-auto" />
          <h4 className={`font-black text-base ${textTitle}`}>No Habits Available</h4>
          <p className={`text-xs ${textMuted}`}>Create habits in the Habits tab to view monthly statistics.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Habit Filter Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveHabitId('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                isAllView
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Layers size={15} />
              <span>All Tasks & Habits Combined</span>
            </button>

            {habits.map((h: any) => (
              <button
                key={h._id}
                type="button"
                onClick={() => setActiveHabitId(h._id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                  activeHabitId === h._id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{h.icon || '🏃'}</span>
                <span>{h.title}</span>
              </button>
            ))}
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} space-y-6 shadow-xs`}>
            {/* Header Info & Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                  style={{
                    backgroundColor: isAllView ? '#6366F120' : `${activeHabit?.color || '#6366F1'}20`,
                    color: isAllView ? '#6366F1' : activeHabit?.color || '#6366F1',
                    border: `1px solid ${isAllView ? '#6366F140' : `${activeHabit?.color || '#6366F1'}40`}`
                  }}
                >
                  {isAllView ? <Layers size={22} /> : activeHabit?.icon || '🏃'}
                </div>
                <div>
                  <h3 className={`font-black text-base sm:text-lg ${textTitle}`}>
                    {isAllView ? 'All Tasks & Habits Combined' : activeHabit?.title}
                  </h3>
                  <p className={`text-xs ${textMuted}`}>
                    {monthName} {year} {viewMode === 'calendar' ? 'Heatmap Matrix' : 'Completion Line Trend & Boolean Matrix'}
                  </p>
                </div>
              </div>

              {/* Month Navigation & Overall Metric */}
              <div className="flex items-center gap-3">
                {/* Overall Month Completion % Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  <Percent size={14} />
                  <span>Month Avg: {monthOverallPct}%</span>
                </div>

                {monthOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMonthOffset(0)}
                    className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-black hover:bg-purple-500/20 transition-all"
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
                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-400 text-emerald-800" />
                    <span className="text-slate-600 dark:text-slate-300">Light Pastel Background Shading</span>
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
                        const scheduledItems = habits.filter((h: any) => isHabitScheduledForDate(h, d.iso));
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
                            dots.push({ color: 'bg-indigo-500 shadow-xs ring-1 ring-indigo-600/30' });
                          } else {
                            dots.push({ color: 'bg-slate-300 dark:bg-slate-700' });
                          }
                        }

                        const hue = Math.round((percent / 100) * 120);

                        let cellStyle: React.CSSProperties = {};
                        let cellClass = 'p-2.5 sm:p-3 rounded-xl text-center flex flex-col items-center justify-between min-h-[72px] border transition-all';

                        if (totalSched === 0) {
                          cellClass += ' bg-slate-100/50 dark:bg-slate-950/30 text-slate-400 border-dashed border-slate-200 dark:border-slate-800 opacity-50';
                        } else if (isPast || isToday || doneCount > 0) {
                          cellStyle = {
                            backgroundColor: `hsl(${hue}, 85%, 93%)`,
                            borderColor: `hsl(${hue}, 70%, 48%)`,
                            color: `hsl(${hue}, 90%, 20%)`
                          };
                          cellClass += ' shadow-xs font-black';
                        } else {
                          cellClass += ' bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                        }

                        return (
                          <div key={d.iso} style={cellStyle} className={cellClass}>
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

                        let cellStyle = '';

                        if (!scheduled) {
                          cellStyle = 'bg-slate-100/50 dark:bg-slate-950/30 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 opacity-50';
                        } else if (isDone) {
                          cellStyle = 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20 border border-emerald-400';
                        } else if (isPast) {
                          cellStyle = 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20 border border-rose-400';
                        } else if (isToday) {
                          cellStyle = 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20 border border-indigo-400';
                        } else {
                          cellStyle = 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800';
                        }

                        return (
                          <div
                            key={d.iso}
                            className={`p-3 rounded-xl text-center flex items-center justify-center min-h-[56px] transition-all ${cellStyle}`}
                          >
                            <span className="text-sm font-black">{d.dayNum}</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: RECHARTS SMOOTH LINE / AREA GRAPH & 0/1 BOOLEAN VIEW */}
            {viewMode === 'graph' && (
              <div className="space-y-8">
                {/* 1. Recharts Smooth Line / Area Chart */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" />
                        Habit Completion % Line & Area Trend Graph
                      </h4>
                      <p className="text-2xs text-slate-500">Smooth trend line of daily habit completions for {monthName} {year}.</p>
                    </div>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                      Month Average: {monthOverallPct}%
                    </span>
                  </div>

                  {/* Line Chart Container */}
                  <div className="w-full h-72 pt-4">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                          <XAxis
                            dataKey="dayLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                            tickFormatter={(val) => `${val}%`}
                          />
                          <RechartsTooltip content={<CustomGraphTooltip />} />
                          <ReferenceLine y={50} stroke="#6366F1" strokeDasharray="3 3" opacity={0.3} />
                          <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke="#6366F1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#completionGradient)"
                            dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#ffffff' }}
                            activeDot={{ r: 7, fill: '#4F46E5', strokeWidth: 3, stroke: '#ffffff' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
