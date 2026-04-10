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
      .map((r) => {
        if (r.error) return `- ${r.toolName}: ${r.error}`;
        const out = r.output as Record<string, unknown> | null;
        if (out && typeof out === 'object' && 'total' in out && 'items' in out) {
          const { items, ...meta } = out;
          const itemsJson = JSON.stringify(items).slice(0, 600);
          return `- ${r.toolName}: ${JSON.stringify(meta)} items=${itemsJson}`;
        }
        return `- ${r.toolName}: ${JSON.stringify(out).slice(0, 800)}`;
      })
      .join('\n');
    context += `\nResultados de operações:\n${results}\n`;
  }

  return `Você é o CatIA, assistente inteligente do ${siteConfig.name}.
Responda de forma concisa e amigável em português brasileiro.

Pergunta do usuário: "${lastUserMessage}"
${context}

Regras:
- Use links para apps no formato [app:slug:nome] SOMENTE para apps listados acima em "Aplicações encontradas". NUNCA invente apps que não existem (não existe app de Viagens, Turismo, etc.)
- Se nenhuma aplicação foi encontrada no contexto, NÃO sugira nenhum app por nome
- Seja direto e objetivo
- Se houve erro em uma operação, explique de forma clara ao usuário
- Não invente informações que não estão no contexto acima
- Respostas paginadas: quando o resultado contém "total" e "items", se items.length >= total a lista está COMPLETA — não diga que pode haver mais dados
- Para reservas: o portal tem reservas de ESTAÇÕES DE TRABALHO e SALAS DE REUNIÃO — não existe módulo de viagens`;
}
