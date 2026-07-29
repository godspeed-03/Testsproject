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
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow"
          >
            <Edit2 size={14} /> Edit Weekly Target Hours
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[600px]">
            <thead>
              <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800`}>
                <th className="p-3 font-extrabold">Subject / Track</th>
                <th className="p-3 font-extrabold">Target (Weekly)</th>
                <th className="p-3 font-extrabold">Actual Logged (This Week)</th>
                <th className="p-3 w-1/3 font-extrabold">Progress</th>
                <th className="p-3 font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
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
                  <tr key={t.id} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors font-bold">
                    <td className={`p-3 font-extrabold ${textTitle}`}>{t.name}</td>
                    <td className={`p-3 ${textMuted}`}>{t.target}h</td>
                    <td className="p-3 font-extrabold text-amber-700 dark:text-cyan-400">{actual.toFixed(1)}h</td>
                    <td className="p-3">
                      <div className="w-full bg-slate-300 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${pct >= 100 ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
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
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
          >
            <Plus size={16} /> Log Today's Study
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[850px]">
            <thead>
              <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800`}>
                <th className="p-3 font-extrabold">Date</th>
                <th className="p-3 font-extrabold">Today's Revised & Read Topics (Tags)</th>
                <th className="p-3 font-extrabold">Total Hours</th>
                <th className="p-3 font-extrabold">GS / Maths / CA</th>
                <th className="p-3 font-extrabold">New vs Rev</th>
                <th className="p-3 font-extrabold">Answers</th>
                <th className="p-3 font-extrabold">Focus</th>
                <th className="p-3 font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
              {dailyLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-500 font-bold">
                    No study logs recorded yet. Click "Log Today's Study" above!
                  </td>
                </tr>
              ) : (
                dailyLogs.map((l) => {
                  const isTodayLog = l.date === today;
                  if (l.isOff) {
                    return (
                      <tr key={l.id} className="bg-amber-100/70 dark:bg-amber-500/10 font-bold">
                        <td className={`p-3 font-extrabold ${textTitle} flex items-center gap-1`}>
                          {l.date} {isTodayLog && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">Today</span>}
                        </td>
                        <td colSpan={2} className={`p-3 ${textMuted} font-bold italic`}>
                          Off Day / Rest Day Logged (Honesty Rule)
                        </td>
                        <td colSpan={3} className="p-3 text-amber-950 dark:text-amber-200 font-bold">
                          Note: {l.weakest || 'Rest Day'}
                        </td>
                        <td className={`p-3 ${textMuted}`}>-</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenViewDailyLogModal(l)}
                              className="p-1.5 bg-blue-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                            >
                              <Eye size={13} /> View
                            </button>
                            {isTodayLog && (
                              <button
                                type="button"
                                onClick={() => onOpenEditDailyLogModal(l)}
                                className="p-1.5 bg-amber-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
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
                    <tr key={l.id} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors font-bold">
                      <td className={`p-3 font-extrabold ${textTitle}`}>
                        <div className="flex items-center gap-1.5">
                          <span>{l.date}</span>
                          {isTodayLog && (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {l.subjectTags && l.subjectTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {l.subjectTags.map((t: any, idx: number) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded font-bold border ${
                                  t.isRevision
                                    ? 'bg-amber-600 text-white border-amber-700'
                                    : 'bg-blue-600 text-white border-blue-700'
                                }`}
                              >
                                <Tag size={11} /> [{t.category}] {t.subject}: {t.topic}{' '}
                                <strong className="text-[10px] text-slate-100">{t.isRevision ? '(Rev)' : '(New)'}</strong>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className={`text-xs sm:text-sm font-bold ${textMuted}`}>
                            {l.topicsRead || l.selectedSubject || 'General Study Session'}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-extrabold text-amber-700 dark:text-cyan-400">{l.total?.toFixed(1)} Hrs</td>
                      <td className={`p-3 font-bold ${textMuted}`}>
                        GS: {l.gs}h | M: {l.maths}h | CA: {l.ca}h
                      </td>
                      <td className={`p-3 font-bold ${textMuted}`}>
                        {l.newH}h New / {l.revH}h Rev{' '}
                        <span className={`font-extrabold ${rRatio < 30 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          ({rRatio}%)
                        </span>
                      </td>
                      <td className={`p-3 font-extrabold ${textTitle}`}>{l.ansCount} ans</td>
                      <td className="p-3 text-amber-500">{'⭐'.repeat(l.focus || 3)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenViewDailyLogModal(l)}
                            className="p-1.5 bg-blue-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                          >
                            <Eye size={13} /> View
                          </button>
                          {isTodayLog && (
                            <button
                              type="button"
                              onClick={() => onOpenEditDailyLogModal(l)}
                              className="p-1.5 bg-amber-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                            >
                              <Edit2 size={13} /> Edit
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
