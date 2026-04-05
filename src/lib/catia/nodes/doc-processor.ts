import type { GraphStateType } from '../state';
import { getModelConfig, createAnthropicClient, createGoogleClient } from '../model-factory';

export async function docProcessorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const config = getModelConfig('DOC_PROCESSOR');
  const lastMessage = [...state.messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  try {
    let responseText: string;

    if (config.provider === 'anthropic') {
      const anthropic = createAnthropicClient();
      const result = await anthropic.messages.create({
        model: config.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `Processe o seguinte documento/solicitação e extraia as informações relevantes:\n\n${lastMessage}`,
          },
        ],
      });
      const block = result.content[0];
      responseText = block.type === 'text' ? block.text : '';
    } else {
      const model = createGoogleClient(config.model);
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Processe o seguinte documento/solicitação e extraia as informações relevantes:\n\n${lastMessage}`,
              },
            ],
          },
        ],
      });
      responseText = result.response.text();
    }

    return {
      toolResults: [
        { toolName: 'doc_processor', input: { message: lastMessage }, output: responseText },
      ],
    };
  } catch (err) {
    return {
      toolResults: [
        {
          toolName: 'doc_processor',
          input: { message: lastMessage },
          output: null,
          error: err instanceof Error ? err.message : 'Erro ao processar documento',
        },
      ],
    };
  }
}
