import { prisma } from '@/lib/db';

/**
 * Execute a registered tool by calling the microservice endpoint.
 * ALWAYS propagates the user's JWT — RBAC is enforced by the microservice.
 */
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  userToken: string,
): Promise<unknown> {
  const tool = await prisma.microserviceTool.findFirst({
    where: { name: toolName, isActive: true },
  });

  if (!tool) {
    throw new Error(`Tool não encontrada: ${toolName}`);
  }

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(tool.method);

  let url = tool.endpoint;
  if (!isBodyMethod && Object.keys(toolInput).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(toolInput)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    url = `${tool.endpoint}?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: tool.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    ...(isBodyMethod && { body: JSON.stringify(toolInput) }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro na tool ${toolName}: ${response.status} — ${error.slice(0, 200)}`);
  }

  return response.json();
}
