/**
 * 🎯 Service d'Optimisation des Prompts
 * 
 * Optimise les prompts selon le fournisseur d'IA et le contexte
 * pour améliorer la qualité et la pertinence des réponses.
 */

export interface PromptContext {
  /** Type de requête utilisateur */
  requestType: 'question' | 'task' | 'creative' | 'analysis' | 'conversation';
  /** Complexité estimée (1-5) */
  complexity: number;
  /** Longueur souhaitée de la réponse */
  responseLength: 'short' | 'medium' | 'long';
  /** Langue de la requête */
  language: string;
  /** Contexte disponible (RAG, web, etc.) */
  availableContext: {
    hasRagContext: boolean;
    hasWebResults: boolean;
    hasImageContext: boolean;
  };
}

export interface OptimizedPrompt {
  /** Prompt optimisé pour le fournisseur */
  optimizedPrompt: string;
  /** Paramètres de génération optimisés */
  generationParams: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  /** Instructions spécifiques au fournisseur */
  providerInstructions: string[];
  /** Indicateurs de qualité attendus */
  qualityIndicators: string[];
}

/**
 * Optimise un prompt pour Gemini
 */
export function optimizePromptForGemini(
  originalPrompt: string,
  context: PromptContext,
  _systemPrompt?: string
): OptimizedPrompt {
  const { requestType, complexity, responseLength, availableContext } = context;

  // Instructions spécifiques à Gemini
  const geminiInstructions = [
    "Utilise un langage naturel et conversationnel",
    "Structure ta réponse de manière claire et logique",
    "Cite tes sources quand tu en as",
    "Sois précis et factuel"
  ];

  // Optimisation selon le type de requête
  let optimizedPrompt = originalPrompt;
  let temperature = 0.7;
  let topP = 0.9;
  let maxTokens = getTokenCount(responseLength);

  switch (requestType) {
    case 'question':
      optimizedPrompt = `Réponds à cette question de manière précise et structurée :\n\n${originalPrompt}`;
      temperature = 0.6; // Plus déterministe pour les questions
      break;

    case 'task':
      optimizedPrompt = `Exécute cette tâche étape par étape :\n\n${originalPrompt}`;
      temperature = 0.5; // Très déterministe pour les tâches
      maxTokens = Math.floor(maxTokens * 1.5); // Plus de tokens pour les étapes
      break;

    case 'creative':
      optimizedPrompt = `Sois créatif et original dans ta réponse à :\n\n${originalPrompt}`;
      temperature = 0.9; // Plus créatif
      topP = 0.95;
      break;

    case 'analysis':
      optimizedPrompt = `Analyse en profondeur ce sujet :\n\n${originalPrompt}`;
      temperature = 0.7;
      maxTokens = Math.floor(maxTokens * 1.3); // Plus de tokens pour l'analyse
      geminiInstructions.push("Fournis une analyse détaillée avec des exemples");
      break;

    case 'conversation':
      optimizedPrompt = originalPrompt; // Garde le prompt naturel pour la conversation
      temperature = 0.8; // Équilibre créativité/déterminisme
      break;
  }

  // Ajustements basés sur la complexité
  if (complexity >= 4) {
    maxTokens = Math.floor(maxTokens * 1.4);
    geminiInstructions.push("Explique les concepts complexes de manière accessible");
  } else if (complexity <= 2) {
    temperature = Math.max(0.3, temperature - 0.1);
    geminiInstructions.push("Sois concis et direct");
  }

  // Optimisation selon le contexte disponible
  if (availableContext.hasRagContext) {
    optimizedPrompt += "\n\nUtilise les informations du contexte documentaire fourni.";
    geminiInstructions.push("Priorise les informations du contexte documentaire");
  }

  if (availableContext.hasWebResults) {
    optimizedPrompt += "\n\nUtilise les résultats de recherche web récents.";
    geminiInstructions.push("Cite les sources web quand approprié");
  }

  if (availableContext.hasImageContext) {
    optimizedPrompt += "\n\nAnalyse également les images fournies.";
    geminiInstructions.push("Décris et analyse les images de manière détaillée");
  }

  // Instructions de qualité pour Gemini
  const qualityIndicators = [
    "Réponse structurée et cohérente",
    "Sources citées quand disponibles",
    "Langage naturel et accessible",
    "Réponse complète et pertinente"
  ];

  return {
    optimizedPrompt,
    generationParams: {
      temperature,
      topP,
      maxTokens
    },
    providerInstructions: geminiInstructions,
    qualityIndicators
  };
}

/**
 * Optimise un prompt pour OpenAI
 */
export function optimizePromptForOpenAI(
  originalPrompt: string,
  context: PromptContext,
  _systemPrompt?: string
): OptimizedPrompt {
  const { requestType, complexity, responseLength, availableContext } = context;

  // Instructions spécifiques à OpenAI
  const openaiInstructions = [
    "Utilise un style professionnel et informatif",
    "Structure ta réponse avec des paragraphes clairs",
    "Fournis des exemples concrets quand possible",
    "Sois précis et détaillé"
  ];

  let optimizedPrompt = originalPrompt;
  let temperature = 0.7;
  let topP = 0.9;
  let maxTokens = getTokenCount(responseLength);

  switch (requestType) {
    case 'question':
      optimizedPrompt = `Réponds de manière complète et détaillée à cette question :\n\n${originalPrompt}`;
      temperature = 0.6;
      break;

    case 'task':
      optimizedPrompt = `Fournis une solution étape par étape pour :\n\n${originalPrompt}`;
      temperature = 0.5;
      maxTokens = Math.floor(maxTokens * 1.6);
      break;

    case 'creative':
      optimizedPrompt = `Sois créatif et imaginatif dans ta réponse à :\n\n${originalPrompt}`;
      temperature = 0.9;
      topP = 0.95;
      break;

    case 'analysis':
      optimizedPrompt = `Effectue une analyse approfondie de :\n\n${originalPrompt}`;
      temperature = 0.7;
      maxTokens = Math.floor(maxTokens * 1.5);
      openaiInstructions.push("Fournis une analyse critique et équilibrée");
      break;

    case 'conversation':
      optimizedPrompt = originalPrompt;
      temperature = 0.8;
      break;
  }

  // Ajustements pour OpenAI
  if (complexity >= 4) {
    maxTokens = Math.floor(maxTokens * 1.3);
    openaiInstructions.push("Explique les concepts techniques de manière accessible");
  }

  // Gestion du contexte
  if (availableContext.hasRagContext || availableContext.hasWebResults) {
    optimizedPrompt += "\n\nBase-toi sur les informations contextuelles fournies.";
    openaiInstructions.push("Intègre les informations contextuelles de manière cohérente");
  }

  const qualityIndicators = [
    "Réponse bien structurée",
    "Exemples et détails pertinents",
    "Style professionnel et clair",
    "Réponse complète et approfondie"
  ];

  return {
    optimizedPrompt,
    generationParams: {
      temperature,
      topP,
      maxTokens
    },
    providerInstructions: openaiInstructions,
    qualityIndicators
  };
}

/**
 * Optimise un prompt pour Mistral
 */
export function optimizePromptForMistral(
  originalPrompt: string,
  context: PromptContext,
  _systemPrompt?: string
): OptimizedPrompt {
  const { requestType, complexity, responseLength, availableContext } = context;

  // Instructions spécifiques à Mistral
  const mistralInstructions = [
    "Utilise un langage clair et direct",
    "Sois concis mais complet",
    "Priorise la précision",
    "Adapte ton niveau de détail au contexte"
  ];

  let optimizedPrompt = originalPrompt;
  let temperature = 0.7;
  let topP = 0.95;
  let maxTokens = getTokenCount(responseLength);

  switch (requestType) {
    case 'question':
      optimizedPrompt = `Réponds précisément à cette question :\n\n${originalPrompt}`;
      temperature = 0.6;
      break;

    case 'task':
      optimizedPrompt = `Résous cette tâche méthodiquement :\n\n${originalPrompt}`;
      temperature = 0.5;
      maxTokens = Math.floor(maxTokens * 1.4);
      break;

    case 'creative':
      optimizedPrompt = `Sois créatif et original :\n\n${originalPrompt}`;
      temperature = 0.9;
      topP = 0.95;
      break;

    case 'analysis':
      optimizedPrompt = `Analyse méthodiquement ce sujet :\n\n${originalPrompt}`;
      temperature = 0.7;
      maxTokens = Math.floor(maxTokens * 1.3);
      mistralInstructions.push("Fournis une analyse structurée et logique");
      break;

    case 'conversation':
      optimizedPrompt = originalPrompt;
      temperature = 0.8;
      break;
  }

  // Optimisations spécifiques à Mistral
  if (complexity >= 4) {
    maxTokens = Math.floor(maxTokens * 1.2);
    mistralInstructions.push("Explique les concepts complexes de manière progressive");
  } else if (complexity <= 2) {
    temperature = Math.max(0.3, temperature - 0.1);
    mistralInstructions.push("Sois concis et va droit au but");
  }

  // Gestion du contexte pour Mistral
  if (availableContext.hasRagContext) {
    optimizedPrompt += "\n\nUtilise les documents de référence fournis.";
    mistralInstructions.push("Référence clairement les sources documentaires");
  }

  if (availableContext.hasWebResults) {
    optimizedPrompt += "\n\nIntègre les informations des recherches web.";
    mistralInstructions.push("Cite les sources web de manière appropriée");
  }

  const qualityIndicators = [
    "Réponse claire et structurée",
    "Précision et exactitude",
    "Intégration cohérente des sources",
    "Réponse adaptée au niveau de complexité"
  ];

  return {
    optimizedPrompt,
    generationParams: {
      temperature,
      topP,
      maxTokens
    },
    providerInstructions: mistralInstructions,
    qualityIndicators
  };
}

/**
 * Optimise un prompt selon le fournisseur
 */
export function optimizePrompt(
  provider: 'gemini' | 'openai' | 'mistral',
  originalPrompt: string,
  context: PromptContext,
  systemPrompt?: string
): OptimizedPrompt {
  switch (provider) {
    case 'gemini':
      return optimizePromptForGemini(originalPrompt, context, systemPrompt);
    case 'openai':
      return optimizePromptForOpenAI(originalPrompt, context, systemPrompt);
    case 'mistral':
      return optimizePromptForMistral(originalPrompt, context, systemPrompt);
    default:
      throw new Error(`Fournisseur non supporté: ${provider}`);
  }
}

/**
 * Analyse le type de requête et sa complexité
 */
export function analyzeRequest(prompt: string): PromptContext {
  const lowerPrompt = prompt.toLowerCase();
  
  // Détection du type de requête
  let requestType: PromptContext['requestType'] = 'question';
  
  if (lowerPrompt.includes('écris') || lowerPrompt.includes('crée') || 
      lowerPrompt.includes('invente') || lowerPrompt.includes('imagine')) {
    requestType = 'creative';
  } else if (lowerPrompt.includes('fais') || lowerPrompt.includes('résous') ||
             lowerPrompt.includes('calcule') || lowerPrompt.includes('résout')) {
    requestType = 'task';
  } else if (lowerPrompt.includes('analyse') || lowerPrompt.includes('explique') ||
             lowerPrompt.includes('compare') || lowerPrompt.includes('évalue')) {
    requestType = 'analysis';
  } else if (lowerPrompt.includes('salut') || lowerPrompt.includes('bonjour') ||
             lowerPrompt.includes('comment ça va') || lowerPrompt.includes('merci')) {
    requestType = 'conversation';
  }

  // Estimation de la complexité (1-5)
  let complexity = 3; // Complexité moyenne par défaut
  
  const wordCount = prompt.split(/\s+/).length;
  const hasTechnicalTerms = /[A-Z]{2,}|[0-9]+%|[0-9]+€|api|http|sql|json|xml/i.test(prompt);
  const hasMultipleQuestions = (prompt.match(/\?/g) || []).length > 1;
  const hasLongExplanation = wordCount > 50;
  
  if (hasTechnicalTerms) complexity += 1;
  if (hasMultipleQuestions) complexity += 1;
  if (hasLongExplanation) complexity += 1;
  if (wordCount < 10) complexity -= 1;
  
  complexity = Math.max(1, Math.min(5, complexity));

  // Estimation de la longueur souhaitée
  let responseLength: PromptContext['responseLength'] = 'medium';
  
  if (lowerPrompt.includes('court') || lowerPrompt.includes('bref') || lowerPrompt.includes('résumé')) {
    responseLength = 'short';
  } else if (lowerPrompt.includes('détaillé') || lowerPrompt.includes('complet') || 
             lowerPrompt.includes('exhaustif') || lowerPrompt.includes('approfondi')) {
    responseLength = 'long';
  }

  // Détection de la langue
  const language = detectLanguage(prompt);

  return {
    requestType,
    complexity,
    responseLength,
    language,
    availableContext: {
      hasRagContext: false, // Sera défini par l'appelant
      hasWebResults: false,
      hasImageContext: false
    }
  };
}

/**
 * Détecte la langue du prompt
 */
function detectLanguage(prompt: string): string {
  // Détection simple basée sur les mots-clés
  const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'avec', 'pour', 'dans', 'sur'];
  const englishWords = ['the', 'a', 'an', 'and', 'or', 'with', 'for', 'in', 'on', 'is', 'are', 'was', 'were'];
  
  const words = prompt.toLowerCase().split(/\s+/);
  const frenchCount = words.filter(word => frenchWords.includes(word)).length;
  const englishCount = words.filter(word => englishWords.includes(word)).length;
  
  if (frenchCount > englishCount) return 'fr';
  if (englishCount > frenchCount) return 'en';
  return 'fr'; // Par défaut français
}

/**
 * Calcule le nombre de tokens recommandé selon la longueur souhaitée
 */
function getTokenCount(responseLength: PromptContext['responseLength']): number {
  switch (responseLength) {
    case 'short': return 512;
    case 'medium': return 1024;
    case 'long': return 2048;
    default: return 1024;
  }
}

/**
 * Génère des prompts de suivi optimisés
 */
export function generateFollowUpPrompts(
  _originalResponse: string,
  provider: 'gemini' | 'openai' | 'mistral',
  _context: PromptContext
): string[] {
  const followUps: string[] = [];
  
  // Prompts génériques
  followUps.push("Peux-tu développer ce point ?");
  followUps.push("As-tu des exemples concrets ?");
  followUps.push("Peux-tu expliquer plus simplement ?");
  
  // Prompts spécifiques au fournisseur
  switch (provider) {
    case 'gemini':
      followUps.push("Peux-tu me donner plus de détails sur ce sujet ?");
      followUps.push("As-tu d'autres perspectives à partager ?");
      break;
    case 'openai':
      followUps.push("Peux-tu analyser les implications de cela ?");
      followUps.push("Quelles sont les meilleures pratiques dans ce domaine ?");
      break;
    case 'mistral':
      followUps.push("Peux-tu résumer les points clés ?");
      followUps.push("Quels sont les aspects les plus importants ?");
      break;
  }
  
  return followUps;
}
