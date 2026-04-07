import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReservasSidebar } from './_components/reservas-sidebar';

export default async function ReservasLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userRoles = session.user.roles ?? [];

  return (
    <div style={{ display: 'flex', minHeight: '100%' }}>
      <ReservasSidebar userRoles={userRoles} />
      <main style={{ flex: 1, padding: 24, background: '#F0FDFA' }}>{children}</main>
    </div>
  );
}
