# Kickoff — PC-SPEC-007: Service Registry (API Routes Next.js)

**Agente:** backend-specialist
**Wave:** 2 — requer pc-008 completo
**Estimativa:** ~12h

## Antes de começar

Confirme que pc-008 está completo (AppHealth e MicroserviceTool no schema).
Leia a spec completa:
```
.context/docs/specs/backlog/pc-007-Service-Registry/pc-spec-007-Service-Registry.md
```

## O que implementar

Criar API Routes em `src/app/api/applications/`:

```
src/app/api/applications/
├── route.ts              # GET (lista com RBAC) + POST (criar — admin)
├── status/
│   └── route.ts          # GET /api/applications/status (polling leve)
└── [slug]/
    ├── route.ts           # GET (detalhe)
    └── health/
        └── route.ts       # PATCH (health checker — Bearer token)
```

**Regras críticas:**
- `getServerSession(authOptions)` em TODAS as rotas — 401 sem sessão
- RBAC via Prisma no servidor — NUNCA filtrar só no cliente
- GET /status usa LATERAL JOIN com `$queryRaw` validado com Zod
- PATCH /health valida `Authorization: Bearer ${HEALTH_CHECKER_SECRET}`
- POST /applications exige `session.user.roles.includes('admin')`

## Critérios de aceite

- [ ] GET /api/applications com RBAC (admin/user veem todas, viewer só as permitidas)
- [ ] GET /api/applications/status com LATERAL JOIN (< 50ms)
- [ ] PATCH /api/applications/[slug]/health com Bearer token
- [ ] POST /api/applications exige role admin
- [ ] Filtros: category, search, status, include_metrics
- [ ] Testes Vitest para todos os endpoints

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "backend-specialist", to: "frontend-specialist", artifacts: ["src/app/api/applications/"] })
```
