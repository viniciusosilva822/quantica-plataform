'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';

type Checkin = { id: string; date: string; mood: number; energy: number; note?: string | null };

export default function CheckinPage() {
  const [items, setItems] = useState<Checkin[]>([]);
  const [streak, setStreak] = useState(0);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayDone, setTodayDone] = useState(false);

  const load = async () => {
    const r = await api<{ items: Checkin[]; streak: number }>('/checkins');
    setItems(r.items);
    setStreak(r.streak);
    const today = dayjs().format('YYYY-MM-DD');
    const todayItem = r.items.find((i) => dayjs(i.date).format('YYYY-MM-DD') === today);
    if (todayItem) {
      setMood(todayItem.mood);
      setEnergy(todayItem.energy);
      setNote(todayItem.note ?? '');
      setTodayDone(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api('/checkins', { method: 'POST', body: { mood, energy, note: note || undefined } });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const chartData = [...items]
    .reverse()
    .slice(-30)
    .map((i) => ({
      date: dayjs(i.date).format('DD/MM'),
      humor: i.mood,
      energia: i.energy,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Check-in quântico</h1>
        <p className="text-white/60">Como você está agora? Streak: {streak} 🔥</p>
      </div>

      <section className="card space-y-5">
        <ScaleRow label="Humor" value={mood} onChange={setMood} />
        <ScaleRow label="Energia" value={energy} onChange={setEnergy} />
        <div>
          <label className="label">Uma palavra ou frase (opcional)</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </div>
        <button className="btn-primary" disabled={saving} onClick={submit}>
          {saving ? 'Salvando...' : todayDone ? 'Atualizar check-in de hoje' : 'Registrar check-in'}
        </button>
      </section>

      <section className="card">
        <h2 className="font-display text-xl mb-4">Últimos 30 dias</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" fontSize={11} />
              <YAxis domain={[1, 5]} stroke="#ffffff80" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1530', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Line type="monotone" dataKey="humor" stroke="#facc15" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energia" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="label">
        {label}: <span className="text-white">{value}</span>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-3 rounded-xl border transition ${
              value === n
                ? 'bg-violet border-violet text-white'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
