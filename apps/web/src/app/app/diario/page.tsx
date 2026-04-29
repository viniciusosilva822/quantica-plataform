'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

type Prompt = { id: string; text: string };
type Entry = { id: string; content: string; createdAt: string; prompt: Prompt | null };

export default function DiaryPage() {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, e] = await Promise.all([
      api<{ prompt: Prompt | null }>('/diary/prompt'),
      api<{ items: Entry[] }>('/diary/entries'),
    ]);
    setPrompt(p.prompt);
    setEntries(e.items);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await api('/diary/entries', {
        method: 'POST',
        body: { content, promptId: prompt?.id },
      });
      setContent('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await api(`/diary/entries/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Diário guiado</h1>
        <p className="text-white/60">Privado. Só você lê.</p>
      </div>

      <section className="card">
        <p className="text-white/60 text-sm uppercase tracking-wider">Pergunta de hoje</p>
        <p className="font-display text-2xl mt-2">{prompt?.text ?? 'Escreva o que vier ao coração.'}</p>
        <textarea
          className="input mt-4 min-h-[160px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Sua resposta..."
        />
        <button className="btn-primary mt-4" disabled={saving} onClick={save}>
          {saving ? 'Salvando...' : 'Salvar entrada'}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Histórico</h2>
        {entries.length === 0 && <p className="text-white/50 text-sm">Nada por aqui ainda.</p>}
        {entries.map((e) => (
          <div key={e.id} className="card">
            <div className="flex justify-between items-start gap-4">
              <p className="text-white/50 text-xs">
                {dayjs(e.createdAt).format('DD/MM/YYYY HH:mm')}
              </p>
              <button onClick={() => remove(e.id)} className="text-white/40 hover:text-rose text-xs">
                apagar
              </button>
            </div>
            {e.prompt && <p className="text-white/70 italic mt-2 text-sm">{e.prompt.text}</p>}
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{e.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
