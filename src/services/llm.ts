import { sendMessageToGemini, type GeminiGenerationConfig } from '@/services/geminiApi';
import { sendMessageToOpenAI, type OpenAIGenerationConfig, streamMessageToOpenAI } from '@/services/openaiApi';
import { sendMessageToMistral, type MistralGenerationConfig, streamMessageToMistral } from '@/services/mistralApi';
import { OptimizedLLM, type OptimizedLlmConfig } from '@/services/optimizedLLM';
import { getDeviceCapabilities } from '@/services/deviceDetection';

export type Provider = 'gemini' | 'openai' | 'mistral';

export interface LlmConfig {
  provider: Provider;
  gemini?: GeminiGenerationConfig;
  openai?: OpenAIGenerationConfig;
  mistral?: MistralGenerationConfig;
  /** Activer les optimisations automatiques */
  enableOptimizations?: boolean;
  /** Utiliser le cache intelligent */
  useCache?: boolean;
  /** Contexte pour l'optimisation */
  context?: {
    hasRagContext?: boolean;
    hasWebResults?: boolean;
    hasImageContext?: boolean;
  };
}

export async function sendMessage(
  cfg: LlmConfig,
  messages: Array<{ text: string; isUser: boolean }>,
  images: File[] | undefined,
  systemPrompt: string,
  options?: { soft?: boolean },
): Promise<string> {
  // Utiliser le service optimisé si les optimisations sont activées
  if (cfg.enableOptimizations !== false) {
    try {
      const optimizedConfig: OptimizedLlmConfig = {
        provider: cfg.provider,
        gemini: cfg.gemini,
        openai: cfg.openai,
        mistral: cfg.mistral,
        autoOptimize: cfg.enableOptimizations ?? true,
        useCache: cfg.useCache !== false,
        context: cfg.context
      };

      const result = await OptimizedLLM.sendMessage(
        optimizedConfig,
        messages,
        images,
        systemPrompt
      );

      // Log des métriques d'optimisation en mode développement
      if (import.meta.env.DEV) {
        console.log('🚀 Message optimisé:', {
          provider: result.metadata.provider,
          model: result.metadata.model,
          fromCache: result.metadata.fromCache,
          optimizationApplied: result.metadata.optimizationApplied,
          responseTime: result.metadata.responseTime,
          qualityScore: result.metadata.qualityScore
        });
      }

      return result.response;
    } catch (error) {
      console.warn('Optimisations échouées, fallback vers le système standard:', error);
      // Continuer avec le système standard en cas d'échec
    }
  }

  // Système de fallback standard (code existant)
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
  callbacks: { onToken: (token: string) => void; onDone?: () => void; onError?: (err: Error) => void },
): Promise<void> {
  // Utiliser le service optimisé si les optimisations sont activées
  if (cfg.enableOptimizations !== false) {
    try {
      const optimizedConfig: OptimizedLlmConfig = {
        provider: cfg.provider,
        gemini: cfg.gemini,
        openai: cfg.openai,
        mistral: cfg.mistral,
        autoOptimize: cfg.enableOptimizations ?? true,
        useCache: cfg.useCache !== false,
        context: cfg.context
      };

      const enhancedCallbacks = {
        ...callbacks,
        onMetadata: (metadata: any) => {
          // Log des métriques d'optimisation en mode développement
          if (import.meta.env.DEV) {
            console.log('🚀 Streaming optimisé:', {
              provider: metadata.provider,
              model: metadata.model,
              optimizationApplied: metadata.optimizationApplied,
              responseTime: metadata.responseTime,
              qualityScore: metadata.qualityScore
            });
          }
        }
      };

      await OptimizedLLM.streamMessage(
        optimizedConfig,
        messages,
        images,
        systemPrompt,
        enhancedCallbacks
      );
      return;
    } catch (error) {
      console.warn('Streaming optimisé échoué, fallback vers le système standard:', error);
      // Continuer avec le système standard en cas d'échec
    }
  }

  // Système de streaming standard (code existant)
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
    // Gemini: fallback non-streaming pour l'instant
    const full = await sendMessageToGemini(messages, images, systemPrompt, cfg.gemini);
    if (full) callbacks.onToken(full);
    callbacks.onDone?.();
  } catch {
    // Fallback: non-streaming via pipeline standard
    try {
      const full = await sendMessage(cfg, messages, images, systemPrompt);
      if (full) callbacks.onToken(full);
      callbacks.onDone?.();
    } catch {
      callbacks.onError?.(new Error('Erreur lors de l\'envoi du message'));
      throw new Error('Erreur lors de l\'envoi du message');
    }
  }
}

/**
 * Fonctions utilitaires pour faciliter l'utilisation des optimisations
 */

/**
 * Active les optimisations automatiques pour un appel
 */
export function withOptimizations<T extends LlmConfig>(config: T): T {
  return {
    ...config,
    enableOptimizations: true,
    useCache: true
  };
}

/**
 * Configure les optimisations avec un contexte spécifique
 */
export function withContext<T extends LlmConfig>(
  config: T, 
  context: { hasRagContext?: boolean; hasWebResults?: boolean; hasImageContext?: boolean }
): T {
  return {
    ...config,
    enableOptimizations: true,
    useCache: true,
    context
  };
}

/**
 * Désactive toutes les optimisations
 */
export function withoutOptimizations<T extends LlmConfig>(config: T): T {
  return {
    ...config,
    enableOptimizations: false,
    useCache: false
  };
}

/**
 * Obtient les recommandations d'optimisation basées sur les capacités de l'appareil
 */
export function getOptimizationRecommendations(): {
  recommendedProvider: Provider;
  shouldUseCache: boolean;
  shouldOptimizePrompts: boolean;
  deviceCapabilities: any;
} {
  const capabilities = getDeviceCapabilities();
  
  // Recommandations basées sur les performances
  let recommendedProvider: Provider = 'gemini'; // Par défaut
  if (capabilities.performanceScore >= 8) {
    recommendedProvider = 'openai'; // Meilleure qualité pour les appareils puissants
  } else if (capabilities.performanceScore <= 4) {
    recommendedProvider = 'mistral'; // Plus léger pour les appareils faibles
  }

  return {
    recommendedProvider,
    shouldUseCache: capabilities.memoryMB >= 2048, // Cache si au moins 2GB de RAM
    shouldOptimizePrompts: true, // Toujours optimiser les prompts
    deviceCapabilities: capabilities
  };
}

/**
 * Initialise les services d'optimisation
 */
export function initializeOptimizations(): void {
  // Initialiser le cache des réponses
  try {
    const { initializeCache } = require('./responseCache');
    initializeCache();
  } catch (error) {
    console.warn('Impossible d\'initialiser le cache:', error);
  }
}

/**
 * Obtient les statistiques d'optimisation
 */
export function getOptimizationStats() {
  try {
    const { OptimizedLLM } = require('./optimizedLLM');
    return OptimizedLLM.getOptimizationStats();
  } catch (error) {
    console.warn('Impossible d\'obtenir les statistiques d\'optimisation:', error);
    return null;
  }
}


