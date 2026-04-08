import { reservasClient } from './client';
import type { Escritorio, PaginatedResponse } from './types';

export function listarEscritorios(
  token: string,
  params: { page?: number; limit?: number; is_active?: boolean } = {},
) {
  const { page = 1, limit = 20, is_active } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(is_active !== undefined ? { is_active: String(is_active) } : {}),
  });
  return reservasClient<PaginatedResponse<Escritorio>>(`/v1/escritorios?${qs}`, { token });
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
