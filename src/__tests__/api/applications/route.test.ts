import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { Session } from 'next-auth';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    application: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GET, POST } from '@/app/api/applications/route';

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFindMany = vi.mocked(prisma.application.findMany);
const mockFindUnique = vi.mocked(prisma.application.findUnique);
const mockCreate = vi.mocked(prisma.application.create);

const adminSession = {
  user: { id: 'u1', name: 'Admin', email: 'a@test.com', roles: ['admin'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const userSession = {
  user: { id: 'u2', name: 'User', email: 'u@test.com', roles: ['user'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

describe('GET /api/applications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await GET(new Request('http://localhost/api/applications'));
    expect(res.status).toBe(401);
  });

  it('returns applications for authenticated user', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    mockFindMany.mockResolvedValueOnce([]);
    const res = await GET(new Request('http://localhost/api/applications'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ total: 0, applications: [] });
  });

  it('passes category filter to prisma', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    mockFindMany.mockResolvedValueOnce([]);
    await GET(new Request('http://localhost/api/applications?category=cartoes'));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: { slug: 'cartoes' } }),
      }),
    );
  });

  it('passes search filter to prisma', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    mockFindMany.mockResolvedValueOnce([]);
    await GET(new Request('http://localhost/api/applications?search=cartao'));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'cartao', mode: 'insensitive' } },
            { description: { contains: 'cartao', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });
});

describe('POST /api/applications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await POST(
      new Request('http://localhost/api/applications', { method: 'POST', body: '{}' }),
    );
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    const res = await POST(
      new Request('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid body', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    const res = await POST(
      new Request('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate slug', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFindUnique.mockResolvedValueOnce({ id: 'existing' } as never);
    const res = await POST(
      new Request('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test App',
          slug: 'test-app',
          categoryId: 'cat-1',
        }),
      }),
    );
    expect(res.status).toBe(409);
  });

  it('creates application for admin', async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockFindUnique.mockResolvedValueOnce(null);
    const created = {
      id: 'new-1',
      name: 'Test App',
      slug: 'test-app',
      category: { slug: 'cartoes' },
    };
    mockCreate.mockResolvedValueOnce(created as never);
    const res = await POST(
      new Request('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test App',
          slug: 'test-app',
          categoryId: 'cat-1',
        }),
      }),
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.slug).toBe('test-app');
  });
});
