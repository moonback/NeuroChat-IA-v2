/**
 * ☁️ Service de Synchronisation Cloud - NeuroChat
 * 
 * Gère la synchronisation des conversations avec le backend
 * - Authentification JWT
 * - Synchronisation bidirectionnelle
 * - Gestion des conflits
 * - Cache local intelligent
 */

// ========================================================================================
// TYPES ET INTERFACES
// ========================================================================================

export interface CloudUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string;
  preferences: Record<string, any>;
}

export interface CloudConversation {
  id: number;
  title: string;
  workspace_id: string;
  child_mode: boolean;
  private_mode: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
  tags: string[];
  metadata: Record<string, any>;
  last_message?: string;
}

export interface CloudMessage {
  id: number;
  conversation_id: number;
  content: string;
  is_user: boolean;
  timestamp: string;
  message_order: number;
  metadata: Record<string, any>;
}

export interface CloudAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: CloudUser;
    expiresAt: string;
  };
}

export interface CloudConversationsResponse {
  success: boolean;
  data: {
    conversations: CloudConversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CloudConversationResponse {
  success: boolean;
  data: CloudConversation & {
    messages: CloudMessage[];
  };
}

// ========================================================================================
// CONFIGURATION
// ========================================================================================

const API_BASE_URL = import.meta.env.VITE_CLOUD_API_URL || 'http://localhost:3001/api';
const SYNC_INTERVAL = 30000; // 30 secondes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// ========================================================================================
// GESTIONNAIRE D'AUTHENTIFICATION
// ========================================================================================

class CloudAuthManager {
  private token: string | null = null;
  private user: CloudUser | null = null;
  private tokenExpiry: Date | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    if (!this.token || !this.user || !this.tokenExpiry) {
      return false;
    }
    
    // Vérifier si le token n'est pas expiré (avec marge de 5 minutes)
    const now = new Date();
    const expiryWithMargin = new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000);
    
    return now < expiryWithMargin;
  }

  /**
   * Récupère le token d'authentification
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Récupère les informations utilisateur
   */
  getUser(): CloudUser | null {
    return this.user;
  }

  /**
   * Connexion utilisateur
   */
  async login(username: string, password: string): Promise<CloudAuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const data: CloudAuthResponse = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        this.tokenExpiry = new Date(data.data.expiresAt);
        
        // Programmer le renouvellement automatique du token
        this.scheduleTokenRefresh();
        
        // Sauvegarder en localStorage
        this.saveToLocalStorage();
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(username: string, email: string, password: string, confirmPassword: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur d\'inscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Renouveler le token automatiquement
   */
  private async refreshToken(): Promise<void> {
    try {
      if (!this.token) return;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.token = data.data.token;
          this.tokenExpiry = new Date(data.data.expiresAt);
          this.saveToLocalStorage();
          this.scheduleTokenRefresh();
        }
      }
    } catch (error) {
      console.error('Erreur lors du renouvellement du token:', error);
      // En cas d'échec, déconnecter l'utilisateur
      this.clearAuth();
    }
  }

  /**
   * Programmer le renouvellement automatique du token
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (this.tokenExpiry) {
      const now = new Date();
      const timeUntilRefresh = this.tokenExpiry.getTime() - now.getTime() - 5 * 60 * 1000; // 5 minutes avant expiration
      
      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, timeUntilRefresh);
      }
    }
  }

  /**
   * Sauvegarder l'authentification en localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('neurochat_cloud_auth', JSON.stringify({
        token: this.token,
        user: this.user,
        tokenExpiry: this.tokenExpiry?.toISOString(),
      }));
    } catch (error) {
      console.error('Erreur sauvegarde auth localStorage:', error);
    }
  }

  /**
   * Restaurer l'authentification depuis localStorage
   */
  restoreFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem('neurochat_cloud_auth');
      if (!saved) return false;

      const authData = JSON.parse(saved);
      this.token = authData.token;
      this.user = authData.user;
      this.tokenExpiry = authData.tokenExpiry ? new Date(authData.tokenExpiry) : null;

      if (this.isAuthenticated()) {
        this.scheduleTokenRefresh();
        return true;
      } else {
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Erreur restauration auth localStorage:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Effacer toutes les données d'authentification
   */
  private clearAuth(): void {
    this.token = null;
    this.user = null;
    this.tokenExpiry = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    localStorage.removeItem('neurochat_cloud_auth');
  }
}

// ========================================================================================
// SERVICE DE SYNCHRONISATION CLOUD
// ========================================================================================

class CloudSyncService {
  private authManager: CloudAuthManager;
  private syncInProgress: boolean = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.authManager = new CloudAuthManager();
    
    // Restaurer l'authentification au démarrage
    this.authManager.restoreFromLocalStorage();
    
    // Démarrer la synchronisation automatique
    this.startAutoSync();
  }

  /**
   * Récupérer le gestionnaire d'authentification
   */
  getAuthManager(): CloudAuthManager {
    return this.authManager;
  }

  /**
   * Vérifier si la synchronisation est disponible
   */
  isAvailable(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Récupérer les conversations depuis le cloud
   */
  async getConversations(params: {
    page?: number;
    limit?: number;
    workspace_id?: string;
    search?: string;
    tags?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<CloudConversationsResponse> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations?${queryParams.toString()}`,
      'GET'
    );

    return response;
  }

  /**
   * Récupérer une conversation spécifique
   */
  async getConversation(id: number): Promise<CloudConversationResponse> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations/${id}`,
      'GET'
    );

    return response;
  }

  /**
   * Créer une nouvelle conversation
   */
  async createConversation(data: {
    title: string;
    workspace_id?: string;
    child_mode?: boolean;
    private_mode?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
    initial_messages?: Array<{ content: string; is_user: boolean; metadata?: Record<string, any> }>;
  }): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations`,
      'POST',
      data
    );

    return response;
  }

  /**
   * Mettre à jour une conversation
   */
  async updateConversation(id: number, data: Partial<CloudConversation>): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations/${id}`,
      'PUT',
      data
    );

    return response;
  }

  /**
   * Supprimer une conversation
   */
  async deleteConversation(id: number): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations/${id}`,
      'DELETE'
    );

    return response;
  }

  /**
   * Ajouter un message à une conversation
   */
  async addMessage(conversationId: number, data: {
    content: string;
    is_user: boolean;
    metadata?: Record<string, any>;
  }): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      'POST',
      data
    );

    return response;
  }

  /**
   * Recherche sémantique dans les conversations
   */
  async searchConversations(query: string, limit: number = 10): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations/search/semantic?query=${encodeURIComponent(query)}&limit=${limit}`,
      'GET'
    );

    return response;
  }

  /**
   * Récupérer les statistiques des conversations
   */
  async getConversationStats(): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await this.makeAuthenticatedRequest(
      `${API_BASE_URL}/conversations/stats/summary`,
      'GET'
    );

    return response;
  }

  /**
   * Synchroniser les conversations locales avec le cloud
   */
  async syncConversations(localConversations: any[]): Promise<void> {
    if (!this.isAvailable() || this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('🔄 Début de la synchronisation cloud...');

      // Récupérer les conversations du cloud
      const cloudResponse = await this.getConversations({ limit: 1000 });
      const cloudConversations = cloudResponse.data.conversations;

      // TODO: Implémenter la logique de synchronisation bidirectionnelle
      // - Comparer les timestamps
      // - Résoudre les conflits
      // - Mettre à jour les conversations locales
      // - Envoyer les nouvelles conversations locales

      this.lastSyncTime = new Date();
      console.log('✅ Synchronisation cloud terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation cloud:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Démarrer la synchronisation automatique
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isAvailable()) {
        // TODO: Implémenter la synchronisation automatique
        // this.syncConversations(localConversations);
      }
    }, SYNC_INTERVAL);
  }

  /**
   * Arrêter la synchronisation automatique
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Effectuer une requête authentifiée avec retry
   */
  private async makeAuthenticatedRequest(
    url: string,
    method: string,
    body?: any,
    retryCount: number = 0
  ): Promise<any> {
    try {
      const token = this.authManager.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (response.status === 401) {
        // Token expiré, essayer de le renouveler
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.makeAuthenticatedRequest(url, method, body, retryCount + 1);
        } else {
          // Trop de tentatives, déconnecter l'utilisateur
          await this.authManager.logout();
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur requête cloud [${method} ${url}]:`, error);
      throw error;
    }
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    this.stopAutoSync();
    this.authManager.logout();
  }
}

// ========================================================================================
// EXPORT DU SERVICE
// ========================================================================================

// Instance singleton du service
const cloudSyncService = new CloudSyncService();

export default cloudSyncService;
export { CloudAuthManager, CloudSyncService };
export type {
  CloudUser,
  CloudConversation,
  CloudMessage,
  CloudAuthResponse,
  CloudConversationsResponse,
  CloudConversationResponse,
};
