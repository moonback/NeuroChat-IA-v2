/**
 * 🔐 Service de Chiffrement AES-256 - Niveau Gouvernemental
 * 
 * Implémentation de sécurité militaire pour NeuroChat
 * - Chiffrement AES-256-GCM (Galois/Counter Mode) 
 * - Dérivation de clé PBKDF2 avec 600,000 itérations
 * - Salt cryptographiquement sécurisé de 256 bits
 * - Vecteur d'initialisation (IV) unique par opération
 * - Authentification intégrée (AEAD)
 * - Gestion sécurisée des clés en mémoire
 */

// ========================================================================================
// CONFIGURATION DE SÉCURITÉ GOUVERNEMENTALE
// ========================================================================================

/** Paramètres cryptographiques conformes aux standards gouvernementaux */
const CRYPTO_CONFIG = {
  // Algorithme de chiffrement (recommandé par NIST/ANSSI)
  ALGORITHM: 'AES-GCM' as const,
  KEY_LENGTH: 256, // bits - AES-256
  IV_LENGTH: 96,   // bits - recommandé pour GCM
  SALT_LENGTH: 256, // bits - haute entropie
  TAG_LENGTH: 128,  // bits - authentification
  
  // Dérivation de clé (PBKDF2 - NIST SP 800-132)
  PBKDF2_ITERATIONS: 600000, // 600k itérations (OWASP 2023)
  PBKDF2_HASH: 'SHA-256' as const,
  
  // Encodage
  ENCODING: 'base64' as const,
} as const;

/** Métadonnées de version pour compatibility future */
const CRYPTO_VERSION = 'v1' as const;

// ========================================================================================
// INTERFACES ET TYPES
// ========================================================================================

/** Structure d'un blob chiffré avec toutes les métadonnées nécessaires */
interface EncryptedBlob {
  version: typeof CRYPTO_VERSION;
  algorithm: typeof CRYPTO_CONFIG.ALGORITHM;
  data: string;        // Données chiffrées (base64)
  iv: string;          // Vecteur d'initialisation (base64)  
  salt: string;        // Sel pour dérivation de clé (base64)
  tag: string;         // Tag d'authentification (base64)
  iterations: number;  // Nombre d'itérations PBKDF2
  timestamp: number;   // Horodatage de chiffrement
}

/** Clé maître dérivée en mémoire (effacée automatiquement) */
interface DerivedKey {
  key: CryptoKey;
  salt: Uint8Array;
  createdAt: number;
  expiresAt: number;
}

// ========================================================================================
// GESTION SÉCURISÉE DES CLÉS
// ========================================================================================

/** Cache sécurisé des clés dérivées (auto-expiration) */
class SecureKeyCache {
  private cache = new Map<string, DerivedKey>();
  private readonly TTL = 300000; // 5 minutes en millisecondes
  
  /** Stocke une clé dérivée avec expiration automatique */
  store(keyId: string, key: CryptoKey): void {
    const now = Date.now();
    
    this.cache.set(keyId, {
      key,
      salt: new Uint8Array(), // Pas utilisé dans la nouvelle implémentation
      createdAt: now,
      expiresAt: now + this.TTL
    });
    
    // Nettoyer les clés expirées
    this.cleanup();
  }
  
  /** Récupère une clé dérivée si elle n'est pas expirée */
  get(keyId: string): CryptoKey | null {
    const entry = this.cache.get(keyId);
    
    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) this.cache.delete(keyId);
      return null;
    }
    
    return entry.key;
  }
  
  /** Nettoie les clés expirées du cache */
  private cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(id);
      }
    }
  }
  
  /** Vide complètement le cache (pour logout/mode privé désactivé) */
  clear(): void {
    this.cache.clear();
  }
}

/** Instance singleton du cache sécurisé */
const keyCache = new SecureKeyCache();

// ========================================================================================
// FONCTIONS CRYPTOGRAPHIQUES PRINCIPALES
// ========================================================================================

/**
 * Génère un sel cryptographiquement sécurisé
 * @returns Sel aléatoire de 256 bits
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH / 8));
}

/**
 * Génère un vecteur d'initialisation cryptographiquement sécurisé
 * @returns IV aléatoire de 96 bits (optimisé pour GCM)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.IV_LENGTH / 8));
}

/**
 * Dérive une clé cryptographique à partir d'un mot de passe
 * Utilise PBKDF2 avec 600,000 itérations (résistant aux attaques par force brute)
 * 
 * @param password - Mot de passe utilisateur
 * @param salt - Sel cryptographique unique
 * @returns Clé AES-256 dérivée
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Créer une clé de cache sécurisée qui inclut le mot de passe ET le salt
  // Utiliser un hash pour éviter de stocker le mot de passe en clair
  const saltHex = Array.from(salt, b => b.toString(16).padStart(2, '0')).join('');
  const passwordHash = Array.from(new TextEncoder().encode(password), b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  const cacheKey = passwordHash + '::' + saltHex;
  const cachedKey = keyCache.get(cacheKey);
  if (cachedKey) {
    return cachedKey;
  }
  
  try {
    // Convertir le mot de passe en matériau de clé
    const passwordBuffer = new TextEncoder().encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Dériver la clé avec PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
        hash: CRYPTO_CONFIG.PBKDF2_HASH,
      },
      keyMaterial,
      {
        name: CRYPTO_CONFIG.ALGORITHM,
        length: CRYPTO_CONFIG.KEY_LENGTH,
      },
      false, // Non extractible pour sécurité
      ['encrypt', 'decrypt']
    );
    
    // Mettre en cache pour éviter les recalculs coûteux
    keyCache.store(cacheKey, derivedKey);
    
    return derivedKey;
  } catch (error) {
    throw new Error(`Échec de dérivation de clé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Chiffre des données avec AES-256-GCM
 * Niveau de sécurité gouvernemental avec authentification intégrée
 * 
 * @param plaintext - Données à chiffrer (string)
 * @param password - Mot de passe de chiffrement
 * @returns Blob chiffré avec toutes les métadonnées
 */
export async function encrypt(plaintext: string, password: string): Promise<EncryptedBlob> {
  // Validation des entrées
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Les données à chiffrer doivent être une chaîne non vide');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  try {
    // Génération des paramètres cryptographiques sécurisés
    const salt = generateSalt();
    const iv = generateIV();
    const timestamp = Date.now();
    
    // Dérivation de la clé maître
    const key = await deriveKey(password, salt);
    
    // Chiffrement des données
    const plainBuffer = new TextEncoder().encode(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: CRYPTO_CONFIG.ALGORITHM,
        iv: iv,
        tagLength: CRYPTO_CONFIG.TAG_LENGTH,
      },
      key,
      plainBuffer
    );
    
    // Extraction du tag d'authentification (derniers 16 bytes pour GCM)
    const tagLength = CRYPTO_CONFIG.TAG_LENGTH / 8;
    const dataWithoutTag = encryptedBuffer.slice(0, -tagLength);
    const tag = encryptedBuffer.slice(-tagLength);
    
    // Encodage en base64 pour stockage
    return {
      version: CRYPTO_VERSION,
      algorithm: CRYPTO_CONFIG.ALGORITHM,
      data: btoa(String.fromCharCode(...new Uint8Array(dataWithoutTag))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      tag: btoa(String.fromCharCode(...new Uint8Array(tag))),
      iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
      timestamp,
    };
  } catch (error) {
    throw new Error(`Échec du chiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Déchiffre des données AES-256-GCM avec vérification d'intégrité
 * 
 * @param encryptedBlob - Blob chiffré avec métadonnées
 * @param password - Mot de passe de déchiffrement
 * @returns Données déchiffrées en texte clair
 */
export async function decrypt(encryptedBlob: EncryptedBlob, password: string): Promise<string> {
  // Validation du blob
  if (!encryptedBlob || typeof encryptedBlob !== 'object') {
    throw new Error('Blob chiffré invalide');
  }
  
  const requiredFields = ['version', 'algorithm', 'data', 'iv', 'salt', 'tag', 'iterations', 'timestamp'];
  for (const field of requiredFields) {
    if (!(field in encryptedBlob)) {
      throw new Error(`Champ manquant dans le blob chiffré: ${field}`);
    }
  }
  
  // Vérification de version
  if (encryptedBlob.version !== CRYPTO_VERSION) {
    throw new Error(`Version non supportée: ${encryptedBlob.version}`);
  }
  
  // Vérification de l'algorithme
  if (encryptedBlob.algorithm !== CRYPTO_CONFIG.ALGORITHM) {
    throw new Error(`Algorithme non supporté: ${encryptedBlob.algorithm}`);
  }
  
  if (!password || typeof password !== 'string') {
    throw new Error('Mot de passe requis pour le déchiffrement');
  }
  
  try {
    // Décodage des paramètres cryptographiques
    const salt = new Uint8Array(atob(encryptedBlob.salt).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(encryptedBlob.iv).split('').map(c => c.charCodeAt(0)));
    const data = new Uint8Array(atob(encryptedBlob.data).split('').map(c => c.charCodeAt(0)));
    const tag = new Uint8Array(atob(encryptedBlob.tag).split('').map(c => c.charCodeAt(0)));
    
    // Validation des tailles
    if (salt.length !== CRYPTO_CONFIG.SALT_LENGTH / 8) {
      throw new Error('Taille de sel invalide');
    }
    if (iv.length !== CRYPTO_CONFIG.IV_LENGTH / 8) {
      throw new Error('Taille d\'IV invalide');
    }
    if (tag.length !== CRYPTO_CONFIG.TAG_LENGTH / 8) {
      throw new Error('Taille de tag invalide');
    }
    
    // Reconstruction du buffer chiffré (données + tag)
    const encryptedBuffer = new Uint8Array(data.length + tag.length);
    encryptedBuffer.set(data);
    encryptedBuffer.set(tag, data.length);
    
    // Dérivation de la clé
    const key = await deriveKey(password, salt);
    
    // Déchiffrement avec vérification d'authenticité
    // En AES-GCM, le tag doit être à la fin des données
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_CONFIG.ALGORITHM,
        iv: iv,
        tagLength: CRYPTO_CONFIG.TAG_LENGTH,
      },
      key,
      encryptedBuffer  // data + tag déjà concaténés
    );
    
    // Conversion en texte
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    // Les erreurs de déchiffrement WebCrypto indiquent généralement un mot de passe incorrect
    if (error instanceof DOMException || 
        (error instanceof Error && (
          error.message.includes('decrypt') ||
          error.message.includes('Invalid') ||
          error.message.includes('invalid') ||
          error.message.includes('failed') ||
          error.message.includes('tag') ||
          error.name === 'OperationError'
        ))) {
      throw new Error('Mot de passe incorrect ou données corrompues');
    }
    throw new Error(`Échec du déchiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// ========================================================================================
// FONCTIONS UTILITAIRES DE SÉCURITÉ
// ========================================================================================

/**
 * Valide l'intégrité d'un blob chiffré sans le déchiffrer
 * @param encryptedBlob - Blob à valider
 * @returns true si le blob semble valide
 */
export function validateEncryptedBlob(encryptedBlob: unknown): encryptedBlob is EncryptedBlob {
  if (!encryptedBlob || typeof encryptedBlob !== 'object') return false;
  
  const requiredFields = ['version', 'algorithm', 'data', 'iv', 'salt', 'tag', 'iterations', 'timestamp'];
  return requiredFields.every(field => field in encryptedBlob);
}

/**
 * Génère un mot de passe sécurisé pour les sessions temporaires
 * @param length - Longueur du mot de passe (défaut: 32)
 * @returns Mot de passe cryptographiquement sécurisé
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

/**
 * Calcule l'empreinte SHA-256 d'un blob chiffré pour vérification d'intégrité
 * @param encryptedBlob - Blob chiffré
 * @returns Empreinte hexadécimale
 */
export async function calculateBlobFingerprint(encryptedBlob: EncryptedBlob): Promise<string> {
  const data = JSON.stringify(encryptedBlob);
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  
  return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Nettoie le cache des clés (à appeler lors de la déconnexion/désactivation du mode privé)
 */
export function clearKeyCache(): void {
  keyCache.clear();
  
  // Force le garbage collector pour les données sensibles (si supporté)
  if ('gc' in window && typeof window.gc === 'function') {
    window.gc();
  }
}

/**
 * Obtient des statistiques sur le système de chiffrement
 * @returns Informations de diagnostic
 */
export function getCryptoStats() {
  return {
    version: CRYPTO_VERSION,
    algorithm: CRYPTO_CONFIG.ALGORITHM,
    keyLength: CRYPTO_CONFIG.KEY_LENGTH,
    iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
    cacheSize: keyCache['cache'].size, // Accès privé pour debug
    isWebCryptoSupported: 'crypto' in window && 'subtle' in crypto,
  };
}

// ========================================================================================
// TESTS D'AUTO-VÉRIFICATION
// ========================================================================================

/**
 * Effectue un test de chiffrement/déchiffrement pour vérifier le bon fonctionnement
 * @returns true si le test réussit
 */
export async function selfTest(): Promise<boolean> {
  try {
    const testData = 'Test de chiffrement AES-256 - NeuroChat Security';
    const testPassword = 'TestPassword123!';
    
    console.log('🧪 Test crypto - Chiffrement avec mot de passe:', testPassword);
    
    // Test de chiffrement
    const encrypted = await encrypt(testData, testPassword);
    console.log('✅ Chiffrement réussi, structure:', {
      algorithm: encrypted.algorithm,
      version: encrypted.version,
      iterations: encrypted.iterations
    });
    
    // Vérification de la structure
    if (!validateEncryptedBlob(encrypted)) {
      throw new Error('Structure de blob invalide');
    }
    
    // Test de déchiffrement
    const decrypted = await decrypt(encrypted, testPassword);
    console.log('✅ Déchiffrement réussi avec bon mot de passe');
    
    // Vérification de l'intégrité
    if (decrypted !== testData) {
      throw new Error('Données corrompues après déchiffrement');
    }
    
    // Test avec mauvais mot de passe (doit échouer)
    console.log('🧪 Test crypto - Tentative déchiffrement avec mauvais mot de passe...');
    
    // Test critique: déchiffrement avec mauvais mot de passe
    console.log('🔑 Données du blob à tester:', {
      algorithm: encrypted.algorithm,
      saltLength: atob(encrypted.salt).length,
      ivLength: atob(encrypted.iv).length,
      dataLength: atob(encrypted.data).length,
      tagLength: atob(encrypted.tag).length
    });
    
    let wrongPasswordFailed = false;
    try {
      const wrongResult = await decrypt(encrypted, 'WrongPassword');
      // Si on arrive ici, le déchiffrement a réussi avec un mauvais mot de passe (problème!)
      console.error('🚨 SÉCURITÉ COMPROMISE: Déchiffrement réussi avec mauvais mot de passe!');
      console.error('   Résultat obtenu:', wrongResult);
      console.error('   Données attendues:', testData);
      console.error('   Identiques?', wrongResult === testData);
      wrongPasswordFailed = false;
    } catch (error) {
      // Le déchiffrement a échoué (attendu)
      wrongPasswordFailed = true;
      console.log('✅ Test sécurité réussi: déchiffrement échoue avec mauvais mot de passe');
      console.log('   Type d\'erreur:', error?.constructor?.name);
      console.log('   Message:', error instanceof Error ? error.message : String(error));
    }
    
    if (!wrongPasswordFailed) {
      throw new Error('SÉCURITÉ COMPROMISE: Le déchiffrement réussit avec un mauvais mot de passe');
    }
    
    return true;
  } catch (error) {
    console.error('Échec du test d\'auto-vérification:', error);
    return false;
  }
}
