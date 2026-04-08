import { reservasClient } from './client';
import type { EstacaoTrabalho, PaginatedResponse } from './types';

export function listarEstacoes(
  token: string,
  params: {
    page?: number;
    limit?: number;
    escritorio_id?: string;
    is_active?: boolean;
    bloqueada?: boolean;
  } = {},
) {
  const { page = 1, limit = 20, escritorio_id, is_active, bloqueada } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(escritorio_id ? { escritorio_id } : {}),
    ...(is_active !== undefined ? { is_active: String(is_active) } : {}),
    ...(bloqueada !== undefined ? { bloqueada: String(bloqueada) } : {}),
  });
  return reservasClient<PaginatedResponse<EstacaoTrabalho>>(`/v1/estacoes?${qs}`, { token });
}

export function criarEstacao(
  token: string,
  data: { nome: string; escritorio_id: string; bloqueada?: boolean },
) {
  return reservasClient<EstacaoTrabalho>('/v1/estacoes', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function atualizarEstacao(
  token: string,
  id: string,
  data: Partial<{ nome: string; escritorio_id: string }>,
) {
  return reservasClient<EstacaoTrabalho>(`/v1/estacoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function excluirEstacao(token: string, id: string) {
  return reservasClient<void>(`/v1/estacoes/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function bloquearEstacao(token: string, id: string) {
  return reservasClient<EstacaoTrabalho>(`/v1/estacoes/${id}/bloquear`, {
    method: 'PATCH',
    body: JSON.stringify({}),
    token,
  });
}

export function desbloquearEstacao(token: string, id: string) {
  return reservasClient<EstacaoTrabalho>(`/v1/estacoes/${id}/desbloquear`, {
    method: 'PATCH',
    body: JSON.stringify({}),
    token,
  });
}
