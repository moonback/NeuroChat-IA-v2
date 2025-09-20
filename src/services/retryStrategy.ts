/**
 * 🔄 Service de Stratégie de Retry Intelligent
 * 
 * Gère les tentatives de reconnexion avec des stratégies adaptatives
 * basées sur le type d'erreur et les performances historiques.
 */

export interface RetryConfig {
  /** Nombre maximum de tentatives */
  maxRetries: number;
  /** Délai initial entre les tentatives (ms) */
  initialDelay: number;
  /** Facteur de multiplication du délai */
  backoffMultiplier: number;
  /** Délai maximum entre les tentatives (ms) */
  maxDelay: number;
  /** Ajout de randomisation au délai */
  jitter: boolean;
  /** Types d'erreurs pour lesquels retry */
  retryableErrors: string[];
  /** Types d'erreurs pour lesquels pas de retry */
  nonRetryableErrors: string[];
}

export interface RetryAttempt {
  /** Numéro de la tentative */
  attempt: number;
  /** Timestamp de la tentative */
  timestamp: number;
  /** Type d'erreur rencontrée */
  errorType: string;
  /** Message d'erreur */
  errorMessage: string;
  /** Délai avant la prochaine tentative */
  nextDelay: number;
  /** Succès ou échec */
  success: boolean;
}

export interface RetryStats {
  /** Nombre total de tentatives */
  totalAttempts: number;
  /** Nombre de succès */
  successfulAttempts: number;
  /** Taux de succès (0-1) */
  successRate: number;
  /** Temps moyen de retry */
  averageRetryTime: number;
  /** Erreurs les plus fréquentes */
  commonErrors: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  /** Performance par fournisseur */
  providerPerformance: Record<string, {
    attempts: number;
    successes: number;
    averageDelay: number;
  }>;
}

/**
 * Gestionnaire de retry intelligent
 */
class RetryManager {
  private attempts: RetryAttempt[] = [];
  private configs: Map<string, RetryConfig> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  /**
   * Initialise les configurations par défaut pour chaque fournisseur
   */
  private initializeDefaultConfigs(): void {
    // Configuration pour Gemini
    this.configs.set('gemini', {
      maxRetries: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
      jitter: true,
      retryableErrors: [
        '429', // Rate limit
        '500', // Server error
        '502', // Bad gateway
        '503', // Service unavailable
        '504', // Gateway timeout
        'timeout',
        'network_error',
        'connection_error'
      ],
      nonRetryableErrors: [
        '400', // Bad request
        '401', // Unauthorized
        '403', // Forbidden
        '404', // Not found
        'invalid_api_key',
        'quota_exceeded'
      ]
    });

    // Configuration pour OpenAI
    this.configs.set('openai', {
      maxRetries: 4,
      initialDelay: 2000,
      backoffMultiplier: 1.5,
      maxDelay: 15000,
      jitter: true,
      retryableErrors: [
        '429',
        '500',
        '502',
        '503',
        '504',
        'timeout',
        'network_error',
        'rate_limit_exceeded'
      ],
      nonRetryableErrors: [
        '400',
        '401',
        '403',
        '404',
        'invalid_api_key',
        'insufficient_quota',
        'billing_quota_exceeded'
      ]
    });

    // Configuration pour Mistral
    this.configs.set('mistral', {
      maxRetries: 3,
      initialDelay: 1500,
      backoffMultiplier: 2.5,
      maxDelay: 12000,
      jitter: true,
      retryableErrors: [
        '429',
        '500',
        '502',
        '503',
        '504',
        'timeout',
        'network_error',
        'service_unavailable'
      ],
      nonRetryableErrors: [
        '400',
        '401',
        '403',
        '404',
        'invalid_api_key',
        'quota_exceeded',
        'account_suspended'
      ]
    });
  }

  /**
   * Exécute une opération avec retry intelligent
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    provider: 'gemini' | 'openai' | 'mistral',
    _context?: string
  ): Promise<T> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Configuration de retry non trouvée pour ${provider}`);
    }

    let lastError: Error | null = null;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const duration = Date.now() - startTime;

        // Enregistrer le succès
        this.recordAttempt({
          attempt,
          timestamp: Date.now(),
          errorType: 'success',
          errorMessage: '',
          nextDelay: 0,
          success: true
        }, provider, duration);

        return result;
      } catch (error) {
        lastError = error as Error;
        const errorType = this.categorizeError(error as Error);
        
        // Vérifier si on doit retry
        if (!this.shouldRetry(errorType, config, attempt)) {
          this.recordAttempt({
            attempt,
            timestamp: Date.now(),
            errorType,
            errorMessage: lastError.message,
            nextDelay: 0,
            success: false
          }, provider);
          
          throw lastError;
        }

        // Calculer le délai pour la prochaine tentative
        const nextDelay = this.calculateDelay(delay, config, attempt);
        
        this.recordAttempt({
          attempt,
          timestamp: Date.now(),
          errorType,
          errorMessage: lastError.message,
          nextDelay,
          success: false
        }, provider);

        // Attendre avant la prochaine tentative
        if (attempt < config.maxRetries) {
          await this.sleep(nextDelay);
          delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
        }
      }
    }

    throw lastError || new Error('Toutes les tentatives ont échoué');
  }

  /**
   * Catégorise une erreur pour décider du retry
   */
  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    
    // Erreurs de rate limiting
    if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
      return '429';
    }
    
    // Erreurs serveur
    if (message.includes('500')) return '500';
    if (message.includes('502')) return '502';
    if (message.includes('503')) return '503';
    if (message.includes('504')) return '504';
    
    // Erreurs réseau
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'network_error';
    }
    
    // Erreurs d'authentification
    if (message.includes('401') || message.includes('unauthorized')) {
      return '401';
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return '403';
    }
    if (message.includes('api key') || message.includes('invalid key')) {
      return 'invalid_api_key';
    }
    
    // Erreurs de quota
    if (message.includes('quota') || message.includes('billing')) {
      return 'quota_exceeded';
    }
    
    // Erreurs de requête
    if (message.includes('400') || message.includes('bad request')) {
      return '400';
    }
    if (message.includes('404') || message.includes('not found')) {
      return '404';
    }
    
    return 'unknown';
  }

  /**
   * Détermine si on doit retry basé sur le type d'erreur
   */
  private shouldRetry(
    errorType: string,
    config: RetryConfig,
    attempt: number
  ): boolean {
    // Ne pas retry si c'est la dernière tentative
    if (attempt >= config.maxRetries) {
      return false;
    }
    
    // Ne pas retry pour les erreurs non retryables
    if (config.nonRetryableErrors.includes(errorType)) {
      return false;
    }
    
    // Retry pour les erreurs retryables
    if (config.retryableErrors.includes(errorType)) {
      return true;
    }
    
    // Par défaut, ne pas retry pour les erreurs inconnues
    return false;
  }

  /**
   * Calcule le délai avant la prochaine tentative
   */
  private calculateDelay(
    currentDelay: number,
    config: RetryConfig,
    attempt: number
  ): number {
    let delay = Math.min(
      currentDelay * config.backoffMultiplier,
      config.maxDelay
    );

    // Ajouter de la randomisation (jitter) pour éviter le thundering herd
    if (config.jitter) {
      const jitterAmount = delay * 0.1; // 10% de jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }

    // Ajuster basé sur les performances historiques
    delay = this.adjustDelayBasedOnHistory(delay, attempt);

    return Math.max(100, Math.round(delay)); // Minimum 100ms
  }

  /**
   * Ajuste le délai basé sur l'historique de performance
   */
  private adjustDelayBasedOnHistory(baseDelay: number, attempt: number): number {
    const recentAttempts = this.attempts.slice(-10); // 10 dernières tentatives
    const successRate = recentAttempts.filter(a => a.success).length / recentAttempts.length;
    
    // Si le taux de succès est faible, augmenter le délai
    if (successRate < 0.3 && attempt > 1) {
      return baseDelay * 1.5;
    }
    
    // Si le taux de succès est élevé, réduire le délai
    if (successRate > 0.8 && attempt === 1) {
      return baseDelay * 0.7;
    }
    
    return baseDelay;
  }

  /**
   * Enregistre une tentative de retry
   */
  private recordAttempt(
    attempt: RetryAttempt,
    provider: string,
    duration?: number
  ): void {
    this.attempts.push(attempt);
    
    // Garder seulement les 1000 dernières tentatives
    if (this.attempts.length > 1000) {
      this.attempts = this.attempts.slice(-1000);
    }
    
    // Enregistrer les performances par fournisseur
    if (duration !== undefined) {
      if (!this.performanceHistory.has(provider)) {
        this.performanceHistory.set(provider, []);
      }
      
      const history = this.performanceHistory.get(provider)!;
      history.push(duration);
      
      // Garder seulement les 100 dernières performances
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
    }
  }

  /**
   * Utilitaire pour attendre
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Met à jour la configuration pour un fournisseur
   */
  updateConfig(provider: string, config: Partial<RetryConfig>): void {
    const currentConfig = this.configs.get(provider);
    if (currentConfig) {
      this.configs.set(provider, { ...currentConfig, ...config });
    }
  }

  /**
   * Obtient les statistiques de retry
   */
  getStats(): RetryStats {
    const totalAttempts = this.attempts.length;
    const successfulAttempts = this.attempts.filter(a => a.success).length;
    const successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;
    
    // Calculer le temps moyen de retry
    const retryAttempts = this.attempts.filter(a => !a.success && a.attempt > 1);
    const averageRetryTime = retryAttempts.length > 0 
      ? retryAttempts.reduce((sum, a) => sum + a.nextDelay, 0) / retryAttempts.length
      : 0;
    
    // Compter les erreurs communes
    const errorCounts = new Map<string, number>();
    this.attempts.forEach(a => {
      if (!a.success) {
        errorCounts.set(a.errorType, (errorCounts.get(a.errorType) || 0) + 1);
      }
    });
    
    const commonErrors = Array.from(errorCounts.entries())
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: totalAttempts > 0 ? count / totalAttempts : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Performance par fournisseur
    const providerPerformance: Record<string, any> = {};
    this.performanceHistory.forEach((history, provider) => {
      const attempts = history.length;
      const successes = attempts; // Toutes les entrées dans l'historique sont des succès
      const averageDelay = attempts > 0 
        ? history.reduce((sum, duration) => sum + duration, 0) / attempts
        : 0;
      
      providerPerformance[provider] = {
        attempts,
        successes,
        averageDelay
      };
    });
    
    return {
      totalAttempts,
      successfulAttempts,
      successRate,
      averageRetryTime,
      commonErrors,
      providerPerformance
    };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.attempts = [];
    this.performanceHistory.clear();
  }
}

// Instance globale du gestionnaire de retry
const retryManager = new RetryManager();

/**
 * Interface publique du service de retry
 */
export const RetryStrategy = {
  /**
   * Exécute une opération avec retry intelligent
   */
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    provider: 'gemini' | 'openai' | 'mistral',
    context?: string
  ) => retryManager.executeWithRetry(operation, provider, context),

  /**
   * Met à jour la configuration de retry
   */
  updateConfig: (provider: string, config: Partial<RetryConfig>) =>
    retryManager.updateConfig(provider, config),

  /**
   * Obtient les statistiques de retry
   */
  getStats: () => retryManager.getStats(),

  /**
   * Réinitialise les statistiques
   */
  resetStats: () => retryManager.resetStats()
};

/**
 * Wrapper pour les appels API avec retry automatique
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  provider: 'gemini' | 'openai' | 'mistral',
  context?: string
): Promise<T> {
  return RetryStrategy.executeWithRetry(apiCall, provider, context);
}

/**
 * Configuration adaptative basée sur les performances
 */
export function adaptRetryConfig(provider: string, _recentPerformance: number): void {
  const currentStats = retryManager.getStats();
  const providerStats = currentStats.providerPerformance[provider];
  
  if (!providerStats) return;
  
  const successRate = providerStats.successes / providerStats.attempts;
  
  if (successRate < 0.5) {
    // Performance faible, augmenter les délais
    retryManager.updateConfig(provider, {
      initialDelay: 3000,
      backoffMultiplier: 3,
      maxDelay: 20000
    });
  } else if (successRate > 0.9) {
    // Performance élevée, réduire les délais
    retryManager.updateConfig(provider, {
      initialDelay: 500,
      backoffMultiplier: 1.5,
      maxDelay: 5000
    });
  }
}
