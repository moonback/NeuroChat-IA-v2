/**
 * Service pour générer des suggestions de réponses intelligentes
 * basées sur l'analyse du contenu des messages LLM
 */

export interface Suggestion {
  id: string;
  text: string;
  category: 'question' | 'clarification' | 'followup' | 'action' | 'appreciation';
  priority: number;
  confidence: number; // 0-1, confiance dans la pertinence
  keywords?: string[]; // Mots-clés qui ont déclenché cette suggestion
}

export interface SuggestionContext {
  messageContent: string;
  conversationHistory?: Array<{ text: string; isUser: boolean }>;
  userPreferences?: {
    detailLevel: 'basic' | 'detailed' | 'expert';
    interactionStyle: 'formal' | 'casual' | 'concise';
  };
}

/**
 * Patterns de détection pour différents types de contenu
 */
const CONTENT_PATTERNS = {
  // Patterns pour détecter les explications
  explanation: {
    patterns: [
      /(?:explique|explication|expliquer)/i,
      /(?:pourquoi|comment|raison|cause|origine)/i,
      /(?:principe|fonctionnement|mécanisme)/i,
      /(?:signifie|veut dire|définition)/i
    ],
    keywords: ['explication', 'principe', 'fonctionnement']
  },

  // Patterns pour le code
  code: {
    patterns: [
      /```[\s\S]*?```/,
      /`[^`]+`/,
      /(?:fonction|variable|classe|méthode|algorithme)/i,
      /(?:programmation|développement|coding)/i,
      /(?:syntax|syntaxe|erreur|bug)/i
    ],
    keywords: ['code', 'programmation', 'fonction']
  },

  // Patterns pour les recommandations
  recommendation: {
    patterns: [
      /(?:recommand|conseil|suggest|propose)/i,
      /(?:devrait|il faut|mieux de)/i,
      /(?:optimal|idéal|préférable)/i,
      /(?:bonne pratique|best practice)/i
    ],
    keywords: ['recommandation', 'conseil', 'pratique']
  },

  // Patterns pour les listes et énumérations
  list: {
    patterns: [
      /(?:liste|énumér|plusieurs|différent)/i,
      /(?:\d+\.|•|-).*(?:\n|$)/gm,
      /(?:premièrement|deuxièmement|ensuite|enfin)/i,
      /(?:types?|catégories?|variantes?)/i
    ],
    keywords: ['liste', 'types', 'catégories']
  },

  // Patterns pour les exemples
  example: {
    patterns: [
      /(?:exemple|par exemple|illustration)/i,
      /(?:démonstration|cas concret)/i,
      /(?:prenons|supposons|imaginons)/i,
      /(?:comme|tel que|notamment)/i
    ],
    keywords: ['exemple', 'illustration', 'démonstration']
  },

  // Patterns pour les comparaisons
  comparison: {
    patterns: [
      /(?:compar|différence|versus|contre)/i,
      /(?:mieux|pire|supérieur|inférieur)/i,
      /(?:avantages?|inconvénients?|bénéfices?)/i,
      /(?:plutôt que|au lieu de|contrairement)/i
    ],
    keywords: ['comparaison', 'avantages', 'différence']
  },

  // Patterns pour les problèmes
  problem: {
    patterns: [
      /(?:problème|erreur|bug|issue)/i,
      /(?:dysfonction|panne|défaut)/i,
      /(?:ne fonctionne pas|ne marche pas)/i,
      /(?:résoudre|corriger|réparer)/i
    ],
    keywords: ['problème', 'erreur', 'résolution']
  },

  // Patterns pour les tutoriels/guides
  tutorial: {
    patterns: [
      /(?:étapes?|procédure|méthode)/i,
      /(?:guide|tutoriel|instructions?)/i,
      /(?:d'abord|puis|ensuite|finalement)/i,
      /(?:commencer par|pour commencer)/i
    ],
    keywords: ['étapes', 'guide', 'procédure']
  }
};

/**
 * Templates de suggestions par catégorie et contexte
 */
const SUGGESTION_TEMPLATES = {
  explanation: [
    { text: "Peux-tu donner un exemple concret ?", category: 'clarification', priority: 9 },
    { text: "Y a-t-il d'autres façons de l'expliquer ?", category: 'followup', priority: 8 },
    { text: "Quels sont les points clés à retenir ?", category: 'question', priority: 7 },
    { text: "Comment cela s'applique-t-il dans la pratique ?", category: 'action', priority: 8 }
  ],

  code: [
    { text: "Peux-tu expliquer ce code ligne par ligne ?", category: 'clarification', priority: 9 },
    { text: "Comment optimiser cette solution ?", category: 'followup', priority: 8 },
    { text: "Quelles sont les bonnes pratiques ici ?", category: 'question', priority: 7 },
    { text: "Peux-tu ajouter des commentaires au code ?", category: 'action', priority: 6 },
    { text: "Y a-t-il des erreurs potentielles à éviter ?", category: 'question', priority: 8 },
    { text: "Comment tester cette implémentation ?", category: 'action', priority: 7 }
  ],

  recommendation: [
    { text: "Pourquoi recommandes-tu cette approche ?", category: 'question', priority: 9 },
    { text: "Quelles sont les alternatives ?", category: 'followup', priority: 8 },
    { text: "Dans quels cas cette solution ne convient pas ?", category: 'clarification', priority: 7 },
    { text: "Quels sont les critères de choix ?", category: 'question', priority: 8 }
  ],

  list: [
    { text: "Peux-tu détailler le plus important ?", category: 'clarification', priority: 8 },
    { text: "Lequel recommandes-tu en priorité ?", category: 'question', priority: 9 },
    { text: "Y en a-t-il d'autres à considérer ?", category: 'followup', priority: 7 },
    { text: "Comment prioriser ces éléments ?", category: 'action', priority: 8 }
  ],

  example: [
    { text: "Peux-tu donner un autre exemple ?", category: 'followup', priority: 8 },
    { text: "Comment adapter cet exemple à mon cas ?", category: 'action', priority: 9 },
    { text: "Quelles variantes sont possibles ?", category: 'question', priority: 7 },
    { text: "Cet exemple fonctionne-t-il toujours ?", category: 'clarification', priority: 7 }
  ],

  comparison: [
    { text: "Quels sont les critères de comparaison ?", category: 'question', priority: 8 },
    { text: "Dans quel contexte choisir l'un ou l'autre ?", category: 'clarification', priority: 9 },
    { text: "Y a-t-il d'autres options à comparer ?", category: 'followup', priority: 7 }
  ],

  problem: [
    { text: "Comment résoudre ce problème ?", category: 'action', priority: 10 },
    { text: "Peux-tu donner les étapes détaillées ?", category: 'clarification', priority: 9 },
    { text: "Comment éviter ce problème à l'avenir ?", category: 'followup', priority: 8 },
    { text: "Quelles sont les causes possibles ?", category: 'question', priority: 8 }
  ],

  tutorial: [
    { text: "Peux-tu détailler cette étape ?", category: 'clarification', priority: 8 },
    { text: "Que faire si ça ne fonctionne pas ?", category: 'question', priority: 9 },
    { text: "Y a-t-il des prérequis à connaître ?", category: 'clarification', priority: 7 },
    { text: "Comment vérifier que c'est correct ?", category: 'action', priority: 8 }
  ]
};

/**
 * Suggestions génériques toujours disponibles
 */
const GENERIC_SUGGESTIONS = [
  { text: "Merci, c'est très clair !", category: 'appreciation', priority: 5 },
  { text: "Peux-tu être plus précis ?", category: 'clarification', priority: 6 },
  { text: "Comment mettre cela en pratique ?", category: 'action', priority: 7 },
  { text: "Quelles sont les prochaines étapes ?", category: 'followup', priority: 6 },
  { text: "Y a-t-il des ressources recommandées ?", category: 'question', priority: 5 },
  { text: "Peux-tu donner plus de contexte ?", category: 'clarification', priority: 6 },
  { text: "Comment approfondir ce sujet ?", category: 'followup', priority: 6 },
  { text: "C'est exactement ce que je cherchais !", category: 'appreciation', priority: 4 }
];

/**
 * Analyse le contenu d'un message pour détecter les patterns
 */
function analyzeContent(content: string): { type: string; confidence: number; keywords: string[] }[] {
  const results: { type: string; confidence: number; keywords: string[] }[] = [];
  
  for (const [type, config] of Object.entries(CONTENT_PATTERNS)) {
    let matches = 0;
    let totalPatterns = config.patterns.length;
    const matchedKeywords: string[] = [];

    for (const pattern of config.patterns) {
      if (pattern.test(content)) {
        matches++;
        // Ajouter les mots-clés associés
        matchedKeywords.push(...config.keywords);
      }
    }

    if (matches > 0) {
      const confidence = matches / totalPatterns;
      results.push({
        type,
        confidence,
        keywords: [...new Set(matchedKeywords)]
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Génère des suggestions basées sur l'analyse du contenu
 */
export function generateSmartSuggestions(
  context: SuggestionContext,
  maxSuggestions = 4
): Suggestion[] {
  const { messageContent, userPreferences } = context;
  
  if (!messageContent || messageContent.trim().length === 0) {
    return [];
  }

  // Analyser le contenu pour détecter les patterns
  const contentAnalysis = analyzeContent(messageContent);
  const suggestions: Suggestion[] = [];

  // Générer des suggestions spécifiques basées sur l'analyse
  for (const analysis of contentAnalysis.slice(0, 3)) { // Top 3 patterns détectés
    const templates = SUGGESTION_TEMPLATES[analysis.type as keyof typeof SUGGESTION_TEMPLATES];
    if (templates) {
      const selectedTemplates = templates
        .slice(0, Math.ceil(maxSuggestions / 2))
        .map((template, index) => ({
          id: `${analysis.type}-${index}`,
          text: template.text,
          category: template.category as Suggestion['category'],
          priority: template.priority * analysis.confidence,
          confidence: analysis.confidence,
          keywords: analysis.keywords
        }));
      
      suggestions.push(...selectedTemplates);
    }
  }

  // Ajouter des suggestions génériques si nécessaire
  const remainingSlots = maxSuggestions - suggestions.length;
  if (remainingSlots > 0) {
    const genericToAdd = GENERIC_SUGGESTIONS
      .slice(0, remainingSlots)
      .map((template, index) => ({
        id: `generic-${index}`,
        text: template.text,
        category: template.category as Suggestion['category'],
        priority: template.priority,
        confidence: 0.5,
        keywords: []
      }));
    
    suggestions.push(...genericToAdd);
  }

  // Ajuster les suggestions selon les préférences utilisateur
  if (userPreferences) {
    adjustSuggestionsForPreferences(suggestions, userPreferences);
  }

  // Trier par priorité et prendre les meilleures
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxSuggestions)
    .map((suggestion, index) => ({
      ...suggestion,
      priority: maxSuggestions - index
    }));
}

/**
 * Ajuste les suggestions selon les préférences utilisateur
 */
function adjustSuggestionsForPreferences(
  suggestions: Suggestion[],
  preferences: NonNullable<SuggestionContext['userPreferences']>
): void {
  const { detailLevel, interactionStyle } = preferences;

  for (const suggestion of suggestions) {
    // Ajustement selon le niveau de détail
    if (detailLevel === 'expert' && suggestion.category === 'clarification') {
      suggestion.priority *= 1.2; // Favoriser les questions de clarification pour les experts
    } else if (detailLevel === 'basic' && suggestion.category === 'action') {
      suggestion.priority *= 1.3; // Favoriser les actions pour les débutants
    }

    // Ajustement selon le style d'interaction
    if (interactionStyle === 'formal' && suggestion.category === 'appreciation') {
      suggestion.priority *= 0.8; // Réduire les appréciations en mode formel
    } else if (interactionStyle === 'casual' && suggestion.category === 'appreciation') {
      suggestion.priority *= 1.2; // Favoriser les appréciations en mode décontracté
    }
  }
}

/**
 * Évalue la pertinence d'une suggestion par rapport au contexte
 */
export function evaluateSuggestionRelevance(
  suggestion: Suggestion,
  context: SuggestionContext
): number {
  let relevance = suggestion.confidence;

  // Bonus si les mots-clés de la suggestion apparaissent dans le message
  if (suggestion.keywords) {
    const messageWords = context.messageContent.toLowerCase().split(/\s+/);
    const keywordMatches = suggestion.keywords.filter(keyword =>
      messageWords.some(word => word.includes(keyword.toLowerCase()))
    );
    relevance += (keywordMatches.length / suggestion.keywords.length) * 0.3;
  }

  // Bonus pour la diversité des catégories
  // TODO: Implémenter la logique de diversité si nécessaire

  return Math.min(relevance, 1.0); // Cap à 1.0
}

/**
 * Cache simple pour éviter de régénérer les mêmes suggestions
 */
const suggestionCache = new Map<string, { suggestions: Suggestion[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedSuggestions(messageContent: string): Suggestion[] | null {
  const cacheKey = messageContent.slice(0, 100); // Utiliser les premiers 100 caractères comme clé
  const cached = suggestionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.suggestions;
  }
  
  return null;
}

export function cacheSuggestions(messageContent: string, suggestions: Suggestion[]): void {
  const cacheKey = messageContent.slice(0, 100);
  suggestionCache.set(cacheKey, {
    suggestions,
    timestamp: Date.now()
  });
  
  // Nettoyer le cache si trop d'entrées
  if (suggestionCache.size > 50) {
    const oldestKey = suggestionCache.keys().next().value;
    if (oldestKey) {
      suggestionCache.delete(oldestKey);
    }
  }
}
