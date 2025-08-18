import type { MemorySource } from './memory';
import { sendMessage, type LlmConfig } from '@/services/llm';

// =====================
// SYSTÈME D'EXTRACTION CONTEXTUELLE DE MÉMOIRE
// =====================

export interface ExtractedFact {
  content: string;
  context: string; // Phrase complète ou contexte élargi
  category: 'identity' | 'preferences' | 'goals' | 'constraints' | 'work' | 'personal' | 'schedule' | 'health' | 'contact' | 'skills' | 'relationships';
  tags?: string[];
  importance?: number; // 1..5
  confidence?: number; // 0..1
  source?: MemorySource;
  timestamp?: Date;
}

// Patterns pour capturer des contextes complets
const CONTEXTUAL_PATTERNS = {
  identity: [
    /(?:je (?:m'appelle|suis)|mon (?:nom|prénom) (?:est|c'est)|moi c'est)\s+([^.!?\n]+)/gi,
    /(?:j'ai|je viens d'avoir|je fête mes)\s+(\d+)\s+ans/gi,
    /(?:je (?:vis|habite|réside)|ma (?:ville|région) (?:est|c'est))\s+([^.!?\n]+)/gi,
    /(?:je suis (?:né|née)|je viens)\s+(?:de|du|des)\s+([^.!?\n]+)/gi
  ],
  
  preferences: [
    /(?:j'adore|j'aime beaucoup|je préfère|ma passion (?:est|c'est))\s+([^.!?\n]+)/gi,
    /(?:je déteste|je n'aime pas|j'évite)\s+([^.!?\n]+)/gi,
    /(?:mon (?:style|goût|type) préféré (?:est|c'est))\s+([^.!?\n]+)/gi,
    /(?:côté (?:musique|films|livres|cuisine))\s*[,:]*\s*([^.!?\n]+)/gi,
    /(?:question (?:nourriture|alimentation|repas))\s*[,:]*\s*([^.!?\n]+)/gi
  ],
  
  goals: [
    /(?:mon (?:objectif|but|projet|rêve) (?:est|c'est)|je (?:veux|souhaite|compte|projette|planifie))\s+([^.!?\n]+)/gi,
    /(?:j'aimerais|je voudrais|mon ambition (?:est|c'est))\s+([^.!?\n]+)/gi,
    /(?:je (?:veux apprendre|me forme à|étudie))\s+([^.!?\n]+)/gi,
    /(?:dans (?:l'avenir|le futur|quelques (?:mois|années)))\s*[,:]*\s*([^.!?\n]+)/gi
  ],
  
  work: [
    /(?:je (?:travaille|bosse) (?:comme|en tant que)|mon (?:métier|travail|job) (?:est|c'est)|je suis)\s+([^.!?\n]+)/gi,
    /(?:je (?:travaille|bosse) (?:chez|pour|dans))\s+([^.!?\n]+)/gi,
    /(?:mon (?:domaine|secteur) (?:d'activité|professionnel) (?:est|c'est))\s+([^.!?\n]+)/gi,
    /(?:j'utilise|je maîtrise|mes (?:compétences|outils) (?:sont|incluent))\s+([^.!?\n]+)/gi,
    /(?:niveau (?:professionnel|carrière))\s*[,:]*\s*([^.!?\n]+)/gi
  ],
  
  constraints: [
    /(?:je (?:ne peux pas|n'ai pas le droit de|dois éviter)|il faut que j'évite)\s+([^.!?\n]+)/gi,
    /(?:je suis (?:allergique à|intolérant à)|allergie à)\s+([^.!?\n]+)/gi,
    /(?:côté (?:santé|médical))\s*[,:]*\s*([^.!?\n]+)/gi,
    /(?:mes (?:contraintes|limitations) (?:sont|incluent))\s+([^.!?\n]+)/gi
  ],
  
  schedule: [
    /(?:(?:tous les|chaque)\s+(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)s?)\s+([^.!?\n]*)/gi,
    /(?:le (?:matin|après-midi|soir))\s*[,:]*\s*([^.!?\n]+)/gi,
    /(?:mes (?:horaires|disponibilités) (?:sont|c'est))\s+([^.!?\n]+)/gi,
    /(?:question (?:planning|agenda|emploi du temps))\s*[,:]*\s*([^.!?\n]+)/gi
  ],
  
  relationships: [
    /(?:(?:mon|ma)\s+(?:conjoint|mari|femme|partenaire|copain|copine|fiancé|fiancée))\s+([^.!?\n]*)/gi,
    /(?:j'ai|nous avons)\s+(?:un|une|des|\d+)\s+(?:enfant|enfants|fils|fille)\s*([^.!?\n]*)/gi,
    /(?:ma (?:famille|situation familiale))\s*[,:]*\s*([^.!?\n]+)/gi,
    /(?:côté (?:famille|personnel))\s*[,:]*\s*([^.!?\n]+)/gi
  ],
  
  skills: [
    /(?:je (?:maîtrise|connais|sais faire)|mes (?:compétences|talents) (?:sont|incluent))\s+([^.!?\n]+)/gi,
    /(?:je suis (?:doué|forte|bon|bonne) (?:en|pour))\s+([^.!?\n]+)/gi,
    /(?:niveau (?:technique|compétences))\s*[,:]*\s*([^.!?\n]+)/gi
  ]
};

// Fonction principale d'extraction contextuelle
export function extractFactsFromText(text: string, opts?: { source?: MemorySource }): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  if (!text || text.length < 10) return facts;
  
  // Nettoyer et préparer le texte
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Extraire des faits contextuels pour chaque catégorie
  for (const [category, patterns] of Object.entries(CONTEXTUAL_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = [...cleanText.matchAll(pattern)];
      
      for (const match of matches) {
        const extractedContent = match[1]?.trim();
        if (!extractedContent || extractedContent.length < 3) continue;
        
        // Trouver la phrase complète qui contient ce match
        const fullContext = findFullContext(cleanText, match.index || 0);
        
        // Calculer l'importance et la confiance
        const importance = calculateImportance(category as keyof typeof CONTEXTUAL_PATTERNS, extractedContent);
        const confidence = calculateConfidence(match[0], extractedContent);
        
        // Créer le fait avec contexte complet
        const fact: ExtractedFact = {
          content: formatFactContent(category, extractedContent),
          context: fullContext,
          category: category as ExtractedFact['category'],
          tags: generateTags(category, extractedContent),
          importance,
          confidence,
          source: opts?.source,
          timestamp: new Date()
        };
        
        facts.push(fact);
      }
    }
  }
  
  // Déduplication intelligente basée sur le contenu et le contexte
  return deduplicateContextualFacts(facts);
}



// Trouver le contexte complet autour d'un match
function findFullContext(text: string, matchIndex: number): string {
  // Trouver le début et la fin de la phrase
  let start = matchIndex;
  let end = matchIndex;
  
  // Chercher le début de la phrase (ou du paragraphe)
  while (start > 0 && !/[.!?\n]/.test(text[start - 1])) {
    start--;
  }
  
  // Chercher la fin de la phrase
  while (end < text.length && !/[.!?\n]/.test(text[end])) {
    end++;
  }
  
  // Inclure la ponctuation finale
  if (end < text.length) end++;
  
  return text.slice(start, end).trim();
}

// Calculer l'importance d'un fait selon sa catégorie
function calculateImportance(category: keyof typeof CONTEXTUAL_PATTERNS, content: string): number {
  const baseImportance = {
    identity: 5,
    work: 4,
    goals: 4,
    constraints: 5,
    health: 5,
    preferences: 3,
    schedule: 3,
    relationships: 4,
    skills: 3,
    contact: 2,
    personal: 3
  };
  
  let importance = baseImportance[category] || 3;
  
  // Ajuster selon la longueur et la spécificité du contenu
  if (content.length > 50) importance += 1;
  if (content.includes('très') || content.includes('vraiment') || content.includes('absolument')) {
    importance += 1;
  }
  
  return Math.min(5, Math.max(1, importance));
}

// Calculer la confiance d'extraction
function calculateConfidence(fullMatch: string, extractedContent: string): number {
  let confidence = 0.7; // Base
  
  // Plus le match est long et spécifique, plus la confiance est élevée
  if (fullMatch.length > 20) confidence += 0.1;
  if (extractedContent.length > 30) confidence += 0.1;
  
  // Présence d'indicateurs de certitude
  if (/\b(toujours|jamais|très|vraiment|absolument|certainement)\b/i.test(fullMatch)) {
    confidence += 0.1;
  }
  
  return Math.min(1, Math.max(0.3, confidence));
}

// Formater le contenu du fait selon sa catégorie
function formatFactContent(category: string, content: string): string {
  const prefixes = {
    identity: 'Identité',
    preferences: 'Préférence',
    goals: 'Objectif',
    work: 'Professionnel',
    constraints: 'Contrainte',
    schedule: 'Planning',
    relationships: 'Relationnel',
    skills: 'Compétence',
    health: 'Santé',
    contact: 'Contact',
    personal: 'Personnel'
  };
  
  const prefix = prefixes[category as keyof typeof prefixes] || 'Info';
  return `${prefix}: ${content.charAt(0).toUpperCase() + content.slice(1)}`;
}

// Générer des tags pertinents
function generateTags(category: string, content: string): string[] {
  const baseTags = [category];
  
  // Tags spécifiques selon le contenu
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('travail') || contentLower.includes('job') || contentLower.includes('métier')) {
    baseTags.push('travail');
  }
  if (contentLower.includes('famille') || contentLower.includes('enfant') || contentLower.includes('conjoint')) {
    baseTags.push('famille');
  }
  if (contentLower.includes('santé') || contentLower.includes('médical') || contentLower.includes('allergie')) {
    baseTags.push('santé');
  }
  if (contentLower.includes('apprendre') || contentLower.includes('formation') || contentLower.includes('étude')) {
    baseTags.push('apprentissage');
  }
  
  return baseTags.slice(0, 4); // Limiter à 4 tags
}

// Déduplication intelligente des faits
function deduplicateContextualFacts(facts: ExtractedFact[]): ExtractedFact[] {
  const seen = new Map<string, ExtractedFact>();
  
  for (const fact of facts) {
    // Créer une clé basée sur le contenu normalisé
    const normalizedContent = fact.content.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const key = `${fact.category}-${normalizedContent}`;
    
    // Garder le fait avec la plus haute confiance
    if (!seen.has(key) || (fact.confidence || 0) > (seen.get(key)?.confidence || 0)) {
      seen.set(key, fact);
    }
  }
  
  return Array.from(seen.values())
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 15); // Limiter à 15 faits les plus importants
}

// Extraction LLM pour des contextes complexes
export async function extractFactsLLM(text: string): Promise<ExtractedFact[]> {
  if (!text || text.trim().length < 10) return [];
  
  const system = `Tu es un extracteur de mémoire contextuelle. Analyse le texte et retourne un JSON array de faits importants avec leur contexte complet.

Format attendu:
[{
  "content": "Description du fait",
  "context": "Phrase ou contexte complet",
  "category": "identity|preferences|goals|work|constraints|schedule|relationships|skills|health|contact|personal",
  "importance": 1-5,
  "confidence": 0.0-1.0
}]

Règles:
- Capture des informations complètes, pas des fragments
- Inclus le contexte complet de chaque fait
- Priorise les informations stables et importantes
- Maximum 10 faits
- Pas d'invention, seulement ce qui est explicitement mentionné`;

  try {
    if (localStorage.getItem('mode_prive') === 'true') return [];
    
    const stored = (localStorage.getItem('llm_provider') as 'gemini' | 'openai' | 'mistral') || 'gemini';
    const llmConfig: LlmConfig = {
      provider: stored,
      gemini: { temperature: 0.2, maxOutputTokens: 1024, topK: 20, topP: 0.9 },
      openai: { temperature: 0.2, top_p: 0.9, max_tokens: 1024, model: 'gpt-4o-mini' },
      mistral: { temperature: 0.2, top_p: 0.9, max_tokens: 1024, model: 'mistral-small-latest' },
    };
    
    const response = await sendMessage(llmConfig, [{ text, isUser: true }], undefined, system, { soft: true });
    
    const jsonStart = response.indexOf('[');
    const jsonEnd = response.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) return [];
    
    const raw = response.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(raw);
    
    if (!Array.isArray(parsed)) return [];
    
    return parsed
      .filter((x: any) => x && typeof x.content === 'string' && typeof x.context === 'string')
      .map((x: any) => ({
        content: String(x.content).trim(),
        context: String(x.context).trim(),
        category: x.category || 'personal',
        importance: Math.min(5, Math.max(1, Number(x.importance) || 3)),
        confidence: Math.min(1, Math.max(0, Number(x.confidence) || 0.7)),
        timestamp: new Date()
      }))
      .slice(0, 10);
      
  } catch (error) {
    console.warn('Erreur extraction LLM:', error);
    return [];
  }
}

// Version avec mode soft pour éviter les erreurs fatales
export async function extractFactsLLMSoft(text: string): Promise<ExtractedFact[]> {
  if (!text || text.trim().length < 10) return [];
  
  const system = `Tu es un extracteur de faits personnels. Analyse le texte et extrait UNIQUEMENT les informations factuelles importantes sur l'utilisateur.

Règles strictes :
- Extrais seulement les faits personnels concrets (identité, préférences, objectifs, contraintes, travail, etc.)
- Ignore les questions, demandes d'aide, conversations générales
- Chaque fait doit être une information durable et réutilisable
- Format JSON strict : [{"content": "fait", "category": "identity|preferences|goals|constraints|work|personal|schedule|health|contact|skills|relationships", "importance": 1-5, "confidence": 0.0-1.0, "tags": ["tag1", "tag2"]}]
- Maximum 10 faits par analyse
- Si aucun fait personnel détecté, retourne []`;

  try {
    if (localStorage.getItem('mode_prive') === 'true') return [];
    
    const stored = (localStorage.getItem('llm_provider') as 'gemini' | 'openai' | 'mistral') || 'gemini';
    const llmConfig: LlmConfig = {
      provider: stored,
      gemini: { temperature: 0.2, maxOutputTokens: 2048, topK: 20, topP: 0.8 },
      openai: { temperature: 0.2, top_p: 0.8, max_tokens: 2048, model: 'gpt-4o-mini' },
      mistral: { temperature: 0.2, top_p: 0.8, max_tokens: 2048, model: 'mistral-small-latest' },
    };
    
    const response = await sendMessage(llmConfig, [{ text, isUser: true }], undefined, system, { soft: true });
    if (!response || response.trim().length === 0) {
      console.warn('Réponse vide de l\'API pour l\'extraction de faits');
      return [];
    }
    
    const parsed = JSON.parse(response.trim());
    
    if (!Array.isArray(parsed)) return [];
    
    return parsed.map((fact: any) => ({
      content: String(fact.content || '').trim(),
      context: String(fact.content || '').trim(),
      category: fact.category || 'personal',
      importance: Math.min(5, Math.max(1, Number(fact.importance) || 3)),
      confidence: Math.min(1, Math.max(0, Number(fact.confidence) || 0.7)),
      tags: Array.isArray(fact.tags) ? fact.tags.slice(0, 5) : [],
      source: 'llm' as MemorySource,
      timestamp: new Date()
    })).filter((f: ExtractedFact) => f.content.length > 5);
    
  } catch (error) {
    console.warn('Erreur extraction LLM (mode soft):', error);
    return [];
  }
}

// Résumé contextuel du profil utilisateur
export async function summarizeUserProfileLLM(messages: string[], maxChars = 800): Promise<string> {
  if (!messages || messages.length === 0) return '';
  
  const system = `Tu es un synthétiseur de profil utilisateur. Crée un résumé contextuel et structuré du profil de l'utilisateur basé sur ses messages.

Structure attendue:
• **Identité**: Informations personnelles de base
• **Professionnel**: Travail, compétences, outils
• **Préférences**: Goûts, styles, préférences
• **Objectifs**: Projets, apprentissages, ambitions
• **Contraintes**: Limitations, allergies, contraintes
• **Personnel**: Famille, relations, situation

Règles:
- Maximum ${maxChars} caractères
- Informations factuelles uniquement
- Pas de données sensibles sans consentement
- Style concis mais informatif`;

  const recentMessages = messages.slice(-15).join('\n\n');
  
  try {
    const stored = (localStorage.getItem('llm_provider') as 'gemini' | 'openai' | 'mistral') || 'gemini';
    const llmConfig: LlmConfig = {
      provider: stored,
      gemini: { temperature: 0.3, maxOutputTokens: 1024, topK: 30, topP: 0.9 },
      openai: { temperature: 0.3, top_p: 0.9, max_tokens: 1024, model: 'gpt-4o-mini' },
      mistral: { temperature: 0.3, top_p: 0.9, max_tokens: 1024, model: 'mistral-small-latest' },
    };
    
    const response = await sendMessage(llmConfig, [{ text: recentMessages, isUser: true }], undefined, system);
    return response.trim().slice(0, maxChars);
    
  } catch (error) {
    console.warn('Erreur résumé profil:', error);
    return '';
  }
}

// =====================
// SYSTÈME DE RÉSUMÉ AUTOMATIQUE
// =====================

// Génère un résumé automatique des derniers messages
export async function generateConversationSummary(messages: string[], maxChars = 600): Promise<string> {
  if (!messages || messages.length === 0) return '';
  
  const system = `Tu es un assistant spécialisé dans la création de résumés de conversation. Analyse les messages fournis et crée un résumé structuré qui capture les informations importantes.

Structure attendue:
• **Sujets principaux**: Les thèmes abordés
• **Informations clés**: Faits importants, décisions, conclusions
• **Actions**: Ce qui a été fait ou planifié
• **Contexte**: Éléments de contexte pertinents

Règles:
- Maximum ${maxChars} caractères
- Style concis mais informatif
- Capture l'essentiel sans détails superflus
- Préserve les informations importantes pour la suite de la conversation`;

  const conversationText = messages.join('\n\n');
  
  try {
    if (localStorage.getItem('mode_prive') === 'true') return '';
    
    const stored = (localStorage.getItem('llm_provider') as 'gemini' | 'openai' | 'mistral') || 'gemini';
    const llmConfig: LlmConfig = {
      provider: stored,
      gemini: { temperature: 0.3, maxOutputTokens: 1024, topK: 30, topP: 0.9 },
      openai: { temperature: 0.3, top_p: 0.9, max_tokens: 1024, model: 'gpt-4o-mini' },
      mistral: { temperature: 0.3, top_p: 0.9, max_tokens: 1024, model: 'mistral-small-latest' },
    };
    
    const response = await sendMessage(llmConfig, [{ text: conversationText, isUser: true }], undefined, system, { soft: true });
    if (!response || response.trim().length === 0) {
      console.warn('Réponse vide de l\'API pour le résumé');
      return '';
    }
    return response.trim().slice(0, maxChars);
    
  } catch (error) {
    console.warn('Erreur génération résumé:', error);
    return '';
  }
}

// Extrait les informations importantes des derniers messages
export async function extractImportantInfo(messages: string[]): Promise<ExtractedFact[]> {
  if (!messages || messages.length === 0) return [];
  
  const conversationText = messages.join('\n\n');
  
  try {
    // Utiliser l'extraction LLM existante avec mode soft
    const facts = await extractFactsLLMSoft(conversationText);
    
    // Filtrer pour ne garder que les faits les plus importants
    return facts
      .filter(fact => (fact.importance || 3) >= 3 && (fact.confidence || 0.7) >= 0.6)
      .sort((a, b) => (b.importance || 3) - (a.importance || 3))
      .slice(0, 5); // Maximum 5 faits importants
      
  } catch (error) {
    console.warn('Erreur extraction faits importants:', error);
    return [];
  }
}

// =====================
// EXPORTED FUNCTIONS FOR COMPATIBILITY
// =====================

// Standalone function exports for backward compatibility

// Export standalone functions for backward compatibility
export { extractFactsFromText as extractFactsFromTextContextual };
export { extractFactsLLM as extractFactsLLMContextual };

// =====================
// ENHANCED FACT EXTRACTOR CLASS
// =====================

export class EnhancedFactExtractor {
  private readonly confidenceThreshold = 0.6;
  
  async extractFactsFromText(text: string, opts?: { 
    source?: MemorySource;
    includeContext?: boolean;
    maxFacts?: number;
  }): Promise<ExtractedFact[]> {
    // Utiliser la nouvelle extraction contextuelle
    const contextualFacts = extractFactsFromText(text, opts);
    
    // Si pas assez de faits trouvés, utiliser l'extraction LLM
    if (contextualFacts.length < 3 && opts?.includeContext) {
      const llmFacts = await extractFactsLLM(text);
      contextualFacts.push(...llmFacts);
    }
    
    // Filtrer par confiance et limiter le nombre
    return contextualFacts
      .filter(fact => (fact.confidence || 0) >= this.confidenceThreshold)
      .slice(0, opts?.maxFacts || 10);
  }
}

// Export par défaut pour compatibilité
export default {
  extractFactsFromText,
  extractFactsLLM,
  summarizeUserProfileLLM,
  EnhancedFactExtractor
};


