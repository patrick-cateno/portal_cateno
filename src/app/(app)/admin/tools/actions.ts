'use server';

import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleTool(id: string, isActive: boolean) {
  await requireRole('admin');

  await prisma.microserviceTool.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath('/admin/tools');
  return { success: true };
}
