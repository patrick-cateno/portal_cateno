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
    // Google path — iterative tool calling with result feedback
    const model = createGoogleClient(config.model);
    const toolList = tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');

    const systemContext = `Tools disponíveis:\n${toolList}\n
REGRAS CRÍTICAS:
- Tools de ação (admin_bloquear_*, admin_desbloquear_*, admin_desativar_*, etc.) exigem o "id" no formato UUID.
- Nomes como "101", "Sala Athenas", "Brasília" NÃO são UUIDs. UUID tem formato: "a1b2c3d4-e5f6-7890-1234-567890abcdef".
- Quando o usuário mencionar um recurso pelo nome, PRIMEIRO chame a tool de listagem (listar_estacoes, listar_escritorios, etc.) para encontrar o UUID, depois chame a tool de ação.
- Responda SEMPRE em JSON: { "tool": "nome", "input": { ... } }
- Se não há mais ações necessárias, responda: { "done": true }`;

    const conversation: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      {
        role: 'user',
        parts: [{ text: `${systemContext}\n\nPedido do usuário: "${lastMessage}"` }],
      },
    ];

    try {
      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const result = await model.generateContent({
          contents: conversation,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const responseText = result.response.text();
        conversation.push({ role: 'model', parts: [{ text: responseText }] });

        const parsed = JSON.parse(responseText);
        if (parsed.done || (!parsed.tool && !parsed.steps)) break;

        // Support both { tool, input } and legacy { steps: [...] }
        const step = parsed.steps?.[0] ?? parsed;
        if (!step.tool) break;

        console.log(
          `[catia:tool-caller] step ${i + 1}: tool="${step.tool}" input=${JSON.stringify(step.input ?? {})}`,
        );

        try {
          const output = await executeTool(step.tool, step.input ?? {}, state.userToken);
          results.push({ toolName: step.tool, input: step.input ?? {}, output });

          // Feed result back to LLM for next step
          const outputSummary = JSON.stringify(output).slice(0, 1000);
          conversation.push({
            role: 'user',
            parts: [
              {
                text: `Resultado de ${step.tool}: ${outputSummary}\n\nSe há mais ações necessárias, responda com a próxima tool. Senão, responda { "done": true }.`,
              },
            ],
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
          results.push({
            toolName: step.tool,
            input: step.input ?? {},
            output: null,
            error: errorMsg,
          });
          // Feed error back — LLM might recover
          conversation.push({
            role: 'user',
            parts: [
              {
                text: `Erro em ${step.tool}: ${errorMsg}\n\nTente uma abordagem diferente ou responda { "done": true }.`,
              },
            ],
          });
        }
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
