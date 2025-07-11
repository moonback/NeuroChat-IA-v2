// Service avancé de détection d'informations à mémoriser
// Utilise l'apprentissage automatique et l'analyse contextuelle

export interface DetectionPattern {
  regex: RegExp;
  category: string;
  template: string;
  confidence: number;
  exclude?: RegExp;
  contextWords?: string[];
}

export interface DetectedInfo {
  content: string;
  category: string;
  confidence: number;
  source: 'regex' | 'semantic' | 'contextual';
}

export interface ConversationContext {
  previousMessages: string[];
  currentTopic?: string;
  userMood?: string;
  timeOfDay?: string;
}

export class MemoryDetectionService {
  private patterns: DetectionPattern[] = [
    // === IDENTITÉ PERSONNELLE ===
    {
      regex: /(?:je m'appelle|mon prénom est|on m'appelle|je suis) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "identité",
      template: "Le prénom de l'utilisateur est {1}",
      confidence: 0.9,
      contextWords: ["nom", "prénom", "appelle"]
    },
    {
      regex: /(?:j'ai|je vais avoir|je fais|j'aurai bientôt) ([0-9]{1,2}) ans/i,
      category: "identité",
      template: "L'utilisateur a {1} ans",
      confidence: 0.85,
      contextWords: ["âge", "ans", "anniversaire"]
    },
    {
      regex: /(?:je suis|je me considère comme|on dit que je suis) (?:un |une |plutôt |assez |très )?([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "personnalité",
      template: "L'utilisateur est {1}",
      confidence: 0.75,
      exclude: /(?:fatigué|content|heureux|triste|malade|prêt|désolé|occupé|disponible|en forme|en retard|à l'heure|là|ici|ok|d'accord|sûr|certain)/i,
      contextWords: ["personnalité", "caractère", "tempérament"]
    },

    // === LOCALISATION ET ORIGINE ===
    {
      regex: /(?:j'habite|je vis|je réside|je demeure) (?:à|au|en|aux|dans|sur|près de) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "localisation",
      template: "L'utilisateur habite {1}",
      confidence: 0.85,
      contextWords: ["habite", "ville", "quartier", "région"]
    },
    {
      regex: /(?:je viens de|je suis originaire de|je suis né à|mes origines sont) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "localisation",
      template: "L'utilisateur vient de {1}",
      confidence: 0.8,
      contextWords: ["origine", "né", "vient"]
    },
    {
      regex: /(?:j'ai déménagé|j'ai vécu|j'ai grandi) (?:à|au|en|aux|dans) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "localisation",
      template: "L'utilisateur a vécu {1}",
      confidence: 0.7,
      contextWords: ["déménagé", "vécu", "grandi"]
    },

    // === PROFESSION ET ÉTUDES ===
    {
      regex: /(?:je travaille|je bosse|je taffe) (?:comme|en tant que|chez) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "profession",
      template: "L'utilisateur travaille comme {1}",
      confidence: 0.9,
      contextWords: ["travail", "métier", "profession", "job"]
    },
    {
      regex: /(?:j'étudie|je fais des études|je suis étudiant en) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "profession",
      template: "L'utilisateur étudie {1}",
      confidence: 0.85,
      contextWords: ["étude", "étudiant", "université", "école"]
    },
    {
      regex: /(?:mon entreprise|ma boîte|ma société) (?:s'appelle|est|c'est) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "profession",
      template: "L'utilisateur travaille chez {1}",
      confidence: 0.8,
      contextWords: ["entreprise", "société", "boîte"]
    },

    // === PRÉFÉRENCES ET GOÛTS ===
    {
      regex: /(?:j'adore|je déteste|j'aime beaucoup|je n'aime pas du tout) (?:le|la|les|l') ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "préférences",
      template: "L'utilisateur {0} {1}",
      confidence: 0.8,
      contextWords: ["adore", "déteste", "aime", "préfère"]
    },
    {
      regex: /(?:mon plat préféré|ma cuisine favorite|j'adore manger) (?:est |c'est |sont )?([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "préférences",
      template: "Le plat préféré de l'utilisateur est {1}",
      confidence: 0.85,
      contextWords: ["plat", "manger", "cuisine", "repas"]
    },
    {
      regex: /(?:ma musique préférée|j'écoute surtout|mon style musical) (?:est |c'est |sont )?([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "préférences",
      template: "La musique préférée de l'utilisateur est {1}",
      confidence: 0.8,
      contextWords: ["musique", "écoute", "chanson", "artiste"]
    },

    // === RELATIONS FAMILIALES ===
    {
      regex: /(?:mon mari|ma femme|mon conjoint|ma conjointe|mon partenaire) (?:s'appelle|est|c'est) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "relations",
      template: "Le conjoint de l'utilisateur s'appelle {1}",
      confidence: 0.9,
      contextWords: ["mari", "femme", "conjoint", "partenaire"]
    },
    {
      regex: /(?:mon fils|ma fille|mon enfant) (?:s'appelle|est|c'est) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "relations",
      template: "L'enfant de l'utilisateur s'appelle {1}",
      confidence: 0.9,
      contextWords: ["enfant", "fils", "fille", "bébé"]
    },
    {
      regex: /(?:mes parents|mon père|ma mère) (?:s'appellent|s'appelle|habitent?) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "relations",
      template: "Les parents de l'utilisateur : {1}",
      confidence: 0.85,
      contextWords: ["parent", "père", "mère", "famille"]
    },

    // === HABITUDES ET ROUTINE ===
    {
      regex: /(?:je me lève|je me couche|je travaille|je mange) (?:à|vers|aux alentours de) ([0-9]{1,2}h?[0-9]{0,2})/i,
      category: "habitudes",
      template: "Habitude de l'utilisateur : {0}",
      confidence: 0.7,
      contextWords: ["habitude", "routine", "emploi du temps"]
    },
    {
      regex: /(?:tous les|chaque|le) ([a-zéû]+) (?:je|j'ai l'habitude de|j'aime) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "habitudes",
      template: "Habitude de l'utilisateur : {1} {2}",
      confidence: 0.75,
      contextWords: ["tous", "chaque", "habitude", "routine"]
    },

    // === SANTÉ ET BIEN-ÊTRE ===
    {
      regex: /(?:je suis allergique|j'ai une allergie|je ne supporte pas|je ne peux pas manger) (?:à|aux|du|de la|des) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "santé",
      template: "Allergie de l'utilisateur : {1}",
      confidence: 0.9,
      contextWords: ["allergie", "allergique", "supporte", "intolérance"]
    },
    {
      regex: /(?:je prends|je dois prendre|mon traitement|mon médicament) (?:est |c'est |sont )?([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "santé",
      template: "Traitement de l'utilisateur : {1}",
      confidence: 0.85,
      contextWords: ["médicament", "traitement", "santé", "prendre"]
    },

    // === LOISIRS ET PASSIONS ===
    {
      regex: /(?:ma passion|mon hobby|j'adore|je pratique) (?:est |c'est |sont )?([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "loisirs",
      template: "Passion de l'utilisateur : {1}",
      confidence: 0.8,
      contextWords: ["passion", "hobby", "loisir", "pratique"]
    },
    {
      regex: /(?:je joue|j'aime jouer|je fais du sport|je pratique) (?:à|au|aux|du|de la|des) ([A-Za-zÀ-ÿ\-\s]+)/i,
      category: "loisirs",
      template: "L'utilisateur pratique {1}",
      confidence: 0.75,
      contextWords: ["joue", "sport", "pratique", "activité"]
    }
  ];

  private contextualKeywords = {
    identité: ["nom", "prénom", "appelle", "âge", "ans", "né", "naissance"],
    localisation: ["habite", "vis", "ville", "quartier", "région", "pays", "adresse"],
    profession: ["travaille", "métier", "profession", "job", "bosse", "entreprise", "étude"],
    préférences: ["aime", "adore", "déteste", "préfère", "favori", "favorite"],
    relations: ["mari", "femme", "enfant", "parent", "famille", "conjoint", "ami"],
    habitudes: ["habitude", "routine", "tous les", "chaque", "emploi du temps"],
    santé: ["allergie", "médicament", "traitement", "santé", "maladie"],
    loisirs: ["passion", "hobby", "sport", "joue", "pratique", "loisir"]
  };

  /**
   * Détecte les informations à mémoriser avec une approche hybride
   */
  public async detectInformation(
    text: string,
    context?: ConversationContext
  ): Promise<DetectedInfo[]> {
    const detected: DetectedInfo[] = [];

    // 1. Détection par patterns regex
    const regexResults = this.detectByRegex(text);
    detected.push(...regexResults);

    // 2. Détection contextuelle si pas de résultat regex
    if (detected.length === 0) {
      const contextualResults = this.detectByContext(text, context);
      detected.push(...contextualResults);
    }

    // 3. Filtrage par confiance et déduplication
    return this.filterAndDeduplicate(detected);
  }

  /**
   * Détection par patterns regex
   */
  private detectByRegex(text: string): DetectedInfo[] {
    const results: DetectedInfo[] = [];

    for (const pattern of this.patterns) {
      const match = text.match(pattern.regex);
      if (match && (!pattern.exclude || !pattern.exclude.test(text))) {
        const content = this.formatTemplate(pattern.template, match);
        
        // Boost de confiance si mots contextuels présents
        let confidence = pattern.confidence;
        if (pattern.contextWords) {
          const hasContextWords = pattern.contextWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
          );
          if (hasContextWords) {
            confidence = Math.min(0.95, confidence + 0.1);
          }
        }

        results.push({
          content,
          category: pattern.category,
          confidence,
          source: 'regex'
        });
      }
    }

    return results;
  }

  /**
   * Détection contextuelle basée sur les mots-clés et la conversation
   */
  private detectByContext(text: string, context?: ConversationContext): DetectedInfo[] {
    const results: DetectedInfo[] = [];
    const lowerText = text.toLowerCase();

    // Analyse par catégorie de mots-clés
    for (const [category, keywords] of Object.entries(this.contextualKeywords)) {
      const matchingKeywords = keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );

      if (matchingKeywords.length > 0) {
        // Calcul de confiance basé sur le nombre de mots-clés correspondants
        const confidence = Math.min(0.8, 0.5 + (matchingKeywords.length * 0.1));
        
        // Boost si contexte de conversation favorable
        let finalConfidence = confidence;
        if (context?.currentTopic && context.currentTopic.includes(category)) {
          finalConfidence = Math.min(0.9, confidence + 0.15);
        }

        results.push({
          content: text.trim(),
          category,
          confidence: finalConfidence,
          source: 'contextual'
        });
      }
    }

    return results;
  }

  /**
   * Analyse de sentiment et d'intention
   */
  public analyzeSentiment(text: string): {
    sentiment: 'positif' | 'négatif' | 'neutre';
    intensity: number;
    intention: 'information' | 'question' | 'demande' | 'confidence';
  } {
    const lowerText = text.toLowerCase();
    
    // Mots indicateurs de sentiment
    const positiveWords = ['adore', 'aime', 'super', 'génial', 'parfait', 'excellent', 'content'];
    const negativeWords = ['déteste', 'horrible', 'nul', 'pire', 'problème', 'difficile'];
    
    // Analyse de sentiment
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: 'positif' | 'négatif' | 'neutre' = 'neutre';
    let intensity = 0;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positif';
      intensity = positiveCount / positiveWords.length;
    } else if (negativeCount > positiveCount) {
      sentiment = 'négatif';
      intensity = negativeCount / negativeWords.length;
    }

    // Analyse d'intention
    let intention: 'information' | 'question' | 'demande' | 'confidence' = 'information';
    
    if (text.includes('?')) {
      intention = 'question';
    } else if (lowerText.includes('peux-tu') || lowerText.includes('pourrais-tu')) {
      intention = 'demande';
    } else if (lowerText.includes('je') && (lowerText.includes('suis') || lowerText.includes('ai'))) {
      intention = 'confidence';
    }

    return { sentiment, intensity, intention };
  }

  /**
   * Formatage des templates avec les groupes de capture
   */
  private formatTemplate(template: string, match: RegExpMatchArray): string {
    return template.replace(/\{(\d+)\}/g, (_, index) => {
      const i = parseInt(index);
      return i === 0 ? match[0] : (match[i] || '');
    });
  }

  /**
   * Filtrage et déduplication des résultats
   */
  private filterAndDeduplicate(detected: DetectedInfo[]): DetectedInfo[] {
    // Trier par confiance décroissante
    const sorted = detected.sort((a, b) => b.confidence - a.confidence);
    
    // Déduplication par similarité de contenu
    const unique: DetectedInfo[] = [];
    
    for (const item of sorted) {
      const isDuplicate = unique.some(existing => 
        this.calculateSimilarity(item.content, existing.content) > 0.7
      );
      
      if (!isDuplicate && item.confidence > 0.6) {
        unique.push(item);
      }
    }
    
    return unique;
  }

  /**
   * Calcul de similarité entre deux textes
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Apprentissage automatique : améliore les patterns basés sur les succès/échecs
   */
  public learnFromFeedback(text: string, wasRelevant: boolean, category?: string): void {
    // Implémentation future : ajustement des poids et patterns
    // basé sur les retours utilisateur
    console.log('Apprentissage:', { text, wasRelevant, category });
  }
}

// Instance singleton
export const memoryDetectionService = new MemoryDetectionService(); 