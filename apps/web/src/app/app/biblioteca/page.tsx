'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { libraryKinds } from '@plataforma/shared';

type Item = {
  id: string;
  title: string;
  description?: string | null;
  kind: string;
  url: string;
  coverUrl?: string | null;
  tags: string[];
};

const kindEmoji: Record<string, string> = {
  ebook: '📕',
  audio: '🎧',
  video: '🎬',
  artigo: '📝',
};

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [kind, setKind] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (kind) params.set('kind', kind);
    if (q) params.set('q', q);
    const r = await api<{ items: Item[] }>(`/library?${params.toString()}`);
    setItems(r.items);
  };
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [kind, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Biblioteca</h1>
        <p className="text-white/60">Conteúdos exclusivos para sua jornada.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setKind(null)} className={`pill ${!kind && 'bg-violet text-white'}`}>tudo</button>
        {libraryKinds.map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`pill ${kind === k && 'bg-violet text-white'}`}>
            {kindEmoji[k]} {k}
          </button>
        ))}
      </div>

      <input className="input" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => (
          <a key={i.id} href={i.url} target="_blank" className="card hover:bg-white/[0.07] block transition" rel="noreferrer">
            <p className="text-2xl">{kindEmoji[i.kind] ?? '📄'}</p>
            <p className="font-display text-lg mt-1">{i.title}</p>
            {i.description && <p className="text-white/60 text-sm mt-1">{i.description}</p>}
            <div className="flex flex-wrap gap-1 mt-3">
              {i.tags.map((t) => (
                <span key={t} className="pill text-xs">{t}</span>
              ))}
            </div>
          </a>
        ))}
        {items.length === 0 && <p className="text-white/50">Nada encontrado.</p>}
      </section>
    </div>
  );
}
