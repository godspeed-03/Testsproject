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
          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition-all"
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
                <td colSpan={8} className="text-center py-8 text-slate-500 font-bold">
                  No test series results logged yet. Click "Log New Test Score" above!
                </td>
              </tr>
            ) : (
              testLogs.map((t) => (
                <tr key={t.id || t._id} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors font-bold">
                  <td className={`p-3.5 font-extrabold ${textTitle}`}>{t.code || t.testName}</td>
                  <td className={`p-3.5 font-bold ${textMuted}`}>{t.date}</td>
                  <td className={`p-3.5 font-extrabold ${textTitle}`}>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs">
                      {t.subject || t.category || t.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-extrabold text-amber-700 dark:text-amber-400">
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
