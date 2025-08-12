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
  };
  // Merge naive: avoid exact duplicates by content
  const exists = list.find((m) => m.content.toLowerCase() === newItem.content.toLowerCase());
  if (exists) {
    exists.updatedAt = now;
    exists.importance = Math.max(exists.importance, newItem.importance);
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
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, limit);
  }
  const scored = memories.map((m) => {
    const score = m.embedding ? cosineSimilarityNormalized(queryEmbedding!, new Float32Array(m.embedding)) : 0;
    const bonus = (m.importance || 1) * 0.02; // small boost for important items
    return { m, score: score + bonus };
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


