'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface ShadcnTimePickerProps {
  value: string; // 24-hr format "HH:mm", e.g. "08:00"
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  isLight?: boolean;
}

export default function ShadcnTimePicker({
  value = '08:00',
  onChange,
  disabled = false,
  className = '',
  isLight = true,
}: ShadcnTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'hours' | 'minutes'>('hours');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse 24h string into 12h components
  const parseTime = (timeStr: string) => {
    let [hStr, mStr] = (timeStr || '08:00').split(':');
    let h = parseInt(hStr || '8', 10);
    let m = parseInt(mStr || '0', 10);

    const isPm = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { h24: h, h12, min: m, isPm };
  };

  const { h12, min, isPm } = parseTime(value);

  const formatDisplayTime = () => {
    const formattedHour = String(h12).padStart(2, '0');
    const formattedMin = String(min).padStart(2, '0');
    const ampm = isPm ? 'PM' : 'AM';
    return `${formattedHour}:${formattedMin} ${ampm}`;
  };

  // Convert 12h + min + isPm back to 24h "HH:mm"
  const updateTime = (newH12: number, newMin: number, newIsPm: boolean) => {
    let h24 = newH12;
    if (newIsPm) {
      if (newH12 < 12) h24 = newH12 + 12;
    } else {
      if (newH12 === 12) h24 = 0;
    }
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(newMin).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const quickPresets = [
    { label: '06:00 AM', val: '06:00' },
    { label: '08:00 AM', val: '08:00' },
    { label: '09:00 AM', val: '09:00' },
    { label: '02:00 PM', val: '14:00' },
    { label: '06:00 PM', val: '18:00' },
    { label: '09:00 PM', val: '21:00' },
  ];

  // Hours 1 to 12
  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Minutes 0 to 55 by 5s
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Hand angle calculation
  const handAngle =
    pickerMode === 'hours'
      ? (h12 % 12) * 30
      : (min % 60) * 6;

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs sm:text-sm font-extrabold shadow-2xs transition-all duration-150 outline-none disabled:opacity-50 ${
          isLight
            ? 'bg-slate-50 hover:bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
            : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Clock size={16} className="text-indigo-500 shrink-0" />
          <span>{formatDisplayTime()}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-72 rounded-3xl border shadow-2xl p-4 animate-scale-up space-y-3 ${
            isLight
              ? 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900 shadow-indigo-950/15'
              : 'bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-100 shadow-black/90'
          }`}
        >
          {/* Header Digital Time Display */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPickerMode('hours')}
                className={`text-2xl font-black px-2 py-0.5 rounded-xl transition-all ${
                  pickerMode === 'hours'
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-indigo-500/20'
                }`}
              >
                {String(h12).padStart(2, '0')}
              </button>
              <span className="text-xl font-black text-indigo-500 animate-pulse">:</span>
              <button
                type="button"
                onClick={() => setPickerMode('minutes')}
                className={`text-2xl font-black px-2 py-0.5 rounded-xl transition-all ${
                  pickerMode === 'minutes'
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-indigo-500/20'
                }`}
              >
                {String(min).padStart(2, '0')}
              </button>
            </div>

            {/* AM/PM Switcher */}
            <div className="flex flex-col gap-1 p-0.5 rounded-xl bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => updateTime(h12, min, false)}
                className={`px-2.5 py-1 rounded-lg text-3xs font-black transition-all ${
                  !isPm ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => updateTime(h12, min, true)}
                className={`px-2.5 py-1 rounded-lg text-3xs font-black transition-all ${
                  isPm ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between text-2xs font-extrabold text-slate-400 px-1">
            <span>Select {pickerMode === 'hours' ? 'Hour' : 'Minute'}</span>
            <button
              type="button"
              onClick={() => setPickerMode(pickerMode === 'hours' ? 'minutes' : 'hours')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-black"
            >
              Switch to {pickerMode === 'hours' ? 'Minutes' : 'Hours'}
            </button>
          </div>

          {/* Mobile-Style Circular Analog Clock Dial */}
          <div className="flex justify-center py-1">
            <div className="relative w-52 h-52 rounded-full bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-inner flex items-center justify-center select-none overflow-hidden">
              {/* Center Dot */}
              <div className="absolute z-20 w-3.5 h-3.5 rounded-full bg-indigo-600 shadow-md border-2 border-white dark:border-slate-900" />

              {/* Rotating Clock Hand */}
              <div
                className="absolute z-10 bottom-1/2 left-1/2 -ml-0.5 w-1 bg-indigo-600 origin-bottom transition-transform duration-300 ease-out"
                style={{
                  height: '75px',
                  transform: `rotate(${handAngle}deg)`,
                }}
              >
                {/* Hand Tip Circle */}
                <div className="absolute -top-3.5 -left-3.5 w-8 h-8 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-lg shadow-indigo-600/50 flex items-center justify-center text-white font-black text-xs" />
              </div>

              {/* Dial Numbers */}
              {(pickerMode === 'hours' ? hoursList : minutesList).map((num, idx) => {
                // Angle formula: 12 is at top (-90deg), step 30deg
                const angleDeg = idx * 30 - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const radius = 75; // px from center
                const x = 104 + radius * Math.cos(angleRad) - 16;
                const y = 104 + radius * Math.sin(angleRad) - 16;

                const isSelected =
                  pickerMode === 'hours'
                    ? h12 === num
                    : min === num;

                return (
                  <button
                    key={num}
                    type="button"
                    style={{ left: `${x}px`, top: `${y}px` }}
                    onClick={() => {
                      if (pickerMode === 'hours') {
                        updateTime(num, min, isPm);
                        setPickerMode('minutes'); // Auto-advance to minutes
                      } else {
                        updateTime(h12, num, isPm);
                      }
                    }}
                    className={`absolute z-30 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isSelected
                        ? 'text-white scale-110'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-500/20 hover:scale-110'
                    }`}
                  >
                    {pickerMode === 'minutes' ? String(num).padStart(2, '0') : num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            {quickPresets.map((p) => {
              const isSelected = value === p.val;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => {
                    onChange(p.val);
                    setIsOpen(false);
                  }}
                  className={`py-1 rounded-xl text-3xs font-extrabold transition-all text-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Confirm Time
          </button>
        </div>
      )}
    </div>
  );
}
