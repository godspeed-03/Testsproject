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
  isLight = true,
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

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold shadow-2xs transition-all duration-150 outline-none ${
          isLight
            ? "bg-slate-50 hover:bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            : "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        }`}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.icon}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-full min-w-50 max-h-60 overflow-y-auto custom-scrollbar rounded-xl border shadow-2xl p-1.5 animate-scale-up ${
            isLight
              ? "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
              : "bg-slate-900 border-slate-700 text-slate-100 shadow-black/60"
          }`}
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-left transition-colors ${
                  isSelected
                    ? isLight
                      ? "bg-amber-500/10 text-amber-900 font-extrabold"
                      : "bg-amber-500/20 text-amber-300 font-extrabold"
                    : isLight
                      ? "hover:bg-slate-100 text-slate-700"
                      : "hover:bg-slate-800 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon}
                  <div>
                    <div>{option.label}</div>
                    {option.sublabel && <div className="text-[10px] opacity-60 font-semibold">{option.sublabel}</div>}
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
