'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-muted"
      title="Logout"
    >
      <LogOut size={18} />
    </button>
  );
}
