import type { GraphStateType } from '../state';
import { siteConfig } from '@/config/site';

export function buildOrchestratorPrompt(state: GraphStateType): string {
  const lastMessage = state.messages[state.messages.length - 1]?.content ?? '';

  return `Você é o orquestrador do CatIA, assistente inteligente do ${siteConfig.name}.
Analise a mensagem do usuário e classifique a intenção.

Mensagem: "${lastMessage}"

Responda APENAS em JSON válido com este formato:
{
  "intent": "search_apps" | "get_status" | "business_op" | "process_doc" | "navigate" | "help" | "general",
  "steps": ["passo 1", "passo 2"],
  "reasoning": "justificativa curta"
}

Regras:
- "search_apps": buscar, listar ou filtrar APLICAÇÕES do portal (ex: "quais apps existem?", "apps de cartões")
- "get_status": verificar status ou saúde de aplicações do portal (ex: "o sistema está online?")
- "business_op": qualquer consulta ou operação que envolva DADOS de um microsserviço — reservas, escritórios, salas, estações, cartões, faturas, equipes, escalas, feriados, etc. (ex: "listar escritórios", "reservar sala", "bloquear cartão", "quais salas disponíveis?", "minha escala")
- "process_doc": processar documento, PDF, arquivo
- "navigate": abrir, ir para, acessar uma aplicação específica (ex: "abrir gestão de cartões")
- "help": ajuda, o que você faz, como usar
- "general": saudações, conversa, perguntas gerais

IMPORTANTE: Se o usuário pergunta sobre dados de negócio (escritórios, salas, reservas, cartões, equipes, escalas, feriados), a intenção é SEMPRE "business_op", nunca "search_apps". "search_apps" é SOMENTE para buscar aplicações/módulos do portal.`;
}
