import { sendMessageToGemini, type GeminiGenerationConfig } from '@/services/geminiApi';
import { sendMessageToOpenAI, type OpenAIGenerationConfig } from '@/services/openaiApi';

export type Provider = 'gemini' | 'openai';

export interface LlmConfig {
  provider: Provider;
  gemini?: GeminiGenerationConfig;
  openai?: OpenAIGenerationConfig;
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
  return sendMessageToOpenAI(messages, images, systemPrompt, cfg.openai);
}


