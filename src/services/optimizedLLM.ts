/**
 * 🚀 Service LLM Optimisé
 * 
 * Service principal qui intègre toutes les optimisations :
 * - Détection automatique des capacités d'appareil
 * - Optimisation des prompts par fournisseur
 * - Cache intelligent des réponses
 * - Stratégies de retry adaptatives
 * - Sélection automatique du modèle optimal
 */

import { getDeviceCapabilities, getOptimalModelConfig } from './deviceDetection';
import { optimizePrompt, analyzeRequest, type PromptContext } from './promptOptimization';
import { ResponseCache } from './responseCache';
import { withRetry } from './retryStrategy';
import { sendMessageToGemini, type GeminiGenerationConfig } from './geminiApi';
import { sendMessageToOpenAI, streamMessageToOpenAI, type OpenAIGenerationConfig } from './openaiApi';
import { sendMessageToMistral, streamMessageToMistral, type MistralGenerationConfig } from './mistralApi';

export type Provider = 'gemini' | 'openai' | 'mistral';

export interface OptimizedLlmConfig {
  /** Fournisseur principal */
  provider: Provider;
  /** Configuration Gemini (si applicable) */
  gemini?: GeminiGenerationConfig;
  /** Configuration OpenAI (si applicable) */
  openai?: OpenAIGenerationConfig;
  /** Configuration Mistral (si applicable) */
  mistral?: MistralGenerationConfig;
  /** Activer l'optimisation automatique */
  autoOptimize?: boolean;
  /** Utiliser le cache */
  useCache?: boolean;
  /** Contexte pour l'optimisation */
  context?: {
    hasRagContext?: boolean;
    hasWebResults?: boolean;
    hasImageContext?: boolean;
  };
}

export interface OptimizedResponse {
  /** Réponse du modèle */
  response: string;
  /** Métadonnées de l'optimisation */
  metadata: {
    provider: Provider;
    model: string;
    fromCache: boolean;
    optimizationApplied: boolean;
    deviceCapabilities: any;
    promptOptimized: boolean;
    retryAttempts: number;
    responseTime: number;
    qualityScore: number;
  };
}

/**
 * Service LLM optimisé principal
 */
class OptimizedLLMService {
  private deviceCapabilities = getDeviceCapabilities();
  private lastCapabilityCheck = Date.now();
  private readonly CAPABILITY_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

  /**
   * Envoie un message avec toutes les optimisations
   */
  async sendMessage(
    config: OptimizedLlmConfig,
    messages: Array<{ text: string; isUser: boolean }>,
    images?: File[],
    systemPrompt?: string
  ): Promise<OptimizedResponse> {
    const startTime = Date.now();
    
    // Rafraîchir les capacités de l'appareil si nécessaire
    this.refreshDeviceCapabilitiesIfNeeded();
    
    // Analyser la requête pour l'optimisation
    const lastMessage = messages[messages.length - 1];
    const requestAnalysis = analyzeRequest(lastMessage.text);
    
    // Enrichir le contexte
    const enrichedContext: PromptContext = {
      ...requestAnalysis,
      availableContext: {
        hasRagContext: config.context?.hasRagContext || false,
        hasWebResults: config.context?.hasWebResults || false,
        hasImageContext: config.context?.hasImageContext || false
      }
    };

    // Vérifier le cache si activé
    if (config.useCache !== false) {
      const cacheKey = this.generateCacheKey(messages, config, enrichedContext);
      const cachedResponse = ResponseCache.get(
        cacheKey,
        config.provider,
        this.getCurrentModel(config),
        this.getCurrentParams(config),
        enrichedContext
      );
      
      if (cachedResponse) {
        return {
          response: cachedResponse.response,
          metadata: {
            provider: config.provider,
            model: this.getCurrentModel(config),
            fromCache: true,
            optimizationApplied: false,
            deviceCapabilities: this.deviceCapabilities,
            promptOptimized: false,
            retryAttempts: 0,
            responseTime: Date.now() - startTime,
            qualityScore: cachedResponse.qualityScore
          }
        };
      }
    }

    // Optimiser la configuration selon l'appareil
    const optimizedConfig = this.optimizeConfigForDevice(config);
    
    // Optimiser le prompt
    const optimizedPrompt = config.autoOptimize !== false 
      ? optimizePrompt(config.provider, lastMessage.text, enrichedContext, systemPrompt)
      : null;

    let retryAttempts = 0;
    let finalResponse: string;

    try {
      // Exécuter l'appel API avec retry intelligent
      finalResponse = await withRetry(async () => {
        retryAttempts++;
        return await this.executeApiCall(
          optimizedConfig,
          messages,
          images,
          systemPrompt || '',
          optimizedPrompt
        );
      }, config.provider, `sendMessage-${enrichedContext.requestType}`);
      
    } catch (error) {
      console.error('Erreur lors de l\'appel API optimisé:', error);
      throw error;
    }

    // Mettre en cache la réponse si activé
    if (config.useCache !== false && finalResponse) {
      ResponseCache.set(
        this.generateCacheKey(messages, config, enrichedContext),
        config.provider,
        this.getCurrentModel(optimizedConfig),
        finalResponse,
        this.getCurrentParams(optimizedConfig),
        {
          requestType: enrichedContext.requestType,
          complexity: enrichedContext.complexity,
          responseLength: enrichedContext.responseLength,
          hasContext: enrichedContext.availableContext.hasRagContext || 
                     enrichedContext.availableContext.hasWebResults
        },
        enrichedContext
      );
    }

    const responseTime = Date.now() - startTime;
    const qualityScore = this.evaluateResponseQuality(finalResponse, enrichedContext);

    return {
      response: finalResponse,
      metadata: {
        provider: optimizedConfig.provider,
        model: this.getCurrentModel(optimizedConfig),
        fromCache: false,
        optimizationApplied: config.autoOptimize !== false,
        deviceCapabilities: this.deviceCapabilities,
        promptOptimized: optimizedPrompt !== null,
        retryAttempts,
        responseTime,
        qualityScore
      }
    };
  }

  /**
   * Stream un message avec optimisations
   */
  async streamMessage(
    config: OptimizedLlmConfig,
    messages: Array<{ text: string; isUser: boolean }>,
    images: File[] | undefined,
    systemPrompt: string,
    callbacks: { 
      onToken: (token: string) => void; 
      onDone?: () => void; 
      onError?: (err: Error) => void;
      onMetadata?: (metadata: OptimizedResponse['metadata']) => void;
    }
  ): Promise<void> {
    const startTime = Date.now();
    
    // Rafraîchir les capacités de l'appareil si nécessaire
    this.refreshDeviceCapabilitiesIfNeeded();
    
    // Analyser la requête
    const lastMessage = messages[messages.length - 1];
    const requestAnalysis = analyzeRequest(lastMessage.text);
    
    // Enrichir le contexte
    const enrichedContext: PromptContext = {
      ...requestAnalysis,
      availableContext: {
        hasRagContext: config.context?.hasRagContext || false,
        hasWebResults: config.context?.hasWebResults || false,
        hasImageContext: config.context?.hasImageContext || false
      }
    };

    // Optimiser la configuration
    const optimizedConfig = this.optimizeConfigForDevice(config);
    
    // Optimiser le prompt
    const optimizedPrompt = config.autoOptimize !== false 
      ? optimizePrompt(config.provider, lastMessage.text, enrichedContext, systemPrompt)
      : null;

    let tokensReceived = 0;
    let retryAttempts = 0;

    try {
      // Exécuter le streaming avec retry
      await withRetry(async () => {
        retryAttempts++;
        
        const streamingCallbacks = {
          onToken: (token: string) => {
            tokensReceived++;
            callbacks.onToken(token);
          },
          onDone: () => {
            const responseTime = Date.now() - startTime;
            const qualityScore = this.evaluateResponseQuality(
              `Streaming response with ${tokensReceived} tokens`,
              enrichedContext
            );

            callbacks.onMetadata?.({
              provider: optimizedConfig.provider,
              model: this.getCurrentModel(optimizedConfig),
              fromCache: false,
              optimizationApplied: config.autoOptimize !== false,
              deviceCapabilities: this.deviceCapabilities,
              promptOptimized: optimizedPrompt !== null,
              retryAttempts,
              responseTime,
              qualityScore
            });

            callbacks.onDone?.();
          },
          onError: callbacks.onError
        };

        return await this.executeStreamingCall(
          optimizedConfig,
          messages,
          images,
          systemPrompt || '',
          streamingCallbacks,
          optimizedPrompt
        );
      }, config.provider, `streamMessage-${enrichedContext.requestType}`);
      
    } catch (error) {
      console.error('Erreur lors du streaming optimisé:', error);
      callbacks.onError?.(error as Error);
    }
  }

  /**
   * Rafraîchit les capacités de l'appareil si nécessaire
   */
  private refreshDeviceCapabilitiesIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCapabilityCheck > this.CAPABILITY_REFRESH_INTERVAL) {
      this.deviceCapabilities = getDeviceCapabilities();
      this.lastCapabilityCheck = now;
    }
  }

  /**
   * Optimise la configuration selon les capacités de l'appareil
   */
  private optimizeConfigForDevice(config: OptimizedLlmConfig): OptimizedLlmConfig {
    if (config.autoOptimize === false) {
      return config;
    }

    const optimalConfig = getOptimalModelConfig(config.provider, this.deviceCapabilities);
    
    const optimizedConfig = { ...config };
    
    // Appliquer les paramètres optimisés
    switch (config.provider) {
      case 'gemini':
        optimizedConfig.gemini = {
          ...config.gemini,
          temperature: config.gemini?.temperature ?? optimalConfig.optimizedParams.temperature,
          topP: config.gemini?.topP ?? optimalConfig.optimizedParams.topP,
          maxOutputTokens: config.gemini?.maxOutputTokens ?? optimalConfig.optimizedParams.maxTokens
        };
        break;
        
      case 'openai':
        optimizedConfig.openai = {
          ...config.openai,
          temperature: config.openai?.temperature ?? optimalConfig.optimizedParams.temperature,
          top_p: config.openai?.top_p ?? optimalConfig.optimizedParams.topP,
          max_tokens: config.openai?.max_tokens ?? optimalConfig.optimizedParams.maxTokens
        };
        break;
        
      case 'mistral':
        optimizedConfig.mistral = {
          ...config.mistral,
          temperature: config.mistral?.temperature ?? optimalConfig.optimizedParams.temperature,
          top_p: config.mistral?.top_p ?? optimalConfig.optimizedParams.topP,
          max_tokens: config.mistral?.max_tokens ?? optimalConfig.optimizedParams.maxTokens
        };
        break;
    }

    return optimizedConfig;
  }

  /**
   * Exécute l'appel API avec la configuration optimisée
   */
  private async executeApiCall(
    config: OptimizedLlmConfig,
    messages: Array<{ text: string; isUser: boolean }>,
    images: File[] | undefined,
    systemPrompt: string,
    optimizedPrompt: any
  ): Promise<string> {
    // Utiliser le prompt optimisé si disponible
    const finalMessages = optimizedPrompt 
      ? [...messages.slice(0, -1), { ...messages[messages.length - 1], text: optimizedPrompt.optimizedPrompt }]
      : messages;

    // Utiliser les paramètres optimisés si disponibles
    const generationConfig = optimizedPrompt 
      ? this.applyOptimizedParams(config, optimizedPrompt.generationParams)
      : config;

    switch (config.provider) {
      case 'gemini':
        return await sendMessageToGemini(
          finalMessages,
          images,
          systemPrompt || '',
          generationConfig.gemini,
          { soft: true }
        );
        
      case 'openai':
        return await sendMessageToOpenAI(
          finalMessages,
          images,
          systemPrompt || '',
          generationConfig.openai
        );
        
      case 'mistral':
        return await sendMessageToMistral(
          finalMessages,
          images,
          systemPrompt || '',
          generationConfig.mistral
        );
        
      default:
        throw new Error(`Fournisseur non supporté: ${config.provider}`);
    }
  }

  /**
   * Exécute l'appel de streaming avec la configuration optimisée
   */
  private async executeStreamingCall(
    config: OptimizedLlmConfig,
    messages: Array<{ text: string; isUser: boolean }>,
    images: File[] | undefined,
    systemPrompt: string,
    callbacks: { onToken: (token: string) => void; onDone?: () => void; onError?: (err: Error) => void },
    optimizedPrompt: any
  ): Promise<void> {
    // Utiliser le prompt optimisé si disponible
    const finalMessages = optimizedPrompt 
      ? [...messages.slice(0, -1), { ...messages[messages.length - 1], text: optimizedPrompt.optimizedPrompt }]
      : messages;

    // Utiliser les paramètres optimisés si disponibles
    const generationConfig = optimizedPrompt 
      ? this.applyOptimizedParams(config, optimizedPrompt.generationParams)
      : config;

    switch (config.provider) {
      case 'gemini':
        // Gemini ne supporte pas le streaming dans cette version
        const response = await sendMessageToGemini(
          finalMessages,
          images,
          systemPrompt || '',
          generationConfig.gemini
        );
        // Simuler le streaming en envoyant la réponse par chunks
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          callbacks.onToken(words[i] + ' ');
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        callbacks.onDone?.();
        return;
        
      case 'openai':
        return await streamMessageToOpenAI(
          finalMessages,
          images,
          systemPrompt || '',
          generationConfig.openai,
          callbacks
        );
        
      case 'mistral':
        return await streamMessageToMistral(
          finalMessages,
          images,
          systemPrompt || '',
          generationConfig.mistral,
          callbacks
        );
        
      default:
        throw new Error(`Fournisseur non supporté: ${config.provider}`);
    }
  }

  /**
   * Applique les paramètres optimisés à la configuration
   */
  private applyOptimizedParams(
    config: OptimizedLlmConfig,
    optimizedParams: { temperature: number; topP: number; maxTokens: number }
  ): OptimizedLlmConfig {
    const newConfig = { ...config };
    
    switch (config.provider) {
      case 'gemini':
        newConfig.gemini = {
          ...config.gemini,
          temperature: optimizedParams.temperature,
          topP: optimizedParams.topP,
          maxOutputTokens: optimizedParams.maxTokens
        };
        break;
        
      case 'openai':
        newConfig.openai = {
          ...config.openai,
          temperature: optimizedParams.temperature,
          top_p: optimizedParams.topP,
          max_tokens: optimizedParams.maxTokens
        };
        break;
        
      case 'mistral':
        newConfig.mistral = {
          ...config.mistral,
          temperature: optimizedParams.temperature,
          top_p: optimizedParams.topP,
          max_tokens: optimizedParams.maxTokens
        };
        break;
    }
    
    return newConfig;
  }

  /**
   * Génère une clé de cache unique
   */
  private generateCacheKey(
    messages: Array<{ text: string; isUser: boolean }>,
    config: OptimizedLlmConfig,
    context: PromptContext
  ): string {
    const lastMessage = messages[messages.length - 1];
    const configStr = JSON.stringify({
      provider: config.provider,
      model: this.getCurrentModel(config),
      params: this.getCurrentParams(config)
    });
    const contextStr = JSON.stringify(context);
    
    return `${lastMessage.text}|${configStr}|${contextStr}`;
  }

  /**
   * Obtient le modèle actuel de la configuration
   */
  private getCurrentModel(config: OptimizedLlmConfig): string {
    switch (config.provider) {
      case 'gemini':
        return 'gemini-1.5-flash'; // Modèle par défaut
      case 'openai':
        return config.openai?.model || 'gpt-4o-mini';
      case 'mistral':
        return config.mistral?.model || 'mistral-small-latest';
      default:
        return 'unknown';
    }
  }

  /**
   * Obtient les paramètres actuels de la configuration
   */
  private getCurrentParams(config: OptimizedLlmConfig): any {
    switch (config.provider) {
      case 'gemini':
        return {
          temperature: config.gemini?.temperature ?? 0.7,
          topP: config.gemini?.topP ?? 0.9,
          maxTokens: config.gemini?.maxOutputTokens ?? 1024
        };
      case 'openai':
        return {
          temperature: config.openai?.temperature ?? 0.7,
          topP: config.openai?.top_p ?? 0.9,
          maxTokens: config.openai?.max_tokens ?? 1024
        };
      case 'mistral':
        return {
          temperature: config.mistral?.temperature ?? 0.7,
          topP: config.mistral?.top_p ?? 0.95,
          maxTokens: config.mistral?.max_tokens ?? 1024
        };
      default:
        return {};
    }
  }

  /**
   * Évalue la qualité d'une réponse
   */
  private evaluateResponseQuality(response: string, context: PromptContext): number {
    let score = 5; // Score de base
    
    // Longueur appropriée
    const wordCount = response.split(/\s+/).length;
    const expectedLength = context.responseLength === 'short' ? 50 : 
                          context.responseLength === 'long' ? 300 : 150;
    
    if (Math.abs(wordCount - expectedLength) < expectedLength * 0.3) {
      score += 1;
    }
    
    // Structure et cohérence
    if (response.includes('\n') && response.length > 100) {
      score += 1;
    }
    
    // Présence d'informations utiles
    const hasExamples = /exemple|par exemple|comme|tels que/i.test(response);
    const hasDetails = /\d+%|\d+€|\d+ ans/i.test(response);
    const hasStructure = /premièrement|deuxièmement|enfin|d'abord|ensuite/i.test(response);
    
    if (hasExamples) score += 1;
    if (hasDetails) score += 1;
    if (hasStructure) score += 1;
    
    return Math.min(10, score);
  }

  /**
   * Obtient les statistiques d'optimisation
   */
  getOptimizationStats() {
    return {
      deviceCapabilities: this.deviceCapabilities,
      cacheStats: ResponseCache.getStats(),
      retryStats: require('./retryStrategy').RetryStrategy.getStats()
    };
  }
}

// Instance globale du service optimisé
const optimizedLLMService = new OptimizedLLMService();

/**
 * Interface publique du service LLM optimisé
 */
export const OptimizedLLM = {
  /**
   * Envoie un message avec optimisations
   */
  sendMessage: (
    config: OptimizedLlmConfig,
    messages: Array<{ text: string; isUser: boolean }>,
    images?: File[],
    systemPrompt?: string
  ) => optimizedLLMService.sendMessage(config, messages, images, systemPrompt),

  /**
   * Stream un message avec optimisations
   */
  streamMessage: (
    config: OptimizedLlmConfig,
    messages: Array<{ text: string; isUser: boolean }>,
    images: File[] | undefined,
    systemPrompt: string,
    callbacks: { 
      onToken: (token: string) => void; 
      onDone?: () => void; 
      onError?: (err: Error) => void;
      onMetadata?: (metadata: OptimizedResponse['metadata']) => void;
    }
  ) => optimizedLLMService.streamMessage(config, messages, images, systemPrompt, callbacks),

  /**
   * Obtient les statistiques d'optimisation
   */
  getOptimizationStats: () => optimizedLLMService.getOptimizationStats()
};
