'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME_SLOTS = [
  { time: '5:30-8:30', label: 'Optional Block 1' },
  { time: '8:30-9:30', label: 'Breakfast & News' },
  { time: '9:30-12:30', label: 'GS Answer Writing' },
  { time: '12:30-2:00', label: 'Lunch & Rest' },
  { time: '2:00-5:00', label: 'Optional Block 2' },
  { time: '5:00-7:00', label: 'GS Mains Notes' },
  { time: '8:00-10:00', label: 'Ethics & Essay' },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800' },
  slate: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },
};

interface CellData {
  day: string;
  slotIndex: number;
  rowSpan?: number;
  colSpan?: number;
  title: string;
  subtitle?: string;
  colorTheme: string;
}

const CELLS: CellData[] = [
  { day: 'MON', slotIndex: 0, rowSpan: 5, title: 'Optional Paper 1', subtitle: 'Core Theory', colorTheme: 'amber' },
  { day: 'MON', slotIndex: 1, rowSpan: 6, title: 'Editorial Synopses', colorTheme: 'emerald' },
  { day: 'MON', slotIndex: 2, rowSpan: 5, title: '2 GS Qs Daily', subtitle: '7 min each', colorTheme: 'rose' },
  { day: 'MON', slotIndex: 3, rowSpan: 7, title: 'LUNCH', colorTheme: 'slate' },
  { day: 'MON', slotIndex: 4, rowSpan: 5, title: 'Optional Paper 2', colorTheme: 'amber' },
  { day: 'MON', slotIndex: 5, rowSpan: 5, title: 'GS Mains Notes', colorTheme: 'indigo' },
  { day: 'MON', slotIndex: 6, rowSpan: 4, title: 'Ethics Cases', colorTheme: 'purple' },
  { day: 'FRI', slotIndex: 6, rowSpan: 2, title: 'Essay Practice', colorTheme: 'pink' },
  { day: 'SAT', slotIndex: 0, colSpan: 3, title: 'GS Mains Mock (3h)', colorTheme: 'rose' },
  { day: 'SAT', slotIndex: 4, colSpan: 3, title: 'Optional Mock (3h)', colorTheme: 'amber' },
  { day: 'SUN', slotIndex: 0, colSpan: 7, title: 'Weekly Revision & Model Answers', colorTheme: 'indigo' },
];

function getCell(day: string, slotIndex: number): CellData | undefined {
  // Direct match
  const direct = CELLS.find(c => c.day === day && c.slotIndex === slotIndex);
  if (direct) return direct;
  // Check rowSpan inheritance
  const dayIdx = DAYS.indexOf(day);
  const inherited = CELLS.find(c => {
    if (c.slotIndex !== slotIndex) return false;
    if (!c.rowSpan || c.rowSpan <= 1) return false;
    const cDayIdx = DAYS.indexOf(c.day);
    return dayIdx > cDayIdx && dayIdx < cDayIdx + c.rowSpan;
  });
  return inherited;
}

function isCellOrigin(day: string, slotIndex: number): boolean {
  return CELLS.some(c => c.day === day && c.slotIndex === slotIndex);
}

export default function TimetableShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-wider border border-amber-100">
            <Calendar size={14} />
            Feature 04 — Master Routine & Weekly Timetable
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Visual Weekly Planner
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Build your entire weekly study schedule in a JSON-powered timetable editor. 
            Color-coded time blocks, metrics tracking, and preset templates for Mains & Prelims strategies.
          </p>
        </div>

        {/* Timetable grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-2 py-2.5 text-left font-black text-[10px] uppercase tracking-wider border-r border-slate-700 w-[60px]">Days</th>
                  {TIME_SLOTS.map((s, i) => (
                    <th key={i} className="px-1.5 py-2.5 text-center font-bold border-r border-slate-700 last:border-r-0">
                      <div className="font-black text-amber-400 text-[9px]">{s.time}</div>
                      <div className="text-slate-300 text-[8px] font-medium mt-0.5">{s.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  // Check for colSpan cells
                  const colSpanCells = CELLS.filter(c => c.day === day && c.colSpan);

                  if (colSpanCells.length > 0) {
                    return (
                      <tr key={day} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-2 py-3 font-black text-slate-900 bg-slate-50 border-r border-slate-200 text-[10px]">{day}</td>
                        {(() => {
                          const cells: React.ReactNode[] = [];
                          let slotIdx = 0;
                          while (slotIdx < 7) {
                            const spanCell = colSpanCells.find(c => c.slotIndex === slotIdx);
                            if (spanCell && spanCell.colSpan) {
                              const clr = COLOR_MAP[spanCell.colorTheme] || COLOR_MAP.slate;
                              cells.push(
                                <td
                                  key={slotIdx}
                                  colSpan={spanCell.colSpan}
                                  className={`px-2 py-2.5 text-center border-r border-slate-200 last:border-r-0 ${clr.bg} border ${clr.border}`}
                                >
                                  <span className={`font-bold ${clr.text} text-[10px]`}>{spanCell.title}</span>
                                </td>
                              );
                              slotIdx += spanCell.colSpan;
                            } else {
                              const cell = getCell(day, slotIdx);
                              if (cell) {
                                const clr = COLOR_MAP[cell.colorTheme] || COLOR_MAP.slate;
                                cells.push(
                                  <td key={slotIdx} className={`px-1.5 py-2 text-center border-r border-slate-200 last:border-r-0 ${clr.bg}`}>
                                    <span className={`font-bold ${clr.text} text-[9px]`}>{cell.title}</span>
                                  </td>
                                );
                              } else {
                                cells.push(
                                  <td key={slotIdx} className="px-1.5 py-2 border-r border-slate-200 last:border-r-0" />
                                );
                              }
                              slotIdx++;
                            }
                          }
                          return cells;
                        })()}
                      </tr>
                    );
                  }

                  return (
                    <tr key={day} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-2 py-3 font-black text-slate-900 bg-slate-50 border-r border-slate-200 text-[10px]">{day}</td>
                      {TIME_SLOTS.map((_, slotIdx) => {
                        const cell = getCell(day, slotIdx);
                        if (cell) {
                          if (!isCellOrigin(day, slotIdx)) {
                            // inherited from rowSpan — show same color but no re-render text
                            const clr = COLOR_MAP[cell.colorTheme] || COLOR_MAP.slate;
                            return (
                              <td key={slotIdx} className={`px-1.5 py-2 text-center border-r border-slate-200 last:border-r-0 ${clr.bg}`}>
                              </td>
                            );
                          }
                          const clr = COLOR_MAP[cell.colorTheme] || COLOR_MAP.slate;
                          return (
                            <td key={slotIdx} className={`px-1.5 py-2 text-center border-r border-slate-200 last:border-r-0 ${clr.bg} border-l-2 ${clr.border}`}>
                              <div className={`font-bold ${clr.text} text-[9px] leading-tight`}>{cell.title}</div>
                              {cell.subtitle && <div className="text-[8px] text-slate-400 mt-0.5">{cell.subtitle}</div>}
                            </td>
                          );
                        }
                        return <td key={slotIdx} className="px-1.5 py-2 border-r border-slate-200 last:border-r-0" />;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Metrics bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-t border-slate-200 text-[10px] sm:text-xs font-bold">
            <span className="text-amber-600">⚡ Daily (Mon–Fri): 12.5 Hours</span>
            <span className="text-indigo-600">🌙 Saturday: 12.5 Hours</span>
            <span className="text-rose-600">🎯 Sunday Tests: 11.5 Hours</span>
            <span className="text-emerald-600 font-black">🔥 Total Weekly: 86.5 Hours / Week</span>
          </div>
        </div>

        {/* Info callout */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-amber-700 font-medium">
            <strong className="font-black">JSON Code Editor</strong> — paste or edit your timetable as structured JSON. Load presets for Prelims, Mains, or custom schedules instantly.
          </p>
        </div>
      </div>
    </section>
  );
}
