import { reservasClient } from './client';
import type {
  DisponibilidadeEstacao,
  PaginatedResponse,
  ReservaEstacao,
  ReservaEstacaoComDetalhes,
  SituacaoReservaEstacao,
} from './types';

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
  const qs = new URLSearchParams({
    escritorio_id: params.escritorioId,
    data: params.data,
  }).toString();
  return reservasClient<DisponibilidadeEstacao>(`/v1/reservas-estacoes/disponibilidade?${qs}`, {
    token,
  });
}

export function minhasReservasEstacao(
  token: string,
  params: {
    page?: number;
    limit?: number;
    data_inicio?: string;
    data_fim?: string;
    situacao?: SituacaoReservaEstacao;
  } = {},
) {
  const { page = 1, limit = 50, data_inicio, data_fim, situacao } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(data_inicio ? { data_inicio } : {}),
    ...(data_fim ? { data_fim } : {}),
    ...(situacao ? { situacao } : {}),
  });
  return reservasClient<PaginatedResponse<ReservaEstacaoComDetalhes>>(
    `/v1/reservas-estacoes/minhas?${qs}`,
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
    body: JSON.stringify({
      estacao_id: data.estacaoId,
      data_reserva: data.dataReserva,
    }),
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
