/**
 * 🔐 Chiffrement Persistant AES-256 - Mode Normal
 * 
 * Service de chiffrement pour les conversations normales
 * - Protection AES-256 avec persistance
 * - Pas d'auto-destruction
 * - Mot de passe utilisateur ou généré
 * - Stockage sécurisé dans localStorage
 */

import { encrypt, decrypt, generateSecurePassword, validateEncryptedBlob } from './encryption';

// ========================================================================================
// CONFIGURATION DU CHIFFREMENT PERSISTANT
// ========================================================================================

/** Préfixe pour les données chiffrées persistantes */
const PERSISTENT_ENCRYPTED_PREFIX = 'NEUROCHT_PERSIST_';

/** Clé pour stocker l'état d'activation du chiffrement */
const ENCRYPTION_ENABLED_KEY = 'nc_encryption_enabled';

/** Clé pour stocker le mot de passe chiffré (chiffré avec mot de passe dérivé) */
const MASTER_PASSWORD_KEY = 'nc_master_password_encrypted';

/** État global du chiffrement persistant */
let persistentEncryptionEnabled = false;
let masterPassword: string | null = null;

/** Cache pour éviter les re-déchiffrements */
const persistentCache = new Map<string, any>();

// ========================================================================================
// GESTION DU CHIFFREMENT PERSISTANT
// ========================================================================================

/**
 * Vérifie si le chiffrement persistant est activé
 */
export function isPersistentEncryptionEnabled(): boolean {
  return persistentEncryptionEnabled;
}

/**
 * Active le chiffrement persistant avec un mot de passe
 * @param userPassword - Mot de passe utilisateur (optionnel, sinon généré)
 * @returns Le mot de passe utilisé (pour affichage à l'utilisateur si généré)
 */
export async function enablePersistentEncryption(userPassword?: string): Promise<string> {
  try {
    // Utiliser le mot de passe fourni ou en générer un sécurisé
    const password = userPassword || generateSecurePassword(32);
    masterPassword = password;
    persistentEncryptionEnabled = true;
    
    // Sauvegarder l'état d'activation
    localStorage.setItem(ENCRYPTION_ENABLED_KEY, 'true');
    
      // Chiffrer et sauvegarder le mot de passe maître avec lui-même (auto-chiffrement)
  if (!userPassword) {
    // Si généré automatiquement, le stocker en utilisant une clé dérivée fixe basée sur l'environnement
    const derivationKey = 'NeuroChat_Persistent_Master_Key_' + new Date().getTime().toString(36);
    const encryptedPassword = await encrypt(password, derivationKey);
    localStorage.setItem(MASTER_PASSWORD_KEY, PERSISTENT_ENCRYPTED_PREFIX + JSON.stringify(encryptedPassword));
    localStorage.setItem('nc_derivation_key', derivationKey); // Stocker la clé de dérivation
  }
    
    console.log('🔐 Chiffrement persistant AES-256 activé');
    return password;
  } catch (error) {
    console.error('Erreur activation chiffrement persistant:', error);
    throw new Error(`Échec de l'activation du chiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// ⚠️ FONCTION SUPPRIMÉE: La désactivation du chiffrement n'est plus possible
// Le chiffrement AES-256 est maintenant permanent et obligatoire

/**
 * Initialise le chiffrement persistant au démarrage de l'app
 * @param userPassword - Mot de passe utilisateur pour déverrouillage
 */
export async function initializePersistentEncryption(userPassword?: string): Promise<boolean> {
  try {
    const isEnabled = localStorage.getItem(ENCRYPTION_ENABLED_KEY);
    
    // Le chiffrement est maintenant OBLIGATOIRE - toujours activé
    if (isEnabled !== 'true') {
      console.log('🔐 Activation obligatoire du chiffrement AES-256');
      await enablePersistentEncryption(); // Force l'activation
      return true; // Retourner true car l'activation a réussi
    }
    
    // Tenter de récupérer le mot de passe stocké
    const storedEncryptedPassword = localStorage.getItem(MASTER_PASSWORD_KEY);
    const derivationKey = localStorage.getItem('nc_derivation_key');
    
    if (storedEncryptedPassword && storedEncryptedPassword.startsWith(PERSISTENT_ENCRYPTED_PREFIX) && derivationKey) {
      // Mot de passe généré automatiquement stocké
      try {
        const encryptedBlob = JSON.parse(storedEncryptedPassword.slice(PERSISTENT_ENCRYPTED_PREFIX.length));
        const recoveredPassword = await decrypt(encryptedBlob, derivationKey);
        masterPassword = recoveredPassword;
        persistentEncryptionEnabled = true;
        
        console.log('🔐 Chiffrement persistant récupéré automatiquement');
        return true;
      } catch (error) {
        console.warn('Impossible de récupérer le mot de passe automatique:', error);
        // Nettoyer les données corrompues
        localStorage.removeItem(MASTER_PASSWORD_KEY);
        localStorage.removeItem('nc_derivation_key');
      }
    }
    
    // Si mot de passe utilisateur fourni
    if (userPassword) {
      masterPassword = userPassword;
      persistentEncryptionEnabled = true;
      console.log('🔐 Chiffrement persistant activé avec mot de passe utilisateur');
      return true;
    }
    
    // Demander le mot de passe à l'utilisateur
    console.log('🔐 Chiffrement persistant détecté - Mot de passe requis');
    return false;
  } catch (error) {
    console.error('Erreur initialisation chiffrement persistant:', error);
    return false;
  }
}

// ========================================================================================
// FONCTIONS DE STOCKAGE CHIFFRÉ PERSISTANT
// ========================================================================================

/**
 * Sauvegarde des données avec chiffrement persistant
 * @param key - Clé de stockage
 * @param data - Données à chiffrer et sauvegarder
 */
export async function savePersistentEncrypted(key: string, data: any): Promise<void> {
  if (!persistentEncryptionEnabled || !masterPassword) {
    // Mode normal : stockage direct
    localStorage.setItem(key, JSON.stringify(data));
    persistentCache.set(key, data);
    return;
  }
  
  try {
    const plaintext = JSON.stringify(data);
    const encryptedBlob = await encrypt(plaintext, masterPassword);
    const encryptedData = PERSISTENT_ENCRYPTED_PREFIX + JSON.stringify(encryptedBlob);
    
    localStorage.setItem(key, encryptedData);
    persistentCache.set(key, data);
    
    console.log(`🔐 Données chiffrées sauvegardées: ${key}`);
  } catch (error) {
    console.error('Erreur sauvegarde chiffrée:', error);
    throw new Error(`Échec de la sauvegarde chiffrée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Chargement des données avec déchiffrement persistant
 * @param key - Clé de stockage
 * @returns Données déchiffrées ou null
 */
export async function loadPersistentEncrypted(key: string): Promise<any> {
  // Vérifier le cache d'abord
  if (persistentCache.has(key)) {
    return persistentCache.get(key);
  }
  
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
      return null;
    }
    
    // Vérifier si les données sont chiffrées
    if (!rawData.startsWith(PERSISTENT_ENCRYPTED_PREFIX)) {
      // Données non chiffrées : parsing normal
      const data = JSON.parse(rawData);
      persistentCache.set(key, data);
      return data;
    }
    
    // Données chiffrées : déchiffrement requis
    if (!persistentEncryptionEnabled || !masterPassword) {
      console.warn(`⚠️ Données chiffrées détectées mais chiffrement non activé: ${key}`);
      return null;
    }
    
    const encryptedDataStr = rawData.slice(PERSISTENT_ENCRYPTED_PREFIX.length);
    const encryptedBlob = JSON.parse(encryptedDataStr);
    
    if (!validateEncryptedBlob(encryptedBlob)) {
      console.warn(`⚠️ Blob chiffré invalide: ${key}`);
      return null;
    }
    
    const decryptedData = await decrypt(encryptedBlob, masterPassword);
    const data = JSON.parse(decryptedData);
    
    persistentCache.set(key, data);
    console.log(`🔓 Données déchiffrées chargées: ${key}`);
    return data;
  } catch (error) {
    console.error(`Erreur chargement chiffré [${key}]:`, error);
    return null;
  }
}

/**
 * Supprime une clé chiffrée
 * @param key - Clé à supprimer
 */
export function removePersistentEncrypted(key: string): void {
  localStorage.removeItem(key);
  persistentCache.delete(key);
}

/**
 * Vide le cache de déchiffrement
 */
export function clearPersistentCache(): void {
  persistentCache.clear();
}

// ========================================================================================
// UTILITAIRES DE MIGRATION ET MAINTENANCE
// ========================================================================================

// ⚠️ FONCTIONS SUPPRIMÉES: Plus nécessaires avec le chiffrement permanent

/**
 * Obtient les statistiques du chiffrement persistant
 */
export function getPersistentEncryptionStats() {
  let encryptedKeysCount = 0;
  let totalDataSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        totalDataSize += value.length;
        if (value.startsWith(PERSISTENT_ENCRYPTED_PREFIX)) {
          encryptedKeysCount++;
        }
      }
    }
  }
  
  return {
    isEnabled: persistentEncryptionEnabled,
    encryptedKeys: encryptedKeysCount,
    cacheSize: persistentCache.size,
    totalDataSize: Math.round(totalDataSize / 1024), // KB
    hasPassword: masterPassword !== null,
  };
}

/**
 * Change le mot de passe de chiffrement
 * @param currentPassword - Mot de passe actuel
 * @param newPassword - Nouveau mot de passe
 */
export async function changePersistentPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!persistentEncryptionEnabled || currentPassword !== masterPassword) {
    throw new Error('Mot de passe actuel incorrect');
  }
  
  console.log('🔄 Changement de mot de passe de chiffrement...');
  
  // Récupérer toutes les données chiffrées
  const encryptedData = new Map<string, any>();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value && value.startsWith(PERSISTENT_ENCRYPTED_PREFIX)) {
        try {
          const data = await loadPersistentEncrypted(key);
          encryptedData.set(key, data);
        } catch (error) {
          console.error(`Erreur récupération ${key}:`, error);
        }
      }
    }
  }
  
  // Changer le mot de passe
  masterPassword = newPassword;
  
  // Re-chiffrer toutes les données avec le nouveau mot de passe
  for (const [key, data] of encryptedData.entries()) {
    await savePersistentEncrypted(key, data);
  }
  
  // Mettre à jour le mot de passe maître stocké
  const encryptedPassword = await encrypt(newPassword, newPassword + 'master_salt');
  localStorage.setItem(MASTER_PASSWORD_KEY, PERSISTENT_ENCRYPTED_PREFIX + JSON.stringify(encryptedPassword));
  
  console.log('✅ Mot de passe de chiffrement changé avec succès');
}

// ========================================================================================
// FONCTIONS DE DIAGNOSTIC
// ========================================================================================

/**
 * Diagnostique l'état du chiffrement persistant pour débogage
 */
export function diagnosePersistentEncryption(): {
  enabled: boolean;
  hasPassword: boolean;
  hasDerivationKey: boolean;
  hasEncryptedData: boolean;
  encryptedDataCount: number;
} {
  const enabled = localStorage.getItem(ENCRYPTION_ENABLED_KEY) === 'true';
  const hasPassword = !!localStorage.getItem(MASTER_PASSWORD_KEY);
  const hasDerivationKey = !!localStorage.getItem('nc_derivation_key');
  
  const encryptedKeys = Object.keys(localStorage).filter(key => 
    localStorage.getItem(key)?.startsWith('NEUROCHT_PERSIST_')
  );
  
  const diagnosis = {
    enabled,
    hasPassword,
    hasDerivationKey,
    hasEncryptedData: encryptedKeys.length > 0,
    encryptedDataCount: encryptedKeys.length
  };
  
  console.log('🔍 Diagnostic chiffrement persistant:', diagnosis);
  console.log('🔍 Clés chiffrées trouvées:', encryptedKeys);
  
  return diagnosis;
}

/**
 * Force l'activation du chiffrement (pour débogage)
 */
export async function forceEnablePersistentEncryption(): Promise<boolean> {
  console.log('🔧 Activation forcée du chiffrement AES-256...');
  try {
    const result = await enablePersistentEncryption();
    // result est une string (le mot de passe), pas un boolean
    if (result && result.length > 0) {
      console.log('✅ Chiffrement forcé activé avec succès');
      return true;
    } else {
      console.error('❌ Échec de l\'activation forcée');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'activation forcée:', error);
    return false;
  }
}

// ========================================================================================
// EXPORT PAR DÉFAUT
// ========================================================================================

export default {
  isPersistentEncryptionEnabled,
  enablePersistentEncryption,
  // disablePersistentEncryption, // SUPPRIMÉ - Chiffrement permanent
  initializePersistentEncryption,
  savePersistentEncrypted,
  loadPersistentEncrypted,
  removePersistentEncrypted,
  clearPersistentCache,
  getPersistentEncryptionStats,
  changePersistentPassword,
};
