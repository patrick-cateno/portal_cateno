import { requireAuth } from '@/lib/auth-helpers';
import { NovaReservaSalaClient } from '../../_components/nova-reserva-sala/nova-reserva-sala-client';

export default async function NovaReservaSalaPage() {
  const session = await requireAuth();

  return <NovaReservaSalaClient token={session.accessToken!} userId={session.user.id} />;
}
