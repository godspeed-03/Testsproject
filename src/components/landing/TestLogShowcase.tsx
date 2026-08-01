'use client';

import React from 'react';
import { Target, Trophy, AlertTriangle, ArrowRight, CheckCircle2, XCircle, MinusCircle, Percent, Sparkles } from 'lucide-react';

const DEMO_TESTS = [
  {
    id: 1,
    testName: 'GS Paper 1 Full Length Mock 04',
    category: 'GS1',
    date: 'Aug 1, 2026',
    score: 114.5,
    maxScore: 200,
    accuracy: 78.4,
    correct: 62,
    wrong: 17,
    skip: 21,
    negMarks: 11.33,
    status: 'Pass',
  },
  {
    id: 2,
    testName: 'Polity Special Sectional Test 02',
    category: 'GS2',
    date: 'Jul 28, 2026',
    score: 132.0,
    maxScore: 200,
    accuracy: 86.2,
    correct: 72,
    wrong: 11,
    skip: 17,
    negMarks: 7.33,
    status: 'Pass',
  },
  {
    id: 3,
    testName: 'CSAT Full Length Simulator 01',
    category: 'CSAT',
    date: 'Jul 25, 2026',
    score: 98.5,
    maxScore: 200,
    accuracy: 71.5,
    correct: 55,
    wrong: 22,
    skip: 23,
    negMarks: 14.66,
    status: 'Pass',
  },
];

export default function TestLogShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-700 text-xs font-black uppercase tracking-wider border border-purple-500/20">
            <Trophy size={14} className="text-purple-600" />
            Feature 08 — Mock Test Performance Analytics
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Granular Test Analytics & Error Audit
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
            Log prelims and mains mocks with automatic accuracy circular gauges, correct/wrong/skipped breakdowns, net score calculation, and negative marking penalty badges.
          </p>
        </div>

        {/* Mock Test Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {DEMO_TESTS.map((test) => {
            const scorePct = Math.min(100, Math.max(0, Math.round((test.score / test.maxScore) * 100)));

            return (
              <div
                key={test.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/40 space-y-5 flex flex-col justify-between hover:border-indigo-300 transition-all"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black border ${
                      test.category === 'GS1' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      test.category === 'GS2' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-cyan-50 text-cyan-700 border-cyan-200'
                    }`}>
                      {test.category}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{test.date}</span>
                  </div>
                  <h3 className="font-black text-base text-slate-900 leading-snug">{test.testName}</h3>
                </div>

                {/* Main Gauge & Score Block (Theme Adaptive) */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs">
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Net Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{test.score}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ {test.maxScore}</span>
                    </div>
                  </div>

                  {/* Circular Accuracy Gauge */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500 dark:text-emerald-400"
                        strokeDasharray={`${test.accuracy}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[11px] font-black block leading-tight text-slate-900 dark:text-slate-100">{test.accuracy}%</span>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Acc</span>
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Performance Target</span>
                    <span className="font-black text-slate-900">{scorePct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${scorePct}%` }} />
                  </div>
                </div>

                {/* Granular Breakdown Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                      <CheckCircle2 size={11} className="text-emerald-600" /> Correct
                    </div>
                    <span className="font-black text-sm block">{test.correct}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                      <XCircle size={11} className="text-rose-600" /> Wrong
                    </div>
                    <span className="font-black text-sm block">{test.wrong}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                      <MinusCircle size={11} className="text-slate-500" /> Skipped
                    </div>
                    <span className="font-black text-sm block">{test.skip}</span>
                  </div>
                </div>

                {/* Negative Penalty Badge */}
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs font-bold text-rose-800">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-rose-600" /> Penalty Deducted
                  </span>
                  <span className="font-black">-{test.negMarks} marks</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Callout */}
        <div className="mt-8 p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3 text-xs sm:text-sm font-bold text-purple-950">
          <Sparkles size={16} className="text-purple-600 shrink-0" />
          <span>Automatic NaN protection & math fallbacks ensure your accuracy % and penalty statistics calculate reliably across every logged mock!</span>
        </div>
      </div>
    </section>
  );
}
