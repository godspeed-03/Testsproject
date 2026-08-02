'use client';

import React, { useState } from 'react';
import {
  Flame,
  Calendar,
  CheckSquare,
  BarChart2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles
} from 'lucide-react';

const INITIAL_HABITS = [
  {
    id: 1,
    title: 'The Hindu editorial & current affairs notes',
    target: 'Target: 1 times',
    schedule: 'Weekly Schedule (MON, TUE, WED, THU, FRI, SAT, SUN)',
    streak: '4d',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    history: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, completed: [1, 2, 3, 4, 5, 8, 9, 10, 12, 15, 16, 17, 18, 20, 22, 23, 24, 25, 28, 29, 30, 31].includes(i + 1) }))
  },
  {
    id: 2,
    title: 'Water intake (3 Litres daily goal)',
    target: 'Target: 3 ltrs',
    schedule: 'Weekly Schedule (MON, TUE, WED, THU, FRI, SAT, SUN)',
    streak: '12d',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
    history: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, completed: i % 2 === 0 }))
  },
  {
    id: 3,
    title: 'Gym & Physical Fitness Session',
    target: 'Target: 1 times',
    schedule: 'Weekly Schedule (MON, TUE, WED, THU, FRI)',
    streak: '2d',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    history: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, completed: i % 3 === 0 }))
  }
];

export default function HabitShowcase() {
  const [activeTab, setActiveTab] = useState<'habits' | 'agenda' | 'calendar' | 'analytics' | 'checklists' | 'focus'>('habits');
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const toggleDayCell = (habitId: number, dayIdx: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newHist = [...h.history];
        newHist[dayIdx] = { ...newHist[dayIdx], completed: !newHist[dayIdx].completed };
        return { ...h, history: newHist };
      })
    );
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newH = {
      id: Date.now(),
      title: newTitle.trim(),
      target: 'Target: 1 times',
      schedule: 'Weekly Schedule (Daily)',
      streak: '0d',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      dotColor: 'bg-purple-500',
      history: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, completed: false }))
    };
    setHabits((prev) => [newH, ...prev]);
    setNewTitle('');
    setIsNewModalOpen(false);
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
            <Flame size={14} className="text-indigo-600 dark:text-indigo-400" />
            Feature 02 — Habits & Streaks Engine
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Habit Consistency & Streak Tracker
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Monitor consistency across custom weekly schedules with high-density visual heatmap calendars. Try clicking heatmap cells below!
          </p>
        </div>

        {/* Outer Application Mock Container */}
        <div className="bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">Habit & Task Module</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
            >
              + New Habit or Task
            </button>
          </div>

          {/* Grid Layout: Left Nav + Right Main View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left Sidebar Navigation */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('agenda')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'agenda' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} /> Today Agenda
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">3</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('habits')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'habits' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Flame size={14} className="text-amber-400" /> Habits & Streaks
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px] font-black">{habits.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'calendar' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Calendar size={14} /> Month Calendar
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'analytics' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart2 size={14} /> Analytics & Scores
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('checklists')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'checklists' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Checklists
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('focus')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'focus' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock size={14} /> Focus Timer
                </button>
              </div>

              {/* Daily Target Widget */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-black uppercase">
                  <span>📈 DAILY TARGET</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Today's Completion</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">2 / 3 Done</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-2/3 rounded-full" />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                  <span>Hours Read Today</span>
                  <span className="font-black text-slate-900 dark:text-white">1 hr</span>
                </div>
              </div>
            </div>

            {/* Right Workspace */}
            <div className="md:col-span-3 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Habits & Streaks</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Monitor consistency across your custom weekly and monthly schedules.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/20"
                >
                  <Plus size={14} /> New Habit
                </button>
              </div>

              {/* Habit Cards */}
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${habit.dotColor}`} />
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{habit.title}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black flex items-center gap-1">
                        <Flame size={13} className="text-amber-500 fill-amber-500" /> {habit.streak} streak
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-3">
                      <span>{habit.target}</span>
                      <span>•</span>
                      <span>{habit.schedule}</span>
                    </div>

                    {/* Interactive Heatmap Matrix */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-1.5">
                        <span>August 2026</span>
                        <span>Click any day square to toggle completion state</span>
                      </div>
                      <div className="grid grid-cols-16 sm:grid-cols-31 gap-1">
                        {habit.history.map((hCell, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDayCell(habit.id, idx)}
                            title={`Aug ${hCell.day}: ${hCell.completed ? 'Completed' : 'Missed'}`}
                            className={`w-full aspect-square rounded-md text-[9px] font-black flex items-center justify-center transition-all cursor-pointer ${
                              hCell.completed
                                ? 'bg-emerald-500 text-white shadow-xs scale-105'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {hCell.day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: + New Habit */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <form onSubmit={handleCreateHabit} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" /> + Add New Habit
                </h4>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 50 PYQ Questions Daily"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
