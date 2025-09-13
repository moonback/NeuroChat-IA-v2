import { useState } from 'react';
import { Globe, X, ExternalLink, Star, Clock, BarChart3, Search } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WebSource } from './WebSourcesSidebar';

interface WebSourcesDrawerProps {
  open: boolean;
  onClose: () => void;
  usedSources: WebSource[];
}

// Fonctions utilitaires (copiées de WebSourcesSidebar)
function getDomainIcon(domain: string): string {
  if (domain.includes('wikipedia')) return '📚';
  if (domain.includes('github')) return '💻';
  if (domain.includes('stackoverflow')) return '❓';
  if (domain.includes('youtube')) return '📺';
  if (domain.includes('reddit')) return '💬';
  if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) return '📰';
  if (domain.includes('blog')) return '✍️';
  if (domain.includes('academic') || domain.includes('edu')) return '🎓';
  if (domain.includes('research') || domain.includes('pubmed')) return '🔬';
  if (domain.includes('social') || domain.includes('facebook') || domain.includes('twitter')) return '👥';
  return '🌐';
}

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return domain;
  } catch {
    return 'unknown';
  }
}

export function WebSourcesDrawer({ open, onClose, usedSources }: WebSourcesDrawerProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'domain' | 'title'>('timestamp');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'favorites'>('all');

  // Enrichir les sources avec les métadonnées
  const enrichedSources = usedSources.map(source => ({
    ...source,
    domain: getDomainFromUrl(source.url),
  }));

  // Filtrage et tri
  const processedSources = enrichedSources
    .filter(source => {
      if (search.trim()) {
        const query = search.toLowerCase();
        return source.title.toLowerCase().includes(query) ||
               source.domain?.toLowerCase().includes(query) ||
               source.snippet?.toLowerCase().includes(query);
      }
      return true;
    })
    .filter(source => {
      switch (filterBy) {
        case 'recent':
          return source.timestamp && new Date(source.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000;
        case 'favorites':
          return source.favorite;
        default:
          return true;
      }
    })
    .sort((a, b) => {
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
        default:
          return 0;
      }
    });

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DrawerTitle className="text-lg">Sources Web</DrawerTitle>
                <p className="text-sm text-slate-500">{processedSources.length} sources trouvées</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contrôles de recherche et filtrage */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher sources..."
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="recent">Récentes</SelectItem>
                  <SelectItem value="favorites">Favoris</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">Plus récent</SelectItem>
                  <SelectItem value="domain">Domaine</SelectItem>
                  <SelectItem value="title">Titre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {processedSources.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <Globe className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-sm font-medium">Aucune source web trouvée</p>
                <p className="text-xs text-slate-400 mt-1">
                  {usedSources.length === 0 
                    ? 'Les sources apparaîtront ici lors des recherches web'
                    : 'Aucun résultat pour ces filtres'
                  }
                </p>
              </div>
            ) : (
              processedSources.map((source, index) => (
                <div key={`${source.url}-${index}`} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-md transition-all">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg">{getDomainIcon(source.domain || '')}</span>
                        {source.favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                            {source.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(source.url, '_blank')}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{source.domain}</span>
                          {source.timestamp && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(source.timestamp).toLocaleDateString('fr-FR', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {source.snippet && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                            {source.snippet}
                          </p>
                        )}
                        
                        {/* Métadonnées */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            {source.useCount && source.useCount > 1 && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {source.useCount} utilisations
                              </span>
                            )}
                            {source.quality && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < source.quality! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default WebSourcesDrawer;
