// Service de détection contextuelle avancée
export interface ContextualPattern {
  type: 'correction' | 'update' | 'addition' | 'inference';
  pattern: RegExp;
  handler: (match: RegExpMatchArray, context: string[]) => DetectedChange | null;
  priority: number;
}

export interface DetectedChange {
  type: 'correction' | 'update' | 'addition' | 'inference';
  oldContent?: string;
  newContent: string;
  category: string;
  confidence: number;
  reasoning: string;
}

export class ContextualDetectionService {
  private patterns: ContextualPattern[] = [
    // === CORRECTIONS ===
    {
      type: 'correction',
      pattern: /(?:non|pas|en fait|en réalité|je me suis trompé|correction|plutôt|au contraire),?\s*(.+)/i,
      handler: (match, context) => this.handleCorrection(match, context),
      priority: 10
    },
    {
      type: 'correction',
      pattern: /(?:avant|précédemment|auparavant)\s+(.+),?\s*(?:mais|maintenant|désormais|aujourd'hui)\s+(.+)/i,
      handler: (match, context) => this.handleBeforeAfter(match, context),
      priority: 9
    },

    // === MISES À JOUR ===
    {
      type: 'update',
      pattern: /(?:maintenant|désormais|depuis|à partir de|dorénavant)\s+(.+)/i,
      handler: (match, context) => this.handleUpdate(match, context),
      priority: 8
    },
    {
      type: 'update',
      pattern: /(?:j'ai changé|j'ai déménagé|j'ai quitté|j'ai commencé|j'ai arrêté)\s+(.+)/i,
      handler: (match, context) => this.handleLifeChange(match, context),
      priority: 8
    },

    // === INFÉRENCES ===
    {
      type: 'inference',
      pattern: /(?:donc|alors|cela veut dire|ça signifie|par conséquent)\s+(.+)/i,
      handler: (match, context) => this.handleInference(match, context),
      priority: 6
    },
    {
      type: 'inference',
      pattern: /(?:puisque|étant donné que|vu que|comme)\s+(.+)/i,
      handler: (match, context) => this.handleCausalInference(match, context),
      priority: 6
    },

    // === ADDITIONS CONTEXTUELLES ===
    {
      type: 'addition',
      pattern: /(?:d'ailleurs|en plus|aussi|également|de plus|par ailleurs)\s+(.+)/i,
      handler: (match, context) => this.handleAddition(match, context),
      priority: 7
    }
  ];

  /**
   * Détecte les changements contextuels dans un message
   */
  public detectContextualChanges(
    message: string,
    conversationHistory: string[],
    existingMemory: Array<{content: string, category?: string}>
  ): DetectedChange[] {
    const changes: DetectedChange[] = [];
    
    for (const pattern of this.patterns) {
      const match = message.match(pattern.pattern);
      if (match) {
        const change = pattern.handler(match, conversationHistory);
        if (change) {
          // Vérifier si le changement est cohérent avec la mémoire existante
          const isCoherent = this.validateChangeCoherence(change, existingMemory);
          if (isCoherent) {
            changes.push(change);
          }
        }
      }
    }

    return changes.sort((a, b) => (this.patterns.find(p => p.type === a.type)?.priority || 0) - 
                                   (this.patterns.find(p => p.type === b.type)?.priority || 0));
  }

  /**
   * Gère les corrections explicites
   */
  private handleCorrection(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const correction = match[1].trim();
    const category = this.inferCategory(correction);
    
    // Chercher dans le contexte récent ce qui pourrait être corrigé
    const recentContext = context.slice(-3).join(' ');
    const oldInfo = this.extractPreviousInfo(recentContext, category);
    
    return {
      type: 'correction',
      oldContent: oldInfo,
      newContent: correction,
      category,
      confidence: 0.9,
      reasoning: `Correction explicite détectée: "${correction}"`
    };
  }

  /**
   * Gère les patterns "avant/maintenant"
   */
  private handleBeforeAfter(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const before = match[1].trim();
    const after = match[2].trim();
    const category = this.inferCategory(after);
    
    return {
      type: 'correction',
      oldContent: before,
      newContent: after,
      category,
      confidence: 0.85,
      reasoning: `Changement temporel détecté: "${before}" → "${after}"`
    };
  }

  /**
   * Gère les mises à jour
   */
  private handleUpdate(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const update = match[1].trim();
    const category = this.inferCategory(update);
    
    return {
      type: 'update',
      newContent: update,
      category,
      confidence: 0.8,
      reasoning: `Mise à jour détectée: "${update}"`
    };
  }

  /**
   * Gère les changements de vie
   */
  private handleLifeChange(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const change = match[1].trim();
    const category = this.inferCategoryFromLifeChange(match[0]);
    
    return {
      type: 'update',
      newContent: change,
      category,
      confidence: 0.85,
      reasoning: `Changement de vie détecté: "${change}"`
    };
  }

  /**
   * Gère les inférences
   */
  private handleInference(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const inference = match[1].trim();
    const category = this.inferCategory(inference);
    
    return {
      type: 'inference',
      newContent: inference,
      category,
      confidence: 0.7,
      reasoning: `Inférence logique: "${inference}"`
    };
  }

  /**
   * Gère les inférences causales
   */
  private handleCausalInference(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const cause = match[1].trim();
    const category = this.inferCategory(cause);
    
    // Analyser le contexte pour déduire l'effet
    const contextText = context.slice(-2).join(' ');
    const effect = this.deduceEffect(cause, contextText);
    
    return {
      type: 'inference',
      newContent: effect || cause,
      category,
      confidence: 0.6,
      reasoning: `Inférence causale basée sur: "${cause}"`
    };
  }

  /**
   * Gère les additions contextuelles
   */
  private handleAddition(match: RegExpMatchArray, context: string[]): DetectedChange | null {
    const addition = match[1].trim();
    const category = this.inferCategory(addition);
    
    return {
      type: 'addition',
      newContent: addition,
      category,
      confidence: 0.75,
      reasoning: `Information complémentaire: "${addition}"`
    };
  }

  /**
   * Infère la catégorie d'une information
   */
  private inferCategory(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Mots-clés par catégorie
    const categoryKeywords = {
      identité: ['nom', 'prénom', 'âge', 'ans', 'appelle', 'suis'],
      localisation: ['habite', 'vis', 'ville', 'quartier', 'région', 'pays', 'déménagé'],
      profession: ['travaille', 'métier', 'profession', 'job', 'entreprise', 'école', 'étudiant'],
      préférences: ['aime', 'adore', 'préfère', 'déteste', 'favori', 'goût'],
      relations: ['mari', 'femme', 'enfant', 'fils', 'fille', 'parent', 'ami', 'copain'],
      santé: ['maladie', 'allergie', 'médicament', 'traitement', 'santé', 'allergique'],
      habitudes: ['habitude', 'routine', 'tous les', 'chaque', 'souvent', 'toujours'],
      loisirs: ['sport', 'hobby', 'passion', 'joue', 'pratique', 'lecture', 'musique']
    };

    // Trouver la catégorie avec le plus de correspondances
    let bestCategory = 'général';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  /**
   * Infère la catégorie à partir d'un changement de vie
   */
  private inferCategoryFromLifeChange(changeText: string): string {
    const lowerText = changeText.toLowerCase();
    
    if (lowerText.includes('déménagé')) return 'localisation';
    if (lowerText.includes('changé') && lowerText.includes('job')) return 'profession';
    if (lowerText.includes('quitté') || lowerText.includes('commencé')) return 'profession';
    if (lowerText.includes('arrêté') || lowerText.includes('commencé')) return 'habitudes';
    
    return 'général';
  }

  /**
   * Extrait l'information précédente du contexte
   */
  private extractPreviousInfo(context: string, category: string): string | undefined {
    // Logique simplifiée pour extraire l'info précédente
    // Dans une vraie implémentation, on utiliserait l'IA ou des patterns plus sophistiqués
    return undefined;
  }

  /**
   * Déduit l'effet d'une cause
   */
  private deduceEffect(cause: string, context: string): string | undefined {
    // Logique simplifiée pour déduire l'effet
    // Dans une vraie implémentation, on utiliserait l'IA pour analyser le contexte
    return undefined;
  }

  /**
   * Valide la cohérence d'un changement avec la mémoire existante
   */
  private validateChangeCoherence(
    change: DetectedChange,
    existingMemory: Array<{content: string, category?: string}>
  ): boolean {
    // Vérifier s'il y a des conflits évidents
    const relatedFacts = existingMemory.filter(fact => 
      fact.category === change.category
    );

    // Si c'est une correction, vérifier qu'il y a quelque chose à corriger
    if (change.type === 'correction') {
      return relatedFacts.length > 0;
    }

    // Pour les autres types, accepter si pas de conflit majeur
    return true;
  }

  /**
   * Détecte les contradictions dans la mémoire
   */
  public detectContradictions(
    newFact: string,
    existingMemory: Array<{content: string, category?: string}>
  ): Array<{existing: string, conflict: string, severity: number}> {
    const contradictions: Array<{existing: string, conflict: string, severity: number}> = [];
    
    // Patterns de contradiction
    const contradictionPatterns = [
      {
        pattern: /j'ai (\d+) ans/i,
        conflictPattern: /j'ai (\d+) ans/i,
        severity: 0.9
      },
      {
        pattern: /j'habite (à|au|en) ([^,]+)/i,
        conflictPattern: /j'habite (à|au|en) ([^,]+)/i,
        severity: 0.8
      },
      {
        pattern: /je suis (un |une |)([^,]+)/i,
        conflictPattern: /je suis (un |une |)([^,]+)/i,
        severity: 0.7
      }
    ];

    for (const pattern of contradictionPatterns) {
      const newMatch = newFact.match(pattern.pattern);
      if (newMatch) {
        for (const fact of existingMemory) {
          const existingMatch = fact.content.match(pattern.conflictPattern);
          if (existingMatch && existingMatch[0] !== newMatch[0]) {
            contradictions.push({
              existing: fact.content,
              conflict: `Contradiction détectée entre "${existingMatch[0]}" et "${newMatch[0]}"`,
              severity: pattern.severity
            });
          }
        }
      }
    }

    return contradictions;
  }
}

export const contextualDetectionService = new ContextualDetectionService(); 