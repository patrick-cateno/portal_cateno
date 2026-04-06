-- ═══════════════════════════════════════════
-- pg_cron Retention Policies — CSA - CatIA Super App
-- PC-SPEC-008 Section 6
-- ═══════════════════════════════════════════
-- Prerequisites: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── app_health: 7-day retention, daily at 02:00 UTC ──
SELECT cron.schedule(
  'cleanup_app_health',
  '0 2 * * *',
  $$DELETE FROM app_health WHERE "checkedAt" < NOW() - INTERVAL '7 days'$$
);

-- ── app_metrics: 90-day retention, weekly on Sundays at 03:00 UTC ──
SELECT cron.schedule(
  'cleanup_app_metrics',
  '0 3 * * 0',
  $$DELETE FROM app_metrics WHERE "recordedAt" < NOW() - INTERVAL '90 days'$$
);

-- ── Verify scheduled jobs ──
-- SELECT * FROM cron.job;
