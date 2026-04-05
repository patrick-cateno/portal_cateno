# PC-PLAN-007 — Service Registry

**Status:** Backlog
**Agente:** backend-specialist
**Prioridade:** Alta — bloqueante para CatIA e Health Checker
**Depende de:** PC-SPEC-008 (schema)

## Critérios de aceitação

- [ ] GET /api/applications com RBAC via Prisma
- [ ] GET /api/applications/status com LATERAL JOIN (< 50ms)
- [ ] PATCH /api/applications/[slug]/health com Bearer token
- [ ] POST /api/applications com guard de role admin
- [ ] Testes Vitest para todos os endpoints

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Criar estrutura de pastas das API Routes | 30min |
| 2 | Implementar GET /api/applications com RBAC | 3h |
| 3 | Implementar GET /api/applications/status | 2h |
| 4 | Implementar GET /api/applications/[slug] | 1h |
| 5 | Implementar PATCH /api/applications/[slug]/health | 2h |
| 6 | Implementar POST /api/applications (admin) | 1h |
| 7 | Testes Vitest com mock Prisma | 3h |
| **Total** | | **~12h** |

## Artefatos de saída

- `src/app/api/applications/` — API Routes completas
- `src/__tests__/api/applications.test.ts`
