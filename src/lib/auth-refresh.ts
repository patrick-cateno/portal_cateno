import type { JWT } from 'next-auth/jwt';
import { getKeycloakTokenEndpoint } from '@/lib/keycloak';

/**
 * Refresh the Keycloak access token using the refresh_token grant.
 * Called from the JWT callback when access_token is about to expire.
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(getKeycloakTokenEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.AUTH_KEYCLOAK_ID!,
        client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
        refresh_token: token.refreshToken!,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
