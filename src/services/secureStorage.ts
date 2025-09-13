/**
 * 🔐 Service de Stockage Sécurisé - Protection AES-256 Globale
 * 
 * Couche de sécurité universelle pour toutes les données sensibles
 * - Chiffrement transparent pour conversations, historique, presets
 * - Gestion automatique des clés de session
 * - Auto-destruction complète en mode privé
 * - Interface compatible avec localStorage existant
 */

import { encrypt, decrypt, generateSecurePassword, clearKeyCache, validateEncryptedBlob } from './encryption';

// ========================================================================================
// CONFIGURATION DE SÉCURITÉ GLOBALE
// ========================================================================================

/** Préfixe pour identifier les données chiffrées */
const ENCRYPTED_PREFIX = 'NEUROCHT_SEC_';

/** Clé pour le mot de passe de session principale */
const MASTER_SESSION_KEY = 'nc_master_session_key';

/** Mode de sécurité global */
let globalSecurityMode: 'private' | 'normal' = 'normal';

/** Mot de passe maître de session */
let masterSessionPassword: string | null = null;

/** Cache en mémoire pour les données déchiffrées */
const storageCache = new Map<string, unknown>();

/** Whitelist des clés qui ne doivent PAS être chiffrées */
const ENCRYPTION_WHITELIST = new Set([
  'nc_master_session_key',
  'nc_private_session_key', 
  'theme',
  'language',
  'nc_workspaces',
  'nc_active_workspace',
  'llm_provider',
  'auto_rag_enabled',
  'auto_web_enabled',
  'auto_rag_keywords',
  'auto_web_keywords',
  'mistral_agent_enabled',
  'gemini_agent_enabled',
  'auto_voice_cfg',
]);

/** Patterns de clés sensibles qui doivent être chiffrées */
const SENSITIVE_KEY_PATTERNS = [
  /^ws:.*:gemini_discussions$/,
  /^ws:.*:gemini_current_discussion$/,
  /^ws:.*:gemini_presets$/,
  /^ws:.*:neurochat_user_memory_v1$/,
  /^ws:.*:rag_user_docs$/,
  /^ws:.*:rag_doc_stats$/,
  /^ws:.*:rag_doc_favorites$/,
  /^gemini_discussions$/,
  /^gemini_current_discussion$/,
  /^.*_api_key$/,
  /^.*_token$/,
  /^.*_secret$/,
];

// ========================================================================================
// GESTION DU MODE SÉCURISÉ GLOBAL
// ========================================================================================

/**
 * Active le mode de stockage sécurisé global
 * Génère un mot de passe maître pour toutes les données
 */
export function enableSecureStorage(): void {
  if (globalSecurityMode === 'private') return;
  
  // Génération du mot de passe maître (plus long pour la sécurité globale)
  masterSessionPassword = generateSecurePassword(128);
  globalSecurityMode = 'private';
  
  // Stockage en sessionStorage uniquement (volatil)
  sessionStorage.setItem(MASTER_SESSION_KEY, masterSessionPassword);
  
  console.log('🔐 Stockage sécurisé global activé - Toutes les données sensibles sont chiffrées');
}

/**
 * Désactive le mode sécurisé et détruit toutes les traces
 */
export function disableSecureStorage(): void {
  if (globalSecurityMode === 'normal') return;
  
  // Nettoyage immédiat
  masterSessionPassword = null;
  globalSecurityMode = 'normal';
  
  // Effacement des sessions
  sessionStorage.removeItem(MASTER_SESSION_KEY);
  
  // Nettoyage cryptographique
  clearKeyCache();
  storageCache.clear();
  
  // Destruction de toutes les données chiffrées
  obliterateEncryptedData();
  
  console.log('🔓 Stockage sécurisé désactivé - Toutes les données privées ont été détruites');
}

/**
 * Vérifie si le stockage sécurisé est actif
 */
export function isSecureStorageActive(): boolean {
  return globalSecurityMode === 'private' && masterSessionPassword !== null;
}

/**
 * Récupère le mot de passe maître de session
 */
function getMasterPassword(): string {
  if (!isSecureStorageActive()) {
    throw new Error('Stockage sécurisé non actif');
  }
  
  const storedPassword = sessionStorage.getItem(MASTER_SESSION_KEY);
  if (!storedPassword || storedPassword !== masterSessionPassword) {
    throw new Error('Session maître expirée');
  }
  
  return masterSessionPassword!;
}

/**
 * Détermine si une clé doit être chiffrée
 */
function shouldEncryptKey(key: string): boolean {
  // Vérifier la whitelist (ne pas chiffrer)
  if (ENCRYPTION_WHITELIST.has(key)) {
    return false;
  }
  
  // Vérifier les patterns sensibles (chiffrer)
  return SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
}

// ========================================================================================
// INTERFACE DE STOCKAGE SÉCURISÉ
// ========================================================================================

/**
 * Stockage sécurisé compatible avec localStorage
 */
export class SecureStorageAPI {
  /**
   * Stocke une valeur de manière sécurisée
   * - Mode normal : localStorage standard
   * - Mode privé : chiffrement + sessionStorage
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (globalSecurityMode === 'private' && shouldEncryptKey(key)) {
        // Mode privé : chiffrement des données sensibles
        const password = getMasterPassword();
        const encryptedBlob = await encrypt(value, password);
        const encryptedData = ENCRYPTED_PREFIX + JSON.stringify(encryptedBlob);
        
        // Stockage temporaire en sessionStorage
        sessionStorage.setItem(key, encryptedData);
        
        // Cache en mémoire pour performance
        storageCache.set(key, value);
        
        console.log(`🔐 Donnée chiffrée: ${key}`);
      } else {
        // Mode normal ou donnée non sensible
        localStorage.setItem(key, value);
        storageCache.set(key, value);
      }
    } catch (error) {
      console.error(`Erreur stockage sécurisé [${key}]:`, error);
      throw new Error(`Échec du stockage sécurisé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  /**
   * Récupère une valeur de manière sécurisée
   * - Mode normal : localStorage standard
   * - Mode privé : déchiffrement automatique
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      // Vérifier le cache en mémoire d'abord
      if (storageCache.has(key)) {
        return storageCache.get(key) as string | null;
      }
      
      let rawData: string | null = null;
      
      if (globalSecurityMode === 'private' && shouldEncryptKey(key)) {
        // Mode privé : récupération depuis sessionStorage
        rawData = sessionStorage.getItem(key);
      } else {
        // Mode normal : récupération depuis localStorage
        rawData = localStorage.getItem(key);
      }
      
      if (!rawData) {
        return null;
      }
      
      // Vérifier si les données sont chiffrées
      if (rawData.startsWith(ENCRYPTED_PREFIX)) {
        const encryptedDataStr = rawData.slice(ENCRYPTED_PREFIX.length);
        const encryptedBlob = JSON.parse(encryptedDataStr);
        
        if (!validateEncryptedBlob(encryptedBlob)) {
          console.warn(`⚠️ Blob chiffré invalide pour la clé: ${key}`);
          return null;
        }
        
        const password = getMasterPassword();
        const decryptedData = await decrypt(encryptedBlob, password);
        
        // Cache en mémoire
        storageCache.set(key, decryptedData);
        
        console.log(`🔓 Donnée déchiffrée: ${key}`);
        return decryptedData;
      } else {
        // Données non chiffrées
        storageCache.set(key, rawData);
        return rawData;
      }
    } catch (error) {
      console.error(`Erreur récupération sécurisée [${key}]:`, error);
      
      // En cas d'erreur de déchiffrement, retourner null
      if (error instanceof Error && error.message.includes('Mot de passe incorrect')) {
        console.warn(`⚠️ Impossible de déchiffrer: ${key} - session expirée`);
        return null;
      }
      
      throw new Error(`Échec de la récupération sécurisée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  /**
   * Supprime une clé de manière sécurisée
   */
  static removeItem(key: string): void {
    // Supprimer des deux emplacements potentiels
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    storageCache.delete(key);
  }
  
  /**
   * Vide le cache en mémoire
   */
  static clearCache(): void {
    storageCache.clear();
  }
  
  /**
   * Obtient les statistiques du stockage sécurisé
   */
  static getStats() {
    return {
      isSecureMode: isSecureStorageActive(),
      cacheSize: storageCache.size,
      encryptedKeysCount: Array.from(storageCache.keys()).filter(shouldEncryptKey).length,
      whitelistedKeysCount: Array.from(storageCache.keys()).filter(k => ENCRYPTION_WHITELIST.has(k)).length,
    };
  }
}

// ========================================================================================
// WRAPPER SYNCHRONE POUR COMPATIBILITÉ
// ========================================================================================

/**
 * Interface synchrone compatible avec l'API localStorage existante
 * Les opérations asynchrones sont gérées en arrière-plan
 */
export const secureStorage = {
  /**
   * Stockage synchrone avec chiffrement en arrière-plan
   */
  setItem(key: string, value: string): void {
    // Stockage immédiat en cache pour réactivité
    storageCache.set(key, value);
    
    // Chiffrement asynchrone en arrière-plan
    SecureStorageAPI.setItem(key, value).catch(error => {
      console.error('Erreur de chiffrement en arrière-plan:', error);
    });
  },
  
  /**
   * Récupération synchrone depuis le cache ou stockage standard
   */
  getItem(key: string): string | null {
    // Récupération depuis le cache en premier
    if (storageCache.has(key)) {
      return storageCache.get(key) as string | null;
    }
    
    // Fallback sur localStorage pour les données non sensibles
    if (!shouldEncryptKey(key)) {
      const value = localStorage.getItem(key);
      if (value) storageCache.set(key, value);
      return value;
    }
    
    // Pour les données sensibles, déclencher le déchiffrement asynchrone
    SecureStorageAPI.getItem(key).then(value => {
      if (value) storageCache.set(key, value);
    }).catch(error => {
      console.error('Erreur de déchiffrement en arrière-plan:', error);
    });
    
    return null; // Retourner null temporairement
  },
  
  /**
   * Suppression synchrone
   */
  removeItem(key: string): void {
    SecureStorageAPI.removeItem(key);
  },
  
  /**
   * Pré-chargement asynchrone des données critiques
   */
  async preloadCriticalData(keys: string[]): Promise<void> {
    const promises = keys.map(key => SecureStorageAPI.getItem(key));
    await Promise.allSettled(promises);
  },
};

// ========================================================================================
// FONCTIONS DE MIGRATION ET NETTOYAGE
// ========================================================================================

/**
 * Migre les données existantes vers le stockage sécurisé
 */
export async function migrateToSecureStorage(): Promise<void> {
  if (!isSecureStorageActive()) {
    throw new Error('Mode sécurisé non actif - impossible de migrer');
  }
  
  console.log('🔄 Migration vers le stockage sécurisé...');
  
  const keysToMigrate: string[] = [];
  
  // Identifier les clés sensibles à migrer
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && shouldEncryptKey(key)) {
      keysToMigrate.push(key);
    }
  }
  
  let migratedCount = 0;
  
  // Migrer chaque clé
  for (const key of keysToMigrate) {
    try {
      const value = localStorage.getItem(key);
      if (value && !value.startsWith(ENCRYPTED_PREFIX)) {
        await SecureStorageAPI.setItem(key, value);
        localStorage.removeItem(key); // Supprimer l'ancienne version non chiffrée
        migratedCount++;
      }
    } catch (error) {
      console.error(`Erreur migration clé ${key}:`, error);
    }
  }
  
  console.log(`✅ Migration terminée: ${migratedCount} clés migrées vers le stockage sécurisé`);
}

/**
 * Détruit complètement toutes les données chiffrées
 */
function obliterateEncryptedData(): void {
  console.log('💥 Destruction des données chiffrées...');
  
  let destroyedCount = 0;
  
  // Nettoyer sessionStorage
  const sessionKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      if (value && (value.startsWith(ENCRYPTED_PREFIX) || shouldEncryptKey(key))) {
        sessionKeys.push(key);
      }
    }
  }
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    destroyedCount++;
  });
  
  // Nettoyer localStorage des données chiffrées orphelines
  const localKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value && value.startsWith(ENCRYPTED_PREFIX)) {
        localKeys.push(key);
      }
    }
  }
  localKeys.forEach(key => {
    localStorage.removeItem(key);
    destroyedCount++;
  });
  
  console.log(`💥 Destruction terminée: ${destroyedCount} entrées oblitérées`);
}

// ========================================================================================
// INITIALISATION ET HOOKS
// ========================================================================================

/**
 * Initialise le système de stockage sécurisé
 */
export function initializeSecureStorage(): void {
  // Vérifier s'il y a une session maître active
  const storedMasterPassword = sessionStorage.getItem(MASTER_SESSION_KEY);
  if (storedMasterPassword) {
    masterSessionPassword = storedMasterPassword;
    globalSecurityMode = 'private';
    console.log('🔐 Session de stockage sécurisé récupérée');
  }
  
  // Nettoyer les données orphelines
  if (!isSecureStorageActive()) {
    obliterateEncryptedData();
  }
}

/**
 * Gestionnaire d'événements pour auto-destruction
 */
if (typeof window !== 'undefined') {
  // Auto-destruction à la fermeture de la page
  window.addEventListener('beforeunload', () => {
    if (isSecureStorageActive()) {
      console.log('🔐 Fermeture détectée - Auto-destruction du stockage sécurisé');
      disableSecureStorage();
    }
  });
  
  // Vérification périodique de l'intégrité des sessions
  setInterval(() => {
    if (isSecureStorageActive()) {
      const storedPassword = sessionStorage.getItem(MASTER_SESSION_KEY);
      if (!storedPassword || storedPassword !== masterSessionPassword) {
        console.warn('⚠️ Session compromise détectée - Auto-désactivation');
        disableSecureStorage();
      }
    }
  }, 60000); // Vérification chaque minute
  
  // Nettoyage périodique du cache
  setInterval(() => {
    if (storageCache.size > 50) {
      console.log('🧹 Nettoyage périodique du cache de stockage');
      storageCache.clear();
    }
  }, 300000); // 5 minutes
}

// ========================================================================================
// EXPORT PAR DÉFAUT
// ========================================================================================

export default {
  enableSecureStorage,
  disableSecureStorage,
  isSecureStorageActive,
  SecureStorageAPI,
  secureStorage,
  migrateToSecureStorage,
  initializeSecureStorage,
};
