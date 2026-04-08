import { requireRole } from '@/lib/auth-helpers';
import { SalasPageClient } from '../../_components/salas/salas-page-client';

export default async function SalasAdminPage() {
  const session = await requireRole('admin');

  return <SalasPageClient token={session.accessToken!} />;
}
