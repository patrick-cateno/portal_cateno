# PC-PLAN-011 — Health Checker

**Status:** Backlog
**Agente:** backend-specialist
**Prioridade:** Média
**Depende de:** PC-SPEC-007, PC-SPEC-009

## Critérios de aceitação

- [ ] Ciclo exato de 30s
- [ ] Máx 10 checks simultâneos
- [ ] Timeout 5s por check
- [ ] 503 + maintenance detectado corretamente
- [ ] Falha isolada por app
- [ ] Container no docker-compose.yml

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Scaffold health-checker/ com TypeScript | 30min |
| 2 | Implementar checker.ts (undici + timeout) | 2h |
| 3 | Implementar registry.ts (fetch + PATCH) | 1h |
| 4 | Implementar index.ts (cron + p-limit) | 1h |
| 5 | Dockerfile | 30min |
| 6 | Adicionar ao docker-compose.yml | 30min |
| 7 | Testes | 2h |
| **Total** | | **~7.5h** |
