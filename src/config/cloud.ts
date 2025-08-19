/**
 * ☁️ Configuration Cloud - NeuroChat
 * 
 * Configuration centralisée pour le service de synchronisation cloud
 */

// ========================================================================================
// CONFIGURATION DE L'ENVIRONNEMENT
// ========================================================================================

export const CLOUD_CONFIG = {
  // URL de l'API backend
  API_BASE_URL: import.meta.env.VITE_CLOUD_API_URL || 'http://localhost:3001/api',
  
  // Intervalle de synchronisation automatique (en millisecondes)
  SYNC_INTERVAL: 30000, // 30 secondes
  
  // Nombre maximum de tentatives de reconnexion
  MAX_RETRIES: 3,
  
  // Délai entre les tentatives (en millisecondes)
  RETRY_DELAY: 1000, // 1 seconde
  
  // Taille maximale des fichiers uploadés (en bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  
  // Nombre maximum de conversations à synchroniser en une fois
  MAX_SYNC_BATCH_SIZE: 100,
  
  // Timeout des requêtes API (en millisecondes)
  REQUEST_TIMEOUT: 30000, // 30 secondes
  
  // Activation de la synchronisation automatique
  AUTO_SYNC_ENABLED: true,
  
  // Activation de la synchronisation en arrière-plan
  BACKGROUND_SYNC_ENABLED: true,
  
  // Activation de la compression des données
  COMPRESSION_ENABLED: true,
  
  // Activation du cache local
  LOCAL_CACHE_ENABLED: true,
  
  // Taille maximale du cache local (en MB)
  MAX_CACHE_SIZE: 100, // 100 MB
  
  // Durée de vie du cache (en heures)
  CACHE_TTL: 24, // 24 heures
} as const;

// ========================================================================================
// CONFIGURATION DES ENDPOINTS
// ========================================================================================

export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  
  // Conversations
  CONVERSATIONS: {
    LIST: '/conversations',
    GET: (id: number) => `/conversations/${id}`,
    CREATE: '/conversations',
    UPDATE: (id: number) => `/conversations/${id}`,
    DELETE: (id: number) => `/conversations/${id}`,
    MESSAGES: (id: number) => `/conversations/${id}/messages`,
    SEARCH: '/conversations/search/semantic',
    STATS: '/conversations/stats/summary',
  },
  
  // Santé du serveur
  HEALTH: '/health',
} as const;

// ========================================================================================
// CONFIGURATION DE SÉCURITÉ
// ========================================================================================

export const SECURITY_CONFIG = {
  // Durée de vie du token JWT (en secondes)
  JWT_EXPIRY: 7 * 24 * 60 * 60, // 7 jours
  
  // Marge de sécurité pour le renouvellement du token (en minutes)
  TOKEN_REFRESH_MARGIN: 5, // 5 minutes
  
  // Clés de stockage local
  STORAGE_KEYS: {
    AUTH: 'neurochat_cloud_auth',
    CACHE: 'neurochat_cloud_cache',
    SETTINGS: 'neurochat_cloud_settings',
  },
  
  // Validation des mots de passe
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL: false,
  },
  
  // Validation des noms d'utilisateur
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/,
  },
} as const;

// ========================================================================================
// CONFIGURATION DES MESSAGES D'ERREUR
// ========================================================================================

export const ERROR_MESSAGES = {
  // Authentification
  AUTH: {
    INVALID_CREDENTIALS: 'Identifiants invalides',
    TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',
    TOKEN_INVALID: 'Token d\'authentification invalide',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
    ACCOUNT_DISABLED: 'Compte désactivé',
    SESSION_EXPIRED: 'Session expirée',
  },
  
  // Réseau
  NETWORK: {
    CONNECTION_FAILED: 'Impossible de se connecter au serveur',
    TIMEOUT: 'La requête a pris trop de temps',
    SERVER_ERROR: 'Erreur interne du serveur',
    RATE_LIMITED: 'Trop de requêtes, veuillez patienter',
  },
  
  // Validation
  VALIDATION: {
    MISSING_FIELDS: 'Tous les champs sont requis',
    INVALID_EMAIL: 'Format d\'email invalide',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    USERNAME_TOO_SHORT: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
    USERNAME_TOO_LONG: 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
    USERNAME_INVALID: 'Le nom d\'utilisateur contient des caractères non autorisés',
  },
  
  // Synchronisation
  SYNC: {
    FAILED: 'Échec de la synchronisation',
    PARTIAL: 'Synchronisation partielle réussie',
    CONFLICT: 'Conflit de synchronisation détecté',
    OFFLINE: 'Mode hors ligne, synchronisation différée',
  },
} as const;

// ========================================================================================
// CONFIGURATION DES NOTIFICATIONS
// ========================================================================================

export const NOTIFICATION_CONFIG = {
  // Durée d'affichage des notifications (en millisecondes)
  DURATION: 5000, // 5 secondes
  
  // Types de notifications
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  
  // Messages de succès
  SUCCESS: {
    LOGIN: 'Connexion réussie',
    REGISTER: 'Compte créé avec succès',
    LOGOUT: 'Déconnexion réussie',
    SYNC: 'Synchronisation réussie',
    UPLOAD: 'Fichier uploadé avec succès',
    DOWNLOAD: 'Fichier téléchargé avec succès',
  },
  
  // Messages d'erreur
  ERROR: {
    LOGIN: 'Erreur de connexion',
    REGISTER: 'Erreur d\'inscription',
    LOGOUT: 'Erreur de déconnexion',
    SYNC: 'Erreur de synchronisation',
    UPLOAD: 'Erreur lors de l\'upload',
    DOWNLOAD: 'Erreur lors du téléchargement',
  },
} as const;

// ========================================================================================
// EXPORT DE LA CONFIGURATION
// ========================================================================================

export default {
  CLOUD_CONFIG,
  API_ENDPOINTS,
  SECURITY_CONFIG,
  ERROR_MESSAGES,
  NOTIFICATION_CONFIG,
};
