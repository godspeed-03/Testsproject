'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from 'lucide-react';

interface ShadcnDatePickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  disablePastDates?: boolean;
  placeholder?: string;
  isClearable?: boolean;
  alignRight?: boolean;
}

export default function ShadcnDatePicker({
  selectedDate,
  onSelectDate,
  disablePastDates = false,
  placeholder,
  isClearable = false,
  alignRight = false,
}: ShadcnDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const parsedDate = useMemo(() => {
    if (!selectedDate) return new Date();
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
    const base = selectedDate ? parsedDate : new Date();
    const d = new Date(base);
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

  const formattedDisplay = !selectedDate && placeholder ? placeholder : format(parsedDate, 'PP');

  // Intelligent positioning: on mobile screens (max-sm), align left to prevent bleeding off-screen to the left
  const popoverPositionClass = alignRight
    ? 'right-0 sm:right-0 max-sm:left-0 max-sm:right-auto'
    : 'left-0';

  return (
    <div className={`relative inline-block w-full ${isOpen ? 'z-[99999]' : 'z-30'}`} ref={popoverRef}>
      <div className="flex items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-[42px] flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-all outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary cursor-pointer truncate active:scale-95"
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarDays size={16} className="text-accent-primary shrink-0" />
            <span className={`truncate font-bold ${!selectedDate ? 'text-slate-400 dark:text-slate-500 font-medium' : ''}`}>
              {formattedDisplay}
            </span>
          </div>
          <ChevronDown size={15} className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-accent-primary' : ''}`} />
        </button>

        {(isClearable || placeholder) && selectedDate && (
          <button
            type="button"
            onClick={() => {
              onSelectDate('');
              setIsOpen(false);
            }}
            className="px-2.5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-xl shrink-0 cursor-pointer active:scale-95"
            title="Clear Date"
          >
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className={`absolute ${popoverPositionClass} mt-1.5 z-[9999] w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 animate-scale-up glass-panel`}>
          <div className="flex items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <button
              type="button"
              onClick={() => {
                onSelectDate(todayStr);
                setIsOpen(false);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-accent-gradient text-white shadow-xs'
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
                className="px-3 py-1 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
              className="px-3 py-1 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
          </div>

          <div className="flex items-center justify-between px-1 font-black">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-black text-xs font-display text-accent-primary">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider font-display">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-black">
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
                  className={`h-8 w-8 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent-gradient text-white font-black shadow-xs scale-105'
                      : isToday
                      ? 'border border-accent-primary text-accent-primary font-black hover:bg-accent-primary/10'
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
