/**
 * Service de filtrage de contenu pour le mode enfant
 * Assure la sécurité et la modération du contenu
 */

export interface ContentFilterResult {
  isSafe: boolean;
  filteredContent: string;
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface FilterRule {
  pattern: RegExp;
  replacement: string;
  riskLevel: 'low' | 'medium' | 'high';
  category: 'violence' | 'inappropriate' | 'personal' | 'external' | 'complex';
  description: string;
}

// Règles de filtrage pour le mode enfant
const CHILD_FILTER_RULES: FilterRule[] = [
  // Mots inappropriés ou violents
  {
    pattern: /\b(mort|tuer|blesser|violence|sang|douleur)\b/gi,
    replacement: '[contenu non approprié]',
    riskLevel: 'high',
    category: 'violence',
    description: 'Contenu violent détecté'
  },
  
  // Informations personnelles
  {
    pattern: /\b(email|téléphone|adresse|nom|prénom|âge|école)\b/gi,
    replacement: '[information personnelle]',
    riskLevel: 'medium',
    category: 'personal',
    description: 'Information personnelle détectée'
  },
  
  // Liens externes
  {
    pattern: /https?:\/\/[^\s]+/gi,
    replacement: '[lien externe]',
    riskLevel: 'medium',
    category: 'external',
    description: 'Lien externe détecté'
  },
  
  // Termes complexes
  {
    pattern: /\b(algorithm|cryptographie|quantique|blockchain)\b/gi,
    replacement: '[concept complexe]',
    riskLevel: 'low',
    category: 'complex',
    description: 'Concept complexe détecté'
  },
  
  // Contenu inapproprié
  {
    pattern: /\b(alcool|drogue|tabac|jeux d'argent)\b/gi,
    replacement: '[contenu inapproprié]',
    riskLevel: 'high',
    category: 'inappropriate',
    description: 'Contenu inapproprié détecté'
  }
];

// Mots-clés positifs et éducatifs
const POSITIVE_KEYWORDS = [
  'apprendre', 'découvrir', 'créer', 'jouer', 'partager',
  'aider', 'protéger', 'respecter', 'grandir', 'sourire',
  'ami', 'famille', 'école', 'livre', 'musique', 'art',
  'nature', 'animaux', 'sciences', 'mathématiques', 'histoire'
];

// Suggestions de redirection pour contenu inapproprié
const REDIRECTION_SUGGESTIONS = {
  violence: [
    'Et si on parlait plutôt de jeux coopératifs ?',
    'Raconte-moi une histoire d\'amitié !',
    'Que dirais-tu de créer quelque chose ensemble ?'
  ],
  inappropriate: [
    'Parlons plutôt de tes passions !',
    'Raconte-moi ta journée à l\'école',
    'Quel est ton livre préféré ?'
  ],
  personal: [
    'Parle-moi de tes centres d\'intérêt !',
    'Qu\'est-ce qui te rend heureux ?',
    'Raconte-moi une belle histoire'
  ],
  external: [
    'Demande à un adulte de t\'aider avec ce lien',
    'On peut en parler ensemble d\'abord',
    'C\'est mieux de vérifier avec tes parents'
  ],
  complex: [
    'Laisse-moi t\'expliquer plus simplement',
    'On peut commencer par les bases',
    'C\'est comme un jeu, on apprend étape par étape'
  ]
};

/**
 * Filtre le contenu pour le mode enfant
 */
export function filterChildContent(content: string): ContentFilterResult {
  let filteredContent = content;
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let maxRiskLevel: 'low' | 'medium' | 'high' = 'low';
  
  // Appliquer les règles de filtrage
  CHILD_FILTER_RULES.forEach(rule => {
    if (rule.pattern.test(filteredContent)) {
      filteredContent = filteredContent.replace(rule.pattern, rule.replacement);
      warnings.push(`${rule.description}: ${rule.category}`);
      
      if (rule.riskLevel === 'high') maxRiskLevel = 'high';
      else if (rule.riskLevel === 'medium' && maxRiskLevel !== 'high') maxRiskLevel = 'medium';
      
      // Ajouter des suggestions de redirection
      const categorySuggestions = REDIRECTION_SUGGESTIONS[rule.category];
      if (categorySuggestions) {
        const randomSuggestion = categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
        if (!suggestions.includes(randomSuggestion)) {
          suggestions.push(randomSuggestion);
        }
      }
    }
  });
  
  // Vérifier la complexité du langage
  const complexityScore = calculateComplexityScore(filteredContent);
  if (complexityScore > 0.7) {
    warnings.push('Langage trop complexe détecté');
    suggestions.push('Je vais reformuler de manière plus simple');
    if (maxRiskLevel === 'low') maxRiskLevel = 'medium';
  }
  
  // Vérifier la longueur
  if (filteredContent.length > 500) {
    warnings.push('Contenu trop long détecté');
    suggestions.push('Je vais faire plus court et plus clair');
    if (maxRiskLevel === 'low') maxRiskLevel = 'medium';
  }
  
  const isSafe = maxRiskLevel !== 'high' && warnings.length < 3;
  
  return {
    isSafe,
    filteredContent,
    warnings,
    riskLevel: maxRiskLevel,
    suggestions
  };
}

/**
 * Calcule un score de complexité du langage
 */
function calculateComplexityScore(text: string): number {
  const words = text.split(/\s+/);
  const longWords = words.filter(word => word.length > 8);
  const complexPunctuation = (text.match(/[;:()\[\]{}]/g) || []).length;
  
  return Math.min(1, (longWords.length / words.length) * 0.6 + (complexPunctuation / words.length) * 0.4);
}

/**
 * Vérifie si le contenu contient des mots-clés positifs
 */
export function hasPositiveContent(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return POSITIVE_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

/**
 * Génère des suggestions de contenu alternatif
 */
export function generateAlternativeSuggestions(originalContent: string): string[] {
  const alternatives = [
    'Raconte-moi une histoire drôle',
    'Que veux-tu apprendre aujourd\'hui ?',
    'Créons quelque chose ensemble !',
    'Parlons de tes rêves',
    'Qu\'est-ce qui te passionne ?',
    'Raconte-moi ta journée',
    'Quel est ton animal préféré ?',
    'Inventons une histoire ensemble'
  ];
  
  // Mélanger et retourner 3 suggestions
  return alternatives.sort(() => Math.random() - 0.5).slice(0, 3);
}

/**
 * Valide une réponse IA pour le mode enfant
 */
export function validateAIResponse(response: string): ContentFilterResult {
  const filterResult = filterChildContent(response);
  
  // Si le contenu n'est pas sûr, ajouter des suggestions d'amélioration
  if (!filterResult.isSafe) {
    filterResult.suggestions.push(
      'Je vais reformuler ma réponse de manière plus appropriée',
      'Laisse-moi te donner une meilleure réponse'
    );
  }
  
  return filterResult;
}

/**
 * Statistiques de filtrage
 */
export function getFilterStats(): {
  totalFilters: number;
  categories: Record<string, number>;
  riskLevels: Record<string, number>;
} {
  const categories: Record<string, number> = {};
  const riskLevels: Record<string, number> = {};
  
  CHILD_FILTER_RULES.forEach(rule => {
    categories[rule.category] = (categories[rule.category] || 0) + 1;
    riskLevels[rule.riskLevel] = (riskLevels[rule.riskLevel] || 0) + 1;
  });
  
  return {
    totalFilters: CHILD_FILTER_RULES.length,
    categories,
    riskLevels
  };
}
