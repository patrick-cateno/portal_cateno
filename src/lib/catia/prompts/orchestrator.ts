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
- "search_apps": buscar, listar, filtrar aplicações
- "get_status": verificar status, saúde de apps
- "business_op": operações de negócio (cadastrar vaga, bloquear cartão, gerar contrato)
- "process_doc": processar documento, PDF, arquivo
- "navigate": abrir, ir para, acessar uma aplicação específica
- "help": ajuda, o que você faz, como usar
- "general": saudações, conversa, perguntas gerais`;
}
