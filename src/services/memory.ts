import { embedText, cosineSimilarityNormalized } from '@/services/embeddings';

export type MemorySource = 'user' | 'assistant' | 'system';

export interface MemoryItem {
  id: string;
  content: string;
  tags: string[];
  importance: number; // 1..5
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  source: MemorySource;
  originMessageId?: string;
  embedding?: number[]; // normalized vector stored as number[] for JSON
  disabled?: boolean; // if true, never retrieved
  evidenceCount?: number; // number of times observed
  lastSeenAt?: string; // ISO string of most recent occurrence
}

// Gestion des espaces de travail: clés localStorage préfixées par workspace
function getActiveWorkspaceId(): string {
  try {
    return localStorage.getItem('nc_active_workspace') || 'default';
  } catch {
    return 'default';
  }
}

function wsKey(base: string): string {
  const ws = getActiveWorkspaceId();
  return `ws:${ws}:${base}`;
}

const STORAGE_BASE_KEY = 'neurochat_user_memory_v1';
const USE_BACKEND_STORAGE = true;

// Cache en mémoire par workspace pour éviter les accès répétés au localStorage
type MemoryCacheEntry = { data: MemoryItem[]; timestamp: number };
const memoryCacheMap = new Map<string, MemoryCacheEntry>();
const CACHE_DURATION = 30000; // 30 secondes

export function loadMemory(): MemoryItem[] {
  const now = Date.now();
  const key = wsKey(STORAGE_BASE_KEY);
  const cached = memoryCacheMap.get(key);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return [...cached.data];
  }
  // En mode privé, ne jamais charger depuis le backend; rester local-only
  const isPrivate = (() => { try { return localStorage.getItem('mode_prive') === 'true'; } catch { return false; } })();
  if (USE_BACKEND_STORAGE && !isPrivate) {
    // Déclencher un rafraîchissement async sans bloquer l’UI
    void (async () => {
      try {
        const ws = getActiveWorkspaceId();
        const res = await fetch(`/api/memory?workspace=${encodeURIComponent(ws)}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.memories) ? data.memories : [];
          memoryCacheMap.set(key, { data: list, timestamp: Date.now() });
          try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
        }
      } catch {}
    })();
  }
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const entry: MemoryCacheEntry = { data: parsed, timestamp: now };
    memoryCacheMap.set(key, entry);
    return [...parsed];
  } catch {
    const empty: MemoryCacheEntry = { data: [], timestamp: now };
    memoryCacheMap.set(key, empty);
    return [];
  }
}

export function saveMemory(memories: MemoryItem[]): void {
  try {
    const key = wsKey(STORAGE_BASE_KEY);
    // Compression basique : supprimer les propriétés undefined
    const compressed = memories.map(m => {
      const cleaned: any = {};
      for (const [k, value] of Object.entries(m)) {
        if (value !== undefined) cleaned[k] = value;
      }
      return cleaned;
    });
    localStorage.setItem(key, JSON.stringify(compressed));
    // Mettre à jour le cache
    memoryCacheMap.set(key, { data: [...memories], timestamp: Date.now() });
    // Envoi au backend si non privé
    const isPrivate = (() => { try { return localStorage.getItem('mode_prive') === 'true'; } catch { return false; } })();
    if (USE_BACKEND_STORAGE && !isPrivate) {
      void (async () => {
        try {
          const ws = getActiveWorkspaceId();
          await fetch('/api/memory/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspace: ws, memories: compressed }),
          });
        } catch {}
      })();
    }
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde de la mémoire:', error);
  }
}

// Fonction pour invalider le cache manuellement si nécessaire
export function invalidateMemoryCache(): void {
  const key = wsKey(STORAGE_BASE_KEY);
  memoryCacheMap.delete(key);
}

export function addMemory(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): MemoryItem {
  const list = loadMemory();
  const now = new Date().toISOString();
  const id = item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newItem: MemoryItem = {
    id,
    content: item.content.trim(),
    tags: item.tags || [],
    importance: Math.min(5, Math.max(1, item.importance ?? 3)),
    createdAt: now,
    updatedAt: now,
    source: item.source || 'user',
    originMessageId: item.originMessageId,
    embedding: item.embedding,
    disabled: !!item.disabled,
    evidenceCount: 1,
    lastSeenAt: now,
  };
  // Merge naive: avoid exact duplicates by content
  const exists = list.find((m) => m.content.toLowerCase() === newItem.content.toLowerCase());
  if (exists) {
    exists.updatedAt = now;
    exists.importance = Math.max(exists.importance, newItem.importance);
    exists.evidenceCount = (exists.evidenceCount || 1) + 1;
    exists.lastSeenAt = now;
    exists.tags = Array.from(new Set([...(exists.tags || []), ...(newItem.tags || [])]));
    saveMemory(list);
    return exists;
  }
  list.push(newItem);
  saveMemory(list);
  return newItem;
}

export function updateMemory(id: string, updates: Partial<Omit<MemoryItem, 'id' | 'createdAt'>>): MemoryItem | null {
  const list = loadMemory();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  list[idx] = { ...list[idx], ...updates, updatedAt: now };
  saveMemory(list);
  return list[idx];
}

export function deleteMemory(id: string): void {
  const list = loadMemory().filter((m) => m.id !== id);
  saveMemory(list);
}

export function toggleMemoryDisabled(id: string, disabled: boolean): void {
  updateMemory(id, { disabled });
}

export function clearAllMemory(): void {
  saveMemory([]);
}

export function exportMemory(): string {
  return JSON.stringify(loadMemory(), null, 2);
}

export function importMemory(json: string): void {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      // Basic validation
      const cleaned: MemoryItem[] = parsed
        .filter((m) => typeof m.content === 'string')
        .map((m) => ({
          id: m.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          content: String(m.content).trim(),
          tags: Array.isArray(m.tags) ? m.tags.slice(0, 8) : [],
          importance: Math.min(5, Math.max(1, Number(m.importance) || 3)),
          createdAt: m.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: (m.source as MemorySource) || 'user',
          originMessageId: m.originMessageId,
          embedding: Array.isArray(m.embedding) ? m.embedding.map((x: unknown) => Number(x)) : undefined,
          disabled: !!m.disabled,
        }));
      saveMemory(cleaned);
    }
  } catch {
    // ignore
  }
}

async function ensureEmbeddingsForMemories(memories: MemoryItem[]): Promise<MemoryItem[]> {
  // Compute normalized embeddings for items missing one
  const updated: MemoryItem[] = [...memories];
  let changed = false;
  const batchSize = 5; // Traiter par petits lots pour éviter de bloquer l'UI
  
  const itemsNeedingEmbeddings = updated.filter((m) => !m.embedding && !m.disabled).map((m) => {
    const originalIndex = updated.findIndex(item => item.id === m.id);
    return { item: m, index: originalIndex };
  });
  
  for (let i = 0; i < itemsNeedingEmbeddings.length; i += batchSize) {
    const batch = itemsNeedingEmbeddings.slice(i, i + batchSize);
    
    // Traiter le lot en parallèle
    await Promise.allSettled(
      batch.map(async ({ item, index }) => {
        try {
          const vec = await embedText(item.content, true); // normalized Float32Array
          updated[index] = { ...item, embedding: Array.from(vec) };
          changed = true;
        } catch {
          // ignore individual failures
        }
      })
    );
    
    // Yield to event loop after chaque lot
    await new Promise((res) => setTimeout(res, 10));
  }
  
  if (changed) saveMemory(updated);
  return updated;
}

// Cache des recherches récentes
const searchCache = new Map<string, { results: MemoryItem[], timestamp: number }>();
const SEARCH_CACHE_DURATION = 60000; // 1 minute
const SEARCH_CACHE_SIZE = 50;

export async function getRelevantMemories(query: string, limit = 5): Promise<MemoryItem[]> {
  if (!query || !query.trim()) return [];
  
  // Vérifier le cache de recherche
  const cacheKey = `${query.trim().toLowerCase()}:${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < SEARCH_CACHE_DURATION) {
    return [...cached.results];
  }
  
  let memories = loadMemory().filter((m) => !m.disabled);
  if (memories.length === 0) return [];
  
  // Pré-filtrage rapide par mots-clés pour réduire l'ensemble de recherche
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let candidateMemories = memories;
  
  if (queryWords.length > 0 && memories.length > 100) {
    candidateMemories = memories.filter(m => 
      queryWords.some(word => 
        m.content.toLowerCase().includes(word) || 
        m.tags.some(tag => tag.toLowerCase().includes(word))
      )
    );
    
    // Si le pré-filtrage réduit trop, garder les mieux classés
    if (candidateMemories.length < limit * 2) {
      const topRanked = memories
        .sort((a, b) => computeRankingScore(b) - computeRankingScore(a))
        .slice(0, Math.max(limit * 5, 50));
      candidateMemories = Array.from(new Set([...candidateMemories, ...topRanked]));
    }
  }
  
  candidateMemories = await ensureEmbeddingsForMemories(candidateMemories);
  let queryEmbedding: Float32Array | null = null;
  
  try {
    queryEmbedding = await embedText(query, true);
  } catch {
    const fallback = candidateMemories
      .sort((a, b) => computeRankingScore(b) - computeRankingScore(a))
      .slice(0, limit);
    
    // Mettre en cache le résultat
    if (searchCache.size >= SEARCH_CACHE_SIZE) {
      const oldestKey = searchCache.keys().next().value as string | undefined;
      if (oldestKey !== undefined) searchCache.delete(oldestKey);
    }
    searchCache.set(cacheKey, { results: fallback, timestamp: Date.now() });
    
    return fallback;
  }
  
  const scored = candidateMemories.map((m) => {
    const sim = m.embedding ? cosineSimilarityNormalized(queryEmbedding!, new Float32Array(m.embedding)) : 0;
    const rankBonus = computeRankingScore(m) * 0.05; // small weight for meta scoring
    return { m, score: sim + rankBonus };
  });
  
  const results = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.m);
  
  // Mettre en cache le résultat
  if (searchCache.size >= SEARCH_CACHE_SIZE) {
    const oldestKey = searchCache.keys().next().value as string | undefined;
    if (oldestKey !== undefined) searchCache.delete(oldestKey);
  }
  searchCache.set(cacheKey, { results: [...results], timestamp: Date.now() });
  
  return results;
}

// Fonction pour nettoyer le cache de recherche
export function clearSearchCache(): void {
  searchCache.clear();
}

export function upsertMany(facts: Array<{ content: string; tags?: string[]; importance?: number; source?: MemorySource; originMessageId?: string }>): MemoryItem[] {
  const results: MemoryItem[] = [];
  for (const f of facts) {
    const item = addMemory({
      content: f.content,
      tags: f.tags || [],
      importance: f.importance ?? 3,
      source: f.source || 'user',
      originMessageId: f.originMessageId,
    });
    results.push(item);
  }
  return results;
}

export function countActiveMemories(): number {
  return loadMemory().filter((m) => !m.disabled).length;
}

function computeRankingScore(m: MemoryItem): number {
  const importance = m.importance || 1; // 1..5
  const evidence = Math.min(10, Math.max(1, m.evidenceCount || 1)); // cap at 10
  let recencyBoost = 1;
  if (m.lastSeenAt) {
    const ageDays = Math.max(0, (Date.now() - new Date(m.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24));
    // Exponential decay over ~6 months
    recencyBoost = Math.exp(-ageDays / 180);
  }
  return importance + 0.2 * evidence + 1.5 * recencyBoost;
}

export function buildMemorySummary(maxChars = 600): string {
  const items = loadMemory().filter((m) => !m.disabled);
  if (items.length === 0) return '';
  const sorted = items
    .slice()
    .sort((a, b) => computeRankingScore(b) - computeRankingScore(a))
    .slice(0, 20);
  const groups: Record<string, string[]> = {};
  for (const it of sorted) {
    const tag = (it.tags && it.tags[0]) || 'autre';
    if (!groups[tag]) groups[tag] = [];
    groups[tag].push(it.content);
  }
  const order = ['identité', 'localisation', 'métier', 'travail', 'langue', 'préférences', 'objectif', 'agenda', 'santé', 'outils', 'communication', 'style-réponse', 'famille', 'temps', 'autre'];
  let summary = 'Résumé profil:\n';
  for (const k of order) {
    if (!groups[k] || groups[k].length === 0) continue;
    summary += `- ${capitalize(k)}: ${groups[k].slice(0, 3).join('; ')}\n`;
    if (summary.length > maxChars) break;
  }
  if (summary.length > maxChars) summary = summary.slice(0, maxChars - 1) + '…';
  return summary;
}

function capitalize(s: string): string { return s.length ? s[0].toUpperCase() + s.slice(1) : s; }


