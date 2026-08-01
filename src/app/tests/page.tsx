'use client';

import React, { useState, useEffect } from 'react';
import AddTestModal from '@/components/dashboard/AddTestModal';
import { Loader2, Plus, Trash2, Award, FileText } from 'lucide-react';

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
      }
    } catch (e) {
      console.error('Failed to log test score', e);
    }
  };

  const handleDeleteTestLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test log?')) return;
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
      }
    } catch (e) {
      console.error('Failed to delete test log', e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
              Tests & Error Analysis
            </h1>
            <p className={`text-[10px] sm:text-xs ${textMuted} mt-0.5 sm:mt-1`}>
              Track mock test scores, accuracy %, and mistake breakdowns across Prelims and Mains.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all shrink-0 active:scale-95 self-start sm:self-auto"
          >
            <Plus size={16} /> Log Test Score
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className={`p-16 sm:p-20 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
            <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
            <p className={`text-sm font-bold ${textMuted}`}>Loading Test Logs...</p>
            <p className={`text-[10px] ${textMuted}`}>Fetching test results from database</p>
          </div>
        ) : testLogs.length === 0 ? (
          <div className={`p-10 sm:p-16 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto border border-purple-500/20">
              <Award size={28} />
            </div>
            <h4 className={`font-black text-base sm:text-lg ${textTitle}`}>No Test Results Logged Yet</h4>
            <p className={`text-xs ${textMuted} max-w-md mx-auto`}>
              Track mock test scores, accuracy percentages, and mistake breakdowns (Concept / Silly / Time). Click below to log your first test.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus size={15} /> Log Your First Test
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {testLogs.map((t) => {
              const id = t.id || t._id;
              const hasBreakdown = t.concept !== undefined;

              return (
                <div key={id} className={`p-4 sm:p-5 rounded-2xl border ${cardBg} shadow-xs`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Test Info */}
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-black text-sm sm:text-base ${textTitle} truncate max-w-[200px] sm:max-w-none`}>
                            {t.code || t.testName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 text-[9px] sm:text-[10px] font-black shrink-0">
                            {t.subject || t.category || t.type || 'General'}
                          </span>
                          {t.date && (
                            <span className={`text-[9px] sm:text-[10px] font-bold ${textMuted} shrink-0`}>{t.date}</span>
                          )}
                        </div>

                        {/* Metric Badges — wrap on mobile */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] sm:text-[10px] font-black">
                            Score: {t.score}{t.maxScore ? ` / ${t.maxScore}` : ''}
                          </span>
                          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] sm:text-[10px] font-black">
                            Accuracy: {t.accuracy || t.percent}%
                          </span>
                          {hasBreakdown && (
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] sm:text-[10px] font-black">
                              C:{t.concept}% S:{t.silly}% T:{t.timeP}%
                            </span>
                          )}
                        </div>

                        {/* Takeaway */}
                        {(t.takeaway || (t.weakAreas && t.weakAreas.length > 0)) && (
                          <p className={`text-[9px] sm:text-[10px] ${textMuted} font-bold truncate max-w-xs sm:max-w-lg`}>
                            💡 {t.takeaway || t.weakAreas?.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Delete */}
                    <button
                      type="button"
                      disabled={deletingId === id}
                      onClick={() => handleDeleteTestLog(id)}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 self-end sm:self-center shrink-0"
                      title="Delete test log"
                    >
                      {deletingId === id ? <Loader2 size={14} className="animate-spin text-rose-500" /> : <Trash2 size={14} />}
                    </button>
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
