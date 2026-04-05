# PC-PLAN-008 — Database

**Status:** Backlog
**Agente:** database-specialist
**Prioridade:** Alta — pré-requisito de tudo
**Depende de:** PC-SPEC-001

## Critérios de aceitação

- [ ] Migration gerada sem erros sobre schema existente
- [ ] AppHealth e AppMetrics com índices corretos
- [ ] Permission com unique constraint
- [ ] Application com healthCheckUrl e integrationType
- [ ] Seed atualizado
- [ ] pg_cron configurado

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Adicionar AppHealth, AppMetrics ao schema.prisma | 1h |
| 2 | Adicionar Permission model | 30min |
| 3 | Adicionar campos em Application | 30min |
| 4 | Migration: `prisma migrate dev --name add-health-metrics-permissions` | 30min |
| 5 | Migration de índices de performance | 30min |
| 6 | Atualizar seed.ts com healthCheckUrl | 1h |
| 7 | Configurar pg_cron para retenção | 30min |
| **Total** | | **~4.5h** |

## Artefatos de saída

- `prisma/schema.prisma` — atualizado
- `prisma/migrations/` — nova migration
- `prisma/seed.ts` — atualizado
