# PC-PLAN-014 — Deployment

**Status:** Backlog
**Agente:** devops-specialist
**Prioridade:** Baixa — última etapa
**Depende de:** Todas as specs anteriores

## Critérios de aceitação

- [ ] docker compose up funcional do zero
- [ ] Dockerfile multi-stage com standalone Next.js
- [ ] prisma migrate no boot do container
- [ ] Keycloak com import automático
- [ ] CI/CD em menos de 10min
- [ ] .env.example documentado

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Atualizar docker-compose.yml (portal + keycloak + health-checker) | 2h |
| 2 | Dockerfile Next.js multi-stage com standalone | 2h |
| 3 | Adicionar `output: 'standalone'` no next.config.ts | 15min |
| 4 | Dockerfile health-checker | 30min |
| 5 | GitHub Actions CI/CD | 2h |
| 6 | .env.example atualizado | 30min |
| 7 | Validação E2E do zero | 2h |
| **Total** | | **~9h** |
