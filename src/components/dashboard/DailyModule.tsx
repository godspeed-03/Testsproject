'use client';

import { Plus, Edit2, Eye, Tag } from 'lucide-react';

interface DailyModuleProps {
  dailyLogs: any[];
  weeklyTargetsList: any[];
  currentWeekLogs: any[];
  startOfWeek: string;
  endOfWeek: string;
  onOpenAddDailyLogModal: () => void;
  onOpenViewDailyLogModal: (log: any) => void;
  onOpenEditDailyLogModal: (log: any) => void;
  onOpenEditTargetsModal: () => void;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  tableHeaderBg: string;
  textTitle: string;
  textMuted: string;
}

export default function DailyModule({
  dailyLogs,
  weeklyTargetsList,
  currentWeekLogs,
  startOfWeek,
  endOfWeek,
  onOpenAddDailyLogModal,
  onOpenViewDailyLogModal,
  onOpenEditDailyLogModal,
  onOpenEditTargetsModal,
  isLight,
  cardBg,
  cardInnerBg,
  tableHeaderBg,
  textTitle,
  textMuted,
}: DailyModuleProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Weekly Subject Hours Roll-Up Table */}
      <div className={`${cardBg} rounded-xl p-4 sm:p-6 border border-slate-300 dark:border-slate-800`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>Weekly Subject Hours Roll-Up</h3>
              <span className="text-xs bg-slate-200 text-slate-900 border border-slate-300 dark:bg-blue-500/20 dark:text-blue-200 px-2.5 py-0.5 rounded-full font-extrabold">
                Current Week: {startOfWeek} to {endOfWeek}
              </span>
            </div>
            <p className={`text-xs sm:text-sm ${textMuted}`}>Current week progress against your customizable target goals.</p>
          </div>
          <button
            type="button"
            onClick={onOpenEditTargetsModal}
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs border border-slate-700/50"
          >
            <Edit2 size={14} /> Edit Weekly Target Hours
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`${isLight ? 'bg-slate-100/80 text-slate-700' : 'bg-slate-900/80 text-slate-300'} text-[11px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-slate-800`}>
                <th className="px-5 py-3.5 font-extrabold w-[240px]">Subject / Track</th>
                <th className="px-5 py-3.5 font-extrabold w-[130px] text-center">Target (Weekly)</th>
                <th className="px-5 py-3.5 font-extrabold w-[180px] text-center">Actual Logged</th>
                <th className="px-5 py-3.5 font-extrabold min-w-[180px]">Progress</th>
                <th className="px-5 py-3.5 font-extrabold w-[110px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {weeklyTargetsList.map((t) => {
                let actual = 0;
                if (t.id === 'gs') {
                  actual = currentWeekLogs.reduce((acc, l) => acc + (l.gs || 0), 0);
                } else if (t.id === 'maths') {
                  actual = currentWeekLogs.reduce((acc, l) => acc + (l.maths || 0), 0);
                } else if (t.id === 'ca') {
                  actual = currentWeekLogs.reduce((acc, l) => acc + (l.ca || 0), 0);
                } else if (t.id === 'ans') {
                  actual = currentWeekLogs.reduce((acc, l) => acc + (l.ans || 0), 0);
                } else {
                  actual = currentWeekLogs.reduce((acc, l) => {
                    const matchedTag = l.subjectTags?.find(
                      (tag: any) =>
                        tag.subject?.toLowerCase().includes(t.name.toLowerCase()) ||
                        tag.topic?.toLowerCase().includes(t.name.toLowerCase())
                    );
                    return acc + (matchedTag ? (l.total || 0) / (l.subjectTags.length || 1) : 0);
                  }, 0);
                }

                const pct = t.target > 0 ? Math.min(100, Math.round((actual / t.target) * 100)) : 0;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-bold">
                    <td className={`px-5 py-4 font-extrabold ${textTitle}`}>{t.name}</td>
                    <td className={`px-5 py-4 text-center ${textMuted}`}>{t.target}h</td>
                    <td className={`px-5 py-4 text-center font-extrabold ${actual > 0 ? (isLight ? 'text-indigo-600' : 'text-cyan-400') : textMuted}`}>
                      {actual.toFixed(1)}h
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          pct >= 100
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : pct > 0
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Logs History */}
      <div className={`${cardBg} rounded-xl p-4 sm:p-6 border border-slate-300 dark:border-slate-800`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>Daily Activity Log History</h3>
            <p className={`text-xs sm:text-sm ${textMuted}`}>
              Detailed view of topics read/revised daily. (Today's log is editable; past days are View-only).
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddDailyLogModal}
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus size={16} /> Log Today's Study
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className={`${isLight ? 'bg-slate-100/80 text-slate-700' : 'bg-slate-900/80 text-slate-300'} text-[11px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-slate-800`}>
                <th className="px-5 py-3.5 font-extrabold w-[130px] whitespace-nowrap">Date</th>
                <th className="px-5 py-3.5 font-extrabold min-w-[340px]">Today's Revised & Read Topics (Tags)</th>
                <th className="px-5 py-3.5 font-extrabold w-[120px] text-center whitespace-nowrap">Total Hours</th>
                <th className="px-5 py-3.5 font-extrabold w-[170px] text-center whitespace-nowrap">GS / Maths / CA</th>
                <th className="px-5 py-3.5 font-extrabold w-[170px] text-center whitespace-nowrap">New vs Rev</th>
                <th className="px-5 py-3.5 font-extrabold w-[100px] text-center whitespace-nowrap">Answers</th>
                <th className="px-5 py-3.5 font-extrabold w-[110px] text-center whitespace-nowrap">Focus</th>
                <th className="px-5 py-3.5 font-extrabold w-[130px] text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {dailyLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <div className={`${cardInnerBg} rounded-xl p-8 text-center space-y-3 border border-slate-200 dark:border-slate-800`}>
                      <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>No Study Logs Recorded Yet</h4>
                      <p className={`text-xs sm:text-sm ${textMuted} max-w-md mx-auto`}>Start tracking your daily output! Click below to add your first entry.</p>
                      <button
                        type="button"
                        onClick={onOpenAddDailyLogModal}
                        className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus size={15} /> Log Today's Study
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                dailyLogs.map((l) => {
                  const isTodayLog = l.date === today;
                  if (l.isOff) {
                    return (
                      <tr key={l.id} className="bg-amber-50/50 dark:bg-amber-500/10 font-bold">
                        <td className={`px-5 py-4 font-extrabold ${textTitle} flex items-center gap-1.5 whitespace-nowrap`}>
                          {l.date} {isTodayLog && <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold">Today</span>}
                        </td>
                        <td colSpan={2} className={`px-5 py-4 ${textMuted} font-bold italic`}>
                          Off Day / Rest Day Logged (Honesty Rule)
                        </td>
                        <td colSpan={3} className="px-5 py-4 text-amber-950 dark:text-amber-200 font-bold">
                          Note: {l.weakest || 'Rest Day'}
                        </td>
                        <td className={`px-5 py-4 ${textMuted} text-center`}>-</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenViewDailyLogModal(l)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 rounded-xl flex items-center gap-1 text-xs font-extrabold transition-all border border-indigo-200 dark:border-indigo-800"
                            >
                              <Eye size={13} /> View
                            </button>
                            {isTodayLog && (
                              <button
                                type="button"
                                onClick={() => onOpenEditDailyLogModal(l)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1 text-xs font-extrabold transition-all border border-slate-300 dark:border-slate-700"
                              >
                                <Edit2 size={13} /> Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  const totSplit = (l.newH || 0) + (l.revH || 0);
                  const rRatio = totSplit > 0 ? Math.round(((l.revH || 0) / totSplit) * 100) : 0;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-bold">
                      <td className={`px-5 py-4 font-extrabold ${textTitle} whitespace-nowrap align-middle`}>
                        <div className="flex items-center gap-2">
                          <span>{l.date}</span>
                          {isTodayLog && (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold shadow-2xs">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {l.subjectTags && l.subjectTags.length > 0 ? (
                          <div className="flex flex-wrap gap-2 py-1">
                            {l.subjectTags.map((t: any, idx: number) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-extrabold border shadow-2xs transition-all ${
                                  t.isRevision
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                }`}
                              >
                                <Tag size={12} className="opacity-70 shrink-0" />
                                <span>
                                  [{t.category}] {t.subject}: {t.topic}
                                </span>
                                <span className="text-[10px] opacity-75 ml-0.5">
                                  {t.isRevision ? '(Rev)' : '(New)'}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className={`text-xs sm:text-sm font-bold ${textMuted}`}>
                            {l.topicsRead || l.selectedSubject || 'General Study Session'}
                          </div>
                        )}
                      </td>
                      <td className={`px-5 py-4 text-center font-extrabold align-middle whitespace-nowrap ${l.total > 0 ? (isLight ? 'text-indigo-600' : 'text-cyan-400') : textMuted}`}>
                        {l.total?.toFixed(1)} Hrs
                      </td>
                      <td className={`px-5 py-4 text-center font-bold align-middle whitespace-nowrap ${textMuted}`}>
                        GS: {l.gs}h | M: {l.maths}h | CA: {l.ca}h
                      </td>
                      <td className={`px-5 py-4 text-center font-bold align-middle whitespace-nowrap ${textMuted}`}>
                        {l.newH}h New / {l.revH}h Rev{' '}
                        <span className={`font-extrabold ${rRatio < 30 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          ({rRatio}%)
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-center font-extrabold align-middle whitespace-nowrap ${textTitle}`}>{l.ansCount} ans</td>
                      <td className="px-5 py-4 text-center text-amber-500 align-middle whitespace-nowrap">{'⭐'.repeat(l.focus || 3)}</td>
                      <td className="px-5 py-4 text-center align-middle whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenViewDailyLogModal(l)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 rounded-xl flex items-center gap-1.5 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 shadow-2xs transition-all"
                          >
                            <Eye size={14} /> View
                          </button>
                          {isTodayLog && (
                            <button
                              type="button"
                              onClick={() => onOpenEditDailyLogModal(l)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-extrabold border border-slate-300 dark:border-slate-700 shadow-2xs transition-all"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
