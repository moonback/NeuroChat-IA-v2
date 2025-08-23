/**
 * 🎙️ Service ElevenLabs TTS - Synthèse vocale de qualité professionnelle
 * 
 * Intégration complète avec l'API ElevenLabs pour une qualité vocale exceptionnelle
 * - Support de multiples voix et modèles
 * - Optimisation de la latence et de la qualité
 * - Gestion des erreurs et fallbacks
 * - Cache intelligent pour les performances
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels: Record<string, string>;
  preview_url?: string;
  available_for_tiers: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export interface ElevenLabsModel {
  model_id: string;
  name: string;
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_style: boolean;
  can_use_speaker_boost: boolean;
  language: string;
  description?: string;
}

export interface ElevenLabsGenerationOptions {
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;        // 0.0 - 1.0
    similarity_boost?: number; // 0.0 - 1.0
    style?: number;           // 0.0 - 1.0
    use_speaker_boost?: boolean;
  };
  output_format?: 'mp3_44100_128' | 'mp3_44100_96' | 'mp3_44100_64' | 'mp3_44100_32' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';
}

export interface ElevenLabsStreamOptions extends ElevenLabsGenerationOptions {
  text: string;
  onChunk?: (chunk: ArrayBuffer) => void;
  onComplete?: (audioBlob: Blob) => void;
  onError?: (error: Error) => void;
}

// Configuration par défaut
const DEFAULT_CONFIG = {
  apiKey: '',
  baseUrl: 'https://api.elevenlabs.io/v1',
  defaultModel: 'eleven_multilingual_v2',
  defaultVoice: '21m00Tcm4TlvDq8ikWAM', // Rachel (voix anglaise populaire)
  maxRetries: 3,
  timeout: 30000,
};

// Cache pour les voix et modèles
let voicesCache: ElevenLabsVoice[] | null = null;
let modelsCache: ElevenLabsModel[] | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Initialise la configuration ElevenLabs
 */
export function initializeElevenLabs(apiKey: string): void {
  if (!apiKey) {
    throw new Error('Clé API ElevenLabs requise');
  }
  DEFAULT_CONFIG.apiKey = apiKey;
}

/**
 * Récupère la clé API depuis les variables d'environnement ou le localStorage
 */
function getApiKey(): string {
  // Priorité 1: Variable d'environnement
  let apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  // Priorité 2: localStorage
  if (!apiKey) {
    apiKey = localStorage.getItem('elevenlabs_api_key') || '';
  }
  
  // Priorité 3: Configuration par défaut
  if (!apiKey) {
    apiKey = DEFAULT_CONFIG.apiKey;
  }
  
  if (!apiKey) {
    throw new Error('Clé API ElevenLabs non configurée. Ajoutez VITE_ELEVENLABS_API_KEY dans votre .env ou configurez-la dans l\'interface');
  }
  
  return apiKey;
}

/**
 * Effectue une requête HTTP vers l'API ElevenLabs
 */
async function makeRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = `${DEFAULT_CONFIG.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(DEFAULT_CONFIG.timeout),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `ElevenLabs API Error ${response.status}: ${errorData.detail || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Récupère la liste des voix disponibles
 */
export async function getVoices(): Promise<ElevenLabsVoice[]> {
  const now = Date.now();
  
  // Utiliser le cache si valide
  if (voicesCache && now < cacheExpiry) {
    return voicesCache;
  }

  try {
    const voices = await makeRequest<ElevenLabsVoice[]>('/voices');
    voicesCache = voices;
    cacheExpiry = now + CACHE_DURATION;
    return voices;
  } catch (error) {
    console.error('Erreur lors de la récupération des voix:', error);
    // Retourner le cache expiré si disponible
    return voicesCache || [];
  }
}

/**
 * Récupère la liste des modèles disponibles
 */
export async function getModels(): Promise<ElevenLabsModel[]> {
  const now = Date.now();
  
  if (modelsCache && now < cacheExpiry) {
    return modelsCache;
  }

  try {
    const models = await makeRequest<ElevenLabsModel[]>('/models');
    modelsCache = models;
    cacheExpiry = now + CACHE_DURATION;
    return models;
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error);
    return modelsCache || [];
  }
}

/**
 * Génère de l'audio à partir de texte (streaming)
 */
export async function generateSpeechStream(
  text: string, 
  options: ElevenLabsGenerationOptions
): Promise<Blob> {
  const apiKey = getApiKey();
  const url = `${DEFAULT_CONFIG.baseUrl}/text-to-speech/${options.voice_id}/stream`;
  
  const requestBody = {
    text,
    model_id: options.model_id || DEFAULT_CONFIG.defaultModel,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
      ...options.voice_settings,
    },
    output_format: 'mp3_44100_128',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(DEFAULT_CONFIG.timeout),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erreur de génération ElevenLabs: ${errorData.detail || response.statusText}`
    );
  }

  return response.blob();
}

/**
 * Génère de l'audio à partir de texte (non-streaming)
 */
export async function generateSpeech(
  text: string, 
  options: ElevenLabsGenerationOptions
): Promise<Blob> {
  const apiKey = getApiKey();
  const url = `${DEFAULT_CONFIG.baseUrl}/text-to-speech/${options.voice_id}`;
  
  const requestBody = {
    text,
    model_id: options.model_id || DEFAULT_CONFIG.defaultModel,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
      ...options.voice_settings,
    },
    output_format: 'mp3_44100_128',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(DEFAULT_CONFIG.timeout),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erreur de génération ElevenLabs: ${errorData.detail || response.statusText}`
    );
  }

  return response.blob();
}

/**
 * Teste une voix avec un texte d'exemple
 */
export async function testVoice(
  voiceId: string, 
  text: string = "Ceci est un test de la synthèse vocale ElevenLabs."
): Promise<Blob> {
  return generateSpeech(text, { voice_id: voiceId });
}

/**
 * Nettoie le cache
 */
export function clearCache(): void {
  voicesCache = null;
  modelsCache = null;
  cacheExpiry = 0;
}

/**
 * Vérifie la validité de la clé API
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    await getVoices();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Récupère les statistiques d'utilisation
 */
export async function getUsageStats(): Promise<any> {
  try {
    return await makeRequest('/user/subscription');
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return null;
  }
}

/**
 * Filtre les voix par langue
 */
export function filterVoicesByLanguage(voices: ElevenLabsVoice[], language: string): ElevenLabsVoice[] {
  return voices.filter(voice => {
    const voiceLanguage = voice.labels.language || voice.labels.accent || '';
    return voiceLanguage.toLowerCase().includes(language.toLowerCase());
  });
}

/**
 * Filtre les voix par catégorie
 */
export function filterVoicesByCategory(voices: ElevenLabsVoice[], category: string): ElevenLabsVoice[] {
  return voices.filter(voice => voice.category === category);
}

/**
 * Trouve une voix par nom
 */
export function findVoiceByName(voices: ElevenLabsVoice[], name: string): ElevenLabsVoice | undefined {
  return voices.find(voice => 
    voice.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Obtient les paramètres optimaux pour une langue donnée
 */
export function getOptimalSettingsForLanguage(language: string): Partial<ElevenLabsVoice['settings']> {
  const languageSettings: Record<string, Partial<ElevenLabsVoice['settings']>> = {
    'fr': { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    'en': { stability: 0.5, similarity_boost: 0.75, style: 0.0 },
    'es': { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    'de': { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    'it': { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
  };

  const langCode = language.toLowerCase().split('-')[0];
  return languageSettings[langCode] || { stability: 0.5, similarity_boost: 0.75, style: 0.0 };
}
