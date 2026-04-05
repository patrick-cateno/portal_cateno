import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppStatusSchema } from '@/lib/validations/app-status';

function isServiceAccount(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.HEALTH_CHECKER_SECRET}`;
}

export async function GET(request: Request) {
  const serviceAccount = isServiceAccount(request);
  const session = !serviceAccount ? await auth() : null;

  if (!serviceAccount && !session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await prisma.$queryRaw`
    SELECT a."slug",
           COALESCE(h."status"::text, a."status"::text) AS "status",
           h."responseTimeMs" AS "response_time_ms"
    FROM "Application" a
    LEFT JOIN LATERAL (
      SELECT ah."status", ah."responseTimeMs"
      FROM "app_health" ah
      WHERE ah."applicationId" = a."id"
      ORDER BY ah."checkedAt" DESC
      LIMIT 1
    ) h ON true
    WHERE a."status" != 'archived'
  `;

  const statuses = AppStatusSchema.parse(raw);
  return Response.json(statuses);
}
