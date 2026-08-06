'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X, Copy, Database, Layers, CheckSquare, BookOpen, Layers3, Activity } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportJson: (jsonData: any) => Promise<void>;
  onExportJson?: () => void;
  isLight?: boolean;
  cardBg?: string;
  cardInnerBg?: string;
  inputBg?: string;
  textTitle?: string;
  textMuted?: string;
}

export default function ImportDataModal({
  isOpen,
  onClose,
  onImportJson,
  onExportJson,
}: ImportDataModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedJson, setPastedJson] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setJsonError(null);
      setSuccessMsg(null);
      try {
        const text = await file.text();
        setFileContent(text);
      } catch (err) {
        setJsonError('Failed to read selected JSON file.');
      }
    }
  };

  // Inspect JSON data for counts preview
  const inspectedSummary = useMemo(() => {
    const raw = activeTab === 'upload' ? fileContent : pastedJson;
    if (!raw || !raw.trim()) return null;
    try {
      const parsed = JSON.parse(raw);
      const habits = parsed.habits || parsed.habitItems || [];
      const lists = parsed.lists || parsed.checkLists || parsed.checklists || [];
      const topicRevisions = parsed.topicrevisions || parsed.topicRevisions || [];
      const syllabus = parsed.syllabusitems || parsed.syllabusList || parsed.syllabus || [];
      const testLogs = parsed.testlogs || parsed.testLogs || [];
      const batchedRevisions = parsed.batchedrevisions || parsed.batchedRevisions || parsed.batchedRevisionItems || [];
      const routineConfig = parsed.routineconfig || parsed.routineConfig || parsed.tables || null;

      return {
        isValid: true,
        counts: {
          habits: Array.isArray(habits) ? habits.length : 0,
          lists: Array.isArray(lists) ? lists.length : 0,
          topicRevisions: Array.isArray(topicRevisions) ? topicRevisions.length : 0,
          syllabus: Array.isArray(syllabus) ? syllabus.length : 0,
          testLogs: Array.isArray(testLogs) ? testLogs.length : 0,
          batchedRevisions: Array.isArray(batchedRevisions) ? batchedRevisions.length : 0,
          hasRoutine: !!routineConfig,
        },
      };
    } catch {
      return { isValid: false };
    }
  }, [activeTab, fileContent, pastedJson]);

  if (!isOpen || !mounted) return null;

  const handleImport = async () => {
    setJsonError(null);
    setSuccessMsg(null);
    let parsedData: any = null;

    if (activeTab === 'upload') {
      if (!selectedFile || !fileContent) {
        setJsonError('Please select a JSON backup file first.');
        return;
      }
      try {
        parsedData = JSON.parse(fileContent);
      } catch (err: any) {
        setJsonError('Invalid JSON file format. Please check file syntax.');
        return;
      }
    } else {
      if (!pastedJson.trim()) {
        setJsonError('Please paste valid JSON content into the input box.');
        return;
      }
      try {
        parsedData = JSON.parse(pastedJson);
      } catch (err: any) {
        setJsonError(`JSON Syntax Error: ${err.message}`);
        return;
      }
    }

    setLoading(true);
    try {
      await onImportJson(parsedData);
      setSuccessMsg('Data successfully imported and synchronized with database!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setJsonError(err.message || 'Failed to import JSON into database.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 py-8 text-center animate-fade-in flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="inline-block w-full max-w-xl text-left align-middle transition-all transform bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Upload size={22} />
              </div>
              <div>
                <h3 className="font-black font-display text-base sm:text-xl text-slate-900 dark:text-slate-100">
                  Import & Restore Database
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Restore habits, topic revisions, test logs & routine schedules</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pt-2 font-black">
            <button
              type="button"
              onClick={() => { setActiveTab('upload'); setJsonError(null); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Upload size={16} /> Pick JSON File
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('paste'); setJsonError(null); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText size={16} /> Paste JSON Text
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Error / Success Alerts */}
          {jsonError && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-black flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{jsonError}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' ? (
            <div className="space-y-3 font-bold">
              <label className="block border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all">
                <Upload size={36} className="mx-auto text-amber-500 mb-2" />
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 block">
                  {selectedFile ? selectedFile.name : 'Click to select or drag a JSON backup file'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 font-bold">
                  Supports database backups and collection export files (.json)
                </span>
                <input type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
              </label>

              {selectedFile && (
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center font-black">
                  <span className="text-emerald-600 dark:text-emerald-400 truncate max-w-[300px]">✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setFileContent(''); }}
                    className="text-slate-400 hover:text-rose-500 text-xs font-black cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Paste JSON Text */
            <div className="space-y-2 font-bold">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-900 dark:text-slate-100">Paste Raw JSON Content</label>
                <button
                  type="button"
                  onClick={() => setPastedJson(JSON.stringify({
                    habits: [{ title: "Daily Answer Writing", type: "habit" }],
                    topicrevisions: [{ subject: "Geography", category: "GS1", topic: "Jet Streams" }],
                    syllabusitems: [{ subject: "Geography", category: "GS1" }],
                    testlogs: [{ testName: "GS Prelims Mock 1", score: 112 }]
                  }, null, 2))}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-black flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Copy size={13} /> Insert Sample JSON
                </button>
              </div>
              <textarea
                rows={7}
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder='Paste JSON backup content here...'
                className="w-full p-4 rounded-2xl border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 focus:border-amber-500 focus:outline-none shadow-inner"
              />
            </div>
          )}

          {/* Inspected Dataset Summary Preview */}
          {inspectedSummary && inspectedSummary.isValid && inspectedSummary.counts && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-left">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                <Database size={15} />
                <span>Backup Content Summary Preview:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-black">
                <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-emerald-500" />
                  <span>{inspectedSummary.counts.habits} Habits</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-purple-500" />
                  <span>{inspectedSummary.counts.topicRevisions} Topics</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-500" />
                  <span>{inspectedSummary.counts.syllabus} Syllabus</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 flex items-center gap-1.5">
                  <Activity size={13} className="text-blue-500" />
                  <span>{inspectedSummary.counts.testLogs} Tests</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 flex items-center gap-1.5">
                  <Layers3 size={13} className="text-amber-500" />
                  <span>{inspectedSummary.counts.batchedRevisions} Batches</span>
                </div>
                {inspectedSummary.counts.hasRoutine && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">⚡ Routine Included</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center gap-2 flex-wrap font-black">
          {onExportJson ? (
            <button
              type="button"
              onClick={onExportJson}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download size={15} /> Export Backup (.json)
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'paste' && !pastedJson.trim())}
              onClick={handleImport}
              className="px-6 py-2.5 bg-accent-gradient text-white text-xs sm:text-sm font-black rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading ? 'Importing...' : 'Import to Database'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
