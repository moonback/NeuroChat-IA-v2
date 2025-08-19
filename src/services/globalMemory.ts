/**
 * 🧠 Service de Mémoire Globale - Mémoire Transversale des Conversations
 * 
 * Ce service permet au chat de maintenir une mémoire globale de toutes les conversations,
 * extraire des informations importantes et les réutiliser dans de nouvelles discussions.
 * 
 * Fonctionnalités :
 * - Extraction automatique d'informations des conversations
 * - Stockage structuré avec catégorisation
 * - Recherche sémantique dans la mémoire globale
 * - Intégration dans le prompt système
 * - Gestion de la confidentialité et des modes de sécurité
 */

export interface MemoryItem {
  id: string;
  content: string;
  category: 'personnalite' | 'preferences' | 'connaissances' | 'evenements' | 'projets' | 'relations' | 'autres';
  importance: number; // 1-5, 5 étant le plus important
  tags: string[];
  sourceConversation: string; // ID de la conversation source
  timestamp: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messages: Array<{
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>;
  summary: string;
  keyTopics: string[];
  timestamp: Date;
}

class GlobalMemoryService {
  private memory: MemoryItem[] = [];
  private conversations: ConversationSummary[] = [];
  private isInitialized = false;

  // Clés de stockage
  private readonly MEMORY_KEY = 'nc_global_memory';
  private readonly CONVERSATIONS_KEY = 'nc_conversation_summaries';

  /**
   * Initialise le service de mémoire globale
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Charger la mémoire existante
      await this.loadMemory();
      await this.loadConversations();
      this.isInitialized = true;
      console.log('🧠 Mémoire globale initialisée:', this.memory.length, 'éléments');
    } catch (error) {
      console.error('Erreur initialisation mémoire globale:', error);
      this.memory = [];
      this.conversations = [];
    }
  }

  /**
   * Extrait et mémorise les informations importantes d'une conversation
   */
  async processConversation(
    conversationId: string,
    title: string,
    messages: Array<{ text: string; isUser: boolean; timestamp: Date }>
  ): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    try {
      console.log(`🧠 Traitement conversation: ${conversationId} - ${title}`);
      console.log(`🧠 Messages à traiter: ${messages.length} (${messages.filter(m => m.isUser).length} utilisateur)`);

      // Créer un résumé de la conversation
      const summary = await this.generateConversationSummary(messages);
      const keyTopics = await this.extractKeyTopics(messages);

      console.log(`🧠 Résumé généré: ${summary}`);
      console.log(`🧠 Sujets clés: ${keyTopics.join(', ')}`);

      // Sauvegarder le résumé de la conversation
      const conversationSummary: ConversationSummary = {
        id: conversationId,
        title,
        messages,
        summary,
        keyTopics,
        timestamp: new Date()
      };

      this.conversations.push(conversationSummary);
      await this.saveConversations();

      console.log(`🧠 Résumé conversation sauvegardé`);

      // Extraire et mémoriser les informations importantes
      const newMemories = await this.extractMemories(messages, conversationId);
      
      console.log(`🧠 Souvenirs extraits: ${newMemories.length}`);
      newMemories.forEach((memory, index) => {
        console.log(`🧠 Souvenir ${index + 1}: [${memory.category}] ${memory.content}`);
      });

      for (const memory of newMemories) {
        await this.addMemory(memory);
      }

      console.log(`🧠 Conversation traitée: ${newMemories.length} nouveaux souvenirs extraits`);
      console.log(`🧠 Total souvenirs en mémoire: ${this.memory.length}`);
    } catch (error) {
      console.error('Erreur traitement conversation:', error);
    }
  }

  /**
   * Génère un résumé automatique d'une conversation
   */
  private async generateConversationSummary(messages: Array<{ text: string; isUser: boolean; timestamp: Date }>): Promise<string> {
    // Algorithme simple de résumé basé sur les mots-clés et la fréquence
    const userMessages = messages.filter(m => m.isUser).map(m => m.text);
    const allText = userMessages.join(' ').toLowerCase();
    
    // Extraire les mots les plus fréquents (excluant les mots communs)
    const commonWords = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'avec', 'pour', 'dans', 'sur', 'par', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'ce', 'cette', 'ces', 'un', 'une', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs']);
    
    const words = allText.split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.has(word) && /^[a-zàâäéèêëïîôöùûüÿç]+$/i.test(word)
    );
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    return `Discussion sur: ${topWords.join(', ')}`;
  }

  /**
   * Extrait les sujets clés d'une conversation
   */
  private async extractKeyTopics(messages: Array<{ text: string; isUser: boolean; timestamp: Date }>): Promise<string[]> {
    const userMessages = messages.filter(m => m.isUser).map(m => m.text);
    const allText = userMessages.join(' ').toLowerCase();
    
    // Détecter les sujets par patterns
    const topics: string[] = [];
    
    // Patterns pour différents types de sujets
    const patterns = [
      { pattern: /\b(travail|boulot|job|métier|profession|carrière)\b/gi, topic: 'Travail' },
      { pattern: /\b(famille|parents|enfants|mari|femme|conjoint)\b/gi, topic: 'Famille' },
      { pattern: /\b(amour|relation|couple|dating|romance)\b/gi, topic: 'Relations' },
      { pattern: /\b(santé|médecin|maladie|symptômes|traitement)\b/gi, topic: 'Santé' },
      { pattern: /\b(études|école|université|formation|apprentissage)\b/gi, topic: 'Éducation' },
      { pattern: /\b(hobbies|passions|loisirs|sport|musique|art)\b/gi, topic: 'Loisirs' },
      { pattern: /\b(voyage|vacances|déplacement|destination)\b/gi, topic: 'Voyages' },
      { pattern: /\b(technologie|informatique|programmation|IA|intelligence artificielle)\b/gi, topic: 'Technologie' },
      { pattern: /\b(finance|argent|économie|investissement|budget)\b/gi, topic: 'Finance' },
      { pattern: /\b(politique|actualité|société|environnement)\b/gi, topic: 'Actualités' }
    ];
    
    patterns.forEach(({ pattern, topic }) => {
      if (pattern.test(allText)) {
        topics.push(topic);
      }
    });
    
    return [...new Set(topics)]; // Supprimer les doublons
  }

  /**
   * Extrait les informations mémorisables d'une conversation
   */
  private async extractMemories(messages: Array<{ text: string; isUser: boolean; timestamp: Date }>, conversationId: string): Promise<MemoryItem[]> {
    const memories: MemoryItem[] = [];
    const userMessages = messages.filter(m => m.isUser);
    
    console.log(`🧠 Extraction souvenirs de ${userMessages.length} messages utilisateur`);
    
    for (const message of userMessages) {
      const text = message.text.toLowerCase();
      console.log(`🧠 Traitement message: "${message.text.substring(0, 50)}..."`);
      
      // Patterns pour détecter les informations personnelles
      const patterns = [
        // Préférences
        { 
          regex: /\b(j'?aime|j'?adore|je préfère|je déteste|je n'?aime pas|j'?apprécie|je kiffe)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'preferences' as const,
          importance: 3
        },
        // Informations personnelles
        {
          regex: /\b(je suis|j'?ai|mon nom est|j'?habite|je travaille|je fais|j'?étudie|je me sens|je pense|je crois)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'personnalite' as const,
          importance: 4
        },
        // Projets et objectifs
        {
          regex: /\b(je veux|j'?aimerais|mon objectif|mon projet|je prévois|je compte|je souhaite|je rêve de|je planifie)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'projets' as const,
          importance: 4
        },
        // Relations
        {
          regex: /\b(mon ami|ma copine|mon mari|ma femme|mes parents|ma famille|mon frère|ma sœur|mon collègue|mon partenaire)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'relations' as const,
          importance: 3
        },
        // Événements
        {
          regex: /\b(hier|aujourd'hui|demain|la semaine|le mois|l'?année|ce matin|ce soir|ce weekend|pendant|quand)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'evenements' as const,
          importance: 2
        },
        // Connaissances et expériences
        {
          regex: /\b(j'?ai appris|j'?ai découvert|j'?ai vécu|j'?ai fait|j'?ai vu|j'?ai lu|j'?ai entendu)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'connaissances' as const,
          importance: 3
        },
        // Opinions et sentiments
        {
          regex: /\b(je trouve|je pense que|je crois que|je sens que|je ressens|je me sens|je me trouve)\s+(.+?)(?=\s|$|[.!?])/gi,
          category: 'personnalite' as const,
          importance: 3
        }
      ];
      
      patterns.forEach(({ regex, category, importance }) => {
        const matches = text.matchAll(regex);
        for (const match of matches) {
          if (match[2]) {
            const content = match[2].trim();
            if (content.length > 5 && content.length < 200) {
              const memory: MemoryItem = {
                id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: content.charAt(0).toUpperCase() + content.slice(1),
                category,
                importance,
                tags: this.extractTags(content),
                sourceConversation: conversationId,
                timestamp: new Date(),
                lastAccessed: new Date(),
                accessCount: 0
              };
              
              memories.push(memory);
              console.log(`🧠 Souvenir créé: [${category}] "${content}"`);
            }
          }
        }
      });
    }
    
    console.log(`🧠 Total souvenirs extraits: ${memories.length}`);
    return memories;
  }

  /**
   * Extrait des tags automatiques d'un contenu
   */
  private extractTags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const tags: string[] = [];
    
    // Ajouter des tags basés sur le contenu
    if (content.includes('travail') || content.includes('boulot')) tags.push('travail');
    if (content.includes('famille') || content.includes('parents')) tags.push('famille');
    if (content.includes('amour') || content.includes('relation')) tags.push('amour');
    if (content.includes('santé') || content.includes('médecin')) tags.push('santé');
    if (content.includes('études') || content.includes('école')) tags.push('éducation');
    if (content.includes('hobby') || content.includes('passion')) tags.push('loisirs');
    if (content.includes('voyage') || content.includes('vacances')) tags.push('voyages');
    if (content.includes('technologie') || content.includes('informatique')) tags.push('tech');
    
    // Ajouter les mots-clés les plus significatifs
    const significantWords = words.filter(word => 
      word.length > 4 && 
      !['avec', 'pour', 'dans', 'sur', 'par', 'cette', 'depuis', 'pendant'].includes(word)
    );
    
    tags.push(...significantWords.slice(0, 3));
    
    return [...new Set(tags)].slice(0, 5); // Max 5 tags
  }

  /**
   * Ajoute un nouvel élément de mémoire
   */
  async addMemory(memory: MemoryItem): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    // Vérifier si une mémoire similaire existe déjà
    const existingIndex = this.memory.findIndex(m => 
      this.calculateSimilarity(m.content, memory.content) > 0.8
    );
    
    if (existingIndex >= 0) {
      // Mettre à jour la mémoire existante
      this.memory[existingIndex] = {
        ...this.memory[existingIndex],
        content: memory.content, // Mettre à jour le contenu
        importance: Math.max(this.memory[existingIndex].importance, memory.importance),
        tags: [...new Set([...this.memory[existingIndex].tags, ...memory.tags])],
        lastAccessed: new Date(),
        accessCount: this.memory[existingIndex].accessCount + 1
      };
    } else {
      // Ajouter une nouvelle mémoire
      this.memory.push(memory);
    }
    
    await this.saveMemory();
  }

  /**
   * Calcule la similarité entre deux textes (algorithme simple)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Recherche des souvenirs pertinents pour un contexte donné
   */
  async searchRelevantMemories(query: string, limit: number = 5): Promise<MemoryItem[]> {
    if (!this.isInitialized) await this.initialize();
    
    // Recherche simple par mots-clés et similarité
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scoredMemories = this.memory.map(memory => {
      let score = 0;
      
      // Score par importance
      score += memory.importance * 2;
      
      // Score par fréquence d'accès
      score += Math.min(memory.accessCount, 10);
      
      // Score par mots-clés
      const memoryWords = memory.content.toLowerCase().split(/\s+/);
      const matchingWords = queryWords.filter(word => 
        memoryWords.some(mw => mw.includes(word) || word.includes(mw))
      );
      score += matchingWords.length * 3;
      
      // Score par tags
      const matchingTags = memory.tags.filter(tag => 
        queryWords.some(word => tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase()))
      );
      score += matchingTags.length * 2;
      
      return { memory, score };
    });
    
    // Trier par score et retourner les meilleurs
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        // Mettre à jour les statistiques d'accès
        item.memory.lastAccessed = new Date();
        item.memory.accessCount++;
        return item.memory;
      });
  }

  /**
   * Génère un contexte de mémoire pour le prompt système
   */
  async generateMemoryContext(query: string, maxItems: number = 3): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    
    const relevantMemories = await this.searchRelevantMemories(query, maxItems);
    
    if (relevantMemories.length === 0) {
      return '';
    }
    
    let context = 'MÉMOIRE GLOBALE (informations des conversations précédentes) :\n';
    
    relevantMemories.forEach((memory, index) => {
      context += `${index + 1}. [${memory.category.toUpperCase()}] ${memory.content}\n`;
      if (memory.tags.length > 0) {
        context += `   Tags: ${memory.tags.join(', ')}\n`;
      }
      context += '\n';
    });
    
    return context;
  }

  /**
   * Sauvegarde la mémoire en localStorage
   */
  private async saveMemory(): Promise<void> {
    try {
      localStorage.setItem(this.MEMORY_KEY, JSON.stringify(this.memory));
    } catch (error) {
      console.error('Erreur sauvegarde mémoire:', error);
    }
  }

  /**
   * Charge la mémoire depuis localStorage
   */
  private async loadMemory(): Promise<void> {
    try {
      const saved = localStorage.getItem(this.MEMORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.memory = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          lastAccessed: new Date(item.lastAccessed)
        }));
      }
    } catch (error) {
      console.error('Erreur chargement mémoire:', error);
      this.memory = [];
    }
  }

  /**
   * Sauvegarde les résumés de conversations
   */
  private async saveConversations(): Promise<void> {
    try {
      localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(this.conversations));
    } catch (error) {
      console.error('Erreur sauvegarde conversations:', error);
    }
  }

  /**
   * Charge les résumés de conversations
   */
  private async loadConversations(): Promise<void> {
    try {
      const saved = localStorage.getItem(this.CONVERSATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.conversations = parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      this.conversations = [];
    }
  }

  /**
   * Obtient des statistiques sur la mémoire
   */
  getMemoryStats(): { total: number; byCategory: Record<string, number>; recent: number } {
    const byCategory: Record<string, number> = {};
    this.memory.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    });
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recent = this.memory.filter(item => item.timestamp > oneWeekAgo).length;
    
    return {
      total: this.memory.length,
      byCategory,
      recent
    };
  }

  /**
   * Récupère tous les souvenirs
   */
  getAllMemories(): MemoryItem[] {
    return [...this.memory].sort((a, b) => 
      new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    );
  }

  /**
   * Récupère toutes les conversations
   */
  getAllConversations(): ConversationSummary[] {
    return [...this.conversations].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Récupère un souvenir par ID
   */
  getMemoryById(id: string): MemoryItem | undefined {
    return this.memory.find(m => m.id === id);
  }

  /**
   * Supprime un souvenir par ID
   */
  async deleteMemory(id: string): Promise<void> {
    const index = this.memory.findIndex(m => m.id === id);
    if (index >= 0) {
      this.memory.splice(index, 1);
      await this.saveMemory();
      console.log(`🧠 Souvenir supprimé: ${id}`);
    }
  }

  /**
   * Met à jour un souvenir existant
   */
  async updateMemory(updatedMemory: MemoryItem): Promise<void> {
    const index = this.memory.findIndex(m => m.id === updatedMemory.id);
    if (index >= 0) {
      this.memory[index] = {
        ...updatedMemory,
        lastAccessed: new Date(),
        accessCount: this.memory[index].accessCount + 1
      };
      await this.saveMemory();
      console.log(`🧠 Souvenir mis à jour: ${updatedMemory.id}`);
    }
  }

  /**
   * Nettoie la mémoire (supprime les éléments anciens et peu importants)
   */
  async cleanupMemory(maxItems: number = 1000): Promise<void> {
    if (this.memory.length <= maxItems) return;
    
    // Trier par importance et date d'accès
    this.memory.sort((a, b) => {
      const scoreA = a.importance * 2 + Math.min(a.accessCount, 10);
      const scoreB = b.importance * 2 + Math.min(b.accessCount, 10);
      return scoreB - scoreA;
    });
    
    // Garder seulement les meilleurs éléments
    this.memory = this.memory.slice(0, maxItems);
    await this.saveMemory();
    
    console.log(`🧠 Mémoire nettoyée: ${this.memory.length} éléments conservés`);
  }

  /**
   * Exporte la mémoire pour sauvegarde
   */
  exportMemory(): string {
    return JSON.stringify({
      memory: this.memory,
      conversations: this.conversations,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Importe la mémoire depuis une sauvegarde
   */
  async importMemory(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);
      if (parsed.memory && Array.isArray(parsed.memory)) {
        this.memory = parsed.memory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          lastAccessed: new Date(item.lastAccessed)
        }));
      }
      if (parsed.conversations && Array.isArray(parsed.conversations)) {
        this.conversations = parsed.conversations.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
      
      await this.saveMemory();
      await this.saveConversations();
      console.log('🧠 Mémoire importée avec succès');
    } catch (error) {
      console.error('Erreur import mémoire:', error);
      throw new Error('Format de sauvegarde invalide');
    }
  }

  /**
   * Efface toute la mémoire
   */
  async clearMemory(): Promise<void> {
    this.memory = [];
    this.conversations = [];
    await this.saveMemory();
    await this.saveConversations();
    console.log('🧠 Mémoire globale effacée');
  }

  /**
   * Crée des souvenirs de test pour vérifier le fonctionnement
   */
  async createTestMemories(): Promise<void> {
    const testMemories: MemoryItem[] = [
      {
        id: `test_${Date.now()}_1`,
        content: 'J\'aime la programmation et l\'intelligence artificielle',
        category: 'preferences',
        importance: 4,
        tags: ['programmation', 'IA', 'tech'],
        sourceConversation: 'test_conversation',
        timestamp: new Date(),
        lastAccessed: new Date(),
        accessCount: 1
      },
      {
        id: `test_${Date.now()}_2`,
        content: 'Je travaille comme développeur web',
        category: 'personnalite',
        importance: 5,
        tags: ['travail', 'développeur', 'web'],
        sourceConversation: 'test_conversation',
        timestamp: new Date(),
        lastAccessed: new Date(),
        accessCount: 1
      },
      {
        id: `test_${Date.now()}_3`,
        content: 'Mon projet est de créer une application de chat IA',
        category: 'projets',
        importance: 5,
        tags: ['projet', 'chat', 'IA', 'application'],
        sourceConversation: 'test_conversation',
        timestamp: new Date(),
        lastAccessed: new Date(),
        accessCount: 1
      }
    ];

    for (const memory of testMemories) {
      await this.addMemory(memory);
    }

    console.log('🧠 Souvenirs de test créés:', testMemories.length);
  }
}

// Instance singleton
export const globalMemoryService = new GlobalMemoryService();

// Fonction d'initialisation automatique
export const initializeGlobalMemory = () => globalMemoryService.initialize();
