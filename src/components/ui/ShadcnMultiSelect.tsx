"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ShadcnMultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  isLight?: boolean;
  isLoading?: boolean;
}

export default function ShadcnMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select topics...",
  label,
  className = "",
  isLight,
  isLoading = false,
}: ShadcnMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  const allSelected = options.length > 0 && options.every((opt) => selectedValues.includes(opt.value));
  const someSelected = selectedValues.length > 0;

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      // Unselect options currently in this set
      const optValues = new Set(options.map((o) => o.value));
      onChange(selectedValues.filter((v) => !optValues.has(v)));
    } else {
      const optValues = options.map((o) => o.value);
      const combined = Array.from(new Set([...selectedValues, ...optValues]));
      onChange(combined);
    }
  };

  const buttonStyle = isLight === true
    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"
    : "bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100";

  const dropdownStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-md";

  return (
    <div className={`relative inline-block w-full ${isOpen ? "z-[99999]" : "z-30"} ${className}`} ref={containerRef}>
      {label && (
        <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1 text-xs">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-black shadow-2xs transition-all duration-150 outline-none ${buttonStyle} focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer active:scale-95 disabled:opacity-75 disabled:cursor-wait`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin text-purple-500 shrink-0" />
              <span className="truncate font-bold text-slate-500 dark:text-slate-400">
                Loading topics from DB...
              </span>
            </>
          ) : someSelected ? (
            <>
              <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black shrink-0 shadow-2xs">
                {selectedValues.length} Selected
              </span>
              <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                {options
                  .filter((o) => selectedValues.includes(o.value))
                  .map((o) => o.label)
                  .join(", ")}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                {placeholder}
              </span>
            </>
          )}
        </div>

        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-purple-500 shrink-0" />
        ) : (
          <ChevronDown
            size={16}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-purple-500" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-[9999] w-full min-w-[240px] max-h-72 flex flex-col rounded-2xl border shadow-2xl p-2 animate-scale-up glass-panel ${dropdownStyle}`}
        >
          {/* Search bar inside dropdown */}
          <div className="relative mb-1.5 shrink-0">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Select / Deselect All header */}
          {options.length > 0 && (
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {filteredOptions.length} Topics
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-1 pr-0.5">
            {/* Custom topic creator option */}
            {search.trim() !== "" && !options.some((o) => o.value.toLowerCase() === search.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  toggleOption(search.trim());
                  setSearch("");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-left transition-all cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 mb-1.5"
              >
                <span>+ Add "{search.trim()}"</span>
                <span className="text-[10px] opacity-70 uppercase tracking-wider font-bold">Custom Topic</span>
              </button>
            )}

            {filteredOptions.length === 0 && search.trim() === "" ? (
              <div className="p-3 text-center text-xs text-slate-400 font-bold">
                No topics found in DB for this subject. Type above to add a new topic!
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-bold">
                No existing topics match "{search}". Click above to add it as custom topic!
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                      isChecked
                        ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 font-black border border-purple-500/30"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-black">{option.label}</div>
                      {option.sublabel && (
                        <div className="text-[10px] opacity-70 font-bold truncate">{option.sublabel}</div>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                      }`}
                    >
                      {isChecked && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
