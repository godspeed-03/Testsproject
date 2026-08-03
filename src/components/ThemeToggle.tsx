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
      className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 group ${
        isDark
          ? 'bg-slate-900/90 border-amber-500/30 text-amber-300 shadow-amber-500/10 hover:border-amber-400/50'
          : 'bg-amber-500/10 border-amber-400/40 text-amber-600 shadow-amber-200/40 hover:bg-amber-500/15'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Light/Dark Theme"
    >
      {isDark ? (
        <Moon size={18} strokeWidth={2.2} className="text-amber-400 fill-amber-400/25 group-hover:-rotate-12 transition-transform" />
      ) : (
        <Sun size={18} strokeWidth={2.2} className="text-amber-600 fill-amber-500/40 group-hover:rotate-45 transition-transform" />
      )}
    </button>
  );
}
