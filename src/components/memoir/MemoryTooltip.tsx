import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Tag, TrendingUp, Eye, Info } from "lucide-react";
import { type MemoryFact } from './types';
import { MemoryCategoryIndicator } from './MemoryCategoryIndicator';

interface MemoryTooltipProps {
  fact: MemoryFact;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showDetails?: boolean;
}

export function MemoryTooltip({ 
  fact, 
  children, 
  side = 'top',
  showDetails = true 
}: MemoryTooltipProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Non définie';
    const percentage = Math.round(confidence * 100);
    if (percentage >= 90) return `Très élevée (${percentage}%)`;
    if (percentage >= 70) return `Élevée (${percentage}%)`;
    if (percentage >= 50) return `Moyenne (${percentage}%)`;
    return `Faible (${percentage}%)`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-80 p-0">
          <div className="p-4 space-y-3">
            {/* Contenu principal */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                {fact.content}
              </p>
            </div>

            {showDetails && (
              <>
                <Separator />
                
                {/* Catégorie et importance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {fact.category && (
                      <MemoryCategoryIndicator 
                        category={fact.category}
                        importance={fact.importance}
                        confidence={fact.confidence}
                        size="sm"
                      />
                    )}
                    {fact.importance && !fact.category && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getImportanceColor(fact.importance)}`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {fact.importance === 'high' ? 'Élevée' : 
                         fact.importance === 'medium' ? 'Moyenne' : 'Faible'}
                      </Badge>
                    )}
                  </div>
                  
                  {fact.confidence !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {getConfidenceLabel(fact.confidence)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {fact.tags && fact.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {fact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Informations temporelles */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Créé le {formatDate(fact.date)}</span>
                  </div>
                  
                  {fact.lastUpdated && fact.lastUpdated !== fact.date && (
                    <div className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <span>Modifié le {formatDate(fact.lastUpdated)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Composant simplifié pour les cas où on veut juste afficher le contenu
interface QuickMemoryTooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function QuickMemoryTooltip({ 
  content, 
  children, 
  side = 'top' 
}: QuickMemoryTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-60">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 