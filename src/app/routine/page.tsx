'use client';

import React, { useState } from 'react';
import { FileCode } from 'lucide-react';
import MasterRoutineTable from '@/components/MasterRoutineTable';
import TimetableCodeEditorModal from '@/components/TimetableCodeEditorModal';

export default function RoutinePage() {
  const [showCodeModal, setShowCodeModal] = useState(false);

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

          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0 active:scale-95 border border-amber-400 cursor-pointer"
          >
            <FileCode size={18} /> Edit Timetable Code
          </button>
        </div>

        <MasterRoutineTable onOpenCodeEditor={() => setShowCodeModal(true)} />

        <TimetableCodeEditorModal
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          onSaveSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
