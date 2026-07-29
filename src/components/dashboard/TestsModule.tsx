'use client';

import { Plus, Trash2, Award } from 'lucide-react';

interface TestsModuleProps {
  testLogs: any[];
  onOpenAddTestModal: () => void;
  onDeleteTestLog: (id: string) => Promise<void>;
  isLight: boolean;
  cardBg: string;
  tableHeaderBg: string;
  textTitle: string;
  textMuted: string;
}

export default function TestsModule({
  testLogs,
  onOpenAddTestModal,
  onDeleteTestLog,
  isLight,
  cardBg,
  tableHeaderBg,
  textTitle,
  textMuted,
}: TestsModuleProps) {
  return (
    <div className={`${cardBg} rounded-xl p-4 sm:p-6 animate-fade-in border border-slate-300 dark:border-slate-800 space-y-6`}>
      <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div>
          <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle} flex items-center gap-2`}>
            <Award size={22} className="text-purple-500" /> Test Series Results & Error Analysis
          </h3>
          <p className={`text-xs sm:text-sm ${textMuted}`}>
            Track mock scores, accuracy, and mistake breakdown (Concept / Silly / Time).
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddTestModal}
          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={16} /> Log New Test Score
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-300 dark:border-slate-800 rounded-xl shadow-inner">
        <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[700px]">
          <thead>
            <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800`}>
              <th className="p-3.5 font-extrabold">Test Code / Name</th>
              <th className="p-3.5 font-extrabold">Date</th>
              <th className="p-3.5 font-extrabold">Subject / Stage</th>
              <th className="p-3.5 font-extrabold">Score</th>
              <th className="p-3.5 font-extrabold">Accuracy</th>
              <th className="p-3.5 font-extrabold">Mistake Split (Concept / Silly / Time)</th>
              <th className="p-3.5 font-extrabold">Key Takeaway / Weak Areas</th>
              <th className="p-3.5 font-extrabold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
            {testLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8">
                  <div className="text-center space-y-3 p-6">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto border border-purple-500/20">
                      <Award size={24} />
                    </div>
                    <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>No Test Series Results Logged Yet</h4>
                    <p className={`text-xs sm:text-sm ${textMuted} max-w-md mx-auto`}>Track mock test scores, accuracy %, and mistake breakdowns. Click below to add your first test log.</p>
                    <button
                      type="button"
                      onClick={onOpenAddTestModal}
                      className="mt-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus size={15} /> Log New Test Score
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              testLogs.map((t) => (
                <tr key={t.id || t._id} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors font-bold">
                  <td className={`p-3.5 font-extrabold ${textTitle}`}>{t.code || t.testName}</td>
                  <td className={`p-3.5 font-bold ${textMuted}`}>{t.date}</td>
                  <td className={`p-3.5 font-extrabold ${textTitle}`}>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 text-xs font-extrabold">
                      {t.subject || t.category || t.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-extrabold text-indigo-700 dark:text-indigo-300">
                    {t.score} {t.maxScore ? `/ ${t.maxScore}` : ''}
                  </td>
                  <td className="p-3.5 font-extrabold text-emerald-700 dark:text-emerald-400">
                    {t.accuracy || t.percent}%
                  </td>
                  <td className={`p-3.5 font-bold ${textMuted}`}>
                    {t.concept !== undefined ? `Concept: ${t.concept}% | Silly: ${t.silly}% | Time: ${t.timeP}%` : (t.weakAreas ? t.weakAreas.join(', ') : '-')}
                  </td>
                  <td className={`p-3.5 font-bold ${textTitle}`}>{t.takeaway || (t.weakAreas ? t.weakAreas.join(', ') : '-')}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteTestLog(t.id || t._id)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-all shadow-sm"
                      title="Delete test log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
