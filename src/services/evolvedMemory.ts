/**
 * 🧠 Service de Mémoire Évolutive et Apprentissage
 * 
 * Fonctionnalités :
 * - Adaptation continue aux préférences utilisateur
 * - Apprentissage des patterns de conversation
 * - Mémoire contextuelle à long terme
 * - Personnalité évolutive qui s'adapte au temps
 */

import { MemoryItem, MemorySource } from './memory';

// Types pour la mémoire évolutive
interface UserPreference {
  id: string;
  category: 'communication' | 'content' | 'style' | 'interests' | 'schedule';
  key: string;
  value: any;
  confidence: number; // 0-1, confiance dans cette préférence
  evidenceCount: number; // Nombre d'observations
  lastObserved: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

interface ConversationPattern {
  id: string;
  pattern: string; // Regex ou pattern de texte
  context: string; // Contexte d'utilisation
  frequency: number; // Fréquence d'utilisation
  successRate: number; // Taux de succès (0-1)
  lastUsed: string;
  createdAt: string;
}

interface PersonalityTrait {
  id: string;
  trait: string; // Ex: 'formality', 'humor', 'detail_level'
  value: number; // -1 à 1 (ex: -1 = très informel, 1 = très formel)
  confidence: number;
  evidenceCount: number;
  lastObserved: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  createdAt: string;
}

interface ContextualMemory {
  id: string;
  context: string; // Contexte de la conversation
  memories: string[]; // IDs des souvenirs pertinents
  relevance: number; // Pertinence du contexte (0-1)
  lastAccessed: string;
  accessCount: number;
  createdAt: string;
}

interface LearningMetrics {
  totalInteractions: number;
  preferencesLearned: number;
  patternsIdentified: number;
  personalityEvolutions: number;
  adaptationSuccess: number;
  lastLearningUpdate: string;
}

class EvolvedMemoryService {
  private preferences: Map<string, UserPreference> = new Map();
  private patterns: Map<string, ConversationPattern> = new Map();
  private personality: Map<string, PersonalityTrait> = new Map();
  private contextualMemories: Map<string, ContextualMemory> = new Map();
  private learningMetrics: LearningMetrics = {
    totalInteractions: 0,
    preferencesLearned: 0,
    patternsIdentified: 0,
    personalityEvolutions: 0,
    adaptationSuccess: 0,
    lastLearningUpdate: new Date().toISOString()
  };

  private readonly STORAGE_KEYS = {
    preferences: 'nc_evolved_preferences',
    patterns: 'nc_evolved_patterns',
    personality: 'nc_evolved_personality',
    contextual: 'nc_evolved_contextual',
    metrics: 'nc_evolved_metrics'
  };

  constructor() {
    this.loadFromStorage();
    this.startPeriodicLearning();
  }

  // 🔄 ADAPTATION CONTINUE AUX PRÉFÉRENCES UTILISATEUR

  /**
   * Observe et apprend une préférence utilisateur
   */
  observePreference(
    category: UserPreference['category'],
    key: string,
    value: any,
    context?: string
  ): void {
    const preferenceId = `${category}:${key}`;
    const existing = this.preferences.get(preferenceId);
    
    if (existing) {
      // Mise à jour d'une préférence existante
      existing.value = this.updatePreferenceValue(existing.value, value);
      existing.confidence = Math.min(1, existing.confidence + 0.1);
      existing.evidenceCount++;
      existing.lastObserved = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();
    } else {
      // Nouvelle préférence
      const newPreference: UserPreference = {
        id: preferenceId,
        category,
        key,
        value,
        confidence: 0.3, // Confiance initiale faible
        evidenceCount: 1,
        lastObserved: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.preferences.set(preferenceId, newPreference);
      this.learningMetrics.preferencesLearned++;
    }

    this.saveToStorage();
  }

  /**
   * Récupère une préférence avec gestion de la confiance
   */
  getPreference(category: string, key: string): any | null {
    const preferenceId = `${category}:${key}`;
    const preference = this.preferences.get(preferenceId);
    
    if (preference && preference.confidence > 0.5) {
      return preference.value;
    }
    
    return null;
  }

  /**
   * Met à jour la valeur d'une préférence avec apprentissage
   */
  private updatePreferenceValue(currentValue: any, newValue: any): any {
    if (typeof currentValue === 'number' && typeof newValue === 'number') {
      // Moyenne pondérée avec plus de poids pour les nouvelles observations
      return (currentValue * 0.7) + (newValue * 0.3);
    }
    
    if (Array.isArray(currentValue) && Array.isArray(newValue)) {
      // Fusion des tableaux avec déduplication
      return [...new Set([...currentValue, ...newValue])];
    }
    
    // Pour les autres types, on garde la nouvelle valeur
    return newValue;
  }

  // 🧠 APPRENTISSAGE DES PATTERNS DE CONVERSATION

  /**
   * Identifie et apprend un pattern de conversation
   */
  learnConversationPattern(
    text: string,
    context: string,
    success: boolean
  ): void {
    const pattern = this.extractPattern(text);
    const patternId = this.generatePatternId(pattern, context);
    
    const existing = this.patterns.get(patternId);
    
    if (existing) {
      // Mise à jour du pattern existant
      existing.frequency++;
      existing.successRate = this.updateSuccessRate(existing.successRate, success);
      existing.lastUsed = new Date().toISOString();
    } else {
      // Nouveau pattern
      const newPattern: ConversationPattern = {
        id: patternId,
        pattern,
        context,
        frequency: 1,
        successRate: success ? 1 : 0,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.patterns.set(patternId, newPattern);
      this.learningMetrics.patternsIdentified++;
    }

    this.saveToStorage();
  }

  /**
   * Extrait un pattern simplifié du texte
   */
  private extractPattern(text: string): string {
    // Simplification du texte pour identifier les patterns
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Supprime la ponctuation
      .replace(/\s+/g, ' ') // Normalise les espaces
      .trim()
      .substring(0, 100); // Limite la longueur
  }

  /**
   * Génère un ID unique pour un pattern
   */
  private generatePatternId(pattern: string, context: string): string {
    const hash = this.simpleHash(pattern + context);
    return `pattern_${hash}`;
  }

  /**
   * Hash simple pour générer des IDs
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Conversion en 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Met à jour le taux de succès d'un pattern
   */
  private updateSuccessRate(currentRate: number, success: boolean): number {
    const alpha = 0.1; // Facteur d'apprentissage
    return (currentRate * (1 - alpha)) + (success ? alpha : 0);
  }

  // 🎭 PERSONNALITÉ ÉVOLUTIVE

  /**
   * Observe et fait évoluer un trait de personnalité
   */
  observePersonalityTrait(
    trait: string,
    observedValue: number,
    context?: string
  ): void {
    const existing = this.personality.get(trait);
    
    if (existing) {
      // Mise à jour du trait existant
      const oldValue = existing.value;
      existing.value = this.updatePersonalityValue(existing.value, observedValue);
      existing.confidence = Math.min(1, existing.confidence + 0.05);
      existing.evidenceCount++;
      existing.lastObserved = new Date().toISOString();
      
      // Détection de la tendance
      if (existing.value > oldValue + 0.1) {
        existing.trend = 'increasing';
      } else if (existing.value < oldValue - 0.1) {
        existing.trend = 'decreasing';
      } else {
        existing.trend = 'stable';
      }
      
      if (existing.trend !== 'stable') {
        this.learningMetrics.personalityEvolutions++;
      }
    } else {
      // Nouveau trait
      const newTrait: PersonalityTrait = {
        id: trait,
        trait,
        value: observedValue,
        confidence: 0.2,
        evidenceCount: 1,
        lastObserved: new Date().toISOString(),
        trend: 'stable',
        createdAt: new Date().toISOString()
      };
      this.personality.set(trait, newTrait);
    }

    this.saveToStorage();
  }

  /**
   * Met à jour la valeur d'un trait de personnalité
   */
  private updatePersonalityValue(currentValue: number, newValue: number): number {
    const alpha = 0.1; // Facteur d'apprentissage plus conservateur
    return (currentValue * (1 - alpha)) + (newValue * alpha);
  }

  /**
   * Récupère le profil de personnalité actuel
   */
  getPersonalityProfile(): Record<string, PersonalityTrait> {
    const profile: Record<string, PersonalityTrait> = {};
    this.personality.forEach((trait, key) => {
      if (trait.confidence > 0.3) { // Seuil de confiance
        profile[key] = trait;
      }
    });
    return profile;
  }

  // 🧩 MÉMOIRE CONTEXTUELLE À LONG TERME

  /**
   * Crée ou met à jour une mémoire contextuelle
   */
  updateContextualMemory(
    context: string,
    memoryIds: string[],
    relevance: number
  ): void {
    const contextId = this.generateContextId(context);
    const existing = this.contextualMemories.get(contextId);
    
    if (existing) {
      // Mise à jour de la mémoire existante
      existing.memories = [...new Set([...existing.memories, ...memoryIds])];
      existing.relevance = Math.max(existing.relevance, relevance);
      existing.lastAccessed = new Date().toISOString();
      existing.accessCount++;
    } else {
      // Nouvelle mémoire contextuelle
      const newContextualMemory: ContextualMemory = {
        id: contextId,
        context,
        memories: memoryIds,
        relevance,
        lastAccessed: new Date().toISOString(),
        accessCount: 1,
        createdAt: new Date().toISOString()
      };
      this.contextualMemories.set(contextId, newContextualMemory);
    }

    this.saveToStorage();
  }

  /**
   * Récupère les souvenirs pertinents pour un contexte
   */
  getContextualMemories(context: string, limit: number = 5): string[] {
    const contextId = this.generateContextId(context);
    const contextualMemory = this.contextualMemories.get(contextId);
    
    if (contextualMemory) {
      // Mise à jour des statistiques d'accès
      contextualMemory.lastAccessed = new Date().toISOString();
      contextualMemory.accessCount++;
      this.saveToStorage();
      
      return contextualMemory.memories.slice(0, limit);
    }
    
    return [];
  }

  /**
   * Génère un ID unique pour un contexte
   */
  private generateContextId(context: string): string {
    const hash = this.simpleHash(context);
    return `context_${hash}`;
  }

  // 📊 MÉTRIQUES ET ANALYTICS

  /**
   * Récupère les métriques d'apprentissage
   */
  getLearningMetrics(): LearningMetrics {
    return { ...this.learningMetrics };
  }

  /**
   * Met à jour les métriques d'apprentissage
   */
  private updateLearningMetrics(interaction: boolean = false): void {
    if (interaction) {
      this.learningMetrics.totalInteractions++;
    }
    this.learningMetrics.lastLearningUpdate = new Date().toISOString();
  }

  // 🔄 APPRENTISSAGE PÉRIODIQUE

  /**
   * Démarre l'apprentissage périodique
   */
  private startPeriodicLearning(): void {
    // Apprentissage toutes les 5 minutes
    setInterval(() => {
      this.periodicLearning();
    }, 5 * 60 * 1000);
  }

  /**
   * Apprentissage périodique automatique
   */
  private periodicLearning(): void {
    // Nettoyage des données anciennes
    this.cleanupOldData();
    
    // Optimisation des patterns
    this.optimizePatterns();
    
    // Consolidation des préférences
    this.consolidatePreferences();
    
    this.saveToStorage();
  }

  /**
   * Nettoie les données anciennes
   */
  private cleanupOldData(): void {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Nettoyage des patterns peu utilisés
    this.patterns.forEach((pattern, key) => {
      if (pattern.frequency < 3 && new Date(pattern.lastUsed) < thirtyDaysAgo) {
        this.patterns.delete(key);
      }
    });
    
    // Nettoyage des préférences peu confiantes
    this.preferences.forEach((pref, key) => {
      if (pref.confidence < 0.2 && pref.evidenceCount < 2) {
        this.preferences.delete(key);
      }
    });
  }

  /**
   * Optimise les patterns de conversation
   */
  private optimizePatterns(): void {
    // Regroupement des patterns similaires
    const patternGroups = new Map<string, ConversationPattern[]>();
    
    this.patterns.forEach((pattern) => {
      const groupKey = pattern.context;
      if (!patternGroups.has(groupKey)) {
        patternGroups.set(groupKey, []);
      }
      patternGroups.get(groupKey)!.push(pattern);
    });
    
    // Fusion des patterns très similaires
    patternGroups.forEach((patterns) => {
      if (patterns.length > 1) {
        this.mergeSimilarPatterns(patterns);
      }
    });
  }

  /**
   * Fusionne des patterns similaires
   */
  private mergeSimilarPatterns(patterns: ConversationPattern[]): void {
    // Logique de fusion basée sur la similarité
    // Pour simplifier, on garde le pattern le plus fréquent
    const bestPattern = patterns.reduce((best, current) => 
      current.frequency > best.frequency ? current : best
    );
    
    // Suppression des autres patterns
    patterns.forEach((pattern) => {
      if (pattern.id !== bestPattern.id) {
        this.patterns.delete(pattern.id);
      }
    });
  }

  /**
   * Consolide les préférences utilisateur
   */
  private consolidatePreferences(): void {
    // Regroupement par catégorie
    const categoryGroups = new Map<string, UserPreference[]>();
    
    this.preferences.forEach((pref) => {
      if (!categoryGroups.has(pref.category)) {
        categoryGroups.set(pref.category, []);
      }
      categoryGroups.get(pref.category)!.push(pref);
    });
    
    // Détection des conflits et résolution
    categoryGroups.forEach((prefs) => {
      this.resolvePreferenceConflicts(prefs);
    });
  }

  /**
   * Résout les conflits entre préférences
   */
  private resolvePreferenceConflicts(prefs: UserPreference[]): void {
    // Détection des préférences contradictoires
    const conflicts = new Map<string, UserPreference[]>();
    
    prefs.forEach((pref) => {
      const conflictKey = pref.key;
      if (!conflicts.has(conflictKey)) {
        conflicts.set(conflictKey, []);
      }
      conflicts.get(conflictKey)!.push(pref);
    });
    
    // Résolution : on garde la plus confiante
    conflicts.forEach((conflictingPrefs) => {
      if (conflictingPrefs.length > 1) {
        const bestPref = conflictingPrefs.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        // Suppression des autres
        conflictingPrefs.forEach((pref) => {
          if (pref.id !== bestPref.id) {
            this.preferences.delete(pref.id);
          }
        });
      }
    });
  }

  // 💾 PERSISTANCE ET STOCKAGE

  /**
   * Sauvegarde en localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.preferences, JSON.stringify(Array.from(this.preferences.entries())));
      localStorage.setItem(this.STORAGE_KEYS.patterns, JSON.stringify(Array.from(this.patterns.entries())));
      localStorage.setItem(this.STORAGE_KEYS.personality, JSON.stringify(Array.from(this.personality.entries())));
      localStorage.setItem(this.STORAGE_KEYS.contextual, JSON.stringify(Array.from(this.contextualMemories.entries())));
      localStorage.setItem(this.STORAGE_KEYS.metrics, JSON.stringify(this.learningMetrics));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la mémoire évolutive:', error);
    }
  }

  /**
   * Chargement depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      // Chargement des préférences
      const prefsData = localStorage.getItem(this.STORAGE_KEYS.preferences);
      if (prefsData) {
        const prefsArray = JSON.parse(prefsData);
        this.preferences = new Map(prefsArray);
      }

      // Chargement des patterns
      const patternsData = localStorage.getItem(this.STORAGE_KEYS.patterns);
      if (patternsData) {
        const patternsArray = JSON.parse(patternsData);
        this.patterns = new Map(patternsArray);
      }

      // Chargement de la personnalité
      const personalityData = localStorage.getItem(this.STORAGE_KEYS.personality);
      if (personalityData) {
        const personalityArray = JSON.parse(personalityData);
        this.personality = new Map(personalityArray);
      }

      // Chargement des mémoires contextuelles
      const contextualData = localStorage.getItem(this.STORAGE_KEYS.contextual);
      if (contextualData) {
        const contextualArray = JSON.parse(contextualData);
        this.contextualMemories = new Map(contextualArray);
      }

      // Chargement des métriques
      const metricsData = localStorage.getItem(this.STORAGE_KEYS.metrics);
      if (metricsData) {
        this.learningMetrics = JSON.parse(metricsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la mémoire évolutive:', error);
    }
  }

  // 🧹 NETTOYAGE ET MAINTENANCE

  /**
   * Nettoie complètement la mémoire évolutive
   */
  clearAll(): void {
    this.preferences.clear();
    this.patterns.clear();
    this.personality.clear();
    this.contextualMemories.clear();
    this.learningMetrics = {
      totalInteractions: 0,
      preferencesLearned: 0,
      patternsIdentified: 0,
      personalityEvolutions: 0,
      adaptationSuccess: 0,
      lastLearningUpdate: new Date().toISOString()
    };
    
    // Nettoyage du localStorage
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Export des données d'apprentissage
   */
  exportData(): string {
    return JSON.stringify({
      preferences: Array.from(this.preferences.entries()),
      patterns: Array.from(this.patterns.entries()),
      personality: Array.from(this.personality.entries()),
      contextual: Array.from(this.contextualMemories.entries()),
      metrics: this.learningMetrics
    }, null, 2);
  }

  /**
   * Import des données d'apprentissage
   */
  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.preferences) {
        this.preferences = new Map(parsed.preferences);
      }
      if (parsed.patterns) {
        this.patterns = new Map(parsed.patterns);
      }
      if (parsed.personality) {
        this.personality = new Map(parsed.personality);
      }
      if (parsed.contextual) {
        this.contextualMemories = new Map(parsed.contextual);
      }
      if (parsed.metrics) {
        this.learningMetrics = parsed.metrics;
      }
      
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      return false;
    }
  }
}

// Instance singleton
const evolvedMemoryService = new EvolvedMemoryService();

// Export des fonctions principales
export const evolvedMemory = {
  // Préférences
  observePreference: (category: UserPreference['category'], key: string, value: any, context?: string) =>
    evolvedMemoryService.observePreference(category, key, value, context),
  
  getPreference: (category: string, key: string) =>
    evolvedMemoryService.getPreference(category, key),
  
  // Patterns
  learnConversationPattern: (text: string, context: string, success: boolean) =>
    evolvedMemoryService.learnConversationPattern(text, context, success),
  
  // Personnalité
  observePersonalityTrait: (trait: string, value: number, context?: string) =>
    evolvedMemoryService.observePersonalityTrait(trait, value, context),
  
  getPersonalityProfile: () =>
    evolvedMemoryService.getPersonalityProfile(),
  
  // Mémoire contextuelle
  updateContextualMemory: (context: string, memoryIds: string[], relevance: number) =>
    evolvedMemoryService.updateContextualMemory(context, memoryIds, relevance),
  
  getContextualMemories: (context: string, limit?: number) =>
    evolvedMemoryService.getContextualMemories(context, limit),
  
  // Métriques
  getLearningMetrics: () =>
    evolvedMemoryService.getLearningMetrics(),
  
  // Maintenance
  clearAll: () =>
    evolvedMemoryService.clearAll(),
  
  exportData: () =>
    evolvedMemoryService.exportData(),
  
  importData: (data: string) =>
    evolvedMemoryService.importData(data)
};

// Export des types
export type {
  UserPreference,
  ConversationPattern,
  PersonalityTrait,
  ContextualMemory,
  LearningMetrics
};
