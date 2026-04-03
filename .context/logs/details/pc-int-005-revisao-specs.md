# PC-INT-005 — Revisão das 6 SPECs do Backlog

| Campo          | Valor            |
| -------------- | ---------------- |
| **ID**         | PC-INT-005       |
| **Início**     | 2026-04-03T10:00 |
| **Fim**        | 2026-04-03T11:30 |
| **Branch**     | — (documentação) |
| **Fase PREVC** | Review           |

## Descrição

Revisão completa de todas as 6 SPECs do backlog do Portal Cateno, com perguntas ao Patrick para cada SPEC e aplicação imediata das correções decididas.

## Decisões Tomadas

### PC-SPEC-001 — Setup do Projeto

- PostgreSQL + Docker Compose (em vez de SQLite)
- Tabela Role separada (com @@unique)
- Route group `(app)` (em vez de `(main)` ou `(portal)`)
- Adicionadas pastas `src/lib/validations/` e `src/config/`

### PC-SPEC-002 — Autenticação

- AuditLog unificado: mesclados campos de SPEC-001 (entity, entityId, changes) e SPEC-002 (ipAddress, userAgent)
- Sem auto-cadastro (signup): usuários criados via OAuth ou admin. Email/password disponível para login.
- Rate limiting via Map em memória (MVP), Redis futuro
- User model: SPEC-002 estende SPEC-001 incrementalmente (documentado com comentários)

### PC-SPEC-003 — Layout e Navegação

- Componentes em `src/components/features/navigation/`, wrapper em `layouts/`
- Favoritos na sidebar → filtro na Visão Cards (`/aplicacoes?filtro=favoritos`)
- View Toggle (Aplicações/CatIA) apenas no header, não na sidebar
- Sidebar contém navegação secundária: Início, Favoritos (atalho), Suporte, Admin
- URLs em português: /aplicacoes, /catia, /inicio, /suporte, /admin

### PC-SPEC-004 — Visão Cards

- Correção de segurança: userId obtido da session no servidor, nunca passado do cliente
- Suporte a query param `?filtro=favoritos` para integração com sidebar
- RBAC: MVP com restrição fixa no código, configurável por admin no futuro

### PC-SPEC-005 — CatIA Conversacional

- Segurança: userId e RBAC aplicados no servidor (não do cliente)
- Intent recognition: regex-first para padrões simples, LLM como fallback
- Enter para enviar, Shift+Enter para quebra de linha
- Sanitização de respostas do LLM obrigatória (DOMPurify)

### PC-SPEC-006 — Design System Tokens

- CatenoLogo como Server Component (SVG puro, sem 'use client')
- Ordem de implementação confirmada: 001 → 006 → 002 → 003 → 004 → 005

## Artefatos Modificados

- `.context/docs/specs/backlog/pc-spec-001-projeto-setup/pc-spec-001-projeto-setup.md`
- `.context/docs/specs/backlog/pc-spec-002-autenticacao/pc-spec-002-autenticacao.md`
- `.context/docs/specs/backlog/pc-spec-003-layout-navegacao/pc-spec-003-layout-navegacao.md`
- `.context/docs/specs/backlog/pc-spec-004-visao-cards/pc-spec-004-visao-cards.md`
- `.context/docs/specs/backlog/pc-spec-005-catia-conversacional/pc-spec-005-catia-conversacional.md`
- `.context/docs/specs/backlog/pc-spec-006-design-system-tokens/pc-spec-006-design-system-tokens.md`

## Referência

- [← Voltar ao Log](../interaction-log.md)
