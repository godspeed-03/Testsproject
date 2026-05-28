import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { LogOut, User, LayoutDashboard, Settings, BookOpen } from 'lucide-react';
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-foreground font-bold shadow-lg group-hover:scale-110 transition-transform">
                T
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                TestPlatform
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link href="/tests" className="text-foreground/90 hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium mr-4">
                    <BookOpen size={18} />
                    <span>Tests</span>
                  </Link>
                )}
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-foreground/90 hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-muted mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-foreground/90">{user.email}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{user.role}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-foreground/90">
                    <User size={18} />
                  </div>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-foreground/90 hover:text-foreground transition-colors text-sm font-medium px-3 py-2">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
