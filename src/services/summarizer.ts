import { sendMessageToGemini, GeminiGenerationConfig } from '@/services/geminiApi';

export interface SummarizeInputMessage {
  text: string;
  isUser: boolean;
}

export interface SummarizeResult {
  summary: string;
  facts: string[];
}

// Prompt système spécialisé pour la summarisation (strict et orienté rétention pertinente).
const SUMMARIZER_SYSTEM_PROMPT = `Tu es un assistant qui résume des conversations en français.
Objectif: produire un résumé concis ET une liste de faits à retenir (uniquement les éléments pertinents, durables et utiles pour la suite).
Contraintes:
- Garde le ton neutre, sans interprétations.
- N'inclus AUCUNE donnée sensible inutile (emails, adresses, numéros, secrets) sauf si indispensable à la compréhension future.
- Pas de conseils non demandés.
- Aucune invention.
Critères d'un "fait à retenir":
- Information stable (préférence, contrainte, objectif, décision prise, contexte durable), pas un détail éphémère.
- Utile pour des échanges futurs.
Format de sortie:
Résumé: <2-4 phrases maximum>
Faits:
- <fait 1>
- <fait 2>
- <fait 3>
`;

const GENERATION_CONFIG: GeminiGenerationConfig = {
  temperature: 0.3,
  topK: 40,
  topP: 0.9,
  maxOutputTokens: 512,
};

export async function summarizeMessages(
  messages: SummarizeInputMessage[],
  previousSummary = '',
  previousFacts: string[] = []
): Promise<SummarizeResult> {
  // Si on a déjà un résumé, on le passe pour mise à jour incrémentale
  const contextParts: string[] = [];
  if (previousSummary) contextParts.push(`Résumé précédent: ${previousSummary}`);
  if (previousFacts.length > 0) {
    contextParts.push('Faits précédents:\n' + previousFacts.map((f) => `- ${f}`).join('\n'));
  }
  const incrementalHeader = contextParts.length > 0 ? contextParts.join('\n') + '\n\n' : '';

  const syntheticUserInstruction = `${incrementalHeader}Voici de nouveaux messages. Mets à jour le résumé et la liste de faits clés.`;

  const prompt = SUMMARIZER_SYSTEM_PROMPT;

  let textResponse = '';
  try {
    textResponse = await sendMessageToGemini(
      [
        { text: syntheticUserInstruction, isUser: true },
        // On passe la conversation en blocs alternant utilisateur/assistant
        ...messages.map((m) => ({ text: m.text, isUser: m.isUser })),
      ],
      undefined,
      prompt,
      GENERATION_CONFIG
    );
  } catch (err) {
    // Fallback local si l'API ne renvoie rien (panne temporaire/format vide)
    return localSummarize(messages);
  }

  // Parser un format simple:
  // Résumé: ...\nFaits:\n- ...\n- ...
  const result: SummarizeResult = { summary: '', facts: [] };
  try {
    const lines = textResponse.split('\n');
    let inFacts = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!inFacts) {
        if (/^faits\s*:/i.test(line)) {
          inFacts = true;
          continue;
        }
        const matchSummary = line.match(/^résumé\s*:\s*(.*)$/i);
        if (matchSummary) {
          result.summary = matchSummary[1].trim();
        } else if (result.summary) {
          // lignes suivantes du résumé (si multi-lignes)
          if (line.length > 0) result.summary += ' ' + line;
        }
      } else {
        const factMatch = line.match(/^[-•]\s*(.*)$/);
        if (factMatch && factMatch[1]) {
          const fact = factMatch[1].trim();
          if (fact.length > 0) result.facts.push(fact);
        }
      }
    }
  } catch {
    // Si parsing échoue, renvoie tout dans summary (ou fallback si vide)
    if (!textResponse || textResponse.trim().length === 0) {
      return localSummarize(messages);
    }
    return { summary: textResponse, facts: [] };
  }

  // Normalisation
  result.summary = result.summary || textResponse.slice(0, 500);
  result.facts = Array.from(new Set(result.facts)).slice(0, 12);
  return result;
}

// Fallback local minimaliste en cas d'échec API
function localSummarize(messages: SummarizeInputMessage[]): SummarizeResult {
  const MAX_SENTENCES = 4;
  // Prendre les 6 derniers tours (user/assistant)
  const tail = messages.slice(Math.max(0, messages.length - 12));
  const merged = tail.map((m) => m.text).join(' ').replace(/\s+/g, ' ').trim();
  const sentences = splitSentencesFr(merged).slice(0, MAX_SENTENCES);
  const summary = sentences.join(' ');
  const facts = extractFactsHeuristic(tail).slice(0, 8);
  return { summary, facts };
}

function splitSentencesFr(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function extractFactsHeuristic(items: SummarizeInputMessage[]): string[] {
  const candidates: string[] = [];
  const patterns = [
    /\b(j'aime|je préfère|je veux|je souhaite|je cherche|j'ai besoin de)\b/i,
    /\bobjectif|priorité|but\b/i,
    /\bdeadline|date|heure|demain|aujourd'hui|semaine\b/i,
    /\bbudget|coût|prix\b/i,
    /\bdois|ne pas|éviter|toujours|jamais\b/i,
    /\bpréférence|contraintes?|règle\b/i,
  ];
  for (const { text } of items) {
    const sents = splitSentencesFr(text);
    for (const s of sents) {
      if (patterns.some((re) => re.test(s))) {
        const clean = s.replace(/\s+/g, ' ').trim();
        if (clean.length > 0) candidates.push(clean);
      }
    }
  }
  // Dédupliquer et raccourcir
  const uniq = Array.from(new Set(candidates)).map((f) => truncate(f, 180));
  return uniq;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}


