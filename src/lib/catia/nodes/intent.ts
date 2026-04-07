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
    const mapped = intentMap[regexIntent.type] ?? 'general';
    console.log(
      `[catia:intent] regex="${regexIntent.type}" → intent="${mapped}" | msg="${lastMessage.slice(0, 80)}"`,
    );
    return { intent: mapped };
  }

  // Fallback: let orchestrator handle it
  console.log(
    `[catia:intent] no regex match → intent="general" | msg="${lastMessage.slice(0, 80)}"`,
  );
  return { intent: 'general' };
}
