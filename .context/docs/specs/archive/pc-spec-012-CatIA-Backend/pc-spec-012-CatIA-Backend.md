# PC-SPEC-012 — CatIA Backend (LangGraph + Multi-Model + SDKs Nativos)

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | PC-SPEC-012                |
| **Status**       | Concluída                  |
| **Prioridade**   | Média                      |
| **Complexidade** | Alta                       |
| **Autor**        | Patrick Iarrocheski        |
| **Branch**       | feat/PC-012-catia-backend  |

## 1. Objetivo

Implementar o backend do CatIA como API Route do Next.js usando LangGraph como orquestrador de grafo de estados, com suporte a múltiplos LLMs configuráveis por nó. O CatIA evolui de assistente de navegação para agente autônomo de negócio, capaz de executar operações reais nos microsserviços da Cateno.

## 2. Decisões de Arquitetura

### 2.1 LangGraph — mantido como orquestrador

StateGraph com nós tipados e edges condicionais é a escolha correta para um agente com fluxos multi-etapa, estado persistente e operações de negócio complexas.

### 2.2 LangChain.js — removido do runtime

LangChain.js como abstração de LLM é removido. Cada nó usa o SDK nativo do provider diretamente:

```typescript
// SEM LangChain — SDKs nativos
import { StateGraph } from "@langchain/langgraph";    // LangGraph: mantido
import Anthropic from "@anthropic-ai/sdk";             // SDK nativo Anthropic
import { GoogleGenerativeAI } from "@google/generative-ai"; // SDK nativo Google
```

### 2.3 Multi-model por nó — o modelo é configuração, não arquitetura

Trocar de Gemini para Claude em um nó é uma variável de ambiente, não uma mudança de código. O grafo não conhece qual modelo cada nó usa — recebe como parâmetro.

```typescript
// Configuração por nó via .env
CATIA_ORCHESTRATOR_PROVIDER=google
CATIA_ORCHESTRATOR_MODEL=gemini-2.5-pro

CATIA_TOOL_CALL_PROVIDER=anthropic
CATIA_TOOL_CALL_MODEL=claude-sonnet-4-5

CATIA_SIMPLE_RESPONSE_PROVIDER=google
CATIA_SIMPLE_RESPONSE_MODEL=gemini-2.0-flash
```

### 2.4 Langflow — mantido como ferramenta de design

Langflow permanece no docker-compose com `profile: ai`. É usado pelo time para modelar e experimentar fluxos visualmente — não é dependência de runtime.

### 2.5 Visão de longo prazo

O CatIA não é apenas um assistente de navegação. A arquitetura deve suportar:
- Cadastrar vaga de contratação passando perfil desejado
- Submeter documentos para confecção de contratos
- Consultar lista de fornecedores e profissionais vinculados
- Qualquer operação exposta pelos microsserviços integrados

Isso exige Tool Registry dinâmico (ver PC-SPEC-015) e state management para fluxos multi-etapa.

## 3. Estrutura

```
src/
├── app/api/catia/
│   └── chat/route.ts           # POST — streaming SSE
└── lib/catia/
    ├── graph.ts                 # StateGraph principal
    ├── state.ts                 # Tipos do estado do grafo
    ├── model-factory.ts         # Cria instâncias de LLM por configuração
    ├── nodes/
    │   ├── orchestrator.ts      # Gemini 2.5 Pro — planeja, roteia
    │   ├── intent.ts            # Reconhece intenção do usuário
    │   ├── tool-caller.ts       # Claude Sonnet — executa tools/APIs
    │   ├── doc-processor.ts     # Claude Sonnet — processa documentos
    │   ├── search.ts            # Busca apps no Prisma com RBAC
    │   └── responder.ts         # Formata resposta final para o usuário
    ├── tools/
    │   ├── registry.ts          # Carrega tools do Tool Registry (PC-SPEC-015)
    │   ├── applications.ts      # Tool: buscar/filtrar apps
    │   ├── status.ts            # Tool: status do portal
    │   └── index.ts             # Exporta todas as tools disponíveis
    └── prompts/
        ├── orchestrator.ts      # System prompt do orquestrador
        └── responder.ts         # System prompt da resposta final
```

## 4. Model Factory — abstração leve sobre SDKs nativos

```typescript
// src/lib/catia/model-factory.ts
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelConfig = {
  provider: "anthropic" | "google";
  model: string;
};

export function getModelConfig(nodeKey: string): ModelConfig {
  const provider = process.env[`CATIA_${nodeKey}_PROVIDER`] as "anthropic" | "google";
  const model = process.env[`CATIA_${nodeKey}_MODEL`]!;
  return { provider, model };
}

export function createAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function createGoogleClient(model: string) {
  const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  return google.getGenerativeModel({ model });
}
```

## 5. StateGraph

```typescript
// src/lib/catia/graph.ts
import { StateGraph, Annotation, END } from "@langchain/langgraph";

const GraphState = Annotation.Root({
  messages:      Annotation<Message[]>({ reducer: (x, y) => x.concat(y) }),
  intent:        Annotation<string>(),
  plan:          Annotation<string[]>(),      // Passos planejados pelo orquestrador
  toolResults:   Annotation<ToolResult[]>({ reducer: (x, y) => x.concat(y) }),
  documents:     Annotation<Document[]>(),    // Documentos submetidos pelo usuário
  apps:          Annotation<AppSummary[]>(),  // Apps retornados para chips
  userId:        Annotation<string>(),
  userRoles:     Annotation<string[]>(),
  error:         Annotation<string | null>(),
});

function routeByIntent(state: typeof GraphState.State) {
  switch (state.intent) {
    case "search_apps":    return "search";
    case "get_status":     return "search";
    case "business_op":    return "toolCaller";    // Vaga, contrato, fornecedores...
    case "process_doc":    return "docProcessor";  // PDF, arquivo
    default:               return "responder";
  }
}

const graph = new StateGraph(GraphState)
  .addNode("intent",       intentNode)
  .addNode("orchestrator", orchestratorNode)
  .addNode("search",       searchNode)
  .addNode("toolCaller",   toolCallerNode)
  .addNode("docProcessor", docProcessorNode)
  .addNode("responder",    responderNode)
  .addEdge("__start__", "intent")
  .addEdge("intent", "orchestrator")
  .addConditionalEdges("orchestrator", routeByIntent)
  .addEdge("search",       "responder")
  .addEdge("toolCaller",   "responder")
  .addEdge("docProcessor", "responder")
  .addEdge("responder",    END)
  .compile();
```

## 6. Nó Orquestrador (Gemini 2.5 Pro)

```typescript
// src/lib/catia/nodes/orchestrator.ts
export async function orchestratorNode(state: typeof GraphState.State) {
  const config = getModelConfig("ORCHESTRATOR");
  const model = createGoogleClient(config.model);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: buildOrchestratorPrompt(state) }] }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(result.response.text());
  return { intent: parsed.intent, plan: parsed.steps };
}
```

## 7. Nó Tool Caller (Claude Sonnet)

```typescript
// src/lib/catia/nodes/tool-caller.ts
export async function toolCallerNode(state: typeof GraphState.State) {
  const anthropic = createAnthropicClient();
  const config = getModelConfig("TOOL_CALL");

  // Tools carregadas do Tool Registry (PC-SPEC-015) — dinâmicas por microsserviço
  const tools = await loadToolsForUser(state.userRoles);

  const response = await anthropic.messages.create({
    model: config.model,
    max_tokens: 4096,
    tools,
    messages: buildToolCallerMessages(state),
  });

  // Loop agentic — máx 5 iterações
  // (implementar aqui)

  return { toolResults: extractResults(response) };
}
```

## 8. API Route com Streaming SSE

```typescript
// src/app/api/catia/chat/route.ts
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { message, history, documents } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      try {
        for await (const chunk of graph.stream({
          messages: [...history, { role: "user", content: message }],
          documents: documents ?? [],
          userId: session.user.id,
          userRoles: session.user.roles,
        })) {
          // Emite chunks por nó conforme o grafo avança
          if (chunk.responder) send("delta", { text: chunk.responder.text });
          if (chunk.search)    send("apps",  { apps: chunk.search.apps });
        }
        send("done", {});
      } catch (err) {
        send("error", { message: "Erro interno do CatIA" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

## 9. Variáveis de ambiente

```env
# Orquestrador — planeja e roteia
CATIA_ORCHESTRATOR_PROVIDER=google
CATIA_ORCHESTRATOR_MODEL=gemini-2.5-pro

# Tool Calling — executa operações de negócio
CATIA_TOOL_CALL_PROVIDER=anthropic
CATIA_TOOL_CALL_MODEL=claude-sonnet-4-5

# Processamento de documentos
CATIA_DOC_PROCESSOR_PROVIDER=anthropic
CATIA_DOC_PROCESSOR_MODEL=claude-sonnet-4-5

# Respostas simples — velocidade e custo
CATIA_SIMPLE_RESPONSE_PROVIDER=google
CATIA_SIMPLE_RESPONSE_MODEL=gemini-2.5-flash

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## 10. Critérios de Aceite

- [ ] LangChain.js removido do package.json — apenas `@langchain/langgraph`
- [ ] SDKs nativos: `@anthropic-ai/sdk` e `@google/generative-ai`
- [ ] Model Factory cria clientes por variável de ambiente
- [ ] StateGraph com 6 nós funcionando (intent, orchestrator, search, toolCaller, docProcessor, responder)
- [ ] Roteamento condicional por intent funciona
- [ ] Streaming SSE chegando na interface do PC-SPEC-005
- [ ] Troca de modelo via .env sem mudança de código
- [ ] RBAC: CatIA acessa Prisma com roles do usuário
- [ ] Integração com Tool Registry (PC-SPEC-015) via interface definida

## 11. Notas de Implementação

> Adicionado pós-verificação (2026-04-07)

### 11.1 URL Rewriting para desenvolvimento local

As tools registradas no banco de dados guardam URLs canônicas de produção (ex: `https://api.cateno.com.br/reservas/v1/escritorios`). Em dev, esses domínios não resolvem.

**Solução:** O executor aplica rewrites em runtime via `CATIA_URL_REWRITES` (env var JSON). Se a variável não existe (prod), nenhum rewrite acontece — zero risco de URLs erradas em produção.

```env
# .env.local (somente dev)
CATIA_URL_REWRITES={"https://api.cateno.com.br/reservas":"http://localhost:3001"}
```

### 11.2 Headers Kong em chamadas diretas (dev)

Em produção, as chamadas do CatIA passam pelo Kong API Gateway, que valida o JWT e injeta headers `x-consumer-custom-id`, `x-consumer-username` e `x-authenticated-groups`. Os microsserviços autenticam via esses headers — não leem o JWT diretamente.

Quando o executor detecta que uma URL foi reescrita (dev/staging bypass do Kong), ele injeta automaticamente esses headers usando o `userId` e `userRoles` do state do grafo. Isso garante que os microsserviços recebam identidade do usuário sem precisar do Kong.

### 11.3 Logging estruturado do pipeline

Todos os nós do grafo emitem logs com prefixo `[catia:*]` para facilitar debug:

| Prefixo | O que loga |
|---|---|
| `[catia:intent]` | Regex match, intent classificado, mensagem |
| `[catia:orchestrator]` | Intent refinado pelo LLM, steps, reasoning |
| `[catia:graph]` | Roteamento intent → nó |
| `[catia:search]` | Apps encontrados, slugs |
| `[catia:tool-caller]` | Provider, model, tools carregadas, tool selecionada |
| `[catia:executor]` | URL rewrite, HTTP call, status, headers injetados |
| `[catia:responder]` | Preview da resposta |

### 11.4 Modelos atualizados

- Default do model-factory atualizado de `gemini-2.0-flash` (descontinuado) para `gemini-2.5-flash`
- Tool calling em dev usa `gemini-2.5-flash` por estabilidade (Gemini 2.5 Pro pode retornar 503 em alta demanda)
- Anthropic permanece como opção via env var para tool calling nativo

### 11.5 accessToken na session NextAuth

O callback `session` do NextAuth agora expõe `token.accessToken` (JWT do Keycloak) na session. Isso permite que API routes acessem o token para propagá-lo aos microsserviços em produção via Kong.

## 12. Dependências

- **Depende de:** PC-SPEC-005 (interface), PC-SPEC-007 (dados), PC-SPEC-002 (auth)
- **Depende de:** PC-SPEC-015 (Tool Registry) para operações de negócio
- **Não é bloqueante** para outras specs
