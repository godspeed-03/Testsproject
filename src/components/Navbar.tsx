import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { User, LayoutDashboard, Compass } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let user = null;

  if (token) {
    user = verifyToken(token);
  }

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Compass size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
                UPSC Tracker
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-800 dark:text-slate-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.email}</span>
                    <span className="text-xs text-amber-500 dark:text-amber-400 font-extrabold tracking-wider">STUDENT</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200">
                    <User size={18} />
                  </div>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-primary text-sm px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                Sign In / Access Tracker
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
