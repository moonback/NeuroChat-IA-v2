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

const STORAGE_KEY = 'neurochat_user_memory_v1';

export function loadMemory(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveMemory(memories: MemoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
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
          embedding: Array.isArray(m.embedding) ? m.embedding.map((x) => Number(x)) : undefined,
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
  for (let i = 0; i < updated.length; i += 1) {
    const m = updated[i];
    if (!m.embedding && !m.disabled) {
      try {
        const vec = await embedText(m.content, true); // normalized Float32Array
        updated[i] = { ...m, embedding: Array.from(vec) };
        changed = true;
      } catch {
        // ignore
      }
      // Yield to event loop
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 0));
    }
  }
  if (changed) saveMemory(updated);
  return updated;
}

export async function getRelevantMemories(query: string, limit = 5): Promise<MemoryItem[]> {
  if (!query || !query.trim()) return [];
  let memories = loadMemory().filter((m) => !m.disabled);
  if (memories.length === 0) return [];
  memories = await ensureEmbeddingsForMemories(memories);
  let queryEmbedding: Float32Array | null = null;
  try {
    queryEmbedding = await embedText(query, true);
  } catch {
    return memories
      .sort((a, b) => computeRankingScore(b) - computeRankingScore(a))
      .slice(0, limit);
  }
  const scored = memories.map((m) => {
    const sim = m.embedding ? cosineSimilarityNormalized(queryEmbedding!, new Float32Array(m.embedding)) : 0;
    const rankBonus = computeRankingScore(m) * 0.05; // small weight for meta scoring
    return { m, score: sim + rankBonus };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.m);
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


