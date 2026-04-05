import { prisma } from '@/lib/db';
import { HealthUpdateSchema } from '@/lib/validations/application';

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Auth via Bearer token (health checker service), not user session
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${process.env.HEALTH_CHECKER_SECRET}`) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { slug } = await params;

  const body = await request.json();
  const parsed = HealthUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const app = await prisma.application.findUnique({ where: { slug } });
  if (!app) {
    return Response.json({ error: 'Aplicação não encontrada' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.appHealth.create({
      data: {
        applicationId: app.id,
        status: parsed.data.status,
        responseTimeMs: parsed.data.response_time_ms ?? null,
        uptimePct: parsed.data.uptime_pct ?? null,
        errorMessage: parsed.data.error_message ?? null,
      },
    }),
    prisma.application.update({
      where: { id: app.id },
      data: { status: parsed.data.status },
    }),
  ]);

  return new Response(null, { status: 204 });
}
