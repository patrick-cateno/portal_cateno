import { auth } from '@/lib/auth';
import { AjudaShell } from '@/components/features/ajuda/ajuda-shell';

export default async function AjudaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRoles = session?.user?.roles ?? [];
  const isAdmin = userRoles.includes('admin');

  return <AjudaShell isAdmin={isAdmin}>{children}</AjudaShell>;
}
