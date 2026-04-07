import { reservasClient } from './client';
import type { Feriado, PaginatedResponse } from './types';

export function listarFeriados(token: string, page = 1, limit = 20) {
  return reservasClient<PaginatedResponse<Feriado>>(`/v1/feriados?page=${page}&limit=${limit}`, {
    token,
  });
}

export function criarFeriado(
  token: string,
  data: { nome: string; data: string; escritorioId?: string },
) {
  return reservasClient<Feriado>('/v1/feriados', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function atualizarFeriado(
  token: string,
  id: string,
  data: Partial<{ nome: string; data: string; escritorioId: string | null }>,
) {
  return reservasClient<Feriado>(`/v1/feriados/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function excluirFeriado(token: string, id: string) {
  return reservasClient<void>(`/v1/feriados/${id}`, {
    method: 'DELETE',
    token,
  });
}
