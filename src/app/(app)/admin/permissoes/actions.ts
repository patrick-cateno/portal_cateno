'use server';

import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function togglePermission(
  userId: string,
  applicationId: string,
  field: 'canView' | 'canExecute',
  value: boolean,
) {
  await requireRole('admin');

  await prisma.permission.upsert({
    where: { userId_applicationId: { userId, applicationId } },
    update: { [field]: value },
    create: { userId, applicationId, [field]: value },
  });

  revalidatePath('/admin/permissoes');
  return { success: true };
}
