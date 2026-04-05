import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.roles?.includes('admin')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const tool = await prisma.microserviceTool.findUnique({ where: { id } });
  if (!tool) {
    return Response.json({ error: 'Tool não encontrada' }, { status: 404 });
  }

  const updated = await prisma.microserviceTool.update({
    where: { id },
    data: {
      ...(typeof body.isActive === 'boolean' && { isActive: body.isActive }),
    },
  });

  return Response.json(updated);
}
