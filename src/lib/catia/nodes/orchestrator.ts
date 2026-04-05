import type { GraphStateType } from '../state';
import { getModelConfig, createGoogleClient, createAnthropicClient } from '../model-factory';
import { buildOrchestratorPrompt } from '../prompts/orchestrator';

export async function orchestratorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const config = getModelConfig('ORCHESTRATOR');
  const prompt = buildOrchestratorPrompt(state);

  try {
    let text: string;

    if (config.provider === 'google') {
      const model = createGoogleClient(config.model);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });
      text = result.response.text();
    } else {
      const anthropic = createAnthropicClient();
      const result = await anthropic.messages.create({
        model: config.model,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = result.content[0];
      text = block.type === 'text' ? block.text : '';
    }

    const parsed = JSON.parse(text);
    return {
      intent: parsed.intent ?? state.intent,
      plan: parsed.steps ?? [],
    };
  } catch (err) {
    console.error('[catia:orchestrator] Error:', err);
    return { intent: state.intent, plan: [] };
  }
}
