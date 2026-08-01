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

  // Default to adaptive tailwind dark/light classes matching form inputs
  const buttonStyle = isLight === true
    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"
    : isLight === false
    ? "bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
    : "bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100";

  const dropdownStyle = isLight === true
    ? "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl";

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold shadow-2xs transition-all duration-150 outline-none ${buttonStyle} focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer`}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.icon}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-purple-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-full min-w-50 max-h-60 overflow-y-auto custom-scrollbar rounded-xl border shadow-2xl p-1.5 animate-scale-up ${dropdownStyle}`}
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 font-extrabold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon}
                  <div>
                    <div>{option.label}</div>
                    {option.sublabel && <div className="text-[10px] opacity-60 font-semibold">{option.sublabel}</div>}
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-purple-500 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
