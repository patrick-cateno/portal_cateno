import type { GraphStateType } from '../state';
import { siteConfig } from '@/config/site';

export function buildResponderPrompt(state: GraphStateType): string {
  const lastUserMessage =
    [...state.messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  let context = '';

  if (state.apps.length > 0) {
    const appList = state.apps.map((a) => `- ${a.name} [app:${a.slug}:${a.name}]`).join('\n');
    context += `\nAplicações encontradas:\n${appList}\n`;
  }

  if (state.toolResults.length > 0) {
    const results = state.toolResults
      .map((r) => `- ${r.toolName}: ${r.error ?? JSON.stringify(r.output).slice(0, 300)}`)
      .join('\n');
    context += `\nResultados de operações:\n${results}\n`;
  }

  return `Você é o CatIA, assistente inteligente do ${siteConfig.name}.
Responda de forma concisa e amigável em português brasileiro.

Pergunta do usuário: "${lastUserMessage}"
${context}

Regras:
- Use links para apps no formato [app:slug:nome] quando mencionar uma aplicação
- Seja direto e objetivo
- Se houve erro em uma operação, explique de forma clara ao usuário
- Não invente informações que não estão no contexto`;
}
