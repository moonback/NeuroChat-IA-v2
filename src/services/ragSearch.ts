// Charger tous les fichiers .txt et .md du dossier rag_docs (Vite only)
const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });

function getAllDocuments() {
  const dossierDocs = Object.entries(modules).map(([path, contenu], idx) => {
    const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
    return {
      id: 'dossier-' + idx,
      titre,
      contenu: contenu as string,
    };
  });
  // Charger les docs utilisateur depuis le localStorage
  let userDocs: any[] = [];
  try {
    const raw = localStorage.getItem('rag_user_docs');
    if (raw) userDocs = JSON.parse(raw);
  } catch {}
  return [...dossierDocs, ...userDocs];
}

let model: any = null;
let documentEmbeddings: { [id: string]: number[] } = {};

// Fonction utilitaire pour la similarité cosinus
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

// Initialisation du modèle et des embeddings (asynchrone)
async function loadModelAndEmbeddings(documents: any[]) {
  if (!model) {
    const { pipeline } = await import('@xenova/transformers');
    model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  // Si la liste des documents a changé, on recalcule les embeddings
  const newDocs = documents.filter(doc => !documentEmbeddings[doc.id]);
  for (const doc of newDocs) {
    const output = await model(doc.contenu, { pooling: 'mean', normalize: true });
    documentEmbeddings[doc.id] = Array.from(output.data) as number[];
  }
  // Nettoyer les embeddings obsolètes
  const docIds = documents.map(doc => doc.id);
  Object.keys(documentEmbeddings).forEach(id => {
    if (!docIds.includes(id)) delete documentEmbeddings[id];
  });
}

/**
 * Recherche les passages les plus pertinents dans la base documentaire locale (par similarité d'embeddings).
 * @param {string} query - La question de l'utilisateur
 * @param {number} maxResults - Nombre maximum de passages à retourner
 * @returns {Promise<Array<{id: number, titre: string, contenu: string}>>}
 */
export async function searchDocuments(query: string, maxResults = 3): Promise<any[]> {
  if (!query) return [];
  const documents = getAllDocuments();
  try {
    await loadModelAndEmbeddings(documents);
    // Générer l'embedding de la question
    const output = await model(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data) as number[];
    // Calculer la similarité cosinus avec chaque document
    const scored = documents.map((doc) => ({
      ...doc,
      score: documentEmbeddings[doc.id] ? cosineSimilarity(queryEmbedding, documentEmbeddings[doc.id]) : 0,
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