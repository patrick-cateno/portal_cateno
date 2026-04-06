# PC-PLAN-018 — Documentação in-portal

**Status:** Backlog
**Agente:** frontend-specialist
**Prioridade:** Média
**Depende de:** PC-SPEC-003, PC-SPEC-002

## Critérios de aceite

- [ ] Item "Ajuda" na sidebar com divisor
- [ ] Link no dropdown do perfil
- [ ] /ajuda acessível após login
- [ ] Admin vê duas tabs, user/viewer vê uma
- [ ] Conteúdo completo em MDX (todas as seções)
- [ ] Navegação interna entre seções
- [ ] Design consistente com tokens Cateno

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Adicionar item Ajuda na sidebar com divisor | 30min |
| 2 | Adicionar link no dropdown do perfil | 30min |
| 3 | Criar estrutura de rotas /ajuda | 1h |
| 4 | Layout com tabs condicionais por role | 1h |
| 5 | Sidebar de navegação interna | 1h |
| 6 | Instalar e configurar next-mdx-remote ou @next/mdx | 30min |
| 7 | Escrever conteúdo Guia do Usuário (4 seções) | 3h |
| 8 | Escrever conteúdo Guia do Administrador (6 seções) | 4h |
| 9 | Estilizar com tokens Cateno | 1h |
| 10 | Testes: visibilidade por role, navegação | 1h |
| **Total** | | **~13.5h** |

## Artefatos de saída

- `src/app/(app)/ajuda/` — rotas e layout
- `src/content/ajuda/` — conteúdo MDX
- Sidebar e dropdown do perfil atualizados
