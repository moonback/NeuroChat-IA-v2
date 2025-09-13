// Charger tous les fichiers .txt et .md du dossier rag_docs (Vite only)
const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });
import { embedText, cosineSimilarityNormalized } from './embeddings';

function wsKey(ws: string, base: string) { return `ws:${ws}:${base}`; }

function getAllDocuments(workspaceId: string) {
  const dossierDocs = Object.entries(modules).map(([path, contenu], idx) => {
    const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
    return {
      id: 'dossier-' + idx,
      titre,
      contenu: contenu as string,
    };
  });
  // Charger les docs utilisateur depuis le localStorage
  let userDocs: Array<{ id: string; titre: string; contenu: string; origine: string }> = [];
  try {
    const raw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
    if (raw) userDocs = JSON.parse(raw);
  } catch {
    // Ignore parsing errors
  }
  return [...dossierDocs, ...userDocs];
}

// (champ 'model' supprimé – plus utilisé)
const documentEmbeddings: { [id: string]: Float32Array } = {};

// Fonction utilitaire pour la similarité cosinus
// Les vecteurs étant normalisés, la similarité cosinus est un dot product

// Initialisation du modèle et des embeddings (asynchrone)
async function ensureEmbeddings(documents: Array<{ id: string; contenu: string }>) {
  const newDocs = documents.filter(doc => !documentEmbeddings[doc.id]);
  for (const doc of newDocs) {
    const emb = await embedText(doc.contenu, true);
    documentEmbeddings[doc.id] = emb;
    await new Promise(res => setTimeout(res, 0));
  }
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
export async function searchDocuments(query: string, maxResults = 3, workspaceId = 'default'): Promise<Array<{ id: string; titre: string; contenu: string; score: number }>> {
  if (!query) return [];
  const documents = getAllDocuments(workspaceId);
  try {
    await ensureEmbeddings(documents);
    // Générer l'embedding de la question (normalisé)
    const queryEmbedding = await embedText(query, true);
    // Calculer la similarité cosinus avec chaque document
    const scored = documents.map((doc) => ({
      ...doc,
      score: documentEmbeddings[doc.id] ? cosineSimilarityNormalized(queryEmbedding, documentEmbeddings[doc.id]) : 0,
    }));
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .filter(doc => doc.score > 0.1); // seuil minimal
  } catch {
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