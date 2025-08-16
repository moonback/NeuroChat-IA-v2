import { useEffect, useState, useMemo, useCallback } from 'react';
import { Globe, Search, ExternalLink, Clock, TrendingUp, Filter, X, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type WebSource = {
  title: string;
  url: string;
  snippet?: string;
  timestamp?: string; // ISO string de quand la source a été utilisée
  messageId?: string; // ID du message qui a utilisé cette source
  domain?: string; // Domaine extrait de l'URL
  useCount?: number; // Nombre de fois utilisée
  lastUsed?: string; // Dernière utilisation
  favorite?: boolean; // Marqué comme favori
};

type SortOption = 'timestamp' | 'domain' | 'title' | 'useCount' | 'lastUsed';
type FilterOption = 'all' | 'recent' | 'favorites' | 'domains';

const LS_WEB_FAVORITES_KEY = 'web_sources_favorites';
const LS_WEB_STATS_KEY = 'web_sources_stats';

// Utilitaires pour les favoris et statistiques
function getWebFavorites(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_WEB_FAVORITES_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveWebFavorites(favorites: Set<string>): void {
  localStorage.setItem(LS_WEB_FAVORITES_KEY, JSON.stringify([...favorites]));
}

function getWebStats(): Record<string, { useCount: number; lastUsed: string }> {
  try {
    return JSON.parse(localStorage.getItem(LS_WEB_STATS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveWebStats(stats: Record<string, { useCount: number; lastUsed: string }>): void {
  localStorage.setItem(LS_WEB_STATS_KEY, JSON.stringify(stats));
}

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return domain;
  } catch {
    return 'unknown';
  }
}

function getDomainIcon(domain: string): string {
  // Retourne l'emoji ou icône appropriée selon le domaine
  if (domain.includes('wikipedia')) return '📚';
  if (domain.includes('github')) return '💻';
  if (domain.includes('stackoverflow')) return '❓';
  if (domain.includes('youtube')) return '📺';
  if (domain.includes('reddit')) return '💬';
  if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) return '📰';
  if (domain.includes('blog')) return '✍️';
  return '🌐';
}

interface WebSourcesSidebarProps {
  usedSources: WebSource[];
}

export function WebSourcesSidebar({ usedSources }: WebSourcesSidebarProps) {
  const [search, setSearch] = useState('');
  const [previewSource, setPreviewSource] = useState<WebSource | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('timestamp');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  // Charger les favoris au démarrage
  useEffect(() => {
    setFavorites(getWebFavorites());
  }, []);

  // Enrichir les sources avec les métadonnées
  const enrichedSources = useMemo(() => {
    const stats = getWebStats();
    const favs = getWebFavorites();
    
    return usedSources.map(source => ({
      ...source,
      domain: getDomainFromUrl(source.url),
      useCount: stats[source.url]?.useCount || 1,
      lastUsed: stats[source.url]?.lastUsed || source.timestamp,
      favorite: favs.has(source.url),
    }));
  }, [usedSources]);

  // Gestion des favoris
  const toggleFavorite = useCallback((url: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(url)) {
      newFavorites.delete(url);
    } else {
      newFavorites.add(url);
    }
    setFavorites(newFavorites);
    saveWebFavorites(newFavorites);
  }, [favorites]);

  // Gestion de la prévisualisation avec tracking
  const handlePreview = useCallback((source: WebSource) => {
    setPreviewSource(source);
    
    // Tracker l'utilisation
    const stats = getWebStats();
    const now = new Date().toISOString();
    stats[source.url] = {
      useCount: (stats[source.url]?.useCount || 0) + 1,
      lastUsed: now
    };
    saveWebStats(stats);
  }, []);

  // Filtrage et tri optimisés
  const processedSources = useMemo(() => {
    let result = enrichedSources;

    // Filtrage par recherche
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.domain?.toLowerCase().includes(query) ||
        s.snippet?.toLowerCase().includes(query)
      );
    }

    // Filtrage par catégorie
    switch (filterBy) {
      case 'recent':
        result = result.filter(s => s.lastUsed && new Date(s.lastUsed).getTime() > Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'favorites':
        result = result.filter(s => s.favorite);
        break;
      case 'domains':
        // Grouper par domaine et ne montrer que les domaines avec plusieurs sources
        const domainCounts = result.reduce((acc, s) => {
          acc[s.domain || 'unknown'] = (acc[s.domain || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        result = result.filter(s => domainCounts[s.domain || 'unknown'] > 1);
        break;
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          if (!a.timestamp && !b.timestamp) return 0;
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'domain':
          return (a.domain || '').localeCompare(b.domain || '');
        case 'title':
          return a.title.localeCompare(b.title);
        case 'useCount':
          return (b.useCount || 0) - (a.useCount || 0);
        case 'lastUsed':
          if (!a.lastUsed && !b.lastUsed) return 0;
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [enrichedSources, search, filterBy, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedSources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSources = processedSources.slice(startIndex, startIndex + itemsPerPage);

  // Réinitialiser la page lors du changement de filtre/tri
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterBy, sortBy]);

  // Statistiques rapides
  const stats = useMemo(() => {
    const domains = new Set(enrichedSources.map(s => s.domain));
    const recent = enrichedSources.filter(s => 
      s.lastUsed && new Date(s.lastUsed).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    
    return {
      total: enrichedSources.length,
      domains: domains.size,
      recent,
      favorites: enrichedSources.filter(s => s.favorite).length,
    };
  }, [enrichedSources]);

  return (
    <aside
      className="absolute top-0 left-0 bottom-0 w-80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 shadow-xl hidden lg:flex flex-col z-40 transition-transform duration-300"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{ transform: expanded ? 'translateX(0)' : 'translateX(calc(-100% + 0px))' }}
      aria-label="Barre latérale des sources web"
    >
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:from-slate-950/40 dark:to-green-950/30">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-green-500" />
          <div className="text-sm font-semibold">Sources Web</div>
          <span className="ml-auto text-xs text-slate-500">{processedSources.length}/{enrichedSources.length}</span>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
            <div className="text-xs text-slate-500">Domaines</div>
            <div className="text-sm font-semibold text-green-600">{stats.domains}</div>
          </div>
          <div className="text-center p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
            <div className="text-xs text-slate-500">Récents</div>
            <div className="text-sm font-semibold text-blue-600">{stats.recent}</div>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher sources..."
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contrôles de tri et filtrage */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="recent">Récentes (24h)</SelectItem>
                <SelectItem value="favorites">Favoris</SelectItem>
                <SelectItem value="domains">Multi-domaines</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Plus récent</SelectItem>
                <SelectItem value="useCount">Plus utilisé</SelectItem>
                <SelectItem value="domain">Domaine</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="lastUsed">Dernière utilisation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination si nécessaire */}
        {processedSources.length > 5 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Par page:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="h-6 w-12 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <span>Page {currentPage}/{totalPages}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Poignée visible lorsque repliée */}
      {!expanded && (
        <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full select-none">
          <div className="w-[18px] h-24 rounded-r-lg bg-green-500/80 text-white flex items-center justify-center text-[10px] font-semibold [writing-mode:vertical-rl] cursor-pointer">
            Sources
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Sources utilisées dans la conversation */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2 flex items-center gap-2">
            Sources de la conversation
            {paginatedSources.length > 0 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">{paginatedSources.length}</Badge>
            )}
            {totalPages > 1 && (
              <span className="ml-auto font-normal">({startIndex + 1}-{Math.min(startIndex + itemsPerPage, processedSources.length)} sur {processedSources.length})</span>
            )}
          </div>
          
          {paginatedSources.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">
              {processedSources.length === 0 ? 'Aucune source web trouvée.' : 'Aucun résultat sur cette page.'}
            </div>
          ) : (
            paginatedSources.map((source, index) => (
              <div key={`${source.url}-${index}`} className="relative group">
                <button
                  className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/60 dark:border-green-800/60 hover:border-green-300 dark:hover:border-green-600 hover:shadow transition-all"
                  onClick={() => handlePreview(source)}
                  title="Aperçu de la source"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex items-center gap-1">
                      <span className="text-sm">{getDomainIcon(source.domain || '')}</span>
                      {source.favorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{source.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{source.domain}</div>
                      
                      {source.snippet && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {source.snippet.slice(0, 100)}{source.snippet.length > 100 ? '…' : ''}
                        </div>
                      )}
                      
                      {/* Métadonnées */}
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        {source.useCount && source.useCount > 1 && (
                          <span>{source.useCount} util.</span>
                        )}
                        {source.timestamp && (
                          <span>• {new Date(source.timestamp).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] text-green-600 dark:text-green-400">
                        Recherche web
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400 group-hover:text-green-500" />
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-green-500" />
                    </div>
                  </div>
                </button>
                
                {/* Bouton favori */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(source.url);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800"
                  title={source.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star className={`w-3 h-3 ${source.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {previewSource && (
        <Dialog open={!!previewSource} onOpenChange={() => setPreviewSource(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate flex items-center gap-2">
                    <span className="text-lg">{getDomainIcon(previewSource.domain || '')}</span>
                    {previewSource.title}
                    {previewSource.favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
                  </DialogTitle>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                    <Badge variant="outline" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      {previewSource.domain}
                    </Badge>
                    {previewSource.useCount && previewSource.useCount > 1 && (
                      <span className="text-xs">
                        {previewSource.useCount} utilisation{previewSource.useCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {previewSource.timestamp && (
                      <span className="text-xs">
                        Ajouté: {new Date(previewSource.timestamp).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(previewSource.url)}
                    className="flex-shrink-0"
                    title={previewSource.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Star className={`w-4 h-4 ${previewSource.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewSource.url, '_blank')}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ouvrir
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50 mb-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">URL:</div>
                <div className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                  {previewSource.url}
                </div>
              </div>
              
              {previewSource.snippet && (
                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Extrait:</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {previewSource.snippet}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  );
}

export default WebSourcesSidebar;
