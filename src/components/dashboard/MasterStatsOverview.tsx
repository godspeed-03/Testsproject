'use client';

import { BookOpen, Activity, Flame, PenLine } from 'lucide-react';

interface MasterStatsOverviewProps {
  syllabusPercent: number;
  completedSubjects: number;
  totalSubjects: number;
  weeklyHours: number;
  weeklyAnsCount: number;
  caStreak: number;
  cardBg: string;
  cardInnerBg: string;
  textTitle: string;
  textMuted: string;
}

export default function MasterStatsOverview({
  syllabusPercent,
  completedSubjects,
  totalSubjects,
  weeklyHours,
  weeklyAnsCount,
  caStreak,
  cardBg,
  cardInnerBg,
  textTitle,
  textMuted,
}: MasterStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all border border-slate-300 dark:border-slate-800`}>
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h4 className={`text-[11px] uppercase tracking-wider ${textMuted} font-extrabold`}>Subject Progress</h4>
          <div className={`text-xl font-extrabold ${textTitle}`}>{syllabusPercent}%</div>
          <div className={`text-xs ${textMuted} font-bold`}>
            {completedSubjects} / {totalSubjects} Subjects Active
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all border border-slate-300 dark:border-slate-800`}>
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 flex items-center justify-center shrink-0">
          <Activity size={20} />
        </div>
        <div>
          <h4 className={`text-[11px] uppercase tracking-wider ${textMuted} font-extrabold`}>Weekly Output</h4>
          <div className={`text-xl font-extrabold ${textTitle}`}>{weeklyHours.toFixed(1)} Hrs</div>
          <div className={`text-xs ${textMuted} font-bold`}>Current Week Logged</div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all border border-slate-300 dark:border-slate-800`}>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
          <Flame size={20} />
        </div>
        <div>
          <h4 className={`text-[11px] uppercase tracking-wider ${textMuted} font-extrabold`}>CA Streak</h4>
          <div className={`text-xl font-extrabold ${textTitle}`}>{caStreak} Days</div>
          <div className={`text-xs ${textMuted} font-bold`}>Daily Current Affairs</div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all border border-slate-300 dark:border-slate-800`}>
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-center shrink-0">
          <PenLine size={20} />
        </div>
        <div>
          <h4 className={`text-[11px] uppercase tracking-wider ${textMuted} font-extrabold`}>Weekly Answers</h4>
          <div className={`text-xl font-extrabold ${textTitle}`}>{weeklyAnsCount} Written</div>
          <div className={`text-xs ${textMuted} font-bold`}>Mains Answer Log</div>
        </div>
      </div>
    </div>
  );
}
