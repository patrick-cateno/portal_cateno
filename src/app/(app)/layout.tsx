import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userRoles = session.user.roles ?? ['user'];

  return <AppShell userRoles={userRoles}>{children}</AppShell>;
}
