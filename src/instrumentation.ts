export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCleanupJobs } = await import('./lib/cleanup');
    startCleanupJobs();
  }
}
