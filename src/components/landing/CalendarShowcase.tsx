'use client';

import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Flame,
  BarChart2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function CalendarShowcase() {
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
            <CalendarIcon size={14} className="text-indigo-600" />
            Feature 03 — Monthly Calendar Heatmap Matrix
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Monthly Habit Tracking & Matrix
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
            Switch between Calendar Heatmap and Smooth Line Trend Graphs to evaluate long-term study momentum.
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

          {/* Grid Layout: Left Nav + Right Month Calendar View */}
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

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20">
                  <span className="flex items-center gap-2">
                    <CalendarIcon size={14} /> Month Calendar
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <BarChart2 size={14} /> Analytics & Scores
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

            {/* Right Main Monthly Workspace */}
            <div className="md:col-span-3 space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Monthly Habit Tracking</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Switch between Calendar Heatmap and Smooth Line Trend Graphs.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <CalendarIcon size={14} /> Calendar View
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
                  >
                    <Activity size={14} /> Line Graph & 0/1 Matrix
                  </button>
                </div>
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20 shrink-0">
                  All Tasks & Habits Combined
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0">
                  🌐 Geography
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0">
                  📚 Economics
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0">
                  💼 Ancient History
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0">
                  📖 Read completed GS
                </span>
              </div>

              {/* Heatmap Matrix Workspace Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-base text-slate-900">All Tasks & Habits Combined</h4>
                    <p className="text-xs text-slate-400 font-bold">August 2026 Heatmap Matrix</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black">
                      % Month Avg: 1%
                    </span>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <ChevronLeft size={16} className="text-slate-400 cursor-pointer" />
                      <span>August 2026</span>
                      <ChevronRight size={16} className="text-slate-400 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Legend Bar */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-4 text-[11px] font-extrabold text-slate-500">
                  <span className="text-slate-400 uppercase tracking-wider font-black">LEGEND:</span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed Dot (Green)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Missed Dot (Red)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" /> Light Pastel Background Shading
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Off / Not Scheduled
                  </span>
                </div>

                {/* Heatmap Grid Title */}
                <div className="pt-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">
                    AUGUST 2026 HEATMAP MATRIX
                  </h5>

                  {/* 7-column Matrix Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {monthDays.map((d) => {
                      const isDay1 = d === 1;
                      return (
                        <div
                          key={d}
                          className={`p-3 rounded-2xl border transition-all flex flex-col justify-between h-20 ${
                            isDay1
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/30'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-black">
                            <span>{d}</span>
                            <span className={isDay1 ? 'text-emerald-700' : 'text-slate-400 text-[10px]'}>
                              {isDay1 ? '67%' : '0%'}
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-1 flex-wrap pt-1">
                            {isDay1 ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="w-2 h-2 rounded-full bg-purple-600" />
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="w-2 h-2 rounded-full bg-slate-200" />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
