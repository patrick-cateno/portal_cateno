# Kickoff — PC-SPEC-012: CatIA Backend (LangGraph + Multi-Model)

**Agente:** feature-developer
**Wave:** 5 — requer pc-007 + pc-015 completos
**Estimativa:** ~28h

## Antes de começar

Confirme que pc-007 (Service Registry) e pc-015 (Tool Registry com loadToolsForUser()) estão completos.
Leia a spec completa:
```
.context/docs/specs/backlog/pc-012-CatIA-Backend/pc-spec-012-CatIA-Backend.md
```

## Decisões críticas de arquitetura

- **LangGraph mantido** — `@langchain/langgraph`
- **LangChain.js REMOVIDO** — desinstalar do package.json
- **SDKs nativos** — `@anthropic-ai/sdk` e `@google/generative-ai`
- **Multi-model por nó** — cada nó usa o modelo configurado via `.env`
- **Langflow** — apenas para experimentação, não é dependência de runtime

## O que implementar

```
src/lib/catia/
├── graph.ts                 # StateGraph com 6 nós
├── state.ts                 # Tipos do GraphState
├── model-factory.ts         # Cria clientes LLM por .env
├── nodes/
│   ├── intent.ts            # Classifica intenção
│   ├── orchestrator.ts      # Gemini 2.5 Pro — planeja e roteia
│   ├── search.ts            # Busca Prisma com RBAC
│   ├── tool-caller.ts       # Claude Sonnet — executa tools com loop agentic
│   ├── doc-processor.ts     # Claude Sonnet — processa documentos/PDFs
│   └── responder.ts         # Formata resposta final + chips de apps
└── prompts/
    ├── orchestrator.ts
    └── responder.ts

src/app/api/catia/chat/route.ts   # POST com streaming SSE
```

## Variáveis de ambiente necessárias

```env
CATIA_ORCHESTRATOR_PROVIDER=google
CATIA_ORCHESTRATOR_MODEL=gemini-2.5-pro
CATIA_TOOL_CALL_PROVIDER=anthropic
CATIA_TOOL_CALL_MODEL=claude-sonnet-4-5
CATIA_DOC_PROCESSOR_PROVIDER=anthropic
CATIA_DOC_PROCESSOR_MODEL=claude-sonnet-4-5
CATIA_SIMPLE_RESPONSE_PROVIDER=google
CATIA_SIMPLE_RESPONSE_MODEL=gemini-2.0-flash
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## Critérios de aceite

- [ ] LangChain.js removido do package.json
- [ ] SDKs nativos instalados e funcionando
- [ ] Model Factory cria clientes por .env
- [ ] StateGraph com 6 nós e roteamento condicional
- [ ] Streaming SSE chegando na interface (pc-005)
- [ ] Troca de modelo via .env sem mudança de código
- [ ] RBAC: CatIA acessa Prisma com roles do usuário
- [ ] Integração com loadToolsForUser() do pc-015

## Ao finalizar

```
workflow-manage({ action: "handoff", from: "feature-developer", to: "devops-specialist", artifacts: ["src/lib/catia/", "src/app/api/catia/"] })
```
