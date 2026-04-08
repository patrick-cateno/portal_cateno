import { requireRole } from '@/lib/auth-helpers';
import { EscritoriosPageClient } from '../../_components/escritorios/escritorios-page-client';

export default async function EscritoriosAdminPage() {
  const session = await requireRole('admin');

  return <EscritoriosPageClient token={session.accessToken!} />;
}
