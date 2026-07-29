'use client';

import { Eye, X, Tag } from 'lucide-react';

interface ViewDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedViewLog: any;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function ViewDailyLogModal({
  isOpen,
  onClose,
  selectedViewLog,
  isLight,
  cardBg,
  cardInnerBg,
  textTitle,
  textMuted,
}: ViewDailyLogModalProps) {
  if (!isOpen || !selectedViewLog) return null;

  const l = selectedViewLog;

  return (
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in`}>
      <div className={`${cardBg} rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-300 dark:border-slate-800`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <div>
            <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
              <Eye size={18} className="text-blue-500" /> Daily Study Log Details
            </h3>
            <p className={`text-xs ${textMuted}`}>Date: <strong className="text-amber-600">{l.date}</strong></p>
          </div>
          <button type="button" onClick={onClose} className={`${textMuted} hover:text-amber-600`}>
            <X size={20} />
          </button>
        </div>

        {l.isOff ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center font-extrabold text-amber-800 dark:text-amber-200 text-sm">
            Honesty Rule: Rest / Off Day Logged
          </div>
        ) : (
          <div className="space-y-3 text-xs sm:text-sm font-bold">
            <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800 space-y-2`}>
              <span className={`text-xs font-extrabold ${textMuted} uppercase tracking-wider block`}>
                Topics Read / Revised Today
              </span>
              {l.subjectTags && l.subjectTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {l.subjectTags.map((t: any, idx: number) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold border ${
                        t.isRevision ? 'bg-amber-600 text-white border-amber-700' : 'bg-blue-600 text-white border-blue-700'
                      }`}
                    >
                      <Tag size={12} /> [{t.category}] {t.subject}: {t.topic} ({t.isRevision ? 'Rev' : 'New'})
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`${textTitle} text-sm`}>{l.topicsRead || 'General Study Session'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800`}>
                <span className={`${textMuted} block`}>Total Study Time</span>
                <span className="font-extrabold text-amber-700 dark:text-cyan-300 text-base">{l.total?.toFixed(1)} Hrs</span>
              </div>
              <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800`}>
                <span className={`${textMuted} block`}>New vs Revision</span>
                <span className="font-extrabold text-amber-700 dark:text-amber-300 text-sm">{l.newH || 0}h New / {l.revH || 0}h Rev</span>
              </div>
              <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800`}>
                <span className={`${textMuted} block`}>GS / Maths / CA</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">GS: {l.gs || 0}h | M: {l.maths || 0}h | CA: {l.ca || 0}h</span>
              </div>
              <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800`}>
                <span className={`${textMuted} block`}>Answers & Focus</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{l.ansCount || 0} Ans | {'⭐'.repeat(l.focus || 3)}</span>
              </div>
            </div>

            {l.weakest && (
              <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800`}>
                <span className={`${textMuted} block text-xs`}>Weakest Area / Note</span>
                <p className="text-rose-700 dark:text-rose-400 font-extrabold text-xs mt-0.5">{l.weakest}</p>
              </div>
            )}
          </div>
        )}

        <div className={`flex justify-end border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
