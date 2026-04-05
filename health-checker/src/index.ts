import cron from 'node-cron';
import pLimit from 'p-limit';
import { fetchActiveApps, patchHealth } from './registry.js';
import { checkHealth } from './checker.js';

const INTERVAL = process.env.CHECK_INTERVAL_SECONDS ?? '30';
const CONCURRENCY = Number(process.env.CONCURRENCY_LIMIT ?? 10);

const limit = pLimit(CONCURRENCY);
let isRunning = false;

async function runChecks() {
  if (isRunning) {
    console.log('[health-checker] Previous cycle still running, skipping');
    return;
  }

  isRunning = true;
  const start = Date.now();

  try {
    const apps = await fetchActiveApps();
    console.log(`[health-checker] Checking ${apps.length} apps (concurrency=${CONCURRENCY})`);

    const results = await Promise.allSettled(
      apps.map((app) =>
        limit(async () => {
          const result = await checkHealth(app.healthCheckUrl!);
          await patchHealth(app.slug, result);
          return { slug: app.slug, status: result.status };
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    const elapsed = Date.now() - start;

    console.log(`[health-checker] Cycle done: ${succeeded} ok, ${failed} errors (${elapsed}ms)`);
  } catch (err) {
    console.error('[health-checker] Cycle failed:', err);
  } finally {
    isRunning = false;
  }
}

// Schedule cron job
const cronExpr = `*/${INTERVAL} * * * * *`;
console.log(`[health-checker] Starting with interval=${INTERVAL}s, concurrency=${CONCURRENCY}`);
console.log(`[health-checker] Portal URL: ${process.env.PORTAL_URL ?? 'http://localhost:3000'}`);

cron.schedule(cronExpr, runChecks);

// Run immediately on startup
runChecks();
