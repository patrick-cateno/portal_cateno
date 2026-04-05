import { Annotation } from '@langchain/langgraph';
import type { Message } from '@/types/chat';

export interface ToolResult {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  error?: string;
}

export interface AppChip {
  slug: string;
  name: string;
}

export const GraphState = Annotation.Root({
  messages: Annotation<Message[]>({ reducer: (x, y) => x.concat(y), default: () => [] }),
  intent: Annotation<string>({ reducer: (_, y) => y, default: () => 'general' }),
  plan: Annotation<string[]>({ reducer: (_, y) => y, default: () => [] }),
  toolResults: Annotation<ToolResult[]>({ reducer: (x, y) => x.concat(y), default: () => [] }),
  apps: Annotation<AppChip[]>({ reducer: (_, y) => y, default: () => [] }),
  response: Annotation<string>({ reducer: (_, y) => y, default: () => '' }),
  userId: Annotation<string>({ reducer: (_, y) => y, default: () => '' }),
  userRoles: Annotation<string[]>({ reducer: (_, y) => y, default: () => [] }),
  userToken: Annotation<string>({ reducer: (_, y) => y, default: () => '' }),
  error: Annotation<string | null>({ reducer: (_, y) => y, default: () => null }),
});

export type GraphStateType = typeof GraphState.State;
