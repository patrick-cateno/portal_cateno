import { reservasClient } from './client';
import type { PaginatedResponse, Sala } from './types';

export function listarSalas(
  token: string,
  params: { page?: number; limit?: number; escritorio_id?: string; is_active?: boolean } = {},
) {
  const { page = 1, limit = 20, escritorio_id, is_active } = params;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(escritorio_id ? { escritorio_id } : {}),
    ...(is_active !== undefined ? { is_active: String(is_active) } : {}),
  });
  return reservasClient<PaginatedResponse<Sala>>(`/v1/salas?${qs}`, { token });
}

export function criarSala(
  token: string,
  data: { nome: string; escritorio_id: string; foto_url?: string | null },
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
  data: Partial<{ nome: string; escritorio_id: string; foto_url: string | null }>,
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

export async function uploadFotoSala(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload/salas', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Falha no upload' }));
    throw new Error(err.message);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
