import { auth } from '@/lib/auth';
import { getJwks, extractKeycloakRoles } from '@/lib/keycloak';
import * as jose from 'jose';

export interface ApiCaller {
  id: string;
  roles: string[];
  source: 'session' | 'bearer';
}

/**
 * Authenticate an API request via NextAuth session OR Bearer JWT.
 *
 * 1. Tries NextAuth session (browser/admin logado)
 * 2. Falls back to Authorization: Bearer <jwt> validated against Keycloak JWKS
 *
 * Returns null if neither is present/valid.
 */
export async function authenticateRequest(request: Request): Promise<ApiCaller | null> {
  // 1. Try NextAuth session
  try {
    const session = await auth();
    if (session?.user) {
      return {
        id: session.user.id,
        roles: session.user.roles ?? [],
        source: 'session',
      };
    }
  } catch {
    // auth() can throw when receiving a Bearer token without session — fall through
  }

  // 2. Try Bearer JWT
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
    const { payload } = await jose.jwtVerify(token, getJwks(), {
      issuer,
      audience: 'account',
    });

    const roles = extractKeycloakRoles(payload as Record<string, unknown>);

    // Also check for service-specific roles in resource_access
    const resourceAccess = (payload as Record<string, unknown>).resource_access as
      | Record<string, { roles?: string[] }>
      | undefined;
    const clientId = process.env.AUTH_KEYCLOAK_ID!;
    const clientRoles = resourceAccess?.[clientId]?.roles ?? [];

    return {
      id: payload.sub ?? 'service-account',
      roles: [...roles, ...clientRoles],
      source: 'bearer',
    };
  } catch {
    return null;
  }
}
