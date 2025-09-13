// Service centralisé pour la génération d'empreintes (embeddings)
// Objectifs:
// - Mutualiser le chargement du modèle (évite plusieurs chargements lourds)
// - Normaliser les vecteurs une seule fois pour accélérer les similarités (cosinus = produit scalaire)
// - Exposer des utilitaires performants (dot product, normalisation)

// import type { pipeline } from '@xenova/transformers';

let embedderPromise: Promise<any> | null = null;

// Cache des embeddings pour éviter les recalculs
const embeddingCache = new Map<string, Float32Array>();
const EMBEDDING_CACHE_SIZE = 1000; // Limite du cache

// Optimisations WASM pour onnxruntime-web via transformers.js
// Sûres à appeler dans le navigateur; ignorées si non supportées
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require('@xenova/transformers');
  // Forcer le chargement distant des modèles (évite les tentatives de /models/Xenova/...)
  env.allowLocalModels = false;
  // Optimisations WASM pour onnxruntime-web via transformers.js
  if (env && env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.simd = true;
    env.backends.onnx.wasm.proxy = true;
    env.backends.onnx.wasm.numThreads = (navigator as Navigator & { hardwareConcurrency?: number })?.hardwareConcurrency || 4;
  }
} catch {
  // Ignore if transformers is not available
}

export async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const mod = await import('@xenova/transformers');
      const pl = (mod as { pipeline: any }).pipeline;
      // Modèle léger multi‑lingue bien supporté
      // pooling + normalize seront passés à l'appel
      return pl('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    })();
  }
  return embedderPromise;
}

export function normalizeVector(vector: ArrayLike<number>): Float32Array {
  let norm = 0;
  const len = vector.length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const v = vector[i] as number;
    norm += v * v;
    out[i] = v;
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < len; i++) out[i] /= norm;
  return out;
}

export function dotProduct(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += (a[i] as number) * (b[i] as number);
  return sum;
}

// Si les vecteurs sont déjà normalisés, la similarité cosinus = produit scalaire
export function cosineSimilarityNormalized(a: ArrayLike<number>, b: ArrayLike<number>): number {
  return dotProduct(a, b);
}

// Renvoie un embedding NORMALISÉ (Float32Array)
export async function embedText(text: string, normalize = true): Promise<Float32Array> {
  // Créer une clé de cache basée sur le texte et les paramètres
  const cacheKey = `${text}:${normalize}`;
  
  // Vérifier le cache d'abord
  if (embeddingCache.has(cacheKey)) {
    const cached = embeddingCache.get(cacheKey)!;
    return new Float32Array(cached); // Retourner une copie
  }
  
  const embedder = await getEmbedder();
  if (!embedder) throw new Error('Embedder not available');
  const output = await embedder(text, { pooling: 'mean', normalize: false });
  // output.data est typiquement un TypedArray
  const arr = new Float32Array((output as any).data);
  const result = normalize ? normalizeVector(arr) : arr;
  
  // Ajouter au cache avec gestion de la taille
  if (embeddingCache.size >= EMBEDDING_CACHE_SIZE) {
    // Supprimer le plus ancien élément (FIFO)
    const firstKey = embeddingCache.keys().next().value as string | undefined;
    if (firstKey !== undefined) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(cacheKey, new Float32Array(result));
  
  return result;
}

// Fonction pour nettoyer le cache si nécessaire
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}


