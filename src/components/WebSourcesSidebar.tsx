import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Globe, Search, ExternalLink, Clock, Filter, X, ChevronLeft, ChevronRight, 
  Star, Eye, BarChart3, Settings, Bookmark, 
  Hash, ArrowUpDown, Share2, BookOpen
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import des composants unifiés
import { 
  UnifiedButton, 
  UnifiedBadge,
  UnifiedInput,
  UnifiedModal, 
  UnifiedModalContent, 
  UnifiedModalHeader, 
  UnifiedModalTitle,
} from '@/components/ui/unified';

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
  tags?: string[]; // Tags personnalisés
  category?: string; // Catégorie (news, academic, social, etc.)
  quality?: number; // Score de qualité (1-5)
  relevance?: number; // Score de pertinence (1-5)
  readingTime?: number; // Temps de lecture estimé en minutes
  wordCount?: number; // Nombre de mots
  language?: string; // Langue détectée
  author?: string; // Auteur si disponible
  publishDate?: string; // Date de publication
  lastModified?: string; // Dernière modification
  socialShares?: number; // Nombre de partages sociaux
  comments?: number; // Nombre de commentaires
  rating?: number; // Note utilisateur (1-5)
  notes?: string; // Notes personnelles
  archived?: boolean; // Archivé
  pinned?: boolean; // Épinglé
};

type SortOption = 'timestamp' | 'domain' | 'title' | 'useCount' | 'lastUsed' | 'quality' | 'relevance' | 'readingTime' | 'socialShares' | 'rating';
type FilterOption = 'all' | 'recent' | 'favorites' | 'domains' | 'highQuality' | 'archived' | 'pinned' | 'news' | 'academic' | 'social';
type ViewMode = 'grid' | 'list' | 'compact';
type GroupBy = 'none' | 'domain' | 'category' | 'date' | 'quality';

const LS_WEB_FAVORITES_KEY = 'web_sources_favorites';
const LS_WEB_STATS_KEY = 'web_sources_stats';
const LS_WEB_SETTINGS_KEY = 'web_sources_settings';
const LS_WEB_NOTES_KEY = 'web_sources_notes';

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

function getWebStats(): Record<string, { useCount: number; lastUsed: string; quality?: number; relevance?: number; rating?: number }> {
  try {
    return JSON.parse(localStorage.getItem(LS_WEB_STATS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveWebStats(stats: Record<string, { useCount: number; lastUsed: string; quality?: number; relevance?: number; rating?: number }>): void {
  localStorage.setItem(LS_WEB_STATS_KEY, JSON.stringify(stats));
}

function getWebSettings(): { viewMode: ViewMode; groupBy: GroupBy; itemsPerPage: number; showAdvanced: boolean; autoRefresh: boolean } {
  try {
    return JSON.parse(localStorage.getItem(LS_WEB_SETTINGS_KEY) || '{"viewMode":"list","groupBy":"none","itemsPerPage":10,"showAdvanced":false,"autoRefresh":true}');
  } catch {
    return { viewMode: 'list', groupBy: 'none', itemsPerPage: 10, showAdvanced: false, autoRefresh: true };
  }
}

function saveWebSettings(settings: { viewMode: ViewMode; groupBy: GroupBy; itemsPerPage: number; showAdvanced: boolean; autoRefresh: boolean }): void {
  localStorage.setItem(LS_WEB_SETTINGS_KEY, JSON.stringify(settings));
}



function getWebNotes(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS_WEB_NOTES_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveWebNotes(notes: Record<string, string>): void {
  localStorage.setItem(LS_WEB_NOTES_KEY, JSON.stringify(notes));
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
  if (domain.includes('academic') || domain.includes('edu')) return '🎓';
  if (domain.includes('research') || domain.includes('pubmed')) return '🔬';
  if (domain.includes('social') || domain.includes('facebook') || domain.includes('twitter')) return '👥';
  if (domain.includes('shopping') || domain.includes('amazon') || domain.includes('shop')) return '🛒';
  if (domain.includes('video') || domain.includes('vimeo')) return '🎬';
  if (domain.includes('music') || domain.includes('spotify')) return '🎵';
  if (domain.includes('game') || domain.includes('gaming')) return '🎮';
  return '🌐';
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'news': return '📰';
    case 'academic': return '🎓';
    case 'social': return '👥';
    case 'blog': return '✍️';
    case 'video': return '📺';
    case 'documentation': return '📚';
    case 'forum': return '💬';
    case 'ecommerce': return '🛒';
    case 'research': return '🔬';
    case 'entertainment': return '🎬';
    default: return '🌐';
  }
}

function detectCategory(domain: string, title: string, snippet?: string): string {
  const text = `${domain} ${title} ${snippet || ''}`.toLowerCase();
  
  if (text.includes('news') || text.includes('bbc') || text.includes('cnn') || text.includes('reuters')) return 'news';
  if (text.includes('edu') || text.includes('academic') || text.includes('research') || text.includes('pubmed')) return 'academic';
  if (text.includes('reddit') || text.includes('facebook') || text.includes('twitter') || text.includes('social')) return 'social';
  if (text.includes('blog') || text.includes('medium') || text.includes('substack')) return 'blog';
  if (text.includes('youtube') || text.includes('vimeo') || text.includes('video')) return 'video';
  if (text.includes('github') || text.includes('docs') || text.includes('documentation')) return 'documentation';
  if (text.includes('forum') || text.includes('discussion') || text.includes('community')) return 'forum';
  if (text.includes('shop') || text.includes('amazon') || text.includes('ecommerce')) return 'ecommerce';
  if (text.includes('entertainment') || text.includes('movie') || text.includes('music')) return 'entertainment';
  
  return 'general';
}

function estimateReadingTime(wordCount?: number, snippet?: string): number {
  if (wordCount) {
    return Math.ceil(wordCount / 200); // 200 mots par minute
  }
  if (snippet) {
    const words = snippet.split(/\s+/).length;
    return Math.ceil(words / 200);
  }
  return 1; // Par défaut 1 minute
}

function getQualityScore(domain: string, title: string, snippet?: string): number {
  let score = 3; // Score de base
  
  // Bonus pour domaines réputés
  if (domain.includes('wikipedia') || domain.includes('edu') || domain.includes('gov')) score += 1;
  if (domain.includes('github') || domain.includes('stackoverflow')) score += 0.5;
  if (domain.includes('bbc') || domain.includes('reuters') || domain.includes('cnn')) score += 0.5;
  
  // Bonus pour titre informatif
  if (title.length > 20 && title.length < 100) score += 0.5;
  
  // Bonus pour snippet détaillé
  if (snippet && snippet.length > 100) score += 0.5;
  
  return Math.min(5, Math.max(1, Math.round(score)));
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [settings, setSettings] = useState(getWebSettings());
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Charger les données au démarrage
  useEffect(() => {
    setFavorites(getWebFavorites());
    setNotes(getWebNotes());
    const savedSettings = getWebSettings();
    setSettings(savedSettings);
    setGroupBy(savedSettings.groupBy);
  }, []);

  // Enrichir les sources avec les métadonnées
  const enrichedSources = useMemo(() => {
    const stats = getWebStats();
    const favs = getWebFavorites();
    const allNotes = getWebNotes();
    
    return usedSources.map(source => {
      const domain = getDomainFromUrl(source.url);
      const category = detectCategory(domain, source.title, source.snippet);
      const quality = getQualityScore(domain, source.title, source.snippet);
      const readingTime = estimateReadingTime(source.wordCount, source.snippet);
      
      return {
      ...source,
        domain,
        category,
        quality,
        readingTime,
      useCount: stats[source.url]?.useCount || 1,
      lastUsed: stats[source.url]?.lastUsed || source.timestamp,
      favorite: favs.has(source.url),
        tags: source.tags || [],
        rating: stats[source.url]?.rating || 0,
        notes: allNotes[source.url] || '',
        archived: source.archived || false,
        pinned: source.pinned || false,
      };
    });
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


  // Gestion des notes
  const updateNote = useCallback((url: string, note: string) => {
    const newNotes = { ...notes, [url]: note };
    setNotes(newNotes);
    saveWebNotes(newNotes);
  }, [notes]);

  // Gestion des évaluations
  const updateRating = useCallback((url: string, rating: number) => {
    const stats = getWebStats();
    stats[url] = { ...stats[url], rating };
    saveWebStats(stats);
  }, []);

  // Gestion de la prévisualisation avec tracking
  const handlePreview = useCallback((source: WebSource) => {
    setPreviewSource(source);
    
    // Tracker l'utilisation
    const stats = getWebStats();
    const now = new Date().toISOString();
    stats[source.url] = {
      ...stats[source.url],
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
        s.snippet?.toLowerCase().includes(query) ||
        s.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        s.category?.toLowerCase().includes(query) ||
        s.author?.toLowerCase().includes(query)
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
      case 'domains': {
        // Grouper par domaine et ne montrer que les domaines avec plusieurs sources
        const domainCounts = result.reduce((acc, s) => {
          acc[s.domain || 'unknown'] = (acc[s.domain || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        result = result.filter(s => domainCounts[s.domain || 'unknown'] > 1);
        break;
      }
      case 'highQuality':
        result = result.filter(s => (s.quality || 0) >= 4);
        break;
      case 'archived':
        result = result.filter(s => s.archived);
        break;
      case 'pinned':
        result = result.filter(s => s.pinned);
        break;
      case 'news':
        result = result.filter(s => s.category === 'news');
        break;
      case 'academic':
        result = result.filter(s => s.category === 'academic');
        break;
      case 'social':
        result = result.filter(s => s.category === 'social');
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
        case 'quality':
          return (b.quality || 0) - (a.quality || 0);
        case 'relevance':
          return (b.relevance || 0) - (a.relevance || 0);
        case 'readingTime':
          return (a.readingTime || 0) - (b.readingTime || 0);
        case 'socialShares':
          return (b.socialShares || 0) - (a.socialShares || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [enrichedSources, search, filterBy, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedSources.length / settings.itemsPerPage);
  const startIndex = (currentPage - 1) * settings.itemsPerPage;
  const paginatedSources = processedSources.slice(startIndex, startIndex + settings.itemsPerPage);

  // Réinitialiser la page lors du changement de filtre/tri
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterBy, sortBy]);

  // Statistiques avancées
  const stats = useMemo(() => {
    const domains = new Set(enrichedSources.map(s => s.domain));
    const categories = new Set(enrichedSources.map(s => s.category));
    const recent = enrichedSources.filter(s => 
      s.lastUsed && new Date(s.lastUsed).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    const highQuality = enrichedSources.filter(s => (s.quality || 0) >= 4).length;
    const totalReadingTime = enrichedSources.reduce((sum, s) => sum + (s.readingTime || 0), 0);
    const averageQuality = enrichedSources.reduce((sum, s) => sum + (s.quality || 0), 0) / enrichedSources.length || 0;
    const totalUseCount = enrichedSources.reduce((sum, s) => sum + (s.useCount || 0), 0);
    
    return {
      total: enrichedSources.length,
      domains: domains.size,
      categories: categories.size,
      recent,
      favorites: enrichedSources.filter(s => s.favorite).length,
      highQuality,
      totalReadingTime,
      averageQuality: Math.round(averageQuality * 10) / 10,
      totalUseCount,
      pinned: enrichedSources.filter(s => s.pinned).length,
      archived: enrichedSources.filter(s => s.archived).length,
    };
  }, [enrichedSources]);

  // Gestion de la sélection multiple
  const toggleSelection = useCallback((url: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedSources(newSelected);
  }, [selectedSources]);

  // Gestion des paramètres
  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveWebSettings(updated);
  }, [settings]);

  // Groupement des sources
  const groupedSources = useMemo(() => {
    if (groupBy === 'none') return { 'Toutes': paginatedSources };
    
    const groups: Record<string, WebSource[]> = {};
    
    paginatedSources.forEach(source => {
      let key = 'Autres';
      
      switch (groupBy) {
        case 'domain':
          key = source.domain || 'Inconnu';
          break;
        case 'category':
          key = source.category || 'Général';
          break;
        case 'date':
          if (source.timestamp) {
            const date = new Date(source.timestamp);
            key = date.toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          } else {
            key = 'Sans date';
          }
          break;
        case 'quality': {
          const quality = source.quality || 0;
          if (quality >= 4) key = 'Excellente (4-5)';
          else if (quality >= 3) key = 'Bonne (3-4)';
          else if (quality >= 2) key = 'Moyenne (2-3)';
          else key = 'Faible (1-2)';
          break;
        }
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(source);
    });
    
    return groups;
  }, [paginatedSources, groupBy]);

  return (
    <TooltipProvider>
      {expanded && (
    <aside
          className="absolute top-0 left-0 bottom-0 w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl hidden lg:flex flex-col z-40 transition-all duration-500"
          style={{
            transform: 'translateX(0)',
            width: '24rem'
          }}
          aria-label="Barre latérale des sources web enrichie"
      onMouseLeave={() => setExpanded(false)}
        >
          {/* Header avec contrôles avancés */}
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 dark:from-slate-950/60 dark:via-green-950/40 dark:to-emerald-950/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">Sources Web</div>
                  <div className="text-xs text-slate-500">
                    {processedSources.length}/{enrichedSources.length} sources
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <UnifiedButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowStats(!showStats)}
                      className="h-8 w-8"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </UnifiedButton>
                  </TooltipTrigger>
                  <TooltipContent>Statistiques</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <UnifiedButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      className="h-8 w-8"
                    >
                      <Settings className="w-4 h-4" />
                    </UnifiedButton>
                  </TooltipTrigger>
                  <TooltipContent>Paramètres</TooltipContent>
                </Tooltip>
              </div>
            </div>
        {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1">Domaines</div>
                <div className="text-sm font-bold text-green-600">{stats.domains}</div>
          </div>
              <div className="text-center p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1">Récents</div>
                <div className="text-sm font-bold text-blue-600">{stats.recent}</div>
          </div>
              <div className="text-center p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1">Favoris</div>
                <div className="text-sm font-bold text-yellow-600">{stats.favorites}</div>
        </div>
            </div>
            {/* Recherche avancée */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <UnifiedInput
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Rechercher sources, tags, domaines..."
                className="pl-10 pr-10 h-10 bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500/50"
          />
          {search && (
                <UnifiedButton
                  variant="ghost"
                  size="icon"
              onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
            >
              <X className="w-4 h-4" />
                </UnifiedButton>
          )}
        </div>
            {/* Contrôles de filtrage et tri */}
            <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                  <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="all">Toutes les sources</SelectItem>
                <SelectItem value="recent">Récentes (24h)</SelectItem>
                <SelectItem value="favorites">Favoris</SelectItem>
                    <SelectItem value="highQuality">Haute qualité</SelectItem>
                    <SelectItem value="pinned">Épinglées</SelectItem>
                    <SelectItem value="news">Actualités</SelectItem>
                    <SelectItem value="academic">Académique</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Plus récent</SelectItem>
                <SelectItem value="useCount">Plus utilisé</SelectItem>
                    <SelectItem value="quality">Meilleure qualité</SelectItem>
                    <SelectItem value="rating">Mieux noté</SelectItem>
                <SelectItem value="domain">Domaine</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="readingTime">Temps de lecture</SelectItem>
              </SelectContent>
            </Select>
          </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun groupement</SelectItem>
                    <SelectItem value="domain">Par domaine</SelectItem>
                    <SelectItem value="category">Par catégorie</SelectItem>
                    <SelectItem value="date">Par date</SelectItem>
                    <SelectItem value="quality">Par qualité</SelectItem>
                  </SelectContent>
                </Select>
        </div>
            </div>
            {/* Pagination */}
            {processedSources.length > settings.itemsPerPage && (
              <div className="mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Par page:</span>
                <Select 
                      value={settings.itemsPerPage.toString()}
                      onValueChange={(value) => updateSettings({ itemsPerPage: Number(value) })}
                >
                      <SelectTrigger className="h-8 w-16 text-xs">
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
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      {startIndex + 1}-{Math.min(startIndex + settings.itemsPerPage, processedSources.length)} sur {processedSources.length}
                    </span>
                <div className="flex items-center gap-1">
                  <UnifiedButton
                    variant="ghost"
                    size="icon"
                        className="h-7 w-7"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                        <ChevronLeft className="w-4 h-4" />
                  </UnifiedButton>
                  <UnifiedButton
                    variant="ghost"
                    size="icon"
                        className="h-7 w-7"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                        <ChevronRight className="w-4 h-4" />
                  </UnifiedButton>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>
          {/* Contenu principal avec ScrollArea */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {Object.entries(groupedSources).map(([groupName, sources]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {groupName}
                      </div>
                      <UnifiedBadge variant="secondary" className="text-xs">
                        {sources.length}
                      </UnifiedBadge>
          </div>
        )}
                  <div className="space-y-3">
                    {sources.map((source, index) => (
                      <SourceCard
                        key={`${source.url}-${index}`}
                        source={source}
                        isSelected={selectedSources.has(source.url)}
                        onSelect={() => toggleSelection(source.url)}
                        onPreview={() => handlePreview(source)}
                        onToggleFavorite={() => toggleFavorite(source.url)}
                        onUpdateNote={(note) => updateNote(source.url, note)}
                      />
                    ))}
      </div>
                </div>
              ))}
              {processedSources.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {enrichedSources.length === 0 ? 'Aucune source web trouvée.' : 'Aucun résultat pour ces filtres.'}
          </div>
        </div>
      )}
            </div>
          </ScrollArea>
          {/* Modales */}
          {previewSource && (
            <SourcePreviewModal
              source={previewSource}
              onClose={() => setPreviewSource(null)}
              onToggleFavorite={() => toggleFavorite(previewSource.url)}
              onUpdateRating={(rating) => updateRating(previewSource.url, rating)}
              onUpdateNote={(note) => updateNote(previewSource.url, note)}
            />
          )}
          {showSettings && (
            <SettingsModal
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
          {showStats && (
            <StatsModal
              stats={stats}
              sources={enrichedSources}
              onClose={() => setShowStats(false)}
            />
          )}
        </aside>
      )}
      {/* Poignée visible lorsque fermé */}
      {!expanded && (
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 select-none z-50"
          style={{ cursor: 'pointer' }}
          onClick={() => setExpanded(true)}
        >
          <div className="w-[60px] h-32 rounded-r-xl bg-gradient-to-b from-green-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold [writing-mode:vertical-rl] shadow-lg">
            Sources Web
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

// Composant SourceCard pour afficher une source individuelle
const SourceCard: React.FC<{
  source: WebSource;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onToggleFavorite: () => void;
  onUpdateNote: (note: string) => void;
}> = ({ source, isSelected, onSelect, onPreview, onToggleFavorite, onUpdateNote }) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteValue, setNoteValue] = useState(source.notes || '');

  const handleNoteSubmit = () => {
    onUpdateNote(noteValue);
    setShowNoteInput(false);
  };

  return (
    <div className={`relative group border rounded-xl transition-all duration-200 ${
      isSelected 
        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-md' 
        : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
    }`}>
      {/* Checkbox de sélection */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-green-600 bg-white border-slate-300 rounded focus:ring-green-500"
        />
            </div>

                <button
        onClick={onPreview}
        className="w-full text-left p-4 pl-10 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 rounded-xl transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{getDomainIcon(source.domain || '')}</span>
            {source.favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
            {source.pinned && <Bookmark className="w-4 h-4 text-blue-500 fill-blue-400" />}
                    </div>
          
                    <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                {source.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
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
            
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{source.domain}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={getCategoryIcon(source.category || '')}></span>
                {source.category}
              </span>
              {source.readingTime && (
                <>
                  <span>•</span>
                  <span>{source.readingTime} min</span>
                </>
              )}
                        </div>
            
            {source.snippet && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {source.snippet.slice(0, 120)}{source.snippet.length > 120 ? '...' : ''}
              </p>
                      )}
                      
                      {/* Métadonnées */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                        {source.useCount && source.useCount > 1 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {source.useCount}
                  </span>
                        )}
                        {source.timestamp && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(source.timestamp).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
                {source.socialShares && (
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {source.socialShares}
                  </span>
                )}
                  </div>
                  
                    <div className="flex items-center gap-1">
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors" />
                    </div>
            </div>
                    </div>
                  </div>
                </button>
                
      {/* Actions rapides */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <UnifiedButton
              variant="ghost"
              size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                onToggleFavorite();
              }}
              className="h-7 w-7"
            >
              <Star className={`w-4 h-4 ${source.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />
            </UnifiedButton>
          </TooltipTrigger>
          <TooltipContent>
            {source.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <UnifiedButton
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowNoteInput(!showNoteInput);
              }}
              className="h-7 w-7"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
            </UnifiedButton>
          </TooltipTrigger>
          <TooltipContent>Ajouter une note</TooltipContent>
        </Tooltip>
              </div>

      {/* Input de note */}
      {showNoteInput && (
        <div className="absolute top-full left-0 right-0 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
          <UnifiedInput
            value={noteValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteValue(e.target.value)}
            placeholder="Ajouter une note..."
            className="mb-2"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') handleNoteSubmit();
              if (e.key === 'Escape') setShowNoteInput(false);
            }}
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteInput(false)}
            >
              Annuler
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              size="sm"
              onClick={handleNoteSubmit}
            >
              Sauvegarder
            </UnifiedButton>
        </div>
      </div>
      )}
    </div>
  );
};

// Modal de prévisualisation enrichie
const SourcePreviewModal: React.FC<{
  source: WebSource;
  onClose: () => void;
  onToggleFavorite: () => void;
  onUpdateRating: (rating: number) => void;
  onUpdateNote: (note: string) => void;
}> = ({ source, onClose, onToggleFavorite, onUpdateRating, onUpdateNote }) => {
  const [note, setNote] = useState(source.notes || '');
  const [rating, setRating] = useState(source.rating || 0);

  const handleNoteChange = (value: string) => {
    setNote(value);
    onUpdateNote(value);
  };

  const handleRatingChange = (value: number) => {
    setRating(value);
    onUpdateRating(value);
  };

  return (
    <UnifiedModal open={!!source} onOpenChange={onClose}>
      <UnifiedModalContent className="max-w-5xl max-h-[90vh] flex flex-col">
            <UnifiedModalHeader className="flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
              <UnifiedModalTitle className="text-xl flex items-center gap-3">
                <span className="text-2xl">{getDomainIcon(source.domain || '')}</span>
                {source.title}
                {source.favorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />}
                {source.pinned && <Bookmark className="w-5 h-5 text-blue-500 fill-blue-400" />}
                  </UnifiedModalTitle>
              
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <UnifiedBadge variant="outline" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {source.domain}
                </UnifiedBadge>
                
                <UnifiedBadge variant="secondary" className="flex items-center gap-1">
                  <span className={getCategoryIcon(source.category || '')}></span>
                  {source.category}
                </UnifiedBadge>
                
                {source.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {source.readingTime} min de lecture
                      </span>
                    )}
                
                {source.useCount && source.useCount > 1 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {source.useCount} utilisations
                      </span>
                    )}
                  </div>
                </div>
            
                <div className="flex items-center gap-2">
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                onClick={onToggleFavorite}
                className="flex items-center gap-2"
                  >
                <Star className={`w-4 h-4 ${source.favorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />
                {source.favorite ? 'Favori' : 'Favoris'}
                  </UnifiedButton>
              
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                onClick={() => window.open(source.url, '_blank')}
                className="flex items-center gap-2"
                  >
                <ExternalLink className="w-4 h-4" />
                    Ouvrir
                  </UnifiedButton>
                </div>
              </div>
            </UnifiedModalHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* URL */}
          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">URL :</div>
                <div className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
              {source.url}
                </div>
              </div>
              
          {/* Extrait */}
          {source.snippet && (
                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Extrait :</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {source.snippet}
                  </div>
                </div>
              )}

          {/* Évaluation et notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Évaluation */}
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Évaluation :</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-500">
                  {rating > 0 ? `${rating}/5` : 'Non noté'}
                </span>
              </div>
            </div>

            {/* Notes personnelles */}
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Notes personnelles :</div>
              <textarea
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Ajouter vos notes sur cette source..."
                className="w-full h-20 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Métadonnées détaillées */}
          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Métadonnées :</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {source.author && (
                <div>
                  <span className="text-slate-500">Auteur :</span>
                  <div className="font-medium">{source.author}</div>
                </div>
              )}
              {source.publishDate && (
                <div>
                  <span className="text-slate-500">Date de publication :</span>
                  <div className="font-medium">
                    {new Date(source.publishDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}
              {source.wordCount && (
                <div>
                  <span className="text-slate-500">Mots :</span>
                  <div className="font-medium">{source.wordCount.toLocaleString()}</div>
                </div>
              )}
              {source.language && (
                <div>
                  <span className="text-slate-500">Langue :</span>
                  <div className="font-medium">{source.language}</div>
                </div>
              )}
            </div>
          </div>
            </div>
          </UnifiedModalContent>
        </UnifiedModal>
  );
};

// Modal des paramètres
const SettingsModal: React.FC<{
  settings: { viewMode: ViewMode; groupBy: GroupBy; itemsPerPage: number; showAdvanced: boolean; autoRefresh: boolean };
  onUpdate: (settings: Partial<{ viewMode: ViewMode; groupBy: GroupBy; itemsPerPage: number; showAdvanced: boolean; autoRefresh: boolean }>) => void;
  onClose: () => void;
}> = ({ settings, onUpdate, onClose }) => {
  return (
    <UnifiedModal open={true} onOpenChange={onClose}>
      <UnifiedModalContent className="max-w-2xl">
        <UnifiedModalHeader>
          <UnifiedModalTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres des Sources Web
          </UnifiedModalTitle>
        </UnifiedModalHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Mode d'affichage</Label>
              <Select value={settings.viewMode} onValueChange={(value: ViewMode) => onUpdate({ viewMode: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">Liste</SelectItem>
                  <SelectItem value="grid">Grille</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Groupement</Label>
              <Select value={settings.groupBy} onValueChange={(value: GroupBy) => onUpdate({ groupBy: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="domain">Par domaine</SelectItem>
                  <SelectItem value="category">Par catégorie</SelectItem>
                  <SelectItem value="date">Par date</SelectItem>
                  <SelectItem value="quality">Par qualité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Éléments par page</Label>
            <Select 
              value={settings.itemsPerPage.toString()} 
              onValueChange={(value) => onUpdate({ itemsPerPage: Number(value) })}
            >
              <SelectTrigger className="mt-1 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Actualisation automatique</Label>
                <p className="text-xs text-slate-500">Actualiser les statistiques automatiquement</p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => onUpdate({ autoRefresh: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mode avancé</Label>
                <p className="text-xs text-slate-500">Afficher les options avancées</p>
              </div>
              <Switch
                checked={settings.showAdvanced}
                onCheckedChange={(checked) => onUpdate({ showAdvanced: checked })}
              />
            </div>
          </div>
        </div>
      </UnifiedModalContent>
    </UnifiedModal>
  );
};

// Modal des statistiques
const StatsModal: React.FC<{
  stats: {
    total: number;
    domains: number;
    categories: number;
    recent: number;
    favorites: number;
    highQuality: number;
    totalReadingTime: number;
    averageQuality: number;
    totalUseCount: number;
    pinned: number;
    archived: number;
  };
  sources: WebSource[];
  onClose: () => void;
}> = ({ stats, sources, onClose }) => {
  const domainStats = useMemo(() => {
    const domains = sources.reduce((acc, source) => {
      const domain = source.domain || 'unknown';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(domains)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }, [sources]);

  const categoryStats = useMemo(() => {
    const categories = sources.reduce((acc, source) => {
      const category = source.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a);
  }, [sources]);

  return (
    <UnifiedModal open={true} onOpenChange={onClose}>
      <UnifiedModalContent className="max-w-4xl max-h-[90vh]">
        <UnifiedModalHeader>
          <UnifiedModalTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistiques des Sources Web
          </UnifiedModalTitle>
        </UnifiedModalHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.total}</div>
                <div className="text-sm text-slate-500">Total sources</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.domains}</div>
                <div className="text-sm text-slate-500">Domaines uniques</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.favorites}</div>
                <div className="text-sm text-slate-500">Favoris</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalReadingTime}</div>
                <div className="text-sm text-slate-500">Min de lecture</div>
              </div>
            </div>

            {/* Top domaines */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Top Domaines</h3>
              <div className="space-y-2">
                {domainStats.map(([domain, count]) => (
                  <div key={domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDomainIcon(domain)}</span>
                      <span className="font-medium">{domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Répartition par catégorie */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Répartition par Catégorie</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoryStats.map(([category, count]) => (
                  <div key={category} className="flex items-center gap-2 p-2 border rounded-lg">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <div>
                      <div className="font-medium capitalize">{category}</div>
                      <div className="text-sm text-slate-500">{count} sources</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualité moyenne */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Qualité Moyenne</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-green-600">{stats.averageQuality}/5</div>
                <div className="flex-1">
                  <Progress value={(stats.averageQuality / 5) * 100} className="h-3" />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </UnifiedModalContent>
    </UnifiedModal>
  );
};

export default WebSourcesSidebar;
