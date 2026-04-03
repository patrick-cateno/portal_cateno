# PC-INT-014 — SPEC-005: LangChain.js → LangGraph + Langflow

| Campo          | Valor                           |
| -------------- | ------------------------------- |
| **ID**         | PC-INT-014                      |
| **Início**     | 2026-04-03T11:52 -03            |
| **Fim**        | 2026-04-03T12:05 -03            |
| **Duração**    | ≈13 min                         |
| **Branch**     | —                               |
| **Tokens in**  | sem dados (contexto compactado) |
| **Tokens out** | sem dados (contexto compactado) |

## Contexto

Patrick questionou a escolha do Vercel AI SDK: "na spec005, vc fala em vercel ai sdk, me explique essa escolha e alternativas". Depois aprofundou: "o que me diz sobre a utilização de langgraph e langflow?"

## Decisões (via AskUserQuestion)

1. **SDK base**: LangChain.js (não Vercel AI SDK)
2. **Provider LLM**: Google Gemini (gemini-2.0-flash)
3. **Orquestração**: LangGraph StateGraph + Langflow para design visual

## O que foi feito

Reescrita extensiva da SPEC-005:

- Objetivo reformulado para arquitetura LangGraph StateGraph
- Escopo inclui: LangGraph, LangChain.js, Google Gemini, Langflow
- RF-005-03 reescrito para LangGraph StateGraph com nós nomeados
- RF-005-23 adicionado: CatIAState tipado
- RF-005-24 adicionado: routeByIntent com roteamento condicional
- RF-005-25 adicionado: Langflow via Docker Compose
- RNF-005-13 adicionado: Langflow para prototipagem
- Código reorganizado em 3 arquivos:
  - `src/lib/ai/model.ts` — Factory LLM (Gemini/OpenAI/Anthropic)
  - `src/lib/ai/graph.ts` — LangGraph StateGraph com 5 nós
  - `src/lib/ai/intent.ts` — Reconhecimento de intent por regex
- Grafo: intentRecognition → loadAppsWithRBAC → routeByIntent → handle\* → END
- Langflow adicionado ao Docker Compose (port 7860, profile "ai")
- Env vars: AI_PROVIDER, AI_MODEL, GOOGLE_AI_API_KEY, LANGFLOW_PORT

## Arquivos modificados

- `pc-spec-005-catia-conversacional.md` — reescrita completa
- `pc-spec-001-projeto-setup.md` — Langflow no Docker Compose
