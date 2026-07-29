'use client';

import { useState } from 'react';
import { CalendarDays, Clock, SkipForward, CheckCircle } from 'lucide-react';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';

interface SpacedRevisionModuleProps {
  topicRevisions: any[];
  syllabusList: any[];
  dailyLogs: any[];
  selectedRevisionDate: string;
  setSelectedRevisionDate: (date: string) => void;
  onAdvanceSpacedRepetition: (id: string) => Promise<void>;
  onOpenSkipModal: (topic: any) => void;
  getCategoryBadge: (category: string) => string;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  textTitle: string;
  textMuted: string;
}

export default function SpacedRevisionModule({
  topicRevisions,
  syllabusList,
  dailyLogs,
  selectedRevisionDate,
  setSelectedRevisionDate,
  onAdvanceSpacedRepetition,
  onOpenSkipModal,
  getCategoryBadge,
  isLight,
  cardBg,
  cardInnerBg,
  textTitle,
  textMuted,
}: SpacedRevisionModuleProps) {
  const [revisionSubTab, setRevisionSubTab] = useState<'today' | 'overdue'>('today');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find((l) => l.date === todayStr);
  const completedTodayIds = todayLog?.completedRevisions || [];

  const getNextRevDate = (s: any) => {
    if (s.nextRev) return s.nextRev;
    if (s.date) {
      const days = s.rev2 || s.status === 'Mastered' ? 45 : s.rev1 || s.status === 'Revised Once' ? 21 : 7;
      const d = new Date(s.date);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    }
    return '';
  };

  const topicRevItems = topicRevisions.map((t: any) => ({
    id: t.id || t._id || t.customId,
    customId: t.customId,
    subject: t.subject,
    topic: t.topic,
    source: t.topic,
    category: t.category || 'GS1',
    nextRev: t.nextScheduledDate,
    date: t.firstReadDate,
    r1Status: t.r1Status,
    r2Status: t.r2Status,
    r3Status: t.r3Status,
    r1ScheduledDate: t.r1ScheduledDate,
    r2ScheduledDate: t.r2ScheduledDate,
    r3ScheduledDate: t.r3ScheduledDate,
    r1CompletedDate: t.r1CompletedDate,
    r2CompletedDate: t.r2CompletedDate,
    r3CompletedDate: t.r3CompletedDate,
    lastRevisedDate: t.lastRevisedDate,
    isOverdue: t.isOverdue,
    overdueDays: t.overdueDays || 0,
    isCluster: t.isCluster,
    subTopics: t.subTopics || [],
    rev1: !!t.r1CompletedDate && t.r1Status !== 'Skipped',
    rev2: !!t.r2CompletedDate && t.r2Status !== 'Skipped',
    status:
      t.r3CompletedDate && t.r3Status !== 'Skipped'
        ? 'Mastered'
        : t.r2CompletedDate && t.r2Status !== 'Skipped'
        ? 'Revised Once'
        : 'First Read Done',
    extraRevisions: t.extraRevisions || [],
    revisionLogs: t.revisionLogs || [],
  }));

  const rawActiveRevisionsSource = topicRevItems.length > 0 ? topicRevItems : syllabusList;
  const activeRevisionsSource = rawActiveRevisionsSource.filter((s: any) => {
    const cat = (s.category || '').toUpperCase();
    return cat === 'GS1' || cat === 'GS2' || cat === 'GS3' || cat === 'GS4' || cat.startsWith('GS');
  });

  const overdueRevisions = activeRevisionsSource
    .filter((s: any) => {
      if (s.isOverdue) return true;
      const nRev = s.nextRev || getNextRevDate(s);
      return (
        nRev &&
        nRev < todayStr &&
        s.lastRevisedDate !== todayStr &&
        !completedTodayIds.includes(s.id) &&
        !completedTodayIds.includes(s.customId)
      );
    })
    .sort((a: any, b: any) =>
      ((a.nextRev || getNextRevDate(a)) || '').localeCompare((b.nextRev || getNextRevDate(b)) || '')
    );

  const targetRevDate = selectedRevisionDate || todayStr;

  const todayNotDone = activeRevisionsSource
    .filter((s: any) => {
      const nRev = s.nextRev || getNextRevDate(s);
      const isDoneOnDate =
        s.lastRevisedDate === targetRevDate ||
        s.r1CompletedDate === targetRevDate ||
        s.r2CompletedDate === targetRevDate ||
        s.r3CompletedDate === targetRevDate ||
        (targetRevDate === todayStr &&
          (completedTodayIds.includes(s.id) || completedTodayIds.includes(s.customId)));
      return nRev && nRev === targetRevDate && !isDoneOnDate && !s.isOverdue;
    })
    .sort((a: any, b: any) => (a.subject || '').localeCompare(b.subject || ''));

  const todayDone = activeRevisionsSource.filter((s: any) => {
    if (s.r1Status === 'Skipped' || s.r2Status === 'Skipped' || s.r3Status === 'Skipped') return false;
    if (s.revisionLogs && s.revisionLogs.length > 0) {
      const lastLog = s.revisionLogs[s.revisionLogs.length - 1];
      if (lastLog && lastLog.stage && lastLog.stage.toLowerCase().includes('skipped')) return false;
    }
    const hasCompletedOnDate =
      s.r1CompletedDate === targetRevDate ||
      s.r2CompletedDate === targetRevDate ||
      s.r3CompletedDate === targetRevDate ||
      (s.extraRevisions && s.extraRevisions.some((er: any) => er.date === targetRevDate)) ||
      (targetRevDate === todayStr &&
        (completedTodayIds.includes(s.id) || completedTodayIds.includes(s.customId)));
    return hasCompletedOnDate;
  });

  const getSpacedStageBadge = (s: any) => {
    if (s.status === 'Revised Once' || s.rev1) {
      return { label: 'R2 (+21 Days)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-extrabold' };
    } else if (s.status === 'Mastered' || s.rev2) {
      return { label: 'R3 (+45 Days)', color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 font-extrabold' };
    } else {
      return { label: 'R1 (+7 Days)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 font-extrabold' };
    }
  };

  return (
    <div className={`${cardBg} rounded-xl p-4 sm:p-6 animate-fade-in space-y-6`}>
      <div className={`flex justify-between items-center flex-wrap gap-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-4`}>
        <div>
          <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle}`}>Automated Spaced Repetition Revision Queue</h3>
          <p className={`text-xs sm:text-sm ${textMuted}`}>
            Scientific revision intervals (+7d, +21d, +45d) calculated automatically for optimal long-term retention.
          </p>
        </div>

        {/* Subtab Toggle & Date Picker */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setRevisionSubTab('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                revisionSubTab === 'today'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Scheduled Queue ({todayNotDone.length + todayDone.length})
            </button>
            <button
              type="button"
              onClick={() => setRevisionSubTab('overdue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                revisionSubTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Overdue Debt
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${revisionSubTab === 'overdue' ? 'bg-white text-rose-900' : 'bg-slate-700 text-white'}`}>
                {overdueRevisions.length}
              </span>
            </button>
          </div>

          <ShadcnDatePicker
            selectedDate={selectedRevisionDate}
            onSelectDate={setSelectedRevisionDate}
          />
        </div>
      </div>

      {/* TODAY'S REVISION QUEUE */}
      {revisionSubTab === 'today' && (
        <div className="space-y-4">
          {todayNotDone.length === 0 && todayDone.length === 0 ? (
            <div className={`${cardInnerBg} rounded-xl p-10 text-center space-y-3 border border-slate-300 dark:border-slate-800`}>
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
                <CalendarDays size={24} />
              </div>
              <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>No Revisions Scheduled For Selected Date!</h4>
              <p className={`text-xs sm:text-sm ${textMuted} max-w-md mx-auto`}>All study items for this date are completely up to date.</p>
              {overdueRevisions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRevisionSubTab('overdue')}
                  className="mt-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Check {overdueRevisions.length} Overdue Topics From Previous Days
                </button>
              )}
            </div>
          ) : (
            <>
              {/* NOT DONE TOPICS */}
              {todayNotDone.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Clock size={14} /> Pending Revisions Due ({todayNotDone.length})
                  </div>
                  {todayNotDone.map((s) => {
                    const badge = getSpacedStageBadge(s);
                    return (
                      <div
                        key={s.id}
                        className={`${cardInnerBg} p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border-l-4 border-l-indigo-600 dark:border-l-indigo-500 border border-slate-300 dark:border-slate-800 shadow-2xs`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${getCategoryBadge(s.category)}`}>
                              {s.category}
                            </span>
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <div className={`font-extrabold ${textTitle} text-base sm:text-lg`}>
                              {s.subject} {s.topic || s.source ? <span className="text-indigo-700 dark:text-cyan-300 font-extrabold">— {s.topic || s.source}</span> : ''}
                            </div>
                          </div>
                          <div className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                            Exact Topic / Chapter: <span className="font-extrabold text-slate-900 dark:text-slate-100">{s.topic || s.source || 'Standard Book'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => onOpenSkipModal(s)}
                            className="w-1/2 sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all"
                            title="Skip this revision schedule with custom remarks"
                          >
                            <SkipForward size={14} className="inline" /> Skip
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdvanceSpacedRepetition(s.id)}
                            className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                          >
                            <CheckCircle size={16} /> Mark Revised Today
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* COMPLETED TODAY TOPICS */}
              {todayDone.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Completed Today ({todayDone.length}) — Moved to Bottom
                  </div>
                  {todayDone.map((s) => {
                    const badge = getSpacedStageBadge(s);
                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/20 dark:border-emerald-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${getCategoryBadge(s.category)}`}>
                              {s.category}
                            </span>
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-base sm:text-lg">
                              {s.subject} {s.topic || s.source ? `— ${s.topic || s.source}` : ''}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mt-1">
                            Marked Revised Today ({todayStr})
                          </p>
                        </div>

                        <span className="text-xs bg-emerald-600 text-white px-3.5 py-1 rounded-full font-extrabold shadow-2xs shrink-0">
                          Next Revision: {s.nextRev}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* OVERDUE DEBT VIEW */}
      {revisionSubTab === 'overdue' && (
        <div className="space-y-3">
          {overdueRevisions.length === 0 ? (
            <div className={`${cardInnerBg} rounded-xl p-10 text-center space-y-3 border border-slate-300 dark:border-slate-800`}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle size={24} />
              </div>
              <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>Zero Overdue Debt!</h4>
              <p className={`text-xs sm:text-sm ${textMuted} max-w-md mx-auto`}>You have no pending topics from previous days. Excellent consistency!</p>
            </div>
          ) : (
            overdueRevisions.map((s) => {
              const badge = getSpacedStageBadge(s);
              return (
                <div
                  key={s.id}
                  className={`${cardInnerBg} p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border-l-4 border-l-rose-600 bg-rose-500/10 border border-slate-300 dark:border-slate-800`}
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${getCategoryBadge(s.category)}`}>
                        {s.category}
                      </span>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className={`font-extrabold ${textTitle} text-base sm:text-lg`}>
                        {s.subject} {s.topic || s.source ? <span className="text-indigo-700 dark:text-cyan-300 font-extrabold">— {s.topic || s.source}</span> : ''}
                      </div>
                    </div>
                    <div className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                      Exact Topic / Chapter: <span className="font-extrabold text-slate-900 dark:text-slate-100">{s.topic || s.source || 'Standard Book'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300">
                        OVERDUE (NOT DONE YET) — Scheduled: {s.nextRev}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenSkipModal(s)}
                      className="w-1/2 sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
                      title="Skip this overdue topic and advance to next milestone"
                    >
                      <SkipForward size={14} className="inline" /> Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdvanceSpacedRepetition(s.id)}
                      className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
                    >
                      <CheckCircle size={16} /> Mark Revised Today
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
