'use client';

import React, { useState, useEffect } from 'react';
import AddTestModal from '@/components/dashboard/AddTestModal';
import { Loader2, Plus, Trash2, Award, CheckCircle2, XCircle, MinusCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { confirmDeleteWithSonner } from '@/app/tracker/TrackerContext';

export default function TestsPage() {
  const [testLogs, setTestLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  useEffect(() => {
    fetchTestLogs();
  }, []);

  const fetchTestLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs || []);
      }
    } catch (e) {
      console.error('Failed to load test logs', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async (testData: any) => {
    try {
      const res = await fetch('/api/tracker/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...testData })
      });
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs || []);
        setShowAddModal(false);
        toast.success('Test score logged successfully!');
      } else {
        toast.error('Failed to log test score');
      }
    } catch (e) {
      console.error('Failed to log test score', e);
      toast.error('Failed to log test score');
    }
  };

  const handleDeleteTestLog = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/tracker/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs || []);
        toast.success('Test log deleted');
      } else {
        toast.error('Failed to delete test log');
      }
    } catch (e) {
      console.error('Failed to delete test log', e);
      toast.error('Failed to delete test log');
    } finally {
      setDeletingId(null);
    }
  };

  const CATEGORY_BADGE: Record<string, string> = {
    GS1: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30',
    GS2: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30',
    GS3: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30',
    GS4: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30',
    CSAT: 'bg-accent-primary/15 text-accent-primary border border-accent-primary/40 font-black',
    Maths: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${textTitle}`}>
              Tests & Error Analytics
            </h1>
            <p className={`text-xs sm:text-sm ${textMuted} mt-1 font-medium`}>
              Track mock test scores, accuracy percentages, and mistake breakdowns across Prelims and Mains.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={18} /> Log Test Score
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className={`p-16 sm:p-20 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
            <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
            <p className={`text-sm font-bold ${textMuted}`}>Loading Test Logs...</p>
            <p className={`text-xs ${textMuted}`}>Fetching test results from database</p>
          </div>
        ) : testLogs.length === 0 ? (
          <div className={`p-10 sm:p-16 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto border border-purple-500/20">
              <Award size={28} />
            </div>
            <h4 className={`font-black text-base sm:text-lg ${textTitle}`}>No Test Results Logged Yet</h4>
            <p className={`text-xs sm:text-sm ${textMuted} max-w-md mx-auto`}>
              Track mock test scores, accuracy percentages, and mistake breakdowns. Click below to log your first test.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4.5 py-2.5 rounded-xl bg-accent-gradient hover:opacity-90 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Log Your First Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testLogs.map((test) => {
              const id = test.id || test._id;
              const name = test.code || test.testName || test.title || 'Mock Test';
              const marksObtained = Number(test.score || test.marksObtained || 0);
              const totalMarks = Number(test.maxScore || test.totalMarks || 200);
              
              // Accuracy %
              const accuracy = typeof test.accuracy === 'number' && !isNaN(test.accuracy)
                ? Number(test.accuracy.toFixed(1))
                : test.percent !== undefined && test.percent !== null
                ? Number(Number(test.percent).toFixed(1))
                : Math.min(100, Math.max(0, Number(((marksObtained / Math.max(1, totalMarks)) * 100).toFixed(1))));

              const scorePct = Math.min(100, Math.max(0, Math.round((marksObtained / Math.max(1, totalMarks)) * 100)));

              // Fallback calculations for breakdown counts ensuring NO NaNs
              const correct = typeof test.correctCount === 'number' && !isNaN(test.correctCount)
                ? test.correctCount
                : typeof test.correct === 'number' && !isNaN(test.correct)
                ? test.correct
                : Math.round((scorePct / 100) * 60);

              const wrong = typeof test.incorrectCount === 'number' && !isNaN(test.incorrectCount)
                ? test.incorrectCount
                : typeof test.incorrect === 'number' && !isNaN(test.incorrect)
                ? test.incorrect
                : typeof test.wrong === 'number' && !isNaN(test.wrong)
                ? test.wrong
                : Math.round(((100 - scorePct) / 100) * 20);

              const skipped = typeof test.unattemptedCount === 'number' && !isNaN(test.unattemptedCount)
                ? test.unattemptedCount
                : typeof test.unattempted === 'number' && !isNaN(test.unattempted)
                ? test.unattempted
                : typeof test.skip === 'number' && !isNaN(test.skip)
                ? test.skip
                : Math.max(0, 100 - correct - wrong);

              const negMarks = typeof test.negMarks === 'number' && !isNaN(test.negMarks)
                ? test.negMarks
                : Number((wrong * 0.66).toFixed(2));

              const category = test.category || test.subject || 'GS1';
              const dateStr = test.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-slate-700 transition-all duration-300`}
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black border ${CATEGORY_BADGE[category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">{dateStr}</span>
                        <button
                          type="button"
                          disabled={deletingId === id}
                          onClick={() => confirmDeleteWithSonner(`Delete test log for "${name}"?`, () => handleDeleteTestLog(id))}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete Test Log"
                        >
                          {deletingId === id ? <Loader2 size={13} className="animate-spin text-rose-500" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>

                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-snug">
                      {name}
                    </h3>
                  </div>

                  {/* Score & Accuracy Banner (Theme Adaptive) */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                        NET SCORE
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{marksObtained}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ {totalMarks}</span>
                      </div>
                    </div>

                    {/* Circular Accuracy Ring */}
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
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
                          strokeDasharray={`${accuracy}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-[11px] font-black block leading-tight text-slate-900 dark:text-slate-100">{accuracy}%</span>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold block uppercase">ACC</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Target Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>Performance Target</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{scorePct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500"
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 text-center space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold">
                        <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" /> Correct
                      </div>
                      <span className="font-black text-base block">{correct}</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800 text-center space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold">
                        <XCircle size={12} className="text-rose-600 dark:text-rose-400" /> Wrong
                      </div>
                      <span className="font-black text-base block">{wrong}</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold">
                        <MinusCircle size={12} className="text-slate-500 dark:text-slate-400" /> Skipped
                      </div>
                      <span className="font-black text-base block">{skipped}</span>
                    </div>
                  </div>

                  {/* Penalty Alert Box */}
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                    <span className="flex items-center gap-1.5 font-extrabold">
                      <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" /> Penalty Deducted
                    </span>
                    <span className="font-black text-xs sm:text-sm">-{negMarks} marks</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddTestModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddTest={handleAddTest}
          isLight={false}
          cardBg="bg-white dark:bg-slate-900"
          inputBg="bg-slate-100 dark:bg-slate-950"
          textTitle="text-slate-900 dark:text-slate-100"
          textMuted="text-slate-500 dark:text-slate-400"
        />
      )}
    </div>
  );
}
