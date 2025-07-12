import React, { useState } from 'react';
import { X, Sparkles, ChevronDown, Filter } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  personalities, 
  personalityCategories, 
  getPersonalityById, 
  getPersonalitiesByCategory,
  type Personality 
} from '@/config/personalities';

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

// Composant déclencheur compact pour l'affichage dans le header
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
      className={`h-9 px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    >
      <currentPersonality.icon className="w-4 h-4 mr-2" />
      <span>{currentPersonality.label}</span>
      <ChevronDown className="w-3 h-3 ml-2" />
    </Button>
  );
};

// Composant principal du sélecteur
export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ 
  open, 
  onClose, 
  selectedPersonality, 
  onPersonalityChange 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);
  
  const currentPersonality = getPersonalityById(selectedPersonality);
  
  const filteredPersonalities = selectedCategory === 'all' 
    ? personalities 
    : getPersonalitiesByCategory(selectedCategory);
  
  const handlePersonalitySelect = (personalityId: string) => {
    onPersonalityChange(personalityId);
    onClose();
  };
  
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="w-[98vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 rounded-3xl shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300">
        <DrawerHeader className="text-center pb-6 relative">
          <DrawerTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choisir une personnalité
          </DrawerTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Sélectionnez le style de communication qui vous convient le mieux
          </p>
          
          {/* Bouton de fermeture */}
          <button 
            onClick={onClose} 
            className="absolute top-0 right-0 text-slate-400 hover:text-red-500 rounded-full p-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-400" 
            title="Fermer" 
            aria-label="Fermer"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
          
          {/* Filtre par catégorie */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="text-xs"
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
                className="text-xs"
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          {/* Toggle pour afficher les détails */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-xs"
          >
            {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
          </Button>
        </DrawerHeader>
        
        {/* Grille des personnalités */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-2 pb-4">
          {filteredPersonalities.map((personality, index) => (
            <PersonalityCard
              key={personality.id}
              personality={personality}
              isSelected={selectedPersonality === personality.id}
              onClick={() => handlePersonalitySelect(personality.id)}
              showDetails={showDetails}
              animationDelay={index * 50}
            />
          ))}
        </div>
        
        {/* Aperçu de la personnalité sélectionnée */}
        {currentPersonality && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <currentPersonality.icon className="w-5 h-5" />
              {currentPersonality.label}
              <Badge variant="secondary" className="ml-2">
                {personalityCategories[currentPersonality.category].label}
              </Badge>
            </h3>
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
        )}
        
        <DrawerFooter className="pt-6">
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

// Composant pour afficher une carte de personnalité
interface PersonalityCardProps {
  personality: Personality;
  isSelected: boolean;
  onClick: () => void;
  showDetails: boolean;
  animationDelay: number;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({ 
  personality, 
  isSelected, 
  onClick, 
  showDetails, 
  animationDelay 
}) => {
  return (
    <button
      className={`group relative flex flex-col gap-3 w-full p-4 rounded-2xl font-medium text-left transition-all duration-300 ${
        personality.bg
      } border-2 ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-400/20 scale-[1.02]' 
          : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'
      } hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 animate-in slide-in-from-left duration-200`}
      onClick={onClick}
      type="button"
      aria-label={`Sélectionner la personnalité ${personality.label}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* En-tête de la carte */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm group-hover:shadow-md transition-shadow duration-200">
          <personality.icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {personality.label}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {personality.description}
          </div>
        </div>
        {isSelected && (
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Détails étendus */}
      {showDetails && (
        <div className="pt-2 border-t border-white/20 dark:border-slate-700/20">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            {personality.detailedDescription}
          </p>
          <div className="flex flex-wrap gap-1">
            {personality.traits.slice(0, 3).map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                {trait}
              </Badge>
            ))}
            {personality.traits.length > 3 && (
              <Badge variant="outline" className="text-xs py-0 px-1">
                +{personality.traits.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}
    </button>
  );
};

export default PersonalitySelector; 