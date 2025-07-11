import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Filter, 
  Clock, 
  X, 
  ChevronDown, 
  History,
  Star,
  Calendar,
  Tag,
  Zap,
  Target
} from "lucide-react";
import { MEMORY_CATEGORIES, type MemoryFact, type SearchOptions, type SearchResult } from './types';
import { MemorySearchService } from './MemorySearchService';
import { MemoryCategoryIndicator } from './MemoryCategoryIndicator';
import { cn } from "@/lib/utils";

interface MemoryAdvancedSearchProps {
  facts: MemoryFact[];
  onResults: (results: SearchResult[]) => void;
  placeholder?: string;
}

const IMPORTANCE_OPTIONS = [
  { value: 'high', label: 'Élevée', color: 'text-red-500' },
  { value: 'medium', label: 'Moyenne', color: 'text-yellow-500' },
  { value: 'low', label: 'Faible', color: 'text-gray-500' }
] as const;

export function MemoryAdvancedSearch({ 
  facts, 
  onResults,
  placeholder = "Rechercher dans vos souvenirs..." 
}: MemoryAdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Options de recherche
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: "",
    fuzzySearch: true,
    contextual: true,
    categories: [],
    importance: [],
    dateRange: undefined
  });

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const searchService = useMemo(() => MemorySearchService.getInstance(), []);
  
  // Historique et suggestions
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Charger l'historique au montage
  useEffect(() => {
    setSearchHistory(searchService.getSearchHistory());
  }, [searchService]);

  // Mettre à jour les suggestions en temps réel
  useEffect(() => {
    if (query.length > 1) {
      const newSuggestions = searchService.getSuggestions(query, facts);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, facts, searchService]);

  // Fonction de recherche
  const performSearch = useCallback(async (searchQuery: string = query) => {
    if (searchQuery.trim().length < 1) {
      onResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const options: SearchOptions = {
        ...searchOptions,
        query: searchQuery.trim()
      };

      const results = searchService.search(facts, options);
      onResults(results);
      
      // Mettre à jour l'historique
      setSearchHistory(searchService.getSearchHistory());
      setShowHistory(false);
      setSuggestions([]);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      onResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchOptions, facts, onResults, searchService]);

  // Gestionnaires d'événements
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  }, [performSearch]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (value.length === 0) {
      onResults([]);
    }
  }, [onResults]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  }, [performSearch]);

  const handleHistoryClick = useCallback((historyItem: string) => {
    setQuery(historyItem);
    performSearch(historyItem);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    onResults([]);
    inputRef.current?.focus();
  }, [onResults]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSearchOptions(prev => ({
      ...prev,
      categories: prev.categories?.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...(prev.categories || []), categoryId]
    }));
  }, []);

  const toggleImportance = useCallback((importance: 'low' | 'medium' | 'high') => {
    setSearchOptions(prev => ({
      ...prev,
      importance: prev.importance?.includes(importance)
        ? prev.importance.filter(imp => imp !== importance)
        : [...(prev.importance || []), importance]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchOptions({
      query: "",
      fuzzySearch: true,
      contextual: true,
      categories: [],
      importance: [],
      dateRange: undefined
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (searchOptions.categories?.length || 0) > 0 ||
           (searchOptions.importance?.length || 0) > 0 ||
           !!searchOptions.dateRange;
  }, [searchOptions]);

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-12 text-base"
            onFocus={() => {
              if (query.length === 0 && searchHistory.length > 0) {
                setShowHistory(true);
              }
            }}
          />
          
          {/* Boutons de la barre de recherche */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-8 w-8 p-0",
                hasActiveFilters && "text-blue-600 dark:text-blue-400"
              )}
            >
              <Filter className="w-4 h-4" />
            </Button>
            
            <Button
              type="submit"
              disabled={isSearching || query.trim().length === 0}
              className="h-8 px-3"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Historique et suggestions */}
        {(showHistory || suggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Historique */}
            {showHistory && searchHistory.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <History className="w-3 h-3" />
                  Recherches récentes
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Filtres avancés */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Filtres de recherche</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Options de recherche */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="fuzzy-search"
                checked={searchOptions.fuzzySearch}
                onCheckedChange={(checked) => 
                  setSearchOptions(prev => ({ ...prev, fuzzySearch: checked }))
                }
              />
              <Label htmlFor="fuzzy-search" className="text-sm">
                Recherche floue
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="contextual-search"
                checked={searchOptions.contextual}
                onCheckedChange={(checked) => 
                  setSearchOptions(prev => ({ ...prev, contextual: checked }))
                }
              />
              <Label htmlFor="contextual-search" className="text-sm">
                Recherche contextuelle
              </Label>
            </div>
          </div>

          <Separator />

          {/* Filtres par catégorie */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Catégories
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEMORY_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={searchOptions.categories?.includes(category.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className="justify-start h-auto py-2"
                >
                  <MemoryCategoryIndicator
                    category={category.id}
                    showText={false}
                    size="sm"
                  />
                  <span className="ml-2 text-xs">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Filtres par importance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Importance
            </Label>
            <div className="flex gap-2">
              {IMPORTANCE_OPTIONS.map(({ value, label, color }) => (
                <Button
                  key={value}
                  variant={searchOptions.importance?.includes(value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleImportance(value)}
                  className="flex items-center gap-2"
                >
                  <div className={cn("w-2 h-2 rounded-full", color.replace('text-', 'bg-'))} />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtres de date */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Période
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="Date de début"
                onChange={(e) => {
                  const start = e.target.value ? new Date(e.target.value) : undefined;
                  setSearchOptions(prev => ({
                    ...prev,
                    dateRange: start ? { start, end: prev.dateRange?.end || new Date() } : undefined
                  }));
                }}
              />
              <Input
                type="date"
                placeholder="Date de fin"
                onChange={(e) => {
                  const end = e.target.value ? new Date(e.target.value) : undefined;
                  setSearchOptions(prev => ({
                    ...prev,
                    dateRange: end ? { start: prev.dateRange?.start || new Date(0), end } : undefined
                  }));
                }}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Indicateurs de filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchOptions.categories?.map(categoryId => {
            const category = MEMORY_CATEGORIES.find(cat => cat.id === categoryId);
            return category ? (
              <Badge
                key={categoryId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <MemoryCategoryIndicator
                  category={categoryId}
                  showText={false}
                  size="sm"
                />
                {category.name}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => toggleCategory(categoryId)}
                />
              </Badge>
            ) : null;
          })}
          
          {searchOptions.importance?.map(importance => (
            <Badge
              key={importance}
              variant="secondary"
              className="flex items-center gap-1"
            >
              Importance: {IMPORTANCE_OPTIONS.find(opt => opt.value === importance)?.label}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleImportance(importance)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 