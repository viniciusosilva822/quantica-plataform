'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export function Topbar({
  user,
}: {
  user: { name: string; email: string; xp: number; role: 'STUDENT' | 'ADMIN' };
}) {
  const router = useRouter();
  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };
  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
      <div className="md:hidden font-display text-xl">
        <Link href="/app">Vida Quântica</Link>
      </div>
      <div className="hidden md:block text-sm text-white/60">
        Olá, <span className="text-white">{user.name}</span> ✨
      </div>
      <div className="flex items-center gap-3">
        <span className="pill">⚡ {user.xp} XP</span>
        <button onClick={logout} className="text-sm text-white/60 hover:text-white">
          sair
        </button>
      </div>
    </header>
  );
}
