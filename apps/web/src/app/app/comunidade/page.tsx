'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';
import { postKinds, reactionKinds } from '@plataforma/shared';

type Post = {
  id: string;
  kind: 'gratidao' | 'conquista' | 'reflexao';
  content: string;
  createdAt: string;
  user: { id: string; name: string };
  reactions: { kind: string; userId: string }[];
};

const kindEmoji: Record<string, string> = {
  gratidao: '🙏',
  conquista: '🏆',
  reflexao: '💭',
};
const reactionEmoji: Record<string, string> = {
  coracao: '❤️',
  estrela: '⭐',
  oracao: '🙏',
  forca: '💪',
};

export default function CommunityPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [kind, setKind] = useState<typeof postKinds[number]>('gratidao');
  const [content, setContent] = useState('');

  const load = async () => {
    const r = await api<{ items: Post[] }>('/community/posts');
    setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!content.trim()) return;
    await api('/community/posts', { method: 'POST', body: { kind, content } });
    setContent('');
    await load();
  };

  const react = async (id: string, k: string) => {
    await api(`/community/posts/${id}/react`, { method: 'POST', body: { kind: k } });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Comunidade</h1>
        <p className="text-white/60">Mural de gratidão, conquistas e reflexões.</p>
      </div>

      <section className="card space-y-3">
        <div className="flex gap-2">
          {postKinds.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`pill ${kind === k ? 'bg-violet text-white' : ''}`}
            >
              {kindEmoji[k]} {k}
            </button>
          ))}
        </div>
        <textarea
          className="input min-h-[100px]"
          placeholder="Compartilhe..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn-primary" onClick={post}>Publicar</button>
      </section>

      <section className="space-y-3">
        {items.map((p) => {
          const counts: Record<string, number> = {};
          p.reactions.forEach((r) => {
            counts[r.kind] = (counts[r.kind] ?? 0) + 1;
          });
          return (
            <div key={p.id} className="card">
              <div className="flex items-center gap-2 text-sm">
                <span>{kindEmoji[p.kind]}</span>
                <span className="font-medium">{p.user.name}</span>
                <span className="text-white/40">{dayjs(p.createdAt).format('DD/MM HH:mm')}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{p.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {reactionKinds.map((k) => (
                  <button
                    key={k}
                    onClick={() => react(p.id, k)}
                    className="pill hover:bg-white/20"
                  >
                    {reactionEmoji[k]} {counts[k] ?? 0}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-white/50 text-sm">Seja o primeiro a publicar.</p>}
      </section>
    </div>
  );
}
