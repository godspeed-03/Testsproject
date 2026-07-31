'use client';

import { useState } from 'react';
import { PlusCircle, ChevronDown } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface UserProfileMenuProps {
  user: {
    email: string;
    [key: string]: any;
  };
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDailyLog = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-daily-log-modal'));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-medium text-xs shadow-sm">
          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col items-start hidden sm:flex text-left">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[140px] truncate">{user.email}</span>
          <span className="text-[10px] text-slate-500 font-medium">UPSC Aspirant</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-scale-up">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
              <p className="text-[10px] text-slate-500">Connected to Database</p>
            </div>

            <div className="py-1">
              <button
                onClick={handleOpenDailyLog}
                className="w-full px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 transition-colors text-left"
              >
                <PlusCircle size={15} className="text-amber-500" />
                <span>Log Today's Study</span>
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
              <div className="px-1">
                <LogoutButton />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
