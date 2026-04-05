# PC-PLAN-010 — Admin Panel

**Status:** Backlog
**Agente:** frontend-specialist
**Prioridade:** Média
**Depende de:** PC-SPEC-007, PC-SPEC-008

## Critérios de aceitação

- [ ] /admin bloqueado para não-admins
- [ ] CRUD aplicações completo
- [ ] CRUD categorias com drag-and-drop para reordenar
- [ ] Gestão de permissões por viewer
- [ ] Formulários Zod + React Hook Form
- [ ] Toast para todas as operações

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Layout /admin com guard requireRole('admin') | 1h |
| 2 | Tabela de aplicações com paginação | 3h |
| 3 | Formulário criar/editar aplicação | 3h |
| 4 | Server Actions (create, update, archive) | 2h |
| 5 | CRUD de categorias com reordenação | 3h |
| 6 | Gestão de permissões (viewer x app) | 3h |
| 7 | Testes | 2h |
| **Total** | | **~17h** |
