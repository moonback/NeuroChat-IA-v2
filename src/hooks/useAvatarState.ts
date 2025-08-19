import { useState, useEffect, useCallback } from 'react';
import { Avatar3DProps } from '@/components/Avatar3D';
import { EmotionType } from '@/services/sentimentAnalyzer';

export interface AvatarState {
  config: Avatar3DProps;
  currentEmotion: EmotionType;
  emotionHistory: EmotionType[];
  isCustomizing: boolean;
  lastActivity: Date;
}

export interface UseAvatarStateOptions {
  /** Configuration initiale de l'avatar */
  initialConfig?: Partial<Avatar3DProps>;
  /** Sauvegarder la configuration dans le localStorage */
  persistConfig?: boolean;
  /** Clé de stockage pour la configuration */
  storageKey?: string;
  /** Callback lors de la modification de la configuration */
  onConfigChange?: (config: Avatar3DProps) => void;
}

const DEFAULT_AVATAR_CONFIG: Avatar3DProps = {
  emotion: 'neutral',
  style: 'modern',
  clothing: 'casual',
  size: 'lg',
  animated: true,
  accessories: [],
};

export function useAvatarState(options: UseAvatarStateOptions = {}) {
  const {
    initialConfig = {},
    persistConfig = true,
    storageKey = 'neurochat-avatar-config',
    onConfigChange
  } = options;

  // État local
  const [avatarState, setAvatarState] = useState<AvatarState>(() => {
    // Charger la configuration depuis le localStorage si activé
    if (persistConfig) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            config: { ...DEFAULT_AVATAR_CONFIG, ...parsed },
            currentEmotion: 'neutral',
            emotionHistory: [],
            isCustomizing: false,
            lastActivity: new Date()
          };
        }
      } catch (error) {
        console.warn('Erreur lors du chargement de la configuration avatar:', error);
      }
    }

    return {
      config: { ...DEFAULT_AVATAR_CONFIG, ...initialConfig },
      currentEmotion: 'neutral',
      emotionHistory: [],
      isCustomizing: false,
      lastActivity: new Date()
    };
  });

  // Sauvegarder la configuration
  const saveConfig = useCallback((config: Avatar3DProps) => {
    if (persistConfig) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(config));
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde de la configuration avatar:', error);
      }
    }
  }, [persistConfig, storageKey]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((updates: Partial<Avatar3DProps>) => {
    setAvatarState(prev => {
      const newConfig = { ...prev.config, ...updates };
      const newState = { ...prev, config: newConfig, lastActivity: new Date() };
      
      // Sauvegarder automatiquement
      saveConfig(newConfig);
      
      // Appeler le callback
      onConfigChange?.(newConfig);
      
      return newState;
    });
  }, [saveConfig, onConfigChange]);

  // Mettre à jour l'émotion
  const updateEmotion = useCallback((emotion: EmotionType) => {
    setAvatarState(prev => {
      const newHistory = [...prev.emotionHistory.slice(-4), emotion];
      return {
        ...prev,
        currentEmotion: emotion,
        emotionHistory: newHistory,
        lastActivity: new Date()
      };
    });
  }, []);

  // Ouvrir/fermer la personnalisation
  const setCustomizing = useCallback((isCustomizing: boolean) => {
    setAvatarState(prev => ({
      ...prev,
      isCustomizing,
      lastActivity: new Date()
    }));
  }, []);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    const defaultConfig = { ...DEFAULT_AVATAR_CONFIG, ...initialConfig };
    updateConfig(defaultConfig);
  }, [updateConfig, initialConfig]);

  // Exporter la configuration
  const exportConfig = useCallback(() => {
    return JSON.stringify(avatarState.config, null, 2);
  }, [avatarState.config]);

  // Importer la configuration
  const importConfig = useCallback((configJson: string) => {
    try {
      const parsed = JSON.parse(configJson);
      if (parsed && typeof parsed === 'object') {
        updateConfig(parsed);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'import de la configuration:', error);
    }
    return false;
  }, [updateConfig]);

  // Nettoyer l'historique des émotions
  const clearEmotionHistory = useCallback(() => {
    setAvatarState(prev => ({
      ...prev,
      emotionHistory: [],
      lastActivity: new Date()
    }));
  }, []);

  // Obtenir les statistiques d'utilisation
  const getStats = useCallback(() => {
    const emotionCounts = avatarState.emotionHistory.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<EmotionType, number>);

    return {
      totalEmotions: avatarState.emotionHistory.length,
      emotionCounts,
      mostUsedEmotion: Object.entries(emotionCounts).reduce((a, b) => 
        (emotionCounts[a[0] as EmotionType] || 0) > (emotionCounts[b[0] as EmotionType] || 0) ? a : b
      )?.[0] as EmotionType || 'neutral',
      lastActivity: avatarState.lastActivity,
      configVersion: avatarState.config.style + '-' + avatarState.config.clothing
    };
  }, [avatarState]);

  // Auto-sauvegarde périodique
  useEffect(() => {
    if (!persistConfig) return;

    const interval = setInterval(() => {
      saveConfig(avatarState.config);
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [persistConfig, saveConfig, avatarState.config]);

  // Sauvegarder lors de la fermeture de la page
  useEffect(() => {
    if (!persistConfig) return;

    const handleBeforeUnload = () => {
      saveConfig(avatarState.config);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [persistConfig, saveConfig, avatarState.config]);

  return {
    // État
    avatarState,
    
    // Actions
    updateConfig,
    updateEmotion,
    setCustomizing,
    resetConfig,
    exportConfig,
    importConfig,
    clearEmotionHistory,
    
    // Utilitaires
    getStats,
    
    // Getters
    config: avatarState.config,
    currentEmotion: avatarState.currentEmotion,
    emotionHistory: avatarState.emotionHistory,
    isCustomizing: avatarState.isCustomizing
  };
}
