import { serverApi } from '@/lib/server-api';

type Metrics = {
  counts: {
    users: number;
    active: number;
    refunded: number;
    checkinsToday: number;
    meditationsToday: number;
    posts: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    access: { status: string } | null;
  }>;
};

export default async function AdminDash() {
  const m = await serverApi<Metrics>('/admin/metrics');
  return (
    <div className="space-y-6">
      <section className="grid sm:grid-cols-3 gap-4">
        <Box label="Usuários" value={m.counts.users} />
        <Box label="Ativos" value={m.counts.active} />
        <Box label="Reembolsados" value={m.counts.refunded} />
        <Box label="Check-ins hoje" value={m.counts.checkinsToday} />
        <Box label="Meditações hoje" value={m.counts.meditationsToday} />
        <Box label="Posts" value={m.counts.posts} />
      </section>

      <section className="card">
        <h2 className="font-display text-xl mb-3">Últimos cadastros</h2>
        <table className="w-full text-sm">
          <thead className="text-white/60 text-left">
            <tr>
              <th className="py-2">Nome</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Criado</th>
            </tr>
          </thead>
          <tbody>
            {m.recentUsers.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.access?.status ?? '—'}</td>
                <td className="text-white/50">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-white/60 text-sm">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}
