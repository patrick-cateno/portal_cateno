import type { GraphStateType } from '../state';
import { getModelConfig, createGoogleClient, createAnthropicClient } from '../model-factory';
import { buildResponderPrompt } from '../prompts/responder';

export async function responderNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const config = getModelConfig('SIMPLE_RESPONSE');
  const prompt = buildResponderPrompt(state);

  try {
    let text: string;

    if (config.provider === 'google') {
      const model = createGoogleClient(config.model);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      text = result.response.text();
    } else {
      const anthropic = createAnthropicClient();
      const result = await anthropic.messages.create({
        model: config.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = result.content[0];
      text = block.type === 'text' ? block.text : '';
    }

    return { response: text };
  } catch (err) {
    console.error('[catia:responder] Error:', err);
    return { response: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.' };
  }
}
