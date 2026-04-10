import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl;
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? '20')));
  const q = url.searchParams.get('q')?.trim() ?? '';

  const where = {
    userId: session.user.id,
    isActive: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { messages: { some: { content: { contains: q, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
  };

  const [total, conversations] = await Promise.all([
    prisma.catiaConversation.count({ where }),
    prisma.catiaConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, role: true },
        },
      },
    }),
  ]);

  const items = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt.toISOString(),
    preview: c.messages[0]?.content.slice(0, 80) ?? '',
  }));

  return NextResponse.json({ total, page, limit, items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { title?: string };

  const conversation = await prisma.catiaConversation.create({
    data: {
      userId: session.user.id,
      title: body.title ?? null,
    },
  });

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
  });
}
