import { reservasClient } from './client';
import type { DisponibilidadeEstacao, PaginatedResponse, ReservaEstacao } from './types';

export function listarReservasEstacao(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<ReservaEstacao>>(
    `/v1/reservas-estacoes?page=${page}&limit=${limit}`,
    { token },
  );
}

export function buscarDisponibilidade(
  token: string,
  params: { escritorioId: string; data: string },
) {
  const qs = new URLSearchParams(params).toString();
  return reservasClient<DisponibilidadeEstacao>(`/v1/reservas-estacoes/disponibilidade?${qs}`, {
    token,
  });
}

export function minhasReservasEstacao(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<ReservaEstacao>>(
    `/v1/reservas-estacoes/minhas?page=${page}&limit=${limit}`,
    { token },
  );
}

export function buscarReservaEstacao(token: string, id: string) {
  return reservasClient<ReservaEstacao>(`/v1/reservas-estacoes/${id}`, { token });
}

export function criarReservaEstacao(
  token: string,
  data: { estacaoId: string; dataReserva: string },
) {
  return reservasClient<ReservaEstacao>('/v1/reservas-estacoes', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function cancelarReservaEstacao(token: string, id: string) {
  return reservasClient<void>(`/v1/reservas-estacoes/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function checkinReservaEstacao(token: string, id: string) {
  return reservasClient<ReservaEstacao>(`/v1/reservas-estacoes/${id}/checkin`, {
    method: 'POST',
    token,
  });
}
