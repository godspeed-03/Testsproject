'use client';

import React from 'react';
import MasterRoutineTable from '@/components/MasterRoutineTable';

export default function RoutinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Master Routine & Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              4:00 AM wake-up schedule, 86.5h weekly output timetable & Satak Goals roadmap.
            </p>
          </div>
        </div>

        <MasterRoutineTable />
      </div>
    </div>
  );
}
