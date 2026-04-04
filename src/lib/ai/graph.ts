import { StateGraph, Annotation, END } from '@langchain/langgraph';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getModel } from './model';
import { recognizeIntentByRegex } from './intent';
import { prisma } from '../db';
import type { Message, Intent } from '@/types/chat';

// State annotation for the graph
const CatIAState = Annotation.Root({
  messages: Annotation<Message[]>({ reducer: (_, b) => b, default: () => [] }),
  intent: Annotation<Intent | null>({ reducer: (_, b) => b, default: () => null }),
  apps: Annotation<AppData[]>({ reducer: (_, b) => b, default: () => [] }),
  userId: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
  userRoles: Annotation<string[]>({ reducer: (_, b) => b, default: () => [] }),
  response: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
});

interface AppData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  userCount: number;
  category: { name: string; slug: string };
}

type CatIAStateType = typeof CatIAState.State;

// Node 1: Intent Recognition (regex first, LLM fallback)
async function intentRecognition(state: CatIAStateType): Promise<Partial<CatIAStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return { intent: { type: 'general' } };
  }

  const regexIntent = recognizeIntentByRegex(lastMessage.content);
  if (regexIntent) return { intent: regexIntent };

  // LLM fallback for ambiguous intents
  try {
    const model = getModel();
    const result = await model.invoke([
      new SystemMessage(
        `Analise a mensagem e retorne APENAS JSON sem markdown: {"type":"navigate"|"query_status"|"search"|"help"|"general","app":"nome se mencionado","query":"busca se aplicável"}`,
      ),
      new HumanMessage(lastMessage.content),
    ]);
    const content = typeof result.content === 'string' ? result.content : '';
    const cleaned = content.replace(/```json?\n?|\n?```/g, '').trim();
    return { intent: JSON.parse(cleaned) };
  } catch {
    return { intent: { type: 'general' } };
  }
}

// Node 2: Load apps with RBAC
async function loadAppsWithRBAC(state: CatIAStateType): Promise<Partial<CatIAStateType>> {
  const isAdmin = state.userRoles.includes('admin');
  const isUser = state.userRoles.includes('user');
  const isViewer = state.userRoles.includes('viewer');

  const whereClause =
    isAdmin || isUser
      ? {}
      : isViewer
        ? { category: { slug: { in: ['financeiro', 'analytics'] } } }
        : { id: 'none' };

  const apps = await prisma.application.findMany({
    where: whereClause,
    include: { category: true },
  });

  return { apps: apps as unknown as AppData[] };
}

// Node 3: Handle navigate intent (no LLM needed)
async function handleNavigate(state: CatIAStateType): Promise<Partial<CatIAStateType>> {
  const appName = state.intent?.app?.toLowerCase() || '';
  const app = state.apps.find((a) => a.name.toLowerCase().includes(appName));

  if (app) {
    return { response: `Encontrei **${app.name}**! [app:${app.slug}:${app.name}]` };
  }
  return { response: 'Não encontrei uma aplicação com esse nome. Tente buscar de outra forma.' };
}

// Node 4: Handle status intent (no LLM needed)
async function handleStatus(state: CatIAStateType): Promise<Partial<CatIAStateType>> {
  if (state.intent?.app) {
    const appName = state.intent.app.toLowerCase();
    const app = state.apps.find((a) => a.name.toLowerCase().includes(appName));
    if (app) {
      const emoji = app.status === 'online' ? '✅' : app.status === 'maintenance' ? '⚠️' : '❌';
      return {
        response: `${emoji} **${app.name}** está **${app.status}** — ${app.userCount} usuários ativos. [app:${app.slug}:${app.name}]`,
      };
    }
  }
  // General status
  const statusList = state.apps
    .map((a) => {
      const emoji = a.status === 'online' ? '✅' : a.status === 'maintenance' ? '⚠️' : '❌';
      return `${emoji} **${a.name}**: ${a.status} (${a.userCount} usuários)`;
    })
    .join('\n');
  return { response: `Status das aplicações:\n\n${statusList}` };
}

// Node 5: Handle search intent (no LLM needed)
async function handleSearch(state: CatIAStateType): Promise<Partial<CatIAStateType>> {
  const query = state.intent?.query?.toLowerCase() || '';
  const matches = state.apps.filter(
    (a) =>
      a.name.toLowerCase().includes(query) ||
      a.category.name.toLowerCase().includes(query) ||
      a.category.slug.toLowerCase().includes(query) ||
      (a.description?.toLowerCase().includes(query) ?? false),
  );

  if (matches.length === 0) {
    return { response: `Não encontrei aplicações para "${state.intent?.query}".` };
  }

  const list = matches
    .map((a) => `- **${a.name}** (${a.category.name}) [app:${a.slug}:${a.name}]`)
    .join('\n');
  return {
    response: `Encontrei ${matches.length} aplicação(ões):\n\n${list}`,
  };
}

// Node 6: Handle help intent (no LLM needed)
async function handleHelp(): Promise<Partial<CatIAStateType>> {
  return {
    response: `Eu sou a **CatIA**, sua assistente do Portal Cateno! Posso ajudar com:

- **Abrir aplicações**: "Abrir Cartões", "Ir para Dashboard"
- **Status**: "Como está o Processamento?", "Status de apps"
- **Buscar**: "Quais apps de Operações?", "Buscar compliance"
- **Perguntas gerais**: sobre o portal e aplicações

Experimente perguntar algo! 😊`,
  };
}

// Node 7: Generate LLM response (for general intents)
async function generateResponse(state: CatIAStateType): Promise<Partial<CatIAStateType>> {
  const model = getModel();
  const outputParser = new StringOutputParser();

  const appsContext = state.apps
    .map(
      (a) => `- ${a.name} (${a.category.name}): ${a.description || 'Sem descrição'} [${a.status}]`,
    )
    .join('\n');

  const systemPrompt = `Você é CatIA, assistente inteligente do Portal Cateno.
Apps disponíveis (filtradas por permissão do usuário):
${appsContext}

Regras:
- Para mencionar um app, use o formato [app:slug:Nome] (ex: [app:gestao-cartoes:Gestão de Cartões])
- Seja conciso, amigável, em português brasileiro
- Use markdown para formatação (bold, listas)
- Não invente apps que não estão na lista acima`;

  const langChainMessages = [
    new SystemMessage(systemPrompt),
    ...state.messages
      .slice(-20)
      .map((m) => (m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content))),
  ];

  const result = await model.pipe(outputParser).invoke(langChainMessages);
  return { response: result };
}

// Router: decides which node to run based on intent
function routeByIntent(state: CatIAStateType): string {
  switch (state.intent?.type) {
    case 'navigate':
      return 'handleNavigate';
    case 'query_status':
      return 'handleStatus';
    case 'search':
      return 'handleSearch';
    case 'help':
      return 'handleHelp';
    default:
      return 'generateResponse';
  }
}

// Build the graph
export function buildCatIAGraph() {
  const graph = new StateGraph(CatIAState)
    .addNode('intentRecognition', intentRecognition)
    .addNode('loadApps', loadAppsWithRBAC)
    .addNode('handleNavigate', handleNavigate)
    .addNode('handleStatus', handleStatus)
    .addNode('handleSearch', handleSearch)
    .addNode('handleHelp', handleHelp)
    .addNode('generateResponse', generateResponse)
    .addEdge('__start__', 'intentRecognition')
    .addEdge('intentRecognition', 'loadApps')
    .addConditionalEdges('loadApps', routeByIntent, {
      handleNavigate: 'handleNavigate',
      handleStatus: 'handleStatus',
      handleSearch: 'handleSearch',
      handleHelp: 'handleHelp',
      generateResponse: 'generateResponse',
    })
    .addEdge('handleNavigate', END)
    .addEdge('handleStatus', END)
    .addEdge('handleSearch', END)
    .addEdge('handleHelp', END)
    .addEdge('generateResponse', END);

  return graph.compile();
}
