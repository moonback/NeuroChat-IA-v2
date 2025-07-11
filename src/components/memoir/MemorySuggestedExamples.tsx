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
  // Exemples prédéfinis suggérés - optimisés pour la détection sémantique
  const suggestedExamples = useMemo(() => [
    // Identité et informations personnelles
    "Je m'appelle Sophie et j'ai 28 ans",
    "Mon nom de famille est Dubois",
    "Je suis née le 12 mars 1995 à Paris",
    "Je mesure 1m68 et j'ai les yeux verts",
    
    // Localisation et habitation
    "J'habite au 15 rue de la Paix à Lyon",
    "Je vis dans le 13ème arrondissement de Paris",
    "Mon code postal est 69000",
    "Ma ville natale est Marseille",
    
    // Profession et éducation
    "Je travaille comme ingénieure informatique",
    "J'ai étudié à l'université de Sorbonne",
    "Mon entreprise s'appelle TechCorp",
    "Je suis freelance en développement web",
    
    // Famille et relations
    "J'ai deux enfants : Emma et Lucas",
    "Mon mari s'appelle Pierre",
    "Mes parents habitent en Bretagne",
    "J'ai un frère qui vit à l'étranger",
    
    // Préférences et loisirs
    "J'adore la cuisine italienne",
    "Mon sport préféré est la natation",
    "Je pratique le yoga tous les matins",
    "J'aime lire des romans policiers",
    
    // Santé et bien-être
    "Je suis allergique aux fruits de mer",
    "Je porte des lunettes depuis l'âge de 10 ans",
    "Je fais du jogging 3 fois par semaine",
    "J'évite le gluten dans mon alimentation",
    
    // Technologie et habitudes
    "Mon téléphone est un iPhone 14",
    "J'utilise Gmail pour mes emails",
    "Je préfère Netflix à Amazon Prime",
    "Mon mot de passe contient toujours des chiffres",
    
    // Projets et aspirations
    "Je rêve de voyager au Japon",
    "J'apprends l'espagnol en ligne",
    "Je veux acheter une maison l'année prochaine",
    "Mon objectif est de courir un marathon"
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