import type { GraphStateType, ToolResult } from '../state';
import { getModelConfig, createAnthropicClient, createGoogleClient } from '../model-factory';
import { loadToolsForUser } from '../tools/registry';
import { executeTool } from '../tools/executor';
import { buildAnthropicHistory, buildGoogleHistory } from '../prompts/history';
import type Anthropic from '@anthropic-ai/sdk';

const MAX_TOOL_ITERATIONS = 5;

/** Retorna contexto de data/hora em America/Sao_Paulo para o LLM */
function getDateTimeContext(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const tomorrow = new Date(today + 'T12:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  return `Data e hora atual (America/Sao_Paulo): ${formatter.format(now)}
Hoje: ${today}
Amanhã: ${tomorrowStr}
REGRAS DE CONTEXTO:
- Sempre use o timezone America/Sao_Paulo para interpretar datas relativas como "hoje", "amanhã", "semana que vem". Datas devem ser enviadas no formato YYYY-MM-DD.
- Quando o usuário perguntar sobre "reservas" sem especificar o tipo, consulte AMBAS: minhas_reservas_estacao E minhas_reservas_sala. O portal tem dois tipos de reserva: estações de trabalho e salas de reunião.
- ESTAÇÃO DE TRABALHO: reserva de DIA INTEIRO — só precisa de estacao_id e data_reserva (YYYY-MM-DD). NÃO peça horário para estações.
- SALA DE REUNIÃO: reserva por horário — precisa de sala_id, titulo, data_hora_inicio e data_hora_fim.
- Se o pedido for ambíguo e você não conseguir determinar a intenção, NÃO adivinhe — retorne sem chamar tools para que o responder possa pedir esclarecimento ao usuário.`;
}

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

    const history = buildAnthropicHistory(state.messages);
    const messages: Anthropic.Messages.MessageParam[] = [
      ...history,
      { role: 'user', content: lastMessage },
    ];

    const systemPrompt = getDateTimeContext();

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
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

    const dateContext = getDateTimeContext();
    const systemContext = `${dateContext}\n\nTools disponíveis:\n${toolList}\n
REGRAS CRÍTICAS:
- Tools de ação (admin_bloquear_*, admin_desbloquear_*, admin_desativar_*, etc.) exigem o "id" no formato UUID.
- Nomes como "101", "Sala Athenas", "Brasília" NÃO são UUIDs. UUID tem formato: "a1b2c3d4-e5f6-7890-1234-567890abcdef".
- Quando o usuário mencionar um recurso pelo nome, PRIMEIRO chame a tool de listagem (listar_estacoes, listar_escritorios, etc.) para encontrar o UUID, depois chame a tool de ação.
- Responda SEMPRE em JSON: { "tool": "nome", "input": { ... } }
- Se não há mais ações necessárias, responda: { "done": true }`;

    const googleHistory = buildGoogleHistory(state.messages);
    const conversation: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      ...googleHistory,
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
