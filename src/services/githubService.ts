/**
 * 🔗 Service d'intégration GitHub pour Gemini
 * 
 * Ce service permet d'intégrer des fichiers GitHub dans le contexte de Gemini
 * pour l'analyse de code et la génération de réponses contextuelles.
 */

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  size?: number;
  url: string;
  download_url?: string;
  language?: string;
  encoding?: string;
}

export interface GitHubRepository {
  owner: string;
  repo: string;
  branch: string;
  path?: string;
}

export interface GitHubFileContext {
  file: GitHubFile;
  repository: GitHubRepository;
  timestamp: Date;
  contextId: string;
}

/**
 * Parse une URL GitHub et extrait les informations du repository
 */
export function parseGitHubUrl(url: string): GitHubRepository | null {
  const patterns = [
    // https://github.com/owner/repo
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
    // https://github.com/owner/repo/blob/branch/path
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/,
    // https://github.com/owner/repo/tree/branch/path
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        branch: match[3] || 'main',
        path: match[4] || ''
      };
    }
  }
  return null;
}

/**
 * Récupère la liste des fichiers d'un repository GitHub
 */
export async function fetchGitHubRepositoryContents(
  repository: GitHubRepository
): Promise<GitHubFile[]> {
  const apiUrl = `https://api.github.com/repos/${repository.owner}/${repository.repo}/contents/${repository.path || ''}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Erreur GitHub API ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return Array.isArray(data) ? data.map((item: any) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      url: item.html_url,
      download_url: item.download_url,
      language: item.language,
      encoding: item.encoding
    })) : [{
      name: data.name,
      path: data.path,
      type: data.type,
      size: data.size,
      url: data.html_url,
      download_url: data.download_url,
      language: data.language,
      encoding: data.encoding
    }];
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers GitHub:', error);
    throw error;
  }
}

/**
 * Récupère le contenu d'un fichier GitHub spécifique
 */
export async function fetchGitHubFileContent(file: GitHubFile): Promise<string> {
  if (!file.download_url) {
    throw new Error('URL de téléchargement non disponible pour ce fichier');
  }

  try {
    const response = await fetch(file.download_url);
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier GitHub:', error);
    throw error;
  }
}

/**
 * Génère un contexte formaté pour Gemini à partir d'un fichier GitHub
 */
export function generateGitHubContextForGemini(fileContext: GitHubFileContext): string {
  const { file, repository } = fileContext;
  
  if (!file.content) {
    return `📁 Fichier GitHub: ${file.path}\nRepository: ${repository.owner}/${repository.repo} (${repository.branch})\nURL: ${file.url}`;
  }

  // Limiter la taille du contenu pour éviter de dépasser les limites de Gemini
  const maxContentLength = 50000; // 50KB max
  const truncatedContent = file.content.length > maxContentLength 
    ? file.content.substring(0, maxContentLength) + '\n\n... (contenu tronqué)'
    : file.content;

  return `📁 **Fichier GitHub analysé:**
- **Repository:** ${repository.owner}/${repository.repo}
- **Branche:** ${repository.branch}
- **Chemin:** ${file.path}
- **Taille:** ${file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}
- **Langage:** ${file.language || 'Non détecté'}
- **URL:** ${file.url}

\`\`\`${file.language || 'text'}
${truncatedContent}
\`\`\`

---
*Contexte GitHub ajouté le ${fileContext.timestamp.toLocaleString('fr-FR')}*`;
}

/**
 * Valide qu'un fichier est approprié pour l'analyse
 */
export function isFileSuitableForAnalysis(file: GitHubFile): boolean {
  // Exclure les fichiers binaires et les fichiers trop volumineux
  const binaryExtensions = ['.exe', '.dll', '.so', '.dylib', '.bin', '.img', '.iso'];
  const maxSize = 1024 * 1024; // 1MB max

  if (file.size && file.size > maxSize) {
    return false;
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  return !binaryExtensions.includes(extension);
}

/**
 * Obtient des informations sur un repository GitHub
 */
export async function fetchGitHubRepositoryInfo(repository: GitHubRepository): Promise<{
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated_at: string;
} | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository.owner}/${repository.repo}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      name: data.name,
      description: data.description || 'Aucune description',
      language: data.language || 'Non spécifié',
      stars: data.stargazers_count,
      forks: data.forks_count,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des infos du repository:', error);
    return null;
  }
}

/**
 * Recherche des fichiers dans un repository GitHub
 */
export async function searchGitHubFiles(
  repository: GitHubRepository,
  query: string
): Promise<GitHubFile[]> {
  try {
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(query)}+repo:${repository.owner}/${repository.repo}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur de recherche GitHub ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items?.map((item: any) => ({
      name: item.name,
      path: item.path,
      type: 'file' as const,
      url: item.html_url,
      download_url: item.download_url
    })) || [];
  } catch (error) {
    console.error('Erreur lors de la recherche GitHub:', error);
    throw error;
  }
}

/**
 * Génère un résumé d'un repository GitHub pour Gemini
 */
export async function generateRepositorySummary(repository: GitHubRepository): Promise<string> {
  const repoInfo = await fetchGitHubRepositoryInfo(repository);
  
  if (!repoInfo) {
    return `Repository GitHub: ${repository.owner}/${repository.repo}`;
  }

  return `📊 **Résumé du Repository GitHub:**
- **Nom:** ${repoInfo.name}
- **Description:** ${repoInfo.description}
- **Langage principal:** ${repoInfo.language}
- **⭐ Étoiles:** ${repoInfo.stars}
- **🍴 Forks:** ${repoInfo.forks}
- **🕒 Dernière mise à jour:** ${new Date(repoInfo.updated_at).toLocaleDateString('fr-FR')}
- **URL:** https://github.com/${repository.owner}/${repository.repo}`;
}
