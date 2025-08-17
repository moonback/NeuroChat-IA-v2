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
  // Tentative primaire + fallback multi-fournisseurs en cas d'échec
  const allProviders: Provider[] = ['gemini', 'openai', 'mistral'];
  const primary = cfg.provider;
  let fallbackOrder: Provider[] = [];

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('llm_fallback_order') : null;
    const parsed = raw ? (JSON.parse(raw) as Provider[]) : null;
    if (parsed && Array.isArray(parsed)) {
      const cleaned = parsed.filter((p) => allProviders.includes(p));
      const deduped = cleaned.filter((p, i) => cleaned.indexOf(p) === i);
      fallbackOrder = deduped as Provider[];
    }
  } catch {
    // ignore parsing error
  }

  const providersToTry: Provider[] = [
    ...(fallbackOrder.length > 0
      ? [primary, ...fallbackOrder.filter((p) => p !== primary)]
      : [primary]
    )
  ].filter((p, i, arr) => arr.indexOf(p) === i);

  let lastError: unknown = null;
  for (const provider of providersToTry) {
    try {
      if (provider === 'gemini') {
        return await sendMessageToGemini(messages, images, systemPrompt, cfg.gemini, options);
      }
      if (provider === 'openai') {
        return await sendMessageToOpenAI(messages, images, systemPrompt, cfg.openai);
      }
      return await sendMessageToMistral(messages, images, systemPrompt, cfg.mistral);
    } catch (err) {
      lastError = err;
      // Essayer le prochain provider
      continue;
    }
  }
  // Si tous les providers ont échoué, relancer la dernière erreur
  throw lastError instanceof Error ? lastError : new Error('Tous les fournisseurs LLM ont échoué');
}


