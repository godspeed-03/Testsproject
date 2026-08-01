'use client';

import React, { useState, useEffect } from 'react';
import {
  Code,
  Eye,
  Check,
  AlertTriangle,
  Copy,
  Save,
  X,
  Sparkles,
  RefreshCw,
  FileCode,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Flame,
  Target,
  Grid,
  Columns
} from 'lucide-react';
import { DEFAULT_MASTER_ROUTINE_CONFIG } from '@/lib/routineDefaultConfig';
import { normalizeRoutineTables, getCellStyle } from '@/components/MasterRoutineTable';

interface TimetableCodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

function GridMatrixTablePreview({ table }: { table: any }) {
  const timeSlots = table.timeSlots || DEFAULT_MASTER_ROUTINE_CONFIG.timeSlots;
  const cells = table.cells || DEFAULT_MASTER_ROUTINE_CONFIG.cells;
  const metrics = table.metrics || DEFAULT_MASTER_ROUTINE_CONFIG.metrics;
  const numSlots = timeSlots.length;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const coveredMatrix: boolean[][] = Array.from({ length: 7 }, () => Array(numSlots).fill(false));

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-center border-collapse min-w-[900px] text-[11px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              <th className="p-2 whitespace-nowrap bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white sticky left-0 z-10 font-black">DAYS</th>
              {timeSlots.map((slot: any, idx: number) => (
                <th key={idx} className="p-2">
                  {slot.time}
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-bold">{slot.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
            {days.map((dayName, dIdx) => (
              <tr key={dayName} className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-2 bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-[11px] sticky left-0 z-10">
                  {dayName}
                </td>
                {timeSlots.map((_: any, sIdx: number) => {
                  if (coveredMatrix[dIdx][sIdx]) return null;

                  const matchingCell = cells.find(
                    (c: any) => c.day === dayName && c.slotIndex === sIdx
                  );

                  if (matchingCell) {
                    const rSpan = matchingCell.rowSpan || 1;
                    const cSpan = matchingCell.colSpan || 1;

                    for (let r = 0; r < rSpan; r++) {
                      for (let c = 0; c < cSpan; c++) {
                        if (dIdx + r < 7 && sIdx + c < numSlots) {
                          coveredMatrix[dIdx + r][sIdx + c] = true;
                        }
                      }
                    }

                    return (
                      <td
                        key={sIdx}
                        rowSpan={rSpan}
                        colSpan={cSpan}
                        className={`p-1.5 ${getCellStyle(matchingCell.colorTheme)}`}
                      >
                        {matchingCell.title.split('\n').map((line: string, lIdx: number) => (
                          <React.Fragment key={lIdx}>
                            {lIdx > 0 && <br />}
                            {line}
                          </React.Fragment>
                        ))}
                        {matchingCell.subtitle && (
                          <span className="block text-[9px] opacity-75 mt-0.5">
                            {matchingCell.subtitle}
                          </span>
                        )}
                      </td>
                    );
                  }

                  return <td key={sIdx} className="p-1.5 border border-slate-200 dark:border-slate-800" />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {metrics && (
        <div className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            {metrics.dailyHours && <span className="text-amber-600 dark:text-amber-400">⚡ {metrics.dailyHours}</span>}
            {metrics.saturdayHours && (
              <>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="text-emerald-600 dark:text-emerald-400">📊 {metrics.saturdayHours}</span>
              </>
            )}
            {metrics.sundayHours && (
              <>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="text-sky-600 dark:text-sky-400">🎯 {metrics.sundayHours}</span>
              </>
            )}
          </div>
          {metrics.weeklyOutput && (
            <div className="text-pink-600 dark:text-pink-400 font-extrabold">
              🔥 {metrics.weeklyOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CustomTablePreview({ table }: { table: any }) {
  const columns: string[] = table.columns || table.headers || [];
  const rows: any[] = table.rows || [];
  const rowStyles: string[] = table.rowStyles || [];

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[11px] text-left border-collapse min-w-[500px]">
          {columns.length > 0 && (
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold">
                {columns.map((col, cIdx) => (
                  <th key={cIdx} className="p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row, rIdx) => {
              const theme = rowStyles[rIdx] || table.colorTheme;
              const cellsArr = Array.isArray(row) ? row : Object.values(row);

              return (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  {cellsArr.map((cellVal, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-medium ${
                        cIdx === 0 && theme ? getCellStyle(theme) : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cellVal}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SatakGoalsTablePreview({ table }: { table: any }) {
  const satakGoals = table.satakGoals || [];

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <Target size={14} className="text-amber-500" /> {table.title || 'SATAK GOALS — MAINS + PRELIMS ROADMAP'}
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[11px] text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-semibold">
              <th className="p-2.5 w-36">PHASE</th>
              <th className="p-2.5">PRIMARY GOAL</th>
              <th className="p-2.5">SUPPORT WORK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {satakGoals.map((goal: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap bg-slate-50 dark:bg-slate-900/20">
                  {goal.phase}
                </td>
                <td colSpan={goal.supportWork ? 1 : 2} className="p-2.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {goal.primaryGoal}
                </td>
                {goal.supportWork && (
                  <td className="p-2.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {goal.supportWork}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MasterRoutineTablePreview({ config }: { config: any }) {
  const tables = normalizeRoutineTables(config);

  return (
    <div className="space-y-6">
      {tables.map((table: any, idx: number) => (
        <div key={table.id || idx} className="space-y-2">
          {table.title && (
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{table.title}</span>
              </h4>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Table #{idx + 1}
              </span>
            </div>
          )}

          {table.type === 'custom_table' || table.columns ? (
            <CustomTablePreview table={table} />
          ) : table.type === 'satak_goals' || table.satakGoals ? (
            <SatakGoalsTablePreview table={table} />
          ) : (
            <GridMatrixTablePreview table={table} />
          )}
        </div>
      ))}
    </div>
  );
}

const DEFAULT_SAMPLE_JSON = [
  {
    "title": "GS Paper 1: Modern Indian History",
    "type": "task",
    "category": { "id": "gs1", "label": "GS1", "icon": "📜", "color": "#F59E0B" },
    "subject": "History",
    "topic": "Freedom Movement & 1857 Revolt",
    "priority": "high",
    "frequency": { "mode": "daily", "days": [] },
    "target": { "value": 2, "unit": "hours" },
    "startDate": "2026-08-01",
    "icon": "📖",
    "color": "#F59E0B",
    "isStudyTask": true,
    "isAugmentedRevision": true,
    "reminders": [{ "time": "09:00", "enabled": true }]
  },
  {
    "title": "Daily Answer Writing Practice (2 Questions)",
    "type": "habit",
    "category": { "id": "mains", "label": "Mains Practice", "icon": "✍️", "color": "#6366F1" },
    "subject": "GS Mains",
    "priority": "high",
    "frequency": { "mode": "daily", "days": [] },
    "target": { "value": 2, "unit": "answers" },
    "startDate": "2026-08-01",
    "icon": "✍️",
    "color": "#6366F1",
    "isStudyTask": true,
    "reminders": [{ "time": "14:00", "enabled": true }]
  },
  {
    "title": "The Hindu & Indian Express Editorial Analysis",
    "type": "habit",
    "category": { "id": "current_affairs", "label": "Current Affairs", "icon": "🗞️", "color": "#10B981" },
    "subject": "Current Affairs",
    "priority": "medium",
    "frequency": { "mode": "daily", "days": [] },
    "target": { "value": 1.5, "unit": "hours" },
    "startDate": "2026-08-01",
    "icon": "📰",
    "color": "#10B981",
    "reminders": [{ "time": "07:30", "enabled": true }]
  },
  {
    "title": "CSAT Quantitative Aptitude & Reasoning",
    "type": "task",
    "category": { "id": "csat", "label": "CSAT", "icon": "🧮", "color": "#EC4899" },
    "subject": "CSAT",
    "priority": "medium",
    "frequency": { "mode": "specific_days", "days": ["Mon", "Wed", "Fri"] },
    "target": { "value": 1, "unit": "hours" },
    "startDate": "2026-08-01",
    "icon": "🔢",
    "color": "#EC4899",
    "reminders": [{ "time": "17:00", "enabled": true }]
  }
];

export default function TimetableCodeEditorModal({
  isOpen,
  onClose,
  onSaveSuccess
}: TimetableCodeEditorModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState<any>([]);
  const [isRoutineConfig, setIsRoutineConfig] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !jsonText) {
      const initialStr = JSON.stringify(DEFAULT_MASTER_ROUTINE_CONFIG, null, 2);
      setJsonText(initialStr);
      validateAndParse(initialStr);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndParse = (text: string) => {
    try {
      if (!text.trim()) {
        setJsonError('Code editor is empty');
        setParsedData([]);
        setIsRoutineConfig(false);
        return false;
      }
      const parsed = JSON.parse(text);

      const isRoutineOrMultiTable =
        parsed &&
        (
          parsed.tables ||
          parsed.timeSlots ||
          parsed.satakGoals ||
          parsed.cells ||
          parsed.title ||
          (Array.isArray(parsed) && parsed.some((item: any) => item.type === 'grid_matrix' || item.type === 'custom_table' || item.type === 'satak_goals' || item.columns || item.timeSlots || item.satakGoals))
        );

      if (isRoutineOrMultiTable) {
        setIsRoutineConfig(true);
        setParsedData(parsed);
        setJsonError(null);
        return true;
      }

      setIsRoutineConfig(false);
      let itemsArr: any[] = [];
      if (Array.isArray(parsed)) {
        itemsArr = parsed;
      } else if (parsed.habits && Array.isArray(parsed.habits)) {
        itemsArr = parsed.habits;
      } else if (parsed.timetable && Array.isArray(parsed.timetable)) {
        itemsArr = parsed.timetable;
      } else {
        itemsArr = [parsed];
      }

      setParsedData(itemsArr);
      setJsonError(null);
      return true;
    } catch (err: any) {
      setJsonError(err?.message || 'Invalid JSON Syntax');
      setParsedData([]);
      setIsRoutineConfig(false);
      return false;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    validateAndParse(val);
  };

  const handleFormatCode = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      validateAndParse(formatted);
    } catch (err: any) {
      setJsonError('Cannot format: Invalid JSON code');
    }
  };

  const handleLoadSample = (sampleType: 'routine' | 'upsc' | 'minimal') => {
    let sample: any = DEFAULT_SAMPLE_JSON;
    if (sampleType === 'routine') {
      sample = DEFAULT_MASTER_ROUTINE_CONFIG;
    } else if (sampleType === 'minimal') {
      sample = [
        {
          "title": "Morning Revision Session",
          "type": "habit",
          "category": { "id": "revision", "label": "Revision", "icon": "⚡", "color": "#F59E0B" },
          "target": { "value": 1, "unit": "hours" },
          "startDate": new Date().toISOString().split('T')[0]
        }
      ];
    }
    const str = JSON.stringify(sample, null, 2);
    setJsonText(str);
    validateAndParse(str);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTimetable = async () => {
    if (!validateAndParse(jsonText)) return;

    try {
      setSaving(true);
      setJsonError(null);

      if (isRoutineConfig) {
        // Save Master Routine & Schedule config directly to MongoDB API
        const res = await fetch('/api/tracker/routine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save routine to database');
        }
      } else {
        // Save Habits/Tasks to MongoDB via import API
        const payload = {
          habits: parsedData.map((item: any) => ({
            type: item.type || 'task',
            title: item.title || 'Untitled Study Block',
            category: item.category || { id: 'general', label: 'General', icon: '📚', color: '#6366F1' },
            subject: item.subject || '',
            topic: item.topic || '',
            priority: item.priority || 'medium',
            frequency: item.frequency || { mode: 'daily', days: [] },
            target: item.target || { value: 1, unit: 'hours' },
            startDate: item.startDate || new Date().toISOString().split('T')[0],
            icon: item.icon || '📖',
            color: item.color || '#6366F1',
            isStudyTask: item.isStudyTask !== undefined ? item.isStudyTask : true,
            isAugmentedRevision: item.isAugmentedRevision !== undefined ? item.isAugmentedRevision : true,
            reminders: item.reminders || [{ time: '08:00', enabled: true }]
          }))
        };

        const res = await fetch('/api/tracker/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save timetable code');
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onSaveSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Save error:', err);
      setJsonError(err.message || 'Error saving timetable code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-7xl max-h-[96vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold shadow-inner shrink-0">
              <FileCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Timetable & Routine Code Editor
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  JSON Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste, edit, or format master routine matrix or habit timetable JSON code with live UI preview.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Mode Switcher Toggle */}
            <div className="flex p-1 rounded-xl bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'split' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Columns size={14} />
                <span>Side-by-Side View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Code size={14} />
                <span>Code Only</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Eye size={14} />
                <span>Table Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100/80 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 text-xs px-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">Presets:</span>
            <button
              type="button"
              onClick={() => handleLoadSample('routine')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all font-semibold flex items-center gap-1"
            >
              <Grid size={12} className="text-amber-600 dark:text-amber-400" />
              <span>Load Master Routine JSON</span>
            </button>
            <button
              type="button"
              onClick={handleFormatCode}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 transition-all font-semibold flex items-center gap-1"
            >
              <RefreshCw size={12} />
              <span>Format JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium flex items-center gap-1"
            >
              <Copy size={13} />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            {jsonError ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-bold">
                <AlertTriangle size={13} /> Invalid JSON Syntax
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                <CheckCircle2 size={13} /> Valid Code Format
              </span>
            )}
          </div>
        </div>

        {/* Main Body: Code Editor + Live UI Preview (Side by Side Left / Right) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-[480px] max-h-[76vh]">
          
          {/* Left Column: Code Textarea Editor */}
          {(activeTab === 'split' || activeTab === 'editor') && (
            <div className={`${activeTab === 'editor' ? 'w-full' : 'w-full md:w-1/2'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 relative`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Code size={14} /> JSON Timetable Code
                </span>
                <span>{jsonText.length} chars</span>
              </div>

              <textarea
                value={jsonText}
                onChange={handleTextChange}
                placeholder="Paste or type JSON code here..."
                spellCheck={false}
                className="flex-1 w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-amber-300 rounded-xl p-4 font-mono text-xs leading-relaxed outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none scrollbar-thin shadow-xs min-h-[350px]"
              />

              {jsonError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Syntax Error Details:
                  </div>
                  <div className="text-[11px] opacity-90">{jsonError}</div>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Live UI Table & Card Preview */}
          {(activeTab === 'split' || activeTab === 'preview') && (
            <div className={`${activeTab === 'preview' ? 'w-full' : 'w-full md:w-1/2'} flex flex-col bg-slate-50/50 dark:bg-slate-900 p-4 sm:p-5 overflow-y-auto scrollbar-thin space-y-4`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Live UI Render Preview</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {isRoutineConfig ? 'Live Routine Matrix' : `${parsedData?.length || 0} Items`}
                </span>
              </div>

              {isRoutineConfig ? (
                /* Live Master Routine Matrix Table Preview */
                <MasterRoutineTablePreview config={parsedData} />
              ) : parsedData?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
                  <FileCode size={36} className="text-slate-400 dark:text-slate-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    No valid timetable items parsed. Type or paste valid JSON code on the left editor to preview UI layout.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.isArray(parsedData) && parsedData.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            {item.icon || '📖'}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                              {item.title || 'Untitled Item'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                              {item.category && (
                                <span
                                  className="px-2 py-0.5 rounded-md font-bold"
                                  style={{
                                    backgroundColor: (item.category?.color || '#6366F1') + '20',
                                    color: item.category?.color || '#6366F1',
                                    border: `1px solid ${(item.category?.color || '#6366F1')}40`
                                  }}
                                >
                                  {item.category?.icon || '📚'} {item.category?.label || 'General'}
                                </span>
                              )}
                              {item.subject && (
                                <span className="text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                                  {item.subject}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            item.priority === 'high'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : item.priority === 'low'
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {item.priority || 'medium'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-900 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                            <Target size={13} className="text-amber-500" />
                            Target: {item.target?.value || 1} {item.target?.unit || 'hours'}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Calendar size={13} className="text-indigo-500" />
                            {item.frequency?.mode === 'daily' ? 'Everyday' : item.frequency?.mode || 'Daily'}
                          </span>
                        </div>

                        {item.reminders?.[0]?.time && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                            <Clock size={12} className="text-amber-500" />
                            {item.reminders[0].time}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {jsonError ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Fix syntax errors before saving</span>
            ) : isRoutineConfig ? (
              <span className="text-amber-700 dark:text-amber-300 font-semibold">Live Master Routine Grid Matrix JSON loaded</span>
            ) : (
              <span>Ready to save {parsedData?.length || 0} timetable items</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving || !!jsonError}
              onClick={handleSaveTimetable}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {saving ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-slate-950" />
                  <span>Saving & Applying Timetable...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={15} className="text-slate-950" />
                  <span>Applied Successfully!</span>
                </>
              ) : (
                <>
                  <Save size={15} className="text-slate-950" />
                  <span>Save & Apply Timetable UI</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
