import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Heart, 
  Shield, 
  Star, 
  Smartphone, 
  Target,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { MEMORY_CATEGORIES, type MemoryFact } from './types';
import { cn } from "@/lib/utils";

interface MemoryCategoryIndicatorProps {
  category?: string;
  importance?: 'low' | 'medium' | 'high';
  confidence?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Mapping des icônes
const ICON_MAP = {
  User,
  MapPin,
  Briefcase,
  Heart,
  Shield,
  Star,
  Smartphone,
  Target
};

// Mapping des couleurs Tailwind
const COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300',
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300'
};

const IMPORTANCE_CONFIG = {
  low: { icon: Clock, color: 'text-gray-400', label: 'Faible' },
  medium: { icon: AlertCircle, color: 'text-yellow-500', label: 'Moyenne' },
  high: { icon: CheckCircle2, color: 'text-red-500', label: 'Élevée' }
};

export function MemoryCategoryIndicator({ 
  category, 
  importance, 
  confidence, 
  showText = true, 
  size = 'md' 
}: MemoryCategoryIndicatorProps) {
  const categoryData = useMemo(() => {
    if (!category) return null;
    return MEMORY_CATEGORIES.find(cat => cat.id === category);
  }, [category]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          badge: 'h-6 px-2 text-xs',
          icon: 'w-3 h-3',
          gap: 'gap-1'
        };
      case 'lg':
        return {
          badge: 'h-8 px-3 text-sm',
          icon: 'w-5 h-5',
          gap: 'gap-2'
        };
      default:
        return {
          badge: 'h-7 px-2.5 text-xs',
          icon: 'w-4 h-4',
          gap: 'gap-1.5'
        };
    }
  }, [size]);

  if (!categoryData) {
    return null;
  }

  const IconComponent = ICON_MAP[categoryData.icon as keyof typeof ICON_MAP];
  const colorClasses = COLOR_MAP[categoryData.color as keyof typeof COLOR_MAP];
  const ImportanceIcon = importance ? IMPORTANCE_CONFIG[importance].icon : null;

  return (
    <div className={cn("flex items-center", sizeClasses.gap)}>
      {/* Badge principal de catégorie */}
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center border transition-colors",
          sizeClasses.badge,
          sizeClasses.gap,
          colorClasses
        )}
      >
        {IconComponent && (
          <IconComponent className={sizeClasses.icon} />
        )}
        {showText && (
          <span className="font-medium">{categoryData.name}</span>
        )}
      </Badge>

      {/* Indicateur d'importance */}
      {importance && ImportanceIcon && (
        <div 
          className="flex items-center"
          title={`Importance ${IMPORTANCE_CONFIG[importance].label.toLowerCase()}`}
        >
          <ImportanceIcon 
            className={cn(
              sizeClasses.icon,
              IMPORTANCE_CONFIG[importance].color
            )} 
          />
        </div>
      )}

      {/* Indicateur de confiance */}
      {confidence !== undefined && (
        <div 
          className="flex items-center"
          title={`Confiance: ${Math.round(confidence * 100)}%`}
        >
          <div className={cn(
            "rounded-full",
            size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5',
            confidence > 0.8 ? 'bg-green-500' :
            confidence > 0.6 ? 'bg-yellow-500' :
            confidence > 0.4 ? 'bg-orange-500' : 'bg-red-500'
          )} />
        </div>
      )}
    </div>
  );
}

// Composant pour afficher un résumé des catégories
interface MemoryCategorySummaryProps {
  facts: MemoryFact[];
  maxVisible?: number;
}

export function MemoryCategorySummary({ facts, maxVisible = 6 }: MemoryCategorySummaryProps) {
  const categoryCounts = useMemo(() => {
    const counts: { [categoryId: string]: number } = {};
    
    facts.forEach(fact => {
      if (fact.category) {
        counts[fact.category] = (counts[fact.category] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([categoryId, count]) => ({
        category: MEMORY_CATEGORIES.find(cat => cat.id === categoryId),
        count
      }))
      .filter(item => item.category)
      .sort((a, b) => b.count - a.count)
      .slice(0, maxVisible);
  }, [facts, maxVisible]);

  if (categoryCounts.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune catégorie détectée</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Catégories détectées ({facts.length} faits)
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {categoryCounts.map(({ category, count }) => {
          if (!category) return null;
          
          const IconComponent = ICON_MAP[category.icon as keyof typeof ICON_MAP];
          const colorClasses = COLOR_MAP[category.color as keyof typeof COLOR_MAP];

          return (
            <div
              key={category.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg border",
                colorClasses
              )}
            >
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
} 