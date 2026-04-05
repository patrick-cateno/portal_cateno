import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface CatIATool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/**
 * Load tools the user is allowed to use based on their roles.
 * Admin sees all active tools. Other roles see tools matching their requiredRole.
 */
export async function loadToolsForUser(userRoles: string[]): Promise<CatIATool[]> {
  const isAdmin = userRoles.includes('admin');

  const where: Prisma.MicroserviceToolWhereInput = {
    isActive: true,
    ...(isAdmin
      ? {}
      : {
          OR: [{ requiredRole: null }, { requiredRole: { in: userRoles } }],
        }),
  };

  const tools = await prisma.microserviceTool.findMany({
    where,
    include: { application: { select: { name: true } } },
  });

  return tools.map((tool) => ({
    name: tool.name,
    description: `[${tool.application.name}] ${tool.description}`,
    input_schema: tool.inputSchema as Record<string, unknown>,
  }));
}
