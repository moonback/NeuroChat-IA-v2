// Imports conservés pour maintenir la compatibilité du composant

interface MemoryExamplesSectionProps {
  examples: string[];
  setExamples: (ex: string[]) => void;
}

export function MemoryExamplesSection({}: MemoryExamplesSectionProps) {
  // Les exemples restent actifs pour la détection sémantique mais l'interface est masquée
  // La logique est préservée mais aucun rendu n'est effectué
  
  return null;
} 