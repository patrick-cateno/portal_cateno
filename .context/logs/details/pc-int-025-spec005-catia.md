# PC-INT-025 — SPEC-005: CatIA Interface Conversacional

## Contexto

Implementação completa da SPEC-005 — assistente conversacional CatIA com LangGraph, LangChain.js e Google Gemini.

## Trabalho Realizado

### AI / LangGraph
- `src/lib/ai/model.ts` — factory de modelo LLM (Google Gemini padrão, configurável via .env)
- `src/lib/ai/intent.ts` — regex intent recognition (navigate, status, search, help)
- `src/lib/ai/graph.ts` — LangGraph StateGraph com 7 nós + roteamento condicional

### Grafo CatIA
```
intentRecognition → loadAppsWithRBAC → routeByIntent →
  ├─ handleNavigate (sem LLM)
  ├─ handleStatus (sem LLM)
  ├─ handleSearch (sem LLM)
  ├─ handleHelp (sem LLM)
  └─ generateResponse (com LLM)
→ END
```

### Componentes Criados
- `CatiaView` — orquestrador principal com state de mensagens, loading, envio
- `WelcomeScreen` — logo CatIA, greeting, 4 quick action buttons
- `MessageBubble` — bubbles user (teal) e AI (white/border) com markdown
- `ChatInput` — textarea auto-resize, Enter envia, Shift+Enter nova linha
- `TypingIndicator` — dots animados durante processamento
- `AppChip` — chip clicável [app:slug:nome] que navega para /aplicacoes

### Página e Server Action
- `src/app/(app)/catia/page.tsx` — Server Component com auth
- `src/app/(app)/catia/actions.ts` — `getChatResponse` com RBAC via LangGraph

### Dependências Instaladas
- `@langchain/core`, `@langchain/langgraph`, `@langchain/google-genai`, `react-markdown`

### Testes
- 12 testes intent recognition (navigate, status, search, help, null)
- 5 testes WelcomeScreen (greeting, buttons, prompts)
- 8 testes ChatInput (placeholder, onChange, send button, Enter/Shift+Enter, disabled)

## Artefatos

| Tipo | Arquivo |
|------|---------|
| Página | `src/app/(app)/catia/page.tsx` |
| Action | `src/app/(app)/catia/actions.ts` |
| Model | `src/lib/ai/model.ts` |
| Intent | `src/lib/ai/intent.ts` |
| Graph | `src/lib/ai/graph.ts` |
| View | `src/components/features/catia/catia-view.tsx` |
| Welcome | `src/components/features/catia/welcome-screen.tsx` |
| Bubble | `src/components/features/catia/message-bubble.tsx` |
| Input | `src/components/features/catia/chat-input.tsx` |
| Typing | `src/components/features/catia/typing-indicator.tsx` |
| Chip | `src/components/features/catia/app-chip.tsx` |
| Types | `src/types/chat.ts` |

## Resultado

- Commit: `47fd9ed`
- Branch: `feat/PC-005-catia-conversacional`
- PR: #7
- Testes: 197 passando (25 novos)
