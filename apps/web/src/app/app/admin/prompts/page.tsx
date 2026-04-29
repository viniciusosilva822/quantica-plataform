'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Prompt = { id: string; text: string };

export default function AdminPromptsPage() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    const r = await api<{ items: Prompt[] }>('/admin/prompts');
    setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    await api('/admin/prompts', { method: 'POST', body: { text } });
    setText('');
    await load();
  };
  const remove = async (id: string) => {
    if (!confirm('Apagar?')) return;
    await api(`/admin/prompts/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-4">
      <section className="card flex gap-3">
        <input className="input flex-1" placeholder="Pergunta de diário" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary" onClick={add}>Adicionar</button>
      </section>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="card flex justify-between">
            <p>{p.text}</p>
            <button onClick={() => remove(p.id)} className="text-rose text-xs">apagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
