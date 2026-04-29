'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/app', label: 'Início', emoji: '🌌' },
  { href: '/app/checkin', label: 'Check-in', emoji: '🌅' },
  { href: '/app/diario', label: 'Diário', emoji: '📓' },
  { href: '/app/habitos', label: 'Hábitos', emoji: '🌱' },
  { href: '/app/meditacoes', label: 'Meditações', emoji: '🧘' },
  { href: '/app/respiracao', label: 'Respiração', emoji: '💨' },
  { href: '/app/roda', label: 'Roda da Vida', emoji: '🎡' },
  { href: '/app/oraculo', label: 'Oráculo', emoji: '🃏' },
  { href: '/app/numerologia', label: 'Numerologia', emoji: '🔢' },
  { href: '/app/chakras', label: 'Chakras', emoji: '🌈' },
  { href: '/app/eneagrama', label: 'Eneagrama', emoji: '🧭' },
  { href: '/app/biblioteca', label: 'Biblioteca', emoji: '📚' },
  { href: '/app/lives', label: 'Lives', emoji: '🎥' },
  { href: '/app/comunidade', label: 'Comunidade', emoji: '💬' },
  { href: '/app/conquistas', label: 'Conquistas', emoji: '🏅' },
];

export function Sidebar({ role }: { role: 'STUDENT' | 'ADMIN' }) {
  const path = usePathname();
  return (
    <aside className="hidden md:flex flex-col bg-black/30 backdrop-blur-md border-r border-white/5 p-5 sticky top-0 h-screen">
      <Link href="/app" className="font-display text-2xl mb-6">
        Vida Quântica
      </Link>
      <nav className="flex-1 overflow-y-auto space-y-1 -mr-2 pr-2">
        {links.map((l) => {
          const active = path === l.href || path.startsWith(l.href + '/');
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active ? 'bg-violet/30 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
            >
              <span>{l.emoji}</span>
              <span>{l.label}</span>
            </Link>
          );
        })}
        {role === 'ADMIN' && (
          <Link
            href="/app/admin"
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition mt-4',
              path.startsWith('/app/admin')
                ? 'bg-gold/30 text-white'
                : 'text-gold/80 hover:bg-white/5',
            )}
          >
            <span>⚙️</span>
            <span>Admin</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
