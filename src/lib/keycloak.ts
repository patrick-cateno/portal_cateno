import * as jose from 'jose';

function getIssuer(): string {
  return process.env.AUTH_KEYCLOAK_ISSUER!;
}

function getClientId(): string {
  return process.env.AUTH_KEYCLOAK_ID!;
}

/** Keycloak OpenID Connect token endpoint */
export function getKeycloakTokenEndpoint(): string {
  return `${getIssuer()}/protocol/openid-connect/token`;
}

/** Keycloak front-channel logout URL — redirects user to Keycloak logout */
export function getKeycloakLogoutUrl(postLogoutRedirectUri: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  return `${getIssuer()}/protocol/openid-connect/logout?${params.toString()}`;
}

/** JWKS remote key set for validating Keycloak JWTs */
let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
let jwksIssuer: string | null = null;

function getJwks() {
  const issuer = getIssuer();
  if (!jwks || jwksIssuer !== issuer) {
    jwks = jose.createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));
    jwksIssuer = issuer;
  }
  return jwks;
}

/** Validate and decode a Keycloak back-channel logout token */
export async function validateLogoutToken(token: string): Promise<{ sub: string }> {
  const issuer = getIssuer();
  const { payload } = await jose.jwtVerify(token, getJwks(), {
    issuer,
    audience: getClientId(),
  });

  // Ensure this is a backchannel logout token, not an access/id token
  const events = (payload as Record<string, unknown>).events as Record<string, unknown> | undefined;
  if (!events?.['http://schemas.openid.net/event/backchannel-logout']) {
    throw new Error('Token is not a backchannel logout token');
  }

  if (!payload.sub) {
    throw new Error('logout_token missing sub claim');
  }

  return { sub: payload.sub };
}

/**
 * Extract Keycloak realm roles from an ID token or account profile.
 * Keycloak puts roles in `realm_access.roles` claim.
 */
export function extractKeycloakRoles(profile: Record<string, unknown>): string[] {
  const realmAccess = profile.realm_access as { roles?: string[] } | undefined;
  const allRoles = realmAccess?.roles ?? [];
  // Filter to only portal-relevant roles
  return allRoles.filter((r) => ['admin', 'user', 'viewer'].includes(r));
}
