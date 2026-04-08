'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getGraph } from '@/lib/catia/graph';
import type { Message } from '@/types/chat';

export async function getChatResponse(
  conversationHistory: Message[],
  userMessage: string,
): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autenticado');

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });

  const graph = getGraph();

  try {
    const result = await graph.invoke({
      messages: [
        ...conversationHistory,
        {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: userMessage,
          timestamp: new Date(),
        },
      ],
      userId: session.user.id,
      userRoles: dbUser?.roles.map((r) => r.name) ?? [],
      userToken: session.accessToken ?? '',
    });

    return result.response;
  } catch (error) {
    console.error('CatIA graph error:', error);
    throw new Error('Falha ao processar sua mensagem');
  }
}
