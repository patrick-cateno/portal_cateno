# Kickoff — PC-SPEC-008: Evolução do Schema Prisma

**Agente:** database-specialist
**Wave:** 1 — pode iniciar imediatamente
**Estimativa:** ~4.5h

## Antes de começar

```
context({ action: "check", repoPath: "." })
```

Leia a spec completa:
```
.context/docs/specs/backlog/pc-008-Database/pc-spec-008-Database.md
```

## O que já existe — NÃO alterar

`prisma/schema.prisma` já tem: `User`, `Role`, `Category`, `Application`,
`Favorite`, `AuditLog`, `Account`, `Session`, `Permission`

## O que implementar

1. Adicionar models: `AppHealth`, `AppMetrics`, `MicroserviceTool`
2. Adicionar campos em `Application`: `healthCheckUrl`, `integrationType`, relações `health[]`, `metrics[]`, `tools[]`
3. Adicionar enum `AppStatus` e migrar campo `status` de String para enum
4. Migration principal: `prisma migrate dev --name add-health-metrics-tools`
5. Migration dedicada de índices com `CONCURRENTLY` (ver spec seção 4 e 6.1)
6. Atualizar `prisma/seed.ts` com `healthCheckUrl` para todos os apps
7. Configurar pg_cron para retenção (seção 5 da spec)

## Regra crítica

`$queryRaw` deve ser validado com **Zod** — nunca type assertion.
Ver exemplo completo na spec seção 6.1, Ajuste 1.

## Critérios de aceite

- [ ] `npx prisma migrate deploy` roda sem erros em ambiente limpo
- [ ] Models AppHealth, AppMetrics, MicroserviceTool criados com índices
- [ ] Application com healthCheckUrl e integrationType
- [ ] Migration de índices com CONCURRENTLY
- [ ] $queryRaw tipado com Zod
- [ ] Seed atualizado com healthCheckUrl
- [ ] pg_cron configurado

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "database-specialist", to: "backend-specialist", artifacts: ["prisma/schema.prisma", "prisma/migrations/"] })
```
