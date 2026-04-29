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

export default function AdminLivesPage() {
  const [items, setItems] = useState<Live[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    liveUrl: '',
    recordingUrl: '',
  });

  const load = async () => {
    const r = await api<{ items: Live[] }>('/admin/lives');
    setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.title || !form.scheduledAt) return;
    await api('/admin/lives', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description || undefined,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        liveUrl: form.liveUrl || undefined,
        recordingUrl: form.recordingUrl || undefined,
      },
    });
    setForm({ title: '', description: '', scheduledAt: '', liveUrl: '', recordingUrl: '' });
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Apagar?')) return;
    await api(`/admin/lives/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-4">
      <section className="card grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
        <input className="input sm:col-span-2" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="URL da live" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
        <input className="input" placeholder="URL da gravação" value={form.recordingUrl} onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })} />
        <button className="btn-primary sm:col-span-2" onClick={add}>Agendar</button>
      </section>

      <ul className="space-y-2">
        {items.map((l) => (
          <li key={l.id} className="card flex justify-between gap-3">
            <div>
              <p className="font-display">{l.title}</p>
              <p className="text-white/50 text-xs">{dayjs(l.scheduledAt).format('DD/MM/YYYY HH:mm')}</p>
            </div>
            <button onClick={() => remove(l.id)} className="text-rose text-xs">apagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
