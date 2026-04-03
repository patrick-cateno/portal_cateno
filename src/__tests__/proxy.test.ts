import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

import { getToken } from 'next-auth/jwt';
import { proxy } from '@/proxy';

const mockGetToken = vi.mocked(getToken);

function createRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('public paths', () => {
    it('should allow /login without auth', async () => {
      mockGetToken.mockResolvedValueOnce(null);
      const response = await proxy(createRequest('/login'));
      // NextResponse.next() returns undefined or a pass-through response
      expect(response?.status).not.toBe(307);
    });

    it('should allow /api/auth routes without auth', async () => {
      const response = await proxy(createRequest('/api/auth/signin'));
      expect(response?.status).not.toBe(307);
    });

    it('should redirect authenticated user from /login to /aplicacoes', async () => {
      mockGetToken.mockResolvedValueOnce({
        id: 'user-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        jti: 'test',
      });

      const response = await proxy(createRequest('/login'));
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/aplicacoes');
    });
  });

  describe('protected paths', () => {
    it('should redirect to /login when not authenticated', async () => {
      mockGetToken.mockResolvedValueOnce(null);
      const response = await proxy(createRequest('/aplicacoes'));
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/login');
    });

    it('should include callbackUrl when redirecting to login', async () => {
      mockGetToken.mockResolvedValueOnce(null);
      const response = await proxy(createRequest('/catia'));
      const location = response?.headers.get('location') ?? '';
      expect(location).toContain('callbackUrl=%2Fcatia');
    });

    it('should allow authenticated user to access protected routes', async () => {
      mockGetToken.mockResolvedValueOnce({
        id: 'user-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        jti: 'test',
      });

      const response = await proxy(createRequest('/aplicacoes'));
      expect(response?.status).not.toBe(307);
    });

    it('should redirect to login on RefreshAccessTokenError', async () => {
      mockGetToken.mockResolvedValueOnce({
        id: 'user-1',
        error: 'RefreshAccessTokenError',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        jti: 'test',
      });

      const response = await proxy(createRequest('/dashboard'));
      expect(response?.status).toBe(307);
      const location = response?.headers.get('location') ?? '';
      expect(location).toContain('error=SessionExpired');
    });
  });
});
