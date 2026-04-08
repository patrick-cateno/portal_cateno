import { requireAuth } from '@/lib/auth-helpers';
import { MinhasSalasClient } from '../_components/minhas-salas/minhas-salas-client';

export default async function MinhasSalasPage() {
  const session = await requireAuth();

  return <MinhasSalasClient token={session.accessToken!} />;
}
