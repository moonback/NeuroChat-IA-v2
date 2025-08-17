import { db } from '../db/index.js';
import {
  workspaces,
  discussions,
  messages,
  memoryItems,
  ragDocuments,
  documentStats,
  userSettings,
  configurationPresets,
  type NewWorkspace,
  type NewDiscussion,
  type NewMessage,
  type NewMemoryItem,
  type NewRagDocument,
  type NewDocumentStats,
  type NewUserSetting,
  type NewConfigurationPreset,
} from '../db/schema.js';

// Types pour les données localStorage
interface LocalStorageMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  imageUrl?: string;
  memoryFactsCount?: number;
  sources?: Array<{ title: string; url: string }>;
}

interface LocalStorageDiscussion {
  title: string;
  messages: LocalStorageMessage[];
  childMode?: boolean;
}

interface LocalStorageMemoryItem {
  id: string;
  content: string;
  tags: string[];
  importance: number;
  createdAt: string;
  updatedAt: string;
  source: 'user' | 'assistant' | 'system';
  originMessageId?: string;
  embedding?: number[];
  disabled?: boolean;
  evidenceCount?: number;
  lastSeenAt?: string;
}

interface LocalStorageRagDoc {
  id: string;
  titre: string;
  contenu: string;
  origine: 'dossier' | 'utilisateur';
  extension?: string;
}

export class MigrationService {
  /**
   * Migre toutes les données localStorage vers la base de données
   */
  async migrateFromLocalStorage(localStorageData: Record<string, string>): Promise<{
    success: boolean;
    migratedItems: {
      workspaces: number;
      discussions: number;
      messages: number;
      memoryItems: number;
      ragDocuments: number;
      userSettings: number;
      presets: number;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const migratedItems = {
      workspaces: 0,
      discussions: 0,
      messages: 0,
      memoryItems: 0,
      ragDocuments: 0,
      userSettings: 0,
      presets: 0,
    };

    try {
      // 1. Extraire et créer les workspaces
      const workspaceIds = this.extractWorkspaceIds(localStorageData);
      for (const workspaceId of workspaceIds) {
        await this.createWorkspaceIfNotExists(workspaceId);
        migratedItems.workspaces++;
      }

      // 2. Migrer les discussions et messages
      for (const workspaceId of workspaceIds) {
        const discussionsKey = `ws:${workspaceId}:gemini_discussions`;
        if (localStorageData[discussionsKey]) {
          const result = await this.migrateDiscussions(
            workspaceId,
            localStorageData[discussionsKey]
          );
          migratedItems.discussions += result.discussions;
          migratedItems.messages += result.messages;
          errors.push(...result.errors);
        }
      }

      // 3. Migrer la mémoire utilisateur
      for (const workspaceId of workspaceIds) {
        const memoryKey = `ws:${workspaceId}:neurochat_user_memory_v1`;
        if (localStorageData[memoryKey]) {
          const result = await this.migrateMemoryItems(
            workspaceId,
            localStorageData[memoryKey]
          );
          migratedItems.memoryItems += result.count;
          errors.push(...result.errors);
        }
      }

      // 4. Migrer les documents RAG
      for (const workspaceId of workspaceIds) {
        const ragDocsKey = `ws:${workspaceId}:rag_user_docs`;
        const ragStatsKey = `ws:${workspaceId}:rag_doc_stats`;
        const ragFavoritesKey = `ws:${workspaceId}:rag_doc_favorites`;
        
        if (localStorageData[ragDocsKey]) {
          const result = await this.migrateRagDocuments(
            workspaceId,
            localStorageData[ragDocsKey],
            localStorageData[ragStatsKey],
            localStorageData[ragFavoritesKey]
          );
          migratedItems.ragDocuments += result.count;
          errors.push(...result.errors);
        }
      }

      // 5. Migrer les configurations utilisateur
      const settingsResult = await this.migrateUserSettings(localStorageData);
      migratedItems.userSettings += settingsResult.count;
      errors.push(...settingsResult.errors);

      // 6. Migrer les presets
      for (const workspaceId of workspaceIds) {
        const presetsKey = `ws:${workspaceId}:gemini_presets`;
        if (localStorageData[presetsKey]) {
          const result = await this.migratePresets(
            workspaceId,
            localStorageData[presetsKey]
          );
          migratedItems.presets += result.count;
          errors.push(...result.errors);
        }
      }

      return {
        success: errors.length === 0,
        migratedItems,
        errors,
      };
    } catch (error) {
      errors.push(`Erreur générale de migration: ${error}`);
      return {
        success: false,
        migratedItems,
        errors,
      };
    }
  }

  /**
   * Extrait tous les IDs de workspace des clés localStorage
   */
  private extractWorkspaceIds(localStorageData: Record<string, string>): string[] {
    const workspaceIds = new Set<string>();
    
    // Ajouter le workspace par défaut
    workspaceIds.add('default');
    
    // Extraire les workspaces des clés préfixées
    for (const key of Object.keys(localStorageData)) {
      if (key.startsWith('ws:')) {
        const parts = key.split(':');
        if (parts.length >= 2) {
          workspaceIds.add(parts[1]);
        }
      }
    }
    
    // Ajouter le workspace actif s'il existe
    if (localStorageData['nc_active_workspace']) {
      workspaceIds.add(localStorageData['nc_active_workspace']);
    }
    
    return Array.from(workspaceIds);
  }

  /**
   * Crée un workspace s'il n'existe pas déjà
   */
  private async createWorkspaceIfNotExists(workspaceId: string): Promise<void> {
    const existing = await db.query.workspaces.findFirst({
      where: (workspaces, { eq }) => eq(workspaces.id, workspaceId),
    });

    if (!existing) {
      const newWorkspace: NewWorkspace = {
        id: workspaceId,
        name: workspaceId === 'default' ? 'Workspace Principal' : `Workspace ${workspaceId}`,
        description: `Workspace migré depuis localStorage`,
      };
      
      await db.insert(workspaces).values(newWorkspace);
    }
  }

  /**
   * Migre les discussions et leurs messages
   */
  private async migrateDiscussions(
    workspaceId: string,
    discussionsJson: string
  ): Promise<{ discussions: number; messages: number; errors: string[] }> {
    const errors: string[] = [];
    let discussionCount = 0;
    let messageCount = 0;

    try {
      const discussionsData: LocalStorageDiscussion[] = JSON.parse(discussionsJson);
      
      for (const [index, discussion] of discussionsData.entries()) {
        try {
          // Créer la discussion
          const discussionId = `${workspaceId}-discussion-${Date.now()}-${index}`;
          const newDiscussion: NewDiscussion = {
            id: discussionId,
            workspaceId,
            title: discussion.title || `Discussion ${index + 1}`,
            childMode: discussion.childMode || false,
          };
          
          await db.insert(discussions).values(newDiscussion);
          discussionCount++;
          
          // Migrer les messages de cette discussion
          for (const message of discussion.messages) {
            try {
              const newMessage: NewMessage = {
                id: message.id,
                discussionId,
                content: message.text,
                isUser: message.isUser,
                imageUrl: message.imageUrl,
                memoryFactsCount: message.memoryFactsCount || 0,
                createdAt: new Date(message.timestamp),
              };
              
              await db.insert(messages).values(newMessage);
              messageCount++;
              
              // Migrer les sources si elles existent
              if (message.sources && message.sources.length > 0) {
                // TODO: Implémenter la migration des sources
              }
            } catch (error) {
              errors.push(`Erreur migration message ${message.id}: ${error}`);
            }
          }
        } catch (error) {
          errors.push(`Erreur migration discussion ${index}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Erreur parsing discussions JSON: ${error}`);
    }

    return { discussions: discussionCount, messages: messageCount, errors };
  }

  /**
   * Migre les éléments de mémoire
   */
  private async migrateMemoryItems(
    workspaceId: string,
    memoryJson: string
  ): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const memoryData: LocalStorageMemoryItem[] = JSON.parse(memoryJson);
      
      for (const item of memoryData) {
        try {
          // Convertir l'embedding en Buffer si présent
          let embeddingBuffer: Buffer | undefined;
          if (item.embedding && Array.isArray(item.embedding)) {
            embeddingBuffer = Buffer.from(new Float32Array(item.embedding).buffer);
          }
          
          const newMemoryItem: NewMemoryItem = {
            id: item.id,
            workspaceId,
            content: item.content,
            tags: JSON.stringify(item.tags),
            importance: item.importance,
            source: item.source,
            originMessageId: item.originMessageId,
            embedding: embeddingBuffer,
            disabled: item.disabled || false,
            evidenceCount: item.evidenceCount || 1,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            lastSeenAt: new Date(item.lastSeenAt || item.createdAt),
          };
          
          await db.insert(memoryItems).values(newMemoryItem);
          count++;
        } catch (error) {
          errors.push(`Erreur migration mémoire ${item.id}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Erreur parsing mémoire JSON: ${error}`);
    }

    return { count, errors };
  }

  /**
   * Migre les documents RAG avec leurs statistiques
   */
  private async migrateRagDocuments(
    workspaceId: string,
    docsJson: string,
    statsJson?: string,
    favoritesJson?: string
  ): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const docsData: LocalStorageRagDoc[] = JSON.parse(docsJson);
      
      // Parser les statistiques et favoris
      let stats: Record<string, { useCount: number; lastUsed: string }> = {};
      let favorites: string[] = [];
      
      if (statsJson) {
        try {
          stats = JSON.parse(statsJson);
        } catch (e) {
          errors.push(`Erreur parsing stats RAG: ${e}`);
        }
      }
      
      if (favoritesJson) {
        try {
          favorites = JSON.parse(favoritesJson);
        } catch (e) {
          errors.push(`Erreur parsing favoris RAG: ${e}`);
        }
      }
      
      for (const doc of docsData) {
        try {
          // Créer le document
          const newRagDoc: NewRagDocument = {
            id: doc.id,
            workspaceId,
            title: doc.titre,
            content: doc.contenu,
            origin: doc.origine === 'utilisateur' ? 'user' : 'folder',
            extension: doc.extension,
            fileSize: doc.contenu.length,
          };
          
          await db.insert(ragDocuments).values(newRagDoc);
          
          // Créer les statistiques si elles existent
          const docStats = stats[doc.id];
          if (docStats || favorites.includes(doc.id)) {
            const newDocStats: NewDocumentStats = {
              documentId: doc.id,
              useCount: docStats?.useCount || 0,
              lastUsedAt: docStats?.lastUsed ? new Date(docStats.lastUsed) : undefined,
              isFavorite: favorites.includes(doc.id),
            };
            
            await db.insert(documentStats).values(newDocStats);
          }
          
          count++;
        } catch (error) {
          errors.push(`Erreur migration document RAG ${doc.id}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Erreur parsing documents RAG JSON: ${error}`);
    }

    return { count, errors };
  }

  /**
   * Migre les configurations utilisateur
   */
  private async migrateUserSettings(
    localStorageData: Record<string, string>
  ): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    // Configurations globales à migrer
    const globalSettings = [
      'llm_provider',
      'auto_rag_enabled',
      'auto_web_enabled',
      'auto_rag_keywords',
      'auto_web_keywords',
      'mode_enfant',
      'mode_enfant_pin',
      'mode_prive',
      'nc_active_workspace',
    ];

    for (const key of globalSettings) {
      if (localStorageData[key]) {
        try {
          const newSetting: NewUserSetting = {
            workspaceId: null, // Configuration globale
            key,
            value: localStorageData[key],
          };
          
          await db.insert(userSettings).values(newSetting);
          count++;
        } catch (error) {
          errors.push(`Erreur migration setting ${key}: ${error}`);
        }
      }
    }

    return { count, errors };
  }

  /**
   * Migre les presets de configuration
   */
  private async migratePresets(
    workspaceId: string,
    presetsJson: string
  ): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const presetsData: any[] = JSON.parse(presetsJson);
      
      for (const [index, preset] of presetsData.entries()) {
        try {
          const newPreset: NewConfigurationPreset = {
            id: `${workspaceId}-preset-${Date.now()}-${index}`,
            workspaceId,
            name: preset.name || `Preset ${index + 1}`,
            config: JSON.stringify(preset),
          };
          
          await db.insert(configurationPresets).values(newPreset);
          count++;
        } catch (error) {
          errors.push(`Erreur migration preset ${index}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Erreur parsing presets JSON: ${error}`);
    }

    return { count, errors };
  }

  /**
   * Valide l'intégrité des données migrées
   */
  async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Vérifier que tous les workspaces ont au moins un ID valide
      const workspaceCount = await db.$count(workspaces);
      if (workspaceCount === 0) {
        issues.push('Aucun workspace trouvé après migration');
      }

      // Vérifier l'intégrité référentielle des discussions
      const orphanDiscussions = await db.query.discussions.findMany({
        where: (discussions, { notExists, eq }) =>
          notExists(
            db.select().from(workspaces).where(eq(workspaces.id, discussions.workspaceId))
          ),
      });
      
      if (orphanDiscussions.length > 0) {
        issues.push(`${orphanDiscussions.length} discussions orphelines détectées`);
      }

      // Vérifier l'intégrité référentielle des messages
      const orphanMessages = await db.query.messages.findMany({
        where: (messages, { notExists, eq }) =>
          notExists(
            db.select().from(discussions).where(eq(discussions.id, messages.discussionId))
          ),
      });
      
      if (orphanMessages.length > 0) {
        issues.push(`${orphanMessages.length} messages orphelins détectés`);
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Erreur lors de la validation: ${error}`);
      return {
        isValid: false,
        issues,
      };
    }
  }

  /**
   * Nettoie les données localStorage après migration réussie
   */
  cleanupLocalStorage(keysToClean: string[]): void {
    // Cette méthode sera appelée côté frontend
    // On ne peut pas accéder à localStorage depuis le backend
    console.log('Clés à nettoyer:', keysToClean);
  }
}