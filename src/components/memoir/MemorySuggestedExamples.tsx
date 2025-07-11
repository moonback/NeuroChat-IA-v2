import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MemorySuggestedExamplesProps {
  examples: string[];
  onAddSuggestion: (suggestion: string) => void;
  maxVisible?: number;
}

export function MemorySuggestedExamples({ 
  examples, 
  onAddSuggestion, 
  maxVisible = 3 
}: MemorySuggestedExamplesProps) {
  // Exemples prédéfinis suggérés
  const suggestedExamples = useMemo(() => [
    "Je m'appelle Marie",
    "J'habite à Lyon", 
    "Je suis développeur web",
    "Ma couleur préférée est le violet",
    "Je préfère le café au thé",
    "Mon métier est infirmière",
    "Je suis né le 15 juin 1985",
    "Mon sport favori est le tennis",
    "Mon animal préféré est le chat",
    "Je travaille à distance"
  ], []);

  // Gestion optimisée de l'ajout d'exemples suggérés
  const handleAddSuggestion = useCallback((suggestion: string) => {
    if (!examples.includes(suggestion)) {
      onAddSuggestion(suggestion);
    }
  }, [examples, onAddSuggestion]);

  // Filtrer les exemples qui ne sont pas déjà ajoutés
  const availableSuggestions = useMemo(() => {
    return suggestedExamples
      .filter(suggestion => !examples.includes(suggestion))
      .slice(0, maxVisible);
  }, [suggestedExamples, examples, maxVisible]);

  // Ne pas afficher le composant s'il n'y a pas de suggestions disponibles
  if (availableSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
        Suggestions d'exemples :
      </p>
      <div className="flex flex-wrap gap-1">
        {availableSuggestions.map((suggestion, index) => (
          <Button
            key={suggestion}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleAddSuggestion(suggestion)}
            className="h-7 text-xs px-2 py-1 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            title={`Ajouter "${suggestion}" aux exemples`}
          >
            <Plus className="w-3 h-3 mr-1" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
} 