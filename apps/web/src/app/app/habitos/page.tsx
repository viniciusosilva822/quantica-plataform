'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

type Habit = {
  id: string;
  name: string;
  emoji?: string | null;
  color?: string | null;
  toggles: { date: string }[];
};

export default function HabitsPage() {
  const [items, setItems] = useState<Habit[]>([]);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌱');

  const days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD'),
  );

  const load = async () => {
    const r = await api<{ items: Habit[] }>('/habits');
    setItems(r.items);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    await api('/habits', { method: 'POST', body: { name, emoji } });
    setName('');
    await load();
  };
  const toggle = async (habitId: string, date: string) => {
    await api(`/habits/${habitId}/toggle`, { method: 'POST', body: { date } });
    await load();
  };
  const remove = async (id: string) => {
    if (!confirm('Arquivar este hábito?')) return;
    await api(`/habits/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Tracker de hábitos</h1>
        <p className="text-white/60">Os 7 últimos dias.</p>
      </div>

      <section className="card flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Novo hábito</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: meditar pela manhã" />
        </div>
        <div>
          <label className="label">Emoji</label>
          <input className="input w-24 text-center" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
        </div>
        <button className="btn-primary" onClick={add}>Adicionar</button>
      </section>

      {items.length === 0 && <p className="text-white/50 text-sm">Crie seu primeiro hábito acima.</p>}

      {items.map((h) => {
        const set = new Set(h.toggles.map((t) => dayjs(t.date).format('YYYY-MM-DD')));
        return (
          <section key={h.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-lg">
                <span className="mr-2">{h.emoji ?? '🌱'}</span>
                {h.name}
              </p>
              <button onClick={() => remove(h.id)} className="text-white/40 hover:text-rose text-xs">
                arquivar
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => {
                const done = set.has(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggle(h.id, d)}
                    className={`aspect-square rounded-lg border text-xs flex flex-col items-center justify-center transition ${
                      done
                        ? 'bg-violet border-violet text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <span>{dayjs(d).format('ddd').slice(0, 3)}</span>
                    <span className="font-display text-base">{dayjs(d).format('D')}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
