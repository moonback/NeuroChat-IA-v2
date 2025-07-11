import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DeepResearchConfig, 
  DeepResearchResult, 
  DeepResearchSession 
} from '../types/deepResearch';
import { 
  deepResearchService, 
  DEFAULT_DEEP_RESEARCH_CONFIG,
  isDeepResearchQuery 
} from '../services/deepResearch';

export function useDeepResearch() {
  const [config, setConfig] = useState<DeepResearchConfig>(DEFAULT_DEEP_RESEARCH_CONFIG);
  const [currentSession, setCurrentSession] = useState<DeepResearchSession | null>(null);
  const [sessions, setSessions] = useState<DeepResearchSession[]>([]);
  const [activeResearches, setActiveResearches] = useState<DeepResearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs pour éviter les re-renders inutiles
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(true);

  // Charger la configuration depuis le localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('deepResearchConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_DEEP_RESEARCH_CONFIG, ...parsed });
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }

    // Charger les sessions sauvegardées
    const savedSessions = localStorage.getItem('deepResearchSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      }
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  // Sauvegarder la configuration
  useEffect(() => {
    localStorage.setItem('deepResearchConfig', JSON.stringify(config));
    deepResearchService.updateConfig(config);
  }, [config]);

  // Polling pour les recherches actives
  useEffect(() => {
    if (activeResearches.length > 0) {
      pollIntervalRef.current = setInterval(() => {
        if (!mounted.current) return;
        
        const updatedResearches = deepResearchService.getActiveResearches();
        setActiveResearches(updatedResearches);
        
        // Vérifier si toutes les recherches sont terminées
        const allCompleted = updatedResearches.every(
          research => research.status === 'completed' || research.status === 'error'
        );
        
        if (allCompleted) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsLoading(false);
        }
      }, 1000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeResearches.length]);

  // Démarrer une nouvelle recherche
  const startResearch = useCallback(async (
    query: string, 
    customConfig?: Partial<DeepResearchConfig>
  ): Promise<DeepResearchResult> => {
    setError(null);
    setIsLoading(true);

    try {
      const researchConfig = { ...config, ...customConfig };
      const result = await deepResearchService.startResearch(query, researchConfig);
      
      setActiveResearches(prev => [...prev, result]);
      
      // Créer une nouvelle session si nécessaire
      if (!currentSession) {
        const newSession: DeepResearchSession = {
          id: `session_${Date.now()}`,
          title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
          results: [result],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentSession(newSession);
      } else {
        // Ajouter à la session existante
        const updatedSession = {
          ...currentSession,
          results: [...currentSession.results, result],
          updatedAt: new Date()
        };
        setCurrentSession(updatedSession);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      setIsLoading(false);
      throw error;
    }
  }, [config, currentSession]);

  // Arrêter une recherche
  const stopResearch = useCallback((resultId: string) => {
    deepResearchService.stopResearch(resultId);
    setActiveResearches(prev => 
      prev.map(research => 
        research.id === resultId 
          ? { ...research, status: 'error' as const, progress: 0 }
          : research
      )
    );
    setIsLoading(false);
  }, []);

  // Arrêter toutes les recherches actives
  const stopAllResearches = useCallback(() => {
    activeResearches.forEach(research => {
      if (research.status !== 'completed' && research.status !== 'error') {
        deepResearchService.stopResearch(research.id);
      }
    });
    setActiveResearches([]);
    setIsLoading(false);
  }, [activeResearches]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<DeepResearchConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Sauvegarder la session courante
  const saveCurrentSession = useCallback(() => {
    if (!currentSession) return;

    const updatedSessions = sessions.filter(s => s.id !== currentSession.id);
    updatedSessions.push(currentSession);
    
    setSessions(updatedSessions);
    localStorage.setItem('deepResearchSessions', JSON.stringify(updatedSessions));
  }, [currentSession, sessions]);

  // Charger une session
  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      return session;
    }
    return null;
  }, [sessions]);

  // Supprimer une session
  const deleteSession = useCallback((sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('deepResearchSessions', JSON.stringify(updatedSessions));
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [sessions, currentSession]);

  // Créer une nouvelle session
  const createNewSession = useCallback(() => {
    // Sauvegarder la session actuelle si elle existe
    if (currentSession) {
      saveCurrentSession();
    }
    
    setCurrentSession(null);
    setActiveResearches([]);
    setError(null);
    setIsLoading(false);
  }, [currentSession, saveCurrentSession]);

  // Obtenir les statistiques
  const getStats = useCallback(() => {
    const totalResearches = sessions.reduce((acc, session) => acc + session.results.length, 0);
    const completedResearches = sessions.reduce((acc, session) => 
      acc + session.results.filter(r => r.status === 'completed').length, 0
    );
    const avgConfidence = sessions.reduce((acc, session) => {
      const sessionAvg = session.results.reduce((sum, r) => sum + r.confidenceScore, 0) / session.results.length;
      return acc + sessionAvg;
    }, 0) / sessions.length;

    return {
      totalResearches,
      completedResearches,
      avgConfidence: isNaN(avgConfidence) ? 0 : avgConfidence,
      totalSessions: sessions.length,
      activeResearches: activeResearches.length
    };
  }, [sessions, activeResearches]);

  // Exporter les données
  const exportData = useCallback(() => {
    const data = {
      config,
      sessions,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deep-research-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config, sessions]);

  // Importer des données
  const importData = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.config) {
        setConfig({ ...DEFAULT_DEEP_RESEARCH_CONFIG, ...data.config });
      }
      
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
        localStorage.setItem('deepResearchSessions', JSON.stringify(data.sessions));
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setError('Erreur lors de l\'import des données');
      return false;
    }
  }, []);

  // Réinitialiser toutes les données
  const resetData = useCallback(() => {
    setConfig(DEFAULT_DEEP_RESEARCH_CONFIG);
    setSessions([]);
    setCurrentSession(null);
    setActiveResearches([]);
    setError(null);
    setIsLoading(false);
    
    localStorage.removeItem('deepResearchConfig');
    localStorage.removeItem('deepResearchSessions');
  }, []);

  // Fonctions utilitaires
  const isDeepResearchEnabled = config.enabled;
  const hasActiveResearches = activeResearches.length > 0;
  const canStartNewResearch = !isLoading && activeResearches.length < 3; // Max 3 recherches simultanées

  return {
    // État
    config,
    currentSession,
    sessions,
    activeResearches,
    isLoading,
    error,
    
    // Actions principales
    startResearch,
    stopResearch,
    stopAllResearches,
    updateConfig,
    
    // Gestion des sessions
    saveCurrentSession,
    loadSession,
    deleteSession,
    createNewSession,
    
    // Utilitaires
    getStats,
    exportData,
    importData,
    resetData,
    
    // États dérivés
    isDeepResearchEnabled,
    hasActiveResearches,
    canStartNewResearch,
    
    // Fonctions utilitaires
    isDeepResearchQuery,
  };
}

// Hook pour détecter automatiquement si une question nécessite le Deep Research
export function useDeepResearchAutoDetection(query: string, enabled: boolean = true) {
  const [shouldSuggest, setShouldSuggest] = useState(false);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (!enabled || !query || query.length < 10) {
      setShouldSuggest(false);
      setConfidence(0);
      return;
    }

    const detectAsync = async () => {
      // Mots-clés qui suggèrent une recherche approfondie
      const keywords = [
        'analyser', 'étudier', 'explorer', 'comparer', 'évaluer',
        'recherche', 'investigation', 'analyse', 'synthèse',
        'perspectives', 'avantages', 'inconvénients', 'stratégie',
        'tendances', 'opportunités', 'risques', 'recommandations',
        'différences', 'similitudes', 'impact', 'conséquences'
      ];

      const queryLower = query.toLowerCase();
      const keywordMatches = keywords.filter(keyword => queryLower.includes(keyword)).length;
      
      // Critères de détection
      const hasKeywords = keywordMatches > 0;
      const isLongQuery = query.length > 50;
      const hasQuestionWords = /\b(comment|pourquoi|quand|où|qui|quoi|quel|quelle|combien)\b/i.test(query);
      const hasComplexStructure = query.split(/[.!?;]/).length > 1;
      const hasMultipleTopics = query.split(/\bet\b|\bou\b/i).length > 1;

      // Calcul du score de confiance
      let score = 0;
      if (hasKeywords) score += keywordMatches * 0.2;
      if (isLongQuery) score += 0.3;
      if (hasQuestionWords) score += 0.2;
      if (hasComplexStructure) score += 0.15;
      if (hasMultipleTopics) score += 0.15;

      const normalizedScore = Math.min(score, 1);
      setConfidence(normalizedScore);
      setShouldSuggest(normalizedScore > 0.4);
    };

    detectAsync();
  }, [query, enabled]);

  return {
    shouldSuggest,
    confidence,
    reasons: confidence > 0.4 ? getDetectionReasons(query) : []
  };
}

// Fonction pour obtenir les raisons de la détection
function getDetectionReasons(query: string): string[] {
  const reasons = [];
  const queryLower = query.toLowerCase();

  if (query.length > 50) {
    reasons.push('Question longue et complexe');
  }

  if (/\b(comment|pourquoi|quand|où|qui|quoi|quel|quelle)\b/i.test(query)) {
    reasons.push('Contient des mots interrogatifs');
  }

  if (/\b(analyser|étudier|explorer|comparer|évaluer)\b/i.test(query)) {
    reasons.push('Nécessite une analyse approfondie');
  }

  if (/\b(avantages|inconvénients|perspectives|différences)\b/i.test(query)) {
    reasons.push('Demande une comparaison multi-perspectives');
  }

  if (query.split(/\bet\b|\bou\b/i).length > 1) {
    reasons.push('Traite de plusieurs sujets');
  }

  return reasons;
} 