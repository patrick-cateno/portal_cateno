import type { Intent } from '@/types/chat';

export function recognizeIntentByRegex(message: string): Intent | null {
  const lower = message.toLowerCase().trim();

  // Navigate: "abrir cartões", "ir para dashboard"
  const navMatch = lower.match(/^(abrir|ir para|acessar|navegar para|abra)\s+(.+)$/i);
  if (navMatch) return { type: 'navigate', app: navMatch[2] };

  // Status: "como está cartões?", "status de processamento"
  const statusMatch = lower.match(
    /(status|como est[aá]|est[aá] online|est[aá] funcionando)\s*(de |do |da |das |dos )?\s*(.+?)(\?|$)/i,
  );
  if (statusMatch) return { type: 'query_status', app: statusMatch[3].trim() };

  // Search: "quais apps de operações?"
  const searchMatch = lower.match(
    /(quais|listar|mostrar|buscar)\s*(apps?|aplica[çc][õo]es?)\s*(de |do |da |sobre )?\s*(.+?)(\?|$)/i,
  );
  if (searchMatch) return { type: 'search', query: searchMatch[4].trim() };

  // Help
  if (/^(ajuda|help|como usar|o que voc[eê] faz|como funciona)/i.test(lower)) {
    return { type: 'help' };
  }

  // Status geral: "qual o status das aplicações?"
  if (/status.*(aplica[çc][õo]es?|apps?|todos?|todas?|geral)/i.test(lower)) {
    return { type: 'query_status' };
  }

  return null;
}
