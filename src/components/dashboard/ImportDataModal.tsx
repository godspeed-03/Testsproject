'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X, Copy } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportJson: (jsonData: any) => Promise<void>;
  onExportJson?: () => void;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function ImportDataModal({
  isOpen,
  onClose,
  onImportJson,
  onExportJson,
  isLight,
  cardBg,
  cardInnerBg,
  inputBg,
  textTitle,
  textMuted,
}: ImportDataModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedJson, setPastedJson] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setJsonError(null);
      setSuccessMsg(null);
    }
  };

  const handleImport = async () => {
    setJsonError(null);
    setSuccessMsg(null);
    let parsedData: any = null;

    if (activeTab === 'upload') {
      if (!selectedFile) {
        setJsonError('Please pick a JSON file first.');
        return;
      }
      try {
        const text = await selectedFile.text();
        parsedData = JSON.parse(text);
      } catch (err: any) {
        setJsonError('Invalid JSON file format. Please check syntax.');
        return;
      }
    } else {
      if (!pastedJson.trim()) {
        setJsonError('Please paste JSON content into the box.');
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

  return (
    <div className={`fixed inset-0 z-[9999] overflow-y-auto ${isLight ? 'bg-slate-900/65' : 'bg-slate-950/85'} backdrop-blur-md px-3 sm:px-4 py-8 text-center animate-fade-in`}>
      {/* Vertically align helper */}
      <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

      {/* Modal Dialog Card */}
      <div className={`inline-block w-full max-w-xl text-left align-middle transition-all transform bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b ${isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-900'} space-y-3`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
                <Upload size={18} className="text-indigo-500" /> Import & Restore Database (JSON)
              </h3>
              <p className={`text-xs ${textMuted}`}>Pick a file or paste JSON to seed topics, daily logs & subjects.</p>
            </div>
            <button type="button" onClick={onClose} className={`${textMuted} hover:text-amber-600 p-1`}>
              <X size={20} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pt-1">
            <button
              type="button"
              onClick={() => { setActiveTab('upload'); setJsonError(null); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Upload size={15} /> Pick JSON File
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('paste'); setJsonError(null); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText size={15} /> Paste JSON Text
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Error / Success Alerts */}
          {jsonError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{jsonError}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' ? (
            <div className="space-y-3">
              <label className={`block border-2 border-dashed ${isLight ? 'border-slate-300 hover:border-indigo-500 bg-slate-50' : 'border-slate-700 hover:border-indigo-500 bg-slate-900/50'} rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all`}>
                <Upload size={32} className="mx-auto text-indigo-500 mb-2" />
                <span className={`text-xs sm:text-sm font-extrabold ${textTitle} block`}>
                  {selectedFile ? selectedFile.name : 'Click to select or drag a JSON file'}
                </span>
                <span className={`text-[11px] ${textMuted} block mt-1`}>
                  Supports MongoDB collection dumps or dashboard JSON backup files (.json)
                </span>
                <input type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
              </label>

              {selectedFile && (
                <div className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800 text-xs flex justify-between items-center`}>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[300px]">✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-rose-500 text-xs font-bold">Remove</button>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Paste JSON Text */
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-xs font-extrabold ${textTitle}`}>Paste Raw JSON Content</label>
                <button
                  type="button"
                  onClick={() => setPastedJson(JSON.stringify({
                    topicrevisions: [{ subject: "Ancient History", category: "GS1", topic: "Indus Valley Civilization" }],
                    syllabusitems: [{ subject: "Ancient History", category: "GS1" }],
                    dailylogs: [{ date: "2026-07-31", topicsRead: "Ancient History: Indus Valley Civilization" }]
                  }, null, 2))}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1 hover:underline"
                >
                  <Copy size={12} /> Insert Sample Template
                </button>
              </div>
              <textarea
                rows={8}
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder='Paste JSON here... e.g. { "topicrevisions": [...], "syllabusitems": [...], "dailylogs": [...] }'
                className={`w-full p-3 rounded-xl border text-xs font-mono font-medium ${inputBg} ${textTitle} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 sm:p-5 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/80'} flex justify-between items-center gap-2 flex-wrap`}>
          {onExportJson ? (
            <button
              type="button"
              onClick={onExportJson}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Download size={14} /> Export Backup (.json)
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleImport}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold rounded-xl flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import to Database'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
