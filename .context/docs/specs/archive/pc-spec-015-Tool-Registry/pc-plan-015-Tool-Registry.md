# PC-PLAN-015 — Tool Registry Dinâmico

**Status:** Backlog
**Agente:** backend-specialist + architect-specialist
**Prioridade:** Média — necessário para operações de negócio via CatIA
**Depende de:** PC-SPEC-012, PC-SPEC-008, PC-SPEC-010

## Critérios de aceitação

- [ ] Model MicroserviceTool no Prisma
- [ ] POST /api/tools/register funcionando
- [ ] loadToolsForUser() com filtro por role
- [ ] executeTool() com JWT do usuário propagado
- [ ] Integração com nó tool-caller do CatIA
- [ ] Admin Panel com gestão de tools
- [ ] Teste E2E: cadastrar vaga via CatIA ponta a ponta

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Adicionar MicroserviceTool ao schema Prisma | 1h |
| 2 | POST /api/tools/register (admin ou service account) | 2h |
| 3 | GET /api/tools — listagem para o admin panel | 1h |
| 4 | PATCH /api/tools/[id] — ativar/desativar | 1h |
| 5 | Implementar loadToolsForUser() com RBAC | 2h |
| 6 | Implementar executeTool() com JWT propagation | 2h |
| 7 | Integrar com nó tool-caller do PC-SPEC-012 | 2h |
| 8 | Adicionar seção de tools ao Admin Panel (PC-SPEC-010) | 3h |
| 9 | Seed de tools de exemplo (gestão de vagas) | 1h |
| 10 | Teste E2E ponta a ponta | 3h |
| **Total** | | **~18h** |

## Artefatos de saída

- `prisma/schema.prisma` — com MicroserviceTool
- `src/app/api/tools/` — API Routes de registro e gestão
- `src/lib/catia/tools/registry.ts` e `executor.ts`
- Documentação para times de microsserviços: como registrar tools
