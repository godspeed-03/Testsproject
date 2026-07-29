'use client';

import { AlertTriangle } from 'lucide-react';

interface RedFlagAlertsProps {
  redFlags: string[];
}

export default function RedFlagAlerts({ redFlags }: RedFlagAlertsProps) {
  if (!redFlags || redFlags.length === 0) return null;

  return (
    <div className="bg-rose-500/5 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 mb-6">
      <div className="font-semibold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-2">
        <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
        <span>Academic Discipline Warnings</span>
      </div>
      <div className="space-y-1.5">
        {redFlags.map((flag, idx) => (
          <div
            key={idx}
            className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-rose-500"
            dangerouslySetInnerHTML={{ __html: flag }}
          />
        ))}
      </div>
    </div>
  );
}
