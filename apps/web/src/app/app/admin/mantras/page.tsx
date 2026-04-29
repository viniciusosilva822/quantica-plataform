'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Mantra = { id: string; text: string; author?: string | null; active: boolean };

export default function AdminMantrasPage() {
  const [items, setItems] = useState<Mantra[]>([]);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  const load = async () => {
    const r = await api<{ items: Mantra[] }>('/admin/mantras');
    setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    await api('/admin/mantras', { method: 'POST', body: { text, author: author || undefined } });
    setText(''); setAuthor('');
    await load();
  };
  const remove = async (id: string) => {
    if (!confirm('Apagar?')) return;
    await api(`/admin/mantras/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-4">
      <section className="card grid sm:grid-cols-3 gap-3">
        <input className="input sm:col-span-2" placeholder="Mantra" value={text} onChange={(e) => setText(e.target.value)} />
        <input className="input" placeholder="Autor (opcional)" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <button className="btn-primary sm:col-span-3" onClick={add}>Adicionar</button>
      </section>
      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m.id} className="card flex justify-between items-center">
            <div>
              <p>“{m.text}”</p>
              {m.author && <p className="text-white/50 text-xs mt-1">— {m.author}</p>}
            </div>
            <button onClick={() => remove(m.id)} className="text-rose text-xs">apagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
