'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckSquare,
  Flame,
  Award,
  Target,
  Clock,
  RotateCcw,
  BookOpen,
  Calendar,
  Zap,
  ShieldCheck,
  Percent,
  Layers,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { useTracker } from '../TrackerContext';

interface ConsistencyApiResponse {
  range: 'month' | 'alltime';
  monthKey?: string;
  monthName?: string;
  overallScore: number;
  habitScore: number;
  taskScore: number;
  revisionScore: number;
  grade: string;
  trend: Array<{
    studyDayKey: string;
    overallScore: number;
    habitScore?: number;
    taskScore?: number;
    revisionScore?: number;
  }>;
  habits: Array<{
    habitId: string;
    title: string;
    type?: string;
    icon?: string;
    category?: string;
    scheduledDays: number;
    completedDays: number;
    score: number;
    streakCurrent: number;
    streakBest: number;
  }>;
  categories?: Array<{
    category: string;
    subject?: string;
    revisionsDue: number;
    revisionsDone: number;
    revisionsMissed: number;
    score: number;
    topicsRead?: number;
  }>;
  subjects: Array<{
    subject: string;
    category?: string;
    revisionsDue: number;
    revisionsDone: number;
    revisionsMissed: number;
    score: number;
    topicsRead?: number;
  }>;
}

interface DropdownOption {
  id: string;
  label: string;
  score?: number;
  icon?: string;
}

function CustomAnalyticsDropdown({
  options,
  selectedId,
  onSelect,
  placeholderIcon,
  placeholderText,
  allCount
}: {
  options: DropdownOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholderIcon: string;
  placeholderText: string;
  allCount: number;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-xs cursor-pointer min-w-[190px] max-w-[300px]"
      >
        <span className="truncate flex items-center gap-2">
          <span>{selectedOption ? selectedOption.icon || '📌' : placeholderIcon}</span>
          <span className="truncate">{selectedOption ? selectedOption.label : placeholderText}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption && selectedOption.score !== undefined ? (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                selectedOption.score >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                  : selectedOption.score >= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {selectedOption.score}%
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {allCount}
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2 max-h-72 overflow-y-auto animate-in fade-in-50 zoom-in-95">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-black text-left transition-colors ${
              selectedId === null
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <span>{placeholderIcon}</span>
              <span className="truncate">{placeholderText}</span>
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {allCount}
            </span>
          </button>

          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelect(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black'
                    : 'text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate pr-2">
                  <span>{opt.icon || '📌'}</span>
                  <span className="truncate">{opt.label}</span>
                </span>
                {opt.score !== undefined && (
                  <span
                    className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      opt.score >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : opt.score >= 50
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {opt.score}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { habits: trackerHabits } = useTracker();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toggle A: TIME RANGE ('month' | 'alltime')
  const [timeRange, setTimeRange] = useState<'month' | 'alltime'>('month');

  // Toggle B: SCOPE ('overall' | 'habit' | 'category' | 'subject')
  const [scope, setScope] = useState<'overall' | 'habit' | 'category' | 'subject'>('overall');

  // Selected Month State (for Toggle A = 'month')
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Drill-down State
  const [drilledHabitId, setDrilledHabitId] = useState<string | null>(null);
  const [drilledCategory, setDrilledCategory] = useState<string | null>(null);
  const [drilledSubject, setDrilledSubject] = useState<string | null>(null);

  // Data State
  const [data, setData] = useState<ConsistencyApiResponse | null>(null);

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  // Fetch Consistency Engine v3 Data
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/api/tracker/consistency?range=${timeRange}&scope=${scope}`;
      if (timeRange === 'month') {
        url += `&monthKey=${currentMonthKey}`;
      }
      if (drilledHabitId) {
        url += `&habitId=${drilledHabitId}`;
      }
      if (drilledCategory) {
        url += `&category=${encodeURIComponent(drilledCategory)}`;
      }
      if (drilledSubject) {
        url += `&subject=${encodeURIComponent(drilledSubject)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch consistency data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, [timeRange, scope, currentMonthKey, drilledHabitId, drilledCategory, drilledSubject]);

  // Recalculate Today (Manual Engine Trigger)
  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await fetch('/api/tracker/consistency/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'manual' })
      });
      if (res.ok) {
        const resJson = await res.json();
        setToastMessage(`Updated as of ${resJson.calculatedAt || 'Now'}`);
        await fetchData();
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to recalculate consistency score:', err);
    } finally {
      setRecalculating(false);
    }
  };

  // Month Navigation Handlers
  const handleMonthChange = (delta: number) => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonthKey(`${newY}-${newM}`);
  };

  const getMonthDisplay = () => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  // Grade Info Pill Stylings
  const getGradeBadge = (score: number) => {
    if (score >= 90) return { label: 'S-TIER CONSISTENT', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' };
    if (score >= 75) return { label: 'A-TIER CONSISTENT', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (score >= 60) return { label: 'B-TIER STABLE', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    return { label: 'NEEDS FOCUS', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' };
  };

  // Dynamic Radial & Header Calculations
  let activeScore = data?.overallScore || 0;
  let activeTitle = timeRange === 'month' ? `${data?.monthName || getMonthDisplay()} Consistency` : 'All-Time Cumulative Consistency';
  let activeSubtitle = timeRange === 'month'
    ? 'Pre-computed average across daily study snapshots recorded this month.'
    : 'Weighted average across all monthly snapshots stored in database.';

  if (scope === 'habit') {
    const selHabit = drilledHabitId ? data?.habits?.find(h => h.habitId === drilledHabitId) : null;
    activeScore = selHabit ? selHabit.score : (data?.habitScore || 0);
    activeTitle = selHabit ? `${selHabit.title} Execution` : 'Habits Overall Execution';
    activeSubtitle = selHabit
      ? `${selHabit.completedDays} of ${selHabit.scheduledDays} Days Completed • ${selHabit.streakCurrent}d Current Streak`
      : 'Average execution rate across all habits in your tracker.';
  } else if (scope === 'category') {
    const selCat = drilledCategory ? data?.categories?.find(c => (c.category || c.subject) === drilledCategory) : null;
    activeScore = selCat ? selCat.score : (data?.revisionScore || 0);
    activeTitle = selCat ? `${selCat.category || selCat.subject} Retention` : 'Category-wise Spaced Revision Retention';
    activeSubtitle = selCat
      ? `${selCat.revisionsDone} Done / ${selCat.revisionsDue} Due • ${selCat.topicsRead || 0} Topics Read`
      : 'Aggregated SRS retention score across syllabus categories.';
  } else if (scope === 'subject') {
    const selSubj = drilledSubject ? data?.subjects?.find(s => s.subject === drilledSubject) : null;
    activeScore = selSubj ? selSubj.score : (data?.revisionScore || 0);
    activeTitle = selSubj ? `${selSubj.subject} Retention` : 'Syllabus Matrix Subjects Retention';
    activeSubtitle = selSubj
      ? `Category: ${selSubj.category || 'GS'} • ${selSubj.revisionsDone} Done / ${selSubj.revisionsDue} Due`
      : 'Granular retention breakdown for subjects pulled directly from Syllabus Matrix.';
  }

  const gradeInfo = getGradeBadge(activeScore);

  // Dynamic Sub-Metric Card Values
  let subCards = [
    { label: 'Habit (40%)', value: `${data?.habitScore || 0}%`, sub: 'Routines', color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Tasks (30%)', value: `${data?.taskScore || 0}%`, sub: 'Execution', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Revisions (30%)', value: `${data?.revisionScore || 0}%`, sub: 'SRS Retention', color: 'text-purple-600 dark:text-purple-400' }
  ];

  if (scope === 'habit') {
    const selHabit = drilledHabitId ? data?.habits?.find(h => h.habitId === drilledHabitId) : null;
    const sched = selHabit ? selHabit.scheduledDays : (data?.habits?.reduce((a,b)=>a+b.scheduledDays,0) || 0);
    const comp = selHabit ? selHabit.completedDays : (data?.habits?.reduce((a,b)=>a+b.completedDays,0) || 0);
    const streak = selHabit ? `${selHabit.streakCurrent}d` : 'Active';
    const best = selHabit ? `Best: ${selHabit.streakBest}d` : 'Streak';

    subCards = [
      { label: 'Scheduled', value: `${sched}d`, sub: 'Total Target', color: 'text-indigo-600 dark:text-indigo-400' },
      { label: 'Completed', value: `${comp}d`, sub: 'Logged Days', color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Current Streak', value: streak, sub: best, color: 'text-amber-500' }
    ];
  } else if (scope === 'category') {
    const selCat = drilledCategory ? data?.categories?.find(c => (c.category || c.subject) === drilledCategory) : null;
    const due = selCat ? selCat.revisionsDue : (data?.categories?.reduce((a,b)=>a+b.revisionsDue,0) || 0);
    const done = selCat ? selCat.revisionsDone : (data?.categories?.reduce((a,b)=>a+b.revisionsDone,0) || 0);
    const missed = selCat ? selCat.revisionsMissed : (data?.categories?.reduce((a,b)=>a+b.revisionsMissed,0) || 0);

    subCards = [
      { label: 'Revisions Due', value: `${due}`, sub: 'Scheduled', color: 'text-indigo-600 dark:text-indigo-400' },
      { label: 'Completed', value: `${done}`, sub: 'Done (+1.0)', color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Missed', value: `${missed}`, sub: 'Penalty (-1.3)', color: 'text-rose-600 dark:text-rose-400' }
    ];
  } else if (scope === 'subject') {
    const selSubj = drilledSubject ? data?.subjects?.find(s => s.subject === drilledSubject) : null;
    const due = selSubj ? selSubj.revisionsDue : (data?.subjects?.reduce((a,b)=>a+b.revisionsDue,0) || 0);
    const done = selSubj ? selSubj.revisionsDone : (data?.subjects?.reduce((a,b)=>a+b.revisionsDone,0) || 0);
    const missed = selSubj ? selSubj.revisionsMissed : (data?.subjects?.reduce((a,b)=>a+b.revisionsMissed,0) || 0);

    subCards = [
      { label: 'Revisions Due', value: `${due}`, sub: 'Scheduled', color: 'text-indigo-600 dark:text-indigo-400' },
      { label: 'Completed', value: `${done}`, sub: 'Done (+1.0)', color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Missed', value: `${missed}`, sub: 'Penalty (-1.3)', color: 'text-rose-600 dark:text-rose-400' }
    ];
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-3xs uppercase font-extrabold tracking-wider opacity-75">Auto Snapshot</span>
        </div>
      )}

      {/* Loading State for initial API fetch */}
      {loading && !data && (
        <div className={`p-16 sm:p-20 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
          <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
          <p className={`text-sm font-bold ${textMuted}`}>Loading Analytics Dashboard...</p>
          <p className={`text-[10px] ${textMuted}`}>Fetching consistency snapshots from database</p>
        </div>
      )}

      {/* Main Analytics Content — only show when data is available or not initial loading */}
      {(!loading || data) && (<>

      {/* HEADER BAR & ENGINE RECALCULATE TRIGGER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-black ${textTitle} tracking-tight`}>Consistency Engine v3</h1>
            <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Live DB Synced
            </span>
          </div>
          <p className={`text-xs ${textMuted} mt-0.5`}>
            Multi-dimensional study analytics across habits, syllabus categories, and subjects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} className={recalculating ? 'animate-spin' : ''} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Snapshots'}</span>
          </button>
        </div>
      </div>

      {/* TOGGLE BAR (TIME RANGE & SCOPE) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
        {/* LEFT TOGGLE: TIME RANGE */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                timeRange === 'month'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              This Month
            </button>

            <button
              type="button"
              onClick={() => setTimeRange('alltime')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                timeRange === 'alltime'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* MONTH PICKER (Only visible when timeRange === 'month') */}
          {timeRange === 'month' && (
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <button
                type="button"
                onClick={() => handleMonthChange(-1)}
                className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 min-w-[100px] text-center">
                {getMonthDisplay()}
              </span>
              <button
                type="button"
                onClick={() => handleMonthChange(1)}
                className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT TOGGLE: SCOPE TABS & TOP ITEM FILTER DROPDOWN */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center p-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setScope('overall');
                setDrilledHabitId(null);
                setDrilledCategory(null);
                setDrilledSubject(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                scope === 'overall'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Overall Score
            </button>

            <button
              type="button"
              onClick={() => {
                setScope('habit');
                setDrilledCategory(null);
                setDrilledSubject(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                scope === 'habit'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Habit-wise
            </button>

            <button
              type="button"
              onClick={() => {
                setScope('category');
                setDrilledHabitId(null);
                setDrilledSubject(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                scope === 'category'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Category
            </button>

            <button
              type="button"
              onClick={() => {
                setScope('subject');
                setDrilledHabitId(null);
                setDrilledCategory(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                scope === 'subject'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Subject
            </button>
          </div>

          {/* DYNAMIC TOP FILTER DROPDOWN */}
          {scope === 'habit' && (
            <CustomAnalyticsDropdown
              placeholderIcon="🎯"
              placeholderText="All Habits"
              allCount={data?.habits?.length || 0}
              selectedId={drilledHabitId}
              onSelect={setDrilledHabitId}
              options={(data?.habits || []).map((h) => ({
                id: h.habitId,
                label: h.title,
                icon: h.icon || (h.type === 'habit' ? '🏃' : '📚'),
                score: h.score
              }))}
            />
          )}

          {scope === 'category' && (
            <CustomAnalyticsDropdown
              placeholderIcon="📂"
              placeholderText="All Categories"
              allCount={data?.categories?.length || 0}
              selectedId={drilledCategory}
              onSelect={setDrilledCategory}
              options={(data?.categories || []).map((c) => {
                const catName = c.category || c.subject || 'General';
                return {
                  id: catName,
                  label: catName,
                  icon: '📁',
                  score: c.score
                };
              })}
            />
          )}

          {scope === 'subject' && (
            <CustomAnalyticsDropdown
              placeholderIcon="📚"
              placeholderText="All Subjects"
              allCount={data?.subjects?.length || 0}
              selectedId={drilledSubject}
              onSelect={setDrilledSubject}
              options={(data?.subjects || []).map((s) => ({
                id: s.subject,
                label: s.subject,
                icon: '📖',
                score: s.score
              }))}
            />
          )}
        </div>
      </div>

      {/* RADIAL SCORE GAUGE BANNER (Dynamic for ALL Scopes & Selections) */}
      <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg} shadow-sm relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="7" className="text-slate-100 dark:text-slate-800" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#v3Grad)"
                  strokeWidth="7"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - (251.3 * activeScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="v3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                {loading ? (
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                ) : (
                  <>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                      {activeScore}%
                    </span>
                    <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">Score</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-1.5">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${gradeInfo.color} inline-flex items-center gap-1`}>
                  <Sparkles size={11} /> {gradeInfo.label}
                </span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${textTitle}`}>
                {activeTitle}
              </h3>
              <p className={`text-xs ${textMuted} font-medium max-w-md`}>
                {activeSubtitle}
              </p>
            </div>
          </div>

          {/* Contextual Sub-Score Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {subCards.map((sc, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800/70 text-center flex flex-col items-center justify-center space-y-0.5 min-w-[95px] sm:min-w-[110px]"
              >
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate w-full">
                  {sc.label}
                </span>
                <p className={`text-base sm:text-lg font-black ${sc.color}`}>
                  {sc.value}
                </p>
                <span className="text-[10px] text-slate-400 font-extrabold truncate w-full">
                  {sc.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TREND AREA CHART BANNER */}
      <div className={`p-6 rounded-3xl border ${cardBg} space-y-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
              <TrendingUp size={18} className="text-indigo-500" />
              {timeRange === 'month' ? 'Daily Progression Trend' : 'Monthly Progression Trend'}
            </h3>
            <p className={`text-xs ${textMuted}`}>
              {timeRange === 'month' ? 'Daily snapshots recorded this month' : 'Aggregated monthly consistency snapshots'}
            </p>
          </div>
        </div>

        {data?.trend && data.trend.length > 0 ? (
          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="studyDayKey" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                />
                <Area type="monotone" dataKey="overallScore" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500">No trend snapshots available for this timeframe.</p>
          </div>
        )}
      </div>

      </>)}
    </div>
  );
}
