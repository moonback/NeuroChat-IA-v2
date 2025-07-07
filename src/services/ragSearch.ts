import documents from '../data/documents.json';

/**
 * Recherche les passages les plus pertinents dans la base documentaire locale.
 * @param {string} query - La question de l'utilisateur
 * @param {number} maxResults - Nombre maximum de passages à retourner
 * @returns {Array<{id: number, titre: string, contenu: string}>}
 */
export function searchDocuments(query: string, maxResults = 3) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  // Recherche naïve : score = nombre de mots du query présents dans le contenu
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