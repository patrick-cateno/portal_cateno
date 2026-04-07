import { reservasClient } from './client';
import type { PaginatedResponse, Sala } from './types';

export function listarSalas(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<Sala>>(`/v1/salas?page=${page}&limit=${limit}`, {
    token,
  });
}

export function criarSala(
  token: string,
  data: { nome: string; escritorioId: string; fotoUrl?: string },
) {
  return reservasClient<Sala>('/v1/salas', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function atualizarSala(
  token: string,
  id: string,
  data: Partial<{ nome: string; escritorioId: string; fotoUrl: string | null }>,
) {
  return reservasClient<Sala>(`/v1/salas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function excluirSala(token: string, id: string) {
  return reservasClient<void>(`/v1/salas/${id}`, {
    method: 'DELETE',
    token,
  });
}
