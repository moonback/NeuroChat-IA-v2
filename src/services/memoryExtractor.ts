import type { MemorySource } from './memory';
import { type GeminiGenerationConfig } from '@/services/geminiApi';
import { sendMessage, type LlmConfig } from '@/services/llm';

// =====================
// Regex précompilés (performance)
// =====================
const MONTHS_RE = '(?:jan|fev|mar|avr|mai|jun|jui|aou|sep|oct|nov|dec)';

// Captures utiles uniquement → utiliser des groupes non-capturants partout ailleurs
const NAME_RE = /\b(?:je m ?app(?:e)?l+e?s?|mon prenom est|moi c est)\s+([a-z'\-]{2,})(?:\s+([a-z'\-]{2,}))?/iu;
const CITY_RE = /\b(?:j ?habite|je vis|je suis basee?|je suis de)\s+(?:a|en|au|aux)\s+([a-z'\-\s]{2,})/iu;
const LANG_RE = /\b(?:je parle|je maitrise|ma langue (?:maternelle|native) est)\s+([a-z\-\s,et]+)\b/giu;
const PREF_RE = /\b(?:jaime|je prefere|je deteste)\s+([^\.\n]{3,120})/giu;
const RECURRENCE_DAY_RE = /\b(?:tous? les|chaque)\s+(?:lundis?|mardis?|mercredis?|jeudis?|vendredis?|samedis?|dimanches?)\b/iu;
const RECURRENCE_DAYTIME_RE = /\b(?:le|les)\s+(?:lundis?|mardis?|mercredis?|jeudis?|vendredis?|samedis?|dimanches?)\s+(?:matin|apres-midi|soir(?:ee)?)\b/giu;

const GOAL_FORMS: RegExp[] = [
  new RegExp(`\\b(?:mon|ma|mes)\\s+(?:objectif|projet|but|priorite)s?\\s+(?:est|sont|:)\\s+([^\\.\\n]{4,160})`, 'iu'),
  /\b(?:mon|ma)\s+(?:but|objectif)\s+(?:est|sera|devient)\s+de\s+([^\.\n]{4,160})/iu,
  /\bje\s+(?:veux|souhaite|compte|prevois|projette|planifie)\s+([^\.\n]{4,160})/iu,
  /\bj(?:'|e)\s+aimerais\s+([^\.\n]{4,160})/iu,
];

const LEARNING_RE = /\b(?:je veux apprendre|j apprends|je me forme a)\s+([^\.\n]{3,160})/giu;
const BDAY_RE = /\b(?:mon anniversaire|ma date de naissance)\s+(?:est|c est|:)?\s+([^\.\n]{3,40})/iu;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/i;
const PHONE_RE = /\b(?:\+\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?(?:\d[\s.-]?){6,14}\b/i;

const JOB_RE = /\b(?:je (?:travaille|bosse) (?:comme|en tant que)\s+([a-z\-\s]{2,})|je suis\s+([a-z\-\s]{2,}))\b/giu;
const COMPANY_RE = /\b(?:je (?:travaille|bosse) (?:chez|pour)\s+([a-z\d&' .-]{2,}))\b/giu;

const ALLERGY_RE = /\b(?:je suis allergique a|allergie a)\s+([^\.\n]{3,80})/giu;
const DIET_RE = /\b(?:je suis|je mange)\s+(vegetarien|vegane|vegan|sans gluten|halal|casher|keto|paleo)\b/giu;
const CONSTRAINT_RE = /\b(?:je ne peux pas|je nai pas le droit de|j evite)\s+([^\.\n]{3,100})/giu;

const COMM_PREF_RE = /\b(?:je prefere|preference de communication)\s+(?:par|via)\s+([a-z\s\-]{3,20})/giu;
const TOOLS_RE = /\b(?:j utilise|je travaille avec|mon stack|ma stack)\s+([^\.\n]{3,160})/giu;

const TODO_FORMS: RegExp[] = [
  /\b(?:je dois|il faut que je|faut que je|je devrais)\s+([^\.\n]{3,160})/giu,
  /\b(?:a\s+faire|à\s+faire|to ?do)\s*[:\-]?\s+([^\n]{3,160})/giu,
  /\b(?:rappelle(?:-moi)?\s+de|n'?oublie pas de|pense\s+à)\s+([^\.\n]{3,160})/giu,
  /\b(?:prevoir|prévoir|planifier|planifie|programmer)\s+([^\.\n]{3,160})/giu,
  /\b(?:rendez[- ]vous|rdv)\s+(?:le\s+|pour\s+)?([^\.\n]{3,120})/giu,
];

const DEADLINE_FORMS: RegExp[] = [
  /\b(?:avant|pour|d'ici|d ici|d’ici)\s+(demain|apres ?demain|la semaine prochaine|ce soir|fin de semaine)/giu,
  /\b(?:avant|pour)\s+([0-3]?\d\/[0-1]?\d(?:\/[0-9]{2,4})?)/giu,
  /\b(?:avant|pour|le)\s+([0-3]?\d[\.\-][0-1]?\d(?:[\.\-][0-9]{2,4})?)/giu,
  new RegExp(`\\b(?:avant|pour|le)\\s+([0-3]?\\d\\s+${MONTHS_RE}(?:\\s+[0-9]{2,4})?)`, 'giu'),
  /\b(\d{4}-\d{2}-\d{2})(?:[ t](\d{2}[:h]\d{2}))?/giu,
  /\b(?:à|a|vers)\s+(\d{1,2}h(?:\d{2})?|\d{1,2}:\d{2})\b/giu,
];


export interface ExtractedFact {
  content: string;
  tags?: string[];
  importance?: number; // 1..5
  source?: MemorySource;
}

// Heuristique simple pour extraire des faits personnels/actionnables
// Note: pas de PII sensible (email/téléphone) sauf si explicitement confirmé par l'utilisateur
export function extractFactsFromText(text: string, opts?: { source?: MemorySource }): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  if (!text || text.length < 3) return facts;
  const norm = normalizeForMatch(text);

  // Nom / prénom
  const nameMatch = NAME_RE.exec(norm);
  if (nameMatch) {
    const grp = [nameMatch[1], nameMatch[2]].filter(Boolean).join(' ');
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Prénom/Nom: ${capitalize(orig)}`, tags: ['profil', 'identité'], importance: 5, source: opts?.source });
  }

  // Localisation
  const cityMatch = CITY_RE.exec(norm);
  if (cityMatch) {
    const grp = cleanTrailing(cityMatch[1]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Ville: ${capitalize(orig)}`, tags: ['profil', 'localisation'], importance: 4, source: opts?.source });
  }

  // Langues (multi)
  for (const m of matchAll(LANG_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    const langs = splitList(orig);
    if (langs.length) facts.push({ content: `Langues: ${langs.map(capitalize).join(', ')}`, tags: ['profil', 'langue'], importance: 3, source: opts?.source });
  }

  // Préférences (aime/préfère/déteste) — multi éléments
  for (const m of matchAll(PREF_RE, norm)) {
    const verbText = m[0].toLowerCase();
    const verb = verbText.includes('deteste') ? 'deteste' : verbText.includes('prefere') ? 'prefere' : 'aime';
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    const list = splitList(orig);
    const sentiment = verb.includes('deteste') ? 'n’aime pas' : verb.includes('prefere') ? 'préfère' : 'aime';
    for (const item of list) {
      facts.push({ content: `Préférence: ${sentiment} ${capitalize(item)}`, tags: ['préférences'], importance: 3, source: opts?.source });
    }
  }

  // Disponibilités/date récurrente simple
  const dayMatch = RECURRENCE_DAY_RE.exec(norm);
  if (dayMatch) {
    facts.push({ content: `Récurrence: ${capitalize(dayMatch[0])}`, tags: ['agenda'], importance: 3, source: opts?.source });
  }
  for (const m of matchAll(RECURRENCE_DAYTIME_RE, norm)) {
    facts.push({ content: `Disponibilité: ${capitalize(m[0])}`, tags: ['agenda'], importance: 3, source: opts?.source });
  }

  // Rappel objectif / projet (formes variées)
  for (const re of GOAL_FORMS) {
    const m = re.exec(norm);
    if (m) {
      const grp = cleanTrailing(m[1] || m[m.length - 1]);
      const orig = recoverOriginal(text, grp) || grp;
      facts.push({ content: `Objectif: ${capitalize(orig)}`, tags: ['objectif'], importance: 4, source: opts?.source });
      break;
    }
  }
  for (const m of matchAll(LEARNING_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Apprentissage: ${capitalize(orig)}`, tags: ['objectif', 'apprentissage'], importance: 4, source: opts?.source });
  }

  // Anniversaire (non sensible au jour précis si non nécessaire)
  const bday = BDAY_RE.exec(norm);
  if (bday) {
    const grp = cleanTrailing(bday[1]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Anniversaire: ${capitalize(orig)}`, tags: ['profil'], importance: 3, source: opts?.source });
  }

  // Email/téléphone — on évite de stocker sans confirmation explicite
  const email = EMAIL_RE.exec(text);
  if (email && (norm.includes('tu peux retenir') || norm.includes('garde en memoire') || norm.includes('sauvegarde mon email'))) {
    facts.push({ content: `Email: ${email[0]}`, tags: ['contact'], importance: 2, source: opts?.source });
  }
  const phone = PHONE_RE.exec(text);
  if (phone && (norm.includes('tu peux retenir') || norm.includes('garde en memoire') || norm.includes('sauvegarde mon numero'))) {
    facts.push({ content: `Téléphone: ${phone[0]}`, tags: ['contact'], importance: 2, source: opts?.source });
  }

  // Métier / rôle
  for (const m of matchAll(JOB_RE, norm)) {
    const roleNorm = (m[1] || m[2] || '').trim();
    if (roleNorm) {
      const orig = recoverOriginal(text, roleNorm) || roleNorm;
      facts.push({ content: `Métier: ${capitalize(cleanTrailing(orig))}`, tags: ['profil', 'métier'], importance: 4, source: opts?.source });
    }
  }
  for (const m of matchAll(COMPANY_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    if (grp) facts.push({ content: `Société: ${capitalize(orig)}`, tags: ['profil', 'travail'], importance: 3, source: opts?.source });
  }

  // Contraintes / santé / régime
  for (const m of matchAll(ALLERGY_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Allergie: ${capitalize(orig)}`, tags: ['santé', 'contrainte'], importance: 5, source: opts?.source });
  }
  for (const m of matchAll(DIET_RE, norm)) {
    facts.push({ content: `Régime: ${capitalize(m[1])}`, tags: ['santé', 'régime'], importance: 4, source: opts?.source });
  }
  for (const m of matchAll(CONSTRAINT_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Contrainte: ${capitalize(orig)}`, tags: ['contrainte'], importance: 4, source: opts?.source });
  }

  // Préférence de communication / outils
  for (const m of matchAll(COMM_PREF_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Communication: ${capitalize(orig)}`, tags: ['préférences', 'communication'], importance: 3, source: opts?.source });
  }
  for (const m of matchAll(TOOLS_RE, norm)) {
    const grp = cleanTrailing(m[1]);
    const orig = recoverOriginal(text, grp) || grp;
    const items = splitList(orig);
    if (items.length) facts.push({ content: `Outils: ${items.map(capitalize).join(', ')}`, tags: ['travail', 'outils'], importance: 3, source: opts?.source });
  }

  // Tâches / rappels (formes étendues) + deadlines
  for (const re of TODO_FORMS) {
    for (const m of matchAll(re, norm)) {
      const grp = cleanTrailing(m[1]);
      const orig = recoverOriginal(text, grp) || grp;
      facts.push({ content: `Tâche: ${capitalize(orig)}`, tags: ['tâche'], importance: 3, source: opts?.source });
    }
  }
  // Deadlines étendues (formats de date variés, mots-clés)
  for (const re of DEADLINE_FORMS) {
    for (const m of matchAll(re, norm)) {
      const whole = m[0];
      const orig = recoverOriginal(text, cleanTrailing(whole)) || cleanTrailing(whole);
      facts.push({ content: `Deadline: ${capitalize(orig)}`, tags: ['agenda', 'deadline'], importance: 3, source: opts?.source });
    }
  }

  // Préférence de réponse (style)
  const styleRegex = /\b(reponds|parle|jaime les reponses)\s+([^\.\n]{3,80})/gi;
  for (const m of matchAll(styleRegex, norm)) {
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Style de réponse: ${capitalize(orig)}`, tags: ['préférences', 'style-réponse'], importance: 2, source: opts?.source });
  }

  // Fuseau horaire / âge / enfants / relation
  const tz = /(gmt|utc)\s*([+-]\d{1,2})/i.exec(norm);
  if (tz) facts.push({ content: `Fuseau horaire: ${tz[1].toUpperCase()}${tz[2]}`, tags: ['profil', 'temps'], importance: 2, source: opts?.source });
  const age = /\bj ai\s+(\d{1,2})\s+ans\b/i.exec(norm);
  if (age) facts.push({ content: `Âge: ${age[1]} ans`, tags: ['profil'], importance: 2, source: opts?.source });
  const kids = /\bj ai\s+(un|\d+)\s+enfant(s)?\b/i.exec(norm);
  if (kids) facts.push({ content: `Enfants: ${kids[1].replace('un','1')}`, tags: ['profil', 'famille'], importance: 2, source: opts?.source });
  const relationship = /\b(mon|ma)\s+(conjoint|mari|femme|partenaire|copain|copine|fiance|fiancee)\b/i.exec(norm);
  if (relationship) facts.push({ content: 'Relation: en couple', tags: ['profil', 'famille'], importance: 2, source: opts?.source });

  return dedupeFacts(facts);
}

function cleanTrailing(s: string): string {
  return s.replace(/[\s,;.:!?]+$/, '').trim();
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeWithMap(input: string): { n: string; map: number[] } {
  const map: number[] = [];
  let n = '';
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const repl = ch.replace(/[’`]/g, "'");
    const decomp = repl.normalize('NFD');
    let base = '';
    for (const c of decomp) {
      // keep only base chars, drop diacritics
      if (!/\p{M}/u.test(c)) base += c;
    }
    for (const c of base) {
      n += c.toLowerCase();
      map.push(i);
    }
  }
  return { n, map };
}

function recoverOriginal(original: string, normFragment: string): string | null {
  if (!normFragment) return null;
  const { n, map } = normalizeWithMap(original);
  const start = n.indexOf(normFragment.toLowerCase());
  if (start === -1) return null;
  const end = start + normFragment.length;
  const startOrig = map[start];
  const endOrig = map[Math.max(0, end - 1)] + 1;
  return original.slice(startOrig, endOrig);
}

function matchAll(re: RegExp, text: string): RegExpExecArray[] {
  const results: RegExpExecArray[] = [];
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
  const r = new RegExp(re.source, flags);
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = r.exec(text)) !== null) {
    results.push(m);
    if (m.index === r.lastIndex) r.lastIndex++; // avoid zero-length match loop
  }
  return results;
}

function splitList(s: string): string[] {
  return s
    .split(/,| et /i)
    .map((x) => cleanTrailing(x).trim())
    .filter((x) => x.length > 0)
    .slice(0, 10);
}

function dedupeFacts(facts: ExtractedFact[]): ExtractedFact[] {
  const seen = new Set<string>();
  const out: ExtractedFact[] = [];
  for (const f of facts) {
    const key = f.content.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(f);
    }
  }
  return out;
}

// --- LLM fallback extraction (si heuristiques ne trouvent rien) ---
export async function extractFactsLLM(text: string): Promise<ExtractedFact[]> {
  if (!text || text.trim().length < 3) return [];
  const system = [
    'Tu es un extracteur de faits. Retourne STRICTEMENT un JSON array de faits pertinents concernant le profil, préférences, objectifs, contraintes, outils, agenda, contact (uniquement si autorisé explicitement).',
    'Format: [{"content":"...","tags":["profil"],"importance":3}]',
    'Règles:',
    '- Pas d’invention, uniquement ce qui est dans le texte.',
    '- 0-6 items max, concis.',
    '- importance: 1..5 (5 = très important).',
    '- Pas de données sensibles sauf consentement explicite (email/tel).',
  ].join('\n');
  const gen: GeminiGenerationConfig = { temperature: 0.2, maxOutputTokens: 512, topK: 20, topP: 0.9 };
  try {
    // Si mode privé, ne pas interroger la mémoire/LLM pour extraction
    if (localStorage.getItem('mode_prive') === 'true') return [];
    const llmCfg: LlmConfig = {
      provider: (localStorage.getItem('llm_provider') as 'gemini' | 'openai') || 'gemini',
      gemini: gen,
      openai: { temperature: gen.temperature, top_p: gen.topP, max_tokens: gen.maxOutputTokens, model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini' },
    };
    const response = await sendMessage(llmCfg, [{ text, isUser: true }], undefined, system, { soft: true });
    const jsonStart = response.indexOf('[');
    const jsonEnd = response.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) return [];
    const raw = response.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x: any) => x && typeof x.content === 'string')
      .map((x: any) => ({
        content: String(x.content).trim(),
        tags: Array.isArray(x.tags) ? x.tags.map((t: any) => String(t)).slice(0, 5) : [],
        importance: Number(x.importance) || 3,
      }));
  } catch {
    return [];
  }
}

export async function summarizeUserProfileLLM(messages: string[], maxChars = 500): Promise<string> {
  if (!messages || messages.length === 0) return '';
  const system = [
    'Tu es un synthétiseur de profil. Résume en français, en puces courtes, les infos stables de l’utilisateur (profil, préférences, objectifs, contraintes, outils, agenda).',
    `Contraintes: ${maxChars} caractères max.`,
    'Pas de données sensibles sans consentement explicite.',
  ].join('\n');
  const body = messages.slice(-10).join('\n- ');
  const gen: GeminiGenerationConfig = { temperature: 0.2, maxOutputTokens: 512, topK: 20, topP: 0.9 };
  try {
    const llmCfg: LlmConfig = {
      provider: (localStorage.getItem('llm_provider') as 'gemini' | 'openai') || 'gemini',
      gemini: gen,
      openai: { temperature: gen.temperature, top_p: gen.topP, max_tokens: gen.maxOutputTokens, model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini' },
    };
    const response = await sendMessage(llmCfg, [{ text: body, isUser: true }], undefined, system);
    return response.trim().slice(0, maxChars);
  } catch {
    return '';
  }
}


