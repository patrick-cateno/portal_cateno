# PC-SPEC-005 — CatIA Interface Conversacional

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | PC-SPEC-005                      |
| **Status**       | Done                             |
| **Prioridade**   | Alta                             |
| **Complexidade** | Alta                             |
| **Criado em**    | 2026-04-03                       |
| **Autor**        | Patrick Iarrocheski              |
| **Branch**       | feat/PC-005-catia-conversacional |

## 1. Objetivo

Implementar CatIA, um assistente conversacional inteligente que ajuda usuários a navegar, buscar e interagir com aplicações do Portal Cateno. Arquitetura baseada em **LangGraph** (grafo de estados) com **Google Gemini** como provider padrão, orquestrada pelo ecossistema **LangChain.js**. **Langflow** como ferramenta visual de design e experimentação de fluxos de IA. Reconhecimento de intenção, sugestões rápidas e integração com registry de aplicações. Preparado para evoluir com RAG, tool calling e agents autônomos.

## 2. Escopo

### 2.1 Incluído

- Interface de chat: layout com message bubbles (user teal, AI white com border)
- **LangGraph** (StateGraph) para orquestração de fluxo conversacional com nós tipados e streaming
- **LangChain.js** como base para models, prompts, parsers e integrations
- **Google Gemini** como provider padrão (configurável via .env para OpenAI, Anthropic)
- **Langflow** como ferramenta visual para design, teste e exportação de fluxos de IA (instância via Docker Compose)
- Message history per session (in-memory, sem persistência inicial)
- Welcome screen com branding CatIA (sparkles icon, gradient teal)
- Intent recognition: navigate to app, query app status, search apps, general help
- Quick action buttons: Status de Apps, Aplicações Populares, Anti-fraude, Ajuda
- Application chips em respostas (name, icon, clickable → card view)
- Typing indicator animation enquanto AI responde
- Message timestamps
- Input field com Enter para enviar, placeholder com sugestões
- Markdown rendering: bold, lists, emojis em respostas
- Integration com Application registry (Prisma query)
- Error handling com retry se AI falha
- Conversation clearing (nova conversa)
- RBAC: CatIA vê apenas apps que usuário tem permissão
- Mobile responsive (bottom input, scrollable messages)

### 2.2 Excluído

- Persistência de histórico (será futuro com DB)
- Análise de sentimento
- Integração com APIs externas reais (será futuro)
- Voice input/output
- Multi-language (será futuro)
- Custom assistant training
- Integração com aplicações para execução de ações

## 3. Requisitos Funcionais

| ID        | Descrição                                                                                                                                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-005-01 | Chat interface deve renderizar com message bubbles, user (teal-600) e AI (white border)                                                                                                                                                                                            |
| RF-005-02 | Welcome screen deve mostrar logo CatIA, greeting, quick action buttons                                                                                                                                                                                                             |
| RF-005-03 | LangGraph (StateGraph) deve orquestrar o fluxo conversacional com nós: intentRecognition → routeByIntent → (navigate \| queryStatus \| search \| generateResponse) → formatOutput. Provider padrão: Google Gemini via LangChain.js. Configurável via .env (AI_PROVIDER + AI_MODEL) |
| RF-005-04 | Respostas do AI devem fazer streaming via LangGraph streaming (aparecem char-by-char) com loading state                                                                                                                                                                            |
| RF-005-05 | Typing indicator deve aparecer enquanto AI processa, desaparecer quando responde                                                                                                                                                                                                   |
| RF-005-06 | Intent recognition deve usar regex/keyword matching primeiro, LLM como fallback para intents ambíguos. Identificar: navigate app, query status, search, help                                                                                                                       |
| RF-005-07 | Navegação via chat: "Abrir Cartões" deve recognizer intent, sugerir app card                                                                                                                                                                                                       |
| RF-005-08 | Query status: "Como está Anti-fraude?" deve buscar status, retornar com chip                                                                                                                                                                                                       |
| RF-005-09 | Search apps: "Quais apps são de Operações?" deve filtrar, listar com chips                                                                                                                                                                                                         |
| RF-005-10 | Quick buttons: clique → pre-filled prompt, send automático                                                                                                                                                                                                                         |
| RF-005-11 | Application chips em resposta: exibir ícone, nome, clickable → redireciona card                                                                                                                                                                                                    |
| RF-005-12 | Markdown rendering: **bold**, _italic_, - lists, # headings, emojis                                                                                                                                                                                                                |
| RF-005-13 | Conversation history deve manter últimas 20 mensagens por sessão                                                                                                                                                                                                                   |
| RF-005-14 | Typing indicator: small dots animation, apareça instantly, desapareça suave                                                                                                                                                                                                        |
| RF-005-15 | Message timestamps: hora simples (14:30) à direita de cada mensagem                                                                                                                                                                                                                |
| RF-005-16 | Input placeholder: sugestões (ex: "Pergunte sobre apps, status, ou peça ajuda")                                                                                                                                                                                                    |
| RF-005-17 | Enter para enviar mensagem, Shift+Enter para quebra de linha (padrão ChatGPT/WhatsApp Web)                                                                                                                                                                                         |
| RF-005-18 | RBAC: CatIA queries apps com filtro de permissão do usuário (mesmo filtro RBAC da SPEC-004)                                                                                                                                                                                        |
| RF-005-19 | Error handling: se AI falha, mostrar mensagem "Desculpe, erro ao processar"                                                                                                                                                                                                        |
| RF-005-20 | "Nova conversa" button deve limpar history e voltar à welcome screen                                                                                                                                                                                                               |
| RF-005-21 | SEGURANÇA: Server Actions de chat devem obter userId da session (await auth()), nunca do cliente                                                                                                                                                                                   |
| RF-005-22 | SEGURANÇA: Query de contexto do LLM deve aplicar RBAC — CatIA só "conhece" apps que o usuário tem permissão                                                                                                                                                                        |
| RF-005-23 | LangGraph StateGraph deve ter estado tipado (CatIAState) com: messages, intent, apps, userId, streaming. Cada nó recebe e retorna estado parcial                                                                                                                                   |
| RF-005-24 | Nó de roteamento (routeByIntent) deve direcionar para sub-grafos específicos conforme intent: navigate → resposta com chip, status → query Prisma + formatação, search → filtro + lista, general → LLM livre                                                                       |
| RF-005-25 | Langflow deve estar disponível via Docker Compose (porta 7860) para design e teste de fluxos. Fluxos exportados do Langflow devem ser convertíveis para LangGraph no código                                                                                                        |

## 4. Requisitos Não-Funcionais

| ID         | Categoria        | Descrição                                                                                                                    |
| ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| RNF-005-01 | Performance      | Streaming início em < 500ms, char render < 50ms cada                                                                         |
| RNF-005-02 | Performance      | Chat scroll smooth mesmo com muitas mensagens (100+)                                                                         |
| RNF-005-03 | Acessibilidade   | Chat messages com role=log, aria-live=polite                                                                                 |
| RNF-005-04 | Acessibilidade   | Teclado navegável: Tab focusa input, Shift+Tab histórico                                                                     |
| RNF-005-05 | Acessibilidade   | Screen reader announces nova mensagem, intent actions                                                                        |
| RNF-005-06 | Segurança        | Prompts do usuário nunca expostos em UI, sanitize HTML                                                                       |
| RNF-005-07 | Segurança        | API key do LLM em .env, nunca no cliente                                                                                     |
| RNF-005-08 | UX               | Responsivo mobile: input bottom sticky, scroll auto ao nova msg                                                              |
| RNF-005-09 | UX               | Animações suaves, nenhuma quebra de layout                                                                                   |
| RNF-005-10 | Escalabilidade   | Suporte 100+ mensagens por conversa sem lentidão                                                                             |
| RNF-005-11 | Integrações      | LangGraph + LangChain.js abstraem provider (Gemini, OpenAI, Claude). Arquitetura de grafo preparada para RAG, tools e agents |
| RNF-005-12 | Manutenibilidade | Intent logic em arquivo separado, fluxo como grafo (nós isolados), fácil de extender                                         |
| RNF-005-13 | DX               | Langflow disponível em dev (Docker Compose, porta 7860) para prototipagem visual de fluxos antes de codificar                |

## 5. Interface / UX

### Layout Page

```
┌────────────────────────────────────────────────────────┐
│ Header (PC-SPEC-003)                                   │
├────────────────────────────────────────────────────────┤
│ [Welcome Screen] ou [Chat Container]                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [CatIA Logo + Sparkles] [✕ Nova conversa]       │ │
│  │ "Olá! Eu sou a CatIA..."                        │ │
│  │ [Status Apps] [Populares] [Anti-fraude] [Ajuda] │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ou                                                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [User message - teal] 14:30                     │ │
│  │                                                 │ │
│  │ [AI message - white border] 14:31               │ │
│  │ [App Chip] [App Chip]                          │ │
│  │                                                 │ │
│  │ [Typing indicator...] (se processando)         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ [Input placeholder: "Pergunte sobre apps..."] │ ✓ ││
│ └────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

### Welcome Screen

**Layout:**

- Centered, padding 60px top
- Logo CatIA: sparkles icon 64x64, teal-600
- Greeting heading: "Olá! Eu sou a CatIA 🎉"
- Subtext: "Sua assistente para navegar aplicações Cateno. Pergunte-me sobre apps, status, ou peça sugestões!"
- Quick buttons grid: 2x2 em mobile, 1x4 em desktop

**Quick Action Buttons:**

```
[⚙ Status de Apps] [⭐ Populares]
[🛡 Anti-fraude]   [❓ Ajuda]
```

- Size: 120x80px (mobile), 140x100px (desktop)
- Style: border 1px teal-200, bg white, hover → bg teal-50
- Icon: 24px, color teal-600
- Label: 12px, neutral-900 bold
- onClick: pre-fill input + send automático

**Quick Button Prompts:**

- Status Apps: "Qual é o status de todas as aplicações?"
- Populares: "Quais são as aplicações mais populares?"
- Anti-fraude: "Abrir Anti-fraude"
- Ajuda: "Como posso usar a CatIA?"

### Chat Container

**Header:**

- H2: "CatIA"
- Subtext: "Assistente de aplicações"
- Button "Nova conversa": ⟳ icon, white-space, float right

**Messages Area:**

- Max-width 600px, centered
- Scroll container, max-height 60vh
- Padding: 20px
- Scroll-behavior: smooth
- Auto-scroll ao nova mensagem

**User Message Bubble:**

```
                    [User Message 14:30]
      ┌────────────────────────────────┐
      │ Qual é o status da aplicação  │
      │ de Cartões?                  │
      └────────────────────────────────┘
      Text: neutral-50 (white)
      Background: teal-600
      Border-radius: 12px
      Align: right
      Max-width: 80%
      Padding: 12px 16px
```

**AI Message Bubble:**

```
┌────────────────────────────────────────┐
│ A aplicação Cartões está online e     │ 14:30
│ funcionando normalmente. Tem 5.2k       │
│ usuários ativos.                       │
│                                        │
│ [🎫 Cartões] [📊 Dashboard Cartões]   │
└────────────────────────────────────────┘
Text: neutral-900
Background: white
Border: 1px teal-200
Border-radius: 12px
Align: left
Max-width: 80%
Padding: 12px 16px
Shadow: sm

Markdown:
- **bold** → font-weight 600
- *italic* → font-style italic
- [link] → text-teal-600 underline
- - list → ul > li
```

**Typing Indicator:**

```
┌─────────────────┐
│ ●●● (animação)  │
└─────────────────┘
Background: white
Border: 1px neutral-200
Animation: dots bounce 1s infinite
```

**Application Chips (em AI messages):**

```
[🎫 Cartões] [📊 Dashboard]
```

- Inline, bg teal-50, border teal-200
- Padding: 6px 12px, border-radius 20px
- Font-size: 12px, color teal-700
- Icon left + name
- Cursor: pointer
- Hover: bg teal-100
- Click: navigate to /aplicacoes?search={app.name}

### Input Section (sticky, bottom)

```
┌────────────────────────────────────────────────┐
│ [Input placeholder] │ [→ Send button]          │
└────────────────────────────────────────────────┘
```

- Fixed bottom 0 (mobile) ou sticky (desktop)
- Width: 100% (mobile), max-width 600px (desktop)
- Padding: 16px
- Background: white
- Border-top: neutral-200

**Input Field:**

- Type: textarea (auto-resize)
- Placeholder: "Pergunte sobre apps, status, ou peça ajuda..."
- Height: 40px (1 line), auto-expand até 100px
- Padding: 12px 16px
- Border: 1px neutral-200
- Border-radius: 8px
- Focus: border-color teal-600, ring teal-100
- Ctrl/Cmd+Enter: send
- Shift+Enter: new line

**Send Button:**

- Type: icon button
- Icon: arrow-right ou send
- Size: 36x36px
- Background: teal-600
- Color: white
- Hover: bg teal-700
- Disabled (empty input): bg neutral-300
- Cursor: pointer

## 6. Modelo de Dados

### Conversation & Message Types

```typescript
// src/types/chat.ts

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'sent' | 'error';
}

export interface Conversation {
  messages: Message[];
  createdAt: Date;
}

export interface Intent {
  type: 'navigate' | 'query_status' | 'search' | 'help' | 'general';
  app?: string;
  query?: string;
}
```

### LangGraph + LangChain.js + Gemini Integration

```typescript
// src/lib/ai/model.ts — Factory de modelo LLM
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

// Modelo configurável via .env
// AI_PROVIDER=google|openai|anthropic (default: google)
// AI_MODEL=gemini-2.0-flash|gpt-4o-mini|claude-sonnet-4-20250514
export function getModel(): BaseChatModel {
  const provider = process.env.AI_PROVIDER || 'google';
  const modelName = process.env.AI_MODEL;

  switch (provider) {
    case 'google':
      return new ChatGoogleGenerativeAI({
        model: modelName || 'gemini-2.0-flash',
        apiKey: process.env.GOOGLE_AI_API_KEY,
        temperature: 0.7,
        streaming: true,
      });
    case 'openai':
      return new ChatOpenAI({
        model: modelName || 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        streaming: true,
      });
    case 'anthropic':
      return new ChatAnthropic({
        model: modelName || 'claude-sonnet-4-20250514',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.7,
        streaming: true,
      });
    default:
      throw new Error(`AI_PROVIDER não suportado: ${provider}`);
  }
}
```

```typescript
// src/lib/ai/graph.ts — LangGraph StateGraph da CatIA
import { StateGraph, END } from '@langchain/langgraph';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getModel } from './model';
import { prisma } from '../db';
import type { Message, Intent } from '@/types/chat';

// Estado tipado do grafo CatIA
interface CatIAState {
  messages: Message[];
  intent: Intent | null;
  apps: any[]; // Applications filtradas por RBAC
  userId: string;
  userRoles: string[];
  response: string;
}

const model = getModel();
const outputParser = new StringOutputParser();

// ─── NÓ 1: Reconhecimento de Intenção ───
async function intentRecognition(state: CatIAState): Promise<Partial<CatIAState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.role !== 'user') return { intent: { type: 'general' } };

  // Regex primeiro (rápido, sem custo)
  const regexIntent = recognizeIntentByRegex(lastMessage.content);
  if (regexIntent) return { intent: regexIntent };

  // Fallback: LLM para intents ambíguos
  try {
    const result = await model.invoke([
      new SystemMessage(`Analise a mensagem e retorne APENAS JSON:
{"type":"navigate"|"query_status"|"search"|"help"|"general","app":"nome se mencionado","query":"busca se aplicável"}`),
      new HumanMessage(lastMessage.content),
    ]);
    return { intent: JSON.parse(result.content as string) };
  } catch {
    return { intent: { type: 'general' } };
  }
}

// ─── NÓ 2: Carregar Apps com RBAC ───
async function loadAppsWithRBAC(state: CatIAState): Promise<Partial<CatIAState>> {
  const isAdmin = state.userRoles.includes('admin');
  const apps = await prisma.application.findMany({
    where:
      isAdmin || state.userRoles.includes('user')
        ? {}
        : state.userRoles.includes('viewer')
          ? {
              /* filtro por permissions */
            }
          : { id: 'none' },
    include: { category: true },
  });
  return { apps };
}

// ─── NÓ 3: Gerar Resposta via LLM ───
async function generateResponse(state: CatIAState): Promise<Partial<CatIAState>> {
  const systemPrompt = `
Você é CatIA, assistente do Portal Cateno.
Apps disponíveis (filtradas por permissão):
${state.apps.map((a) => `- ${a.name} (${a.category.name}): ${a.description} [${a.status}]`).join('\n')}

Regras:
- Para abrir app: responda com chip [🎫 NomeApp]
- Para status: use ⚙️ OK | ⚠️ Manutenção | ❌ Offline
- Seja conciso, amigável, em português.
`;

  const langChainMessages = [
    new SystemMessage(systemPrompt),
    ...state.messages.map((m) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
    ),
  ];

  const result = await model.pipe(outputParser).invoke(langChainMessages);
  return { response: result };
}

// ─── NÓ 4: Resposta rápida para intents simples (sem LLM) ───
async function handleNavigateIntent(state: CatIAState): Promise<Partial<CatIAState>> {
  const app = state.apps.find((a) =>
    a.name.toLowerCase().includes(state.intent?.app?.toLowerCase() || ''),
  );
  if (app) {
    return { response: `Abrindo **${app.name}**! [🎫 ${app.name}]` };
  }
  return { response: `Não encontrei uma aplicação com esse nome. Tente buscar de outra forma.` };
}

async function handleStatusIntent(state: CatIAState): Promise<Partial<CatIAState>> {
  if (state.intent?.app) {
    const app = state.apps.find((a) =>
      a.name.toLowerCase().includes(state.intent!.app!.toLowerCase()),
    );
    if (app) {
      const emoji = app.status === 'online' ? '⚙️' : app.status === 'maintenance' ? '⚠️' : '❌';
      return {
        response: `${emoji} **${app.name}** está **${app.status}** — ${app.userCount} usuários ativos. [🎫 ${app.name}]`,
      };
    }
  }
  // Status geral
  const statusList = state.apps
    .map((a) => {
      const emoji = a.status === 'online' ? '⚙️' : a.status === 'maintenance' ? '⚠️' : '❌';
      return `${emoji} ${a.name}: **${a.status}** (${a.userCount} usuários)`;
    })
    .join('\n');
  return { response: `Status das aplicações:\n\n${statusList}` };
}

// ─── ROTEADOR: decide qual nó executa baseado no intent ───
function routeByIntent(state: CatIAState): string {
  switch (state.intent?.type) {
    case 'navigate':
      return 'handleNavigate';
    case 'query_status':
      return 'handleStatus';
    default:
      return 'generateResponse';
  }
}

// ─── GRAFO: composição dos nós ───
export function buildCatIAGraph() {
  const graph = new StateGraph<CatIAState>({
    channels: {
      messages: { default: () => [] },
      intent: { default: () => null },
      apps: { default: () => [] },
      userId: { default: () => '' },
      userRoles: { default: () => [] },
      response: { default: () => '' },
    },
  });

  graph.addNode('intentRecognition', intentRecognition);
  graph.addNode('loadApps', loadAppsWithRBAC);
  graph.addNode('handleNavigate', handleNavigateIntent);
  graph.addNode('handleStatus', handleStatusIntent);
  graph.addNode('generateResponse', generateResponse);

  graph.setEntryPoint('intentRecognition');
  graph.addEdge('intentRecognition', 'loadApps');
  graph.addConditionalEdges('loadApps', routeByIntent, {
    handleNavigate: 'handleNavigate',
    handleStatus: 'handleStatus',
    generateResponse: 'generateResponse',
  });
  graph.addEdge('handleNavigate', END);
  graph.addEdge('handleStatus', END);
  graph.addEdge('generateResponse', END);

  return graph.compile();
}
```

```typescript
// src/lib/ai/intent.ts — Regex intent recognition (extraído para testabilidade)
import type { Intent } from '@/types/chat';

export function recognizeIntentByRegex(message: string): Intent | null {
  const lower = message.toLowerCase().trim();

  const navMatch = lower.match(/^(abrir|ir para|acessar|navegar para|abra)\s+(.+)$/i);
  if (navMatch) return { type: 'navigate', app: navMatch[2] };

  const statusMatch = lower.match(
    /(status|como est[aá]|est[aá] online|est[aá] funcionando)\s*(de |do |da )?\s*(.+?)(\?|$)/i,
  );
  if (statusMatch) return { type: 'query_status', app: statusMatch[3] };

  const searchMatch = lower.match(
    /(quais|listar|mostrar|buscar)\s*(apps?|aplica[çc][õo]es?)\s*(de |do |da |sobre )?\s*(.+?)(\?|$)/i,
  );
  if (searchMatch) return { type: 'search', query: searchMatch[4] };

  if (/^(ajuda|help|como usar|o que voc[eê] faz|como funciona)/i.test(lower)) {
    return { type: 'help' };
  }

  return null;
}
```

### Variáveis de Ambiente (.env.local)

```bash
# LLM — Google Gemini (padrão)
AI_PROVIDER=google                       # google | openai | anthropic
AI_MODEL=gemini-2.0-flash               # modelo específico do provider
GOOGLE_AI_API_KEY=<api-key>             # API key do Google AI Studio

# Langflow (dev)
LANGFLOW_PORT=7860                       # Porta da interface Langflow

# Alternativas (comentadas, usar se trocar de provider):
# AI_PROVIDER=openai
# AI_MODEL=gpt-4o-mini
# OPENAI_API_KEY=<api-key>
#
# AI_PROVIDER=anthropic
# AI_MODEL=claude-sonnet-4-20250514
# ANTHROPIC_API_KEY=<api-key>
```

### Server Action para Chat

```typescript
// src/app/(app)/catia/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { buildCatIAGraph } from '@/lib/ai/graph';
import type { Message } from '@/types/chat';

const catiaGraph = buildCatIAGraph();

export async function getChatResponse(conversationHistory: Message[], userMessage: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });

  try {
    // Executar o grafo LangGraph com estado inicial
    const result = await catiaGraph.invoke({
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage, id: crypto.randomUUID(), timestamp: new Date() },
      ],
      userId: session.user.id,
      userRoles: dbUser?.roles.map((r) => r.name) || [],
      intent: null,
      apps: [],
      response: '',
    });

    return result.response;
  } catch (error) {
    console.error('CatIA graph error:', error);
    throw new Error('Falha ao processar sua mensagem');
  }
}
```

### Arquitetura do Grafo CatIA (LangGraph)

```
┌─────────────────────┐
│ intentRecognition   │  regex-first → LLM fallback
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ loadAppsWithRBAC    │  Prisma query filtrada por roles/permissions
└─────────┬───────────┘
          │
    ┌─────▼─────┐
    │ routeBy   │  Condicional: intent.type
    │ Intent    │
    └─┬───┬───┬─┘
      │   │   │
┌─────▼┐ ┌▼────┐ ┌▼──────────────┐
│navig │ │stat │ │generateResp   │
│ate   │ │us   │ │(LLM streaming)│
└──┬───┘ └──┬──┘ └──────┬────────┘
   │        │            │
   └────────┴────────────┘
            │
          [END] → response
```

## 7. Cenários de Teste

| ID        | Cenário                | Entrada                      | Resultado Esperado                                              |
| --------- | ---------------------- | ---------------------------- | --------------------------------------------------------------- |
| CT-005-01 | Load /catia page       | GET /catia com session       | Welcome screen renderiza com logo, greeting, 4 buttons          |
| CT-005-02 | Quick action button    | Clica "Status de Apps"       | Input pre-filled, send automático, mensagem envia               |
| CT-005-03 | User message send      | Type "Abrir Cartões", Enter  | Message bubble aparece teal-600, teal-600, user message aparece |
| CT-005-04 | AI streaming response  | Aguarda resposta             | Typing indicator aparece, depois mensagem aparece char-by-char  |
| CT-005-05 | Application chip click | AI responde com chips, clica | Navega para /aplicacoes com filtro de app                       |
| CT-005-06 | Intent recognition     | "Qual é o status?"           | AI reconhece query_status, retorna status com emoji             |
| CT-005-07 | Markdown rendering     | AI responde com **bold**     | Text bold renderiza, lists renderizam com bullets               |
| CT-005-08 | Message timestamps     | Nova mensagem enviada        | Timestamp (14:30) aparece à direita                             |
| CT-005-09 | Conversation history   | Envia 3 messages             | Todas visíveis, context manter nas próximas                     |
| CT-005-10 | Nova conversa          | Clica "Nova conversa" button | History limpa, volta welcome screen                             |

## 8. Critérios de Aceite

- [ ] Chat interface renderiza com layout correto: welcome ou messages + input
- [ ] Welcome screen exibe logo CatIA, greeting, 4 quick action buttons
- [ ] Quick buttons pré-preenchem input e enviam automático
- [ ] LangGraph StateGraph implementado com nós: intentRecognition → loadApps → route → (navigate|status|generateResponse) → END
- [ ] LangChain.js + Google Gemini como provider padrão, configurável via .env (AI_PROVIDER=google|openai|anthropic, AI_MODEL)
- [ ] Langflow disponível via `docker compose --profile ai up -d` na porta 7860
- [ ] User messages aparecem em bubbles teal-600, direita
- [ ] AI messages aparecem em bubbles white/border, esquerda
- [ ] Responses fazem streaming (text aparece char-by-char)
- [ ] Typing indicator aparece enquanto AI processa
- [ ] Application chips renderizam em respostas, clicáveis → navigate
- [ ] Markdown rendering: **bold**, _italic_, - lists, emojis
- [ ] Message timestamps (HH:MM) aparecem em cada mensagem
- [ ] Input supports Enter para enviar, Shift+Enter para quebra de linha
- [ ] Conversation history mantém últimas 20 msgs por sessão
- [ ] RBAC: CatIA vê apenas apps que usuário tem permissão
- [ ] Error handling: falha AI mostra mensagem, pode retry
- [ ] "Nova conversa" limpa history, volta welcome screen
- [ ] Mobile: input sticky bottom, messages scroll, responsivo
- [ ] Chat log com role=log, aria-live=polite para screen reader
- [ ] Intent recognition: regex-first para padrões simples, LLM fallback para ambíguos
- [ ] SEGURANÇA: Server Actions obtêm userId da session, nunca do cliente
- [ ] SEGURANÇA: Query de contexto do LLM aplica RBAC (CatIA só conhece apps autorizadas)
- [ ] SEGURANÇA: Respostas do LLM sanitizadas antes de renderizar (DOMPurify para markdown HTML)
- [ ] Todos os 10 cenários de teste CT-005-01 até CT-005-10 passam
- [ ] Testes unitários em `__tests__/app/(app)/catia/`

## 9. Dependências

- **Depende de:** PC-SPEC-001 (Setup), PC-SPEC-002 (Autenticação), PC-SPEC-003 (Layout)
- **Integra com:** PC-SPEC-004 (Application registry para queries)
- **Depende de serviço:** Google Gemini API (padrão) — configurável para OpenAI ou Anthropic via .env

## 10. Artefatos

| Artefato    | Status   | Link |
| ----------- | -------- | ---- |
| Task        | Pendente | —    |
| Plan        | Pendente | —    |
| Walkthrough | Pendente | —    |
| Testes      | Pendente | —    |

---

[← Voltar ao Backlog](../../)
