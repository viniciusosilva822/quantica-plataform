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
  tags: string[];
};

export default function AdminLibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    kind: libraryKinds[0] as typeof libraryKinds[number],
    url: '',
    tags: '',
  });

  const load = async () => {
    const r = await api<{ items: Item[] }>('/admin/library');
    setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.title || !form.url) return;
    await api('/admin/library', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description || undefined,
        kind: form.kind,
        url: form.url,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      },
    });
    setForm({ title: '', description: '', kind: libraryKinds[0], url: '', tags: '' });
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Apagar?')) return;
    await api(`/admin/library/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-4">
      <section className="card grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as typeof libraryKinds[number] })}>
          {libraryKinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input className="input sm:col-span-2" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input className="input" placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <button className="btn-primary sm:col-span-2" onClick={add}>Adicionar</button>
      </section>

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="card flex justify-between gap-3">
            <div>
              <p className="font-display">{i.title}</p>
              <p className="text-white/50 text-xs">{i.kind}</p>
            </div>
            <button onClick={() => remove(i.id)} className="text-rose text-xs">apagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
