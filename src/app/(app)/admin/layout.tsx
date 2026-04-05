import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userRoles = session.user.roles ?? [];
  if (!userRoles.includes('admin')) {
    redirect('/aplicacoes');
  }

  return <>{children}</>;
}
