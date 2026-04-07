import type { GraphStateType } from '../state';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function searchNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = [...state.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const isAdmin = state.userRoles.includes('admin');
  const isUser = state.userRoles.includes('user');
  const isViewer = state.userRoles.includes('viewer') && !isAdmin && !isUser;

  const where: Prisma.ApplicationWhereInput = {
    status: { not: 'archived' },
    ...(isViewer && {
      permissions: { some: { userId: state.userId, canView: true } },
    }),
    ...(lastMessage && {
      OR: [
        { name: { contains: lastMessage, mode: 'insensitive' } },
        { description: { contains: lastMessage, mode: 'insensitive' } },
        { category: { name: { contains: lastMessage, mode: 'insensitive' } } },
      ],
    }),
  };

  const apps = await prisma.application.findMany({
    where,
    include: { category: true },
    orderBy: { order: 'asc' },
    take: 10,
  });

  console.log(
    `[catia:search] found=${apps.length} apps=${apps.map((a) => a.slug).join(', ')} | msg="${lastMessage.slice(0, 80)}"`,
  );

  return {
    apps: apps.map((a) => ({ slug: a.slug, name: a.name })),
  };
}
