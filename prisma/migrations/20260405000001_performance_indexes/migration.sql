-- Performance Indexes (dedicated migration)
-- Note: In production, run these manually with CONCURRENTLY outside a transaction.
-- Prisma migrations run inside a transaction, so we use regular CREATE INDEX here.

-- Filtragem RBAC — query mais executada (partial index)
CREATE INDEX IF NOT EXISTS idx_permission_app_view
ON "permission" ("applicationId", "canView")
WHERE "canView" = true;

-- Polling de status — LATERAL JOIN
CREATE INDEX IF NOT EXISTS idx_app_health_latest
ON "app_health" ("applicationId", "checkedAt" DESC);

-- Tool Registry — carregamento por role (partial index)
CREATE INDEX IF NOT EXISTS idx_tool_active
ON "microservice_tool" ("applicationId", "isActive")
WHERE "isActive" = true;
