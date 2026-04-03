import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('AUTH_KEYCLOAK_ID', 'portal-test');
vi.stubEnv('AUTH_KEYCLOAK_SECRET', 'test-secret');
vi.stubEnv('AUTH_KEYCLOAK_ISSUER', 'https://keycloak.example.com/realms/test');

vi.mock('@/lib/keycloak', () => ({
  getKeycloakTokenEndpoint: () =>
    'https://keycloak.example.com/realms/test/protocol/openid-connect/token',
}));

import { refreshAccessToken } from '@/lib/auth-refresh';

describe('refreshAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const baseToken = {
    id: 'user-1',
    accessToken: 'old-access-token',
    refreshToken: 'old-refresh-token',
    expiresAt: Math.floor(Date.now() / 1000) - 60,
    roles: ['user'],
  };

  it('should refresh token successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 300,
        }),
        { status: 200 },
      ),
    );

    const result = await refreshAccessToken(baseToken);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.expiresAt).toBeGreaterThan(Date.now() / 1000);
    expect(result.error).toBeUndefined();
  });

  it('should keep old refresh token if new one not provided', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'new-access-token',
          expires_in: 300,
        }),
        { status: 200 },
      ),
    );

    const result = await refreshAccessToken(baseToken);

    expect(result.refreshToken).toBe('old-refresh-token');
  });

  it('should return error token on HTTP failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    const result = await refreshAccessToken(baseToken);

    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.id).toBe('user-1');
  });

  it('should return error token on network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const result = await refreshAccessToken(baseToken);

    expect(result.error).toBe('RefreshAccessTokenError');
  });
});
