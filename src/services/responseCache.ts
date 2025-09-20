/**
 * 🗄️ Service de Cache Intelligent des Réponses IA
 * 
 * Cache les réponses des modèles d'IA pour améliorer les performances
 * et réduire les coûts d'API, avec gestion intelligente de l'invalidation.
 */

export interface CacheEntry {
  /** Hash de la requête pour l'identification */
  queryHash: string;
  /** Réponse mise en cache */
  response: string;
  /** Timestamp de création */
  timestamp: number;
  /** Timestamp d'expiration */
  expiresAt: number;
  /** Fournisseur utilisé */
  provider: 'gemini' | 'openai' | 'mistral';
  /** Modèle utilisé */
  model: string;
  /** Paramètres de génération */
  generationParams: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  /** Métadonnées de la requête */
  metadata: {
    requestType: string;
    complexity: number;
    responseLength: string;
    hasContext: boolean;
  };
  /** Nombre d'accès */
  accessCount: number;
  /** Dernier accès */
  lastAccessed: number;
  /** Score de qualité estimé */
  qualityScore: number;
}

export interface CacheStats {
  /** Nombre total d'entrées */
  totalEntries: number;
  /** Nombre d'entrées expirées */
  expiredEntries: number;
  /** Taille totale en bytes */
  totalSize: number;
  /** Taux de hit (0-1) */
  hitRate: number;
  /** Entrées les plus utilisées */
  topEntries: Array<{
    queryHash: string;
    accessCount: number;
    qualityScore: number;
  }>;
  /** Répartition par fournisseur */
  providerDistribution: Record<string, number>;
}

/**
 * Gestionnaire de cache intelligent
 */
class ResponseCacheManager {
  private cache = new Map<string, CacheEntry>();
  private accessLog: Array<{ queryHash: string; timestamp: number }> = [];
  private readonly maxEntries = 1000;
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 heures
  private readonly maxSize = 50 * 1024 * 1024; // 50MB

  /**
   * Génère un hash unique pour une requête
   */
  private generateQueryHash(
    prompt: string,
    provider: string,
    model: string,
    generationParams: any,
    context?: any
  ): string {
    const normalizedPrompt = prompt.toLowerCase().trim();
    const contextStr = context ? JSON.stringify(context) : '';
    
    const hashInput = `${normalizedPrompt}|${provider}|${model}|${JSON.stringify(generationParams)}|${contextStr}`;
    
    // Hash simple mais efficace
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Vérifie si une réponse est en cache
   */
  get(
    prompt: string,
    provider: 'gemini' | 'openai' | 'mistral',
    model: string,
    generationParams: any,
    context?: any
  ): CacheEntry | null {
    const queryHash = this.generateQueryHash(prompt, provider, model, generationParams, context);
    const entry = this.cache.get(queryHash);

    if (!entry) {
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(queryHash);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.accessLog.push({ queryHash, timestamp: Date.now() });

    return entry;
  }

  /**
   * Stocke une réponse en cache
   */
  set(
    prompt: string,
    provider: 'gemini' | 'openai' | 'mistral',
    model: string,
    response: string,
    generationParams: any,
    metadata: CacheEntry['metadata'],
    context?: any,
    ttl?: number
  ): void {
    const queryHash = this.generateQueryHash(prompt, provider, model, generationParams, context);
    const now = Date.now();
    
    // Évaluer la qualité de la réponse
    const qualityScore = this.evaluateResponseQuality(response, metadata);

    const entry: CacheEntry = {
      queryHash,
      response,
      timestamp: now,
      expiresAt: now + (ttl || this.getDynamicTTL(metadata)),
      provider,
      model,
      generationParams,
      metadata,
      accessCount: 1,
      lastAccessed: now,
      qualityScore
    };

    // Nettoyer le cache si nécessaire
    this.cleanupIfNeeded();

    this.cache.set(queryHash, entry);
  }

  /**
   * Calcule un TTL dynamique basé sur les métadonnées
   */
  private getDynamicTTL(metadata: CacheEntry['metadata']): number {
    let ttl = this.defaultTTL;

    // Ajuster selon le type de requête
    switch (metadata.requestType) {
      case 'factual':
        ttl *= 7; // Les faits changent moins souvent
        break;
      case 'creative':
        ttl *= 0.5; // La créativité doit être fraîche
        break;
      case 'technical':
        ttl *= 3; // Les informations techniques sont stables
        break;
      case 'current':
        ttl *= 0.1; // Les informations actuelles expirent rapidement
        break;
    }

    // Ajuster selon la complexité
    if (metadata.complexity >= 4) {
      ttl *= 2; // Les réponses complexes sont plus coûteuses à régénérer
    }

    // Ajuster selon la présence de contexte
    if (metadata.hasContext) {
      ttl *= 0.3; // Les réponses contextuelles sont moins réutilisables
    }

    return Math.max(ttl, 60 * 60 * 1000); // Minimum 1 heure
  }

  /**
   * Évalue la qualité d'une réponse pour le cache
   */
  private evaluateResponseQuality(response: string, metadata: CacheEntry['metadata']): number {
    let score = 5; // Score de base

    // Longueur appropriée
    const wordCount = response.split(/\s+/).length;
    const expectedLength = metadata.responseLength === 'short' ? 50 : 
                          metadata.responseLength === 'long' ? 300 : 150;
    
    if (Math.abs(wordCount - expectedLength) < expectedLength * 0.3) {
      score += 1;
    }

    // Structure et cohérence
    if (response.includes('\n') && response.length > 100) {
      score += 1; // Bonne structure pour les réponses longues
    }

    // Présence d'informations utiles
    const hasExamples = /exemple|par exemple|comme|tels que/i.test(response);
    const hasDetails = /\d+%|\d+€|\d+ ans|\d+ ans/i.test(response);
    const hasStructure = /premièrement|deuxièmement|enfin|d'abord|ensuite/i.test(response);

    if (hasExamples) score += 1;
    if (hasDetails) score += 1;
    if (hasStructure) score += 1;

    return Math.min(10, score);
  }

  /**
   * Nettoie le cache si nécessaire
   */
  private cleanupIfNeeded(): void {
    // Nettoyer les entrées expirées
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Si trop d'entrées, supprimer les moins utilisées
    if (this.cache.size >= this.maxEntries) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => {
        const scoreA = a[1].accessCount + (a[1].qualityScore * 0.1);
        const scoreB = b[1].accessCount + (b[1].qualityScore * 0.1);
        return scoreA - scoreB;
      });

      // Supprimer les 20% les moins utilisées
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    // Vérifier la taille totale
    this.checkSizeLimit();
  }

  /**
   * Vérifie et gère la limite de taille
   */
  private checkSizeLimit(): void {
    let totalSize = 0;
    const entries = Array.from(this.cache.entries());

    for (const [, entry] of entries) {
      totalSize += JSON.stringify(entry).length;
    }

    if (totalSize > this.maxSize) {
      // Supprimer les entrées les moins récentes
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = Math.floor(entries.length * 0.3);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Invalide le cache pour un pattern donné
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern, 'i');
    
    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(entry.response) || regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalide le cache pour un fournisseur donné
   */
  invalidateByProvider(provider: 'gemini' | 'openai' | 'mistral'): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.provider === provider) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.accessLog = [];
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    const expiredEntries = entries.filter(entry => now > entry.expiresAt).length;
    
    let totalSize = 0;
    const providerDistribution: Record<string, number> = {};
    const topEntries: Array<{ queryHash: string; accessCount: number; qualityScore: number }> = [];

    for (const entry of entries) {
      totalSize += JSON.stringify(entry).length;
      
      providerDistribution[entry.provider] = (providerDistribution[entry.provider] || 0) + 1;
      
      topEntries.push({
        queryHash: entry.queryHash,
        accessCount: entry.accessCount,
        qualityScore: entry.qualityScore
      });
    }

    // Trier les entrées les plus utilisées
    topEntries.sort((a, b) => (b.accessCount + b.qualityScore) - (a.accessCount + a.qualityScore));

    // Calculer le taux de hit
    const totalAccesses = this.accessLog.length;
    const uniqueAccesses = new Set(this.accessLog.map(log => log.queryHash)).size;
    const hitRate = totalAccesses > 0 ? uniqueAccesses / totalAccesses : 0;

    return {
      totalEntries: this.cache.size,
      expiredEntries,
      totalSize,
      hitRate,
      topEntries: topEntries.slice(0, 10),
      providerDistribution
    };
  }

  /**
   * Exporte le cache pour sauvegarde
   */
  export(): string {
    const data = {
      entries: Array.from(this.cache.entries()),
      accessLog: this.accessLog,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data);
  }

  /**
   * Importe un cache depuis une sauvegarde
   */
  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.entries && Array.isArray(parsed.entries)) {
        this.cache.clear();
        for (const [key, entry] of parsed.entries) {
          this.cache.set(key, entry);
        }
      }
      
      if (parsed.accessLog && Array.isArray(parsed.accessLog)) {
        this.accessLog = parsed.accessLog;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import du cache:', error);
      return false;
    }
  }
}

// Instance globale du gestionnaire de cache
const cacheManager = new ResponseCacheManager();

/**
 * Interface publique du service de cache
 */
export const ResponseCache = {
  /**
   * Récupère une réponse du cache
   */
  get: (
    prompt: string,
    provider: 'gemini' | 'openai' | 'mistral',
    model: string,
    generationParams: any,
    context?: any
  ) => cacheManager.get(prompt, provider, model, generationParams, context),

  /**
   * Stocke une réponse en cache
   */
  set: (
    prompt: string,
    provider: 'gemini' | 'openai' | 'mistral',
    model: string,
    response: string,
    generationParams: any,
    metadata: CacheEntry['metadata'],
    context?: any,
    ttl?: number
  ) => cacheManager.set(prompt, provider, model, response, generationParams, metadata, context, ttl),

  /**
   * Invalide le cache selon un pattern
   */
  invalidate: (pattern: string) => cacheManager.invalidate(pattern),

  /**
   * Invalide le cache pour un fournisseur
   */
  invalidateByProvider: (provider: 'gemini' | 'openai' | 'mistral') => 
    cacheManager.invalidateByProvider(provider),

  /**
   * Vide le cache
   */
  clear: () => cacheManager.clear(),

  /**
   * Obtient les statistiques
   */
  getStats: () => cacheManager.getStats(),

  /**
   * Exporte le cache
   */
  export: () => cacheManager.export(),

  /**
   * Importe un cache
   */
  import: (data: string) => cacheManager.import(data)
};

/**
 * Hook pour la gestion automatique du cache avec persistance
 */
export function initializeCache(): void {
  // Charger le cache depuis localStorage au démarrage
  try {
    const savedCache = localStorage.getItem('neurochat_response_cache');
    if (savedCache) {
      cacheManager.import(savedCache);
    }
  } catch (error) {
    console.warn('Impossible de charger le cache depuis localStorage:', error);
  }

  // Sauvegarder le cache périodiquement
  setInterval(() => {
    try {
      const cacheData = cacheManager.export();
      localStorage.setItem('neurochat_response_cache', cacheData);
    } catch (error) {
      console.warn('Impossible de sauvegarder le cache:', error);
    }
  }, 5 * 60 * 1000); // Toutes les 5 minutes

  // Nettoyer le cache au démarrage
  // cacheManager.cleanupIfNeeded(); // Méthode privée
}
