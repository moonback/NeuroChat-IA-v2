import { z } from 'zod';

// Types pour l'API des paramètres
export interface ApiUserSetting {
  id: string;
  workspaceId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'llm' | 'rag' | 'web' | 'ui' | 'general' | 'advanced';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiConfigurationPreset {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserSettingDto {
  workspaceId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'llm' | 'rag' | 'web' | 'ui' | 'general' | 'advanced';
  description?: string;
}

export interface UpdateUserSettingDto {
  value?: any;
  description?: string;
}

export interface CreateConfigurationPresetDto {
  workspaceId: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  isDefault?: boolean;
}

export interface UpdateConfigurationPresetDto {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
  isDefault?: boolean;
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
 * Service pour gérer les paramètres utilisateur via l'API
 * Remplace les appels localStorage de App.tsx pour les configurations
 */
export class SettingsApiService {
  private cache = new Map<string, { data: ApiUserSetting[]; timestamp: number }>();
  private presetsCache = new Map<string, { data: ApiConfigurationPreset[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 secondes
  
  /**
   * Récupère tous les paramètres d'un workspace
   * Remplace: multiples localStorage.getItem() dans App.tsx
   */
  async getUserSettings(
    workspaceId: string,
    options: { 
      useCache?: boolean; 
      category?: string;
      keys?: string[];
    } = {}
  ): Promise<{ settings: ApiUserSetting[]; total: number }> {
    const { useCache = true, category, keys } = options;
    const cacheKey = `settings:${workspaceId}`;
    
    // Vérifier le cache si activé et pas de filtres
    if (useCache && !category && !keys?.length) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return { settings: cached.data, total: cached.data.length };
      }
    }
    
    // Construire les paramètres de requête
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (keys?.length) params.set('keys', keys.join(','));
    
    const queryString = params.toString();
    const endpoint = `/settings/${workspaceId}${queryString ? `?${queryString}` : ''}`;
    
    const result = await apiCall<{ settings: any[]; total: number }>(endpoint);
    
    // Transformer les dates
    const settings = result.settings.map(setting => ({
      ...setting,
      createdAt: new Date(setting.createdAt),
      updatedAt: new Date(setting.updatedAt),
    }));
    
    // Mettre à jour le cache si pas de filtres
    if (useCache && !category && !keys?.length) {
      this.cache.set(cacheKey, {
        data: settings,
        timestamp: Date.now(),
      });
    }
    
    return { settings, total: result.total };
  }
  
  /**
   * Récupère un paramètre spécifique par clé
   * Remplace: localStorage.getItem('llm_provider'), etc.
   */
  async getUserSetting(
    workspaceId: string,
    key: string
  ): Promise<ApiUserSetting | null> {
    try {
      const result = await apiCall<any>(`/settings/${workspaceId}/${key}`);
      
      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Récupère la valeur d'un paramètre directement
   * Utilitaire pour remplacer localStorage.getItem() simplement
   */
  async getSettingValue<T = any>(
    workspaceId: string,
    key: string,
    defaultValue?: T
  ): Promise<T> {
    const setting = await this.getUserSetting(workspaceId, key);
    return setting ? setting.value : defaultValue;
  }
  
  /**
   * Crée ou met à jour un paramètre
   * Remplace: localStorage.setItem('llm_provider', value), etc.
   */
  async setUserSetting(
    workspaceId: string,
    key: string,
    value: any,
    options: {
      type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
      category?: 'llm' | 'rag' | 'web' | 'ui' | 'general' | 'advanced';
      description?: string;
    } = {}
  ): Promise<ApiUserSetting> {
    const { type = this.inferType(value), category = 'general', description } = options;
    
    // Essayer de mettre à jour d'abord
    try {
      const result = await apiCall<any>(`/settings/${workspaceId}/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, description }),
      });
      
      // Invalider le cache
      this.invalidateCache(workspaceId);
      
      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      // Si le paramètre n'existe pas, le créer
      if (error instanceof ApiError && error.status === 404) {
        return this.createUserSetting({
          workspaceId,
          key,
          value,
          type,
          category,
          description,
        });
      }
      throw error;
    }
  }
  
  /**
   * Crée un nouveau paramètre
   */
  async createUserSetting(data: CreateUserSettingDto): Promise<ApiUserSetting> {
    const result = await apiCall<any>('/settings', {
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
   * Met à jour un paramètre existant
   */
  async updateUserSetting(
    workspaceId: string,
    key: string,
    data: UpdateUserSettingDto
  ): Promise<ApiUserSetting> {
    const result = await apiCall<any>(`/settings/${workspaceId}/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Supprime un paramètre
   */
  async deleteUserSetting(workspaceId: string, key: string): Promise<void> {
    await apiCall(`/settings/${workspaceId}/${key}`, {
      method: 'DELETE',
    });
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
  }
  
  /**
   * Met à jour plusieurs paramètres en une fois
   * Optimisation pour éviter plusieurs appels API
   */
  async setBulkSettings(
    workspaceId: string,
    settings: Record<string, any>,
    category: 'llm' | 'rag' | 'web' | 'ui' | 'general' | 'advanced' = 'general'
  ): Promise<ApiUserSetting[]> {
    const settingsArray = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      type: this.inferType(value),
      category,
    }));
    
    const result = await apiCall<any[]>(`/settings/${workspaceId}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ settings: settingsArray }),
    });
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
    
    return result.map(setting => ({
      ...setting,
      createdAt: new Date(setting.createdAt),
      updatedAt: new Date(setting.updatedAt),
    }));
  }
  
  /**
   * Récupère tous les presets de configuration
   */
  async getConfigurationPresets(
    workspaceId: string,
    options: { useCache?: boolean } = {}
  ): Promise<{ presets: ApiConfigurationPreset[]; total: number }> {
    const { useCache = true } = options;
    const cacheKey = `presets:${workspaceId}`;
    
    // Vérifier le cache
    if (useCache) {
      const cached = this.presetsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return { presets: cached.data, total: cached.data.length };
      }
    }
    
    const result = await apiCall<{ presets: any[]; total: number }>(`/settings/${workspaceId}/presets`);
    
    // Transformer les dates
    const presets = result.presets.map(preset => ({
      ...preset,
      createdAt: new Date(preset.createdAt),
      updatedAt: new Date(preset.updatedAt),
    }));
    
    // Mettre à jour le cache
    if (useCache) {
      this.presetsCache.set(cacheKey, {
        data: presets,
        timestamp: Date.now(),
      });
    }
    
    return { presets, total: result.total };
  }
  
  /**
   * Récupère un preset par ID
   */
  async getConfigurationPreset(presetId: string): Promise<ApiConfigurationPreset> {
    const result = await apiCall<any>(`/settings/presets/${presetId}`);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Crée un nouveau preset de configuration
   */
  async createConfigurationPreset(data: CreateConfigurationPresetDto): Promise<ApiConfigurationPreset> {
    const result = await apiCall<any>('/settings/presets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache
    this.invalidatePresetsCache(data.workspaceId);
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Met à jour un preset de configuration
   */
  async updateConfigurationPreset(
    presetId: string,
    data: UpdateConfigurationPresetDto
  ): Promise<ApiConfigurationPreset> {
    const result = await apiCall<any>(`/settings/presets/${presetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache
    this.presetsCache.clear();
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }
  
  /**
   * Supprime un preset de configuration
   */
  async deleteConfigurationPreset(presetId: string): Promise<void> {
    await apiCall(`/settings/presets/${presetId}`, {
      method: 'DELETE',
    });
    
    // Invalider le cache
    this.presetsCache.clear();
  }
  
  /**
   * Applique un preset de configuration
   * Met à jour tous les paramètres du preset
   */
  async applyConfigurationPreset(
    workspaceId: string,
    presetId: string
  ): Promise<ApiUserSetting[]> {
    const result = await apiCall<any[]>(`/settings/${workspaceId}/presets/${presetId}/apply`, {
      method: 'POST',
    });
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
    
    return result.map(setting => ({
      ...setting,
      createdAt: new Date(setting.createdAt),
      updatedAt: new Date(setting.updatedAt),
    }));
  }
  
  /**
   * Exporte tous les paramètres d'un workspace
   */
  async exportSettings(workspaceId: string): Promise<{
    settings: ApiUserSetting[];
    presets: ApiConfigurationPreset[];
    exportedAt: Date;
    workspaceId: string;
    version: string;
  }> {
    const result = await apiCall<any>(`/settings/${workspaceId}/export`);
    
    return {
      ...result,
      exportedAt: new Date(result.exportedAt),
      settings: result.settings.map((setting: any) => ({
        ...setting,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt),
      })),
      presets: result.presets.map((preset: any) => ({
        ...preset,
        createdAt: new Date(preset.createdAt),
        updatedAt: new Date(preset.updatedAt),
      })),
    };
  }
  
  /**
   * Importe des paramètres
   */
  async importSettings(
    workspaceId: string,
    data: {
      settings: Omit<CreateUserSettingDto, 'workspaceId'>[];
      presets?: Omit<CreateConfigurationPresetDto, 'workspaceId'>[];
      replaceExisting?: boolean;
    }
  ): Promise<{
    importedSettings: number;
    importedPresets: number;
    skipped: number;
    errors: string[];
  }> {
    const result = await apiCall<any>(`/settings/${workspaceId}/import`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalider le cache après import
    this.invalidateCache(workspaceId);
    this.invalidatePresetsCache(workspaceId);
    
    return result;
  }
  
  /**
   * Réinitialise tous les paramètres aux valeurs par défaut
   */
  async resetToDefaults(workspaceId: string): Promise<void> {
    await apiCall(`/settings/${workspaceId}/reset`, {
      method: 'POST',
    });
    
    // Invalider le cache
    this.invalidateCache(workspaceId);
  }
  
  /**
   * Infère le type d'une valeur
   */
  private inferType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'string';
    return typeof value as 'string' | 'number' | 'boolean' | 'object';
  }
  
  /**
   * Invalide le cache pour un workspace
   */
  private invalidateCache(workspaceId: string): void {
    const cacheKey = `settings:${workspaceId}`;
    this.cache.delete(cacheKey);
  }
  
  /**
   * Invalide le cache des presets pour un workspace
   */
  private invalidatePresetsCache(workspaceId: string): void {
    const cacheKey = `presets:${workspaceId}`;
    this.presetsCache.delete(cacheKey);
  }
  
  /**
   * Vide tout le cache
   */
  clearCache(): void {
    this.cache.clear();
    this.presetsCache.clear();
  }
}

// Instance singleton
export const settingsApi = new SettingsApiService();

/**
 * Clés pour React Query
 */
export const settingsQueryKeys = {
  all: ['settings'] as const,
  lists: () => [...settingsQueryKeys.all, 'list'] as const,
  list: (workspaceId: string, filters?: any) => 
    [...settingsQueryKeys.lists(), workspaceId, filters] as const,
  details: () => [...settingsQueryKeys.all, 'detail'] as const,
  detail: (workspaceId: string, key: string) => 
    [...settingsQueryKeys.details(), workspaceId, key] as const,
  presets: (workspaceId: string) => [...settingsQueryKeys.all, 'presets', workspaceId] as const,
  preset: (presetId: string) => [...settingsQueryKeys.all, 'preset', presetId] as const,
};

/**
 * Service de migration pour la transition localStorage -> API
 */
export class SettingsMigrationService {
  private useApi: boolean;
  
  constructor(useApi = false) {
    this.useApi = useApi;
  }
  
  /**
   * Récupère un paramètre selon la configuration (API ou localStorage)
   */
  async getSetting(workspaceId: string, key: string, defaultValue?: any) {
    if (this.useApi) {
      return settingsApi.getSettingValue(workspaceId, key, defaultValue);
    } else {
      return this.getSettingFromLocalStorage(key, defaultValue);
    }
  }
  
  /**
   * Définit un paramètre selon la configuration (API ou localStorage)
   */
  async setSetting(workspaceId: string, key: string, value: any) {
    if (this.useApi) {
      return settingsApi.setUserSetting(workspaceId, key, value);
    } else {
      return this.setSettingToLocalStorage(key, value);
    }
  }
  
  private getSettingFromLocalStorage(key: string, defaultValue?: any) {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return saved;
      }
    }
    return defaultValue;
  }
  
  private setSettingToLocalStorage(key: string, value: any) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return value;
  }
  
  /**
   * Migre tous les paramètres localStorage vers l'API
   */
  async migrateToApi(workspaceId: string): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedCount = 0;
    
    // Liste des clés localStorage connues à migrer
    const knownSettings = [
      { key: 'llm_provider', category: 'llm' as const },
      { key: 'auto_rag_enabled', category: 'rag' as const },
      { key: 'auto_web_enabled', category: 'web' as const },
      { key: 'auto_rag_keywords', category: 'rag' as const },
      { key: 'auto_web_keywords', category: 'web' as const },
      { key: 'child_mode', category: 'general' as const },
      { key: 'theme', category: 'ui' as const },
      { key: 'language', category: 'ui' as const },
    ];
    
    try {
      for (const { key, category } of knownSettings) {
        const value = this.getSettingFromLocalStorage(key);
        if (value !== undefined) {
          try {
            await settingsApi.setUserSetting(workspaceId, key, value, { category });
            migratedCount++;
          } catch (error) {
            errors.push(`Erreur migration paramètre "${key}": ${error}`);
          }
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
 * Hook personnalisé pour gérer les paramètres avec React Query
 * Remplace les useState + useEffect + localStorage
 * 
 * ```typescript
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * 
 * function useUserSetting<T>(
 *   workspaceId: string,
 *   key: string,
 *   defaultValue?: T
 * ) {
 *   const queryClient = useQueryClient();
 *   
 *   // Récupérer la valeur
 *   const { data: value, isLoading } = useQuery({
 *     queryKey: settingsQueryKeys.detail(workspaceId, key),
 *     queryFn: () => settingsApi.getSettingValue(workspaceId, key, defaultValue),
 *   });
 *   
 *   // Mettre à jour la valeur
 *   const mutation = useMutation({
 *     mutationFn: (newValue: T) => settingsApi.setUserSetting(workspaceId, key, newValue),
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: settingsQueryKeys.detail(workspaceId, key) });
 *     },
 *   });
 *   
 *   return {
 *     value,
 *     isLoading,
 *     setValue: mutation.mutate,
 *     isUpdating: mutation.isPending,
 *   };
 * }
 * 
 * // Utilisation dans un composant
 * function SettingsPanel({ workspaceId }: { workspaceId: string }) {
 *   const { value: llmProvider, setValue: setLlmProvider } = useUserSetting(
 *     workspaceId,
 *     'llm_provider',
 *     'gemini'
 *   );
 *   
 *   const { value: autoRagEnabled, setValue: setAutoRagEnabled } = useUserSetting(
 *     workspaceId,
 *     'auto_rag_enabled',
 *     false
 *   );
 *   
 *   return (
 *     <div>
 *       <select value={llmProvider} onChange={(e) => setLlmProvider(e.target.value)}>
 *         <option value="gemini">Gemini</option>
 *         <option value="openai">OpenAI</option>
 *       </select>
 *       
 *       <input
 *         type="checkbox"
 *         checked={autoRagEnabled}
 *         onChange={(e) => setAutoRagEnabled(e.target.checked)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

export { ApiError };