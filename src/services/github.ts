// Service d'intégration GitHub côté front (sans backend)
// ATTENTION: le token est stocké en localStorage, visible côté client.
// Utiliser un token restreint en lecture seule si possible.

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string; // défaut: branche par défaut du repo
  includeExtensions?: string[]; // extensions sans le point, ex: ['md','ts']
  includePaths?: string[]; // préfixes de chemins à inclure (optionnel)
  excludePaths?: string[]; // préfixes à exclure (node_modules, dist, etc.)
  maxFileSizeKB?: number; // taille max par fichier (kB)
}

export const GITHUB_CONFIG_LS_KEY = 'github_config';

export const defaultGitHubConfig: GitHubConfig = {
  token: '',
  owner: '',
  repo: '',
  branch: '',
  includeExtensions: [
    'md', 'txt', 'json', 'yml', 'yaml', 'toml', 'ini', 'csv', 'html',
    'js', 'jsx', 'ts', 'tsx', 'cjs', 'mjs',
    'py', 'rb', 'php', 'go', 'rs', 'java', 'kt', 'scala', 'swift',
    'c', 'h', 'cpp', 'hpp', 'cs', 'sh', 'bash'
  ],
  includePaths: [],
  excludePaths: [
    'node_modules/', 'dist/', 'build/', 'coverage/', 'out/', '.next/', '.nuxt/',
    '.git/', '.github/', '.vscode/', '.idea/', 'android/', 'ios/',
  ],
  maxFileSizeKB: 256,
};

export function getGitHubConfig(): GitHubConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_LS_KEY);
    if (!raw) return { ...defaultGitHubConfig };
    const parsed = JSON.parse(raw);
    return { ...defaultGitHubConfig, ...parsed } as GitHubConfig;
  } catch {
    return { ...defaultGitHubConfig };
  }
}

export function saveGitHubConfig(cfg: GitHubConfig): void {
  localStorage.setItem(GITHUB_CONFIG_LS_KEY, JSON.stringify(cfg));
}

function authHeaders(token: string): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
  };
  if (token && token.trim().length > 0) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

async function fetchJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status} ${res.statusText} – ${text}`);
  }
  return res.json();
}

export async function validateGitHubConfig(cfg: GitHubConfig): Promise<void> {
  if (!cfg.owner || !cfg.repo) throw new Error('Owner et repo sont requis.');
  const repoUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`;
  const repo = await fetchJson(repoUrl, cfg.token);
  const defaultBranch = repo?.default_branch as string | undefined;
  if (!cfg.branch && defaultBranch) cfg.branch = defaultBranch;
  // Vérifier accès à la branche
  const branch = cfg.branch || defaultBranch || 'main';
  const branchUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/branches/${encodeURIComponent(branch)}`;
  await fetchJson(branchUrl, cfg.token);
}

interface TreeEntry {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

function matchesFilters(path: string, size: number | undefined, cfg: GitHubConfig): boolean {
  const maxBytes = (cfg.maxFileSizeKB ?? defaultGitHubConfig.maxFileSizeKB!) * 1024;
  if (typeof size === 'number' && size > maxBytes) return false;

  const normalized = path.replace(/\\/g, '/');
  const ext = normalized.split('.').pop()?.toLowerCase() || '';

  const includeExt = (cfg.includeExtensions && cfg.includeExtensions.length > 0) ? cfg.includeExtensions : defaultGitHubConfig.includeExtensions;
  if (!includeExt!.includes(ext)) return false;

  const excluded = (cfg.excludePaths || defaultGitHubConfig.excludePaths)!.some(prefix => normalized.startsWith(prefix));
  if (excluded) return false;

  if (cfg.includePaths && cfg.includePaths.length > 0) {
    return cfg.includePaths.some(prefix => normalized.startsWith(prefix));
  }
  return true;
}

export async function listRepoTextFiles(cfg: GitHubConfig): Promise<Array<{ path: string; size: number }>> {
  if (!cfg.owner || !cfg.repo) throw new Error('Owner et repo sont requis.');
  // Récupérer la branche (et le tree sha)
  const branchName = cfg.branch && cfg.branch.trim().length > 0 ? cfg.branch.trim() : undefined;
  const branchInfo = await fetchJson(
    `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/branches/${encodeURIComponent(branchName || 'main')}`,
    cfg.token
  );
  const treeSha = branchInfo?.commit?.commit?.tree?.sha || branchInfo?.commit?.sha;
  if (!treeSha) throw new Error('Impossible de déterminer le tree SHA de la branche.');

  const treeResp = await fetchJson(
    `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/git/trees/${encodeURIComponent(treeSha)}?recursive=1`,
    cfg.token
  );
  const entries: TreeEntry[] = Array.isArray(treeResp?.tree) ? treeResp.tree : [];
  const files = entries.filter(e => e.type === 'blob').map(e => ({ path: e.path, size: e.size ?? 0 }));
  return files.filter(f => matchesFilters(f.path, f.size, cfg));
}

export async function fetchFileContent(cfg: GitHubConfig, path: string): Promise<string> {
  // Utilise l'API contents avec accept raw pour gérer les dépôts privés
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(cfg.branch || 'main')}`;
  const res = await fetch(url, {
    headers: {
      ...authHeaders(cfg.token),
      'Accept': 'application/vnd.github.raw',
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Échec lecture ${path}: ${res.status} ${res.statusText} – ${text}`);
  }
  return res.text();
}

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export async function importRepoAsRagDocs(cfg: GitHubConfig): Promise<number> {
  await validateGitHubConfig(cfg);
  // Lister fichiers
  const files = await listRepoTextFiles(cfg);
  let count = 0;
  // Charger existants
  let userDocs: any[] = [];
  try {
    const raw = localStorage.getItem('rag_user_docs');
    if (raw) userDocs = JSON.parse(raw);
  } catch {}

  // Index par id pour remplacements
  const byId = new Map<string, any>();
  for (const d of userDocs) byId.set(d.id, d);

  for (const f of files) {
    try {
      const content = await fetchFileContent(cfg, f.path);
      if (!content || content.trim().length === 0) continue;
      const id = `github-${cfg.owner}/${cfg.repo}-${f.path}`;
      const doc = {
        id,
        titre: f.path,
        contenu: content,
        origine: 'github',
        extension: getExtension(f.path),
      };
      byId.set(id, doc);
      count++;
      // Micro yield pour laisser respirer l'UI
      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, 0));
    } catch {
      // Ignore les fichiers illisibles
    }
  }

  const merged = Array.from(byId.values());
  localStorage.setItem('rag_user_docs', JSON.stringify(merged));
  // Sauvegarder config pour réutilisation
  saveGitHubConfig(cfg);
  return count;
}

export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Formats supportés: "owner/repo" ou URL github
  const ownerRepoMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (ownerRepoMatch) return { owner: ownerRepoMatch[1], repo: ownerRepoMatch[2] };
  try {
    const url = new URL(trimmed);
    if (url.hostname.endsWith('github.com')) {
      const parts = url.pathname.replace(/^\//, '').split('/');
      if (parts.length >= 2) return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    }
  } catch {}
  return null;
}


