# Kickoff — PC-SPEC-010: Admin Panel — Gestão de Aplicações

**Agente:** frontend-specialist
**Wave:** 3 — requer pc-007 + pc-008 completos
**Estimativa:** ~17h

## Antes de começar

Confirme que pc-007 e pc-008 estão completos.
Leia a spec completa:
```
.context/docs/specs/backlog/pc-010-Admin-Panel/pc-spec-010-Admin-Panel.md
```

## O que implementar

```
src/app/(app)/admin/
├── layout.tsx                # Guard: requireRole('admin') → redirect /aplicacoes
├── page.tsx                  # Dashboard overview
├── aplicacoes/
│   ├── page.tsx              # Tabela com paginação e busca
│   ├── nova/page.tsx         # Form criar aplicação
│   └── [slug]/editar/page.tsx
├── categorias/page.tsx       # CRUD com drag-and-drop para reordenar
└── permissoes/page.tsx       # Tabela user x app (role viewer)
```

**Stack:**
- Formulários: `react-hook-form` + `zod`
- Tabelas: shadcn/ui `DataTable`
- Drag-and-drop categorias: `@dnd-kit/core`
- Feedback: shadcn/ui `toast`
- Server Actions em `actions.ts` por feature

**Regras críticas:**
- `requireRole('admin')` no layout — bloqueia toda a rota /admin
- Server Actions obtêm `userId` e `roles` da sessão no servidor — NUNCA do cliente
- `revalidatePath('/aplicacoes')` após mutações para atualizar o catálogo

## Critérios de aceite

- [ ] /admin bloqueado para não-admins (redirect para /aplicacoes)
- [ ] CRUD completo de aplicações
- [ ] CRUD de categorias com reordenação drag-and-drop
- [ ] Gestão de permissões viewer por app
- [ ] Formulários com validação Zod
- [ ] Toast para todas as operações
- [ ] Tabela com paginação e busca

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "frontend-specialist", to: "backend-specialist", artifacts: ["src/app/(app)/admin/"] })
```
