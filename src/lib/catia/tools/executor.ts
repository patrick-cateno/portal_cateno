import { prisma } from '@/lib/db';

const LOG_PREFIX = '[catia:executor]';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/**
 * When an action tool receives a name instead of UUID, resolve it by calling
 * the list endpoint for the same resource and matching by "nome".
 *
 * E.g. endpoint "/v1/estacoes/{id}/bloquear" → list from "/v1/estacoes"
 */
async function resolveNameToUuid(
  endpoint: string,
  name: string,
  userToken: string,
): Promise<string | null> {
  // Extract base resource path: "/v1/estacoes/{id}/bloquear" → "/v1/estacoes"
  const match = endpoint.match(/^(.*?\/v1\/\w+)\//);
  if (!match) return null;

  const listEndpoint = match[1];
  const { url: listUrl } = rewriteUrl(listEndpoint);

  console.log(`${LOG_PREFIX} Auto-resolving "${name}" via ${listUrl}?limit=100`);

  try {
    const res = await fetch(`${listUrl}?limit=100&is_active=true`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { items?: Array<{ id: string; nome: string }> };
    const found = data.items?.find((item) => item.nome.toLowerCase() === name.toLowerCase());
    return found?.id ?? null;
  } catch {
    return null;
  }
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
): Promise<unknown> {
  const tool = await prisma.microserviceTool.findFirst({
    where: { name: toolName, isActive: true },
  });

  if (!tool) {
    throw new Error(`Tool não encontrada: ${toolName}`);
  }

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(tool.method);

  // Replace {param} placeholders in URL with values from toolInput.
  // If {id} receives a non-UUID value (e.g. a name like "101"), auto-resolve
  // by searching the corresponding list endpoint.
  const remainingInput: Record<string, unknown> = { ...toolInput };
  const { url: rewrittenUrl } = rewriteUrl(tool.endpoint);
  let url = rewrittenUrl.replace(/\{(\w+)\}/g, (_, key) => {
    const value = remainingInput[key];
    if (value !== undefined && value !== null) {
      delete remainingInput[key];
      return encodeURIComponent(String(value));
    }
    return `{${key}}`;
  });

  // Auto-resolve non-UUID {id} by searching the resource list endpoint
  if (toolInput.id && !UUID_RE.test(String(toolInput.id))) {
    const resolvedId = await resolveNameToUuid(tool.endpoint, String(toolInput.id), userToken);
    if (resolvedId) {
      console.log(`${LOG_PREFIX} Resolved name "${toolInput.id}" → UUID ${resolvedId}`);
      url = url.replace(encodeURIComponent(String(toolInput.id)), resolvedId);
    }
  }

  // Append remaining params as query string for GET/DELETE
  if (!isBodyMethod && Object.keys(remainingInput).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(remainingInput)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    url = `${url}?${params.toString()}`;
  }

  // Kong validates the JWT and injects x-consumer-* headers.
  // Always send the Bearer token — Kong handles the rest.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userToken}`,
  };

  console.log(`${LOG_PREFIX} ${tool.method} ${url}`, JSON.stringify(toolInput));

  const response = await fetch(url, {
    method: tool.method,
    headers,
    ...(isBodyMethod && { body: JSON.stringify(remainingInput) }),
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
