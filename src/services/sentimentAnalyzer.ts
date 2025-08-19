export type EmotionType = 'neutral' | 'happy' | 'sad' | 'surprised' | 'thinking' | 'speaking' | 'listening';

export interface SentimentResult {
  emotion: EmotionType;
  confidence: number;
  intensity: number;
  keywords: string[];
}

// Mots-clés émotionnels en français
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy: [
    'bonheur', 'joie', 'heureux', 'sourire', 'rire', 'amusement', 'plaisir',
    'excellent', 'fantastique', 'génial', 'super', 'merveilleux', 'incroyable',
    'félicitations', 'bravo', 'succès', 'victoire', 'réussite', 'progrès'
  ],
  sad: [
    'tristesse', 'déception', 'désolé', 'malheureux', 'découragé', 'déprimé',
    'échec', 'perte', 'problème', 'difficile', 'compliqué', 'douloureux',
    'regret', 'remords', 'solitude', 'abandon', 'rejet', 'échec'
  ],
  surprised: [
    'surprise', 'étonnement', 'incroyable', 'impensable', 'inouï', 'extraordinaire',
    'choquant', 'stupéfiant', 'renversant', 'bouleversant', 'déconcertant',
    'inattendu', 'imprévisible', 'soudain', 'brutal', 'dramatique'
  ],
  thinking: [
    'penser', 'réfléchir', 'considérer', 'analyser', 'examiner', 'étudier',
    'question', 'doute', 'curiosité', 'intérêt', 'comprendre', 'apprendre',
    'logique', 'raisonnement', 'déduction', 'hypothèse', 'théorie'
  ],
  speaking: [
    'dire', 'parler', 'expliquer', 'décrire', 'raconter', 'informer',
    'communiquer', 'exprimer', 'partager', 'discuter', 'débattre', 'convaincre'
  ],
  listening: [
    'écouter', 'entendre', 'comprendre', 'apprendre', 'recevoir', 'absorber',
    'attention', 'concentration', 'focus', 'observation', 'perception'
  ],
  neutral: []
};

// Mots de négation qui inversent le sentiment
const NEGATION_WORDS = ['pas', 'non', 'ne', 'aucun', 'rien', 'jamais', 'nullement'];

// Analyse simple basée sur les mots-clés
export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let emotion: EmotionType = 'neutral';
  let confidence = 0;
  let intensity = 0;
  let keywords: string[] = [];
  
  // Vérifier la présence de mots-clés émotionnels
  for (const [emotionType, keywordsList] of Object.entries(EMOTION_KEYWORDS)) {
    const foundKeywords = keywordsList.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      const currentConfidence = foundKeywords.length / keywordsList.length;
      const currentIntensity = Math.min(foundKeywords.length * 0.3, 1);
      
      if (currentConfidence > confidence) {
        emotion = emotionType as EmotionType;
        confidence = currentConfidence;
        intensity = currentIntensity;
        keywords = foundKeywords;
      }
    }
  }
  
  // Vérifier les négations
  const hasNegation = NEGATION_WORDS.some(neg => lowerText.includes(neg));
  if (hasNegation && emotion !== 'neutral') {
    // Inverser l'émotion si c'est une négation
    if (emotion === 'happy') emotion = 'sad';
    else if (emotion === 'sad') emotion = 'happy';
    confidence *= 0.8; // Réduire la confiance
  }
  
  // Détecter le mode de communication
  if (lowerText.includes('?') && emotion === 'neutral') {
    emotion = 'thinking';
    confidence = 0.6;
    intensity = 0.4;
  }
  
  // Détecter les exclamations
  if (lowerText.includes('!') && emotion === 'neutral') {
    emotion = 'surprised';
    confidence = 0.5;
    intensity = 0.6;
  }
  
  return {
    emotion,
    confidence: Math.min(confidence, 1),
    intensity: Math.min(intensity, 1),
    keywords
  };
}

// Analyse avancée avec contexte
export function analyzeSentimentAdvanced(text: string, context?: string): SentimentResult {
  const basicResult = analyzeSentiment(text);
  
  if (!context) return basicResult;
  
  // Analyser le contexte pour ajuster l'émotion
  const contextResult = analyzeSentiment(context);
  
  // Fusionner les résultats avec pondération
  const textWeight = 0.7;
  const contextWeight = 0.3;
  
  const mergedConfidence = (basicResult.confidence * textWeight) + 
                          (contextResult.confidence * contextWeight);
  
  const mergedIntensity = (basicResult.intensity * textWeight) + 
                         (contextResult.intensity * contextWeight);
  
  // Choisir l'émotion la plus probable
  let finalEmotion = basicResult.emotion;
  if (contextResult.confidence > basicResult.confidence) {
    finalEmotion = contextResult.emotion;
  }
  
  return {
    emotion: finalEmotion,
    confidence: Math.min(mergedConfidence, 1),
    intensity: Math.min(mergedIntensity, 1),
    keywords: [...new Set([...basicResult.keywords, ...contextResult.keywords])]
  };
}

// Analyse en temps réel pour les messages courts
export function analyzeSentimentRealtime(text: string): EmotionType {
  if (text.length < 10) return 'neutral';
  
  const result = analyzeSentiment(text);
  return result.confidence > 0.3 ? result.emotion : 'neutral';
}

// Détection automatique du mode de communication
export function detectCommunicationMode(text: string): EmotionType {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('?')) return 'thinking';
  if (lowerText.includes('!')) return 'surprised';
  if (lowerText.includes('...') || lowerText.includes('…')) return 'thinking';
  if (lowerText.includes(':)') || lowerText.includes('😊')) return 'happy';
  if (lowerText.includes(':(') || lowerText.includes('😔')) return 'sad';
  
  return 'neutral';
}
