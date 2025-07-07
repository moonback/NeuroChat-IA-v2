// Charger tous les fichiers .txt et .md du dossier rag_docs (Vite only)
const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });

const documents = Object.entries(modules).map(([path, contenu], idx) => {
  // Extraire le nom du fichier pour le titre
  const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
  return {
    id: idx + 1,
    titre,
    contenu: contenu as string,
  };
});

let model: any = null;
let documentEmbeddings: number[][] = [];
let embeddingsReady = false;

// Fonction utilitaire pour la similarité cosinus
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

// Initialisation du modèle et des embeddings (asynchrone)
async function loadModelAndEmbeddings() {
  if (model && embeddingsReady) return;
  const { pipeline } = await import('@xenova/transformers');
  model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  // Générer les embeddings pour chaque document (sur le champ 'contenu')
  documentEmbeddings = await Promise.all(
    documents.map(async (doc) => {
      const output = await model(doc.contenu, { pooling: 'mean', normalize: true });
      // output.data est typé any[] mais c'est bien un number[]
      return Array.from(output.data) as number[];
    })
  );
  embeddingsReady = true;
}

/**
 * Recherche les passages les plus pertinents dans la base documentaire locale (par similarité d'embeddings).
 * @param {string} query - La question de l'utilisateur
 * @param {number} maxResults - Nombre maximum de passages à retourner
 * @returns {Promise<Array<{id: number, titre: string, contenu: string}>>}
 */
export async function searchDocuments(query: string, maxResults = 3): Promise<any[]> {
  if (!query) return [];
  try {
    await loadModelAndEmbeddings();
    // Générer l'embedding de la question
    const output = await model(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data) as number[];
    // Calculer la similarité cosinus avec chaque document
    const scored = documents.map((doc, idx) => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, documentEmbeddings[idx]),
    }));
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .filter(doc => doc.score > 0.1); // seuil minimal
  } catch (e) {
    // Fallback : recherche naïve par mots-clés
    const lowerQuery = query.toLowerCase();
    return documents
      .map(doc => {
        const score = lowerQuery.split(/\s+/).reduce((acc, word) =>
          doc.contenu.toLowerCase().includes(word) ? acc + 1 : acc, 0);
        return { ...doc, score };
      })
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }
} 