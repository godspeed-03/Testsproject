'use client';

import { Suspense } from 'react';
import DashboardPage from '../dashboard/page';
import { Loader2 } from 'lucide-react';

export default function DailyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}
