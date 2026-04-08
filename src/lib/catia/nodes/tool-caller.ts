import type { GraphStateType, ToolResult } from '../state';
import { getModelConfig, createAnthropicClient, createGoogleClient } from '../model-factory';
import { loadToolsForUser } from '../tools/registry';
import { executeTool } from '../tools/executor';
import type Anthropic from '@anthropic-ai/sdk';

const MAX_TOOL_ITERATIONS = 5;

export async function toolCallerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const config = getModelConfig('TOOL_CALL');
  const tools = await loadToolsForUser(state.userRoles);
  console.log(
    `[catia:tool-caller] provider="${config.provider}" model="${config.model}" tools_loaded=${tools.length} roles=${JSON.stringify(state.userRoles)}`,
  );

  if (tools.length === 0) {
    return {
      toolResults: [
        {
          toolName: 'none',
          input: {},
          output: null,
          error: 'Nenhuma tool disponível para seu perfil',
        },
      ],
    };
  }

  const lastMessage = [...state.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const results: ToolResult[] = [];

  if (config.provider === 'anthropic') {
    const anthropic = createAnthropicClient();

    const anthropicTools: Anthropic.Messages.Tool[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema as Anthropic.Messages.Tool.InputSchema,
    }));

    const messages: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: lastMessage }];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: 4096,
        tools: anthropicTools,
        messages,
      });

      if (
        response.stop_reason === 'end_turn' ||
        !response.content.some((b) => b.type === 'tool_use')
      ) {
        break;
      }

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log(
            `[catia:tool-caller] LLM selected tool="${block.name}" input=${JSON.stringify(block.input)}`,
          );
          try {
            const output = await executeTool(
              block.name,
              block.input as Record<string, unknown>,
              state.userToken,
            );
            results.push({
              toolName: block.name,
              input: block.input as Record<string, unknown>,
              output,
            });
          } catch (err) {
            results.push({
              toolName: block.name,
              input: block.input as Record<string, unknown>,
              output: null,
              error: err instanceof Error ? err.message : 'Erro desconhecido',
            });
          }
        }
      }

      break; // Single iteration for now; expand with tool_result feedback loop later
    }
  } else {
    // Google fallback — no native tool calling, just ask the model which tool to use
    const model = createGoogleClient(config.model);
    const toolList = tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Dado as tools disponíveis:\n${toolList}\n\nPara atender: "${lastMessage}"\n\nResponda em JSON: { "tool": "nome", "input": { ... } }`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    });

    try {
      const parsed = JSON.parse(result.response.text());
      if (parsed.tool) {
        console.log(
          `[catia:tool-caller] LLM selected tool="${parsed.tool}" input=${JSON.stringify(parsed.input ?? {})}`,
        );
        const output = await executeTool(parsed.tool, parsed.input ?? {}, state.userToken);
        results.push({ toolName: parsed.tool, input: parsed.input ?? {}, output });
      }
    } catch (err) {
      results.push({
        toolName: 'unknown',
        input: {},
        output: null,
        error: err instanceof Error ? err.message : 'Erro ao processar tool',
      });
    }
  }

  return { toolResults: results };
}
