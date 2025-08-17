import { z } from 'zod';

// Types pour l'API
export interface ApiDiscussion {
  id: string;
  workspaceId: string;
  title: string;
  childMode: boolean;
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
  lastMessage?: ApiMessage | null;
}

export interface ApiMessage {
  id: string;
  discussionId: string;
  content: string;
  isUser: boolean;
  imageUrl?: string;
  memoryFactsCount: number;
  createdAt: Date;
  sources?: ApiMessageSource[];
}

export interface ApiMessageSource {
  id: number;
  messageId: string;
  title: string;
  url?: string;
  type: 'rag' | 'web';
}

export interface CreateDiscussionDto {
  workspaceId: string;
  title: string;
  childMode?: boolean;
}

export interface CreateMessageDto {
  discussionId: string;
  content: string;
  isUser: boolean;
  imageUrl?: string;
  memoryFactsCount?: number;
  sources?: {
    title: string;
    url?: string;
    type: 'rag' | 'web';
  }[];
}

export interface UpdateDiscussionDto {
  title?: string;
  childMode?: boolean;
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
 * Service pour gérer les discussions via l'API
 * Remplace les appels localStorage par des appels REST
 */
export class DiscussionsApiService {
  /**
   * Récupère toutes les discussions d'un workspace
   * Remplace: localStorage.getItem('ws:workspaceId:gemini_discussions')
   */
  async getDiscussions(
    workspaceId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ discussions: ApiDiscussion[]; total: number }> {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());
    
    const queryString = params.toString();
    const endpoint = `/discussions/${workspaceId}${queryString ? `?${queryString}` : ''}`;
    
    const result = await apiCall<{ discussions: any[]; total: number }>(endpoint);
    
    // Transformer les dates
    const discussions = result.discussions.map(d => ({
      ...d,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
      lastMessage: d.lastMessage ? {
        ...d.lastMessage,
        createdAt: new Date(d.lastMessage.createdAt),
      } : null,
    }));
    
    return { discussions, total: result.total };
  }
  
  /**
   * Récupère une discussion complète avec ses messages
   * Remplace: localStorage.getItem('ws:workspaceId:gemini_current_discussion')
   */
  async getDiscussion(discussionId: string): Promise<ApiDiscussion & { messages: ApiMessage[] }> {
    const result = await apiCall<any>(`/discussions/detail/${discussionId}`);
    
    // Transformer les dates
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      messages: result.messages.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
    };
  }
  
  /**
   * Crée une nouvelle discussion
   * Remplace: Ajout manuel à l'array localStorage
   */
  async createDiscussion(data: CreateDiscussionDto): Promise<ApiDiscussion> {
    const result = await apiCall<any>('/discussions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Met à jour une discussion
   * Remplace: Modification manuelle de l'array localStorage
   */
  async updateDiscussion(
    discussionId: string,
    data: UpdateDiscussionDto
  ): Promise<ApiDiscussion> {
    const result = await apiCall<any>(`/discussions/${discussionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Supprime une discussion
   * Remplace: Suppression manuelle de l'array localStorage
   */
  async deleteDiscussion(discussionId: string): Promise<void> {
    await apiCall(`/discussions/${discussionId}`, {
      method: 'DELETE',
    });
  }
  
  /**
   * Ajoute un message à une discussion
   * Remplace: Ajout manuel au messages array + localStorage.setItem
   */
  async addMessage(data: CreateMessageDto): Promise<ApiMessage> {
    const result = await apiCall<any>(`/discussions/${data.discussionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
    };
  }
  
  /**
   * Récupère les messages d'une discussion
   * Utilisé pour la pagination des messages
   */
  async getMessages(
    discussionId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ messages: ApiMessage[]; total: number }> {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());
    
    const queryString = params.toString();
    const endpoint = `/discussions/${discussionId}/messages${queryString ? `?${queryString}` : ''}`;
    
    const result = await apiCall<{ messages: any[]; total: number }>(endpoint);
    
    // Transformer les dates
    const messages = result.messages.map(m => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
    
    return { messages, total: result.total };
  }
  
  /**
   * Supprime un message
   * Remplace: Suppression manuelle de l'array + localStorage.setItem
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiCall(`/discussions/messages/${messageId}`, {
      method: 'DELETE',
    });
  }
  
  /**
   * Recherche dans les discussions
   * Nouvelle fonctionnalité impossible avec localStorage
   */
  async searchDiscussions(
    workspaceId: string,
    query: string,
    options: { limit?: number } = {}
  ): Promise<{ results: (ApiMessage & { discussion: ApiDiscussion })[]; query: string }> {
    const params = new URLSearchParams({ q: query });
    if (options.limit) params.set('limit', options.limit.toString());
    
    const result = await apiCall<any>(`/discussions/search/${workspaceId}?${params}`);
    
    // Transformer les dates
    const results = result.results.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      discussion: {
        ...r.discussion,
        createdAt: new Date(r.discussion.createdAt),
        updatedAt: new Date(r.discussion.updatedAt),
      },
    }));
    
    return { results, query: result.query };
  }
}

// Instance singleton
export const discussionsApi = new DiscussionsApiService();

/**
 * Hook React Query pour les discussions
 * Remplace les useState + useEffect + localStorage
 */
export const discussionsQueryKeys = {
  all: ['discussions'] as const,
  lists: () => [...discussionsQueryKeys.all, 'list'] as const,
  list: (workspaceId: string) => [...discussionsQueryKeys.lists(), workspaceId] as const,
  details: () => [...discussionsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...discussionsQueryKeys.details(), id] as const,
  search: (workspaceId: string, query: string) => 
    [...discussionsQueryKeys.all, 'search', workspaceId, query] as const,
};

/**
 * Exemple d'utilisation avec React Query (à installer)
 * 
 * ```typescript
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * 
 * // Dans un composant React
 * function DiscussionsList({ workspaceId }: { workspaceId: string }) {
 *   const queryClient = useQueryClient();
 *   
 *   // Remplace: useState + useEffect + localStorage.getItem
 *   const { data, isLoading, error } = useQuery({
 *     queryKey: discussionsQueryKeys.list(workspaceId),
 *     queryFn: () => discussionsApi.getDiscussions(workspaceId),
 *   });
 *   
 *   // Remplace: fonction manuelle + localStorage.setItem
 *   const createMutation = useMutation({
 *     mutationFn: discussionsApi.createDiscussion,
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: discussionsQueryKeys.list(workspaceId) });
 *     },
 *   });
 *   
 *   const handleCreateDiscussion = (title: string) => {
 *     createMutation.mutate({ workspaceId, title });
 *   };
 *   
 *   if (isLoading) return <div>Chargement...</div>;
 *   if (error) return <div>Erreur: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       {data?.discussions.map(discussion => (
 *         <div key={discussion.id}>{discussion.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Service de migration pour la transition localStorage -> API
 * Permet de maintenir la compatibilité pendant la migration
 */
export class DiscussionsMigrationService {
  private useApi: boolean;
  
  constructor(useApi = false) {
    this.useApi = useApi;
  }
  
  /**
   * Bascule entre localStorage et API selon la configuration
   */
  async getDiscussions(workspaceId: string) {
    if (this.useApi) {
      return discussionsApi.getDiscussions(workspaceId);
    } else {
      // Fallback localStorage (code existant)
      return this.getDiscussionsFromLocalStorage(workspaceId);
    }
  }
  
  private getDiscussionsFromLocalStorage(workspaceId: string) {
    // Implémentation existante localStorage
    const key = `ws:${workspaceId}:gemini_discussions`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { discussions: parsed, total: parsed.length };
      } catch {
        return { discussions: [], total: 0 };
      }
    }
    return { discussions: [], total: 0 };
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
      const localData = this.getDiscussionsFromLocalStorage(workspaceId);
      
      for (const discussion of localData.discussions) {
        try {
          // Créer la discussion
          const createdDiscussion = await discussionsApi.createDiscussion({
            workspaceId,
            title: discussion.title,
            childMode: discussion.childMode || false,
          });
          
          // Ajouter les messages
          for (const message of discussion.messages || []) {
            await discussionsApi.addMessage({
              discussionId: createdDiscussion.id,
              content: message.text,
              isUser: message.isUser,
              imageUrl: message.imageUrl,
              memoryFactsCount: message.memoryFactsCount || 0,
              sources: message.sources?.map(s => ({
                title: s.title,
                url: s.url,
                type: s.url?.includes('http') ? 'web' as const : 'rag' as const,
              })),
            });
          }
          
          migratedCount++;
        } catch (error) {
          errors.push(`Erreur migration discussion "${discussion.title}": ${error}`);
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