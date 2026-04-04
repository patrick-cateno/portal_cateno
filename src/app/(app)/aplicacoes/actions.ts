'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_applicationId: { userId, applicationId },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.favorite.create({
      data: { userId, applicationId },
    });
  }

  revalidatePath('/aplicacoes');

  return { success: true, isFavorited: !existing };
}
