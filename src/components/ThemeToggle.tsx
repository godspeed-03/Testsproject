'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasDarkClass = document.documentElement.classList.contains('dark');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && hasDarkClass)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-2 font-black text-xs shadow-sm hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-900 border-amber-500/40 text-amber-300 shadow-amber-500/10'
          : 'bg-amber-50 border-amber-300 text-amber-800 shadow-amber-200/50'
      }`}
      title={isDark ? 'Currently in Dark Mode. Click to switch to Light.' : 'Currently in Light Mode. Click to switch to Dark.'}
      aria-label="Toggle Light/Dark Theme"
    >
      {isDark ? (
        <>
          <Moon size={15} className="text-amber-400 fill-amber-400/20 animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 font-display">Dark</span>
        </>
      ) : (
        <>
          <Sun size={15} className="text-amber-600 fill-amber-500/30" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 font-display">Light</span>
        </>
      )}
    </button>
  );
}
