import { reservasClient } from './client';
import type { Escritorio, PaginatedResponse } from './types';

export function listarEscritorios(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<Escritorio>>(
    `/v1/escritorios?page=${page}&limit=${limit}`,
    { token },
  );
}

export function criarEscritorio(
  token: string,
  data: { nome: string; cidade: string; plantaBaixaUrl?: string },
) {
  return reservasClient<Escritorio>('/v1/escritorios', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function atualizarEscritorio(
  token: string,
  id: string,
  data: Partial<{ nome: string; cidade: string; plantaBaixaUrl: string | null }>,
) {
  return reservasClient<Escritorio>(`/v1/escritorios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function excluirEscritorio(token: string, id: string) {
  return reservasClient<void>(`/v1/escritorios/${id}`, {
    method: 'DELETE',
    token,
  });
}
