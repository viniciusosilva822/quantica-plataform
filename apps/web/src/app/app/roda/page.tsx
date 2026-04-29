'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { wheelAreas, wheelLabels } from '@plataforma/shared';

type WheelEntry = { id: string; createdAt: string; scores: Record<string, number> };

const initial = Object.fromEntries(wheelAreas.map((a) => [a, 5])) as Record<string, number>;

export default function WheelPage() {
  const [scores, setScores] = useState<Record<string, number>>(initial);
  const [items, setItems] = useState<WheelEntry[]>([]);

  const load = async () => {
    const r = await api<{ items: WheelEntry[] }>('/wheel');
    setItems(r.items);
    if (r.items.length) setScores(r.items[0].scores as Record<string, number>);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api('/wheel', { method: 'POST', body: { scores } });
    await load();
  };

  const data = wheelAreas.map((a) => ({
    area: wheelLabels[a],
    valor: scores[a] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Roda da Vida</h1>
        <p className="text-white/60">Avalie cada área de 0 a 10.</p>
      </div>

      <section className="card grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {wheelAreas.map((a) => (
            <div key={a}>
              <div className="flex justify-between text-sm">
                <span>{wheelLabels[a]}</span>
                <span className="text-white/60">{scores[a]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={scores[a]}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [a]: Number(e.target.value) }))
                }
                className="w-full accent-violet"
              />
            </div>
          ))}
          <button className="btn-primary mt-3" onClick={save}>Salvar entrada</button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#fff', fontSize: 11 }} />
              <Radar dataKey="valor" stroke="#facc15" fill="#facc15" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Histórico</h2>
        {items.length === 0 && <p className="text-white/50 text-sm">Nada salvo ainda.</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it) => (
            <div key={it.id} className="card text-sm">
              <p className="text-white/50 text-xs mb-2">{dayjs(it.createdAt).format('DD/MM/YYYY')}</p>
              {wheelAreas.map((a) => (
                <div key={a} className="flex justify-between">
                  <span className="text-white/70">{wheelLabels[a]}</span>
                  <span>{(it.scores as Record<string, number>)[a]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
