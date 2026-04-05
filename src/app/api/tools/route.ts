import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RegisterToolsSchema } from '@/lib/validations/tool';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applicationSlug = searchParams.get('application');
  const activeOnly = searchParams.get('active') !== 'false';

  const tools = await prisma.microserviceTool.findMany({
    where: {
      ...(activeOnly && { isActive: true }),
      ...(applicationSlug && { application: { slug: applicationSlug } }),
    },
    include: { application: { select: { name: true, slug: true } } },
    orderBy: { name: 'asc' },
  });

  return Response.json({ total: tools.length, tools });
}

export async function POST(request: Request) {
  // Auth: admin session OR service account via Bearer token
  const session = await auth();
  const authHeader = request.headers.get('authorization');
  const isServiceAccount = authHeader === `Bearer ${process.env.HEALTH_CHECKER_SECRET}`;

  if (!isServiceAccount && !session?.user?.roles?.includes('admin')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = RegisterToolsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { slug: parsed.data.applicationSlug },
  });
  if (!application) {
    return Response.json({ error: 'Aplicação não encontrada' }, { status: 404 });
  }

  // Upsert each tool
  const results = await Promise.all(
    parsed.data.tools.map((tool) =>
      prisma.microserviceTool.upsert({
        where: {
          applicationId_name: {
            applicationId: application.id,
            name: tool.name,
          },
        },
        update: {
          description: tool.description,
          inputSchema: tool.inputSchema as Prisma.InputJsonValue,
          outputSchema: tool.outputSchema as Prisma.InputJsonValue | undefined,
          endpoint: tool.endpoint,
          method: tool.method,
          requiredRole: tool.requiredRole ?? null,
          isActive: true,
        },
        create: {
          applicationId: application.id,
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema as Prisma.InputJsonValue,
          endpoint: tool.endpoint,
          method: tool.method,
          requiredRole: tool.requiredRole ?? null,
          outputSchema: tool.outputSchema as Prisma.InputJsonValue | undefined,
        },
      }),
    ),
  );

  return Response.json(
    { registered: results.length, tools: results.map((t) => t.name) },
    { status: 201 },
  );
}
