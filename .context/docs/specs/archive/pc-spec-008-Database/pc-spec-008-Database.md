# PC-SPEC-008 — Database: Evolução do Schema Prisma

| Campo            | Valor                     |
| ---------------- | ------------------------- |
| **ID**           | PC-SPEC-008               |
| **Status**       | Concluída                 |
| **Prioridade**   | Alta — pré-requisito      |
| **Complexidade** | Baixa                     |
| **Autor**        | Patrick Iarrocheski       |
| **Branch**       | feat/PC-008-database      |

## 1. Objetivo

Evoluir o schema Prisma existente (criado em PC-SPEC-001) com os modelos necessários para health checking, métricas de uso e permissões granulares por aplicação. Não reescreve o schema — apenas adiciona.

## 2. O que já existe (PC-SPEC-001)

```prisma
model User          { ... }    // id, email, name, avatar, roles, favorites
model Role          { ... }    // id, name, userId
model Category      { ... }    // id, name, slug, icon, order
model Application   { ... }    // id, name, slug, description, status, url, userCount, trend
model Favorite      { ... }    // userId + applicationId
model AuditLog      { ... }    // entity, action, changes, userId, ipAddress
```

## 3. O que precisa ser adicionado

### 3.1 AppHealth — histórico de checks do Health Checker

```prisma
model AppHealth {
  id              String      @id @default(cuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  status          AppStatus   // online | maintenance | offline
  responseTimeMs  Int?
  uptimePct       Float?
  errorMessage    String?
  checkedAt       DateTime    @default(now())

  @@index([applicationId, checkedAt(sort: Desc)])
  @@map("app_health")
}
```

### 3.2 AppMetrics — métricas de uso por período

```prisma
model AppMetrics {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  activeUsers   Int
  trendPct      Float
  period        MetricsPeriod
  recordedAt    DateTime    @default(now())

  @@index([applicationId, recordedAt(sort: Desc)])
  @@map("app_metrics")
}

enum MetricsPeriod {
  last_7_days
  last_30_days
  last_90_days
}
```

### 3.3 Permission — controle granular por app (já referenciado em PC-SPEC-002)

```prisma
model Permission {
  id            String      @id @default(cuid())
  userId        String
  applicationId String
  canView       Boolean     @default(true)
  canExecute    Boolean     @default(false)
  createdAt     DateTime    @default(now())

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@unique([userId, applicationId])
  @@index([userId])
  @@index([applicationId])
  @@map("permission")
}
```

### 3.4 Campos adicionais em Application

```prisma
// Adicionar ao model Application existente:
healthCheckUrl  String?            // URL para o Health Checker verificar
integrationType String  @default("redirect")  // redirect | embed | modal
health          AppHealth[]
metrics         AppMetrics[]
permissions     Permission[]
```

### 3.5 Enum AppStatus

```prisma
enum AppStatus {
  online
  maintenance
  offline
  archived
}
// Migrar campo status de String para AppStatus
```

## 4. Índices de performance

```sql
-- Para o endpoint GET /api/applications/status (LATERAL JOIN)
CREATE INDEX CONCURRENTLY idx_app_health_latest
ON app_health (application_id, checked_at DESC);

-- Para filtragem RBAC por permissão
CREATE INDEX CONCURRENTLY idx_permission_app_view
ON permission (application_id, can_view)
WHERE can_view = true;
```

## 5. Seed — atualizar dados iniciais

```typescript
// prisma/seed.ts — adicionar healthCheckUrl e integrationType nas apps seed
const apps = [
  {
    name: 'Gestão de Cartões',
    slug: 'gestao-de-cartoes',
    healthCheckUrl: 'https://cartoes.cateno.com.br/health',
    integrationType: 'redirect',
    // ...
  },
  // ...
];
```

## 6. Política de retenção

| Tabela | Retenção | Job |
|--------|----------|-----|
| `app_health` | 7 dias | pg_cron diário às 02h |
| `app_metrics` | 90 dias | pg_cron semanal |

## 6.1 Decisão de ORM — Prisma mantido

**Prisma é a escolha correta para este projeto.** Os motivos:
- PrismaAdapter integrado ao NextAuth.js (sem trabalho manual)
- Tipos gerados automaticamente — zero casting em TypeScript
- Migrations versionadas no repositório
- Padrão do ecossistema Next.js

**Três ajustes práticos adicionados a esta spec:**

### Ajuste 1 — `$queryRaw` tipado com Zod

Para queries que escapam do Prisma Client (ex: LATERAL JOIN do `/api/applications/status`), validar o retorno com Zod em vez de type assertion:

```typescript
import { z } from "zod";

const AppStatusSchema = z.array(z.object({
  slug:             z.string(),
  status:           z.enum(["online", "maintenance", "offline"]),
  response_time_ms: z.number().nullable(),
}));

const raw = await prisma.$queryRaw`
  SELECT a.slug, h.status, h.response_time_ms
  FROM "Application" a
  LEFT JOIN LATERAL (
    SELECT status, response_time_ms FROM "AppHealth"
    WHERE application_id = a.id ORDER BY checked_at DESC LIMIT 1
  ) h ON true
  WHERE a.status != 'archived'
`;

// Tipado e validado em runtime — sem type assertion
const statuses = AppStatusSchema.parse(raw);
```

### Ajuste 2 — Índices explícitos via migration dedicada

Os índices críticos não são criados pelo `@@index` padrão do Prisma — exigem uma migration dedicada:

```typescript
// prisma/migrations/YYYYMMDD_performance_indexes/migration.sql
-- Filtragem RBAC — query mais executada
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permission_app_view
ON "Permission" ("applicationId", "canView")
WHERE "canView" = true;

-- Polling de status — LATERAL JOIN
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_health_latest
ON "AppHealth" ("applicationId", "checkedAt" DESC);

-- Tool Registry — carregamento por role
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tool_active
ON "MicroserviceTool" ("applicationId", "isActive")
WHERE "isActive" = true;
```

## 7. Critérios de Aceite

- [ ] `npx prisma migrate deploy` roda sem erros em ambiente limpo
- [ ] Models AppHealth, AppMetrics, Permission, MicroserviceTool criados
- [ ] Application com campos healthCheckUrl e integrationType
- [ ] Migration dedicada com índices CONCURRENTLY para queries críticas
- [ ] `$queryRaw` do `/api/applications/status` validado com Zod
- [ ] Seed atualizado com healthCheckUrl para todos os apps
- [ ] pg_cron configurado para retenção (7 dias health, 90 dias metrics)

## 8. Notas de Implementação

> Adicionado pós-verificação (2026-04-05)

### pg_cron substituído por node-cron

A imagem `postgres:16-alpine` não inclui a extensão `pg_cron`. A política de retenção (seção 6) foi implementada via `node-cron` no runtime do Next.js:

- **Arquivo:** `src/lib/cleanup.ts` + `src/instrumentation.ts`
- **app_health:** limpeza diária às 02h (registros > 7 dias)
- **app_metrics:** limpeza semanal aos domingos às 03h (registros > 90 dias)
- O `instrumentation.ts` é carregado automaticamente pelo Next.js no boot do servidor

### Permission simplificado

O model `Permission` da spec previa campos `resource`, `resourceId` e `action`. Na implementação, foi simplificado para `applicationId` + `canView` + `canExecute`, alinhando com o RBAC real do portal onde permissões são sempre por aplicação.

## 9. Dependências

- **Depende de:** PC-SPEC-001 (schema base)
- **Bloqueante para:** PC-SPEC-007, PC-SPEC-011, PC-SPEC-015
