import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  BACKCHANNEL_LOGOUT: 'backchannel_logout',
} as const;

interface CreateAuditLogInput {
  entity: string;
  entityId?: string;
  action: string;
  changes?: Prisma.InputJsonValue;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      entity: input.entity,
      entityId: input.entityId ?? null,
      action: input.action,
      changes: input.changes ?? Prisma.JsonNull,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

/** Extract IP address and user-agent from a Request */
export function getClientInfo(request: Request): {
  ipAddress: string | undefined;
  userAgent: string | undefined;
} {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  };
}
