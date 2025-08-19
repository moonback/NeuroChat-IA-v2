/**
 * 🌍 Configuration d'environnement - NeuroChat
 *
 * Variables d'environnement et configuration par défaut
 */

// ========================================================================================
// CONFIGURATION CLOUD
// ========================================================================================

export const ENV_CONFIG = {
  // ☁️ URL de l'API backend
  CLOUD_API_URL: import.meta.env.VITE_CLOUD_API_URL || 'http://localhost:3001/api',
  
  // 🔐 Configuration de sécurité
  ENCRYPTION_ENABLED: import.meta.env.VITE_ENCRYPTION_ENABLED !== 'false',
  AUTO_ENCRYPTION: import.meta.env.VITE_AUTO_ENCRYPTION !== 'false',
  
  // 🤖 Configuration des modèles IA
  GEMINI_MODEL: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
  OPENAI_MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  MISTRAL_MODEL: import.meta.env.VITE_MISTRAL_MODEL || 'mistral-small-latest',
  
  // 🔍 Configuration RAG
  RAG_ENABLED: import.meta.env.VITE_RAG_ENABLED !== 'false',
  AUTO_RAG_ENABLED: import.meta.env.VITE_AUTO_RAG_ENABLED !== 'false',
  
  // 🌐 Configuration Web Search
  WEB_SEARCH_ENABLED: import.meta.env.VITE_WEB_SEARCH_ENABLED !== 'false',
  AUTO_WEB_ENABLED: import.meta.env.VITE_AUTO_WEB_ENABLED === 'true',
  
  // 🎵 Configuration TTS/STT
  TTS_ENABLED: import.meta.env.VITE_TTS_ENABLED !== 'false',
  STT_ENABLED: import.meta.env.VITE_STT_ENABLED !== 'false',
  
  // 📱 Configuration mobile
  MOBILE_OPTIMIZED: import.meta.env.VITE_MOBILE_OPTIMIZED !== 'false',
  PWA_ENABLED: import.meta.env.VITE_PWA_ENABLED === 'true',
  
  // 🧪 Configuration développement
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // 🌍 Environnement
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// ========================================================================================
// CONFIGURATION PAR DÉFAUT
// ========================================================================================

export const DEFAULT_CONFIG = {
  // 🔐 Sécurité
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
  },
  
  // ☁️ Cloud
  CLOUD: {
    SYNC_INTERVAL: 30000, // 30 secondes
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    REQUEST_TIMEOUT: 30000,
  },
  
  // 🤖 IA
  AI: {
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,
    TOP_P: 0.95,
    TOP_K: 40,
  },
  
  // 🔍 RAG
  RAG: {
    MAX_RESULTS: 5,
    SIMILARITY_THRESHOLD: 0.7,
    MAX_CHUNK_SIZE: 1000,
  },
  
  // 🌐 Web Search
  WEB: {
    MAX_RESULTS: 5,
    SEARCH_TIMEOUT: 10000,
  },
  
  // 🎵 Audio
  AUDIO: {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
  },
} as const;

// ========================================================================================
// UTILITAIRES
// ========================================================================================

/**
 * Vérifie si l'application est en mode développement
 */
export const isDevelopment = (): boolean => {
  return ENV_CONFIG.IS_DEV || ENV_CONFIG.NODE_ENV === 'development';
};

/**
 * Vérifie si l'application est en mode production
 */
export const isProduction = (): boolean => {
  return ENV_CONFIG.IS_PROD || ENV_CONFIG.NODE_ENV === 'production';
};

/**
 * Vérifie si l'application est en mode test
 */
export const isTest = (): boolean => {
  return ENV_CONFIG.NODE_ENV === 'test';
};

/**
 * Log conditionnel basé sur le niveau de log configuré
 */
export const log = {
  debug: (message: string, ...args: any[]) => {
    if (ENV_CONFIG.DEBUG_MODE || ENV_CONFIG.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (['debug', 'info'].includes(ENV_CONFIG.LOG_LEVEL)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(ENV_CONFIG.LOG_LEVEL)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (['debug', 'info', 'warn', 'error'].includes(ENV_CONFIG.LOG_LEVEL)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
};

// ========================================================================================
// EXPORT
// ========================================================================================

export default {
  ENV_CONFIG,
  DEFAULT_CONFIG,
  isDevelopment,
  isProduction,
  isTest,
  log,
};
