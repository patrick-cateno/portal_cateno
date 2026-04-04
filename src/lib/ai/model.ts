import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

export function getModel(): BaseChatModel {
  const provider = process.env.AI_PROVIDER || 'google';
  const modelName = process.env.AI_MODEL;

  switch (provider) {
    case 'google':
      return new ChatGoogleGenerativeAI({
        model: modelName || 'gemini-2.0-flash',
        apiKey: process.env.GOOGLE_AI_API_KEY,
        temperature: 0.7,
      });
    default:
      throw new Error(`AI_PROVIDER não suportado: ${provider}. Use: google`);
  }
}
