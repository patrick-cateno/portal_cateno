import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { AppShell } from '@/components/layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // If refresh token expired, clear the stale session and redirect to login
  if (session.error === 'RefreshAccessTokenError') {
    await signOut({ redirect: false });
    redirect('/login?error=SessionExpired');
  }

  const userRoles = session.user.roles ?? ['user'];

  return <AppShell userRoles={userRoles}>{children}</AppShell>;
}
