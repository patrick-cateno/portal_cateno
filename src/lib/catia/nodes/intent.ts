import type { GraphStateType } from '../state';
import { recognizeIntentByRegex } from '@/lib/ai/intent';

export async function intentNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1]?.content ?? '';

  // Fast path: regex-based intent recognition
  const regexIntent = recognizeIntentByRegex(lastMessage);
  if (regexIntent) {
    const intentMap: Record<string, string> = {
      navigate: 'navigate',
      query_status: 'get_status',
      search: 'search_apps',
      help: 'help',
      general: 'general',
    };
    return { intent: intentMap[regexIntent.type] ?? 'general' };
  }

  // Fallback: let orchestrator handle it
  return { intent: 'general' };
}
