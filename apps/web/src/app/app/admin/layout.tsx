import Link from 'next/link';
import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server-api';

const sections = [
  { href: '/app/admin', label: 'Métricas' },
  { href: '/app/admin/usuarios', label: 'Usuários' },
  { href: '/app/admin/mantras', label: 'Mantras' },
  { href: '/app/admin/prompts', label: 'Prompts' },
  { href: '/app/admin/meditacoes', label: 'Meditações' },
  { href: '/app/admin/biblioteca', label: 'Biblioteca' },
  { href: '/app/admin/lives', label: 'Lives' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let me;
  try {
    me = await serverApi<{ user: { role: string } | null }>('/auth/me');
  } catch {
    redirect('/login');
  }
  if (!me.user || me.user.role !== 'ADMIN') redirect('/app');

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Admin</h1>
      <nav className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="pill hover:bg-white/20">
            {s.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
