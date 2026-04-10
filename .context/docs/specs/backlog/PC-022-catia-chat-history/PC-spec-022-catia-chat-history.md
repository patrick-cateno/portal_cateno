---
status: draft
generated: 2026-04-09
depends_on: PC-SPEC-021
agents:
  - type: "architect-specialist"
    role: "Design do schema e API de persistência"
  - type: "feature-developer"
    role: "Implementar backend e frontend"
  - type: "frontend-specialist"
    role: "UI da aba de histórico"
  - type: "test-writer"
    role: "Testes end-to-end"
phases:
  - id: "phase-1"
    name: "Design"
    prevc: "P"
    agent: "architect-specialist"
  - id: "phase-2"
    name: "Backend"
    prevc: "E"
    agent: "feature-developer"
  - id: "phase-3"
    name: "Frontend"
    prevc: "E"
    agent: "frontend-specialist"
  - id: "phase-4"
    name: "Validação"
    prevc: "V"
    agent: "test-writer"
---

# PC-SPEC-022 — CatIA: Histórico e persistência de conversas

> Persistir conversas da CatIA no banco e criar aba de histórico na UI para consultar e retomar conversas antigas.

**Depende de:** PC-SPEC-021 (multi-turn) concluída.

## Problema

Atualmente as conversas da CatIA existem apenas em memória (React state). Ao recarregar a página ou iniciar nova sessão, todo o histórico é perdido. O usuário não consegue:
- Consultar conversas anteriores
- Retomar uma conversa interrompida
- Buscar informações que já pediu antes

## Objetivo

1. Persistir conversas (mensagens + tool results) no banco PostgreSQL
2. Criar aba "Histórico" na UI do CatIA para listar conversas anteriores
3. Permitir retomar uma conversa (carregar mensagens no state e continuar)

## Escopo

**Incluído:**
- Schema Prisma para CatiaConversation e CatiaMessage
- API routes para CRUD de conversas
- UI: aba "Histórico" com lista de conversas, busca por data/conteúdo
- Botão "Retomar" para carregar conversa no chat
- Auto-save: cada mensagem é persistida automaticamente
- Soft delete de conversas

**Excluído:**
- Exportação de conversas (PDF, etc.)
- Compartilhamento de conversas entre usuários
- Analytics sobre conversas

## Schema proposto

```prisma
model CatiaConversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?              // Auto-gerado da primeira mensagem
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isActive  Boolean  @default(true)

  messages CatiaMessage[]
  user     User @relation(fields: [userId], references: [id])

  @@index([userId, updatedAt(sort: Desc)])
  @@map("catia_conversation")
}

model CatiaMessage {
  id             String   @id @default(cuid())
  conversationId String
  role           String               // 'user' | 'assistant' | 'tool'
  content        String
  toolResults    Json?                // Tool results se role = 'tool'
  createdAt      DateTime @default(now())

  conversation CatiaConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("catia_message")
}
```

## API Routes

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/catia/conversations` | Listar conversas do usuário (paginado) |
| GET | `/api/catia/conversations/[id]` | Buscar conversa com mensagens |
| POST | `/api/catia/conversations` | Criar nova conversa |
| PATCH | `/api/catia/conversations/[id]` | Atualizar título |
| DELETE | `/api/catia/conversations/[id]` | Soft delete |
| POST | `/api/catia/chat` | Atualizado: recebe conversationId, persiste mensagens |

## Plano de implementação

### Fase 1 — Design (P)

| # | Task | Status |
|---|------|--------|
| 1.1 | Definir schema Prisma final | pending |
| 1.2 | Definir API routes e contratos | pending |
| 1.3 | Wireframe da aba de histórico | pending |
| 1.4 | Decidir: auto-title (primeiras palavras da primeira mensagem) vs manual | pending |

### Fase 2 — Backend (E)

| # | Task | Status |
|---|------|--------|
| 2.1 | Criar migration Prisma com as novas tabelas | pending |
| 2.2 | Implementar API routes (conversations CRUD) | pending |
| 2.3 | Atualizar `/api/catia/chat` para receber conversationId e persistir mensagens | pending |
| 2.4 | Auto-create conversation na primeira mensagem se conversationId ausente | pending |
| 2.5 | Auto-title: usar primeiras ~50 chars da primeira mensagem do usuário | pending |

### Fase 3 — Frontend (E)

| # | Task | Status |
|---|------|--------|
| 3.1 | Criar aba "Histórico" no painel do CatIA (ao lado do chat) | pending |
| 3.2 | Lista de conversas com: título, data, preview da última mensagem | pending |
| 3.3 | Busca/filtro por texto ou data | pending |
| 3.4 | Botão "Retomar" — carrega mensagens no state do chat | pending |
| 3.5 | Botão "Nova conversa" — limpa chat e cria novo conversationId | pending |
| 3.6 | Indicador visual de conversa ativa vs nova | pending |

### Fase 4 — Validação (V)

| # | Task | Status |
|---|------|--------|
| 4.1 | Testar: enviar mensagens -> recarregar página -> conversa persiste | pending |
| 4.2 | Testar: retomar conversa antiga -> contexto multi-turn funciona | pending |
| 4.3 | Testar: buscar conversa por texto | pending |
| 4.4 | Testar: soft delete de conversa | pending |
| 4.5 | Testar: paginação com muitas conversas | pending |

## Critérios de aceite

- [ ] Mensagens persistidas no banco automaticamente
- [ ] Aba "Histórico" lista conversas anteriores do usuário
- [ ] "Retomar" carrega conversa com contexto multi-turn funcional
- [ ] Busca por texto encontra conversas relevantes
- [ ] Soft delete funciona
- [ ] Nenhum teste existente quebrado

## UI — Referência visual

```
┌─────────────────────────────────────────────┐
│  CatIA                     [Histórico] [+]  │
├─────────────────────────────────────────────┤
│                                             │
│  [Conversa atual ou lista de histórico]     │
│                                             │
├─────────────────────────────────────────────┤
│  [Input de mensagem]                   [>]  │
└─────────────────────────────────────────────┘
```

Ao clicar em "Histórico":
```
┌─────────────────────────────────────────────┐
│  < Voltar ao chat          [Buscar...]      │
├─────────────────────────────────────────────┤
│  09/04 — "reserve a estação 102..."    [>]  │
│  08/04 — "quais escritórios temos?"    [>]  │
│  07/04 — "status dos apps"             [>]  │
│  ...                                        │
└─────────────────────────────────────────────┘
```
