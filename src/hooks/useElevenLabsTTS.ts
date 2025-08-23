/**
 * 🎙️ Hook ElevenLabs TTS - Synthèse vocale de qualité professionnelle
 * 
 * Remplace le TTS natif du navigateur par ElevenLabs pour une qualité exceptionnelle
 * - Gestion des voix et modèles ElevenLabs
 * - Paramètres avancés de qualité vocale
 * - Cache et optimisation des performances
 * - Fallback vers TTS natif si nécessaire
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ElevenLabsVoice,
  ElevenLabsModel,
  ElevenLabsGenerationOptions,
  getVoices,
  getModels,
  generateSpeech,
  testVoice,
  validateApiKey,
  getUsageStats,
  filterVoicesByLanguage,
  getOptimalSettingsForLanguage,
  clearCache,
} from '@/services/elevenLabsApi';

export interface ElevenLabsTTSSettings {
  voice_id: string;
  model_id: string;
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  output_format: string;
}

export interface ElevenLabsTTSOptions {
  voice_id?: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

const LS_KEY = 'elevenlabs_tts_settings';
const DEFAULTS: ElevenLabsTTSSettings = {
  voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel par défaut
  model_id: 'eleven_multilingual_v2',
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
  output_format: 'mp3_44100_128',
};

export function useElevenLabsTTS() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [models, setModels] = useState<ElevenLabsModel[]>([]);
  const [settings, setSettings] = useState<ElevenLabsTTSSettings>(DEFAULTS);
  const [currentVoice, setCurrentVoice] = useState<ElevenLabsVoice | null>(null);
  const [currentModel, setCurrentModel] = useState<ElevenLabsModel | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [fallbackToNative, setFallbackToNative] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Charger les réglages depuis le localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erreur lors du chargement des réglages ElevenLabs:', error);
      }
    }
  }, []);

  // Sauvegarder les réglages à chaque changement
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Initialiser ElevenLabs au démarrage
  useEffect(() => {
    initializeElevenLabs();
  }, []);

  // Initialiser ElevenLabs
  const initializeElevenLabs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Vérifier la clé API
      const isValid = await validateApiKey();
      setApiKeyValid(isValid);
      
      if (isValid) {
        setIsEnabled(true);
        
        // Charger les voix et modèles
        const [voicesData, modelsData] = await Promise.all([
          getVoices(),
          getModels()
        ]);
        
        setVoices(voicesData);
        setModels(modelsData);
        
        // Mettre à jour la voix et le modèle courants
        updateCurrentVoiceAndModel(voicesData, modelsData);
        
        // Charger les stats d'utilisation
        try {
          const stats = await getUsageStats();
          setUsageStats(stats);
        } catch (error) {
          console.warn('Impossible de charger les stats d\'utilisation:', error);
        }
      } else {
        setIsEnabled(false);
        setFallbackToNative(true);
        toast.error('Clé API ElevenLabs invalide. Utilisation du TTS natif.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation d\'ElevenLabs:', error);
      setIsEnabled(false);
      setFallbackToNative(true);
      toast.error('Erreur ElevenLabs. Utilisation du TTS natif.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mettre à jour la voix et le modèle courants
  const updateCurrentVoiceAndModel = useCallback((voicesData: ElevenLabsVoice[], modelsData: ElevenLabsModel[]) => {
    const voice = voicesData.find(v => v.voice_id === settings.voice_id);
    const model = modelsData.find(m => m.model_id === settings.model_id);
    
    setCurrentVoice(voice || null);
    setCurrentModel(model || null);
  }, [settings.voice_id, settings.model_id]);

  // Mettre à jour les paramètres
  const updateSettings = useCallback((updates: Partial<ElevenLabsTTSSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Détecter la langue du texte
  const detectLanguage = useCallback((text: string): string => {
    const isFrench = /[éèêàùçôîûœ]/i.test(text) || /\b(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles|bonjour|merci|oui|non)\b/i.test(text);
    return isFrench ? 'fr' : 'en';
  }, []);

  // Parler avec ElevenLabs
  const speak = useCallback(async (text: string, options: ElevenLabsTTSOptions = {}) => {
    if (!isEnabled || !apiKeyValid) {
      if (fallbackToNative) {
        // Fallback vers TTS natif
        speakWithNativeTTS(text);
        return;
      }
      toast.error('ElevenLabs TTS non disponible');
      return;
    }

    try {
      setIsLoading(true);
      
      // Annuler toute lecture en cours
      stop();
      
      // Détecter la langue et optimiser les paramètres
      const language = detectLanguage(text);
      const optimalSettings = getOptimalSettingsForLanguage(language);
      
      // Fusionner les options
      const generationOptions: ElevenLabsGenerationOptions = {
        voice_id: options.voice_id || settings.voice_id,
        model_id: options.model_id || settings.model_id,
        voice_settings: {
          stability: options.stability ?? optimalSettings.stability ?? settings.stability,
          similarity_boost: options.similarity_boost ?? optimalSettings.similarity_boost ?? settings.similarity_boost,
          style: options.style ?? optimalSettings.style ?? settings.style,
          use_speaker_boost: options.use_speaker_boost ?? settings.use_speaker_boost,
        },
      };

      // Générer l'audio
      const audioBlob = await generateSpeech(text, generationOptions);
      
      // Créer l'élément audio et le lire
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;
      
      audio.onended = () => {
        options.onEnd?.();
        setIsLoading(false);
      };
      
      audio.onerror = (error) => {
        console.error('Erreur de lecture audio:', error);
        options.onError?.(new Error('Erreur de lecture audio'));
        setIsLoading(false);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Erreur lors de la génération ElevenLabs:', error);
      options.onError?.(error as Error);
      
      // Fallback vers TTS natif
      if (!fallbackToNative) {
        setFallbackToNative(true);
        toast.warning('Fallback vers TTS natif en raison d\'une erreur ElevenLabs');
        speakWithNativeTTS(text);
      }
      
      setIsLoading(false);
    }
  }, [isEnabled, apiKeyValid, settings, detectLanguage, fallbackToNative]);

  // Fallback vers TTS natif
  const speakWithNativeTTS = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = detectLanguage(text) === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [detectLanguage]);

  // Tester une voix
  const testVoice = useCallback(async (voiceId?: string, text?: string) => {
    const voiceToTest = voiceId || settings.voice_id;
    const testText = text || (detectLanguage('test') === 'fr' ? 'Ceci est un test de la synthèse vocale ElevenLabs.' : 'This is a test of ElevenLabs speech synthesis.');
    
    try {
      setIsLoading(true);
      const audioBlob = await testVoice(voiceToTest, testText);
      
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;
      
      audio.onended = () => setIsLoading(false);
      audio.onerror = () => setIsLoading(false);
      
      await audio.play();
      
    } catch (error) {
      console.error('Erreur lors du test de voix:', error);
      toast.error('Erreur lors du test de voix');
      setIsLoading(false);
    }
  }, [settings.voice_id, detectLanguage]);

  // Arrêter la lecture
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsLoading(false);
  }, []);

  // Réinitialiser les réglages
  const resetSettings = useCallback(() => {
    setSettings(DEFAULTS);
    toast.success('Réglages ElevenLabs réinitialisés');
  }, []);

  // Exporter les réglages
  const exportSettings = useCallback(() => {
    const data = { ...settings, voices: voices.length, models: models.length };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    return url;
  }, [settings, voices.length, models.length]);

  // Importer les réglages
  const importSettings = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validation des données importées
      if (imported.voice_id && imported.model_id) {
        setSettings(prev => ({ ...prev, ...imported }));
        toast.success('Réglages ElevenLabs importés');
        return true;
      } else {
        throw new Error('Format de fichier invalide');
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import des réglages');
      return false;
    }
  }, []);

  // Supprimer les réglages
  const deleteSettings = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setSettings(DEFAULTS);
    toast.success('Réglages ElevenLabs supprimés');
  }, []);

  // Rafraîchir les données
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      clearCache();
      await initializeElevenLabs();
      toast.success('Données ElevenLabs rafraîchies');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsLoading(false);
    }
  }, [initializeElevenLabs]);

  // Filtrer les voix par langue
  const getVoicesByLanguage = useCallback((language: string) => {
    return filterVoicesByLanguage(voices, language);
  }, [voices]);

  // Obtenir les voix françaises
  const frenchVoices = getVoicesByLanguage('french');
  
  // Obtenir les voix anglaises
  const englishVoices = getVoicesByLanguage('english');

  return {
    // État
    isEnabled,
    isLoading,
    apiKeyValid,
    fallbackToNative,
    usageStats,
    
    // Données
    voices,
    models,
    settings,
    currentVoice,
    currentModel,
    
    // Actions principales
    speak,
    stop,
    testVoice,
    
    // Gestion des réglages
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    deleteSettings,
    
    // Utilitaires
    refresh,
    getVoicesByLanguage,
    frenchVoices,
    englishVoices,
    
    // Détection de langue
    detectLanguage,
  };
}
