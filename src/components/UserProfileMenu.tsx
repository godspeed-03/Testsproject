'use client';

import { useState, useRef } from 'react';
import { User, Download, Upload, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface UserProfileMenuProps {
  user: {
    email: string;
    [key: string]: any;
  };
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        const backup = { ...data, exportedAt: new Date().toISOString() };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', `UPSC_2027_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      }
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to export data.');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        const res = await fetch('/api/tracker/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imported)
        });
        if (res.ok) {
          alert('Data successfully imported!');
          window.location.reload();
        } else {
          alert('Failed to import data.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      } finally {
        setLoading(false);
        setIsOpen(false);
      }
    };
    reader.readAsText(file);
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

            <div className="py-1">
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors text-left disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <Download size={14} className="text-slate-400" />}
                <span>Export Data (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors text-left disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <Upload size={14} className="text-slate-400" />}
                <span>Import Backup (JSON)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
              <div className="px-1">
                <LogoutButton />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
