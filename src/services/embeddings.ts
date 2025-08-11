// Service centralisé pour la génération d'empreintes (embeddings)
// Objectifs:
// - Mutualiser le chargement du modèle (évite plusieurs chargements lourds)
// - Normaliser les vecteurs une seule fois pour accélérer les similarités (cosinus = produit scalaire)
// - Exposer des utilitaires performants (dot product, normalisation)

import type { pipeline as PipelineType } from '@xenova/transformers';

let embedderPromise: Promise<any> | null = null;

// Optimisations WASM pour onnxruntime-web via transformers.js
// Sûres à appeler dans le navigateur; ignorées si non supportées
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { env } = require('@xenova/transformers');
  if (env && env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.simd = true;
    env.backends.onnx.wasm.proxy = true;
    env.backends.onnx.wasm.numThreads = (navigator as any)?.hardwareConcurrency || 4;
  }
} catch {}

export async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const mod = await import('@xenova/transformers');
      const pl = (mod as any).pipeline as typeof PipelineType;
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
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: false });
  // output.data est typiquement un TypedArray
  const arr = new Float32Array(output.data);
  return normalize ? normalizeVector(arr) : arr;
}


