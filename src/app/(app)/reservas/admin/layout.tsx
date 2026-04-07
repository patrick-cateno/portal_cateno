import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ReservasAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userRoles = session.user.roles ?? [];
  const isAdmin = userRoles.includes('reservas:admin') || userRoles.includes('admin');

  if (!isAdmin) {
    redirect('/');
  }

  return <>{children}</>;
}
