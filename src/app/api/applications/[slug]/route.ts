import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  const application = await prisma.application.findUnique({
    where: { slug },
    include: {
      category: true,
      health: { orderBy: { checkedAt: 'desc' }, take: 1 },
      metrics: { orderBy: { recordedAt: 'desc' }, take: 1 },
      tools: { where: { isActive: true } },
    },
  });

  if (!application) {
    return Response.json({ error: 'Aplicação não encontrada' }, { status: 404 });
  }

  // RBAC: viewer must have explicit permission
  const userRoles = session.user.roles ?? [];
  const isViewer =
    userRoles.includes('viewer') && !userRoles.includes('admin') && !userRoles.includes('user');

  if (isViewer) {
    const permission = await prisma.permission.findFirst({
      where: { userId: session.user.id, applicationId: application.id, canView: true },
    });
    if (!permission) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return Response.json(application);
}
