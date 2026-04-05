import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // If refresh token expired, redirect to login — proxy handles session cleanup
  if (session.error === 'RefreshAccessTokenError') {
    redirect('/login?error=SessionExpired');
  }

  const userRoles = session.user.roles ?? ['user'];

  return <AppShell userRoles={userRoles}>{children}</AppShell>;
}
