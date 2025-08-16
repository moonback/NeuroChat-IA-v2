import { sendMessageToGemini, type GeminiGenerationConfig } from '@/services/geminiApi';
import { sendMessageToOpenAI, type OpenAIGenerationConfig } from '@/services/openaiApi';
import { sendMessageToMistral, type MistralGenerationConfig } from '@/services/mistralApi';

export type Provider = 'gemini' | 'openai' | 'mistral';

export interface LlmConfig {
  provider: Provider;
  gemini?: GeminiGenerationConfig;
  openai?: OpenAIGenerationConfig;
  mistral?: MistralGenerationConfig;
}

export async function sendMessage(
  cfg: LlmConfig,
  messages: Array<{ text: string; isUser: boolean }>,
  images: File[] | undefined,
  systemPrompt: string,
  options?: { soft?: boolean },
): Promise<string> {
  if (cfg.provider === 'gemini') {
    return sendMessageToGemini(messages, images, systemPrompt, cfg.gemini, options);
  }
  if (cfg.provider === 'openai') {
    return sendMessageToOpenAI(messages, images, systemPrompt, cfg.openai);
  }
  return sendMessageToMistral(messages, images, systemPrompt, cfg.mistral);
}


