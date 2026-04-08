import { reservasClient } from './client';
import type { Feriado, PaginatedResponse } from './types';

export function listarFeriados(
  token: string,
  params: {
    page?: number;
    limit?: number;
    escritorio_id?: string;
    ano?: number;
    is_active?: boolean;
  } = {},
) {
  const { page = 1, limit = 100, escritorio_id, ano, is_active } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(escritorio_id ? { escritorio_id } : {}),
    ...(ano !== undefined ? { ano: String(ano) } : {}),
    ...(is_active !== undefined ? { is_active: String(is_active) } : {}),
  });
  return reservasClient<PaginatedResponse<Feriado>>(`/v1/feriados?${qs}`, { token });
}

export function criarFeriado(
  token: string,
  data: { nome: string; data: string; escritorio_id?: string | null },
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
  data: Partial<{ nome: string; data: string; escritorio_id: string | null }>,
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
