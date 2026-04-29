'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  access: { status: string } | null;
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [info, setInfo] = useState<string | null>(null);

  const load = async () => {
    const r = await api<{ items: User[] }>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setItems(r.items);
  };
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [q]);

  const grant = async () => {
    const r = await api<{ tempPassword: string | null }>('/admin/users/grant', {
      method: 'POST',
      body: { email: grantEmail, name: grantName || undefined },
    });
    setInfo(
      r.tempPassword
        ? `Acesso liberado. Senha temporária: ${r.tempPassword}`
        : 'Acesso reativado.',
    );
    setGrantEmail(''); setGrantName('');
    await load();
  };

  const revoke = async (id: string) => {
    if (!confirm('Bloquear acesso?')) return;
    await api(`/admin/users/${id}/revoke`, { method: 'POST' });
    await load();
  };
  const reactivate = async (id: string) => {
    await api(`/admin/users/${id}/reactivate`, { method: 'POST' });
    await load();
  };

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="font-display text-xl">Liberar acesso manualmente</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input className="input" placeholder="E-mail" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
          <input className="input" placeholder="Nome (opcional)" value={grantName} onChange={(e) => setGrantName(e.target.value)} />
          <button className="btn-primary" onClick={grant}>Liberar</button>
        </div>
        {info && <p className="text-gold text-sm">{info}</p>}
      </section>

      <input className="input" placeholder="Buscar por nome/e-mail..." value={q} onChange={(e) => setQ(e.target.value)} />

      <table className="w-full text-sm card">
        <thead className="text-white/60 text-left">
          <tr>
            <th className="py-2">Nome</th>
            <th>E-mail</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t border-white/5">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.access?.status ?? '—'}</td>
              <td className="text-right">
                {u.access?.status === 'ACTIVE' ? (
                  <button onClick={() => revoke(u.id)} className="text-rose hover:underline text-xs">bloquear</button>
                ) : (
                  <button onClick={() => reactivate(u.id)} className="text-gold hover:underline text-xs">reativar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
