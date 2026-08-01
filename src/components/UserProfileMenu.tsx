'use client';

import { useState } from 'react';
import { ChevronDown, PlusCircle, Upload, Download } from 'lucide-react';
import LogoutButton from './LogoutButton';
import ImportDataModal from './dashboard/ImportDataModal';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfileMenuProps {
  user: {
    email: string;
    [key: string]: any;
  };
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenCreate = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-create-modal'));
    }
    if (pathname !== '/tracker' && !pathname.startsWith('/tracker')) {
      router.push('/tracker?create=true');
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/tracker/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `upsc_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  };

  const handleImportJson = async (jsonData: any) => {
    const res = await fetch('/api/tracker/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import data');
    }
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-medium text-xs shadow-sm">
          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col items-start hidden sm:flex text-left">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[140px] truncate">{user.email}</span>
          <span className="text-[10px] text-slate-500 font-medium">UPSC Aspirant</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-scale-up">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
              <p className="text-[10px] text-slate-500">Connected to Database</p>
            </div>

            <div className="py-1 px-1 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              >
                <PlusCircle size={15} />
                <span>Log Task / Habit</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsOpen(false); setShowImportModal(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload size={15} className="text-indigo-500" />
                <span>Import Data (JSON)</span>
              </button>

              <button
                type="button"
                disabled={exporting}
                onClick={handleExportData}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <Download size={15} className="text-emerald-500" />
                <span>{exporting ? 'Exporting...' : 'Export Backup (JSON)'}</span>
              </button>
            </div>

            <div className="py-1 px-1">
              <LogoutButton />
            </div>
          </div>
        </>
      )}

      {showImportModal && (
        <ImportDataModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportJson={handleImportJson}
          onExportJson={handleExportData}
          isLight={false}
          cardBg="bg-white dark:bg-slate-900"
          cardInnerBg="bg-slate-50 dark:bg-slate-950"
          inputBg="bg-slate-100 dark:bg-slate-950"
          textTitle="text-slate-900 dark:text-slate-100"
          textMuted="text-slate-500 dark:text-slate-400"
        />
      )}
    </div>
  );
}
