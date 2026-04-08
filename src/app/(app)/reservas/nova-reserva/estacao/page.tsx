import { requireAuth } from '@/lib/auth-helpers';
import { NovaReservaEstacaoClient } from '../../_components/nova-reserva-estacao/nova-reserva-estacao-client';

export default async function NovaReservaEstacaoPage() {
  const session = await requireAuth();

  return <NovaReservaEstacaoClient token={session.accessToken!} userId={session.user.id} />;
}
