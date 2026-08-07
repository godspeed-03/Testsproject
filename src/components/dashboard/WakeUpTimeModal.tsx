'use client';

import React, { useState } from 'react';
import { Clock, Award, CheckCircle2, X } from 'lucide-react';
import ShadcnTimePicker from '@/components/ui/ShadcnTimePicker';

interface WakeUpTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: any;
  dateIso: string;
  onSave: (wakeTime: string, tier: number, pts: number, status: string) => Promise<void>;
}

export function calculateWakeUpTier(actualTimeStr: string, targetTimeStr: string = '04:00') {
  // Convert HH:MM strings to total minutes from midnight
  const parseTimeMins = (tStr: string): number => {
    if (!tStr) return 4 * 60; // default 04:00 AM
    let clean = tStr.trim().toUpperCase();
    let isPM = clean.includes('PM');
    let isAM = clean.includes('AM');
    clean = clean.replace(/(AM|PM|\s)/g, '');
    const parts = clean.split(':');
    let h = parseInt(parts[0] || '4', 10);
    let m = parseInt(parts[1] || '0', 10);

    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  };

  const actualMins = parseTimeMins(actualTimeStr);
  const targetMins = parseTimeMins(targetTimeStr);

  // Tiers relative to habit's specific target time:
  // Tier 0: <= targetTime + 15 mins (100 pts)
  // Tier 1: <= targetTime + 60 mins (75 pts)
  // Tier 2: <= targetTime + 120 mins (40 pts, Streak Frozen)
  // Tier 3: <= targetTime + 180 mins (10 pts, Streak Reset)
  // Tier 4: > targetTime + 180 mins (-20 penalty pts, Streak Reset)
  const tier0Max = targetMins + 15;
  const tier1Max = targetMins + 60;
  const tier2Max = targetMins + 120;
  const tier3Max = targetMins + 180;

  if (actualMins <= tier0Max) {
    return {
      tier: 0,
      pts: 100,
      status: 'done',
      label: 'On-Time Target',
      desc: 'Target achieved on time!',
      streakAction: 'increment',
      streakBadge: '🔥 Streak +1 Day',
      color: 'emerald',
    };
  } else if (actualMins <= tier1Max) {
    return {
      tier: 1,
      pts: 75,
      status: 'done',
      label: 'Grace Period',
      desc: 'Slight delay, 75% score maintained.',
      streakAction: 'increment',
      streakBadge: '🔥 Streak +1 Day',
      color: 'lime',
    };
  } else if (actualMins <= tier2Max) {
    return {
      tier: 2,
      pts: 40,
      status: 'done',
      label: 'Minor Delay',
      desc: 'Moderate delay. Streak is frozen (preserved).',
      streakAction: 'freeze',
      streakBadge: '❄️ Streak Frozen',
      color: 'amber',
    };
  } else if (actualMins <= tier3Max) {
    return {
      tier: 3,
      pts: 10,
      status: 'done',
      label: 'Major Delay',
      desc: 'Significant delay. Tier penalty applied.',
      streakAction: 'reset',
      streakBadge: '⚠️ Streak Reset',
      color: 'orange',
    };
  } else {
    return {
      tier: 4,
      pts: -20,
      status: 'failed',
      label: 'Severe Miss',
      desc: 'Completion past deadline. Deduction penalty.',
      streakAction: 'reset',
      streakBadge: '❌ Streak Reset & Penalty',
      color: 'rose',
    };
  }
}

// Systemic dynamic presets generator based on target time
function getDynamicPresets(targetTimeStr: string) {
  const parseMins = (tStr: string) => {
    if (!tStr) return 240;
    let clean = tStr.trim().toUpperCase().replace(/(AM|PM|\s)/g, '');
    let parts = clean.split(':');
    let h = parseInt(parts[0] || '4', 10);
    let m = parseInt(parts[1] || '0', 10);
    return h * 60 + m;
  };

  const formatMins = (mins: number) => {
    let normalized = (mins + 1440) % 1440;
    let h = Math.floor(normalized / 60);
    let m = normalized % 60;
    let hStr = String(h).padStart(2, '0');
    let mStr = String(m).padStart(2, '0');
    const isPm = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return {
      val: `${hStr}:${mStr}`,
      label: `${String(h12).padStart(2, '0')}:${mStr} ${isPm ? 'PM' : 'AM'}`,
    };
  };

  const baseMins = parseMins(targetTimeStr);
  return [
    formatMins(baseMins),
    formatMins(baseMins + 15),
    formatMins(baseMins + 30),
    formatMins(baseMins + 60),
    formatMins(baseMins + 120),
  ];
}

function formatDisplayTime(timeStr: string) {
  if (!timeStr) return '04:00 AM';
  let clean = timeStr.trim().toUpperCase().replace(/(AM|PM|\s)/g, '');
  let parts = clean.split(':');
  let h = parseInt(parts[0] || '4', 10);
  let m = parseInt(parts[1] || '0', 10);
  const isPm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`;
}

export default function WakeUpTimeModal({
  isOpen,
  onClose,
  habit,
  dateIso,
  onSave,
}: WakeUpTimeModalProps) {
  const targetTime = habit?.target?.targetTime || '04:00';

  // Check if today already has a logged history wakeTime
  const existingHist = (habit?.history || []).find((h: any) => h.date === dateIso);
  const initialTime = existingHist?.wakeTime || targetTime;

  const [wakeTime, setWakeTime] = useState<string>(initialTime);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !habit) return null;

  const tierEval = calculateWakeUpTier(wakeTime, targetTime);
  const dynamicPresets = getDynamicPresets(targetTime);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(wakeTime, tierEval.tier, tierEval.pts, tierEval.status);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              {habit.icon || '⏰'}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Log Timely Target
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {habit.title} • Target: <span className="font-extrabold text-amber-500">{formatDisplayTime(targetTime)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Time Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
            What time did you complete this today? ({dateIso})
          </label>
          <div className="w-full">
            <ShadcnTimePicker
              value={wakeTime}
              onChange={(t) => setWakeTime(t)}
              alignRight={true}
            />
          </div>
        </div>

        {/* Systemic Dynamic Time Presets relative to target time */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {dynamicPresets.map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setWakeTime(preset.val)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all shrink-0 ${
                wakeTime === preset.val
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Real-time Dynamic Score Card */}
        <div
          className={`p-4 rounded-2xl border space-y-3 transition-all ${
            tierEval.color === 'emerald'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
              : tierEval.color === 'lime'
              ? 'bg-lime-500/10 border-lime-500/30 text-lime-950 dark:text-lime-100'
              : tierEval.color === 'amber'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
              : tierEval.color === 'orange'
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-100'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              <Award size={18} />
              <span>{tierEval.label}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 text-xs font-black shadow-xs">
              {tierEval.pts > 0 ? `+${tierEval.pts}` : tierEval.pts} Pts
            </span>
          </div>

          <p className="text-xs font-medium opacity-90">{tierEval.desc}</p>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40 text-xs font-extrabold">
            <span>{tierEval.streakBadge}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Save Timely Log</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
