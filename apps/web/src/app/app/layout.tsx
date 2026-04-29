import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    xp: number;
  } | null;
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let me: MeResponse;
  try {
    me = await serverApi<MeResponse>('/auth/me');
  } catch {
    redirect('/login');
  }
  if (!me.user) redirect('/login');

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <Sidebar role={me.user.role} />
      <div className="flex flex-col min-h-screen">
        <Topbar user={me.user} />
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
