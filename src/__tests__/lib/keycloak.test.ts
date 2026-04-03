import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock environment variables before importing
vi.stubEnv('AUTH_KEYCLOAK_ISSUER', 'https://keycloak.example.com/realms/test');
vi.stubEnv('AUTH_KEYCLOAK_ID', 'portal-test');

import {
  getKeycloakLogoutUrl,
  getKeycloakTokenEndpoint,
  extractKeycloakRoles,
} from '@/lib/keycloak';

describe('keycloak', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getKeycloakTokenEndpoint', () => {
    it('should return the token endpoint URL', () => {
      expect(getKeycloakTokenEndpoint()).toBe(
        'https://keycloak.example.com/realms/test/protocol/openid-connect/token',
      );
    });
  });

  describe('getKeycloakLogoutUrl', () => {
    it('should build logout URL with redirect URI', () => {
      const url = getKeycloakLogoutUrl('http://localhost:3000/login');
      expect(url).toContain(
        'https://keycloak.example.com/realms/test/protocol/openid-connect/logout',
      );
      expect(url).toContain('client_id=portal-test');
      expect(url).toContain('post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin');
    });
  });

  describe('extractKeycloakRoles', () => {
    it('should extract portal-relevant roles from realm_access', () => {
      const profile = {
        realm_access: {
          roles: ['admin', 'user', 'uma_authorization', 'offline_access'],
        },
      };
      expect(extractKeycloakRoles(profile)).toEqual(['admin', 'user']);
    });

    it('should return empty array when no realm_access', () => {
      expect(extractKeycloakRoles({})).toEqual([]);
    });

    it('should return empty array when no matching roles', () => {
      const profile = {
        realm_access: { roles: ['uma_authorization'] },
      };
      expect(extractKeycloakRoles(profile)).toEqual([]);
    });

    it('should handle viewer role', () => {
      const profile = {
        realm_access: { roles: ['viewer'] },
      };
      expect(extractKeycloakRoles(profile)).toEqual(['viewer']);
    });
  });
});
