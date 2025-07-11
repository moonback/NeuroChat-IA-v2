import { MEMORY_CATEGORIES, type MemoryCategory, type MemoryFact } from './types';

export class MemoryDetectionService {
  private static instance: MemoryDetectionService;
  
  public static getInstance(): MemoryDetectionService {
    if (!MemoryDetectionService.instance) {
      MemoryDetectionService.instance = new MemoryDetectionService();
    }
    return MemoryDetectionService.instance;
  }

  /**
   * Détecte automatiquement la catégorie d'un texte
   */
  detectCategory(text: string): { category: string; confidence: number } | null {
    const normalizedText = text.toLowerCase();
    const scores: { [key: string]: number } = {};

    // Calcul du score pour chaque catégorie
    for (const category of MEMORY_CATEGORIES) {
      scores[category.id] = this.calculateCategoryScore(normalizedText, category);
    }

    // Trouver la catégorie avec le meilleur score
    const bestCategory = Object.entries(scores).reduce((best, [categoryId, score]) => {
      return score > best.score ? { categoryId, score } : best;
    }, { categoryId: '', score: 0 });

    // Seuil minimum de confiance
    if (bestCategory.score < 0.3) {
      return null;
    }

    return {
      category: bestCategory.categoryId,
      confidence: Math.min(bestCategory.score, 1.0)
    };
  }

  /**
   * Calcule le score de correspondance pour une catégorie
   */
  private calculateCategoryScore(text: string, category: MemoryCategory): number {
    let score = 0;
    const words = text.split(/\s+/);
    
    // Score basé sur les mots-clés
    for (const keyword of category.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 0.2;
        
        // Bonus si le mot-clé est un mot entier
        if (words.includes(keyword.toLowerCase())) {
          score += 0.1;
        }
      }
    }

    // Score basé sur la proximité sémantique avec les exemples
    for (const example of category.examples) {
      const similarity = this.calculateTextSimilarity(text, example.toLowerCase());
      score += similarity * 0.3;
    }

    return score;
  }

  /**
   * Calcule la similarité entre deux textes
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Détecte l'importance d'un fait mémoire
   */
  detectImportance(text: string, category?: string): 'low' | 'medium' | 'high' {
    const normalizedText = text.toLowerCase();
    
    // Mots-clés indiquant une haute importance
    const highImportanceKeywords = [
      'important', 'crucial', 'essentiel', 'urgent', 'critique',
      'médecin', 'urgence', 'allergie', 'maladie', 'accident',
      'mot de passe', 'sécurité', 'secret', 'confidentiel',
      'anniversaire', 'mariage', 'naissance', 'décès'
    ];

    // Mots-clés indiquant une importance moyenne
    const mediumImportanceKeywords = [
      'travail', 'profession', 'étude', 'formation',
      'famille', 'ami', 'relation', 'contact',
      'adresse', 'téléphone', 'email', 'rdv', 'rendez-vous'
    ];

    // Vérification des mots-clés de haute importance
    for (const keyword of highImportanceKeywords) {
      if (normalizedText.includes(keyword)) {
        return 'high';
      }
    }

    // Importance basée sur la catégorie
    if (category) {
      switch (category) {
        case 'health':
        case 'identity':
          return 'high';
        case 'work':
        case 'family':
        case 'location':
          return 'medium';
        default:
          break;
      }
    }

    // Vérification des mots-clés d'importance moyenne
    for (const keyword of mediumImportanceKeywords) {
      if (normalizedText.includes(keyword)) {
        return 'medium';
      }
    }

    // Longueur du texte comme indicateur d'importance
    if (text.length > 100) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Extrait automatiquement des tags d'un texte
   */
  extractTags(text: string, category?: string): string[] {
    const tags: string[] = [];
    const normalizedText = text.toLowerCase();

    // Tags basés sur les patterns communs
    const tagPatterns: { [key: string]: RegExp[] } = {
      'date': [/\d{1,2}\/\d{1,2}\/\d{4}/, /\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/],
      'âge': [/\d{1,3}\s+ans?/],
      'lieu': [/à\s+([A-Z][a-zA-ZÀ-ÿ]+)/],
      'nom': [/s'appelle?\s+([A-Z][a-zA-ZÀ-ÿ]+)/],
      'profession': [/(ingénieur|médecin|avocat|professeur|développeur|designer|manager)/],
      'contact': [/\d{10}/, /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/]
    };

    for (const [tag, patterns] of Object.entries(tagPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          tags.push(tag);
          break;
        }
      }
    }

    // Tags spécifiques à la catégorie
    if (category) {
      const categoryObject = MEMORY_CATEGORIES.find(cat => cat.id === category);
      if (categoryObject) {
        tags.push(categoryObject.name.toLowerCase());
      }
    }

    return [...new Set(tags)]; // Supprime les doublons
  }

  /**
   * Analyse complète d'un texte pour créer un MemoryFact enrichi
   */
  analyzeText(content: string): Partial<MemoryFact> {
    const detection = this.detectCategory(content);
    const category = detection?.category;
    const importance = this.detectImportance(content, category);
    const tags = this.extractTags(content, category);

    return {
      content,
      category,
      importance,
      tags,
      confidence: detection?.confidence,
      date: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Obtient les statistiques des catégories pour une liste de faits
   */
  getCategoryStats(facts: MemoryFact[]): { [categoryId: string]: number } {
    const stats: { [categoryId: string]: number } = {};
    
    // Initialiser toutes les catégories à 0
    for (const category of MEMORY_CATEGORIES) {
      stats[category.id] = 0;
    }

    // Compter les faits par catégorie
    for (const fact of facts) {
      if (fact.category) {
        stats[fact.category] = (stats[fact.category] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Suggère des catégories manquantes basées sur l'analyse des faits existants
   */
  suggestMissingCategories(facts: MemoryFact[]): string[] {
    const existingCategories = new Set(facts.map(f => f.category).filter(Boolean));
    const allCategories = MEMORY_CATEGORIES.map(c => c.id);
    
    return allCategories.filter(categoryId => !existingCategories.has(categoryId));
  }
} 