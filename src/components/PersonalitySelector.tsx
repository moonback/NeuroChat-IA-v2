import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Sparkles, ChevronDown, Filter, Search, Star, Shuffle } from 'lucide-react';
import { personalities, personalityCategories, getPersonalityById, Personality } from '@/config/personalities';

// =====================
// Types et interfaces
// =====================
interface PersonalitySelectorProps {
  open: boolean;
  onClose: () => void;
  selectedPersonality: string;
  onPersonalityChange: (personalityId: string) => void;
  showAsTrigger?: boolean;
  className?: string;
}

interface PersonalityTriggerProps {
  selectedPersonality: string;
  onClick: () => void;
  className?: string;
}

// =====================
// Composant Badge amélioré
// =====================
const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline'; className?: string }> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// =====================
// Composant Button amélioré
// =====================
const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'default' | 'outline' | 'ghost'; 
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  onClick,
  className = '',
  disabled = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// =====================
// Composant déclencheur amélioré
// =====================
export const PersonalityTrigger: React.FC<PersonalityTriggerProps> = ({ 
  selectedPersonality, 
  onClick, 
  className = '' 
}) => {
  const currentPersonality = getPersonalityById(selectedPersonality);
  
  if (!currentPersonality) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-10 px-4 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group ${className}`}
    >
      <currentPersonality.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
      <span className="truncate max-w-32">{currentPersonality.label}</span>
      <ChevronDown className="w-3 h-3 ml-2 group-hover:rotate-180 transition-transform duration-200" />
    </Button>
  );
};

// =====================
// Composant carte de personnalité amélioré
// =====================
const PersonalityCard: React.FC<{
  personality: Personality;
  isSelected: boolean;
  onClick: () => void;
  showDetails: boolean;
  animationDelay: number;
  onToggleFavorite?: (id: string) => void;
}> = ({ 
  personality, 
  isSelected, 
  onClick, 
  showDetails, 
  animationDelay,
  onToggleFavorite 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(personality.id);
  }, [personality.id, onToggleFavorite, isFavorite]);
  
  return (
    <div
      className={`group relative flex flex-col gap-3 w-full p-4 rounded-2xl font-medium text-left transition-all duration-300 cursor-pointer ${
        personality.bg
      } border-2 ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-400/20 scale-[1.02] shadow-lg' 
          : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'
      } hover:scale-[1.02] hover:shadow-xl focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-400/50 animate-in slide-in-from-left duration-200`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Bouton favori */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
        >
          <Star 
            className={`w-4 h-4 ${
              isFavorite 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-400 hover:text-yellow-400'
            } transition-colors`}
          />
        </button>
      )}
      
      {/* En-tête de la carte */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm group-hover:shadow-md transition-all duration-200 ${
          isHovered ? 'scale-110' : ''
        }`}>
          <personality.icon className={`w-6 h-6 transition-all duration-200 ${
            isSelected ? 'text-blue-600' : ''
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
            isSelected ? 'text-blue-600 dark:text-blue-400' : ''
          }`}>
            {personality.label}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {personality.description}
          </div>
        </div>
        {isSelected && (
          <div className="flex items-center gap-1">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Détails étendus */}
      {showDetails && (
        <div className="pt-3 border-t border-white/20 dark:border-slate-700/20 animate-in slide-in-from-top duration-200">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            {personality.detailedDescription}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {personality.traits.map((trait, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs py-1 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-default"
              >
                {trait}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =====================
// Composant principal amélioré
// =====================
export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ 
  open, 
  onClose, 
  selectedPersonality, 
  onPersonalityChange 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
  
  const currentPersonality = getPersonalityById(selectedPersonality);
  
  // Filtrage et tri des personnalités
  const filteredAndSortedPersonalities = useMemo(() => {
    let filtered = personalities;
    
    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = personalities.filter(p => p.category === selectedCategory);
    }
    
    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.traits.some(trait => trait.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Tri
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return a.label.localeCompare(b.label);
      }
    });
    
    return sorted;
  }, [selectedCategory, searchTerm, sortBy]);
  
  const handlePersonalitySelect = useCallback((personalityId: string) => {
    onPersonalityChange(personalityId);
    onClose();
  }, [onPersonalityChange, onClose]);
  
  const handleToggleFavorite = useCallback((personalityId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(personalityId)) {
        newFavorites.delete(personalityId);
      } else {
        newFavorites.add(personalityId);
      }
      return newFavorites;
    });
  }, []);
  
  const handleRandomSelection = useCallback(() => {
    const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    handlePersonalitySelect(randomPersonality.id);
  }, [handlePersonalitySelect]);
  
  // Fermeture avec échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300 mx-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Choisir une personnalité
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filteredAndSortedPersonalities.length} personnalités disponibles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomSelection}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Surprise
              </Button>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une personnalité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtres et options */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                <Filter className="w-3 h-3 mr-1" />
                Toutes
              </Button>
              {Object.entries(personalityCategories).map(([key, category]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'category')}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
              >
                <option value="name">Nom</option>
                <option value="category">Catégorie</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Masquer' : 'Détails'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredAndSortedPersonalities.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune personnalité trouvée pour "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedPersonalities.map((personality, index) => (
                <PersonalityCard
                  key={personality.id}
                  personality={personality}
                  isSelected={selectedPersonality === personality.id}
                  onClick={() => handlePersonalitySelect(personality.id)}
                  showDetails={showDetails}
                  animationDelay={index * 50}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Aperçu de la personnalité sélectionnée */}
        {currentPersonality && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                <currentPersonality.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {currentPersonality.label}
                  </h3>
                  <Badge className={personalityCategories[currentPersonality.category].color}>
                    {personalityCategories[currentPersonality.category].label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {currentPersonality.detailedDescription}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentPersonality.traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalitySelector;