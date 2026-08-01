'use client';

import { useState } from 'react';
import { ChevronDown, PlusCircle } from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfileMenuProps {
  user: {
    email: string;
    [key: string]: any;
  };
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenCreate = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-create-modal'));
    }
    if (pathname !== '/tracker' && !pathname.startsWith('/tracker')) {
      router.push('/tracker?create=true');
    }
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

            <div className="py-1 px-1 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              >
                <PlusCircle size={15} />
                <span>Log Task / Habit</span>
              </button>
            </div>

            <div className="py-1 px-1">
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
