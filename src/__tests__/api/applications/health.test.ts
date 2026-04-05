import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('HEALTH_CHECKER_SECRET', 'test-secret-123');

vi.mock('@/lib/db', () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    appHealth: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '@/lib/db';
import { PATCH } from '@/app/api/applications/[slug]/health/route';

const mockFindUnique = vi.mocked(prisma.application.findUnique);
const mockTransaction = vi.mocked(prisma.$transaction);

const makeRequest = (slug: string, body: Record<string, unknown>, token?: string) =>
  PATCH(
    new Request(`http://localhost/api/applications/${slug}/health`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug }) },
  );

describe('PATCH /api/applications/[slug]/health', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 without Bearer token', async () => {
    const res = await makeRequest('gestao-cartoes', { status: 'online' });
    expect(res.status).toBe(403);
  });

  it('returns 403 with wrong token', async () => {
    const res = await makeRequest('gestao-cartoes', { status: 'online' }, 'Bearer wrong-token');
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid body', async () => {
    const res = await makeRequest(
      'gestao-cartoes',
      { status: 'invalid' },
      'Bearer test-secret-123',
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown slug', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await makeRequest('nao-existe', { status: 'online' }, 'Bearer test-secret-123');
    expect(res.status).toBe(404);
  });

  it('creates health record and updates app status', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'app-1', slug: 'gestao-cartoes' } as never);
    mockTransaction.mockResolvedValueOnce([{}, {}] as never);
    const res = await makeRequest(
      'gestao-cartoes',
      { status: 'online', response_time_ms: 42, uptime_pct: 99.9 },
      'Bearer test-secret-123',
    );
    expect(res.status).toBe(204);
    expect(mockTransaction).toHaveBeenCalled();
  });
});
