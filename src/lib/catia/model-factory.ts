import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

export type ModelProvider = 'anthropic' | 'google';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
}

export function getModelConfig(nodeKey: string): ModelConfig {
  const provider = (process.env[`CATIA_${nodeKey}_PROVIDER`] ?? 'google') as ModelProvider;
  const model = process.env[`CATIA_${nodeKey}_MODEL`] ?? 'gemini-2.0-flash';
  return { provider, model };
}

let anthropicClient: Anthropic | null = null;

export function createAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

let googleAI: GoogleGenerativeAI | null = null;

export function createGoogleClient(model: string): GenerativeModel {
  if (!googleAI) {
    googleAI = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
    );
  }
  return googleAI.getGenerativeModel({ model });
}
