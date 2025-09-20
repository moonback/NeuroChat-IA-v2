/**
 * 🔍 Service de Détection des Capacités d'Appareil
 * 
 * Détecte automatiquement les capacités de l'appareil pour optimiser
 * les performances des modèles d'IA selon les ressources disponibles.
 */

export interface DeviceCapabilities {
  /** Type d'appareil détecté */
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  /** Puissance CPU estimée (1-10) */
  cpuPower: number;
  /** Mémoire disponible estimée en MB */
  memoryMB: number;
  /** Connexion réseau estimée */
  networkSpeed: 'slow' | 'medium' | 'fast' | 'unknown';
  /** Support des Web Workers */
  supportsWebWorkers: boolean;
  /** Support de WebGL pour l'accélération GPU */
  supportsWebGL: boolean;
  /** Support de l'API Performance */
  supportsPerformanceAPI: boolean;
  /** Score de performance global (1-10) */
  performanceScore: number;
}

export interface OptimalModelConfig {
  /** Modèle recommandé pour cet appareil */
  recommendedModel: string;
  /** Paramètres optimisés */
  optimizedParams: {
    maxTokens: number;
    temperature: number;
    topP: number;
  };
  /** Stratégie de fallback */
  fallbackStrategy: 'aggressive' | 'conservative' | 'balanced';
  /** Timeout recommandé en ms */
  timeoutMs: number;
}

/**
 * Détecte les capacités de l'appareil en temps réel
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Détection du type d'appareil
  let deviceType: DeviceCapabilities['deviceType'] = 'unknown';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/desktop|windows|macintosh|linux/i.test(userAgent)) {
    deviceType = 'desktop';
  }

  // Estimation de la puissance CPU basée sur les cores et la fréquence
  const cpuPower = estimateCPUPower();
  
  // Estimation de la mémoire disponible
  const memoryMB = estimateAvailableMemory();
  
  // Détection de la vitesse réseau
  const networkSpeed = detectNetworkSpeed();
  
  // Vérification des APIs supportées
  const supportsWebWorkers = typeof Worker !== 'undefined';
  const supportsWebGL = !!window.WebGLRenderingContext;
  const supportsPerformanceAPI = 'performance' in window && 'memory' in performance;
  
  // Calcul du score de performance global
  const performanceScore = calculatePerformanceScore({
    deviceType,
    cpuPower,
    memoryMB,
    networkSpeed,
    supportsWebWorkers,
    supportsWebGL,
    supportsPerformanceAPI
  });

  return {
    deviceType,
    cpuPower,
    memoryMB,
    networkSpeed,
    supportsWebWorkers,
    supportsWebGL,
    supportsPerformanceAPI,
    performanceScore
  };
}

/**
 * Estime la puissance CPU basée sur les informations disponibles
 */
function estimateCPUPower(): number {
  let score = 5; // Score de base

  // Détection basée sur le User Agent
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Appareils haut de gamme
  if (/iphone (1[3-9]|2[0-9])|ipad pro|galaxy s(2[0-9]|3[0-9])|pixel [6-9]|oneplus [8-9]|10/i.test(userAgent)) {
    score = 9;
  }
  // Appareils milieu de gamme
  else if (/iphone (1[0-2]|x)|galaxy s(1[0-9])|pixel [4-5]|oneplus [5-7]/i.test(userAgent)) {
    score = 7;
  }
  // Appareils bas de gamme
  else if (/android [1-9]|iphone [6-9]|galaxy [a-j]/i.test(userAgent)) {
    score = 4;
  }

  // Ajustement basé sur le nombre de cores (si disponible)
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores >= 8) score += 2;
    else if (cores >= 4) score += 1;
    else if (cores <= 2) score -= 1;
  }

  // Test de performance JavaScript simple
  const start = performance.now();
  for (let i = 0; i < 100000; i++) {
    Math.random() * Math.random();
  }
  const end = performance.now();
  const jsSpeed = end - start;
  
  if (jsSpeed < 10) score += 1;
  else if (jsSpeed > 50) score -= 2;

  return Math.max(1, Math.min(10, score));
}

/**
 * Estime la mémoire disponible
 */
function estimateAvailableMemory(): number {
  // Si l'API memory est disponible, l'utiliser
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    if (memInfo && memInfo.jsHeapSizeLimit) {
      return Math.round(memInfo.jsHeapSizeLimit / (1024 * 1024)); // Convertir en MB
    }
  }

  // Estimation basée sur le type d'appareil
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone (1[3-9]|2[0-9])|ipad pro|galaxy s(2[0-9]|3[0-9])|pixel [6-9]/i.test(userAgent)) {
    return 8192; // 8GB
  }
  else if (/iphone (1[0-2]|x)|galaxy s(1[0-9])|pixel [4-5]/i.test(userAgent)) {
    return 4096; // 4GB
  }
  else if (/iphone [6-9]|galaxy [a-j]|android/i.test(userAgent)) {
    return 2048; // 2GB
  }
  else {
    return 4096; // Estimation par défaut
  }
}

/**
 * Détecte la vitesse du réseau
 */
function detectNetworkSpeed(): DeviceCapabilities['networkSpeed'] {
  // Si l'API Network Information est disponible
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType) {
      switch (connection.effectiveType) {
        case '4g': return 'fast';
        case '3g': return 'medium';
        case '2g': return 'slow';
        default: return 'unknown';
      }
    }
  }

  // Test de ping simple
  const start = performance.now();
  return new Promise<DeviceCapabilities['networkSpeed']>((resolve) => {
    fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
      .then(() => {
        const latency = performance.now() - start;
        if (latency < 100) resolve('fast');
        else if (latency < 500) resolve('medium');
        else resolve('slow');
      })
      .catch(() => resolve('unknown'));
  }) as any; // Fallback synchrone pour l'instant
}

/**
 * Calcule le score de performance global
 */
function calculatePerformanceScore(capabilities: Partial<DeviceCapabilities>): number {
  let score = 5;

  // Ajustement basé sur le type d'appareil
  switch (capabilities.deviceType) {
    case 'desktop': score += 2; break;
    case 'tablet': score += 1; break;
    case 'mobile': score -= 1; break;
  }

  // Ajustement basé sur la puissance CPU
  if (capabilities.cpuPower) {
    score += (capabilities.cpuPower - 5) * 0.3;
  }

  // Ajustement basé sur la mémoire
  if (capabilities.memoryMB) {
    if (capabilities.memoryMB >= 8192) score += 2;
    else if (capabilities.memoryMB >= 4096) score += 1;
    else if (capabilities.memoryMB <= 2048) score -= 1;
  }

  // Ajustement basé sur la vitesse réseau
  switch (capabilities.networkSpeed) {
    case 'fast': score += 1; break;
    case 'slow': score -= 1; break;
  }

  // Bonus pour les APIs supportées
  if (capabilities.supportsWebWorkers) score += 0.5;
  if (capabilities.supportsWebGL) score += 0.5;

  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * Détermine la configuration optimale du modèle basée sur les capacités
 */
export function getOptimalModelConfig(
  provider: 'gemini' | 'openai' | 'mistral',
  capabilities: DeviceCapabilities
): OptimalModelConfig {
  const { performanceScore, deviceType, networkSpeed } = capabilities;

  // Configuration de base
  let recommendedModel: string;
  let maxTokens: number;
  let temperature: number;
  let topP: number;
  let fallbackStrategy: OptimalModelConfig['fallbackStrategy'];
  let timeoutMs: number;

  // Sélection du modèle basée sur les performances
  if (performanceScore >= 8) {
    // Appareils hautes performances
    switch (provider) {
      case 'gemini':
        recommendedModel = 'gemini-1.5-pro';
        maxTokens = 8192;
        temperature = 0.7;
        topP = 0.95;
        break;
      case 'openai':
        recommendedModel = 'gpt-4o';
        maxTokens = 4096;
        temperature = 0.7;
        topP = 0.9;
        break;
      case 'mistral':
        recommendedModel = 'mistral-large-latest';
        maxTokens = 8192;
        temperature = 0.7;
        topP = 0.95;
        break;
    }
    fallbackStrategy = 'balanced';
    timeoutMs = 30000;
  } else if (performanceScore >= 6) {
    // Appareils performances moyennes
    switch (provider) {
      case 'gemini':
        recommendedModel = 'gemini-1.5-flash';
        maxTokens = 4096;
        temperature = 0.7;
        topP = 0.9;
        break;
      case 'openai':
        recommendedModel = 'gpt-4o-mini';
        maxTokens = 2048;
        temperature = 0.7;
        topP = 0.9;
        break;
      case 'mistral':
        recommendedModel = 'mistral-small-latest';
        maxTokens = 4096;
        temperature = 0.7;
        topP = 0.9;
        break;
    }
    fallbackStrategy = 'balanced';
    timeoutMs = 20000;
  } else {
    // Appareils faibles performances
    switch (provider) {
      case 'gemini':
        recommendedModel = 'gemini-1.5-flash';
        maxTokens = 2048;
        temperature = 0.8;
        topP = 0.85;
        break;
      case 'openai':
        recommendedModel = 'gpt-3.5-turbo';
        maxTokens = 1024;
        temperature = 0.8;
        topP = 0.85;
        break;
      case 'mistral':
        recommendedModel = 'mistral-small-latest';
        maxTokens = 2048;
        temperature = 0.8;
        topP = 0.85;
        break;
    }
    fallbackStrategy = 'aggressive';
    timeoutMs = 15000;
  }

  // Ajustements spécifiques par type d'appareil
  if (deviceType === 'mobile') {
    maxTokens = Math.floor(maxTokens * 0.7);
    timeoutMs = Math.floor(timeoutMs * 1.5);
  }

  // Ajustements basés sur la vitesse réseau
  if (networkSpeed === 'slow') {
    maxTokens = Math.floor(maxTokens * 0.6);
    timeoutMs = Math.floor(timeoutMs * 2);
    fallbackStrategy = 'aggressive';
  } else if (networkSpeed === 'fast') {
    maxTokens = Math.floor(maxTokens * 1.2);
    timeoutMs = Math.floor(timeoutMs * 0.8);
  }

  return {
    recommendedModel,
    optimizedParams: {
      maxTokens,
      temperature,
      topP
    },
    fallbackStrategy,
    timeoutMs
  };
}

/**
 * Cache les capacités détectées pour éviter les re-calculs
 */
let cachedCapabilities: DeviceCapabilities | null = null;
let lastDetection = 0;
const DETECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getDeviceCapabilities(): DeviceCapabilities {
  const now = Date.now();
  
  if (cachedCapabilities && (now - lastDetection) < DETECTION_CACHE_DURATION) {
    return cachedCapabilities;
  }

  cachedCapabilities = detectDeviceCapabilities();
  lastDetection = now;
  
  return cachedCapabilities;
}

/**
 * Force une nouvelle détection des capacités
 */
export function refreshDeviceCapabilities(): DeviceCapabilities {
  cachedCapabilities = null;
  return getDeviceCapabilities();
}
