import { serverApi } from '@/lib/server-api';
import { nextLevelProgress } from '@plataforma/shared';

type ProgressResp = { xp: number; level: number; current: number; total: number };
type Badge = { id: string; code: string; name: string; description: string; emoji: string; earned: boolean };
type BadgesResp = { earned: unknown[]; all: Badge[] };

export default async function AchievementsPage() {
  const [prog, badges] = await Promise.all([
    serverApi<ProgressResp>('/me/progress'),
    serverApi<BadgesResp>('/me/badges'),
  ]);
  const pct = prog.total ? Math.round((prog.current / prog.total) * 100) : 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Conquistas</h1>
        <p className="text-white/60">Sua jornada em camadas.</p>
      </div>

      <section className="card">
        <p className="text-white/60 text-sm">Nível atual</p>
        <p className="font-display text-5xl mt-1">{prog.level}</p>
        <p className="text-white/50 text-sm">{prog.xp} XP totais</p>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-violet" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-white/50 mt-2">
          {prog.current}/{prog.total} XP para o próximo nível ({nextLevelProgress(prog.xp).level + 1})
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Badges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.all.map((b) => (
            <div
              key={b.id}
              className={`card ${b.earned ? '' : 'opacity-40 grayscale'}`}
            >
              <p className="text-4xl">{b.emoji}</p>
              <p className="font-display text-lg mt-2">{b.name}</p>
              <p className="text-white/60 text-sm mt-1">{b.description}</p>
              {b.earned && <p className="text-gold text-xs mt-2">✔ conquistada</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
