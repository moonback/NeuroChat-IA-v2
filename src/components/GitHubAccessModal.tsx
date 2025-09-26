import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  ExternalLink, 
  FileText, 
  Folder, 
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  size?: number;
  url: string;
  download_url?: string;
}

interface GitHubApiItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  html_url: string;
  download_url?: string;
}

interface GitHubAccessModalProps {
  onFileSelect: (file: GitHubFile) => void;
  modePrive?: boolean;
  modeEnfant?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GitHubAccessModal({ onFileSelect, modePrive = false, modeEnfant = false, open, onOpenChange }: GitHubAccessModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string; branch: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Utiliser les props open/onOpenChange si fournies, sinon utiliser l'état local
  const modalOpen = open !== undefined ? open : isOpen;
  const setModalOpen = onOpenChange || setIsOpen;

  // Fonction pour parser l'URL GitHub (corrigée pour éviter les échappements inutiles)
  const parseGitHubUrl = useCallback((url: string) => {
    const patterns = [
      // https://github.com/owner/repo
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/,
      // https://github.com/owner/repo/blob/branch/path
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/,
      // https://github.com/owner/repo/tree/branch/path
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/,
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
  }, []);

  // Fonction pour récupérer les fichiers depuis l'API GitHub
  const fetchGitHubFiles = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        throw new Error('URL GitHub invalide');
      }

      setRepoInfo({
        owner: parsed.owner,
        repo: parsed.repo,
        branch: parsed.branch
      });

      // Construire l'URL de l'API GitHub
      const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.path}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Traiter les fichiers
      const filesData: GitHubFile[] = Array.isArray(data) ? data.map((item: GitHubApiItem) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        url: item.html_url,
        download_url: item.download_url
      })) : [{
        name: data.name,
        path: data.path,
        type: data.type,
        size: data.size,
        url: data.html_url,
        download_url: data.download_url
      }];

      setFiles(filesData);
      setCurrentPath(parsed.path);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error(`Erreur GitHub: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [parseGitHubUrl]);

  // Fonction pour récupérer le contenu d'un fichier
  const fetchFileContent = useCallback(async (file: GitHubFile) => {
    if (!file.download_url) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(file.download_url);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      const fileWithContent = { ...file, content };
      
      onFileSelect(fileWithContent);
      toast.success(`Fichier "${file.name}" ajouté au contexte`);
      setIsOpen(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Erreur lors du chargement: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [onFileSelect]);

  // Fonction pour naviguer dans les dossiers
  const navigateToPath = useCallback(async (path: string) => {
    if (!repoInfo) return;
    
    const newUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/tree/${repoInfo.branch}/${path}`;
    await fetchGitHubFiles(newUrl);
  }, [repoInfo, fetchGitHubFiles]);

  // Fonction pour copier l'URL
  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papiers');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    await fetchGitHubFiles(githubUrl);
  }, [githubUrl, fetchGitHubFiles]);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-9 h-9 p-0 transition-all duration-300 hover:scale-105",
            modePrive 
              ? "hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
              : modeEnfant
              ? "hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600"
              : "hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
          )}
          title="Accès aux fichiers GitHub"
        >
          <Github className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className={cn(
          "max-w-7xl max-h-[90vh] overflow-hidden",
          modePrive 
            ? "bg-gradient-to-br from-red-50/95 via-purple-50/95 to-blue-50/95 dark:from-red-950/90 dark:via-purple-950/90 dark:to-blue-950/90 border-red-200/50 dark:border-red-800/50"
            : modeEnfant
            ? "bg-gradient-to-br from-pink-50/95 via-yellow-50/95 to-orange-50/95 dark:from-pink-950/90 dark:via-yellow-950/90 dark:to-orange-950/90 border-pink-200/50 dark:border-pink-800/50"
            : "bg-white/95 dark:bg-slate-900/95 border-white/60 dark:border-slate-800/60"
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg",
              modePrive 
                ? "bg-gradient-to-r from-red-500 to-purple-500"
                : modeEnfant
                ? "bg-gradient-to-r from-pink-500 to-orange-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            )}>
              <Github className="w-5 h-5 text-white" />
            </div>
            Accès aux fichiers GitHub
            {modePrive && <Badge variant="destructive" className="ml-2">🔒 Privé</Badge>}
            {modeEnfant && <Badge variant="secondary" className="ml-2">👶 Enfant</Badge>}
          </DialogTitle>
          <DialogDescription>
            Saisissez une URL GitHub pour explorer et sélectionner des fichiers à analyser avec Gemini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulaire de saisie */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5" />
                URL du repository GitHub
              </CardTitle>
              <CardDescription>
                Exemples: https://github.com/owner/repo ou https://github.com/owner/repo/tree/branch/path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github-url">URL GitHub</Label>
                  <div className="flex gap-2">
                    <Input
                      id="github-url"
                      type="url"
                      placeholder="https://github.com/owner/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={!githubUrl.trim() || isLoading}
                      className={cn(
                        "px-6",
                        modePrive 
                          ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                          : modeEnfant
                          ? "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                          : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informations du repository */}
          {repoInfo && (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                        {repoInfo.owner}/{repoInfo.repo}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Branche: {repoInfo.branch}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://github.com/${repoInfo.owner}/${repoInfo.repo}`, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Affichage des erreurs */}
          {error && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Erreur:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des fichiers */}
          {files.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Contenu du dossier
                  {currentPath && (
                    <Badge variant="outline" className="ml-2">
                      {currentPath}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                        file.type === 'dir' 
                          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                          : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {file.type === 'dir' ? (
                          <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </p>
                          {file.size && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {file.type === 'dir' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateToPath(file.path)}
                            className="gap-2"
                          >
                            <Folder className="w-4 h-4" />
                            Ouvrir
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyUrl(file.url)}
                              className="gap-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchFileContent(file)}
                              disabled={isLoading}
                              className={cn(
                                "gap-2",
                                modePrive 
                                  ? "hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                                  : modeEnfant
                                  ? "hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600"
                                  : "hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600"
                              )}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              Analyser
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-900/80">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                    Comment utiliser cette fonctionnalité
                  </h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Saisissez l'URL complète du repository GitHub</li>
                    <li>• Naviguez dans les dossiers en cliquant sur les icônes de dossier</li>
                    <li>• Cliquez sur "Analyser" pour ajouter un fichier au contexte de Gemini</li>
                    <li>• Le contenu du fichier sera disponible pour l'analyse IA</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
