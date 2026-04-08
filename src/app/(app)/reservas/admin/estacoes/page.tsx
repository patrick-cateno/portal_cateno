import { requireRole } from '@/lib/auth-helpers';
import { EstacoesPageClient } from '../../_components/estacoes/estacoes-page-client';

export default async function EstacoesAdminPage() {
  const session = await requireRole('admin');

  return <EstacoesPageClient token={session.accessToken!} />;
}
