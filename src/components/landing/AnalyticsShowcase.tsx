'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  Zap,
  Award,
  CheckCircle,
  PieChart,
  Sparkles,
  RotateCcw,
  Activity,
  CheckSquare,
  Flame,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsShowcase() {
  const [activeTab, setActiveTab] = useState<'velocity' | 'consistency'>('velocity');
  const [velocityMetric, setVelocityMetric] = useState<'hours' | 'tasks'>('hours');
  const [distMode, setDistMode] = useState<'subject' | 'habit'>('subject');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const habitDistribution = [
    { subject: 'Gym', detail: '2 times (29%)', pct: 29, color: 'bg-amber-500' },
    { subject: 'Water Intake', detail: '3.8 ltrs (14%)', pct: 14, color: 'bg-rose-500' }
  ];

  const subjectDistribution = [
    { subject: 'Differential Calculus', detail: '1.0 hrs (100%)', pct: 100, color: 'bg-indigo-600' },
    { subject: 'Indian Polity (M Laxmikanth)', detail: '2.5 hrs (65%)', pct: 65, color: 'bg-violet-600' },
    { subject: 'Modern History (Spectrum)', detail: '1.5 hrs (40%)', pct: 40, color: 'bg-emerald-600' }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
            <BarChart3 size={14} className="text-indigo-600 dark:text-indigo-400" />
            Feature 04 — Consistency Engine V4 & Weekly Analytics
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Consistency Engine V4 & Weekly Study Analytics
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Real-time executive dashboard featuring the 3-Tier Consistency Engine V4 (Daily, Monthly, All-Time composite scoring) and 7-day Weekly Velocity analytics.
          </p>
        </div>

        {/* Outer Application Mock Container */}
        <div className="bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">Performance & Consistency Suite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Track daily composite consistency scores, 7-day study velocity, and habit execution metrics in real-time.
              </p>
            </div>
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              + Recalculate Snapshots
            </button>
          </div>

          {/* Grid Layout: Left Nav + Right Analytics Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left Sidebar Navigation */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} /> Today Agenda
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300">3</span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <span className="flex items-center gap-2">
                    <Flame size={14} className="text-amber-500" /> Habits & Streaks
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300">11</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <Calendar size={14} /> Month Calendar
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20">
                  <span className="flex items-center gap-2">
                    <BarChart3 size={14} /> Consistency & Velocity
                  </span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Checklists
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300">0</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <Clock size={14} /> Focus Timer
                </div>
              </div>

              {/* Daily Target Widget */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-black uppercase">
                  <span>📈 DAILY TARGET</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Today's Completion</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">2 / 3 Done</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-2/3 rounded-full" />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                  <span>Hours Read Today</span>
                  <span className="font-black text-slate-900 dark:text-white">1.0 hr</span>
                </div>
              </div>
            </div>

            {/* Right Main Analytics Workspace */}
            <div className="md:col-span-3 space-y-4">
              {/* Header Bar with Active Tab Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {activeTab === 'velocity' ? 'Weekly Study Velocity Analytics' : 'Consistency Engine V4 Snapshot'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {activeTab === 'velocity'
                      ? '7-day velocity breakdown of actual study hours, target trends, and subject distribution.'
                      : '3-Tier Snapshot pipeline with composite score (Habits 40%, Tasks 30%, Revisions 30%).'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('velocity')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'velocity'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 size={14} /> Weekly Velocity
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('consistency')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'consistency'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Activity size={14} /> Consistency Engine V4
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">WEEKLY TOTAL</span>
                    <Clock size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">5.0 <span className="text-sm font-bold text-slate-500 dark:text-slate-400">hrs</span></p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="text-xs">📈</span> Live DB Logged
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 space-y-1">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">DAILY AVG</span>
                    <Zap size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">0.7 <span className="text-sm font-bold text-slate-500 dark:text-slate-400">hrs/day</span></p>
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Target: 8.0 hrs/day</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">CONSISTENCY</span>
                    <Award size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">88.5%</p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">S-Tier Active 🔥</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
                  <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">TASKS & HABITS</span>
                    <CheckCircle size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">14 <span className="text-sm font-bold text-slate-500 dark:text-slate-400">done</span></p>
                  <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300">7-Day Completion Logs</p>
                </div>
              </div>

              {/* Conditional View Switching: Velocity vs Consistency Engine */}
              {activeTab === 'velocity' ? (
                /* Weekly Velocity View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* 7-Day Velocity Chart Card */}
                  <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">7-Day Study Velocity Chart</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                          {velocityMetric === 'hours'
                            ? 'Daily Study Hours vs 8.0 hr Benchmark Target'
                            : 'Completed Tasks & Revisions per Day'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setVelocityMetric('hours')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              velocityMetric === 'hours' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Hours (hrs)
                          </button>
                          <button
                            type="button"
                            onClick={() => setVelocityMetric('tasks')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              velocityMetric === 'tasks' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Tasks (count)
                          </button>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black">
                          Past 7 Days
                        </span>
                      </div>
                    </div>

                    {/* Bar Visualization with Full Dark Mode Support */}
                    <div className="pt-2 space-y-2">
                      <div className="h-44 flex items-end justify-between gap-2 px-4 pb-2 border-b border-slate-100 dark:border-slate-700/80 relative">
                        {/* Grid background ticks */}
                        <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 dark:border-slate-700/50 flex justify-between px-2 text-[10px] text-slate-300 dark:text-slate-600">
                          <span>1.8h</span>
                        </div>
                        <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100 dark:border-slate-700/50 flex justify-between px-2 text-[10px] text-slate-300 dark:text-slate-600">
                          <span>1.4h</span>
                        </div>
                        <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100 dark:border-slate-700/50 flex justify-between px-2 text-[10px] text-slate-300 dark:text-slate-600">
                          <span>0.9h</span>
                        </div>
                        <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100 dark:border-slate-700/50 flex justify-between px-2 text-[10px] text-slate-300 dark:text-slate-600">
                          <span>0.5h</span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 dark:border-slate-700 flex justify-between px-2 text-[10px] text-slate-400 font-bold">
                          <span>0h</span>
                        </div>

                        {days.map((day) => {
                          const isSun = day === 'Sun';
                          return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                              {isSun && (
                                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">1.0h</span>
                              )}
                              <div className="w-full max-w-[32px] h-full flex items-end justify-center">
                                {isSun ? (
                                  <div className="w-full h-1/2 rounded-t-xl bg-indigo-500 shadow-md shadow-indigo-500/20" />
                                ) : (
                                  <div className="w-full h-0 rounded-t-xl bg-slate-200 dark:bg-slate-700" />
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Distribution Breakdown Card */}
                  <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <PieChart size={18} className="text-indigo-600 dark:text-indigo-400" /> Distribution
                        </h4>

                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setDistMode('subject')}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              distMode === 'subject' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Subjects
                          </button>
                          <button
                            type="button"
                            onClick={() => setDistMode('habit')}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              distMode === 'habit' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Habits
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-1">
                        {(distMode === 'subject' ? subjectDistribution : habitDistribution).map((item) => (
                          <div key={item.subject} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                              <span>{item.subject}</span>
                              <span className="font-black">{item.detail}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Consistency Engine V4 Tab View */
                <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                        <ShieldCheck size={14} /> S-Tier Consistency Rank (88.5% Composite Score)
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">3-Tier Snapshot Aggregation Architecture</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        Formula: Habits(40%) + Tasks(30%) + Revisions(30%)
                      </span>
                    </div>
                  </div>

                  {/* 3 Weight Category Gauges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Habit Consistency (40% Weight)</span>
                        <span className="text-emerald-600 dark:text-emerald-400">92%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[92%] rounded-full" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">11 Active Habits & Streaks evaluated daily</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Task Completion (30% Weight)</span>
                        <span className="text-indigo-600 dark:text-indigo-400">85%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[85%] rounded-full" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Daily study task goal completion ratio</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>SRS Revision Discipline (30% Weight)</span>
                        <span className="text-violet-600 dark:text-violet-400">88%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-violet-500 w-[88%] rounded-full" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Asymmetric penalty applied for overdue revisions</p>
                    </div>
                  </div>

                  {/* Engine Details Banner */}
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-slate-900 dark:text-white block mb-0.5">Automated 3-Tier Rolling Aggregation Pipeline:</strong>
                      Atomic DailySnapshots auto-roll into MonthlySnapshots, which continuously feed into the AllTimeSnapshot to track year-long UPSC preparation consistency.
                    </div>
                  </div>
                </div>
              )}

              {/* Full Width Live Sync Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-3 text-indigo-800 dark:text-indigo-200 text-xs font-bold shadow-2xs">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Automatic analytics calculations update live after every study block logged in the Focus Timer or Agenda!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
