'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, PlusCircle, Upload, Download, FileText, BookOpen } from 'lucide-react';
import LogoutButton from './LogoutButton';
import ImportDataModal from './dashboard/ImportDataModal';
import ThemeToggle from './ThemeToggle';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfileMenuProps {
  user: {
    email: string;
    name?: string;
    picture?: string;
    [key: string]: any;
  };
}

import { Palette, Check } from 'lucide-react';
import { useAccentTheme } from '@/context/AccentThemeContext';
import { toast } from 'sonner';

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { accentTheme, setAccentTheme, themes } = useAccentTheme();
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
        toast.success('Backup JSON downloaded successfully!');
      } else {
        toast.error('Failed to export backup data.');
      }
    } catch (e) {
      console.error('Export failed', e);
      toast.error('Export failed.');
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setGeneratingReport(true);
      setReportError(null);
      const res = await fetch('/api/tracker/report');
      if (!res.ok) {
        throw new Error('Failed to fetch report data');
      }
      const data = await res.json();
      const { generateTrackerReportPdf } = await import('@/lib/generateTrackerReportPdf');
      generateTrackerReportPdf(data);
      toast.success('PDF report generated successfully!');
    } catch (e) {
      console.error('Report generation failed', e);
      setReportError('Could not generate report. Please try again.');
      toast.error('Could not generate report.');
    } finally {
      setGeneratingReport(false);
      setIsOpen(false);
    }
  };

  const handleImportJson = async (jsonData: any) => {
    try {
      const res = await fetch('/api/tracker/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });
      if (!res.ok) {
        let errorMsg = 'Failed to import data';
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `Server error (${res.status})`;
        }
        toast.error(errorMsg);
        return;
      }
      toast.success('Backup restored successfully!');
      window.location.reload();
    } catch (e: any) {
      console.error('Import error:', e);
      toast.error(e.message || 'Failed to import data');
    }
  };

  const displayName = user.name || user.email;
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
      >
        {/* Google Profile Avatar with Initial Fallback */}
        {user.picture && !imgError ? (
          <img
            src={user.picture}
            alt={displayName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-8 h-8 rounded-full object-cover shadow-xs border border-amber-500/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
            {initial}
          </div>
        )}

        <div className="flex flex-col items-start hidden md:flex text-left">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 max-w-[140px] truncate">{displayName}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">UPSC Aspirant</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-scale-up">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              {user.picture && !imgError ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-9 h-9 rounded-full object-cover border border-amber-500/30 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                  {initial}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="py-1 px-1 border-b border-slate-100 dark:border-slate-800 space-y-0.5">

              <button
                type="button"
                onClick={() => { setIsOpen(false); setShowImportModal(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Upload size={15} className="text-amber-500" />
                <span>Import Data (JSON)</span>
              </button>

              <button
                type="button"
                disabled={exporting}
                onClick={handleExportData}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Download size={15} className="text-emerald-500" />
                <span>{exporting ? 'Exporting...' : 'Export Backup (JSON)'}</span>
              </button>

              <button
                type="button"
                disabled={generatingReport}
                onClick={handleExportReport}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileText size={15} className="text-amber-500" />
                <span>{generatingReport ? 'Generating Report...' : 'Export Report (PDF)'}</span>
              </button>
              {reportError && (
                <p className="px-3 pt-1 text-[10px] font-semibold text-red-500">{reportError}</p>
              )}
            </div>

            {/* Dark / Light Mode & Theme Accent Picker */}
            <div className="py-2.5 px-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-xs font-extrabold">
                  <Palette size={14} className="text-amber-500" />
                  <span>Theme Mode</span>
                </span>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between text-[11px] font-black text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <Palette size={13} className="text-emerald-500" /> Color Accent
                </span>
                <span className="uppercase text-[9px] tracking-wider text-slate-400 font-extrabold">{accentTheme}</span>
              </div>
              <div className="flex items-center justify-between gap-1 pt-1">
                {themes.map((t) => {
                  const isSel = accentTheme === t.id;
                  const hex = isDark ? (t.darkHex || t.colorHex) : (t.lightHex || t.colorHex);
                  const glow = isDark ? (t.darkGlow || t.colorGlow) : (t.lightGlow || t.colorGlow);
                  const darkText = isDark ? !!t.darkTextInDark : false;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAccentTheme(t.id)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                        isSel ? 'scale-115' : 'hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: hex,
                        boxShadow: isSel ? `0 0 10px ${glow}, 0 0 2px ${hex}` : 'none',
                      }}
                      title={`${t.name} (${isDark ? 'Dark Neon' : 'Light Vibrant'})`}
                      aria-label={`Select ${t.name} theme`}
                    >
                      {isSel && (
                        <Check
                          size={11}
                          className={darkText ? 'text-slate-950 font-black' : 'text-white font-black drop-shadow-xs'}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="py-1 px-1">
              <LogoutButton />
            </div>
          </div>
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
