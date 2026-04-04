'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { buildCatIAGraph } from '@/lib/ai/graph';
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

  const graph = buildCatIAGraph();

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
      intent: null,
      apps: [],
      response: '',
    });

    return result.response;
  } catch (error) {
    console.error('CatIA graph error:', error);
    throw new Error('Falha ao processar sua mensagem');
  }
}
