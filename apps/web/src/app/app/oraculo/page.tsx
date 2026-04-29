'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';
import type { OracleCard } from '@plataforma/shared';

type Draw = { id: string; date: string; cardId: number };

export default function OraclePage() {
  const [today, setToday] = useState<{ draw: Draw | null; card: OracleCard | null }>({ draw: null, card: null });
  const [history, setHistory] = useState<Array<Draw & { card: OracleCard | undefined }>>([]);
  const [drawing, setDrawing] = useState(false);

  const load = async () => {
    const [t, h] = await Promise.all([
      api<{ draw: Draw | null; card: OracleCard | null }>('/oracle/today'),
      api<{ items: Array<Draw & { card: OracleCard | undefined }> }>('/oracle/history'),
    ]);
    setToday(t);
    setHistory(h.items);
  };
  useEffect(() => { load(); }, []);

  const draw = async () => {
    setDrawing(true);
    try {
      const r = await api<{ draw: Draw; card: OracleCard }>('/oracle/draw', { method: 'POST' });
      setToday({ draw: r.draw, card: r.card });
      await load();
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Carta do dia</h1>
        <p className="text-white/60">Uma mensagem por dia. Sem repetir.</p>
      </div>

      <section className="card flex flex-col items-center py-10 text-center">
        {today.card ? (
          <>
            <div className="w-44 h-64 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center text-6xl shadow-2xl">
              ✶
            </div>
            <p className="text-xs uppercase tracking-widest text-gold mt-5">{today.card.keyword}</p>
            <p className="font-display text-2xl mt-1">{today.card.name}</p>
            <p className="max-w-md mt-4 text-white/80 leading-relaxed">{today.card.message}</p>
          </>
        ) : (
          <>
            <div
              onClick={draw}
              className="w-44 h-64 rounded-2xl bg-gradient-to-br from-nebula to-ink border border-white/20 flex items-center justify-center text-6xl shadow-2xl cursor-pointer hover:scale-105 transition"
            >
              🌑
            </div>
            <button className="btn-primary mt-6" disabled={drawing} onClick={draw}>
              {drawing ? 'Tirando...' : 'Tirar minha carta'}
            </button>
          </>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Suas últimas cartas</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {history.map((h) => (
            <div key={h.id} className="card">
              <p className="text-white/50 text-xs">{dayjs(h.date).format('DD/MM/YYYY')}</p>
              <p className="font-display text-lg mt-1">{h.card?.name}</p>
              <p className="text-xs text-gold uppercase">{h.card?.keyword}</p>
              <p className="text-white/70 text-sm mt-2 line-clamp-3">{h.card?.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
