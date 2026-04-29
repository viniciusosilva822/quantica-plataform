'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { meditationCategories } from '@plataforma/shared';

type Meditation = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  durationSec: number;
  audioUrl: string;
  active: boolean;
};

export default function AdminMeditationsPage() {
  const [items, setItems] = useState<Meditation[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: meditationCategories[0] as typeof meditationCategories[number],
    durationSec: 600,
    audioUrl: '',
  });

  const load = async () => {
    const r = await api<{ items: Meditation[] }>('/admin/meditations');
    setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.title || !form.audioUrl) return;
    await api('/admin/meditations', {
      method: 'POST',
      body: { ...form, description: form.description || undefined },
    });
    setForm({ title: '', description: '', category: meditationCategories[0], durationSec: 600, audioUrl: '' });
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Arquivar?')) return;
    await api(`/admin/meditations/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-4">
      <section className="card grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof meditationCategories[number] })}>
          {meditationCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="input sm:col-span-2" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Duração (segundos)" type="number" value={form.durationSec} onChange={(e) => setForm({ ...form, durationSec: Number(e.target.value) })} />
        <input className="input" placeholder="URL do áudio" value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} />
        <button className="btn-primary sm:col-span-2" onClick={add}>Adicionar</button>
      </section>
      <ul className="space-y-2">
        {items.filter((i) => i.active).map((m) => (
          <li key={m.id} className="card flex justify-between items-start gap-3">
            <div>
              <p className="font-display">{m.title}</p>
              <p className="text-white/50 text-xs">{m.category} · {Math.round(m.durationSec / 60)} min</p>
            </div>
            <button onClick={() => remove(m.id)} className="text-rose text-xs">arquivar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
