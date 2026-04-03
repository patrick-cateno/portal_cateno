import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { createAuditLog, AUTH_ACTIONS, getClientInfo } from '@/lib/audit';

vi.mock('@/lib/db', () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    },
  },
}));

import { prisma } from '@/lib/db';

describe('audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AUTH_ACTIONS', () => {
    it('should have all auth action constants', () => {
      expect(AUTH_ACTIONS.LOGIN_SUCCESS).toBe('login_success');
      expect(AUTH_ACTIONS.LOGIN_FAILED).toBe('login_failed');
      expect(AUTH_ACTIONS.LOGOUT).toBe('logout');
      expect(AUTH_ACTIONS.BACKCHANNEL_LOGOUT).toBe('backchannel_logout');
    });
  });

  describe('createAuditLog', () => {
    it('should create an audit log with all fields', async () => {
      await createAuditLog({
        entity: 'Auth',
        entityId: 'user-1',
        action: AUTH_ACTIONS.LOGIN_SUCCESS,
        changes: { provider: 'keycloak' },
        userId: 'user-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          entity: 'Auth',
          entityId: 'user-1',
          action: 'login_success',
          changes: { provider: 'keycloak' },
          userId: 'user-1',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      });
    });

    it('should default optional fields to null', async () => {
      await createAuditLog({
        entity: 'Auth',
        action: AUTH_ACTIONS.LOGOUT,
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          entity: 'Auth',
          entityId: null,
          action: 'logout',
          changes: Prisma.JsonNull,
          userId: null,
          ipAddress: null,
          userAgent: null,
        },
      });
    });
  });

  describe('getClientInfo', () => {
    it('should extract IP from x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '10.0.0.1, 10.0.0.2',
          'user-agent': 'TestAgent/1.0',
        },
      });

      const info = getClientInfo(request);
      expect(info.ipAddress).toBe('10.0.0.1');
      expect(info.userAgent).toBe('TestAgent/1.0');
    });

    it('should fallback to x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '10.0.0.5' },
      });

      const info = getClientInfo(request);
      expect(info.ipAddress).toBe('10.0.0.5');
    });

    it('should return undefined when no IP headers present', () => {
      const request = new Request('http://localhost');
      const info = getClientInfo(request);
      expect(info.ipAddress).toBeUndefined();
      expect(info.userAgent).toBeUndefined();
    });
  });
});
