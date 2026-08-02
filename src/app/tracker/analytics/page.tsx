"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  RotateCcw,
  Zap,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  PieChart,
  Activity,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import dynamic from "next/dynamic";
import { useTracker } from "../TrackerContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ConsistencyApiResponse {
  range: "month" | "alltime";
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
  allCount,
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          <span>{selectedOption ? selectedOption.icon || "📌" : placeholderIcon}</span>
          <span className="truncate">{selectedOption ? selectedOption.label : placeholderText}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption && selectedOption.score !== undefined ? (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                selectedOption.score >= 80
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                  : selectedOption.score >= 50
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {selectedOption.score}%
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {allCount}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
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
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
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
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black"
                    : "text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate pr-2">
                  <span>{opt.icon || "📌"}</span>
                  <span className="truncate">{opt.label}</span>
                </span>
                {opt.score !== undefined && (
                  <span
                    className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      opt.score >= 80
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        : opt.score >= 50
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
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
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Top Level View Mode Switcher: 'velocity' (Weekly Hours) vs 'consistency' (Consistency Engine v3)
  const [activeTab, setActiveTab] = useState<"velocity" | "consistency">("velocity");

  // Toggle for Velocity Chart Metric: 'hours' vs 'tasks'
  const [velocityMetric, setVelocityMetric] = useState<"hours" | "tasks">("hours");

  // Distribution Mode in Velocity Tab: 'subject' vs 'habit'
  const [distributionMode, setDistributionMode] = useState<"subject" | "habit">("subject");

  // Toggle A: TIME RANGE ('month' | 'alltime')
  const [timeRange, setTimeRange] = useState<"month" | "alltime">("month");

  // Toggle B: SCOPE ('overall' | 'habit' | 'category' | 'subject')
  const [scope, setScope] = useState<"overall" | "habit" | "category" | "subject">("overall");

  // Selected Month State (for Toggle A = 'month')
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // Drill-down State
  const [drilledHabitId, setDrilledHabitId] = useState<string | null>(null);
  const [drilledCategory, setDrilledCategory] = useState<string | null>(null);
  const [drilledSubject, setDrilledSubject] = useState<string | null>(null);

  // Data States (Completely Separated)
  const [data, setData] = useState<ConsistencyApiResponse | null>(null);
  const [weeklyDoc, setWeeklyDoc] = useState<any>(null);

  const cardBg = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80";
  const textTitle = "text-slate-900 dark:text-slate-100";
  const textMuted = "text-slate-500 dark:text-slate-400";

  // Pure DB Values (No Hardcoded Fallbacks)
  const weeklyData = weeklyDoc?.weeklyData || [];
  const subjectDistribution = weeklyDoc?.subjectDistribution || [];
  const habitDistribution = weeklyDoc?.habitDistribution || [];

  // Fetch Weekly Analytics Data (Separate API)
  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tracker/weekly-analytics");
      if (res.ok) {
        const json = await res.json();
        setWeeklyDoc(json);
      }
    } catch (err) {
      console.error("Failed to fetch weekly analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Consistency Engine Data (Separate API)
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/api/tracker/consistency?range=${timeRange}&scope=${scope}`;
      if (timeRange === "month") {
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
      console.error("Failed to fetch consistency data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "velocity") {
      fetchWeeklyData();
    } else {
      fetchData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "consistency") {
      fetchData();
    }
  }, [timeRange, scope, currentMonthKey, drilledHabitId, drilledCategory, drilledSubject]);

  // Tab-Aware Recalculation Handler (Completely Isolated APIs)
  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      if (activeTab === "velocity") {
        const res = await fetch("/api/tracker/weekly-analytics", { method: "POST" });
        if (res.ok) {
          const json = await res.json();
          const calculatedAt =
            json.data?.calculatedAt ||
            json.calculatedAt ||
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setToastMessage(`Recalculated & saved Weekly Velocity to MongoDB as of ${calculatedAt}`);
          await fetchWeeklyData();
        }
      } else {
        const res = await fetch("/api/tracker/consistency/recalculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "manual" }),
        });
        if (res.ok) {
          const json = await res.json();
          setToastMessage(`Recalculated Consistency Score & saved to MongoDB as of ${json.calculatedAt || "4:00 AM"}`);
          await fetchData();
        }
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to recalculate engine:", err);
    } finally {
      setRecalculating(false);
    }
  };

  // Month Navigation Handlers
  const handleMonthChange = (delta: number) => {
    const [y, m] = currentMonthKey.split("-").map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, "0");
    setCurrentMonthKey(`${newY}-${newM}`);
  };

  const getMonthDisplay = () => {
    const [y, m] = currentMonthKey.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  // Grade Info Pill Stylings
  const getGradeBadge = (score: number) => {
    if (score >= 90)
      return {
        label: "S-TIER CONSISTENT",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      };
    if (score >= 75)
      return {
        label: "A-TIER CONSISTENT",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      };
    if (score >= 60)
      return {
        label: "B-TIER STABLE",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      };
    return { label: "NEEDS FOCUS", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" };
  };

  // Dynamic Radial & Header Calculations
  let activeScore = data?.overallScore || 0;
  let activeTitle =
    timeRange === "month" ? `${data?.monthName || getMonthDisplay()} Consistency` : "All-Time Cumulative Consistency";
  let activeSubtitle =
    timeRange === "month"
      ? "Pre-computed average across daily study snapshots recorded this month."
      : "Weighted average across all monthly snapshots stored in database.";

  if (scope === "habit") {
    const selHabit = drilledHabitId ? data?.habits?.find((h) => h.habitId === drilledHabitId) : null;
    if (selHabit) {
      activeScore = selHabit.score;
    } else if (data?.habits && data.habits.length > 0) {
      const totalSched = data.habits.reduce((acc, h) => acc + (h.scheduledDays || 0), 0);
      if (totalSched === 0) {
        activeScore = 0;
      } else {
        const totalComp = data.habits.reduce((acc, h) => acc + (h.completedDays || 0), 0);
        activeScore = Math.round((totalComp / totalSched) * 100);
      }
    } else {
      activeScore = data?.habitScore || 0;
    }
    activeTitle = selHabit ? `${selHabit.title} Execution` : "Habits Overall Execution";
    activeSubtitle = selHabit
      ? `${selHabit.completedDays} of ${selHabit.scheduledDays} Days Completed • ${selHabit.streakCurrent}d Current Streak`
      : "Average execution rate across all habits in your tracker.";
  } else if (scope === "category") {
    const selCat = drilledCategory
      ? data?.categories?.find((c) => (c.category || c.subject) === drilledCategory)
      : null;
    if (selCat) {
      activeScore = selCat.score;
    } else if (data?.categories && data.categories.length > 0) {
      const totalDue = data.categories.reduce((acc, c) => acc + (c.revisionsDue || 0), 0);
      if (totalDue === 0) {
        activeScore = 0;
      } else {
        const totalDone = data.categories.reduce((acc, c) => acc + (c.revisionsDone || 0), 0);
        const totalMissed = data.categories.reduce((acc, c) => acc + (c.revisionsMissed || 0), 0);
        const rawCredit = ((totalDone * 1.0 - totalMissed * 1.3) / totalDue) * 100;
        activeScore = Math.max(0, Math.min(100, Math.round(rawCredit)));
      }
    } else {
      activeScore = 0;
    }
    activeTitle = selCat ? `${selCat.category || selCat.subject} Retention` : "Category-wise Spaced Revision Retention";
    activeSubtitle = selCat
      ? `${selCat.revisionsDone} Done / ${selCat.revisionsDue} Due • ${selCat.topicsRead || 0} Topics Read`
      : "Aggregated SRS retention score across syllabus categories.";
  } else if (scope === "subject") {
    const selSubj = drilledSubject ? data?.subjects?.find((s) => s.subject === drilledSubject) : null;
    if (selSubj) {
      activeScore = selSubj.score;
    } else if (data?.subjects && data.subjects.length > 0) {
      const totalDue = data.subjects.reduce((acc, s) => acc + (s.revisionsDue || 0), 0);
      if (totalDue === 0) {
        activeScore = 0;
      } else {
        const totalDone = data.subjects.reduce((acc, s) => acc + (s.revisionsDone || 0), 0);
        const totalMissed = data.subjects.reduce((acc, s) => acc + (s.revisionsMissed || 0), 0);
        const rawCredit = ((totalDone * 1.0 - totalMissed * 1.3) / totalDue) * 100;
        activeScore = Math.max(0, Math.min(100, Math.round(rawCredit)));
      }
    } else {
      activeScore = 0;
    }
    activeTitle = selSubj ? `${selSubj.subject} Retention` : "Syllabus Matrix Subjects Retention";
    activeSubtitle = selSubj
      ? `Category: ${selSubj.category || "GS"} • ${selSubj.revisionsDone} Done / ${selSubj.revisionsDue} Due`
      : "Granular retention breakdown for subjects pulled directly from Syllabus Matrix.";
  }

  const gradeInfo = getGradeBadge(activeScore);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-between shadow-sm animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-3xs uppercase font-extrabold tracking-wider opacity-75">Saved to DB</span>
        </div>
      )}

      {/* HEADER BAR & PRIMARY TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg sm:text-xl font-black ${textTitle}`}>Performance & Analytics</h2>
          <p className={`text-xs ${textMuted}`}>
            Track real study hours, daily velocity, subject distribution, and habit execution metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Main View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("velocity")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "velocity"
                  ? "bg-accent-gradient text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <BarChart3 size={14} /> Weekly Velocity
            </button>

            <button
                type="button"
                onClick={() => setActiveTab("consistency")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "consistency"
                    ? "bg-accent-gradient text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Activity size={14} /> Consistency Engine v3
              </button>
          </div>

          <button
            type="button"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} className={recalculating ? "animate-spin" : ""} />
            <span>{recalculating ? "Calculating..." : "Recalculate DB"}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WEEKLY STUDY VELOCITY & DISTRIBUTION (SEPARATE ENGINE & API) */}
      {activeTab === "velocity" && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {loading && !weeklyDoc ? (
            <div className={`p-16 sm:p-20 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
              <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
              <p className={`text-sm font-black ${textTitle}`}>Loading Weekly Study Velocity...</p>
              <p className={`text-xs ${textMuted}`}>Fetching study hours and subject distributions</p>
            </div>
          ) : (
            <>
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 hover:border-accent-primary/50 transition-all">
              <div className="flex items-center justify-between text-accent-primary">
                <span className="text-xs font-extrabold uppercase tracking-wider">Weekly Total</span>
                <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center">
                  <Clock size={15} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-display ${textTitle}`}>
                {weeklyDoc?.weeklyTotalHours ?? 0} <span className="text-xs font-bold text-slate-500 font-sans">hrs</span>
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp size={12} /> Live DB Logged
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-extrabold uppercase tracking-wider">Daily Avg</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap size={15} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-display ${textTitle}`}>
                {weeklyDoc?.dailyAverageHours ?? 0} <span className="text-xs font-bold text-slate-500 font-sans">hrs/day</span>
              </p>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Target: 8.0 hrs/day</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-extrabold uppercase tracking-wider">Consistency</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award size={15} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-display ${textTitle}`}>{weeklyDoc?.consistencyPct ?? 0}%</p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">2+ Day Habit Velocity 🔥</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 hover:border-accent-secondary/50 transition-all">
              <div className="flex items-center justify-between text-accent-secondary">
                <span className="text-xs font-extrabold uppercase tracking-wider">Tasks & Habits</span>
                <div className="w-7 h-7 rounded-lg bg-accent-secondary-light flex items-center justify-center">
                  <CheckCircle size={15} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-display ${textTitle}`}>
                {weeklyDoc?.totalTasksDone ?? 0} <span className="text-xs font-bold text-slate-500 font-sans">completed</span>
              </p>
              <p className="text-[11px] font-bold text-accent-secondary">7-Day Completion Logs</p>
            </div>
          </div>

          {/* Main Visual Velocity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Velocity Chart (Theme Adaptive Light / Dark) */}
            <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl ${cardBg} space-y-5 shadow-xs`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className={`font-black text-lg ${textTitle}`}>7-Day Study Velocity Chart</h3>
                  <p className={`text-xs ${textMuted} font-bold`}>
                    {velocityMetric === "hours"
                      ? "Daily Study Hours vs 8.0 hr Benchmark Target"
                      : "Completed Tasks & Revisions per Day"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Metric Toggle: Hours vs Tasks */}
                  <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setVelocityMetric("hours")}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        velocityMetric === "hours"
                          ? "bg-accent-primary text-white shadow-2xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Hours (hrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVelocityMetric("tasks")}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        velocityMetric === "tasks"
                          ? "bg-accent-secondary text-white shadow-2xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Tasks (count)
                    </button>
                  </div>

                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-accent-tertiary text-white border border-accent-tertiary/30 text-xs font-black">
                    Past 7 Days
                  </span>
                </div>
              </div>

              {/* Dynamic ApexBar Chart */}
              {weeklyData.length > 0 ? (
                (() => {
                  const chartSeriesData = weeklyData.map((d: any) =>
                    velocityMetric === "hours" ? Number(d.hours || 0) : Number(d.tasksCount || 0),
                  );
                  const maxVal = Math.max(...chartSeriesData, 0);
                  const computedYMax =
                    velocityMetric === "hours"
                      ? maxVal > 0
                        ? maxVal <= 2
                          ? maxVal + 0.8
                          : Math.ceil(maxVal * 1.25)
                        : 8
                      : maxVal > 0
                        ? maxVal + 1
                        : 5;

                  return (
                    <div className="pt-2">
                      <ReactApexChart
                        type="bar"
                        height={230}
                        series={[
                          {
                            name: velocityMetric === "hours" ? "Study Hours" : "Tasks Completed",
                            data: chartSeriesData,
                          },
                        ]}
                        options={{
                          chart: {
                            type: "bar",
                            toolbar: { show: false },
                            fontFamily: "inherit",
                            background: "transparent",
                            animations: { enabled: true, speed: 300 },
                          },
                          plotOptions: {
                            bar: {
                              borderRadius: 8,
                              borderRadiusApplication: "end",
                              columnWidth: "36%",
                              distributed: false,
                              dataLabels: {
                                position: "top",
                              },
                            },
                          },
                          colors: [velocityMetric === "hours" ? "var(--primary-accent, var(--accent))" : "var(--accent-secondary)"],
                          dataLabels: {
                            enabled: true,
                            formatter: (val: number) =>
                              velocityMetric === "hours" ? (val > 0 ? `${val}h` : "") : val > 0 ? `${val}` : "",
                            style: {
                              fontSize: "11px",
                              fontWeight: "800",
                              colors: [velocityMetric === "hours" ? "var(--primary-accent, var(--accent))" : "var(--accent-secondary)"],
                            },
                            offsetY: -22,
                          },
                          xaxis: {
                            categories: weeklyData.map((d: any) => d.day),
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                            labels: {
                              style: {
                                colors: "#64748b",
                                fontSize: "12px",
                                fontWeight: "700",
                              },
                            },
                          },
                          yaxis: {
                            min: 0,
                            max: computedYMax,
                            forceNiceScale: false,
                            decimalsInFloat: velocityMetric === "hours" ? 1 : 0,
                            labels: {
                              style: {
                                colors: "#64748b",
                                fontSize: "11px",
                                fontWeight: "600",
                              },
                              formatter: (val: number) =>
                                velocityMetric === "hours"
                                  ? `${val >= 0 ? Number(val.toFixed(1)) : 0}h`
                                  : `${Math.max(0, Math.floor(val))}`,
                            },
                          },
                          grid: {
                            borderColor: "#f1f5f9",
                            strokeDashArray: 4,
                          },
                          tooltip: {
                            theme: "dark",
                            y: {
                              formatter: (val: number) =>
                                velocityMetric === "hours" ? `${val} hours logged` : `${val} tasks completed`,
                            },
                          },
                        }}
                      />
                    </div>
                  );
                })()
              ) : (
                <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500">No weekly study velocity logged in DB yet.</p>
                </div>
              )}
            </div>

            {/* Subject vs Habit Distribution Card */}
            <div className={`p-5 sm:p-6 rounded-3xl border ${cardBg} shadow-sm flex flex-col justify-between`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                    <PieChart size={18} className="text-accent-primary" /> Distribution
                  </h4>

                  {/* Distribution Switcher: Subjects vs Habits */}
                  <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDistributionMode("subject")}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        distributionMode === "subject"
                          ? "bg-accent-primary text-white shadow-2xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Subjects
                    </button>

                    <button
                      type="button"
                      onClick={() => setDistributionMode("habit")}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        distributionMode === "habit"
                          ? "bg-accent-secondary text-white shadow-2xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Habits
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {(distributionMode === "subject"
                    ? weeklyDoc?.subjectDistribution || []
                    : weeklyDoc?.habitDistribution || []
                  ).length > 0 ? (
                    (distributionMode === "subject"
                      ? weeklyDoc?.subjectDistribution || []
                      : weeklyDoc?.habitDistribution || []
                    ).map((item: any) => {
                      const barColorClass = distributionMode === "subject" ? "bg-accent-primary" : "bg-accent-secondary";
                      return (
                        <div key={item.subject} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className={`font-bold ${textTitle} truncate pr-2`}>{item.subject}</span>
                            <span className="font-black shrink-0">
                              {item.hours} ({item.pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full ${barColorClass}`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 font-bold italic">
                      No distribution data recorded for this week.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Live Sync Banner matching design reference */}
          <div className="p-4 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center gap-3 text-accent-primary text-xs font-bold shadow-2xs">
            <Sparkles size={18} className="text-accent-primary shrink-0 animate-pulse" />
            <span>
              Automatic analytics calculations update live after every study block logged in the Focus Timer or Agenda!
            </span>
          </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: CONSISTENCY ENGINE V3 (SEPARATE ENGINE & API) */}
      {activeTab === "consistency" && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Loading State */}
          {loading && !data && (
            <div className={`p-16 sm:p-20 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
              <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
              <p className={`text-sm font-bold ${textMuted}`}>Loading Analytics Dashboard...</p>
              <p className={`text-[10px] ${textMuted}`}>Fetching consistency snapshots from database</p>
            </div>
          )}

          {(!loading || data) && (
            <>
              {/* TOGGLE BAR (TIME RANGE & SCOPE) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                {/* LEFT TOGGLE: TIME RANGE */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTimeRange("month")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                        timeRange === "month"
                          ? "bg-accent-gradient shadow-neon-glow"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      This Month
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeRange("alltime")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                        timeRange === "alltime"
                          ? "bg-accent-gradient shadow-neon-glow"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      All-Time
                    </button>
                  </div>

                  {/* MONTH PICKER */}
                  {timeRange === "month" && (
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

                {/* RIGHT TOGGLE: SCOPE TABS & FILTER DROPDOWN */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center p-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setScope("overall");
                        setDrilledHabitId(null);
                        setDrilledCategory(null);
                        setDrilledSubject(null);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        scope === "overall"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Overall Score
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScope("habit");
                        setDrilledCategory(null);
                        setDrilledSubject(null);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        scope === "habit"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Habit-wise
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScope("category");
                        setDrilledHabitId(null);
                        setDrilledSubject(null);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        scope === "category"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Category
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScope("subject");
                        setDrilledHabitId(null);
                        setDrilledCategory(null);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                        scope === "subject"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Subject
                    </button>
                  </div>

                  {scope === "habit" && (
                    <CustomAnalyticsDropdown
                      placeholderIcon="🎯"
                      placeholderText="All Habits"
                      allCount={data?.habits?.length || 0}
                      selectedId={drilledHabitId}
                      onSelect={setDrilledHabitId}
                      options={(data?.habits || []).map((h) => ({
                        id: h.habitId,
                        label: h.title,
                        icon: h.icon || (h.type === "habit" ? "🏃" : "📚"),
                        score: h.score,
                      }))}
                    />
                  )}

                  {scope === "category" && (
                    <CustomAnalyticsDropdown
                      placeholderIcon="📂"
                      placeholderText="All Categories"
                      allCount={data?.categories?.length || 0}
                      selectedId={drilledCategory}
                      onSelect={setDrilledCategory}
                      options={(data?.categories || []).map((c) => {
                        const catName = c.category || c.subject || "General";
                        return {
                          id: catName,
                          label: catName,
                          icon: "📁",
                          score: c.score,
                        };
                      })}
                    />
                  )}

                  {scope === "subject" && (
                    <CustomAnalyticsDropdown
                      placeholderIcon="📚"
                      placeholderText="All Subjects"
                      allCount={data?.subjects?.length || 0}
                      selectedId={drilledSubject}
                      onSelect={setDrilledSubject}
                      options={(data?.subjects || []).map((s) => ({
                        id: s.subject,
                        label: s.subject,
                        icon: "📖",
                        score: s.score,
                      }))}
                    />
                  )}
                </div>
              </div>

              {/* RADIAL SCORE GAUGE BANNER */}
              <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg} shadow-sm relative overflow-hidden`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5 sm:gap-6">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="7"
                          className="text-slate-100 dark:text-slate-800"
                          fill="transparent"
                        />
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
                            <stop offset="0%" stopColor="var(--accent-start, var(--accent))" />
                            <stop offset="100%" stopColor="var(--accent-end, var(--accent))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        {loading ? (
                          <Loader2 size={24} className="animate-spin text-accent-primary" />
                        ) : (
                          <>
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                              {activeScore}%
                            </span>
                            <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">
                              Score
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-1.5">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${gradeInfo.color} inline-flex items-center gap-1`}
                        >
                          <Sparkles size={11} /> {gradeInfo.label}
                        </span>
                      </div>
                      <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${textTitle}`}>{activeTitle}</h3>
                      <p className={`text-xs ${textMuted} font-medium max-w-md`}>{activeSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TREND AREA CHART BANNER */}
              <div className={`p-6 rounded-3xl border ${cardBg} space-y-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                      <TrendingUp size={18} className="text-accent-primary" />
                      {timeRange === "month" ? "Daily Progression Trend" : "Monthly Progression Trend"}
                    </h3>
                    <p className={`text-xs ${textMuted}`}>
                      {timeRange === "month"
                        ? "Daily snapshots recorded this month"
                        : "Aggregated monthly consistency snapshots"}
                    </p>
                  </div>
                </div>

                {data?.trend && data.trend.length > 0 ? (
                  <div className="w-full h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        <XAxis
                          dataKey="studyDayKey"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10, fontWeight: 700 }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            borderColor: "#1E293B",
                            borderRadius: "12px",
                            color: "#FFF",
                            fontSize: "12px",
                            fontWeight: "800",
                          }}
                        />
                        {(() => {
                          const trendDataKey =
                            scope === "habit" && !drilledHabitId
                              ? "habitScore"
                              : (scope === "category" || scope === "subject") && !drilledCategory && !drilledSubject
                                ? "revisionScore"
                                : "overallScore";
                          return (
                            <Area
                              type="monotone"
                              dataKey={trendDataKey}
                              stroke="var(--accent)"
                              strokeWidth={3.5}
                              fillOpacity={1}
                              fill="url(#areaGrad)"
                            />
                          );
                        })()}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500">No trend snapshots available for this timeframe.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
