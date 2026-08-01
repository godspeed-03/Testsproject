'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Printer, Target, FileCode, Loader2, Table as TableIcon, Layers, Calendar, Plus } from 'lucide-react';

interface MasterRoutineTableProps {
  onOpenCodeEditor?: () => void;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function getCellStyle(theme?: string) {
  switch (theme) {
    case 'pink':
      return 'bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20';
    case 'indigo':
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20';
    case 'orange':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 font-bold border border-orange-500/20';
    case 'rose':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-extrabold border border-rose-500/30';
    case 'emerald':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-500/30';
    case 'amber':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30';
    case 'sky':
      return 'bg-sky-500/15 text-sky-800 dark:text-sky-300 font-extrabold border border-sky-500/30';
    case 'purple':
      return 'bg-purple-500/15 text-purple-800 dark:text-purple-300 font-extrabold border border-purple-500/30';
    case 'slate':
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700';
  }
}

/**
 * Normalizes any JSON input (legacy single config, array of tables, or { tables: [...] })
 * into a standard array of table objects for dynamic rendering.
 */
export function normalizeRoutineTables(configData: any): any[] {
  if (!configData) return [];

  // Case 1: JSON has explicit "tables" array
  if (configData.tables && Array.isArray(configData.tables)) {
    return configData.tables;
  }

  // Case 2: Top-level JSON is an array of tables
  if (Array.isArray(configData) && configData.length > 0 && (configData[0].type || configData[0].columns || configData[0].timeSlots)) {
    return configData;
  }

  // Case 3: Legacy single routine config with timeSlots / satakGoals
  const tables: any[] = [];

  if (configData.timeSlots || configData.cells || configData.title) {
    tables.push({
      id: 'routine-grid',
      type: 'grid_matrix',
      title: configData.title || 'Master Routine',
      subtitle: configData.subtitle || '',
      timeSlots: configData.timeSlots || [],
      cells: configData.cells || [],
      metrics: configData.metrics
    });
  }

  if (configData.satakGoals && Array.isArray(configData.satakGoals) && configData.satakGoals.length > 0) {
    tables.push({
      id: 'satak-roadmap',
      type: 'satak_goals',
      title: 'Satak Goals & Strategic Roadmap',
      subtitle: 'Long-term phase objectives and execution strategy',
      satakGoals: configData.satakGoals
    });
  }

  return tables;
}

/**
 * Grid Matrix Timetable Component
 */
function GridMatrixTable({ table }: { table: any }) {
  const timeSlots: any[] = table.timeSlots || [];
  const cells: any[] = table.cells || [];
  const metrics = table.metrics;
  const numSlots = timeSlots.length;

  if (numSlots === 0) return null;

  const coveredMatrix: boolean[][] = Array.from({ length: 7 }, () => Array(numSlots).fill(false));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-center border-collapse min-w-[950px] text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              <th className="p-3 whitespace-nowrap bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white sticky left-0 z-10 font-black">DAYS</th>
              {timeSlots.map((slot: any, idx: number) => (
                <th key={idx} className="p-2.5 min-w-[90px]">
                  <span className="block font-black">{slot.time}</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">{slot.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
            {DAYS.map((dayName, dIdx) => (
              <tr key={dayName} className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-xs sticky left-0 z-10">
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
                          <span className="block text-[10px] opacity-75 mt-0.5">
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

      {/* Stats / Metrics Banner */}
      {metrics && (
        <div className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-3 flex-wrap">
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
            <div className="text-pink-600 dark:text-pink-400 font-extrabold text-xs sm:text-sm">
              🔥 {metrics.weeklyOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Single Custom Dynamic Table Component
 */
function CustomTable({ table }: { table: any }) {
  const columns: string[] = table.columns || table.headers || [];
  const rows: any[] = table.rows || [];
  const rowStyles: string[] = table.rowStyles || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[600px]">
          {columns.length > 0 && (
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold">
                {columns.map((col, cIdx) => (
                  <th key={cIdx} className="p-3.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
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
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {cellsArr.map((cellVal, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-3.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-medium ${
                        cIdx === 0 && theme ? getCellStyle(theme) : 'text-slate-800 dark:text-slate-200'
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

/**
 * Satak Goals Roadmap Table Component
 */
function SatakGoalsTable({ table }: { table: any }) {
  const satakGoals = table.satakGoals || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold">
              <th className="p-3.5 w-44">PHASE</th>
              <th className="p-3.5">PRIMARY GOAL</th>
              <th className="p-3.5">SUPPORT WORK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {satakGoals.map((goal: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400 bg-slate-50/50 dark:bg-slate-800/20 whitespace-nowrap">
                  {goal.phase}
                </td>
                <td colSpan={goal.supportWork ? 1 : 2} className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {goal.primaryGoal}
                </td>
                {goal.supportWork && (
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
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

export default function MasterRoutineTable({ onOpenCodeEditor }: MasterRoutineTableProps) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutineConfig() {
      try {
        setLoading(true);
        const res = await fetch('/api/tracker/routine');
        if (res.ok) {
          const data = await res.json();
          if (data.routineConfig) {
            setConfig(data.routineConfig);
            return;
          }
        }

        const saved = localStorage.getItem('upsc_master_routine_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed) setConfig(parsed);
        }
      } catch (err) {
        console.error('Failed to load routine config:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRoutineConfig();
  }, []);

  const tables = normalizeRoutineTables(config);

  if (!loading && tables.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 my-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20">
          <Calendar size={28} />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            No Timetable Configured
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create or paste your timetable JSON code using the editor below to display your custom daily schedule and multi-table setup.
          </p>
        </div>
        {onOpenCodeEditor && (
          <button
            type="button"
            onClick={onOpenCodeEditor}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <FileCode size={16} />
            <span>Open Timetable Code Editor</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      {loading && (
        <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-xs z-20 flex items-center justify-center rounded-2xl">
          <Loader2 className="animate-spin text-amber-500" size={24} />
        </div>
      )}

      {/* Sequentially Render Every Table in the JSON Array */}
      {tables.map((table: any, idx: number) => (
        <div key={table.id || idx} className="space-y-3">
          {table.title && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TableIcon size={18} className="text-amber-500" />
                  {table.title}
                </h3>
                {table.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {table.subtitle}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Table #{idx + 1}
              </span>
            </div>
          )}

          {table.type === 'custom_table' || table.columns ? (
            <CustomTable table={table} />
          ) : table.type === 'satak_goals' || table.satakGoals ? (
            <SatakGoalsTable table={table} />
          ) : (
            <GridMatrixTable table={table} />
          )}
        </div>
      ))}
    </div>
  );
}
