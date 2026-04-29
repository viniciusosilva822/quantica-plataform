'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { meditationCategories } from '@plataforma/shared';

type Meditation = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  durationSec: number;
  audioUrl: string;
  coverUrl?: string | null;
};

type Stats = { totalMinutes: number; totalSessions: number; uniqueDays: number };

export default function MeditationsPage() {
  const [items, setItems] = useState<Meditation[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [active, setActive] = useState<Meditation | null>(null);
  const startRef = useRef<number>(0);
  const loggedRef = useRef<string | null>(null);

  const load = async () => {
    const [list, st] = await Promise.all([
      api<{ items: Meditation[] }>(`/meditations${filter ? `?category=${filter}` : ''}`),
      api<Stats>('/meditations/stats'),
    ]);
    setItems(list.items);
    setStats(st);
  };
  useEffect(() => {
    load();
  }, [filter]);

  const onPlay = (m: Meditation) => {
    setActive(m);
    startRef.current = Date.now();
    loggedRef.current = null;
  };

  const onEnded = async (m: Meditation) => {
    if (loggedRef.current === m.id) return;
    loggedRef.current = m.id;
    const elapsed = Math.max(30, Math.round((Date.now() - startRef.current) / 1000));
    await api('/meditations/log', {
      method: 'POST',
      body: { meditationId: m.id, durationSec: Math.min(elapsed, m.durationSec) },
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Meditações</h1>
        <p className="text-white/60">Encontre a frequência do momento.</p>
      </div>

      {stats && (
        <section className="grid sm:grid-cols-3 gap-4">
          <div className="card"><p className="text-white/60 text-sm">Minutos totais</p><p className="font-display text-3xl">{stats.totalMinutes}</p></div>
          <div className="card"><p className="text-white/60 text-sm">Sessões</p><p className="font-display text-3xl">{stats.totalSessions}</p></div>
          <div className="card"><p className="text-white/60 text-sm">Dias únicos</p><p className="font-display text-3xl">{stats.uniqueDays}</p></div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter(null)} className={`pill ${!filter && 'bg-violet text-white'}`}>todas</button>
        {meditationCategories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`pill ${filter === c && 'bg-violet text-white'}`}>{c}</button>
        ))}
      </div>

      <section className="grid sm:grid-cols-2 gap-4">
        {items.map((m) => (
          <div key={m.id} className="card">
            <p className="text-xs text-violet uppercase tracking-wide">{m.category}</p>
            <p className="font-display text-lg mt-1">{m.title}</p>
            {m.description && <p className="text-white/60 text-sm mt-1">{m.description}</p>}
            <p className="text-white/40 text-xs mt-2">⏱ {Math.round(m.durationSec / 60)} min</p>
            <button className="btn-primary mt-3 text-sm" onClick={() => onPlay(m)}>
              ▶ Tocar
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/50 text-sm">Nada por aqui ainda.</p>}
      </section>

      {active && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-violet">Tocando</p>
              <p className="font-display">{active.title}</p>
            </div>
            <audio
              autoPlay
              controls
              src={active.audioUrl}
              onEnded={() => onEnded(active)}
              onPause={(e) => {
                const a = e.currentTarget;
                if (a.currentTime >= active.durationSec - 1) onEnded(active);
              }}
              className="w-72"
            />
            <button onClick={() => setActive(null)} className="text-white/60 hover:text-white">
              fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
