import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { Session } from 'next-auth';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({
  prisma: {
    microserviceTool: { findMany: vi.fn(), upsert: vi.fn() },
    application: { findUnique: vi.fn() },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GET, POST } from '@/app/api/tools/route';

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFindMany = vi.mocked(prisma.microserviceTool.findMany);
const mockAppFindUnique = vi.mocked(prisma.application.findUnique);
const mockUpsert = vi.mocked(prisma.microserviceTool.upsert);

const adminSession = {
  user: { id: 'u1', name: 'Admin', email: 'a@test.com', roles: ['admin'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const userSession = {
  user: { id: 'u2', name: 'User', email: 'u@test.com', roles: ['user'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

describe('GET /api/tools', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await GET(new Request('http://localhost/api/tools'));
    expect(res.status).toBe(401);
  });

  it('returns tools for authenticated user', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    mockFindMany.mockResolvedValueOnce([]);
    const res = await GET(new Request('http://localhost/api/tools'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ total: 0, tools: [] });
  });
});

describe('POST /api/tools', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    const res = await POST(
      new Request('http://localhost/api/tools', {
        method: 'POST',
        body: JSON.stringify({ applicationSlug: 'test', tools: [] }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown application', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockAppFindUnique.mockResolvedValueOnce(null);
    const res = await POST(
      new Request('http://localhost/api/tools', {
        method: 'POST',
        body: JSON.stringify({
          applicationSlug: 'nao-existe',
          tools: [
            {
              name: 'test_tool',
              description: 'Test',
              inputSchema: { type: 'object' },
              endpoint: 'https://example.com/api',
            },
          ],
        }),
      }),
    );
    expect(res.status).toBe(404);
  });

  it('registers tools for admin', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockAppFindUnique.mockResolvedValueOnce({ id: 'app-1', slug: 'gestao-cartoes' } as never);
    mockUpsert.mockResolvedValueOnce({ name: 'test_tool' } as never);
    const res = await POST(
      new Request('http://localhost/api/tools', {
        method: 'POST',
        body: JSON.stringify({
          applicationSlug: 'gestao-cartoes',
          tools: [
            {
              name: 'test_tool',
              description: 'A test tool',
              inputSchema: { type: 'object', properties: {} },
              endpoint: 'https://example.com/api/test',
            },
          ],
        }),
      }),
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.registered).toBe(1);
  });
});
