import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { Session } from 'next-auth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  unauthorized: vi.fn(() => {
    throw new Error('NEXT_UNAUTHORIZED');
  }),
  forbidden: vi.fn(() => {
    throw new Error('NEXT_FORBIDDEN');
  }),
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    permission: {
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole, requirePermission } from '@/lib/auth-helpers';

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFindFirst = vi.mocked(prisma.permission.findFirst);

const mockSession = {
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['user'],
    permissions: [],
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const adminSession = {
  ...mockSession,
  user: { ...mockSession.user, roles: ['admin'] },
};

describe('auth-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      const session = await requireAuth();
      expect(session.user.id).toBe('user-1');
    });

    it('should call unauthorized when no session', async () => {
      mockAuth.mockResolvedValueOnce(null);
      await expect(requireAuth()).rejects.toThrow('NEXT_UNAUTHORIZED');
    });

    it('should call unauthorized when session has no user', async () => {
      mockAuth.mockResolvedValueOnce({ expires: '', user: undefined } as never);
      await expect(requireAuth()).rejects.toThrow('NEXT_UNAUTHORIZED');
    });
  });

  describe('requireRole', () => {
    it('should return session when user has required role', async () => {
      mockAuth.mockResolvedValueOnce(adminSession);
      const session = await requireRole('admin');
      expect(session.user.roles).toContain('admin');
    });

    it('should call forbidden when user lacks role', async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      await expect(requireRole('admin')).rejects.toThrow('NEXT_FORBIDDEN');
    });

    it('should call unauthorized when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null);
      await expect(requireRole('admin')).rejects.toThrow('NEXT_UNAUTHORIZED');
    });
  });

  describe('requirePermission', () => {
    it('should pass for admin without checking permissions', async () => {
      mockAuth.mockResolvedValueOnce(adminSession);
      const session = await requirePermission('app-1', 'view');
      expect(session.user.roles).toContain('admin');
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should pass when user has canView permission', async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      mockFindFirst.mockResolvedValueOnce({
        id: 'perm-1',
        userId: 'user-1',
        applicationId: 'app-1',
        canView: true,
        canExecute: false,
        createdAt: new Date(),
      });

      const session = await requirePermission('app-1', 'view');
      expect(session.user.id).toBe('user-1');
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          applicationId: 'app-1',
          canView: true,
        },
      });
    });

    it('should pass when user has canExecute permission', async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      mockFindFirst.mockResolvedValueOnce({
        id: 'perm-2',
        userId: 'user-1',
        applicationId: 'app-1',
        canView: true,
        canExecute: true,
        createdAt: new Date(),
      });

      const session = await requirePermission('app-1', 'execute');
      expect(session.user.id).toBe('user-1');
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          applicationId: 'app-1',
          canExecute: true,
        },
      });
    });

    it('should call forbidden when user lacks permission', async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      mockFindFirst.mockResolvedValueOnce(null);

      await expect(requirePermission('app-1', 'execute')).rejects.toThrow('NEXT_FORBIDDEN');
    });
  });
});
