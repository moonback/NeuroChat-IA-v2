import { z } from 'zod';

// Types pour l'API mémoire
export interface ApiMemoryItem {
  id: string;
  workspaceId: string;
  content: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface CreateMemoryItemDto {
  workspaceId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface UpdateMemoryItemDto {
  content?: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface MemorySearchOptions {
  query?: string;
  embedding?: number[];
  limit?: number;
  threshold?: number;
  includeEmbeddings?: boolean;
}

export interface MemorySearchResult {
  item: ApiMemoryItem;
  similarity?: number;
  relevanceScore?: number;
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
 * Service pour gérer la mémoire utilisateur via l'API
 * Remplace les appels localStorage et le cache en mémoire de memory.ts
 */
export class MemoryApiService {
  private cache = new Map<string, { data: ApiMemoryItem[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 secondes comme dans memory.ts
  
  /**
   * Récupère tous les éléments de mémoire d'un workspace
   * Remplace: loadMemoryFromStorage() dans memory.ts
   */
  async getMemoryItems(
    workspaceId: string,
    options: { useCache?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ items: ApiMemoryItem[]; total: number }> {
    const { useCache = true, limit, offset } = options;
    const cacheKey = `memory:${workspaceId}`;
    
    // Vérifier le cache si activé
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        let items = cached.data;
        
        // Appliquer pagination sur le cache
        if (offset !== undefined) {
          items = items.slice(offset);
        }
        if (limit !== undefined) {
          items = items.slice(0, limit);
        }
        
        return { items, total: cached.data.length };
      }
    }
    
    // Appel API
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    
    const queryString = params.toString();
    const endpoint = `/memory/${workspaceId}${queryString ? `?${queryString}` : ''}`;
    
    const result = await apiCall<{ items: any[]; total: number }>(endpoint);
    
    // Transformer les dates
    const items = result.items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
    
    // Mettre à jour le cache avec toutes les données si pas de pagination
    if (useCache && !limit && !offset) {
      this.cache.set(cacheKey, {
        data: items,
        timestamp: Date.now(),
      });
    }
    
    return { items, total: result.total };
  }
  
  /**
   * Récupère un élément de mémoire par ID
   */
  async getMemoryItem(itemId: string): Promise<ApiMemoryItem> {
    const result = await apiCall<any>(`/memory/item/${itemId}`);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Ajoute un nouvel élément de mémoire
   * Remplace: addMemoryItem() dans memory.ts
   */
  async addMemoryItem(data: CreateMemoryItemDto): Promise<ApiMemoryItem> {
    const result = await apiCall<any>('/memory', {
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
   * Met à jour un élément de mémoire
   * Remplace: updateMemoryItem() dans memory.ts
   */
  async updateMemoryItem(
    itemId: string,
    data: UpdateMemoryItemDto
  ): Promise<ApiMemoryItem> {
    const result = await apiCall<any>(`/memory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache (on ne connaît pas le workspaceId ici)
    this.cache.clear();
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Supprime un élément de mémoire
   * Remplace: deleteMemoryItem() dans memory.ts
   */
  async deleteMemoryItem(itemId: string): Promise<void> {
    await apiCall(`/memory/${itemId}`, {
      method: 'DELETE',
    });
    
    // Invalider le cache
    this.cache.clear();
  }
  
  /**
   * Supprime tous les éléments de mémoire d'un workspace
   * Remplace: clearMemory() dans memory.ts
   */
  async clearMemory(workspaceId: string): Promise<void> {
    await apiCall(`/memory/${workspaceId}/clear`, {
      method: 'DELETE',
    });
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
  }
  
  /**
   * Recherche dans la mémoire avec similarité vectorielle
   * Remplace: searchRelevantMemories() dans memory.ts
   * Amélioration: recherche côté serveur plus efficace
   */
  async searchMemory(
    workspaceId: string,
    options: MemorySearchOptions
  ): Promise<MemorySearchResult[]> {
    const body: any = { ...options };
    
    const results = await apiCall<any[]>(`/memory/${workspaceId}/search`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return results.map(result => ({
      item: {
        ...result.item,
        createdAt: new Date(result.item.createdAt),
        updatedAt: new Date(result.item.updatedAt),
      },
      similarity: result.similarity,
      relevanceScore: result.relevanceScore,
    }));
  }
  
  /**
   * Exporte toute la mémoire d'un workspace
   * Remplace: exportMemory() dans memory.ts
   */
  async exportMemory(workspaceId: string): Promise<{
    items: ApiMemoryItem[];
    exportedAt: Date;
    workspaceId: string;
    version: string;
  }> {
    const result = await apiCall<any>(`/memory/${workspaceId}/export`);
    
    return {
      ...result,
      exportedAt: new Date(result.exportedAt),
      items: result.items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
    };
  }
  
  /**
   * Importe des données de mémoire
   * Remplace: importMemory() dans memory.ts
   */
  async importMemory(
    workspaceId: string,
    data: {
      items: Omit<CreateMemoryItemDto, 'workspaceId'>[];
      replaceExisting?: boolean;
    }
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = await apiCall<any>(`/memory/${workspaceId}/import`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache après import
    this.invalidateCache(workspaceId);
    
    return result;
  }
  
  /**
   * Génère des embeddings pour un texte
   * Nouvelle fonctionnalité côté serveur
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const result = await apiCall<{ embedding: number[] }>('/memory/embedding', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    
    return result.embedding;
  }
  
  /**
   * Statistiques de la mémoire
   * Nouvelle fonctionnalité impossible avec localStorage
   */
  async getMemoryStats(workspaceId: string): Promise<{
    totalItems: number;
    totalSize: number;
    averageLength: number;
    oldestItem: Date;
    newestItem: Date;
    itemsWithEmbeddings: number;
  }> {
    const result = await apiCall<any>(`/memory/${workspaceId}/stats`);
    
    return {
      ...result,
      oldestItem: new Date(result.oldestItem),
      newestItem: new Date(result.newestItem),
    };
  }
  
  /**
   * Invalide le cache pour un workspace
   */
  private invalidateCache(workspaceId: string): void {
    const cacheKey = `memory:${workspaceId}`;
    this.cache.delete(cacheKey);
  }
  
  /**
   * Vide tout le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Instance singleton
export const memoryApi = new MemoryApiService();

/**
 * Clés pour React Query
 */
export const memoryQueryKeys = {
  all: ['memory'] as const,
  lists: () => [...memoryQueryKeys.all, 'list'] as const,
  list: (workspaceId: string) => [...memoryQueryKeys.lists(), workspaceId] as const,
  details: () => [...memoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...memoryQueryKeys.details(), id] as const,
  search: (workspaceId: string, query: string) => 
    [...memoryQueryKeys.all, 'search', workspaceId, query] as const,
  stats: (workspaceId: string) => [...memoryQueryKeys.all, 'stats', workspaceId] as const,
};

/**
 * Service de migration pour la transition localStorage -> API
 */
export class MemoryMigrationService {
  private useApi: boolean;
  
  constructor(useApi = false) {
    this.useApi = useApi;
  }
  
  /**
   * Récupère la mémoire selon la configuration (API ou localStorage)
   */
  async getMemoryItems(workspaceId: string) {
    if (this.useApi) {
      return memoryApi.getMemoryItems(workspaceId);
    } else {
      return this.getMemoryFromLocalStorage(workspaceId);
    }
  }
  
  private getMemoryFromLocalStorage(workspaceId: string) {
    const key = `ws:${workspaceId}:neurochat_user_memory_v1`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const items = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt || Date.now()),
          updatedAt: new Date(item.updatedAt || Date.now()),
        }));
        return { items, total: items.length };
      } catch {
        return { items: [], total: 0 };
      }
    }
    
    return { items: [], total: 0 };
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
      const localData = this.getMemoryFromLocalStorage(workspaceId);
      
      for (const item of localData.items) {
        try {
          await memoryApi.addMemoryItem({
            workspaceId,
            content: item.content,
            embedding: item.embedding,
            metadata: item.metadata,
          });
          
          migratedCount++;
        } catch (error) {
          errors.push(`Erreur migration mémoire "${item.content.substring(0, 50)}...": ${error}`);
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

/**
 * Exemple d'utilisation avec React Query
 * 
 * ```typescript
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * 
 * function MemoryManager({ workspaceId }: { workspaceId: string }) {
 *   const queryClient = useQueryClient();
 *   
 *   // Remplace: useState + useEffect + localStorage
 *   const { data: memoryData, isLoading } = useQuery({
 *     queryKey: memoryQueryKeys.list(workspaceId),
 *     queryFn: () => memoryApi.getMemoryItems(workspaceId),
 *   });
 *   
 *   // Remplace: fonction manuelle + localStorage.setItem
 *   const addMemoryMutation = useMutation({
 *     mutationFn: memoryApi.addMemoryItem,
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: memoryQueryKeys.list(workspaceId) });
 *     },
 *   });
 *   
 *   // Recherche avec debounce
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const { data: searchResults } = useQuery({
 *     queryKey: memoryQueryKeys.search(workspaceId, searchQuery),
 *     queryFn: () => memoryApi.searchMemory(workspaceId, { query: searchQuery }),
 *     enabled: searchQuery.length > 2,
 *   });
 *   
 *   const handleAddMemory = (content: string) => {
 *     addMemoryMutation.mutate({ workspaceId, content });
 *   };
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Rechercher dans la mémoire..."
 *       />
 *       
 *       {isLoading ? (
 *         <div>Chargement...</div>
 *       ) : (
 *         <div>
 *           {memoryData?.items.map(item => (
 *             <div key={item.id}>{item.content}</div>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

export { ApiError };