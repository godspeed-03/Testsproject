'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Target, Menu, X, RotateCcw, Calendar, BookOpen, FileText, Clock, Zap, Plus } from 'lucide-react';
import UserProfileMenu from './UserProfileMenu';

interface NavbarClientProps {
  user: {
    email: string;
    [key: string]: any;
  } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenCreateModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-create-modal'));
    }
    if (pathname !== '/tracker' && !pathname.startsWith('/tracker')) {
      router.push('/tracker?create=true');
    }
  };

  const navLinks = [
    { name: 'Habits & Tasks', href: '/tracker', icon: Target },
    { name: 'Syllabus Matrix', href: '/syllabus', icon: BookOpen },
    { name: 'Tests & PYQs', href: '/tests', icon: FileText },
    { name: 'Master Routine', href: '/routine', icon: Clock }
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/tracker" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Target size={18} />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                UPSC Tracker
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
                >
                  <Plus size={15} />
                  <span>Log Task / Habit</span>
                </button>
                <UserProfileMenu user={user} />
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-lg shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-2 space-y-1 animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={15} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
