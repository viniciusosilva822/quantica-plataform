'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

type Live = {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  liveUrl?: string | null;
  recordingUrl?: string | null;
};

export default function LivesPage() {
  const [upcoming, setUpcoming] = useState<Live[]>([]);
  const [past, setPast] = useState<Live[]>([]);

  useEffect(() => {
    api<{ upcoming: Live[]; past: Live[] }>('/lives').then((r) => {
      setUpcoming(r.upcoming);
      setPast(r.past);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Lives & encontros</h1>
        <p className="text-white/60">Confira o calendário e as gravações.</p>
      </div>

      <section>
        <h2 className="font-display text-xl mb-3">Próximas</h2>
        <div className="space-y-3">
          {upcoming.length === 0 && <p className="text-white/50 text-sm">Nada agendado por enquanto.</p>}
          {upcoming.map((l) => (
            <div key={l.id} className="card">
              <p className="text-xs uppercase tracking-wider text-violet">
                {dayjs(l.scheduledAt).format('DD/MM/YYYY HH:mm')}
              </p>
              <p className="font-display text-lg mt-1">{l.title}</p>
              {l.description && <p className="text-white/60 text-sm mt-1">{l.description}</p>}
              {l.liveUrl && (
                <a href={l.liveUrl} target="_blank" className="btn-primary mt-3 inline-flex" rel="noreferrer">
                  Entrar na live
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Gravações anteriores</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {past.length === 0 && <p className="text-white/50 text-sm">Sem gravações ainda.</p>}
          {past.map((l) => (
            <div key={l.id} className="card">
              <p className="text-xs text-white/50">{dayjs(l.scheduledAt).format('DD/MM/YYYY')}</p>
              <p className="font-display text-lg mt-1">{l.title}</p>
              {l.recordingUrl && (
                <a href={l.recordingUrl} target="_blank" className="btn-ghost mt-3 inline-flex text-sm" rel="noreferrer">
                  ▶ Assistir
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
