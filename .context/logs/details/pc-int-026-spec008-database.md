# PC-INT-026 — SPEC-008: Evolução do Schema Prisma

| Campo   | Valor                            |
| ------- | -------------------------------- |
| Início  | 2026-04-05T00:24 -03             |
| Fim     | 2026-04-05T00:30 -03             |
| Branch  | feat/PC-005-catia-conversacional |
| Spec    | PC-SPEC-008                      |

## O que foi feito

1. **Schema Prisma atualizado** (`prisma/schema.prisma`):
   - Adicionados enums `AppStatus` (online, maintenance, offline, archived) e `MetricsPeriod`
   - Campo `Application.status` migrado de `String` para `AppStatus` enum
   - Adicionados campos `healthCheckUrl` e `integrationType` em `Application`
   - Criado model `AppHealth` com índice DESC em `checkedAt` (@@map app_health)
   - Criado model `AppMetrics` com índice DESC em `recordedAt` (@@map app_metrics)
   - Criado model `MicroserviceTool` (@@map microservice_tool)
   - Model `Permission` refatorado: de RBAC genérico para permissão por app (`canView`, `canExecute`)

2. **Migration principal** (`prisma/migrations/20260405000000_add_health_metrics_tools/migration.sql`):
   - CREATE TYPE enums, ALTER TABLE Application, DROP/CREATE Permission, CREATE tables novas
   - Índices e foreign keys completos

3. **Migration de índices** (`prisma/migrations/20260405000001_performance_indexes/migration.sql`):
   - `idx_permission_app_view` (partial WHERE canView = true)
   - `idx_app_health_latest` (DESC)
   - `idx_tool_active` (partial WHERE isActive = true)
   - Todos com `CONCURRENTLY`

4. **Seed atualizado** (`prisma/seed.ts`):
   - `healthCheckUrl` adicionado a todas as 14 aplicações
   - `integrationType` adicionado (redirect padrão, embed para Processamento/Dashboard/Monitoramento)
   - `status` tipado com `as const` para compatibilidade com enum

5. **Zod schema** (`src/lib/validations/app-status.ts`):
   - `AppStatusSchema` para validação de `$queryRaw` (LATERAL JOIN status endpoint)
   - Type export `AppStatusRow`

6. **pg_cron** (`prisma/scripts/pg_cron_retention.sql`):
   - app_health: retenção 7 dias, limpeza diária às 02h
   - app_metrics: retenção 90 dias, limpeza semanal domingos 03h

## Decisões

- **Permission refatorado** (breaking change): o model genérico (resource/action) foi substituído pelo model per-app (applicationId/canView/canExecute) conforme spec. Não há dados em produção.
- **MicroserviceTool inferido**: spec referencia índice mas não define model completo. Criado com campos: name, description, endpoint, isActive, applicationId.
- **Migrations manuais**: DB tem drift (criado via db push sem migration history). Migrations criadas manualmente com SQL correto.

## Artefatos

- `prisma/schema.prisma`
- `prisma/migrations/20260405000000_add_health_metrics_tools/migration.sql`
- `prisma/migrations/20260405000001_performance_indexes/migration.sql`
- `prisma/seed.ts`
- `src/lib/validations/app-status.ts`
- `prisma/scripts/pg_cron_retention.sql`
