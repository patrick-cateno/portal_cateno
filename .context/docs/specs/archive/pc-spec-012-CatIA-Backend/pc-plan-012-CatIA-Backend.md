# PC-PLAN-012 — CatIA Backend

**Status:** Backlog
**Agente:** feature-developer
**Prioridade:** Média
**Depende de:** PC-SPEC-005 (interface), PC-SPEC-007 (dados), PC-SPEC-015 (Tool Registry)

## Critérios de aceitação

- [ ] LangChain.js removido — apenas @langchain/langgraph no package.json
- [ ] SDKs nativos: @anthropic-ai/sdk e @google/generative-ai
- [ ] Model Factory com configuração por variável de ambiente
- [ ] StateGraph com 6 nós (intent, orchestrator, search, toolCaller, docProcessor, responder)
- [ ] Roteamento condicional por intent
- [ ] Streaming SSE funcional
- [ ] Troca de modelo via .env sem mudança de código
- [ ] RBAC no Prisma (vê apenas apps do usuário)

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Remover LangChain.js, instalar SDKs nativos | 30min |
| 2 | Implementar state.ts — tipos do GraphState | 1h |
| 3 | Implementar model-factory.ts | 1h |
| 4 | Implementar nó intent (classificação de intenção) | 2h |
| 5 | Implementar nó orchestrator (Gemini 2.5 Pro) | 3h |
| 6 | Implementar nó search (Prisma + RBAC) | 2h |
| 7 | Implementar nó tool-caller (Claude Sonnet + loop agentic) | 4h |
| 8 | Implementar nó doc-processor (Claude Sonnet + visão) | 3h |
| 9 | Implementar nó responder (formatação + chips) | 2h |
| 10 | Montar StateGraph com edges condicionais | 2h |
| 11 | API Route com streaming SSE | 2h |
| 12 | Integrar com interface PC-SPEC-005 | 2h |
| 13 | Configurar .env com todos os modelos | 30min |
| 14 | Testes de comportamento por intent | 3h |
| **Total** | | **~28h** |

## Artefatos de saída

- `src/lib/catia/` — grafo completo com nós
- `src/app/api/catia/chat/route.ts` — streaming SSE
- `.env.example` atualizado com variáveis de modelo
