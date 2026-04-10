---
status: draft
generated: 2026-04-09
agents:
  - type: "feature-developer"
    role: "Implementar passagem de histórico para os nodes do CatIA"
  - type: "test-writer"
    role: "Testes de contexto multi-turn"
phases:
  - id: "phase-1"
    name: "Análise e Plano"
    prevc: "P"
    agent: "feature-developer"
  - id: "phase-2"
    name: "Implementação"
    prevc: "E"
    agent: "feature-developer"
  - id: "phase-3"
    name: "Validação"
    prevc: "V"
    agent: "test-writer"
---

# PC-SPEC-021 — CatIA: Memória de conversa multi-turn

> A CatIA perde contexto entre mensagens. "reserve a estação 102" seguido de "pra hoje" resulta em "O que você gostaria de fazer hoje?" porque cada request usa apenas a última mensagem.

## Problema

O graph state já tem `messages: Message[]` com todo o histórico da conversa, mas os nodes (orchestrator, tool-caller, responder) extraem apenas a última mensagem do usuário:

```typescript
// tool-caller.ts:29
const lastMessage = [...state.messages].reverse().find((m) => m.role === 'user')?.content ?? '';

// orchestrator prompt
Mensagem: "${lastMessage}"
```

O LLM recebe uma mensagem isolada, sem contexto do que foi dito antes.

## Objetivo

Manter contexto conversacional entre mensagens na mesma sessão do CatIA, permitindo que o usuário faça referências ao que disse antes ("pra hoje", "essa mesma", "cancela", etc.).

## Escopo

**Incluído:**
- Passar histórico de mensagens para o LLM nos nodes: orchestrator, tool-caller, responder
- Limitar histórico para evitar estouro de contexto (últimas N mensagens ou tokens)
- Manter tool results anteriores como contexto

**Excluído:**
- Persistência de conversas no banco (spec separada: PC-SPEC-022)
- UI de histórico de conversas (spec separada: PC-SPEC-022)

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/lib/catia/nodes/tool-caller.ts` | Usar histórico completo em vez de lastMessage |
| `src/lib/catia/nodes/orchestrator.ts` | Idem |
| `src/lib/catia/nodes/responder.ts` | Idem |
| `src/lib/catia/prompts/orchestrator.ts` | Receber e formatar histórico |
| `src/lib/catia/prompts/responder.ts` | Idem |
| `src/lib/catia/state.ts` | Verificar se Message[] já suporta roles adequados |
| `src/app/api/catia/chat/route.ts` | Verificar se passa histórico completo ao graph |

## Plano de implementação

### Fase 1 — Análise (P)

| # | Task | Status |
|---|------|--------|
| 1.1 | Mapear como state.messages é populado no chat/route.ts | pending |
| 1.2 | Verificar formato de Message (role, content, timestamp) | pending |
| 1.3 | Definir limite de histórico (ex: últimas 10 mensagens ou 4000 tokens) | pending |
| 1.4 | Identificar se Anthropic e Google aceitam o mesmo formato de histórico | pending |

### Fase 2 — Implementação (E)

| # | Task | Status |
|---|------|--------|
| 2.1 | Criar helper `buildMessageHistory(messages, maxMessages)` que formata o histórico | pending |
| 2.2 | Atualizar `tool-caller.ts` — Anthropic path: usar messages[] em vez de single message | pending |
| 2.3 | Atualizar `tool-caller.ts` — Google path: incluir histórico no systemContext | pending |
| 2.4 | Atualizar `orchestrator.ts` — incluir últimas mensagens para classificar intenção com contexto | pending |
| 2.5 | Atualizar `responder.ts` — incluir histórico para gerar resposta coerente | pending |
| 2.6 | Atualizar `chat/route.ts` se necessário — garantir que messages[] chega completo ao graph | pending |

### Fase 3 — Validação (V)

| # | Task | Status |
|---|------|--------|
| 3.1 | Testar: "reserve estação 102" -> "pra hoje" -> deve criar reserva para hoje | pending |
| 3.2 | Testar: "quais escritórios?" -> "e as salas do primeiro?" -> deve listar salas do escritório mencionado | pending |
| 3.3 | Testar: conversa longa (>10 mensagens) -> não deve estourar limite de tokens | pending |
| 3.4 | Testar: primeira mensagem da sessão -> deve funcionar sem histórico | pending |

## Critérios de aceite

- [ ] "reserve estação 102" seguido de "pra hoje" cria reserva corretamente
- [ ] Referências pronominais funcionam ("essa", "aquela", "a mesma")
- [ ] Histórico limitado a N mensagens para não estourar contexto
- [ ] Primeira mensagem sem histórico continua funcionando
- [ ] Nenhum teste existente quebrado

## Considerações técnicas

### Anthropic API
O Anthropic Messages API aceita array de messages com alternância user/assistant. Basta passar o histórico formatado.

### Google Generative AI
O Google `generateContent` aceita `contents` como array de turns. O systemContext vai no primeiro turn.

### Limite de contexto
Sugestão: últimas 10 mensagens (5 user + 5 assistant) ou truncar se > 4000 caracteres. Manter tool results das últimas 2 interações.
