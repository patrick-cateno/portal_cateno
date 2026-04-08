import { requireRole } from '@/lib/auth-helpers';
import { FeriadosPageClient } from '../../_components/feriados/feriados-page-client';

export default async function FeriadosAdminPage() {
  const session = await requireRole('admin');

  return <FeriadosPageClient token={session.accessToken!} />;
}
