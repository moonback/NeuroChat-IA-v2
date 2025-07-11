import { type MemoryFact, type SearchOptions, type SearchResult } from './types';

export class MemorySearchService {
  private static instance: MemorySearchService;
  private searchHistory: string[] = [];
  
  public static getInstance(): MemorySearchService {
    if (!MemorySearchService.instance) {
      MemorySearchService.instance = new MemorySearchService();
    }
    return MemorySearchService.instance;
  }

  /**
   * Recherche avancée dans les faits mémoire
   */
  search(facts: MemoryFact[], options: SearchOptions): SearchResult[] {
    let results: SearchResult[] = [];

    // Recherche de base
    results = this.basicSearch(facts, options);

    // Recherche floue si activée
    if (options.fuzzySearch && results.length < 5) {
      const fuzzyResults = this.fuzzySearch(facts, options);
      results = this.mergeResults(results, fuzzyResults);
    }

    // Recherche contextuelle si activée
    if (options.contextual && results.length < 10) {
      const contextualResults = this.contextualSearch(facts, options);
      results = this.mergeResults(results, contextualResults);
    }

    // Filtrage par critères
    results = this.applyFilters(results, options);

    // Tri par pertinence
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Ajouter à l'historique
    this.addToHistory(options.query);

    return results;
  }

  /**
   * Recherche de base par mots-clés
   */
  private basicSearch(facts: MemoryFact[], options: SearchOptions): SearchResult[] {
    const query = options.query.toLowerCase();
    const queryWords = query.split(/\s+/).filter(word => word.length > 2);
    
    return facts.map(fact => {
      const content = fact.content.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];

      // Correspondance exacte
      if (content.includes(query)) {
        score += 1.0;
        matchedTerms.push(query);
      }

      // Correspondance par mots
      for (const word of queryWords) {
        if (content.includes(word)) {
          score += 0.3;
          matchedTerms.push(word);
        }

        // Bonus pour correspondance de mot entier
        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (wordRegex.test(content)) {
          score += 0.2;
        }
      }

      // Bonus pour correspondance dans les tags
      if (fact.tags) {
        for (const tag of fact.tags) {
          if (tag.toLowerCase().includes(query)) {
            score += 0.4;
            matchedTerms.push(tag);
          }
        }
      }

      return {
        fact,
        relevanceScore: score,
        matchedTerms: [...new Set(matchedTerms)],
        contextSnippet: this.extractSnippet(fact.content, query)
      };
    }).filter(result => result.relevanceScore > 0);
  }

  /**
   * Recherche floue avec tolérance aux fautes de frappe
   */
  private fuzzySearch(facts: MemoryFact[], options: SearchOptions): SearchResult[] {
    const query = options.query.toLowerCase();
    const queryWords = query.split(/\s+/);
    
    return facts.map(fact => {
      const content = fact.content.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];

      for (const queryWord of queryWords) {
        if (queryWord.length < 3) continue;

        const words = content.split(/\s+/);
        for (const word of words) {
          const similarity = this.calculateLevenshteinSimilarity(queryWord, word);
          
          // Tolérance pour fautes de frappe (similarité > 0.7)
          if (similarity > 0.7) {
            score += similarity * 0.4;
            matchedTerms.push(word);
          }
        }
      }

      return {
        fact,
        relevanceScore: score,
        matchedTerms: [...new Set(matchedTerms)],
        contextSnippet: this.extractSnippet(fact.content, query)
      };
    }).filter(result => result.relevanceScore > 0);
  }

  /**
   * Recherche contextuelle basée sur le sens
   */
  private contextualSearch(facts: MemoryFact[], options: SearchOptions): SearchResult[] {
    const query = options.query.toLowerCase();
    
    // Dictionnaire de synonymes et concepts liés
    const contextMap: { [key: string]: string[] } = {
      'travail': ['métier', 'profession', 'emploi', 'job', 'bureau', 'collègue', 'patron', 'entreprise'],
      'famille': ['parent', 'enfant', 'mari', 'femme', 'frère', 'sœur', 'fils', 'fille', 'époux', 'épouse'],
      'maison': ['habite', 'adresse', 'domicile', 'logement', 'appartement', 'résidence'],
      'santé': ['médecin', 'maladie', 'allergie', 'traitement', 'hôpital', 'pharmacie', 'symptôme'],
      'loisir': ['hobby', 'passion', 'sport', 'lecture', 'musique', 'cinéma', 'voyage'],
      'âge': ['né', 'naissance', 'anniversaire', 'jeune', 'vieux', 'ancien'],
      'nom': ['appelle', 'prénom', 'surname', 'pseudonyme', 'surnom'],
      'contact': ['téléphone', 'email', 'adresse', 'numéro', 'coordonnées']
    };

    return facts.map(fact => {
      const content = fact.content.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];

      // Recherche par concepts
      for (const [concept, synonyms] of Object.entries(contextMap)) {
        if (query.includes(concept)) {
          for (const synonym of synonyms) {
            if (content.includes(synonym)) {
              score += 0.25;
              matchedTerms.push(synonym);
            }
          }
        }

        // Recherche inverse (query contient un synonyme)
        for (const synonym of synonyms) {
          if (query.includes(synonym)) {
            if (content.includes(concept) || synonyms.some(s => content.includes(s))) {
              score += 0.2;
              matchedTerms.push(concept);
            }
          }
        }
      }

      return {
        fact,
        relevanceScore: score,
        matchedTerms: [...new Set(matchedTerms)],
        contextSnippet: this.extractSnippet(fact.content, query)
      };
    }).filter(result => result.relevanceScore > 0);
  }

  /**
   * Applique les filtres de recherche
   */
  private applyFilters(results: SearchResult[], options: SearchOptions): SearchResult[] {
    let filtered = results;

    // Filtre par catégories
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(result => 
        result.fact.category && options.categories!.includes(result.fact.category)
      );
    }

    // Filtre par importance
    if (options.importance && options.importance.length > 0) {
      filtered = filtered.filter(result => 
        result.fact.importance && options.importance!.includes(result.fact.importance)
      );
    }

    // Filtre par date
    if (options.dateRange) {
      const { start, end } = options.dateRange;
      filtered = filtered.filter(result => {
        const factDate = new Date(result.fact.date);
        return factDate >= start && factDate <= end;
      });
    }

    return filtered;
  }

  /**
   * Fusionne les résultats en évitant les doublons
   */
  private mergeResults(results1: SearchResult[], results2: SearchResult[]): SearchResult[] {
    const merged = [...results1];
    const existingIds = new Set(results1.map(r => r.fact.id));

    for (const result of results2) {
      if (!existingIds.has(result.fact.id)) {
        merged.push(result);
        existingIds.add(result.fact.id);
      } else {
        // Améliorer le score si le fait existe déjà
        const existing = merged.find(r => r.fact.id === result.fact.id);
        if (existing) {
          existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore);
          existing.matchedTerms = [...new Set([...existing.matchedTerms, ...result.matchedTerms])];
        }
      }
    }

    return merged;
  }

  /**
   * Calcule la similarité de Levenshtein entre deux mots
   */
  private calculateLevenshteinSimilarity(word1: string, word2: string): number {
    const distance = this.levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  /**
   * Calcule la distance de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Extrait un snippet contextuel
   */
  private extractSnippet(content: string, query: string, maxLength: number = 150): string {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    
    if (queryIndex === -1) {
      return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }

    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(content.length, queryIndex + query.length + 50);
    
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  /**
   * Gestion de l'historique de recherche
   */
  addToHistory(query: string): void {
    if (query.trim().length < 2) return;
    
    // Supprimer si déjà présent
    this.searchHistory = this.searchHistory.filter(h => h !== query);
    
    // Ajouter en début
    this.searchHistory.unshift(query);
    
    // Limiter à 50 entrées
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }

    // Sauvegarder en localStorage
    try {
      localStorage.setItem('memory-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Impossible de sauvegarder l\'historique de recherche:', error);
    }
  }

  getSearchHistory(): string[] {
    if (this.searchHistory.length === 0) {
      try {
        const saved = localStorage.getItem('memory-search-history');
        if (saved) {
          this.searchHistory = JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Impossible de charger l\'historique de recherche:', error);
      }
    }
    
    return this.searchHistory;
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    try {
      localStorage.removeItem('memory-search-history');
    } catch (error) {
      console.warn('Impossible de supprimer l\'historique de recherche:', error);
    }
  }

  /**
   * Suggestions de recherche basées sur l'historique et le contenu
   */
  getSuggestions(query: string, facts: MemoryFact[], maxSuggestions: number = 5): string[] {
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Suggestions de l'historique
    for (const historyItem of this.searchHistory) {
      if (historyItem.toLowerCase().includes(queryLower) && historyItem !== query) {
        suggestions.add(historyItem);
      }
    }

    // Suggestions basées sur les tags et catégories
    for (const fact of facts) {
      if (fact.tags) {
        for (const tag of fact.tags) {
          if (tag.toLowerCase().includes(queryLower) && tag !== query) {
            suggestions.add(tag);
          }
        }
      }
    }

    // Suggestions basées sur des mots fréquents
    const words = facts
      .flatMap(fact => fact.content.toLowerCase().split(/\s+/))
      .filter(word => word.length > 3 && word.includes(queryLower))
      .slice(0, 10);

    words.forEach(word => suggestions.add(word));

    return Array.from(suggestions).slice(0, maxSuggestions);
  }
} 