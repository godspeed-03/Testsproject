'use client';

import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Check, X, Calendar } from 'lucide-react';

interface HabitCellTooltipProps {
  dateIso: string;
  habit: any;
  hist: any;
  scheduled: boolean;
  isDone: boolean;
  isFailed: boolean;
  isPast: boolean;
  onLogUnscheduled?: () => void;
  children: React.ReactNode;
}

export default function HabitCellTooltip({
  dateIso,
  habit,
  hist,
  scheduled,
  isDone,
  isFailed,
  isPast,
  onLogUnscheduled,
  children
}: HabitCellTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const val = hist ? (hist.value || 0) : 0;
  const targetVal = habit?.target?.value || 1;
  const unitStr = (habit?.target?.unit || 'yes_no').toLowerCase().trim();
  const isYesNo = unitStr === 'yes_no' || unitStr === 'boolean' || unitStr === 'mark_done';
  const isTime = ['hours', 'hrs', 'hour', 'mins', 'minutes', 'min'].includes(unitStr);

  const formatMin = (m: number) => {
    if (m <= 0) return '0m';
    if (m < 60) return `${m}m`;
    const hrs = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  };

  let normVal = val;
  let normTarget = targetVal;

  if (['hours', 'hrs', 'hour'].includes(unitStr) && normVal <= 24 && normTarget <= 24) {
    normVal = Math.round(val * 60);
    normTarget = Math.round(targetVal * 60);
  }

  const pct = Math.min(100, Math.round((normVal / (normTarget || 1)) * 100));

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild onClick={() => setOpen((prev) => !prev)}>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-1.5 p-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-1.5">
            <span className="flex items-center gap-1 text-[11px] font-black text-slate-300">
              <Calendar size={12} className="text-accent-primary" /> {dateIso}
            </span>
            {isDone ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Check size={10} /> Done ({pct}%)
              </span>
            ) : hist?.status === 'skipped' || hist?.status === 'rest' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1">
                ☕ Rest Day
              </span>
            ) : val > 0 ? (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                pct >= 67
                  ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40'
                  : pct >= 34
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              }`}>
                ⚡ Partial ({pct}%)
              </span>
            ) : isFailed ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <X size={10} /> Failed
              </span>
            ) : !scheduled ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-400">
                Off
              </span>
            ) : isPast ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Missed
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Scheduled
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-white truncate max-w-[200px]">{habit?.title}</p>
            {isYesNo ? (
              <p className="text-slate-300 text-[11px]">
                Completed: <span className="font-bold text-white">{isDone ? 'Yes' : 'No'}</span>
              </p>
            ) : isTime ? (
              <div className="space-y-0.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Logged:</span>
                  <span className="font-black text-white">{formatMin(normVal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-slate-400">{formatMin(normTarget)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Logged:</span>
                  <span className="font-black text-white">{val} {unitStr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-slate-400">{targetVal} {unitStr}</span>
                </div>
              </div>
            )}
          </div>

          {onLogUnscheduled && !scheduled && !isPast && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onLogUnscheduled();
              }}
              className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              ⚡ Log Extra Study
            </button>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
