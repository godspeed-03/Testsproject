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
import { normalizeRoutineTables, getCellStyle } from '@/components/MasterRoutineTable';
import { toast } from 'sonner';

interface TimetableCodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

function GridMatrixTablePreview({ table }: { table: any }) {
  const timeSlots = table.timeSlots || [];
  const cells = table.cells || [];
  const metrics = table.metrics;
  const numSlots = timeSlots.length;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  if (numSlots === 0) {
    return <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 italic font-bold">No time slots defined in grid matrix.</div>;
  }

  const coveredMatrix: boolean[][] = Array.from({ length: 7 }, () => Array(numSlots).fill(false));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm glass-panel">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-center border-collapse min-w-[900px] text-[11px] font-bold">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-black uppercase tracking-wider divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 font-display">
              <th className="p-2.5 whitespace-nowrap bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white sticky left-0 z-10 font-black">DAYS</th>
              {timeSlots.map((slot: any, idx: number) => (
                <th key={idx} className="p-2.5">
                  {slot.time}
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-extrabold">{slot.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
            {days.map((dayName, dIdx) => (
              <tr key={dayName} className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-2.5 bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white font-black text-[11px] sticky left-0 z-10 font-display">
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
                        className={`p-2 ${getCellStyle(matchingCell.colorTheme)}`}
                      >
                        {matchingCell.title.split('\n').map((line: string, lIdx: number) => (
                          <React.Fragment key={lIdx}>
                            {lIdx > 0 && <br />}
                            {line}
                          </React.Fragment>
                        ))}
                        {matchingCell.subtitle && (
                          <span className="block text-[9px] opacity-80 mt-0.5 font-bold">
                            {matchingCell.subtitle}
                          </span>
                        )}
                      </td>
                    );
                  }

                  return <td key={sIdx} className="p-2 border border-slate-200 dark:border-slate-800" />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {metrics && (
        <div className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between text-[11px] font-black">
          <div className="flex items-center gap-2 flex-wrap">
            {metrics.dailyHours && <span className="text-amber-500">⚡ {metrics.dailyHours}</span>}
            {metrics.saturdayHours && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-500">📊 {metrics.saturdayHours}</span>
              </>
            )}
            {metrics.sundayHours && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-sky-500">🎯 {metrics.sundayHours}</span>
              </>
            )}
          </div>
          {metrics.weeklyOutput && (
            <div className="text-rose-500 font-black">
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm glass-panel">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[11px] text-left border-collapse min-w-[500px]">
          {columns.length > 0 && (
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black font-display">
                {columns.map((col, cIdx) => (
                  <th key={cIdx} className="p-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
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
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors font-bold">
                  {cellsArr.map((cellVal, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-bold ${
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm glass-panel">
      <div className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 font-display">
        <Target size={16} className="text-amber-500" /> {table.title || 'SATAK GOALS — MAINS + PRELIMS ROADMAP'}
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[11px] text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/60 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-black font-display">
              <th className="p-3 w-36">PHASE</th>
              <th className="p-3">PRIMARY GOAL</th>
              <th className="p-3">SUPPORT WORK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
            {satakGoals.map((goal: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-black text-amber-500 whitespace-nowrap bg-slate-50 dark:bg-slate-950/30">
                  {goal.phase}
                </td>
                <td colSpan={goal.supportWork ? 1 : 2} className="p-3 text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                  {goal.primaryGoal}
                </td>
                {goal.supportWork && (
                  <td className="p-3 text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
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
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                <span>{table.title}</span>
              </h4>
              <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
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
    async function initEditorContent() {
      if (!isOpen) return;
      try {
        const res = await fetch('/api/tracker/routine');
        if (res.ok) {
          const data = await res.json();
          if (data.routineConfig) {
            const formatted = JSON.stringify(data.routineConfig, null, 2);
            setJsonText(formatted);
            validateAndParse(formatted);
            return;
          }
        }

        setJsonText('');
        setParsedData([]);
        setIsRoutineConfig(false);
        setJsonError(null);
      } catch (err) {
        console.error('Failed to load initial editor JSON:', err);
      }
    }

    initEditorContent();
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndParse = (text: string) => {
    try {
      if (!text.trim()) {
        setJsonError(null);
        setParsedData([]);
        setIsRoutineConfig(false);
        return false;
      }
      let parsed = JSON.parse(text);

      if (parsed && parsed.configPayload && typeof parsed.configPayload === 'object') {
        if (parsed.configPayload.cells?.length || parsed.configPayload.timeSlots?.length || parsed.configPayload.tables?.length || parsed.configPayload.satakGoals?.length) {
          parsed = parsed.configPayload;
        }
      }
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        const { _id, userId, __v, createdAt, updatedAt, ...clean } = parsed;
        parsed = clean;
      }

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
      if (!jsonText.trim()) return;
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      validateAndParse(formatted);
    } catch (e) {
      // syntax error handled by validateAndParse
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadPreset = async (fileName: string) => {
    try {
      const res = await fetch(`/${fileName}`);
      if (res.ok) {
        const text = await res.text();
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        setJsonText(formatted);
        validateAndParse(formatted);
      }
    } catch (e) {
      console.error('Failed to load preset:', e);
    }
  };

  const handleSave = async () => {
    if (!validateAndParse(jsonText)) {
      toast.error('Please fix JSON syntax errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const parsed = JSON.parse(jsonText);

      if (isRoutineConfig) {
        const res = await fetch('/api/tracker/routine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routineConfig: parsed })
        });

        if (!res.ok) throw new Error('Failed to save to database');
      } else {
        const itemsArr = Array.isArray(parsedData) ? parsedData : [parsedData];
        for (const item of itemsArr) {
          const payload = {
            title: item.title || 'Untitled Task',
            type: item.type || 'habit',
            category: item.category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' },
            description: item.description || '',
            frequency: item.frequency || { mode: 'daily', days: [] },
            target: item.target || { value: 1, unit: 'times' },
            startDate: item.startDate || new Date().toISOString().split('T')[0],
            isStudyTask: item.isStudyTask !== undefined ? item.isStudyTask : true,
            isAugmentedRevision: item.isAugmentedRevision !== undefined ? item.isAugmentedRevision : true,
            subject: item.subject || '',
            topic: item.topic || '',
            color: item.color || '#6366F1',
            icon: item.icon || '📌'
          };

          await fetch('/api/tracker/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      }

      setSaveSuccess(true);
      toast.success('Timetable saved successfully!');
      setTimeout(() => {
        setSaveSuccess(false);
        onSaveSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      toast.error('Save failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 font-black">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
              <FileCode size={24} />
            </div>
            <div>
              <h3 className="font-black font-display text-base sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                Timetable Code Editor
                {isRoutineConfig ? (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Multi-Table Routine Config
                  </span>
                ) : parsedData.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {parsedData.length} Tasks Array
                  </span>
                ) : null}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Edit or paste timetable JSON code structure</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switchers */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 font-black">
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'split' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'editor' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                JSON Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Preview Only
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0 font-black">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleFormatCode}
              className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles size={14} className="text-amber-500" /> Format JSON
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <button
              type="button"
              onClick={() => handleLoadPreset('tt_mains.json')}
              className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 font-black rounded-xl transition-colors text-[11px] cursor-pointer border border-rose-500/30 flex items-center gap-1 active:scale-95"
            >
              🚀 Load Mains Demo (tt_mains.json)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('tt.json')}
              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-black rounded-xl transition-colors text-[11px] cursor-pointer border border-amber-500/30 active:scale-95"
            >
              Load Schedule (tt.json)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('tt_prelims.json')}
              className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 font-black rounded-xl transition-colors text-[11px] cursor-pointer border border-indigo-500/30 active:scale-95"
            >
              Load Roadmap (tt_prelims.json)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {jsonError ? (
              <span className="text-rose-600 dark:text-rose-400 font-black flex items-center gap-1 text-xs">
                <AlertTriangle size={15} /> Syntax Error
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1 text-xs">
                <CheckCircle2 size={15} /> Valid JSON
              </span>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* Editor Column */}
          <div className={`h-full flex flex-col p-4 sm:p-5 bg-slate-950 text-slate-100 ${activeTab === 'preview' ? 'hidden' : activeTab === 'editor' ? 'md:col-span-2' : ''}`}>
            <div className="flex justify-between items-center mb-2.5 text-xs font-black text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code size={15} className="text-amber-500" /> JSON Code Input
              </span>
              <span>UTF-8 • {jsonText.length} chars</span>
            </div>

            <textarea
              value={jsonText}
              onChange={handleTextChange}
              placeholder="Paste your timetable JSON configuration here..."
              spellCheck={false}
              className="w-full flex-1 bg-slate-900 text-amber-300 font-mono text-xs p-4 rounded-2xl outline-none resize-none border border-slate-800 focus:border-accent-primary/60 leading-relaxed scrollbar-thin shadow-inner"
            />

            {jsonError && (
              <div className="mt-3 p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-mono font-bold">
                ⚠ {jsonError}
              </div>
            )}
          </div>

          {/* Live Preview Column */}
          <div className={`h-full overflow-y-auto p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/70 ${activeTab === 'editor' ? 'hidden' : activeTab === 'preview' ? 'md:col-span-2' : ''}`}>
            <div className="flex justify-between items-center mb-4 text-xs font-black text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 font-display">
                <Eye size={15} className="text-amber-500" /> Live Timetable Preview
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Auto-renders structured tables</span>
            </div>

            {jsonError ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-bold">
                Fix JSON syntax errors to see the live rendering preview.
              </div>
            ) : isRoutineConfig ? (
              <MasterRoutineTablePreview config={parsedData} />
            ) : Array.isArray(parsedData) && parsedData.length > 0 ? (
              <div className="space-y-3 font-bold">
                {parsedData.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs flex items-center justify-between font-black shadow-xs">
                    <div>
                      <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.icon || '📌'}</span>
                        <span>{item.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
                        {item.subject && <span>{item.subject} • </span>}
                        {item.target?.value && <span>Goal: {item.target.value} {item.target.unit}</span>}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {item.type || 'task'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs italic font-bold">
                Enter valid timetable JSON to preview your structure.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 font-black">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-xs cursor-pointer active:scale-95"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !!jsonError}
            className="px-6 py-2.5 bg-accent-gradient text-white font-black rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Saving Timetable...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Timetable Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Timetable Configuration</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
