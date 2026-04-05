import type { HealthResult } from './checker.js';

const PORTAL_URL = process.env.PORTAL_URL ?? 'http://localhost:3000';
const SECRET = process.env.HEALTH_CHECKER_SECRET;

if (!SECRET) {
  console.error('HEALTH_CHECKER_SECRET is required');
  process.exit(1);
}

interface AppEntry {
  slug: string;
  healthCheckUrl: string | null;
}

export async function fetchActiveApps(): Promise<AppEntry[]> {
  const res = await fetch(`${PORTAL_URL}/api/applications/status`);

  if (!res.ok) {
    throw new Error(`Failed to fetch apps: HTTP ${res.status}`);
  }

  // Status endpoint returns slugs; we need healthCheckUrls from the full list
  // Use the main endpoint without auth (health-checker fetches all non-archived)
  const fullRes = await fetch(`${PORTAL_URL}/api/applications`, {
    headers: { Authorization: `Bearer ${SECRET}` },
  });

  if (!fullRes.ok) {
    throw new Error(`Failed to fetch app details: HTTP ${fullRes.status}`);
  }

  const data = await fullRes.json();
  return (data.applications as AppEntry[]).filter(
    (a) => a.healthCheckUrl !== null && a.healthCheckUrl !== undefined,
  );
}

export async function patchHealth(slug: string, result: HealthResult): Promise<void> {
  const res = await fetch(`${PORTAL_URL}/api/applications/${slug}/health`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify(result),
  });

  if (!res.ok) {
    console.warn(`PATCH /health for ${slug} failed: HTTP ${res.status}`);
  }
}
