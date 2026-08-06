'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, FileText, PlusCircle, Timer, CalendarDays } from 'lucide-react';
import UserProfileMenu from './UserProfileMenu';
import BrandLogoIcon from './BrandLogoIcon';

interface NavbarClientProps {
  user: {
    email: string;
    [key: string]: any;
  } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleOpenCreateModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-create-modal'));
    }
    if (pathname !== '/tracker' && !pathname.startsWith('/tracker')) {
      router.push('/tracker?create=true');
    }
  };

  const logoTarget = user ? '/tracker/agenda' : '/';

  return (
    <nav className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1480px] mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link href={logoTarget} className="flex items-center gap-2 group">
              <BrandLogoIcon size="md" className="group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline-block font-extrabold font-display text-base tracking-tight text-slate-900 dark:text-slate-100">
                UPSC Tracker
              </span>
            </Link>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink py-0.5">
            {user && (
              <>
                {/* Log Task / Habit Shortcut Icon */}
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="w-9 h-9 sm:w-9 sm:h-9 shrink-0 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 group bg-amber-500/10 border-amber-500/30 dark:border-amber-400/30 text-amber-600 dark:text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/20 hover:shadow-md cursor-pointer"
                  title="Log Task / Habit"
                  aria-label="Log Task / Habit"
                >
                  <PlusCircle size={18} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Syllabus Matrix Shortcut Icon */}
                <Link
                  href="/syllabus"
                  className={`w-9 h-9 sm:w-9 sm:h-9 shrink-0 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 group ${
                    pathname === '/syllabus'
                      ? 'bg-purple-600 text-white border-transparent shadow-purple-500/20'
                      : 'bg-purple-500/10 border-purple-500/30 dark:border-purple-400/30 text-purple-600 dark:text-purple-400 hover:border-purple-500/60 hover:bg-purple-500/20 hover:shadow-md'
                  }`}
                  title="Syllabus Matrix"
                  aria-label="Syllabus Matrix"
                >
                  <BookOpen size={18} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
                </Link>

                {/* Timetable / Master Routine Shortcut Icon */}
                <Link
                  href="/routine"
                  className={`w-9 h-9 sm:w-9 sm:h-9 shrink-0 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 group ${
                    pathname === '/routine'
                      ? 'bg-cyan-600 text-white border-transparent shadow-cyan-500/20'
                      : 'bg-cyan-500/10 border-cyan-500/30 dark:border-cyan-400/30 text-cyan-600 dark:text-cyan-400 hover:border-cyan-500/60 hover:bg-cyan-500/20 hover:shadow-md'
                  }`}
                  title="Timetable / Master Routine"
                  aria-label="Timetable / Master Routine"
                >
                  <CalendarDays size={18} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
                </Link>

                {/* Tests & PYQs Log Shortcut Icon */}
                <Link
                  href="/tests"
                  className={`w-9 h-9 sm:w-9 sm:h-9 shrink-0 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 group ${
                    pathname === '/tests'
                      ? 'bg-emerald-600 text-white border-transparent shadow-emerald-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/20 hover:shadow-md'
                  }`}
                  title="Tests & PYQs Log"
                  aria-label="Tests & PYQs Log"
                >
                  <FileText size={18} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
                </Link>

                {/* Focus Timer Shortcut Icon */}
                <Link
                  href="/tracker/focus"
                  className={`relative w-9 h-9 sm:w-9 sm:h-9 shrink-0 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 group ${
                    pathname === '/tracker/focus'
                      ? 'bg-accent-gradient text-white border-transparent shadow-neon-glow'
                      : 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border-indigo-500/30 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500/60 hover:shadow-md'
                  }`}
                  title="Focus Timer Shortcut"
                  aria-label="Focus Timer Shortcut"
                >
                  <Timer size={18} strokeWidth={2.2} className="group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-1 right-1 flex h-2 w-2 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Profile Menu (Outside overflow container so dropdown never gets clipped on mobile) */}
          <div className="flex items-center shrink-0 pl-1">
            {user ? (
              <UserProfileMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="text-xs px-5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white font-bold rounded-full shadow-md shadow-violet-500/25 transition-all shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
