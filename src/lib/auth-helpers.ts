import { auth } from '@/lib/auth';
import { forbidden, unauthorized } from 'next/navigation';
import { prisma } from '@/lib/db';

/**
 * Require an authenticated session. Calls `unauthorized()` if no session exists.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  return session;
}

/**
 * Require a specific role. Calls `forbidden()` if user lacks the role.
 */
export async function requireRole(role: string) {
  const session = await requireAuth();

  if (!session.user.roles.includes(role)) {
    forbidden();
  }

  return session;
}

/**
 * Check if user has a specific permission for a resource.
 * Calls `forbidden()` if permission is not found.
 */
export async function requirePermission(resource: string, action: string, resourceId?: string) {
  const session = await requireAuth();

  // Admins bypass permission checks
  if (session.user.roles.includes('admin')) {
    return session;
  }

  const permission = await prisma.permission.findFirst({
    where: {
      userId: session.user.id,
      resource,
      action,
      ...(resourceId ? { resourceId } : {}),
    },
  });

  if (!permission) {
    forbidden();
  }

  return session;
}
