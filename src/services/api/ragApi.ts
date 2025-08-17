import { z } from 'zod';

// Types pour l'API RAG
export interface ApiRagDocument {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'docx' | 'csv' | 'json' | 'other';
  size: number;
  embedding?: number[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

export interface ApiDocumentStats {
  documentId: string;
  workspaceId: string;
  usageCount: number;
  lastUsedAt: Date;
  averageRelevanceScore: number;
  totalQueries: number;
}

export interface CreateRagDocumentDto {
  workspaceId: string;
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'docx' | 'csv' | 'json' | 'other';
  size: number;
  metadata?: Record<string, any>;
}

export interface UpdateRagDocumentDto {
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  isFavorite?: boolean;
}

export interface RagSearchOptions {
  query?: string;
  embedding?: number[];
  limit?: number;
  threshold?: number;
  includeEmbeddings?: boolean;
  types?: string[];
  favoritesOnly?: boolean;
}

export interface RagSearchResult {
  document: ApiRagDocument;
  similarity?: number;
  relevanceScore?: number;
  matchedChunks?: {
    content: string;
    startIndex: number;
    endIndex: number;
    score: number;
  }[];
}

export interface DocumentUploadResult {
  document: ApiRagDocument;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  chunks?: number;
  errors?: string[];
}

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utilitaire pour les appels API
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new ApiError(
      errorData.error || `Erreur HTTP ${response.status}`,
      response.status,
      errorData.details
    );
  }
  
  return response.json();
}

/**
 * Service pour gérer les documents RAG via l'API
 * Remplace les appels localStorage de RagSidebar.tsx et RagDocsModal.tsx
 */
export class RagApiService {
  private cache = new Map<string, { data: ApiRagDocument[]; timestamp: number }>();
  private statsCache = new Map<string, { data: ApiDocumentStats[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 secondes
  
  /**
   * Récupère tous les documents RAG d'un workspace
   * Remplace: localStorage.getItem('rag_user_docs')
   */
  async getRagDocuments(
    workspaceId: string,
    options: { 
      useCache?: boolean; 
      limit?: number; 
      offset?: number;
      favoritesOnly?: boolean;
      types?: string[];
    } = {}
  ): Promise<{ documents: ApiRagDocument[]; total: number }> {
    const { useCache = true, limit, offset, favoritesOnly, types } = options;
    const cacheKey = `rag:${workspaceId}`;
    
    // Vérifier le cache si activé et pas de filtres
    if (useCache && !favoritesOnly && !types?.length) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        let documents = cached.data;
        
        // Appliquer pagination sur le cache
        if (offset !== undefined) {
          documents = documents.slice(offset);
        }
        if (limit !== undefined) {
          documents = documents.slice(0, limit);
        }
        
        return { documents, total: cached.data.length };
      }
    }
    
    // Construire les paramètres de requête
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    if (favoritesOnly) params.set('favoritesOnly', 'true');
    if (types?.length) params.set('types', types.join(','));
    
    const queryString = params.toString();
    const endpoint = `/rag/${workspaceId}${queryString ? `?${queryString}` : ''}`;
    
    const result = await apiCall<{ documents: any[]; total: number }>(endpoint);
    
    // Transformer les dates
    const documents = result.documents.map(doc => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));
    
    // Mettre à jour le cache si pas de filtres
    if (useCache && !limit && !offset && !favoritesOnly && !types?.length) {
      this.cache.set(cacheKey, {
        data: documents,
        timestamp: Date.now(),
      });
    }
    
    return { documents, total: result.total };
  }
  
  /**
   * Récupère un document RAG par ID
   */
  async getRagDocument(documentId: string): Promise<ApiRagDocument> {
    const result = await apiCall<any>(`/rag/document/${documentId}`);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Upload et traite un nouveau document RAG
   * Remplace: ajout manuel à l'array localStorage
   */
  async uploadDocument(
    file: File,
    workspaceId: string,
    metadata?: Record<string, any>
  ): Promise<DocumentUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspaceId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await fetch(`${API_BASE_URL}/rag/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur upload' }));
      throw new ApiError(
        errorData.error || `Erreur HTTP ${response.status}`,
        response.status,
        errorData.details
      );
    }
    
    const result = await response.json();
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
    
    return {
      ...result,
      document: {
        ...result.document,
        createdAt: new Date(result.document.createdAt),
        updatedAt: new Date(result.document.updatedAt),
      },
    };
  }
  
  /**
   * Crée un document RAG à partir de texte
   * Remplace: ajout manuel à l'array localStorage
   */
  async createDocument(data: CreateRagDocumentDto): Promise<ApiRagDocument> {
    const result = await apiCall<any>('/rag', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache
    this.invalidateCache(data.workspaceId);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Met à jour un document RAG
   * Remplace: modification manuelle de l'array localStorage
   */
  async updateDocument(
    documentId: string,
    data: UpdateRagDocumentDto
  ): Promise<ApiRagDocument> {
    const result = await apiCall<any>(`/rag/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache
    this.cache.clear();
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Supprime un document RAG
   * Remplace: suppression manuelle de l'array localStorage
   */
  async deleteDocument(documentId: string): Promise<void> {
    await apiCall(`/rag/${documentId}`, {
      method: 'DELETE',
    });
    
    // Invalider le cache
    this.cache.clear();
    this.statsCache.clear();
  }
  
  /**
   * Bascule le statut favori d'un document
   * Remplace: localStorage.getItem/setItem('rag_doc_favorites')
   */
  async toggleFavorite(documentId: string): Promise<ApiRagDocument> {
    const result = await apiCall<any>(`/rag/${documentId}/favorite`, {
      method: 'POST',
    });
    
    // Invalider le cache
    this.cache.clear();
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Recherche dans les documents RAG
   * Remplace: recherche manuelle dans l'array localStorage
   * Amélioration: recherche vectorielle côté serveur
   */
  async searchDocuments(
    workspaceId: string,
    options: RagSearchOptions
  ): Promise<RagSearchResult[]> {
    const results = await apiCall<any[]>(`/rag/${workspaceId}/search`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    
    return results.map(result => ({
      document: {
        ...result.document,
        createdAt: new Date(result.document.createdAt),
        updatedAt: new Date(result.document.updatedAt),
      },
      similarity: result.similarity,
      relevanceScore: result.relevanceScore,
      matchedChunks: result.matchedChunks,
    }));
  }
  
  /**
   * Récupère les statistiques d'usage des documents
   * Remplace: localStorage.getItem('rag_doc_stats')
   */
  async getDocumentStats(
    workspaceId: string,
    options: { useCache?: boolean } = {}
  ): Promise<ApiDocumentStats[]> {
    const { useCache = true } = options;
    const cacheKey = `rag_stats:${workspaceId}`;
    
    // Vérifier le cache
    if (useCache) {
      const cached = this.statsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }
    
    const result = await apiCall<any[]>(`/rag/${workspaceId}/stats`);
    
    // Transformer les dates
    const stats = result.map(stat => ({
      ...stat,
      lastUsedAt: new Date(stat.lastUsedAt),
    }));
    
    // Mettre à jour le cache
    if (useCache) {
      this.statsCache.set(cacheKey, {
        data: stats,
        timestamp: Date.now(),
      });
    }
    
    return stats;
  }
  
  /**
   * Met à jour les statistiques d'usage d'un document
   * Remplace: modification manuelle de localStorage('rag_doc_stats')
   */
  async updateDocumentStats(
    documentId: string,
    relevanceScore?: number
  ): Promise<ApiDocumentStats> {
    const result = await apiCall<any>(`/rag/document/${documentId}/stats`, {
      method: 'POST',
      body: JSON.stringify({ relevanceScore }),
    });
    
    // Invalider le cache des stats
    this.statsCache.clear();
    
    return {
      ...result,
      lastUsedAt: new Date(result.lastUsedAt),
    };
  }
  
  /**
   * Exporte tous les documents RAG d'un workspace
   */
  async exportDocuments(workspaceId: string): Promise<{
    documents: ApiRagDocument[];
    stats: ApiDocumentStats[];
    exportedAt: Date;
    workspaceId: string;
    version: string;
  }> {
    const result = await apiCall<any>(`/rag/${workspaceId}/export`);
    
    return {
      ...result,
      exportedAt: new Date(result.exportedAt),
      documents: result.documents.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })),
      stats: result.stats.map((stat: any) => ({
        ...stat,
        lastUsedAt: new Date(stat.lastUsedAt),
      })),
    };
  }
  
  /**
   * Importe des documents RAG
   */
  async importDocuments(
    workspaceId: string,
    data: {
      documents: Omit<CreateRagDocumentDto, 'workspaceId'>[];
      replaceExisting?: boolean;
    }
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = await apiCall<any>(`/rag/${workspaceId}/import`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache après import
    this.invalidateCache(workspaceId);
    
    return result;
  }
  
  /**
   * Retraite les embeddings d'un document
   * Nouvelle fonctionnalité
   */
  async reprocessDocument(documentId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    chunks?: number;
    errors?: string[];
  }> {
    return apiCall(`/rag/document/${documentId}/reprocess`, {
      method: 'POST',
    });
  }
  
  /**
   * Statistiques globales RAG
   * Nouvelle fonctionnalité impossible avec localStorage
   */
  async getRagStats(workspaceId: string): Promise<{
    totalDocuments: number;
    totalSize: number;
    averageSize: number;
    documentsByType: Record<string, number>;
    favoriteCount: number;
    totalUsage: number;
    mostUsedDocument: ApiRagDocument | null;
    oldestDocument: Date;
    newestDocument: Date;
  }> {
    const result = await apiCall<any>(`/rag/${workspaceId}/overview`);
    
    return {
      ...result,
      mostUsedDocument: result.mostUsedDocument ? {
        ...result.mostUsedDocument,
        createdAt: new Date(result.mostUsedDocument.createdAt),
        updatedAt: new Date(result.mostUsedDocument.updatedAt),
      } : null,
      oldestDocument: new Date(result.oldestDocument),
      newestDocument: new Date(result.newestDocument),
    };
  }
  
  /**
   * Invalide le cache pour un workspace
   */
  private invalidateCache(workspaceId: string): void {
    const cacheKey = `rag:${workspaceId}`;
    const statsCacheKey = `rag_stats:${workspaceId}`;
    this.cache.delete(cacheKey);
    this.statsCache.delete(statsCacheKey);
  }
  
  /**
   * Vide tout le cache
   */
  clearCache(): void {
    this.cache.clear();
    this.statsCache.clear();
  }
}

// Instance singleton
export const ragApi = new RagApiService();

/**
 * Clés pour React Query
 */
export const ragQueryKeys = {
  all: ['rag'] as const,
  lists: () => [...ragQueryKeys.all, 'list'] as const,
  list: (workspaceId: string, filters?: any) => 
    [...ragQueryKeys.lists(), workspaceId, filters] as const,
  details: () => [...ragQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ragQueryKeys.details(), id] as const,
  search: (workspaceId: string, query: string) => 
    [...ragQueryKeys.all, 'search', workspaceId, query] as const,
  stats: (workspaceId: string) => [...ragQueryKeys.all, 'stats', workspaceId] as const,
  overview: (workspaceId: string) => [...ragQueryKeys.all, 'overview', workspaceId] as const,
};

/**
 * Service de migration pour la transition localStorage -> API
 */
export class RagMigrationService {
  private useApi: boolean;
  
  constructor(useApi = false) {
    this.useApi = useApi;
  }
  
  /**
   * Récupère les documents selon la configuration (API ou localStorage)
   */
  async getRagDocuments(workspaceId: string) {
    if (this.useApi) {
      return ragApi.getRagDocuments(workspaceId);
    } else {
      return this.getDocumentsFromLocalStorage(workspaceId);
    }
  }
  
  private getDocumentsFromLocalStorage(workspaceId: string) {
    const key = `ws:${workspaceId}:rag_user_docs`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const documents = parsed.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt || Date.now()),
          updatedAt: new Date(doc.updatedAt || Date.now()),
        }));
        return { documents, total: documents.length };
      } catch {
        return { documents: [], total: 0 };
      }
    }
    
    return { documents: [], total: 0 };
  }
  
  /**
   * Migre les données localStorage vers l'API
   */
  async migrateToApi(workspaceId: string): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedCount = 0;
    
    try {
      // Migrer les documents
      const localData = this.getDocumentsFromLocalStorage(workspaceId);
      
      for (const doc of localData.documents) {
        try {
          await ragApi.createDocument({
            workspaceId,
            title: doc.title,
            content: doc.content,
            type: doc.type || 'text',
            size: doc.size || doc.content.length,
            metadata: doc.metadata,
          });
          
          migratedCount++;
        } catch (error) {
          errors.push(`Erreur migration document "${doc.title}": ${error}`);
        }
      }
      
      // Migrer les favoris
      const favoritesKey = `ws:${workspaceId}:rag_doc_favorites`;
      const favorites = localStorage.getItem(favoritesKey);
      if (favorites) {
        try {
          const favoriteIds = JSON.parse(favorites);
          // Note: Les favoris seront gérés lors de la création des documents
          // ou via une API séparée pour mettre à jour les favoris existants
        } catch (error) {
          errors.push(`Erreur migration favoris: ${error}`);
        }
      }
      
      // Migrer les statistiques
      const statsKey = `ws:${workspaceId}:rag_doc_stats`;
      const stats = localStorage.getItem(statsKey);
      if (stats) {
        try {
          const statsData = JSON.parse(stats);
          // Note: Les statistiques seront recalculées côté serveur
          // ou migrées via une API séparée
        } catch (error) {
          errors.push(`Erreur migration statistiques: ${error}`);
        }
      }
      
      return {
        success: errors.length === 0,
        migratedCount,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        migratedCount,
        errors: [`Erreur générale: ${error}`],
      };
    }
  }
}

export { ApiError };