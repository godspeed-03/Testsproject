'use client';

import React from 'react';
import {
  ListTodo,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Flame,
  BarChart2,
  Clock,
  Layers,
  PlusCircle
} from 'lucide-react';

const DEMO_CHECKLISTS = [
  {
    id: 1,
    title: '📋 UPSC Prelims Exam Day Essential Kit',
    completedCount: 0,
    totalCount: 6,
    items: [
      { id: 1, text: 'Printed e-Admit Card (Clear Black & White or Color)', checked: false },
      { id: 2, text: 'Original Photo ID Card (Aadhaar / Voter ID / Passport as per Admit Card)', checked: false },
      { id: 3, text: '2 Black Ballpoint Pens (0.7mm thick point for fast OMR bubbling)', checked: false },
      { id: 4, text: '2 Passport Size Photographs (matching Admit Card photo)', checked: false, highlighted: true },
      { id: 5, text: 'Transparent Water Bottle (1 Litre without labels)', checked: false }
    ]
  },
  {
    id: 2,
    title: '⚖️ Polity Laxmikanth High-Yield Chapter Checklist',
    completedCount: 0,
    totalCount: 7,
    items: [
      { id: 1, text: 'Preamble & Salient Features of the Indian Constitution', checked: false },
      { id: 2, text: 'Fundamental Rights (Articles 12-35) & Writs Jurisdiction', checked: false },
      { id: 3, text: 'Directive Principles of State Policy (DPSP) & Fundamental Duties', checked: false },
      { id: 4, text: 'President, Vice President & Governor Powers & Discretion', checked: false },
      { id: 5, text: 'Parliamentary Committees & Legislative Procedure', checked: false }
    ]
  },
  {
    id: 3,
    title: '✍️ Mains GS Answer Writing Micro Checklist',
    completedCount: 0,
    totalCount: 6,
    items: [
      { id: 1, text: 'Identify Directive Words (Critically Analyze, Discuss, Evaluate, Examine)', checked: false },
      { id: 2, text: 'Crisp 20-30 Word Introduction with Recent Context / Data / Definition', checked: false },
      { id: 3, text: 'Sub-headings directly derived from question demand keywords', checked: false },
      { id: 4, text: 'Diagrams / Flowcharts / India Map included for visual density', checked: false }
    ]
  },
  {
    id: 4,
    title: '📐 CSAT Quantitative Aptitude & Reasoning Shortcuts',
    completedCount: 0,
    totalCount: 5,
    items: [
      { id: 1, text: 'Number System: Remainder Theorem & Unit Digit Rules', checked: false },
      { id: 2, text: 'Permutation & Combination: Selection (nCr) vs Arrangement (nPr)', checked: false },
      { id: 3, text: 'Percentage & Profit/Loss Fractional Conversions (1/7 = 14.28%, etc.)', checked: false },
      { id: 4, text: 'Speed, Time & Distance: Relative Speed & Trains Crossing Formula', checked: false }
    ]
  }
];

export default function ChecklistShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
            <ListTodo size={14} className="text-indigo-600 dark:text-indigo-400" />
            Feature 05 — Checklists & Task Notebooks
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Customizable Checklists & Notebooks
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Create structured checklists for revision topics, exam packing, answer writing toolkits, and formula shortcuts.
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
              className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              + New Habit or Task
            </button>
          </div>

          {/* Grid Layout: Left Nav + Right Checklists Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left Sidebar Navigation */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} /> Today Agenda
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300">3</span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <span className="flex items-center gap-2">
                    <Flame size={14} className="text-amber-500" /> Habits & Streaks
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300">11</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <Calendar size={14} /> Month Calendar
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <BarChart2 size={14} /> Analytics & Scores
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20">
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Checklists
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-[10px] font-black">4</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
                  <span className="font-black text-slate-900 dark:text-white">1 hr</span>
                </div>
              </div>
            </div>

            {/* Right Main Checklists Workspace */}
            <div className="md:col-span-3 space-y-4">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Checklists & Task Notebooks</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Create customizable lists, study topics, and exam packing checklists.
                  </p>
                </div>

                <button
                  type="button"
                  className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-center cursor-pointer"
                >
                  <Plus size={16} /> New Checklist
                </button>
              </div>

              {/* 2x2 Checklist Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {DEMO_CHECKLISTS.map((list) => (
                  <div
                    key={list.id}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-base text-slate-900 dark:text-white">{list.title}</h4>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">
                            {list.completedCount} of {list.totalCount} items completed
                          </p>
                        </div>
                        <Trash2 size={16} className="text-slate-300 hover:text-rose-600 cursor-pointer" />
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {list.items.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                              item.highlighted
                                ? 'bg-purple-50/50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 ring-1 ring-purple-300 dark:ring-purple-800'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700/80'
                            }`}
                          >
                            <Square size={16} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Item Input Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                      <input
                        type="text"
                        readOnly
                        placeholder="Add new item..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        className="p-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
