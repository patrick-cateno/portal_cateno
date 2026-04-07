import { reservasClient } from './client';
import type { EstacaoTrabalho, PaginatedResponse } from './types';

export function listarEstacoes(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<EstacaoTrabalho>>(
    `/v1/estacoes?page=${page}&limit=${limit}`,
    { token },
  );
}

export function criarEstacao(token: string, data: { nome: string; escritorioId: string }) {
  return reservasClient<EstacaoTrabalho>('/v1/estacoes', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function atualizarEstacao(
  token: string,
  id: string,
  data: Partial<{ nome: string; escritorioId: string }>,
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
    token,
  });
}

export function desbloquearEstacao(token: string, id: string) {
  return reservasClient<EstacaoTrabalho>(`/v1/estacoes/${id}/desbloquear`, {
    method: 'PATCH',
    token,
  });
}
