import { prisma } from '@/lib/db';

const LOG_PREFIX = '[catia:executor]';

/**
 * Rewrite tool endpoint URLs based on CATIA_URL_REWRITES env var.
 * In production the var is absent and URLs are used as-is.
 *
 * Format: JSON object mapping base URL prefixes to replacements.
 * Example: {"https://api.cateno.com.br/reservas":"http://localhost:3001"}
 */
function rewriteUrl(originalUrl: string): { url: string; rewritten: boolean } {
  const raw = process.env.CATIA_URL_REWRITES;
  if (!raw) return { url: originalUrl, rewritten: false };

  try {
    const rewrites = JSON.parse(raw) as Record<string, string>;
    for (const [from, to] of Object.entries(rewrites)) {
      if (originalUrl.startsWith(from)) {
        const url = originalUrl.replace(from, to);
        console.log(`${LOG_PREFIX} URL rewrite: ${originalUrl} → ${url}`);
        return { url, rewritten: true };
      }
    }
  } catch {
    console.error(`${LOG_PREFIX} CATIA_URL_REWRITES inválido — ignorando rewrites`);
  }

  return { url: originalUrl, rewritten: false };
}

export interface ExecuteToolContext {
  userId: string;
  userRoles: string[];
  userName?: string;
}

/**
 * Execute a registered tool by calling the microservice endpoint.
 *
 * In production, the call goes through Kong which validates the JWT and injects
 * x-consumer-* headers. In dev (when CATIA_URL_REWRITES is active), calls bypass
 * Kong and go directly to the microservice — so we inject those headers ourselves.
 */
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  userToken: string,
  context?: ExecuteToolContext,
): Promise<unknown> {
  const tool = await prisma.microserviceTool.findFirst({
    where: { name: toolName, isActive: true },
  });

  if (!tool) {
    throw new Error(`Tool não encontrada: ${toolName}`);
  }

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(tool.method);

  const { url: baseUrl, rewritten } = rewriteUrl(tool.endpoint);
  let url = baseUrl;
  if (!isBodyMethod && Object.keys(toolInput).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(toolInput)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    url = `${baseUrl}?${params.toString()}`;
  }

  // Build headers: in production Kong injects x-consumer-* from the JWT.
  // When URL was rewritten (dev/staging bypass), we inject them manually.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (rewritten && context) {
    // Direct call to microservice — simulate Kong consumer headers
    headers['x-consumer-custom-id'] = context.userId;
    headers['x-consumer-username'] = context.userName ?? context.userId;
    headers['x-authenticated-groups'] = context.userRoles.join(',');
    console.log(
      `${LOG_PREFIX} Injecting Kong headers: x-consumer-custom-id=${context.userId} roles=${context.userRoles.join(',')}`,
    );
  } else {
    // Production path: Kong will parse this JWT and inject headers
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  console.log(`${LOG_PREFIX} ${tool.method} ${url}`, JSON.stringify(toolInput));

  const response = await fetch(url, {
    method: tool.method,
    headers,
    ...(isBodyMethod && { body: JSON.stringify(toolInput) }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`${LOG_PREFIX} ${tool.method} ${url} → ${response.status}`, error.slice(0, 500));
    throw new Error(`Erro na tool ${toolName}: ${response.status} — ${error.slice(0, 200)}`);
  }

  const data = await response.json();
  console.log(`${LOG_PREFIX} ${tool.method} ${url} → ${response.status} OK`);
  return data;
}
