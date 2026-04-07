import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getGraph } from '@/lib/catia/graph';
import { decode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import type { Message } from '@/types/chat';

const COOKIE_NAME = 'authjs.session-token';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Decode the NextAuth session cookie to extract the Keycloak access token.
  // auth() exposes session but not the underlying JWT fields like accessToken.
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value ?? '';
  let userToken = '';
  if (raw) {
    try {
      const jwt = await decode({ token: raw, secret: process.env.AUTH_SECRET!, salt: COOKIE_NAME });
      userToken = (jwt?.accessToken as string) ?? '';
    } catch {
      // decode failed — proceed without token
    }
  }

  const { message, history } = (await request.json()) as {
    message: string;
    history: Message[];
  };

  if (!message?.trim()) {
    return Response.json({ error: 'Mensagem vazia' }, { status: 400 });
  }

  // Load user roles from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });
  const userRoles = user?.roles.map((r) => r.name) ?? ['user'];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const graph = getGraph();
        const trimmedHistory = history.slice(-19);

        const result = await graph.invoke({
          messages: [
            ...trimmedHistory,
            {
              id: crypto.randomUUID(),
              role: 'user' as const,
              content: message,
              timestamp: new Date(),
            },
          ],
          userId: session.user.id,
          userRoles,
          userToken,
        });

        // Emit apps if found
        if (result.apps && result.apps.length > 0) {
          send('apps', { apps: result.apps });
        }

        // Emit response
        if (result.response) {
          send('delta', { text: result.response });
        }

        send('done', {});
      } catch (err) {
        console.error('[catia:chat] Error:', err);
        send('error', { message: 'Erro interno do CatIA' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
