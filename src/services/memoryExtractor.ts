import type { MemorySource } from './memory';

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
  const nameMatch = /\b(je m ?app(?:e)?l+e?s?|mon prenom est|moi c est)\s+([a-z'\-]{2,})(?:\s+([a-z'\-]{2,}))?/i.exec(norm);
  if (nameMatch) {
    const grp = [nameMatch[2], nameMatch[3]].filter(Boolean).join(' ');
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Prénom/Nom: ${capitalize(orig)}`, tags: ['profil', 'identité'], importance: 5, source: opts?.source });
  }

  // Localisation
  const cityMatch = /\b(j ?habite|je vis|je suis basee?|je suis de)\s+(a|en|au|aux)\s+([a-z'\-\s]{2,})/i.exec(norm);
  if (cityMatch) {
    const grp = cleanTrailing(cityMatch[3]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Ville: ${capitalize(orig)}`, tags: ['profil', 'localisation'], importance: 4, source: opts?.source });
  }

  // Langues (multi)
  const langMatch = /\b(je parle|je maitrise|ma langue (?:maternelle|native) est)\s+([a-z\-\s,et]+)\b/gi;
  for (const m of matchAll(langMatch, norm)) {
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    const langs = splitList(orig);
    if (langs.length) facts.push({ content: `Langues: ${langs.map(capitalize).join(', ')}`, tags: ['profil', 'langue'], importance: 3, source: opts?.source });
  }

  // Préférences (aime/préfère/déteste) — multi éléments
  const prefsRegex = /\b(jaime|je prefere|je deteste)\s+([^\.\n]{3,120})/gi;
  for (const m of matchAll(prefsRegex, norm)) {
    const verb = m[1].toLowerCase();
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    const list = splitList(orig);
    const sentiment = verb.includes('deteste') ? 'n’aime pas' : verb.includes('prefere') ? 'préfère' : 'aime';
    for (const item of list) {
      facts.push({ content: `Préférence: ${sentiment} ${capitalize(item)}`, tags: ['préférences'], importance: 3, source: opts?.source });
    }
  }

  // Disponibilités/date récurrente simple
  const dayMatch = /\b(tous? les|chaque)\s+(lundis?|mardis?|mercredis?|jeudis?|vendredis?|samedis?|dimanches?)\b/i.exec(norm);
  if (dayMatch) {
    facts.push({ content: `Récurrence: ${capitalize(dayMatch[0])}`, tags: ['agenda'], importance: 3, source: opts?.source });
  }
  const dayTimeMatch = /\b(le|les)\s+(lundis?|mardis?|mercredis?|jeudis?|vendredis?|samedis?|dimanches?)\s+(matin|apres-midi|soir(?:ee)?)\b/gi;
  for (const m of matchAll(dayTimeMatch, norm)) {
    facts.push({ content: `Disponibilité: ${capitalize(m[0])}`, tags: ['agenda'], importance: 3, source: opts?.source });
  }

  // Rappel objectif / projet
  const goalMatch = /\b(mon|ma|mes)\s+(objectif|projet|but|priorite)s?\s+(?:est|sont|:)\s+([^\.\n]{4,120})/i.exec(norm);
  if (goalMatch) {
    const grp = cleanTrailing(goalMatch[3]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Objectif: ${capitalize(orig)}`, tags: ['objectif'], importance: 4, source: opts?.source });
  }
  const learningMatch = /\b(je veux apprendre|j apprends|je me forme a)\s+([^\.\n]{3,120})/gi;
  for (const m of matchAll(learningMatch, norm)) {
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Apprentissage: ${capitalize(orig)}`, tags: ['objectif', 'apprentissage'], importance: 4, source: opts?.source });
  }

  // Anniversaire (non sensible au jour précis si non nécessaire)
  const bday = /\b(mon anniversaire|ma date de naissance)\s+(?:est|c est|:)?\s+([^\.\n]{3,40})/i.exec(norm);
  if (bday) {
    const grp = cleanTrailing(bday[2]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Anniversaire: ${capitalize(orig)}`, tags: ['profil'], importance: 3, source: opts?.source });
  }

  // Email/téléphone — on évite de stocker sans confirmation explicite
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/i.exec(text);
  if (email && (norm.includes('tu peux retenir') || norm.includes('garde en memoire') || norm.includes('sauvegarde mon email'))) {
    facts.push({ content: `Email: ${email[0]}`, tags: ['contact'], importance: 2, source: opts?.source });
  }
  const phone = /\b(?:\+\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?(?:\d[\s.-]?){6,14}\b/i.exec(text);
  if (phone && (norm.includes('tu peux retenir') || norm.includes('garde en memoire') || norm.includes('sauvegarde mon numero'))) {
    facts.push({ content: `Téléphone: ${phone[0]}`, tags: ['contact'], importance: 2, source: opts?.source });
  }

  // Métier / rôle
  const jobRegex = /\b(je (travaille|bosse) (comme|en tant que)\s+([a-z\-\s]{2,})|je suis\s+([a-z\-\s]{2,}))\b/gi;
  for (const m of matchAll(jobRegex, norm)) {
    const roleNorm = (m[4] || m[5] || '').trim();
    if (roleNorm) {
      const orig = recoverOriginal(text, roleNorm) || roleNorm;
      facts.push({ content: `Métier: ${capitalize(cleanTrailing(orig))}`, tags: ['profil', 'métier'], importance: 4, source: opts?.source });
    }
  }
  const companyRegex = /\b(je (travaille|bosse) (chez|pour)\s+([a-z\d&' .-]{2,}))\b/gi;
  for (const m of matchAll(companyRegex, norm)) {
    const grp = cleanTrailing(m[4]);
    const orig = recoverOriginal(text, grp) || grp;
    if (grp) facts.push({ content: `Société: ${capitalize(orig)}`, tags: ['profil', 'travail'], importance: 3, source: opts?.source });
  }

  // Contraintes / santé / régime
  const allergyRegex = /\b(je suis allergique a|allergie a)\s+([^\.\n]{3,80})/gi;
  for (const m of matchAll(allergyRegex, norm)) {
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Allergie: ${capitalize(orig)}`, tags: ['santé', 'contrainte'], importance: 5, source: opts?.source });
  }
  const dietRegex = /\b(je suis|je mange)\s+(vegetarien|vegane|vegan|sans gluten|halal|casher|keto|paleo)\b/gi;
  for (const m of matchAll(dietRegex, norm)) {
    facts.push({ content: `Régime: ${capitalize(m[2])}`, tags: ['santé', 'régime'], importance: 4, source: opts?.source });
  }
  const constraintRegex = /\b(je ne peux pas|je nai pas le droit de|j evite)\s+([^\.\n]{3,100})/gi;
  for (const m of matchAll(constraintRegex, norm)) {
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Contrainte: ${capitalize(orig)}`, tags: ['contrainte'], importance: 4, source: opts?.source });
  }

  // Préférence de communication / outils
  const commRegex = /\b(je prefere|preference de communication)\s+(par|via)\s+([a-z\s\-]{3,20})/gi;
  for (const m of matchAll(commRegex, norm)) {
    const grp = cleanTrailing(m[3]);
    const orig = recoverOriginal(text, grp) || grp;
    facts.push({ content: `Communication: ${capitalize(orig)}`, tags: ['préférences', 'communication'], importance: 3, source: opts?.source });
  }
  const toolsRegex = /\b(j utilise|je travaille avec|mon stack|ma stack)\s+([^\.\n]{3,120})/gi;
  for (const m of matchAll(toolsRegex, norm)) {
    const grp = cleanTrailing(m[2]);
    const orig = recoverOriginal(text, grp) || grp;
    const items = splitList(orig);
    if (items.length) facts.push({ content: `Outils: ${items.map(capitalize).join(', ')}`, tags: ['travail', 'outils'], importance: 3, source: opts?.source });
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


