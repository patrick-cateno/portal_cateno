import { reservasClient } from './client';
import type { PaginatedResponse, ReservaSala } from './types';

export function listarReservasSala(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<ReservaSala>>(
    `/v1/reservas-salas?page=${page}&limit=${limit}`,
    { token },
  );
}

export function minhasReservasSala(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<ReservaSala>>(
    `/v1/reservas-salas/minhas?page=${page}&limit=${limit}`,
    { token },
  );
}

export function buscarReservaSala(token: string, id: string) {
  return reservasClient<ReservaSala>(`/v1/reservas-salas/${id}`, { token });
}

export function criarReservaSala(
  token: string,
  data: { salaId: string; titulo: string; dataHoraInicio: string; dataHoraFim: string },
) {
  return reservasClient<ReservaSala>('/v1/reservas-salas', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function atualizarReservaSala(
  token: string,
  id: string,
  data: Partial<{ titulo: string; dataHoraInicio: string; dataHoraFim: string }>,
) {
  return reservasClient<ReservaSala>(`/v1/reservas-salas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function cancelarReservaSala(token: string, id: string) {
  return reservasClient<void>(`/v1/reservas-salas/${id}`, {
    method: 'DELETE',
    token,
  });
}
