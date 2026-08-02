'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Target, Menu, X, RotateCcw, Calendar, BookOpen, FileText, Clock, Zap, Plus } from 'lucide-react';
import UserProfileMenu from './UserProfileMenu';
import ThemeToggle from './ThemeToggle';
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

  const logoTarget = user ? '/tracker/agenda' : '/';

  return (
    <nav className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href={logoTarget} className="flex items-center gap-2.5 group">
              <BrandLogoIcon size="md" className="group-hover:scale-105" />
              <span className="font-extrabold font-display text-base tracking-tight text-slate-900 dark:text-slate-100">
                UPSC Tracker
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href === '/tracker' && pathname.startsWith('/tracker'));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-accent-gradient text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon size={14} strokeWidth={2.2} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {user ? (
              <UserProfileMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="text-xs px-5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white font-bold rounded-full shadow-md shadow-violet-500/25 transition-all"
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
              const isActive = pathname === link.href || (link.href === '/tracker' && pathname.startsWith('/tracker'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-[#7C3AED] dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80'
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
