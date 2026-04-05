import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { Session } from 'next-auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
    },
    permission: {
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GET } from '@/app/api/applications/[slug]/route';

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFindUnique = vi.mocked(prisma.application.findUnique);
const mockPermFindFirst = vi.mocked(prisma.permission.findFirst);

const userSession = {
  user: { id: 'u1', name: 'User', email: 'u@test.com', roles: ['user'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const viewerSession = {
  user: { id: 'u2', name: 'Viewer', email: 'v@test.com', roles: ['viewer'], permissions: [] },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const makeRequest = (slug: string) =>
  GET(new Request(`http://localhost/api/applications/${slug}`), {
    params: Promise.resolve({ slug }),
  });

describe('GET /api/applications/[slug]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await makeRequest('gestao-cartoes');
    expect(res.status).toBe(401);
  });

  it('returns 404 for unknown slug', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await makeRequest('nao-existe');
    expect(res.status).toBe(404);
  });

  it('returns application for user role', async () => {
    mockAuth.mockResolvedValueOnce(userSession);
    const app = { id: 'app-1', slug: 'gestao-cartoes', name: 'Gestão de Cartões' };
    mockFindUnique.mockResolvedValueOnce(app as never);
    const res = await makeRequest('gestao-cartoes');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.slug).toBe('gestao-cartoes');
  });

  it('returns 403 for viewer without permission', async () => {
    mockAuth.mockResolvedValueOnce(viewerSession);
    const app = { id: 'app-1', slug: 'gestao-cartoes', name: 'Gestão de Cartões' };
    mockFindUnique.mockResolvedValueOnce(app as never);
    mockPermFindFirst.mockResolvedValueOnce(null);
    const res = await makeRequest('gestao-cartoes');
    expect(res.status).toBe(403);
  });

  it('returns application for viewer with permission', async () => {
    mockAuth.mockResolvedValueOnce(viewerSession);
    const app = { id: 'app-1', slug: 'gestao-cartoes', name: 'Gestão de Cartões' };
    mockFindUnique.mockResolvedValueOnce(app as never);
    mockPermFindFirst.mockResolvedValueOnce({ id: 'p1', canView: true } as never);
    const res = await makeRequest('gestao-cartoes');
    expect(res.status).toBe(200);
  });
});
