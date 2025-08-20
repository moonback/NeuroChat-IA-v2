/**
 * 🔐 Service de Mémoire Sécurisée - Protection AES-256
 * 
 * Couche de sécurité pour le système de mémoire utilisateur
 * - Chiffrement automatique en mode privé
 * - Gestion transparente des clés de session
 * - Auto-destruction à la fermeture
 * - Cache en mémoire sécurisé
 */

import { encrypt, decrypt, generateSecurePassword, clearKeyCache, validateEncryptedBlob } from './encryption';
import type { MemoryItem } from './memory';

// ========================================================================================
// CONFIGURATION DE SÉCURITÉ
// ========================================================================================

/** Préfixe pour identifier les données chiffrées */
const ENCRYPTED_PREFIX = 'NEUROCHT_ENC_';

/** Clé pour stocker le mot de passe de session */
const SESSION_KEY = 'nc_private_session_key';

/** Mode de sécurité actuel */
let securityMode: 'private' | 'normal' = 'normal';

/** Mot de passe de session généré automatiquement */
let sessionPassword: string | null = null;

/** Cache en mémoire pour éviter les déchiffrements répétés */
const memoryCache = new Map<string, MemoryItem[]>();

// ========================================================================================
// GESTION DU MODE SÉCURISÉ
// ========================================================================================

/**
 * Active le mode privé sécurisé
 * Génère automatiquement un mot de passe de session unique
 */
export function enablePrivateMode(): void {
  if (securityMode === 'private') return;
  
  // Génération d'un mot de passe de session cryptographiquement sécurisé
  sessionPassword = generateSecurePassword(64);
  securityMode = 'private';
  
  // Stocker le mot de passe de session en mémoire volatile uniquement
  // (disparaît à la fermeture/actualisation de la page)
  sessionStorage.setItem(SESSION_KEY, sessionPassword);
  
  console.log('🔐 Mode privé sécurisé activé - Protection AES-256 active');
}

/**
 * Désactive le mode privé et nettoie toutes les données sensibles
 */
export function disablePrivateMode(): void {
  if (securityMode === 'normal') return;
  
  // Nettoyage des données de session
  sessionPassword = null;
  securityMode = 'normal';
  
  // Effacement du sessionStorage
  sessionStorage.removeItem(SESSION_KEY);
  
  // Nettoyage du cache cryptographique
  clearKeyCache();
  memoryCache.clear();
  
  // Nettoyage des données chiffrées en localStorage
  clearEncryptedData();
  
  console.log('🔓 Mode privé désactivé - Données sécurisées effacées');
}

/**
 * Vérifie si le mode privé est actif
 */
export function isPrivateModeActive(): boolean {
  return securityMode === 'private' && sessionPassword !== null;
}

/**
 * Récupère le mot de passe de session (si mode privé actif)
 */
function getSessionPassword(): string {
  if (!isPrivateModeActive()) {
    throw new Error('Mode privé non actif - impossible d\'accéder aux données chiffrées');
  }
  
  // Vérifier que le mot de passe est toujours en session
  const storedPassword = sessionStorage.getItem(SESSION_KEY);
  if (!storedPassword || storedPassword !== sessionPassword) {
    throw new Error('Session de sécurité expirée - redémarrage requis');
  }
  
  return sessionPassword!;
}

// ========================================================================================
// FONCTIONS DE STOCKAGE SÉCURISÉ
// ========================================================================================

/**
 * Sauvegarde sécurisée de la mémoire utilisateur
 * - Mode normal : stockage direct
 * - Mode privé : chiffrement AES-256
 */
export async function saveSecureMemory(workspaceId: string, memories: MemoryItem[]): Promise<void> {
  const key = `ws:${workspaceId}:neurochat_user_memory_v1`;
  
  try {
    if (securityMode === 'private') {
      // Mode privé : chiffrement des données
      const plaintext = JSON.stringify(memories);
      const password = getSessionPassword();
      
      const encryptedBlob = await encrypt(plaintext, password);
      const encryptedData = ENCRYPTED_PREFIX + JSON.stringify(encryptedBlob);
      
      // Stockage temporaire en sessionStorage (effacé à la fermeture)
      sessionStorage.setItem(key, encryptedData);
      
      // Mise à jour du cache en mémoire
      memoryCache.set(key, [...memories]);
      
      console.log(`🔐 Mémoire chiffrée sauvegardée (${memories.length} éléments)`);
    } else {
      // Mode normal : stockage direct dans localStorage
      const compressed = memories.map(m => {
        const cleaned: any = {};
        for (const [k, value] of Object.entries(m)) {
          if (value !== undefined) cleaned[k] = value;
        }
        return cleaned;
      });
      
      localStorage.setItem(key, JSON.stringify(compressed));
      memoryCache.set(key, [...memories]);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde sécurisée:', error);
    throw new Error(`Échec de la sauvegarde sécurisée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Chargement sécurisé de la mémoire utilisateur
 * - Mode normal : lecture directe
 * - Mode privé : déchiffrement AES-256
 */
export async function loadSecureMemory(workspaceId: string): Promise<MemoryItem[]> {
  const key = `ws:${workspaceId}:neurochat_user_memory_v1`;
  
  // Vérifier le cache en mémoire d'abord
  const cached = memoryCache.get(key);
  if (cached) {
    return [...cached];
  }
  
  try {
    let rawData: string | null = null;
    
    if (securityMode === 'private') {
      // Mode privé : récupération depuis sessionStorage
      rawData = sessionStorage.getItem(key);
    } else {
      // Mode normal : récupération depuis localStorage
      rawData = localStorage.getItem(key);
    }
    
    if (!rawData) {
      memoryCache.set(key, []);
      return [];
    }
    
    // Vérifier si les données sont chiffrées
    if (rawData.startsWith(ENCRYPTED_PREFIX)) {
      // Données chiffrées : déchiffrement requis
      const encryptedDataStr = rawData.slice(ENCRYPTED_PREFIX.length);
      const encryptedBlob = JSON.parse(encryptedDataStr);
      
      if (!validateEncryptedBlob(encryptedBlob)) {
        throw new Error('Blob chiffré invalide - données corrompues');
      }
      
      const password = getSessionPassword();
      const decryptedData = await decrypt(encryptedBlob, password);
      const memories = JSON.parse(decryptedData);
      
      if (!Array.isArray(memories)) {
        throw new Error('Format de données invalide après déchiffrement');
      }
      
      memoryCache.set(key, memories);
      console.log(`🔓 Mémoire déchiffrée chargée (${memories.length} éléments)`);
      return memories;
    } else {
      // Données non chiffrées : traitement normal
      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) {
        memoryCache.set(key, []);
        return [];
      }
      
      memoryCache.set(key, parsed);
      return [...parsed];
    }
  } catch (error) {
    console.error('Erreur lors du chargement sécurisé:', error);
    
    // En cas d'erreur de déchiffrement, retourner un tableau vide
    if (error instanceof Error && error.message.includes('Mot de passe incorrect')) {
      console.warn('⚠️ Impossible de déchiffrer la mémoire - session expirée ou données corrompues');
      memoryCache.set(key, []);
      return [];
    }
    
    throw new Error(`Échec du chargement sécurisé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Invalide le cache de mémoire pour forcer le rechargement
 */
export function invalidateSecureMemoryCache(workspaceId: string): void {
  const key = `ws:${workspaceId}:neurochat_user_memory_v1`;
  memoryCache.delete(key);
}

/**
 * Efface toutes les données chiffrées du stockage local
 */
function clearEncryptedData(): void {
  // Nettoyer sessionStorage
  const sessionKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('neurochat_user_memory') || key.includes('gemini_'))) {
      sessionKeys.push(key);
    }
  }
  sessionKeys.forEach(key => sessionStorage.removeItem(key));
  
  // Nettoyer localStorage des données potentiellement chiffrées
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
  localKeys.forEach(key => localStorage.removeItem(key));
  
  console.log(`🧹 Nettoyage effectué: ${sessionKeys.length + localKeys.length} clés supprimées`);
}

// ========================================================================================
// WRAPPER POUR L'API DE MÉMOIRE EXISTANTE
// ========================================================================================

/**
 * Interface unifiée pour le stockage de mémoire (chiffré ou non selon le mode)
 */
export class SecureMemoryStore {
  constructor(private workspaceId: string) {}
  
  /**
   * Charge la mémoire utilisateur (avec déchiffrement automatique si nécessaire)
   */
  async load(): Promise<MemoryItem[]> {
    return await loadSecureMemory(this.workspaceId);
  }
  
  /**
   * Sauvegarde la mémoire utilisateur (avec chiffrement automatique si mode privé)
   */
  async save(memories: MemoryItem[]): Promise<void> {
    return await saveSecureMemory(this.workspaceId, memories);
  }
  
  /**
   * Invalide le cache pour forcer le rechargement
   */
  invalidateCache(): void {
    invalidateSecureMemoryCache(this.workspaceId);
  }
  
  /**
   * Obtient les statistiques de sécurité
   */
  getSecurityInfo() {
    return {
      isPrivateMode: isPrivateModeActive(),
      cacheSize: memoryCache.size,
      workspaceId: this.workspaceId,
      hasSessionKey: sessionPassword !== null,
    };
  }
}

// ========================================================================================
// HOOKS DE CYCLE DE VIE
// ========================================================================================

/**
 * Initialise le système de mémoire sécurisée au démarrage
 * Récupère la session si elle existe
 */
export function initializeSecureMemory(): void {
  // Vérifier s'il y a une session active
  const storedPassword = sessionStorage.getItem(SESSION_KEY);
  if (storedPassword) {
    sessionPassword = storedPassword;
    securityMode = 'private';
    console.log('🔐 Session de sécurité récupérée - Mode privé actif');
  }
  
  // Nettoyer les sessions expirées au démarrage
  cleanupExpiredSessions();
}

/**
 * Nettoie les sessions expirées et les données orphelines
 */
function cleanupExpiredSessions(): void {
  try {
    // Nettoyer les données chiffrées orphelines (sans session active)
    if (!isPrivateModeActive()) {
      clearEncryptedData();
    }
  } catch (error) {
    console.warn('Erreur lors du nettoyage des sessions expirées:', error);
  }
}

/**
 * Gestionnaire d'événement pour nettoyer à la fermeture de la page
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (isPrivateModeActive()) {
      console.log('🔐 Fermeture détectée - Auto-destruction des données privées');
      disablePrivateMode();
    }
  });
  
  // Nettoyage périodique du cache (toutes les 5 minutes)
  setInterval(() => {
    if (memoryCache.size > 10) {
      console.log('🧹 Nettoyage périodique du cache mémoire');
      memoryCache.clear();
    }
  }, 300000); // 5 minutes
}

// ========================================================================================
// EXPORT PAR DÉFAUT
// ========================================================================================

export default {
  enablePrivateMode,
  disablePrivateMode,
  isPrivateModeActive,
  SecureMemoryStore,
  initializeSecureMemory,
};
