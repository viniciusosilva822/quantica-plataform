import Link from 'next/link';
import { serverApi } from '@/lib/server-api';
import { nextLevelProgress } from '@plataforma/shared';

type ProgressResp = { xp: number; level: number; current: number; total: number };
type MantraResp = { mantra: { text: string; author?: string | null } | null };
type CheckinResp = { items: Array<{ date: string; mood: number; energy: number }>; streak: number };

export default async function Dashboard() {
  const [{ xp, level, current, total }, mantra, checkin] = await Promise.all([
    serverApi<ProgressResp>('/me/progress'),
    serverApi<MantraResp>('/mantra/today'),
    serverApi<CheckinResp>('/checkins'),
  ]);
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-white/60 text-sm uppercase tracking-wider">Mantra do dia</p>
        <p className="font-display text-2xl mt-2 leading-snug">
          “{mantra.mantra?.text ?? 'Hoje é um bom dia para começar.'}”
        </p>
        {mantra.mantra?.author && (
          <p className="text-white/50 text-sm mt-2">— {mantra.mantra.author}</p>
        )}
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-white/60 text-sm">Nível</p>
          <p className="font-display text-3xl mt-1">{level}</p>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-violet" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-white/50 mt-2">
            {current}/{total} XP para o próximo nível
          </p>
        </div>
        <div className="card">
          <p className="text-white/60 text-sm">XP total</p>
          <p className="font-display text-3xl mt-1">{xp}</p>
          <p className="text-xs text-white/50 mt-2">
            Nível {nextLevelProgress(xp).level}
          </p>
        </div>
        <div className="card">
          <p className="text-white/60 text-sm">Streak de check-in</p>
          <p className="font-display text-3xl mt-1">{checkin.streak} 🔥</p>
          <p className="text-xs text-white/50 mt-2">Continue diariamente para crescer.</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Comece por aqui</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashCard href="/app/checkin" emoji="🌅" title="Check-in quântico" sub="Registre humor e energia" />
          <DashCard href="/app/oraculo" emoji="🃏" title="Carta do dia" sub="Receba uma mensagem" />
          <DashCard href="/app/meditacoes" emoji="🧘" title="Meditar agora" sub="Player de áudios guiados" />
          <DashCard href="/app/respiracao" emoji="💨" title="Respiração guiada" sub="4-7-8, coerência cardíaca..." />
          <DashCard href="/app/diario" emoji="📓" title="Diário guiado" sub="Pergunta nova todos os dias" />
          <DashCard href="/app/roda" emoji="🎡" title="Roda da Vida" sub="Avalie suas 8 áreas" />
        </div>
      </section>
    </div>
  );
}

function DashCard({
  href,
  emoji,
  title,
  sub,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
}) {
  return (
    <Link href={href} className="card hover:bg-white/[0.07] transition block">
      <div className="text-3xl">{emoji}</div>
      <p className="font-display text-lg mt-2">{title}</p>
      <p className="text-white/60 text-sm">{sub}</p>
    </Link>
  );
}
