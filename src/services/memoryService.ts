import { pipeline } from "@xenova/transformers";

export interface MemoryFact {
  id: string;
  content: string;
  category: MemoryCategory;
  confidence: number;
  date: string;
  source: 'auto' | 'manual';
}

export type MemoryCategory = 
  | 'identité'
  | 'localisation'
  | 'préférences'
  | 'professionnel'
  | 'personnel'
  | 'relations'
  | 'habitudes'
  | 'objectifs'
  | 'santé'
  | 'loisirs'
  | 'éducation'
  | 'autre';

export interface DetectionPattern {
  regex: RegExp;
  label: string;
  category: MemoryCategory;
  confidence: number;
  formatter?: (match: RegExpMatchArray) => string;
  validate?: (text: string) => boolean;
}

export interface SemanticExample {
  text: string;
  category: MemoryCategory;
  weight: number;
}

class MemoryService {
  private embedder: any = null;
  private embedderPromise: Promise<any> | null = null;
  private documentEmbeddings: Map<string, number[]> = new Map();

  // Patterns améliorés pour la détection automatique
  private detectionPatterns: DetectionPattern[] = [
    // Identité
    {
      regex: /je m'appelle ([\w\-\s]+)/i,
      label: "prénom",
      category: "identité",
      confidence: 0.95,
      formatter: (match) => `Le prénom de l'utilisateur est ${match[1].trim()}`
    },
    {
      regex: /mon prénom est ([\w\-\s]+)/i,
      label: "prénom",
      category: "identité",
      confidence: 0.9,
      formatter: (match) => `Le prénom de l'utilisateur est ${match[1].trim()}`
    },
    {
      regex: /on m'appelle ([\w\-\s]+)/i,
      label: "surnom",
      category: "identité",
      confidence: 0.85,
      formatter: (match) => `Le surnom de l'utilisateur est ${match[1].trim()}`
    },
    {
      regex: /mon nom (de famille )?est ([\w\-\s]+)/i,
      label: "nom",
      category: "identité",
      confidence: 0.9,
      formatter: (match) => `Le nom de famille de l'utilisateur est ${match[2].trim()}`
    },
    {
      regex: /j'ai (\d+) ans/i,
      label: "âge",
      category: "identité",
      confidence: 0.95,
      formatter: (match) => `L'utilisateur a ${match[1]} ans`
    },

    // Localisation
    {
      regex: /j'habite (à|au|en|aux|dans le|dans la|dans les)?\s?([\w\-\s]+)/i,
      label: "domicile",
      category: "localisation",
      confidence: 0.9,
      formatter: (match) => `L'utilisateur habite ${match[1] || 'à'} ${match[2].trim()}`
    },
    {
      regex: /je vis (à|au|en|aux|dans le|dans la|dans les)?\s?([\w\-\s]+)/i,
      label: "domicile",
      category: "localisation",
      confidence: 0.85,
      formatter: (match) => `L'utilisateur vit ${match[1] || 'à'} ${match[2].trim()}`
    },
    {
      regex: /je suis (originaire de|né\(?e\)? (à|au|en|aux|dans le|dans la|dans les)?)?\s?([\w\-\s]+)/i,
      label: "origine",
      category: "localisation",
      confidence: 0.8,
      formatter: (match) => `L'utilisateur est originaire de ${match[3]?.trim() || match[1]?.trim()}`
    },

    // Professionnel
    {
      regex: /je travaille comme ([\w\-\s]+)/i,
      label: "métier",
      category: "professionnel",
      confidence: 0.9,
      formatter: (match) => `L'utilisateur travaille comme ${match[1].trim()}`
    },
    {
      regex: /mon métier est ([\w\-\s]+)/i,
      label: "métier",
      category: "professionnel",
      confidence: 0.9,
      formatter: (match) => `Le métier de l'utilisateur est ${match[1].trim()}`
    },
    {
      regex: /je suis (un |une |)?([\w\-\s]+)/i,
      label: "métier",
      category: "professionnel",
      confidence: 0.7,
      formatter: (match) => `L'utilisateur est ${match[2].trim()}`,
      // Exclure les états temporaires
      validate: (text: string) => !/je suis (fatigué|content|heureux|triste|malade|prêt|prête|désolé|désolée|occupé|occupée|disponible|en forme|en retard|à l'heure|là|ici|ok|d'accord|prêt à|prête à|bien|mal|stressé|stressée|nerveux|nerveuse|calme|énervé|énervée|confus|confuse|perdu|perdue|sûr|sûre|inquiet|inquiète|rassuré|rassurée)/i.test(text)
    },
    {
      regex: /je travaille chez ([\w\-\s]+)/i,
      label: "entreprise",
      category: "professionnel",
      confidence: 0.85,
      formatter: (match) => `L'utilisateur travaille chez ${match[1].trim()}`
    },
    {
      regex: /j'étudie (à|au|en|aux|dans le|dans la|dans les)?\s?([\w\-\s]+)/i,
      label: "études",
      category: "éducation",
      confidence: 0.9,
      formatter: (match) => `L'utilisateur étudie ${match[1] || 'à'} ${match[2].trim()}`
    },

    // Préférences
    {
      regex: /mon (plat|repas|aliment) préféré(e)? (c'est|est) ([\w\-\s]+)/i,
      label: "préférence culinaire",
      category: "préférences",
      confidence: 0.85,
      formatter: (match) => `Le ${match[1]} préféré de l'utilisateur est ${match[4].trim()}`
    },
    {
      regex: /ma (couleur|musique|série|émission) préférée (c'est|est) ([\w\-\s]+)/i,
      label: "préférence",
      category: "préférences",
      confidence: 0.85,
      formatter: (match) => `La ${match[1]} préférée de l'utilisateur est ${match[3].trim()}`
    },
    {
      regex: /mon (sport|film|livre|jeu|hobby|artiste|groupe) préféré (c'est|est) ([\w\-\s]+)/i,
      label: "préférence",
      category: "préférences",
      confidence: 0.85,
      formatter: (match) => `Le ${match[1]} préféré de l'utilisateur est ${match[3].trim()}`
    },
    {
      regex: /j'adore (les?|la|le|l') ([\w\-\s]+)/i,
      label: "préférence positive",
      category: "préférences",
      confidence: 0.75,
      formatter: (match) => `L'utilisateur adore ${match[1]} ${match[2].trim()}`
    },
    {
      regex: /je déteste (les?|la|le|l') ([\w\-\s]+)/i,
      label: "préférence négative",
      category: "préférences",
      confidence: 0.75,
      formatter: (match) => `L'utilisateur déteste ${match[1]} ${match[2].trim()}`
    },

    // Personnel
    {
      regex: /je suis né(e)? le ([0-9]{1,2}[\/\-\s][0-9]{1,2}[\/\-\s][0-9]{4})/i,
      label: "date de naissance",
      category: "personnel",
      confidence: 0.95,
      formatter: (match) => `La date de naissance de l'utilisateur est le ${match[2]}`
    },
    {
      regex: /mon anniversaire (c'est|est) le ([0-9]{1,2}[\/\-\s][0-9]{1,2})/i,
      label: "anniversaire",
      category: "personnel",
      confidence: 0.9,
      formatter: (match) => `L'anniversaire de l'utilisateur est le ${match[2]}`
    },
    {
      regex: /j'ai (un |une |des |)([\w\-\s]+) qui s'appelle ([\w\-\s]+)/i,
      label: "relation",
      category: "relations",
      confidence: 0.85,
      formatter: (match) => `L'utilisateur a ${match[1]}${match[2].trim()} qui s'appelle ${match[3].trim()}`
    },

    // Habitudes
    {
      regex: /je (bois|mange|fais|joue|regarde|écoute|lis) (du|de la|des|de l'|le|la|les|un|une|)?\s?([\w\-\s]+) (tous les jours|chaque jour|souvent|régulièrement|parfois|rarement)/i,
      label: "habitude",
      category: "habitudes",
      confidence: 0.8,
      formatter: (match) => `L'utilisateur ${match[1]} ${match[2] || ''}${match[3].trim()} ${match[4]}`
    },

    // Objectifs
    {
      regex: /je veux (apprendre|améliorer|devenir|faire|acheter|visiter|voyager|étudier) ([\w\-\s]+)/i,
      label: "objectif",
      category: "objectifs",
      confidence: 0.8,
      formatter: (match) => `L'utilisateur veut ${match[1]} ${match[2].trim()}`
    },
    {
      regex: /mon objectif (c'est|est) (de |d'|)([\w\-\s]+)/i,
      label: "objectif",
      category: "objectifs",
      confidence: 0.85,
      formatter: (match) => `L'objectif de l'utilisateur est ${match[2]}${match[3].trim()}`
    },

    // Santé
    {
      regex: /je suis (allergique|intolérant|sensible) (à|au|aux|à la|à l') ([\w\-\s]+)/i,
      label: "santé",
      category: "santé",
      confidence: 0.9,
      formatter: (match) => `L'utilisateur est ${match[1]} ${match[2]} ${match[3].trim()}`
    },
    {
      regex: /j'ai (des |une |un |)([\w\-\s]+) (médicaux?|de santé|chroniques?)/i,
      label: "santé",
      category: "santé",
      confidence: 0.85,
      formatter: (match) => `L'utilisateur a ${match[1]}${match[2].trim()} ${match[3]}`
    }
  ];

  // Exemples sémantiques enrichis par catégorie
  private semanticExamples: SemanticExample[] = [
    // Identité
    { text: "Je m'appelle Marie", category: "identité", weight: 1.0 },
    { text: "Mon prénom est Paul", category: "identité", weight: 1.0 },
    { text: "J'ai 25 ans", category: "identité", weight: 0.9 },
    { text: "Je suis français", category: "identité", weight: 0.8 },
    { text: "On m'appelle Max", category: "identité", weight: 0.9 },
    
    // Localisation
    { text: "J'habite à Paris", category: "localisation", weight: 1.0 },
    { text: "Je vis à Marseille", category: "localisation", weight: 1.0 },
    { text: "Je suis originaire de Lyon", category: "localisation", weight: 0.9 },
    { text: "Je viens de Toulouse", category: "localisation", weight: 0.9 },
    { text: "Ma ville natale est Nice", category: "localisation", weight: 0.8 },
    
    // Professionnel
    { text: "Je suis développeur", category: "professionnel", weight: 1.0 },
    { text: "Je travaille comme infirmière", category: "professionnel", weight: 1.0 },
    { text: "Mon métier est enseignant", category: "professionnel", weight: 1.0 },
    { text: "Je suis médecin", category: "professionnel", weight: 1.0 },
    { text: "J'étudie l'informatique", category: "éducation", weight: 0.9 },
    
    // Préférences
    { text: "Ma couleur préférée est le bleu", category: "préférences", weight: 1.0 },
    { text: "Je préfère le thé au café", category: "préférences", weight: 1.0 },
    { text: "J'adore la pizza", category: "préférences", weight: 0.9 },
    { text: "Je déteste les épinards", category: "préférences", weight: 0.9 },
    { text: "Mon plat préféré est les pâtes", category: "préférences", weight: 0.9 },
    
    // Personnel
    { text: "Je suis né le 15 juin 1990", category: "personnel", weight: 1.0 },
    { text: "Mon anniversaire est le 20 décembre", category: "personnel", weight: 1.0 },
    { text: "J'ai deux enfants", category: "relations", weight: 0.9 },
    { text: "Je suis marié", category: "relations", weight: 0.9 },
    
    // Loisirs
    { text: "Mon sport favori est le tennis", category: "loisirs", weight: 1.0 },
    { text: "Ma passion est la photographie", category: "loisirs", weight: 1.0 },
    { text: "Mon animal préféré est le chat", category: "loisirs", weight: 0.9 },
    { text: "J'aime lire des romans", category: "loisirs", weight: 0.8 },
    
    // Habitudes
    { text: "Je fais du sport tous les jours", category: "habitudes", weight: 0.9 },
    { text: "Je me lève à 7h chaque matin", category: "habitudes", weight: 0.8 },
    { text: "Je bois du café le matin", category: "habitudes", weight: 0.7 },
    
    // Objectifs
    { text: "Je veux apprendre l'espagnol", category: "objectifs", weight: 0.9 },
    { text: "Mon objectif est de voyager", category: "objectifs", weight: 0.9 },
    { text: "J'aimerais devenir chef", category: "objectifs", weight: 0.8 },
    
    // Santé
    { text: "Je suis allergique aux cacahuètes", category: "santé", weight: 1.0 },
    { text: "J'ai des problèmes de dos", category: "santé", weight: 0.9 },
    { text: "Je suis végétarien", category: "santé", weight: 0.8 }
  ];

  private async getEmbedder() {
    if (!this.embedder) {
      if (!this.embedderPromise) {
        this.embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      }
      this.embedder = await this.embedderPromise;
    }
    return this.embedder;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Détecte automatiquement les informations pertinentes dans un texte
   */
  public detectInformationInText(text: string): MemoryFact[] {
    const facts: MemoryFact[] = [];
    
    for (const pattern of this.detectionPatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        // Vérifier la validation personnalisée si elle existe
        if (pattern.validate && !pattern.validate(text)) {
          continue;
        }

        const content = pattern.formatter 
          ? pattern.formatter(match)
          : `${pattern.label}: ${match[1]?.trim() || match[0]}`;
        
        const fact: MemoryFact = {
          id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content,
          category: pattern.category,
          confidence: pattern.confidence,
          date: new Date().toISOString(),
          source: 'auto'
        };
        
        facts.push(fact);
      }
    }
    
    return facts;
  }

  /**
   * Analyse sémantique avancée d'un texte
   */
  public async analyzeSemanticRelevance(
    text: string, 
    threshold: number = 0.7,
    categoryFilter?: MemoryCategory[]
  ): Promise<{
    isRelevant: boolean;
    confidence: number;
    suggestedCategory: MemoryCategory;
    topMatches: Array<{
      example: string;
      similarity: number;
      category: MemoryCategory;
    }>;
  }> {
    try {
      const embedder = await this.getEmbedder();
      const [inputEmbedding] = await embedder(text);
      
      // Filtrer les exemples par catégorie si spécifié
      const filteredExamples = categoryFilter 
        ? this.semanticExamples.filter(ex => categoryFilter.includes(ex.category))
        : this.semanticExamples;
      
      // Calculer les embeddings si pas encore fait
      const similarities = await Promise.all(
        filteredExamples.map(async (example) => {
          const key = example.text;
          if (!this.documentEmbeddings.has(key)) {
            const [embedding] = await embedder(example.text);
            this.documentEmbeddings.set(key, embedding);
          }
          
          const similarity = this.cosineSimilarity(
            inputEmbedding, 
            this.documentEmbeddings.get(key)!
          );
          
          // Appliquer le poids de l'exemple
          const weightedSimilarity = similarity * example.weight;
          
          return {
            example: example.text,
            similarity: weightedSimilarity,
            category: example.category,
            originalSimilarity: similarity
          };
        })
      );
      
      // Trier par similarité décroissante
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      const topMatches = similarities.slice(0, 5);
      const maxSimilarity = topMatches[0]?.similarity || 0;
      
      // Déterminer la catégorie suggérée basée sur les meilleurs matches
      const categoryScores = new Map<MemoryCategory, number>();
      topMatches.slice(0, 3).forEach(match => {
        const currentScore = categoryScores.get(match.category) || 0;
        categoryScores.set(match.category, currentScore + match.similarity);
      });
      
      const suggestedCategory = Array.from(categoryScores.entries())
        .reduce((a, b) => a[1] > b[1] ? a : b)[0] || 'autre';
      
      return {
        isRelevant: maxSimilarity > threshold,
        confidence: maxSimilarity,
        suggestedCategory,
        topMatches: topMatches.map(m => ({
          example: m.example,
          similarity: m.similarity,
          category: m.category
        }))
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse sémantique:', error);
      return {
        isRelevant: false,
        confidence: 0,
        suggestedCategory: 'autre',
        topMatches: []
      };
    }
  }

  /**
   * Combine détection automatique et analyse sémantique
   */
  public async processText(
    text: string, 
    semanticThreshold: number = 0.7
  ): Promise<{
    autoDetectedFacts: MemoryFact[];
    semanticAnalysis: {
      isRelevant: boolean;
      confidence: number;
      suggestedCategory: MemoryCategory;
      topMatches: Array<{
        example: string;
        similarity: number;
        category: MemoryCategory;
      }>;
    };
    recommendations: string[];
  }> {
    const autoDetectedFacts = this.detectInformationInText(text);
    const semanticAnalysis = await this.analyzeSemanticRelevance(text, semanticThreshold);
    
    const recommendations: string[] = [];
    
    // Recommandations basées sur l'analyse
    if (autoDetectedFacts.length > 0) {
      recommendations.push(`${autoDetectedFacts.length} information(s) détectée(s) automatiquement`);
    }
    
    if (semanticAnalysis.isRelevant && autoDetectedFacts.length === 0) {
      recommendations.push(
        `Information potentiellement pertinente (${(semanticAnalysis.confidence * 100).toFixed(1)}% de confiance)`
      );
      recommendations.push(`Catégorie suggérée: ${semanticAnalysis.suggestedCategory}`);
    }
    
    if (semanticAnalysis.topMatches.length > 0) {
      const topMatch = semanticAnalysis.topMatches[0];
      recommendations.push(
        `Similaire à: "${topMatch.example}" (${(topMatch.similarity * 100).toFixed(1)}%)`
      );
    }
    
    return {
      autoDetectedFacts,
      semanticAnalysis,
      recommendations
    };
  }

  /**
   * Valide et catégorise une information manuelle
   */
  public async validateManualInformation(
    info: string,
    threshold: number = 0.7
  ): Promise<{
    isValid: boolean;
    suggestedFact?: MemoryFact;
    analysis: {
      isRelevant: boolean;
      confidence: number;
      suggestedCategory: MemoryCategory;
      topMatches: Array<{
        example: string;
        similarity: number;
        category: MemoryCategory;
      }>;
    };
  }> {
    // D'abord essayer la détection automatique
    const autoFacts = this.detectInformationInText(info);
    if (autoFacts.length > 0) {
      return {
        isValid: true,
        suggestedFact: {
          ...autoFacts[0],
          source: 'manual'
        },
        analysis: await this.analyzeSemanticRelevance(info, threshold)
      };
    }
    
    // Sinon utiliser l'analyse sémantique
    const analysis = await this.analyzeSemanticRelevance(info, threshold);
    
    if (analysis.isRelevant) {
      const suggestedFact: MemoryFact = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: info,
        category: analysis.suggestedCategory,
        confidence: analysis.confidence,
        date: new Date().toISOString(),
        source: 'manual'
      };
      
      return {
        isValid: true,
        suggestedFact,
        analysis
      };
    }
    
    return {
      isValid: false,
      analysis
    };
  }

  /**
   * Obtient les exemples sémantiques pour une catégorie
   */
  public getSemanticExamplesByCategory(category?: MemoryCategory): SemanticExample[] {
    return category 
      ? this.semanticExamples.filter(ex => ex.category === category)
      : this.semanticExamples;
  }

  /**
   * Ajoute un nouvel exemple sémantique
   */
  public addSemanticExample(text: string, category: MemoryCategory, weight: number = 1.0): void {
    this.semanticExamples.push({ text, category, weight });
    // Nettoyer le cache d'embeddings pour cette phrase
    this.documentEmbeddings.delete(text);
  }

  /**
   * Obtient les catégories disponibles
   */
  public getAvailableCategories(): MemoryCategory[] {
    return [
      'identité',
      'localisation', 
      'préférences',
      'professionnel',
      'personnel',
      'relations',
      'habitudes',
      'objectifs',
      'santé',
      'loisirs',
      'éducation',
      'autre'
    ];
  }

  /**
   * Obtient les statistiques des patterns de détection
   */
  public getDetectionStats(): {
    totalPatterns: number;
    patternsByCategory: Record<MemoryCategory, number>;
    averageConfidence: number;
  } {
    const patternsByCategory = this.detectionPatterns.reduce((acc, pattern) => {
      acc[pattern.category] = (acc[pattern.category] || 0) + 1;
      return acc;
    }, {} as Record<MemoryCategory, number>);
    
    const averageConfidence = this.detectionPatterns.reduce((sum, pattern) => 
      sum + pattern.confidence, 0) / this.detectionPatterns.length;
    
    return {
      totalPatterns: this.detectionPatterns.length,
      patternsByCategory,
      averageConfidence
    };
  }
}

// Instance singleton
export const memoryService = new MemoryService(); 