import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { Session } from 'next-auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GET } from '@/app/api/applications/status/route';

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const session = {
  user: { id: 'u1', name: 'User', email: 'u@test.com', roles: ['user'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

describe('GET /api/applications/status', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns validated statuses', async () => {
    mockAuth.mockResolvedValueOnce(session);
    mockQueryRaw.mockResolvedValueOnce([
      { slug: 'gestao-cartoes', status: 'online', response_time_ms: 42 },
      { slug: 'tesouraria', status: 'offline', response_time_ms: null },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].slug).toBe('gestao-cartoes');
  });
});
