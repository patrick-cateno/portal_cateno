import type { Message } from '@/types/chat';

const MAX_HISTORY_MESSAGES = 10;

/**
 * Formata as últimas N mensagens como texto de histórico para incluir em prompts.
 * Exclui a última mensagem (que é passada separadamente como "pergunta atual").
 */
export function buildMessageHistory(
  messages: Message[],
  maxMessages = MAX_HISTORY_MESSAGES,
): string {
  // Todas exceto a última (que é a mensagem atual do usuário)
  const previous = messages.slice(0, -1).slice(-maxMessages);

  if (previous.length === 0) return '';

  const lines = previous.map((m) => {
    const role = m.role === 'user' ? 'Usuário' : 'CatIA';
    return `${role}: ${m.content}`;
  });

  return `Histórico da conversa:\n${lines.join('\n')}`;
}

/**
 * Converte mensagens para o formato Anthropic Messages API (user/assistant alternados).
 * Exclui a última mensagem (que é adicionada separadamente pelo caller).
 */
export function buildAnthropicHistory(
  messages: Message[],
  maxMessages = MAX_HISTORY_MESSAGES,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const previous = messages.slice(0, -1).slice(-maxMessages);

  return previous.map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }));
}

/**
 * Converte mensagens para o formato Google Generative AI contents (user/model).
 * Exclui a última mensagem (que é adicionada separadamente pelo caller).
 */
export function buildGoogleHistory(
  messages: Message[],
  maxMessages = MAX_HISTORY_MESSAGES,
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const previous = messages.slice(0, -1).slice(-maxMessages);

  return previous.map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.content }],
  }));
}
