import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreateApplicationSchema } from '@/lib/validations/application';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const includeMetrics = searchParams.get('include_metrics') === 'true';

  const userRoles = session.user.roles ?? [];
  const isViewer =
    userRoles.includes('viewer') && !userRoles.includes('admin') && !userRoles.includes('user');

  const where: Prisma.ApplicationWhereInput = {
    // RBAC: viewer only sees apps with explicit Permission
    ...(isViewer && {
      permissions: {
        some: { userId: session.user.id, canView: true },
      },
    }),
    ...(category && { category: { slug: category } }),
    ...(status && { status: status as Prisma.EnumAppStatusFilter }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const applications = await prisma.application.findMany({
    where,
    include: {
      category: true,
      health: { orderBy: { checkedAt: 'desc' }, take: 1 },
      ...(includeMetrics && { metrics: { orderBy: { recordedAt: 'desc' }, take: 1 } }),
    },
    orderBy: { order: 'asc' },
  });

  return Response.json({ total: applications.length, applications });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRoles = session.user.roles ?? [];
  if (!userRoles.includes('admin')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CreateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.application.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return Response.json({ error: 'Aplicação com esse slug já existe' }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: parsed.data,
    include: { category: true },
  });

  return Response.json(application, { status: 201 });
}
