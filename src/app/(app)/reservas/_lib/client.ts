const BASE_URL = process.env.NEXT_PUBLIC_MS_RESERVAS_URL ?? 'http://localhost:8000/api/reservas';

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function reservasClient<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchInit } = init ?? {};

  const hasBody = fetchInit.body !== undefined && fetchInit.body !== null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchInit,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchInit.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: res.statusText }));
    throw new ApiError(err.code, res.status, err.message, err.details);
  }

  return res.json() as Promise<T>;
}
