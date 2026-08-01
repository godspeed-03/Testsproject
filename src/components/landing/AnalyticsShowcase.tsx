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
  Layers
} from 'lucide-react';

export default function AnalyticsShowcase() {
  const [velocityMetric, setVelocityMetric] = useState<'hours' | 'tasks'>('hours');
  const [distMode, setDistMode] = useState<'subject' | 'habit'>('subject');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const habitDistribution = [
    { subject: 'Gym', detail: '2 times (29%)', pct: 29, color: 'bg-amber-500' },
    { subject: 'Water', detail: '3.8 ltrs (14%)', pct: 14, color: 'bg-rose-500' }
  ];

  const subjectDistribution = [
    { subject: 'Differential Calculas', detail: '1.0 hrs (100%)', pct: 100, color: 'bg-indigo-600' }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
            <BarChart3 size={14} className="text-indigo-600" />
            Feature 04 — Performance & Analytics Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Visual Consistency & Study Analytics
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
            Real-time executive dashboard calculating your 7-day study velocity, consistency percentage, subject/habit distribution breakdown, and weekly target completion.
          </p>
        </div>

        {/* Outer Application Mock Container */}
        <div className="bg-slate-50/50 border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-black text-xl text-slate-900">Habit & Task Module</h3>
              <p className="text-xs text-slate-500 font-medium">
                Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
              </p>
            </div>
            <button
              type="button"
              className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              + New Habit or Task
            </button>
          </div>

          {/* Grid Layout: Left Nav + Right Analytics Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left Sidebar Navigation */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} /> Today Agenda
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">3</span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <Flame size={14} className="text-amber-500" /> Habits & Streaks
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">11</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Calendar size={14} /> Month Calendar
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20">
                  <span className="flex items-center gap-2">
                    <BarChart3 size={14} /> Analytics & Scores
                  </span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Checklists
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">0</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Clock size={14} /> Focus Timer
                </div>
              </div>

              {/* Daily Target Widget */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-black uppercase">
                  <span>📈 DAILY TARGET</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Today's Completion</span>
                  <span className="font-black text-emerald-600">2 / 3 Done</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-2/3 rounded-full" />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 pt-1">
                  <span>Hours Read Today</span>
                  <span className="font-black text-slate-900">1 hr</span>
                </div>
              </div>
            </div>

            {/* Right Main Analytics Workspace */}
            <div className="md:col-span-3 space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">Performance & Analytics</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Track real study hours, daily velocity, subject distribution, and habit execution metrics.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <BarChart3 size={14} /> Weekly Velocity
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 rounded-lg text-xs font-black text-slate-400 opacity-60 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Activity size={14} /> Consistency Engine v3
                    </button>
                  </div>

                  <button
                    type="button"
                    className="bg-indigo-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <RotateCcw size={14} />
                    <span>Recalculate DB</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <div className="flex items-center justify-between text-indigo-600">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">WEEKLY TOTAL</span>
                    <Clock size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">1 <span className="text-sm font-bold text-slate-500">hrs</span></p>
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="text-xs">📈</span> Live DB Logged
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between text-amber-600">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">DAILY AVG</span>
                    <Zap size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">0.1 <span className="text-sm font-bold text-slate-500">hrs/day</span></p>
                  <p className="text-[11px] font-bold text-amber-700">Target: 8.0 hrs/day</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">CONSISTENCY</span>
                    <Award size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">8.3%</p>
                  <p className="text-[11px] font-bold text-emerald-600">2+ Day Habit Velocity 🔥</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <div className="flex items-center justify-between text-purple-600">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">TASKS & HABITS</span>
                    <CheckCircle size={16} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">3 <span className="text-sm font-bold text-slate-500">done</span></p>
                  <p className="text-[11px] font-bold text-purple-700">7-Day Completion Logs</p>
                </div>
              </div>

              {/* Main Visual Velocity & Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 7-Day Velocity Chart Card */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-base sm:text-lg text-slate-900">7-Day Study Velocity Chart</h4>
                      <p className="text-xs text-slate-500 font-bold">
                        {velocityMetric === 'hours'
                          ? 'Daily Study Hours vs 8.0 hr Benchmark Target'
                          : 'Completed Tasks & Revisions per Day'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setVelocityMetric('hours')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            velocityMetric === 'hours' ? 'bg-white text-indigo-600 shadow-2xs font-black' : 'text-slate-500'
                          }`}
                        >
                          Hours (hrs)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVelocityMetric('tasks')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            velocityMetric === 'tasks' ? 'bg-white text-emerald-600 shadow-2xs font-black' : 'text-slate-500'
                          }`}
                        >
                          Tasks (count)
                        </button>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-black">
                        Past 7 Days
                      </span>
                    </div>
                  </div>

                  {/* Light Theme Clean Bar Visualization */}
                  <div className="pt-2 space-y-2">
                    <div className="h-44 flex items-end justify-between gap-2 px-4 pb-2 border-b border-slate-100 relative">
                      {/* Grid background ticks */}
                      <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 flex justify-between px-2 text-[10px] text-slate-300">
                        <span>1.8h</span>
                      </div>
                      <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100 flex justify-between px-2 text-[10px] text-slate-300">
                        <span>1.4h</span>
                      </div>
                      <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100 flex justify-between px-2 text-[10px] text-slate-300">
                        <span>0.9h</span>
                      </div>
                      <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100 flex justify-between px-2 text-[10px] text-slate-300">
                        <span>0.5h</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 flex justify-between px-2 text-[10px] text-slate-400 font-bold">
                        <span>0h</span>
                      </div>

                      {days.map((day) => {
                        const isSun = day === 'Sun';
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                            {isSun && (
                              <span className="text-[11px] font-black text-indigo-600">1h</span>
                            )}
                            <div className="w-full max-w-[32px] h-full flex items-end justify-center">
                              {isSun ? (
                                <div className="w-full h-1/2 rounded-t-xl bg-indigo-500 shadow-md shadow-indigo-500/20" />
                              ) : (
                                <div className="w-full h-0 rounded-t-xl bg-slate-200" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-500">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Distribution Breakdown Card */}
                <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                        <PieChart size={18} className="text-indigo-600" /> Distribution
                      </h4>

                      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setDistMode('subject')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            distMode === 'subject' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Subjects
                        </button>
                        <button
                          type="button"
                          onClick={() => setDistMode('habit')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            distMode === 'habit' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Habits
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      {(distMode === 'subject' ? subjectDistribution : habitDistribution).map((item) => (
                        <div key={item.subject} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>{item.subject}</span>
                            <span className="font-black">{item.detail}</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Live Sync Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 text-indigo-800 text-xs font-bold shadow-2xs">
                <Sparkles size={18} className="text-indigo-600 shrink-0" />
                <span>Automatic analytics calculations update live after every study block logged in the Focus Timer or Agenda!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
