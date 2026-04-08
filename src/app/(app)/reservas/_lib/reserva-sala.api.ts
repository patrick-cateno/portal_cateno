import { reservasClient } from './client';
import type { PaginatedResponse, ReservaSala, ReservaSalaComDetalhes } from './types';

export function listarReservasSala(
  token: string,
  params: {
    page?: number;
    limit?: number;
    sala_id?: string;
    data_inicio?: string;
    data_fim?: string;
  } = {},
) {
  const { page = 1, limit = 20, sala_id, data_inicio, data_fim } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(sala_id ? { sala_id } : {}),
    ...(data_inicio ? { data_inicio } : {}),
    ...(data_fim ? { data_fim } : {}),
  });
  return reservasClient<PaginatedResponse<ReservaSala>>(`/v1/reservas-salas?${qs}`, { token });
}

export function minhasReservasSala(
  token: string,
  params: {
    page?: number;
    limit?: number;
    data_inicio?: string;
    data_fim?: string;
  } = {},
) {
  const { page = 1, limit = 50, data_inicio, data_fim } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(data_inicio ? { data_inicio } : {}),
    ...(data_fim ? { data_fim } : {}),
  });
  return reservasClient<PaginatedResponse<ReservaSalaComDetalhes>>(
    `/v1/reservas-salas/minhas?${qs}`,
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
    body: JSON.stringify({
      sala_id: data.salaId,
      titulo: data.titulo,
      data_hora_inicio: data.dataHoraInicio,
      data_hora_fim: data.dataHoraFim,
    }),
    token,
  });
}

export function atualizarReservaSala(
  token: string,
  id: string,
  data: Partial<{ titulo: string; dataHoraInicio: string; dataHoraFim: string }>,
) {
  const body: Record<string, string> = {};
  if (data.titulo !== undefined) body.titulo = data.titulo;
  if (data.dataHoraInicio !== undefined) body.data_hora_inicio = data.dataHoraInicio;
  if (data.dataHoraFim !== undefined) body.data_hora_fim = data.dataHoraFim;
  return reservasClient<ReservaSala>(`/v1/reservas-salas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    token,
  });
}

export function cancelarReservaSala(token: string, id: string) {
  return reservasClient<void>(`/v1/reservas-salas/${id}`, {
    method: 'DELETE',
    token,
  });
}
