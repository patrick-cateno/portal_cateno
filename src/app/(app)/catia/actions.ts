'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getGraph } from '@/lib/catia/graph';
import type { Message } from '@/types/chat';

interface ChatResult {
  response: string;
  conversationId: string;
}

export async function getChatResponse(
  conversationHistory: Message[],
  userMessage: string,
  conversationId?: string | null,
): Promise<ChatResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autenticado');

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });

  // Create or reuse conversation
  let convId = conversationId;
  if (!convId) {
    const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
    const conversation = await prisma.catiaConversation.create({
      data: { userId: session.user.id, title },
    });
    convId = conversation.id;
  }

  // Persist user message
  await prisma.catiaMessage.create({
    data: {
      conversationId: convId,
      role: 'user',
      content: userMessage,
    },
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

    // Persist assistant response
    await prisma.catiaMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: result.response,
      },
    });

    // Touch updatedAt
    await prisma.catiaConversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    return { response: result.response, conversationId: convId };
  } catch (error) {
    console.error('CatIA graph error:', error);
    throw new Error('Falha ao processar sua mensagem');
  }
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autenticado');

  const conversation = await prisma.catiaConversation.findFirst({
    where: { id: conversationId, userId: session.user.id, isActive: true },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) throw new Error('Conversa não encontrada');

  return conversation.messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    timestamp: m.createdAt,
  }));
}
