/**
 * 🎭 Service d'Analyse de Personnalité et Sentiments
 * 
 * Analyse les messages utilisateur pour :
 * - Détecter les traits de personnalité
 * - Analyser les sentiments
 * - Adapter le style de communication
 * - Observer les préférences de langage
 */

import { evolvedMemory, PersonalityTrait, UserPreference } from './evolvedMemory';

// Types pour l'analyse de personnalité
export interface SentimentAnalysis {
  positive: number;    // 0-1, score positif
  negative: number;    // 0-1, score négatif
  neutral: number;     // 0-1, score neutre
  dominant: 'positive' | 'negative' | 'neutral';
  intensity: number;   // 0-1, intensité de l'émotion
  emotions: string[];  // Émotions détectées
}

export interface LanguageStyle {
  formality: number;      // -1 (très informel) à 1 (très formel)
  complexity: number;      // 0 (simple) à 1 (complexe)
  humor: number;          // 0 (sérieux) à 1 (humoristique)
  detail: number;         // 0 (concis) à 1 (détaillé)
  politeness: number;     // 0 (direct) à 1 (poli)
}

export interface CommunicationPattern {
  responseTime: number;    // Temps de réponse moyen (ms)
  messageLength: number;   // Longueur moyenne des messages
  questionFrequency: number; // Fréquence des questions
  topicConsistency: number;  // Cohérence des sujets
  engagement: number;      // Niveau d'engagement (0-1)
}

class PersonalityAnalyzerService {
  private readonly SENTIMENT_KEYWORDS = {
    positive: [
      'merci', 'super', 'excellent', 'génial', 'parfait', 'adorable', 'fantastique',
      'incroyable', 'magnifique', 'formidable', 'extraordinaire', 'merveilleux',
      'satisfait', 'content', 'heureux', 'ravi', 'enthousiaste', 'motivé'
    ],
    negative: [
      'problème', 'difficile', 'compliqué', 'ennuyeux', 'frustrant', 'décevant',
      'terrible', 'horrible', 'nul', 'mauvais', 'désagréable', 'stressant',
      'fatigué', 'déprimé', 'inquiet', 'anxieux', 'fâché', 'déçu'
    ],
    emotions: {
      joie: ['joyeux', 'heureux', 'content', 'satisfait', 'enthousiaste'],
      tristesse: ['triste', 'déprimé', 'mélancolique', 'désolé', 'déçu'],
      colère: ['fâché', 'énervé', 'furieux', 'irrité', 'agacé'],
      peur: ['inquiet', 'anxieux', 'stressé', 'paniqué', 'terrifié'],
      surprise: ['surpris', 'étonné', 'stupéfait', 'choqué', 'impressionné']
    }
  };

  private readonly FORMALITY_INDICATORS = {
    formal: [
      'veuillez', 'pourriez-vous', 'serait-il possible', 'je vous prie',
      'merci de', 'afin de', 'dans le but de', 'par conséquent',
      'en conséquence', 'par ailleurs', 'en outre', 'cependant'
    ],
    informal: [
      'salut', 'coucou', 'hey', 'cool', 'super', 'génial', 'sympa',
      'pas de souci', 'aucun problème', 'ça va', 'tranquille',
      'franchement', 'honnêtement', 'clairement'
    ]
  };

  private readonly COMPLEXITY_INDICATORS = {
    simple: ['simple', 'facile', 'basique', 'clair', 'évident'],
    complex: ['complexe', 'sophistiqué', 'avancé', 'technique', 'spécialisé']
  };

  private readonly HUMOR_INDICATORS = [
    '😄', '😊', '😂', '🤣', '😆', '😅', '😉', '😋', '😎', '🤪',
    'humoristique', 'drôle', 'amusant', 'marrant', 'rigolo', 'comique'
  ];

  /**
   * Analyse complète d'un message utilisateur
   */
  analyzeMessage(message: string, context?: string): {
    sentiment: SentimentAnalysis;
    style: LanguageStyle;
    personality: Partial<PersonalityTrait>;
    preferences: Partial<UserPreference>;
  } {
    const sentiment = this.analyzeSentiment(message);
    const style = this.analyzeLanguageStyle(message);
    const personality = this.extractPersonalityTraits(message, style);
    const preferences = this.extractUserPreferences(message, context);

    // Apprentissage automatique
    this.learnFromMessage(message, sentiment, style, personality, preferences);

    return { sentiment, style, personality, preferences };
  }

  /**
   * Analyse des sentiments dans un message
   */
  private analyzeSentiment(text: string): SentimentAnalysis {
    const lowerText = text.toLowerCase();
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    const emotions: string[] = [];

    // Analyse des mots-clés positifs
    this.SENTIMENT_KEYWORDS.positive.forEach(word => {
      if (lowerText.includes(word)) {
        positive += 0.3;
      }
    });

    // Analyse des mots-clés négatifs
    this.SENTIMENT_KEYWORDS.negative.forEach(word => {
      if (lowerText.includes(word)) {
        negative += 0.3;
      }
    });

    // Analyse des émotions
    Object.entries(this.SENTIMENT_KEYWORDS.emotions).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          emotions.push(emotion);
          if (emotion === 'joie') positive += 0.2;
          else if (emotion === 'tristesse' || emotion === 'colère' || emotion === 'peur') negative += 0.2;
        }
      });
    });

    // Analyse des emojis
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiCount > 0) {
      positive += Math.min(0.3, emojiCount * 0.1);
    }

    // Normalisation des scores
    const total = positive + negative + neutral;
    if (total > 0) {
      positive = Math.min(1, positive / total);
      negative = Math.min(1, negative / total);
      neutral = Math.max(0, 1 - positive - negative);
    } else {
      neutral = 1;
    }

    // Détermination du sentiment dominant
    let dominant: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positive > negative && positive > neutral) dominant = 'positive';
    else if (negative > positive && negative > neutral) dominant = 'negative';

    // Calcul de l'intensité
    const intensity = Math.max(positive, negative, neutral);

    return {
      positive,
      negative,
      neutral,
      dominant,
      intensity,
      emotions: [...new Set(emotions)] // Suppression des doublons
    };
  }

  /**
   * Analyse du style de langage
   */
  private analyzeLanguageStyle(text: string): LanguageStyle {
    const lowerText = text.toLowerCase();
    let formality = 0;
    let complexity = 0;
    let humor = 0;
    let detail = 0;
    let politeness = 0;

    // Analyse de la formalité
    this.FORMALITY_INDICATORS.formal.forEach(word => {
      if (lowerText.includes(word)) {
        formality += 0.2;
      }
    });

    this.FORMALITY_INDICATORS.informal.forEach(word => {
      if (lowerText.includes(word)) {
        formality -= 0.2;
      }
    });

    // Analyse de la complexité
    const wordCount = text.split(/\s+/).length;
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
    
    if (avgWordLength > 8) complexity += 0.3;
    if (wordCount > 20) complexity += 0.3;
    if (wordCount > 50) complexity += 0.2;

    this.COMPLEXITY_INDICATORS.simple.forEach(word => {
      if (lowerText.includes(word)) {
        complexity -= 0.1;
      }
    });

    this.COMPLEXITY_INDICATORS.complex.forEach(word => {
      if (lowerText.includes(word)) {
        complexity += 0.2;
      }
    });

    // Analyse de l'humour
    this.HUMOR_INDICATORS.forEach(indicator => {
      if (text.includes(indicator)) {
        humor += 0.2;
      }
    });

    // Analyse du niveau de détail
    if (text.includes('parce que') || text.includes('car') || text.includes('en fait')) detail += 0.2;
    if (text.includes('exemple') || text.includes('comme') || text.includes('tel que')) detail += 0.2;
    if (text.includes('détail') || text.includes('précisément')) detail += 0.3;

    // Analyse de la politesse
    if (text.includes('s\'il vous plaît') || text.includes('merci') || text.includes('excusez')) politeness += 0.3;
    if (text.includes('pourriez-vous') || text.includes('serait-il possible')) politeness += 0.2;

    // Normalisation des scores entre -1 et 1 pour formality, 0 et 1 pour les autres
    formality = Math.max(-1, Math.min(1, formality));
    complexity = Math.max(0, Math.min(1, complexity));
    humor = Math.max(0, Math.min(1, humor));
    detail = Math.max(0, Math.min(1, detail));
    politeness = Math.max(0, Math.min(1, politeness));

    return { formality, complexity, humor, detail, politeness };
  }

  /**
   * Extrait les traits de personnalité d'un message
   */
  private extractPersonalityTraits(
    message: string,
    style: LanguageStyle
  ): Partial<PersonalityTrait> {
    const traits: Partial<PersonalityTrait> = {};

    // Trait de formalité
    if (Math.abs(style.formality) > 0.3) {
      traits.trait = 'formality';
      traits.value = style.formality;
    }

    // Trait de complexité
    if (style.complexity > 0.5) {
      traits.trait = 'complexity';
      traits.value = style.complexity;
    }

    // Trait d'humour
    if (style.humor > 0.4) {
      traits.trait = 'humor';
      traits.value = style.humor;
    }

    // Trait de détail
    if (style.detail > 0.5) {
      traits.trait = 'detail_level';
      traits.value = style.detail;
    }

    // Trait de politesse
    if (style.politeness > 0.5) {
      traits.trait = 'politeness';
      traits.value = style.politeness;
    }

    return traits;
  }

  /**
   * Extrait les préférences utilisateur d'un message
   */
  private extractUserPreferences(
    message: string,
    context?: string
  ): Partial<UserPreference>[] {
    const preferences: Partial<UserPreference>[] = [];
    const lowerText = message.toLowerCase();

    // Préférences de communication
    if (lowerText.includes('rapidement') || lowerText.includes('vite')) {
      preferences.push({
        category: 'communication',
        key: 'response_speed',
        value: 'fast'
      });
    }

    if (lowerText.includes('détaillé') || lowerText.includes('explications')) {
      preferences.push({
        category: 'communication',
        key: 'detail_level',
        value: 'high'
      });
    }

    // Préférences de contenu
    if (lowerText.includes('technique') || lowerText.includes('technologie')) {
      preferences.push({
        category: 'content',
        key: 'technical_level',
        value: 'high'
      });
    }

    if (lowerText.includes('simple') || lowerText.includes('basique')) {
      preferences.push({
        category: 'content',
        key: 'technical_level',
        value: 'low'
      });
    }

    // Préférences de style
    if (lowerText.includes('formel') || lowerText.includes('professionnel')) {
      preferences.push({
        category: 'style',
        key: 'tone',
        value: 'formal'
      });
    }

    if (lowerText.includes('décontracté') || lowerText.includes('amical')) {
      preferences.push({
        category: 'style',
        key: 'tone',
        value: 'casual'
      });
    }

    // Préférences d'intérêts (détection basique)
    const interests = ['musique', 'sport', 'cuisine', 'voyage', 'lecture', 'cinéma', 'art', 'science'];
    interests.forEach(interest => {
      if (lowerText.includes(interest)) {
        preferences.push({
          category: 'interests',
          key: interest,
          value: true
        });
      }
    });

    return preferences;
  }

  /**
   * Apprentissage automatique à partir d'un message
   */
  private learnFromMessage(
    message: string,
    sentiment: SentimentAnalysis,
    style: LanguageStyle,
    personality: Partial<PersonalityTrait>,
    preferences: Partial<UserPreference>[]
  ): void {
    // Apprentissage des traits de personnalité
    if (personality.trait && personality.value !== undefined) {
      evolvedMemory.observePersonalityTrait(
        personality.trait,
        personality.value,
        message
      );
    }

    // Apprentissage des préférences
    preferences.forEach(pref => {
      if (pref.category && pref.key && pref.value !== undefined) {
        evolvedMemory.observePreference(
          pref.category as UserPreference['category'],
          pref.key,
          pref.value,
          message
        );
      }
    });

    // Apprentissage des patterns de conversation
    const success = sentiment.positive > 0.5 || sentiment.intensity > 0.7;
    evolvedMemory.learnConversationPattern(
      message,
      'general',
      success
    );
  }

  /**
   * Génère des suggestions de personnalisation basées sur l'analyse
   */
  generatePersonalizationSuggestions(
    sentiment: SentimentAnalysis,
    style: LanguageStyle,
    personality: Partial<PersonalityTrait>
  ): string[] {
    const suggestions: string[] = [];

    // Suggestions basées sur le sentiment
    if (sentiment.dominant === 'negative') {
      suggestions.push('L\'utilisateur semble stressé, adapter le ton pour être plus rassurant');
    } else if (sentiment.dominant === 'positive') {
      suggestions.push('L\'utilisateur est de bonne humeur, maintenir un ton enthousiaste');
    }

    // Suggestions basées sur le style
    if (style.formality > 0.5) {
      suggestions.push('Utiliser un langage formel et professionnel');
    } else if (style.formality < -0.3) {
      suggestions.push('Adopter un ton décontracté et amical');
    }

    if (style.complexity > 0.6) {
      suggestions.push('Fournir des explications détaillées et techniques');
    } else if (style.complexity < 0.3) {
      suggestions.push('Simplifier les explications et utiliser des exemples concrets');
    }

    if (style.humor > 0.4) {
      suggestions.push('Intégrer des éléments humoristiques dans les réponses');
    }

    // Suggestions basées sur la personnalité
    if (personality.trait === 'detail_level' && personality.value > 0.6) {
      suggestions.push('Privilégier les réponses détaillées avec des exemples');
    }

    return suggestions;
  }

  /**
   * Analyse l'évolution de la personnalité dans le temps
   */
  analyzePersonalityEvolution(): {
    trends: Record<string, 'increasing' | 'decreasing' | 'stable'>;
    changes: string[];
    recommendations: string[];
  } {
    const profile = evolvedMemory.getPersonalityProfile();
    const trends: Record<string, 'increasing' | 'decreasing' | 'stable'> = {};
    const changes: string[] = [];
    const recommendations: string[] = [];

    Object.entries(profile).forEach(([trait, data]) => {
      trends[trait] = data.trend;

      // Détection des changements significatifs
      if (data.trend !== 'stable' && data.confidence > 0.6) {
        if (data.trend === 'increasing') {
          changes.push(`${trait} augmente (${data.value.toFixed(2)})`);
        } else {
          changes.push(`${trait} diminue (${data.value.toFixed(2)})`);
        }
      }

      // Recommandations basées sur les tendances
      if (data.trend === 'increasing' && data.value > 0.8) {
        recommendations.push(`Maintenir le niveau élevé de ${trait}`);
      } else if (data.trend === 'decreasing' && data.value < 0.2) {
        recommendations.push(`Encourager le développement de ${trait}`);
      }
    });

    return { trends, changes, recommendations };
  }

  /**
   * Génère un rapport d'analyse personnalisé
   */
  generatePersonalAnalysisReport(): {
    summary: string;
    personality: Record<string, number>;
    preferences: Record<string, any>;
    evolution: string[];
    suggestions: string[];
  } {
    const profile = evolvedMemory.getPersonalityProfile();
    const evolution = this.analyzePersonalityEvolution();
    const metrics = evolvedMemory.getLearningMetrics();

    // Résumé de la personnalité
    const personality: Record<string, number> = {};
    Object.entries(profile).forEach(([trait, data]) => {
      personality[trait] = data.value;
    });

    // Préférences principales
    const preferences: Record<string, any> = {};
    ['communication', 'content', 'style', 'interests'].forEach(category => {
      const pref = evolvedMemory.getPreference(category, 'tone');
      if (pref) preferences[category] = pref;
    });

    // Génération du résumé
    let summary = `Analyse personnalisée basée sur ${metrics.totalInteractions} interactions. `;
    
    if (Object.keys(personality).length > 0) {
      const mainTrait = Object.entries(personality).reduce((a, b) => 
        Math.abs(a[1]) > Math.abs(b[1]) ? a : b
      );
      summary += `Trait dominant : ${mainTrait[0]} (${mainTrait[1].toFixed(2)}). `;
    }

    if (evolution.changes.length > 0) {
      summary += `Évolutions détectées : ${evolution.changes.slice(0, 2).join(', ')}.`;
    }

    return {
      summary,
      personality,
      preferences,
      evolution: evolution.changes,
      suggestions: evolution.recommendations
    };
  }
}

// Instance singleton
const personalityAnalyzerService = new PersonalityAnalyzerService();

// Export des fonctions principales
export const personalityAnalyzer = {
  analyzeMessage: (message: string, context?: string) =>
    personalityAnalyzerService.analyzeMessage(message, context),
  
  generatePersonalizationSuggestions: (sentiment: any, style: any, personality: any) =>
    personalityAnalyzerService.generatePersonalizationSuggestions(sentiment, style, personality),
  
  analyzePersonalityEvolution: () =>
    personalityAnalyzerService.analyzePersonalityEvolution(),
  
  generatePersonalAnalysisReport: () =>
    personalityAnalyzerService.generatePersonalAnalysisReport()
};

// Export des types
export type {
  SentimentAnalysis,
  LanguageStyle,
  CommunicationPattern
};
