import { useEffect, useState, useMemo, useCallback } from 'react';
import { FileText, FileSpreadsheet, FileCode2, FileType2, File, Search, Upload, Folder, User, Eye, ArrowUpDown, Filter, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type RagDoc = {
  id: string;
  titre: string;
  contenu: string;
  origine: 'dossier' | 'utilisateur';
  extension?: string;
  size?: number; // Taille en caractères
  lastUsed?: string; // ISO string
  useCount?: number; // Nombre d'utilisations
  tags?: string[]; // Tags personnalisés
  favorite?: boolean; // Marqué comme favori
};

type SortOption = 'titre' | 'size' | 'lastUsed' | 'useCount' | 'origine';
type FilterOption = 'all' | 'dossier' | 'utilisateur' | 'favorites' | 'recent';

const LS_KEY = 'rag_user_docs';
const LS_STATS_KEY = 'rag_doc_stats';
const LS_FAVORITES_KEY = 'rag_doc_favorites';

function getExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function getIcon(ext: string) {
  switch (ext) {
    case 'txt':
    case 'md':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'pdf':
      return <FileType2 className="w-4 h-4 text-red-500" />;
    case 'docx':
      return <FileType2 className="w-4 h-4 text-indigo-500" />;
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    case 'html':
      return <FileCode2 className="w-4 h-4 text-orange-500" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
}

function getOriginBadge(origine: string) {
  const base = 'px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1';
  if (origine === 'dossier') {
    return (
      <span className={`${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800`}>
        <Folder className="w-3 h-3" /> dossier
      </span>
    );
  }
  if (origine === 'utilisateur') {
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800`}>
        <User className="w-3 h-3" /> utilisateur
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800`}>
      {origine}
    </span>
  );
}

// Cache des documents pour éviter les rechargements fréquents
let docsCache: RagDoc[] | null = null;
let docsCacheTimestamp = 0;
const DOCS_CACHE_DURATION = 60000; // 1 minute

// Utilitaires pour les statistiques et favoris
function getDocStats(): Record<string, { useCount: number; lastUsed: string }> {
  try {
    return JSON.parse(localStorage.getItem(LS_STATS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveDocStats(stats: Record<string, { useCount: number; lastUsed: string }>): void {
  localStorage.setItem(LS_STATS_KEY, JSON.stringify(stats));
}

function getFavorites(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_FAVORITES_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveFavorites(favorites: Set<string>): void {
  localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify([...favorites]));
}

function trackDocUsage(docId: string): void {
  const stats = getDocStats();
  const now = new Date().toISOString();
  stats[docId] = {
    useCount: (stats[docId]?.useCount || 0) + 1,
    lastUsed: now
  };
  saveDocStats(stats);
}

export function RagSidebar({ onOpenRagDocs, usedDocs }: { onOpenRagDocs?: () => void; usedDocs?: Array<{ id: string; titre: string; contenu: string; extension?: string; origine?: string }> }) {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RagDoc | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Nouveaux états pour les fonctionnalités avancées
  const [sortBy, setSortBy] = useState<SortOption>('titre');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Charger les favoris au démarrage
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Fonction de chargement optimisée avec cache
  const loadDocs = useCallback(async () => {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent
    if (docsCache && (now - docsCacheTimestamp) < DOCS_CACHE_DURATION) {
      setDocs(docsCache);
      return;
    }

    try {
      // @ts-ignore
      const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });
      const stats = getDocStats();
      const favs = getFavorites();
      
      const dossierDocs: RagDoc[] = Object.entries(modules).map(([path, contenu], idx) => {
        const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
        const extension = getExtension(path);
        const id = 'dossier-' + idx;
        const content = contenu as string;
        
        return {
          id,
          titre,
          contenu: content,
          origine: 'dossier',
          extension,
          size: content.length,
          lastUsed: stats[id]?.lastUsed,
          useCount: stats[id]?.useCount || 0,
          favorite: favs.has(id),
        };
      });
      
      const userRaw = localStorage.getItem(LS_KEY);
      let userDocs: RagDoc[] = [];
      if (userRaw) {
        try { 
          const rawDocs = JSON.parse(userRaw) as any[];
          userDocs = rawDocs
            .filter(d => d?.origine !== 'github')
            .map(d => ({
              ...d,
              size: d.contenu?.length || 0,
              lastUsed: stats[d.id]?.lastUsed,
              useCount: stats[d.id]?.useCount || 0,
              favorite: favs.has(d.id),
            }));
        } catch {}
      }
      
      const allDocs = [...dossierDocs, ...userDocs];
      docsCache = allDocs;
      docsCacheTimestamp = now;
      setDocs(allDocs);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  // Gestion des favoris
  const toggleFavorite = useCallback((docId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(docId)) {
      newFavorites.delete(docId);
    } else {
      newFavorites.add(docId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
    
    // Mettre à jour le cache des docs
    if (docsCache) {
      docsCache = docsCache.map(doc => 
        doc.id === docId ? { ...doc, favorite: newFavorites.has(docId) } : doc
      );
      setDocs([...docsCache]);
    }
  }, [favorites]);

  // Gestion de la prévisualisation avec tracking
  const handlePreview = useCallback((doc: RagDoc) => {
    setPreviewDoc(doc);
    trackDocUsage(doc.id);
    // Invalider le cache pour recharger les stats
    docsCache = null;
    setTimeout(loadDocs, 100);
  }, [loadDocs]);

  // Filtrage et tri optimisés avec useMemo
  const processedDocs = useMemo(() => {
    let result = docs;

    // Filtrage par recherche
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(d =>
        d.titre.toLowerCase().includes(query) ||
        d.contenu.toLowerCase().includes(query) ||
        (d.tags && d.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Filtrage par catégorie
    switch (filterBy) {
      case 'dossier':
        result = result.filter(d => d.origine === 'dossier');
        break;
      case 'utilisateur':
        result = result.filter(d => d.origine === 'utilisateur');
        break;
      case 'favorites':
        result = result.filter(d => d.favorite);
        break;
      case 'recent':
        result = result.filter(d => d.lastUsed && new Date(d.lastUsed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'titre':
          return a.titre.localeCompare(b.titre);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        case 'lastUsed':
          if (!a.lastUsed && !b.lastUsed) return 0;
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        case 'useCount':
          return (b.useCount || 0) - (a.useCount || 0);
        case 'origine':
          return a.origine.localeCompare(b.origine);
        default:
          return 0;
      }
    });

    return result;
  }, [docs, search, filterBy, sortBy]);

  // Documents utilisés dans la conversation avec filtrage
  const used = useMemo(() => {
    return (usedDocs || []).filter(d => {
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return d.titre.toLowerCase().includes(query) ||
             d.contenu.toLowerCase().includes(query);
    });
  }, [usedDocs, search]);

  // Pagination
  const totalPages = Math.ceil(processedDocs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = processedDocs.slice(startIndex, startIndex + itemsPerPage);

  // Réinitialiser la page lors du changement de filtre/tri
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterBy, sortBy]);

  return (
    <aside
      className="absolute top-0 right-0 bottom-0 w-80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-xl hidden lg:flex flex-col z-40 transition-transform duration-300"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{ transform: expanded ? 'translateX(0)' : 'translateX(calc(100% - 0px))' }}
      aria-label="Barre latérale des documents RAG"
    >
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-slate-950/40 dark:to-indigo-950/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm font-semibold">Documents RAG</div>
          <span className="ml-auto text-xs text-slate-500">{processedDocs.length}/{docs.length}</span>
        </div>
        
        {/* Recherche */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="favorites">Favoris</SelectItem>
                <SelectItem value="recent">Récents</SelectItem>
                <SelectItem value="dossier">Dossier</SelectItem>
                <SelectItem value="utilisateur">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="titre">Titre</SelectItem>
                <SelectItem value="lastUsed">Dernière utilisation</SelectItem>
                <SelectItem value="useCount">Popularité</SelectItem>
                <SelectItem value="size">Taille</SelectItem>
                <SelectItem value="origine">Origine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination et contrôles */}
        {processedDocs.length > 5 && (
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

        <div className="mt-2">
          <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" onClick={onOpenRagDocs}>
            <Upload className="w-4 h-4 mr-2" /> Gérer les documents
          </Button>
        </div>
      </div>

      {/* Poignée visible lorsque repliée */}
      {!expanded && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full select-none">
          <div className="w-[18px] h-24 rounded-l-lg bg-blue-500/80 text-white flex items-center justify-center text-[10px] font-semibold rotate-180 [writing-mode:vertical-rl] cursor-pointer">
            Docs
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Utilisés dans la conversation */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2 flex items-center gap-2">
            Utilisés dans la conversation
            {used.length > 0 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">{used.length}</Badge>
            )}
          </div>
          {used.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">Aucun document utilisé dans cette conversation.</div>
          ) : (
            used.map(doc => (
              <button
                key={`used-${doc.id}`}
                className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/60 dark:border-green-800/60 hover:border-green-300 dark:hover:border-green-600 hover:shadow group"
                onClick={() => handlePreview(doc as any)}
                title="Aperçu - Document utilisé"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex items-center gap-1">
                    {getIcon((doc.extension || ''))}
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Utilisé dans cette conversation" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.titre}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {doc.contenu.slice(0, 100)}{doc.contenu.length > 100 ? '…' : ''}
                    </div>
                    
                    {/* Métadonnées pour les documents utilisés */}
                    <div className="mt-1 text-[10px] text-green-600 dark:text-green-400">
                      Actif dans cette conversation
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">{getOriginBadge(doc.origine || '')}</div>
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-green-500" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Tous les documents */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">
            Tous les documents
            {totalPages > 1 && (
              <span className="ml-2 font-normal">({startIndex + 1}-{Math.min(startIndex + itemsPerPage, processedDocs.length)} sur {processedDocs.length})</span>
            )}
          </div>
          {paginatedDocs.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">
              {processedDocs.length === 0 ? 'Aucun document trouvé.' : 'Aucun résultat sur cette page.'}
            </div>
          ) : (
            paginatedDocs.map(doc => (
              <div key={doc.id} className="relative group">
                <button
                  className="w-full text-left p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow transition-all"
                  onClick={() => handlePreview(doc)}
                  title="Aperçu"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex items-center gap-1">
                      {getIcon(doc.extension || '')}
                      {doc.favorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.titre}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {doc.contenu.slice(0, 100)}{doc.contenu.length > 100 ? '…' : ''}
                      </div>
                      
                      {/* Métadonnées */}
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        {doc.size && (
                          <span>{doc.size > 1000 ? `${Math.round(doc.size/1000)}k` : doc.size} car.</span>
                        )}
                        {doc.useCount && doc.useCount > 0 && (
                          <span>• {doc.useCount} util.</span>
                        )}
                        {doc.lastUsed && (
                          <span>• {new Date(doc.lastUsed).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">{getOriginBadge(doc.origine)}</div>
                    <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                  </div>
                </button>
                
                {/* Bouton favori */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(doc.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800"
                  title={doc.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star className={`w-3 h-3 ${doc.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate flex items-center gap-2">
                    {getIcon(previewDoc.extension || '')}
                    {previewDoc.titre}
                    {previewDoc.favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
                  </DialogTitle>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                    {getOriginBadge(previewDoc.origine)}
                    {previewDoc.size && (
                      <span className="text-xs">
                        {previewDoc.size > 1000 ? `${Math.round(previewDoc.size/1000)}k` : previewDoc.size} caractères
                      </span>
                    )}
                    {previewDoc.useCount && previewDoc.useCount > 0 && (
                      <span className="text-xs">
                        {previewDoc.useCount} utilisation{previewDoc.useCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {previewDoc.lastUsed && (
                      <span className="text-xs">
                        Dernière utilisation: {new Date(previewDoc.lastUsed).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(previewDoc.id)}
                  className="flex-shrink-0"
                  title={previewDoc.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star className={`w-4 h-4 ${previewDoc.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                {previewDoc.contenu}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  );
}

export default RagSidebar;


