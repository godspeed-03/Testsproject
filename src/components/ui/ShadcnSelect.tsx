"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface ShadcnSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  isLight?: boolean;
}

export default function ShadcnSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className = "",
  isLight,
}: ShadcnSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const buttonStyle = isLight === true
    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"
    : "bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100";

  const dropdownStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-md";

  return (
    <div className={`relative inline-block w-full z-30 ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-black shadow-2xs transition-all duration-150 outline-none ${buttonStyle} focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary cursor-pointer active:scale-95`}
      >
        <span className="truncate flex items-center gap-2 font-bold">
          {selectedOption?.icon}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-accent-primary" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-[9999] w-full min-w-[220px] max-h-64 overflow-y-auto custom-scrollbar rounded-2xl border shadow-2xl p-1.5 animate-scale-up glass-panel ${dropdownStyle}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black border border-amber-500/30"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {option.icon}
                  <div className="truncate">
                    <div className="truncate font-black">{option.label}</div>
                    {option.sublabel && <div className="text-[10px] opacity-70 font-bold truncate">{option.sublabel}</div>}
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-amber-500 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
