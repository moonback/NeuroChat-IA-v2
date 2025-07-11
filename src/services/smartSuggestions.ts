// Service de suggestions intelligentes pour la mémoire
export interface SuggestionRule {
  trigger: string[];
  category: string;
  questions: string[];
  priority: number;
  contextRequired?: string[];
}

export interface SmartSuggestion {
  id: string;
  question: string;
  category: string;
  priority: number;
  confidence: number;
  context: string;
}

export class SmartSuggestionsService {
  private suggestionRules: SuggestionRule[] = [
    // === IDENTITÉ ===
    {
      trigger: ["appelle", "nom", "prénom"],
      category: "identité",
      questions: [
        "Quel est votre nom de famille ?",
        "Avez-vous un surnom ?",
        "Quel âge avez-vous ?",
        "Quelle est votre date de naissance ?"
      ],
      priority: 9
    },
    {
      trigger: ["âge", "ans", "vieux", "jeune"],
      category: "identité",
      questions: [
        "Quelle est votre date de naissance exacte ?",
        "Dans quelle ville êtes-vous né(e) ?",
        "Quel est votre signe astrologique ?"
      ],
      priority: 7
    },

    // === LOCALISATION ===
    {
      trigger: ["habite", "vis", "ville", "quartier"],
      category: "localisation",
      questions: [
        "Depuis combien de temps habitez-vous là ?",
        "D'où venez-vous originellement ?",
        "Quel est votre quartier préféré ?",
        "Avez-vous déjà vécu ailleurs ?"
      ],
      priority: 8
    },
    {
      trigger: ["déménagé", "déménager", "nouveau", "nouvel"],
      category: "localisation",
      questions: [
        "Où habitiez-vous avant ?",
        "Qu'est-ce qui vous a motivé à déménager ?",
        "Comment trouvez-vous votre nouveau quartier ?"
      ],
      priority: 8
    },

    // === PROFESSION ===
    {
      trigger: ["travaille", "job", "métier", "profession", "boulot"],
      category: "profession",
      questions: [
        "Dans quelle entreprise travaillez-vous ?",
        "Depuis combien de temps exercez-vous ce métier ?",
        "Qu'est-ce qui vous plaît le plus dans votre travail ?",
        "Avez-vous des projets professionnels ?"
      ],
      priority: 9
    },
    {
      trigger: ["étudiant", "étude", "école", "université"],
      category: "profession",
      questions: [
        "Que étudiez-vous exactement ?",
        "Dans quelle école/université ?",
        "En quelle année êtes-vous ?",
        "Quels sont vos projets après les études ?"
      ],
      priority: 8
    },

    // === PRÉFÉRENCES ===
    {
      trigger: ["aime", "adore", "préfère", "déteste"],
      category: "préférences",
      questions: [
        "Quels sont vos autres hobbies ?",
        "Quel est votre genre de musique préféré ?",
        "Avez-vous des plats que vous détestez ?",
        "Quel type de films regardez-vous ?"
      ],
      priority: 6
    },
    {
      trigger: ["cuisine", "manger", "plat", "restaurant"],
      category: "préférences",
      questions: [
        "Cuisinez-vous souvent ?",
        "Quel est votre restaurant préféré ?",
        "Avez-vous des allergies alimentaires ?",
        "Quel type de cuisine préférez-vous ?"
      ],
      priority: 7
    },

    // === RELATIONS ===
    {
      trigger: ["mari", "femme", "conjoint", "copain", "copine"],
      category: "relations",
      questions: [
        "Depuis combien de temps êtes-vous ensemble ?",
        "Où vous êtes-vous rencontrés ?",
        "Avez-vous des enfants ?",
        "Vivez-vous ensemble ?"
      ],
      priority: 8
    },
    {
      trigger: ["enfant", "fils", "fille", "bébé"],
      category: "relations",
      questions: [
        "Quel âge ont vos enfants ?",
        "Quels sont leurs prénoms ?",
        "Vont-ils à l'école ?",
        "Quelles sont leurs activités préférées ?"
      ],
      priority: 9
    },

    // === LOISIRS ===
    {
      trigger: ["sport", "joue", "pratique", "entrainement"],
      category: "loisirs",
      questions: [
        "Depuis combien de temps pratiquez-vous ?",
        "À quelle fréquence vous entraînez-vous ?",
        "Faites-vous de la compétition ?",
        "Quel est votre niveau ?"
      ],
      priority: 7
    },
    {
      trigger: ["lecture", "livre", "roman", "lire"],
      category: "loisirs",
      questions: [
        "Quel est votre genre littéraire préféré ?",
        "Qui est votre auteur préféré ?",
        "Combien de livres lisez-vous par an ?",
        "Quel est le dernier livre que vous avez lu ?"
      ],
      priority: 6
    },

    // === SANTÉ ===
    {
      trigger: ["allergique", "allergie", "médicament", "traitement"],
      category: "santé",
      questions: [
        "Avez-vous d'autres allergies ?",
        "Prenez-vous d'autres médicaments ?",
        "Avez-vous des problèmes de santé chroniques ?",
        "Faites-vous du sport pour votre santé ?"
      ],
      priority: 8
    },

    // === VOYAGES ===
    {
      trigger: ["voyage", "vacances", "pays", "étranger"],
      category: "voyages",
      questions: [
        "Quel est votre pays préféré ?",
        "Où aimeriez-vous voyager prochainement ?",
        "Préférez-vous les voyages organisés ou l'aventure ?",
        "Quel a été votre plus beau voyage ?"
      ],
      priority: 6
    }
  ];

  private usedSuggestions: Set<string> = new Set();

  /**
   * Génère des suggestions basées sur le contexte de conversation
   */
  generateSuggestions(
    conversationHistory: string[],
    existingMemory: Array<{content: string, category?: string}>,
    maxSuggestions: number = 3
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const conversationText = conversationHistory.join(' ').toLowerCase();
    
    // Catégories déjà couvertes par la mémoire
    const coveredCategories = new Set(
      existingMemory.map(m => m.category).filter(Boolean)
    );

    // Analyser chaque règle de suggestion
    for (const rule of this.suggestionRules) {
      const hasMatchingTrigger = rule.trigger.some(trigger => 
        conversationText.includes(trigger.toLowerCase())
      );

      if (hasMatchingTrigger) {
        // Calculer la confidence basée sur le nombre de triggers
        const matchingTriggers = rule.trigger.filter(trigger => 
          conversationText.includes(trigger.toLowerCase())
        ).length;
        
        const confidence = Math.min(0.9, 0.5 + (matchingTriggers * 0.2));
        
        // Bonus si la catégorie n'est pas encore couverte
        const priorityBonus = coveredCategories.has(rule.category) ? 0 : 2;
        
        // Générer des suggestions pour cette règle
        for (const question of rule.questions) {
          const suggestionId = `${rule.category}-${question}`;
          
          // Éviter les doublons
          if (this.usedSuggestions.has(suggestionId)) continue;
          
          // Vérifier si la question n'est pas déjà répondue
          if (this.isAlreadyAnswered(question, existingMemory)) continue;
          
          suggestions.push({
            id: suggestionId,
            question,
            category: rule.category,
            priority: rule.priority + priorityBonus,
            confidence,
            context: `Basé sur: "${rule.trigger.join(', ')}"`
          });
        }
      }
    }

    // Trier par priorité et confiance
    suggestions.sort((a, b) => {
      const scoreA = a.priority * a.confidence;
      const scoreB = b.priority * b.confidence;
      return scoreB - scoreA;
    });

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Vérifie si une question est déjà répondue dans la mémoire
   */
  private isAlreadyAnswered(question: string, memory: Array<{content: string}>): boolean {
    const questionWords = question.toLowerCase().split(/\s+/);
    const keyWords = questionWords.filter(word => 
      !['quel', 'quelle', 'quels', 'quelles', 'où', 'comment', 'combien', 'depuis', 'avez', 'vous', 'êtes', 'est', 'votre', 'vos', 'le', 'la', 'les', 'de', 'du', 'des', 'à', 'au', 'aux', 'dans', 'sur', 'pour', 'avec', 'sans'].includes(word)
    );

    return memory.some(fact => {
      const factWords = fact.content.toLowerCase().split(/\s+/);
      return keyWords.some(keyword => factWords.includes(keyword));
    });
  }

  /**
   * Marque une suggestion comme utilisée
   */
  markSuggestionUsed(suggestionId: string): void {
    this.usedSuggestions.add(suggestionId);
  }

  /**
   * Génère une suggestion contextuelle spécifique
   */
  generateContextualSuggestion(
    lastMessage: string,
    category: string
  ): SmartSuggestion | null {
    const rule = this.suggestionRules.find(r => r.category === category);
    if (!rule) return null;

    const hasContext = rule.trigger.some(trigger => 
      lastMessage.toLowerCase().includes(trigger.toLowerCase())
    );

    if (!hasContext) return null;

    const randomQuestion = rule.questions[Math.floor(Math.random() * rule.questions.length)];
    
    return {
      id: `contextual-${category}-${Date.now()}`,
      question: randomQuestion,
      category,
      priority: rule.priority,
      confidence: 0.8,
      context: `Contexte: "${lastMessage}"`
    };
  }

  /**
   * Analyse les lacunes dans la mémoire
   */
  analyzeMemoryGaps(memory: Array<{content: string, category?: string}>): {
    missingCategories: string[];
    suggestions: SmartSuggestion[];
  } {
    const presentCategories = new Set(
      memory.map(m => m.category).filter(Boolean)
    );

    const allCategories = new Set(
      this.suggestionRules.map(r => r.category)
    );

    const missingCategories = Array.from(allCategories).filter(
      cat => !presentCategories.has(cat)
    );

    const suggestions = missingCategories.map(category => {
      const rule = this.suggestionRules.find(r => r.category === category);
      if (!rule) return null;

      return {
        id: `gap-${category}`,
        question: rule.questions[0],
        category,
        priority: rule.priority + 3, // Bonus pour les lacunes
        confidence: 0.7,
        context: `Manque d'informations sur: ${category}`
      };
    }).filter(Boolean) as SmartSuggestion[];

    return {
      missingCategories,
      suggestions: suggestions.sort((a, b) => b.priority - a.priority)
    };
  }

  /**
   * Nettoie les suggestions utilisées (garde seulement les 100 dernières)
   */
  cleanUsedSuggestions(): void {
    if (this.usedSuggestions.size > 100) {
      const suggestions = Array.from(this.usedSuggestions);
      this.usedSuggestions = new Set(suggestions.slice(-100));
    }
  }
}

export const smartSuggestionsService = new SmartSuggestionsService(); 