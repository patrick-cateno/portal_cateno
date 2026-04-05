import { request } from 'undici';

export interface HealthResult {
  status: 'online' | 'maintenance' | 'offline';
  response_time_ms: number | null;
  error_message: string | null;
}

const TIMEOUT_MS = Number(process.env.CHECK_TIMEOUT_MS ?? 5000);

export async function checkHealth(url: string): Promise<HealthResult> {
  const start = Date.now();
  try {
    const { statusCode, body } = await request(url, {
      method: 'GET',
      headersTimeout: TIMEOUT_MS,
      bodyTimeout: TIMEOUT_MS,
    });
    const responseTimeMs = Date.now() - start;

    // HTTP 503 + body containing "maintenance" → maintenance status
    if (statusCode === 503) {
      const text = await body.text();
      if (text.includes('"maintenance"')) {
        return { status: 'maintenance', response_time_ms: responseTimeMs, error_message: null };
      }
      return {
        status: 'offline',
        response_time_ms: responseTimeMs,
        error_message: `HTTP ${statusCode}`,
      };
    }

    // Drain body to prevent memory leak
    await body.text();

    return {
      status: statusCode < 500 ? 'online' : 'offline',
      response_time_ms: responseTimeMs,
      error_message: statusCode >= 500 ? `HTTP ${statusCode}` : null,
    };
  } catch (err) {
    return {
      status: 'offline',
      response_time_ms: null,
      error_message: err instanceof Error ? err.message.slice(0, 200) : 'Unknown error',
    };
  }
}
