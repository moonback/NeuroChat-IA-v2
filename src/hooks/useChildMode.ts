import { useState, useEffect, useCallback } from 'react';
import { filterChildContent, validateAIResponse } from '../services/childContentFilter';
import { 
  generateChildSystemPrompt, 
  generateConversationStarters,
  generateEncouragement,
  getChildLanguageLevel 
} from '../services/childContentService';

export interface ChildModeConfig {
  ageRange: '3-6' | '7-10' | '11-14';
  securityLevel: 'basic' | 'enhanced' | 'strict';
  enableRewards: boolean;
  enableActivities: boolean;
  enableFiltering: boolean;
  enableLanguageModeration: boolean;
}

export interface ChildModeStats {
  totalPoints: number;
  totalRewards: number;
  currentStreak: number;
  bestStreak: number;
  completedActivities: string[];
  filteredContentCount: number;
  warningsCount: number;
  lastActivityDate: string;
}

export interface ChildReward {
  id: string;
  type: string;
  message: string;
  points: number;
  timestamp: number;
}

const DEFAULT_CONFIG: ChildModeConfig = {
  ageRange: '7-10',
  securityLevel: 'enhanced',
  enableRewards: true,
  enableActivities: true,
  enableFiltering: true,
  enableLanguageModeration: true
};

const STORAGE_KEYS = {
  config: 'nc_child_mode_config',
  stats: 'nc_child_mode_stats',
  rewards: 'nc_child_mode_rewards',
  streak: 'nc_child_mode_streak'
};

export function useChildMode() {
  // Configuration du mode enfant
  const [config, setConfig] = useState<ChildModeConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.config);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Statistiques et progression
  const [stats, setStats] = useState<ChildModeStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.stats);
      return stored ? JSON.parse(stored) : {
        totalPoints: 0,
        totalRewards: 0,
        currentStreak: 0,
        bestStreak: 0,
        completedActivities: [],
        filteredContentCount: 0,
        warningsCount: 0,
        lastActivityDate: new Date().toISOString()
      };
    } catch {
      return {
        totalPoints: 0,
        totalRewards: 0,
        currentStreak: 0,
        bestStreak: 0,
        completedActivities: [],
        filteredContentCount: 0,
        warningsCount: 0,
        lastActivityDate: new Date().toISOString()
      };
    }
  });

  // Historique des récompenses
  const [rewards, setRewards] = useState<ChildReward[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.rewards);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder la configuration
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
    }
  }, [config]);

  // Sauvegarder les statistiques
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
    }
  }, [stats]);

  // Sauvegarder les récompenses
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rewards, JSON.stringify(rewards));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des récompenses:', error);
    }
  }, [rewards]);

  // Mettre à jour la série quotidienne
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActivity = new Date(stats.lastActivityDate).toDateString();
    
    if (today !== lastActivity) {
      // Vérifier si c'est le jour suivant
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (yesterday.toDateString() === lastActivity) {
        // Continuer la série
        setStats(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.currentStreak + 1, prev.bestStreak),
          lastActivityDate: new Date().toISOString()
        }));
      } else if (today !== lastActivity) {
        // Briser la série
        setStats(prev => ({
          ...prev,
          currentStreak: 0,
          lastActivityDate: new Date().toISOString()
        }));
      }
    }
  }, [stats.lastActivityDate]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((updates: Partial<ChildModeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Filtrer le contenu utilisateur
  const filterUserContent = useCallback((content: string): {
    isSafe: boolean;
    filteredContent: string;
    warnings: string[];
    suggestions: string[];
  } => {
    if (!config.enableFiltering) {
      return {
        isSafe: true,
        filteredContent: content,
        warnings: [],
        suggestions: []
      };
    }

    const filterResult = filterChildContent(content);
    
    // Mettre à jour les statistiques
    if (filterResult.warnings.length > 0) {
      setStats(prev => ({
        ...prev,
        warningsCount: prev.warningsCount + filterResult.warnings.length
      }));
    }

    return {
      isSafe: filterResult.isSafe,
      filteredContent: filterResult.filteredContent,
      warnings: filterResult.warnings,
      suggestions: filterResult.suggestions
    };
  }, [config.enableFiltering]);

  // Valider une réponse IA
  const validateAIResponse = useCallback((response: string): {
    isSafe: boolean;
    filteredResponse: string;
    warnings: string[];
    suggestions: string[];
  } => {
    if (!config.enableFiltering) {
      return {
        isSafe: true,
        filteredResponse: response,
        warnings: [],
        suggestions: []
      };
    }

    const validationResult = validateAIResponse(response);
    
    // Mettre à jour les statistiques
    if (validationResult.warnings.length > 0) {
      setStats(prev => ({
        ...prev,
        warningsCount: prev.warningsCount + validationResult.warnings.length
      }));
    }

    return {
      isSafe: validationResult.isSafe,
      filteredResponse: validationResult.filteredContent,
      warnings: validationResult.warnings,
      suggestions: validationResult.suggestions
    };
  }, [config.enableFiltering]);

  // Ajouter des points et récompenses
  const addReward = useCallback((type: string, message: string, points: number) => {
    if (!config.enableRewards) return;

    const newReward: ChildReward = {
      id: `reward-${Date.now()}-${Math.random()}`,
      type,
      message,
      points,
      timestamp: Date.now()
    };

    setRewards(prev => [...prev, newReward]);
    
    setStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      totalRewards: prev.totalRewards + 1,
      lastActivityDate: new Date().toISOString()
    }));
  }, [config.enableRewards]);

  // Marquer une activité comme terminée
  const completeActivity = useCallback((activityId: string) => {
    if (!config.enableActivities) return;

    setStats(prev => ({
      ...prev,
      completedActivities: [...new Set([...prev.completedActivities, activityId])]
    }));

    // Donner des points pour l'activité terminée
    addReward('activity', 'Activité terminée !', 10);
  }, [config.enableActivities, addReward]);

  // Générer un prompt système adapté
  const getSystemPrompt = useCallback((): string => {
    if (!config.enableLanguageModeration) {
      return 'MODE ENFANT ACTIF : Utilise un ton adapté aux enfants.';
    }

    return generateChildSystemPrompt(config.ageRange);
  }, [config.ageRange, config.enableLanguageModeration]);

  // Générer des suggestions de conversation
  const getConversationStarters = useCallback((mood?: string): string[] => {
    return generateConversationStarters(config.ageRange, mood);
  }, [config.ageRange]);

  // Générer des encouragements
  const getEncouragement = useCallback((achievement: string): string => {
    return generateEncouragement(achievement, config.ageRange);
  }, [config.ageRange]);

  // Obtenir le niveau de langage adapté
  const getLanguageLevel = useCallback(() => {
    return getChildLanguageLevel(config.ageRange);
  }, [config.ageRange]);

  // Réinitialiser les statistiques
  const resetStats = useCallback(() => {
    setStats({
      totalPoints: 0,
      totalRewards: 0,
      currentStreak: 0,
      bestStreak: 0,
      completedActivities: [],
      filteredContentCount: 0,
      warningsCount: 0,
      lastActivityDate: new Date().toISOString()
    });
    setRewards([]);
  }, []);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  // Obtenir des statistiques de sécurité
  const getSecurityStats = useCallback(() => {
    return {
      ageRange: config.ageRange,
      securityLevel: config.securityLevel,
      filteringEnabled: config.enableFiltering,
      languageModerationEnabled: config.enableLanguageModeration,
      totalWarnings: stats.warningsCount,
      lastActivity: stats.lastActivityDate
    };
  }, [config, stats]);

  // Vérifier si le mode enfant est actif
  const isActive = useCallback(() => {
    return config.enableFiltering || config.enableActivities || config.enableRewards;
  }, [config]);

  return {
    // Configuration
    config,
    updateConfig,
    
    // Statistiques
    stats,
    rewards,
    
    // Fonctionnalités
    filterUserContent,
    validateAIResponse,
    addReward,
    completeActivity,
    
    // Prompts et contenu
    getSystemPrompt,
    getConversationStarters,
    getEncouragement,
    getLanguageLevel,
    
    // Utilitaires
    resetStats,
    resetConfig,
    getSecurityStats,
    isActive
  };
}

export default useChildMode;
