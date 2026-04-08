import { requireAuth } from '@/lib/auth-helpers';
import { MinhasEstacoesClient } from '../_components/minhas-estacoes/minhas-estacoes-client';

export default async function MinhasEstacoesPage() {
  const session = await requireAuth();

  return <MinhasEstacoesClient token={session.accessToken!} />;
}
