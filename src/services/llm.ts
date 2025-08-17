import { sendMessageToGemini, type GeminiGenerationConfig } from '@/services/geminiApi';
import { sendMessageToOpenAI, type OpenAIGenerationConfig, streamMessageToOpenAI } from '@/services/openaiApi';
import { sendMessageToMistral, type MistralGenerationConfig, streamMessageToMistral } from '@/services/mistralApi';

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
    primary,
    ...allProviders.filter((p) => p !== primary && !fallbackOrder.includes(p)),
    ...fallbackOrder.filter((p) => p !== primary),
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


export async function streamMessage(
  cfg: LlmConfig,
  messages: Array<{ text: string; isUser: boolean }>,
  images: File[] | undefined,
  systemPrompt: string,
  callbacks: { onToken: (token: string) => void; onDone?: () => void; onError?: (err: any) => void },
): Promise<void> {
  const provider = cfg.provider;
  try {
    if (provider === 'openai') {
      await streamMessageToOpenAI(messages, images, systemPrompt, cfg.openai, callbacks);
      return;
    }
    if (provider === 'mistral') {
      await streamMessageToMistral(messages, images, systemPrompt, cfg.mistral, callbacks);
      return;
    }
    // Gemini: fallback non-streaming pour l’instant
    const full = await sendMessageToGemini(messages, images, systemPrompt, cfg.gemini);
    if (full) callbacks.onToken(full);
    callbacks.onDone?.();
  } catch (err) {
    // Fallback: non-streaming via pipeline standard
    try {
      const full = await sendMessage(cfg, messages, images, systemPrompt);
      if (full) callbacks.onToken(full);
      callbacks.onDone?.();
    } catch (e) {
      callbacks.onError?.(e);
      throw e;
    }
  }
}


