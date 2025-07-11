import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Star,
  Calendar,
  ArrowUpDown,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { type SearchResult, type MemoryFact } from './types';
import { MemoryCategoryIndicator } from './MemoryCategoryIndicator';
import { cn } from "@/lib/utils";

interface MemorySearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onEdit?: (fact: MemoryFact) => void;
  onDelete?: (fact: MemoryFact) => void;
  onView?: (fact: MemoryFact) => void;
}

type ViewMode = 'list' | 'grid' | 'compact';
type SortMode = 'relevance' | 'date' | 'importance' | 'category';

export function MemorySearchResults({ 
  results, 
  isLoading = false,
  onEdit,
  onDelete,
  onView
}: MemorySearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  // Tri des résultats
  const sortedResults = useMemo(() => {
    const sorted = [...results];
    
    switch (sortMode) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.fact.date).getTime() - new Date(a.fact.date).getTime());
      case 'importance':
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => {
          const aImportance = importanceOrder[a.fact.importance || 'low'];
          const bImportance = importanceOrder[b.fact.importance || 'low'];
          return bImportance - aImportance;
        });
      case 'category':
        return sorted.sort((a, b) => (a.fact.category || '').localeCompare(b.fact.category || ''));
      default: // relevance
        return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }, [results, sortMode]);

  // Gestion de la sélection
  const toggleSelection = (factId: string) => {
    setSelectedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(factId)) {
        newSet.delete(factId);
      } else {
        newSet.add(factId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedResults(new Set(results.map(r => r.fact.id)));
  };

  const clearSelection = () => {
    setSelectedResults(new Set());
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Mise en évidence des termes recherchés
  const highlightText = (text: string, terms: string[]) => {
    if (terms.length === 0) return text;
    
    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });
    
    return highlightedText;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span>Recherche en cours...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Essayez de modifier votre recherche ou d'utiliser des mots-clés différents.
          La recherche floue peut aider avec les fautes de frappe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </span>
          
          {selectedResults.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedResults.size} sélectionné{selectedResults.size > 1 ? 's' : ''}
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Désélectionner
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tri */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            <option value="relevance">Pertinence</option>
            <option value="date">Date</option>
            <option value="importance">Importance</option>
            <option value="category">Catégorie</option>
          </select>

          {/* Mode d'affichage */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none border-0 border-l border-gray-300 dark:border-gray-600"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions globales */}
          {selectedResults.size === results.length ? (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Tout désélectionner
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Tout sélectionner
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Résultats */}
      <div className={cn(
        "space-y-4",
        viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0",
        viewMode === 'compact' && "space-y-2"
      )}>
        {sortedResults.map((result) => (
          <ResultCard
            key={result.fact.id}
            result={result}
            viewMode={viewMode}
            isSelected={selectedResults.has(result.fact.id)}
            onSelect={() => toggleSelection(result.fact.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            highlightText={highlightText}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
}

// Composant pour chaque carte de résultat
interface ResultCardProps {
  result: SearchResult;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (fact: MemoryFact) => void;
  onDelete?: (fact: MemoryFact) => void;
  onView?: (fact: MemoryFact) => void;
  highlightText: (text: string, terms: string[]) => string;
  formatDate: (date: string) => string;
}

function ResultCard({ 
  result, 
  viewMode, 
  isSelected, 
  onSelect,
  onEdit,
  onDelete,
  onView,
  highlightText,
  formatDate
}: ResultCardProps) {
  const [showActions, setShowActions] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.fact.content);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Impossible de copier le texte:', error);
    }
  };

  const baseClasses = cn(
    "group relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-200 cursor-pointer",
    "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
    isSelected && "ring-2 ring-blue-500 border-blue-300 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10",
    viewMode === 'compact' && "p-3"
  );

  return (
    <div 
      className={baseClasses}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
          
          <MemoryCategoryIndicator
            category={result.fact.category}
            importance={result.fact.importance}
            confidence={result.fact.confidence}
            size={viewMode === 'compact' ? 'sm' : 'md'}
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Score de pertinence */}
          <Badge variant="outline" className="text-xs">
            {Math.round(result.relevanceScore * 100)}%
          </Badge>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity",
            (showActions || isSelected) && "opacity-100"
          )}>
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(result.fact);
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(result.fact);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(result.fact);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-2">
        <div 
          className={cn(
            "text-gray-900 dark:text-gray-100",
            viewMode === 'compact' ? "text-sm" : "text-base"
          )}
          dangerouslySetInnerHTML={{
            __html: result.contextSnippet || highlightText(result.fact.content, result.matchedTerms)
          }}
        />

        {/* Tags */}
        {result.fact.tags && result.fact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.fact.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {result.fact.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{result.fact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(result.fact.date)}
            </span>
            
            {result.matchedTerms.length > 0 && (
              <span>
                Termes: {result.matchedTerms.slice(0, 2).join(', ')}
                {result.matchedTerms.length > 2 && ` +${result.matchedTerms.length - 2}`}
              </span>
            )}
          </div>

          {result.fact.lastUpdated && result.fact.lastUpdated !== result.fact.date && (
            <span>Modifié le {formatDate(result.fact.lastUpdated)}</span>
          )}
        </div>
      </div>
    </div>
  );
} 