'use client';

import React from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Plus,
  BookOpen,
  ChevronDown,
  CheckSquare,
  Flame,
  Calendar,
  BarChart2,
  Layers
} from 'lucide-react';

export default function FocusTimerShowcase() {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-700 text-xs font-black uppercase tracking-wider border border-purple-500/20">
            <Clock size={14} className="text-purple-600" />
            Feature 06 — Persistent Study Focus Timer
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Study Focus Timer & Session Tracker
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
            Persistent stopwatch that continues tracking your study session across page navigations. Auto-sync focus time to your daily target goals.
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

          {/* Grid Layout: Left Nav + Right Focus Timer Workspace */}
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

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <BarChart2 size={14} /> Analytics & Scores
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Checklists
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">4</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20">
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

            {/* Right Main Focus Timer Workspace */}
            <div className="md:col-span-3 space-y-4">
              {/* Workspace Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-500 text-white">
                    <Clock size={16} />
                  </span>
                  Study Focus Timer
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Persistent stopwatch — tracks focus time for today's agenda tasks.
                </p>
              </div>

              {/* Main Timer Display Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
                {/* Active Study Task Dropdown Selector */}
                <div className="bg-indigo-50/40 rounded-2xl border border-indigo-100 p-4 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-indigo-600" /> ACTIVE STUDY TASK
                  </label>

                  <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 shadow-2xs cursor-pointer">
                    <span className="flex items-center gap-2 truncate">
                      <span>🏃</span> Differential Calculas: ghsghdgsd [1 hr / 3 hrs]
                    </span>
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  </div>
                </div>

                {/* Dial Watch Stopwatch */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Outer track */}
                      <circle cx="50" cy="50" r="42" strokeWidth="3" className="stroke-slate-100" fill="transparent" />
                      {/* Ticks */}
                      {Array.from({ length: 60 }).map((_, i) => {
                        const angle = (i / 60) * 360 - 90;
                        const rad = (angle * Math.PI) / 180;
                        const isMajor = i % 5 === 0;
                        const r1 = isMajor ? 36 : 38;
                        const r2 = 41;
                        return (
                          <line
                            key={i}
                            x1={50 + r1 * Math.cos(rad)}
                            y1={50 + r1 * Math.sin(rad)}
                            x2={50 + r2 * Math.cos(rad)}
                            y2={50 + r2 * Math.sin(rad)}
                            className={isMajor ? 'stroke-slate-300' : 'stroke-slate-200'}
                            strokeWidth={isMajor ? 1 : 0.5}
                          />
                        );
                      })}
                      {/* Active green/amber progress arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="url(#timerGaugeGrad)"
                        strokeWidth="4"
                        strokeDasharray="264"
                        strokeDashoffset="100"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                      <defs>
                        <linearGradient id="timerGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="70%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Timer Digital Display Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans tabular-nums">
                        00:00:00
                      </span>
                      <div className="mt-2.5 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-100/70 border border-indigo-200">
                          DIFFERENTIAL CALCULAS: ...
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
                          <span>⏸</span> Paused
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">LOGGED TODAY</p>
                    <p className="text-base font-black text-slate-900">1 hr</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">THIS SESSION</p>
                    <p className="text-base font-black text-purple-600">0 mins</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">DAILY GOAL</p>
                    <p className="text-base font-black text-amber-500">3 hrs</p>
                  </div>
                </div>

                {/* Daily Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Daily Progress</span>
                    <span className="font-black text-indigo-600">33%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-emerald-400 w-1/3 rounded-full" />
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
                  >
                    <Play size={16} fill="white" /> Start Focus
                  </button>

                  <button
                    type="button"
                    className="p-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 hover:text-slate-600 transition-colors"
                  >
                    <Flag size={16} />
                  </button>

                  <button
                    type="button"
                    className="px-5 py-3 rounded-2xl bg-emerald-100/70 hover:bg-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={16} /> Save Session
                  </button>

                  <button
                    type="button"
                    className="p-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 hover:text-slate-600 transition-colors"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
