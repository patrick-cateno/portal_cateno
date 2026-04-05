# PC-SPEC-007 — Service Registry (API Routes Next.js)

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | PC-SPEC-007                    |
| **Status**       | Concluída                      |
| **Prioridade**   | Alta                           |
| **Complexidade** | Média                          |
| **Autor**        | Patrick Iarrocheski            |
| **Branch**       | feat/PC-007-service-registry   |

## 1. Objetivo

Implementar o catálogo dinâmico de aplicações como API Routes do Next.js 15, usando Prisma para persistência e NextAuth.js para controle de acesso. É a fonte de dados que alimenta o grid de cards (PC-SPEC-004) e o CatIA (PC-SPEC-012).

## 2. Decisão de Arquitetura

O Service Registry **não é um microsserviço separado** — vive dentro do Next.js como API Routes em `src/app/api/applications/`. O Prisma acessa o banco diretamente, sem overhead de rede. Auth via `getServerSession()` do NextAuth.js.

## 3. Escopo

### 3.1 Incluído

- API Routes para CRUD de aplicações
- Filtragem por permissão do usuário logado (RBAC via Prisma + roles do Keycloak)
- Endpoint leve para polling de status (usado pelo Health Checker e pelo portal)
- Integração com model `Application` já existente no Prisma schema (PC-SPEC-001)
- Extensão do schema com campos de health e métricas (ver PC-SPEC-008)
- Server Actions para operações de favorito (já existe base em PC-SPEC-004)

### 3.2 Excluído

- Interface admin de criação/edição de apps (será PC-SPEC-010)
- Métricas de uso avançadas (Analytics futuro)

## 4. API Routes

### Estrutura de pastas

```
src/app/api/
└── applications/
    ├── route.ts              # GET (lista) + POST (criar — admin)
    ├── status/
    │   └── route.ts          # GET /api/applications/status (polling leve)
    └── [slug]/
        ├── route.ts          # GET (detalhe) + PATCH (editar) + DELETE
        └── health/
            └── route.ts      # PATCH (atualizar saúde — health checker)
```

### GET /api/applications

```typescript
// src/app/api/applications/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const includeMetrics = searchParams.get('include_metrics') === 'true';

  const userRoles = session.user.roles ?? [];

  const applications = await prisma.application.findMany({
    where: {
      // RBAC: admin e user veem todas; viewer tem restrição via Permission
      ...(userRoles.includes('viewer') && !userRoles.includes('admin') && {
        permissions: {
          some: { role: 'viewer', canView: true },
        },
      }),
      ...(category && { category: { slug: category } }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      category: true,
      health: { orderBy: { checkedAt: 'desc' }, take: 1 },
      ...(includeMetrics && { metrics: { orderBy: { recordedAt: 'desc' }, take: 1 } }),
    },
    orderBy: { order: 'asc' },
  });

  return Response.json({ total: applications.length, applications });
}
```

### GET /api/applications/status (polling leve — 30s)

```typescript
// Retorna apenas slug + status — sem payload pesado
export async function GET() {
  const statuses = await prisma.$queryRaw`
    SELECT a.slug, h.status, h.response_time_ms
    FROM "Application" a
    LEFT JOIN LATERAL (
      SELECT status, response_time_ms FROM "AppHealth"
      WHERE application_id = a.id ORDER BY checked_at DESC LIMIT 1
    ) h ON true
    WHERE a.status != 'archived'
  `;
  return Response.json(statuses);
}
```

### PATCH /api/applications/[slug]/health

```typescript
// Chamado apenas pelo Health Checker (service account)
export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  // Validar Bearer token do service account
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.HEALTH_CHECKER_SECRET}`) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const app = await prisma.application.findUniqueOrThrow({ where: { slug: params.slug } });

  await prisma.appHealth.create({
    data: {
      applicationId: app.id,
      status: body.status,
      responseTimeMs: body.response_time_ms,
      uptimePct: body.uptime_pct,
      errorMessage: body.error_message,
    },
  });

  // Atualiza status atual na tabela Application
  await prisma.application.update({
    where: { id: app.id },
    data: { status: body.status },
  });

  return new Response(null, { status: 204 });
}
```

## 5. Requisitos Funcionais

| ID        | Descrição |
| --------- | --------- |
| RF-007-01 | GET /api/applications retorna apenas apps que o usuário tem permissão de ver |
| RF-007-02 | Filtros: category (slug), search (nome+desc), status |
| RF-007-03 | GET /api/applications/status responde em < 50ms (LATERAL JOIN) |
| RF-007-04 | PATCH /health exige `Authorization: Bearer HEALTH_CHECKER_SECRET` |
| RF-007-05 | POST /api/applications exige role `admin` — 403 caso contrário |
| RF-007-06 | 401 para todas as rotas sem sessão NextAuth válida (exceto /health) |

## 6. Requisitos Não-Funcionais

| ID         | Categoria   | Descrição |
| ---------- | ----------- | --------- |
| RNF-007-01 | Performance | /status deve usar LATERAL JOIN — sem N+1 |
| RNF-007-02 | Segurança   | RBAC via Prisma no servidor — nunca filtrar só no cliente |
| RNF-007-03 | Segurança   | HEALTH_CHECKER_SECRET nunca exposto ao cliente |
| RNF-007-04 | Testes      | Vitest + mock Prisma para cada endpoint |

## 7. Critérios de Aceite

- [ ] GET /api/applications filtra por role (admin/user veem todas, viewer só as permitidas)
- [ ] GET /api/applications/status responde em menos de 50ms
- [ ] PATCH /api/applications/[slug]/health exige Bearer token correto
- [ ] POST /api/applications exige role admin
- [ ] Todos os filtros (category, search, status) funcionando
- [ ] Testes unitários cobrindo os 4 endpoints

## 8. Dependências

- **Depende de:** PC-SPEC-001 (Prisma), PC-SPEC-002 (NextAuth), PC-SPEC-008 (schema health/metrics)
- **Bloqueante para:** PC-SPEC-010 (Admin Panel), PC-SPEC-011 (Health Checker), PC-SPEC-012 (CatIA)
