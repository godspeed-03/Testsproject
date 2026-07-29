'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from 'lucide-react';

interface ShadcnDatePickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  disablePastDates?: boolean;
}

export default function ShadcnDatePicker({
  selectedDate,
  onSelectDate,
  disablePastDates = false,
}: ShadcnDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const parsedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return new Date();
    }
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  useEffect(() => {
    setViewYear(parsedDate.getFullYear());
    setViewMonth(parsedDate.getMonth());
  }, [parsedDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const changeDateByDays = (days: number) => {
    const d = new Date(parsedDate);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const targetStr = `${yyyy}-${mm}-${dd}`;
    if (disablePastDates && targetStr < todayStr) return;
    onSelectDate(targetStr);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formattedDisplay = format(parsedDate, 'PP');

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
        <button
          type="button"
          onClick={() => changeDateByDays(-1)}
          disabled={disablePastDates && selectedDate <= todayStr}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          title="Previous Day"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-amber-400 font-extrabold text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs transition-all"
        >
          <CalendarDays size={16} className="text-amber-500" />
          <span>{formattedDisplay}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => changeDateByDays(1)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          title="Next Day"
        >
          <ChevronRight size={16} />
        </button>

        {selectedDate !== todayStr && (
          <button
            type="button"
            onClick={() => {
              onSelectDate(todayStr);
              setIsOpen(false);
            }}
            className="ml-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-lg shadow-xs transition-colors shrink-0"
          >
            Today
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 space-y-3 animate-scale-up">
          <div className="flex items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => {
                onSelectDate(todayStr);
                setIsOpen(false);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-colors ${
                selectedDate === todayStr
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Today
            </button>
            {!disablePastDates && (
              <button
                type="button"
                onClick={() => {
                  changeDateByDays(-1);
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Yesterday
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                changeDateByDays(1);
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Tomorrow
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(dayNum).padStart(2, '0');
              const dateVal = `${viewYear}-${mm}-${dd}`;
              const isSelected = dateVal === selectedDate;
              const isToday = dateVal === todayStr;
              const isPast = dateVal < todayStr;

              return (
                <button
                  key={dateVal}
                  type="button"
                  disabled={disablePastDates && isPast}
                  onClick={() => {
                    onSelectDate(dateVal);
                    setIsOpen(false);
                  }}
                  className={`h-8 w-8 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white font-black shadow-xs scale-105'
                      : isToday
                      ? 'border border-amber-500/80 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10'
                      : disablePastDates && isPast
                      ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
