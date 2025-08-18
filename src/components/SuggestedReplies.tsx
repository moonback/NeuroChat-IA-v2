import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Send, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  generateSmartSuggestions, 
  getCachedSuggestions, 
  cacheSuggestions,
  type Suggestion,
  type SuggestionContext 
} from '@/services/suggestionService';

interface SuggestedRepliesProps {
  /** Le dernier message du LLM pour générer des suggestions pertinentes */
  lastLlmMessage?: string;
  /** Callback appelé quand l'utilisateur sélectionne une suggestion */
  onSelectSuggestion: (suggestion: string) => void;
  /** Si true, affiche le composant */
  visible: boolean;
  /** Callback pour fermer/masquer les suggestions */
  onClose?: () => void;
  /** Configuration personnalisée */
  maxSuggestions?: number;
  className?: string;
  /** Mode compact pour l'affichage mobile */
  compact?: boolean;
  /** Historique de conversation pour un contexte plus riche */
  conversationHistory?: Array<{ text: string; isUser: boolean }>;
  /** Préférences utilisateur pour personnaliser les suggestions */
  userPreferences?: {
    detailLevel: 'basic' | 'detailed' | 'expert';
    interactionStyle: 'formal' | 'casual' | 'concise';
  };
}

/**
 * Génère des suggestions contextuelles intelligentes en utilisant le service avancé
 */
function generateContextualSuggestions(
  message: string, 
  conversationHistory?: Array<{ text: string; isUser: boolean }>,
  userPreferences?: SuggestionContext['userPreferences'],
  maxSuggestions = 4
): Suggestion[] {
  if (!message || message.trim().length === 0) return [];

  // Vérifier le cache d'abord
  const cached = getCachedSuggestions(message);
  if (cached) {
    return cached.slice(0, maxSuggestions);
  }

  // Créer le contexte pour le service de suggestions
  const context: SuggestionContext = {
    messageContent: message,
    conversationHistory,
    userPreferences
  };

  // Générer les suggestions avec le service avancé
  const suggestions = generateSmartSuggestions(context, maxSuggestions);

  // Mettre en cache pour les futures utilisations
  cacheSuggestions(message, suggestions);

  return suggestions;
}

const categoryColors = {
  question: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  clarification: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  followup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  action: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  appreciation: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
};

const categoryIcons = {
  question: '❓',
  clarification: '💡',
  followup: '🔗',
  action: '⚡',
  appreciation: '💖'
};

export function SuggestedReplies({
  lastLlmMessage,
  onSelectSuggestion,
  visible,
  onClose,
  maxSuggestions = 4,
  className,
  compact = false,
  conversationHistory,
  userPreferences
}: SuggestedRepliesProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Générer les suggestions quand le message change
  useEffect(() => {
    if (visible && lastLlmMessage) {
      const newSuggestions = generateContextualSuggestions(
        lastLlmMessage, 
        conversationHistory, 
        userPreferences, 
        maxSuggestions
      );
      setSuggestions(newSuggestions);
    }
  }, [lastLlmMessage, visible, maxSuggestions, conversationHistory, userPreferences]);

  const handleRefresh = () => {
    if (!lastLlmMessage) return;
    
    setIsRefreshing(true);
    setTimeout(() => {
      const newSuggestions = generateContextualSuggestions(
        lastLlmMessage, 
        conversationHistory, 
        userPreferences, 
        maxSuggestions
      );
      setSuggestions(newSuggestions);
      setIsRefreshing(false);
    }, 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    onSelectSuggestion(suggestion.text);
  };

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      "p-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950",
      "animate-slideInFromBottom",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Suggestions de réponses
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className={cn(
        "grid gap-2",
        compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
        suggestions.length > 4 && "lg:grid-cols-3"
      )}>
        {suggestions.map((suggestion, index) => (
          <Button
            key={suggestion.id}
            variant="outline"
            className={cn(
              "h-auto p-3 text-left justify-start bg-white dark:bg-gray-800",
              "hover:bg-blue-50 dark:hover:bg-blue-900/20",
              "border-gray-200 dark:border-gray-700",
              "transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
              "animate-fadeIn"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleSelect(suggestion)}
          >
            <div className="flex items-start gap-2 w-full">
              <span className="text-xs mt-0.5">
                {categoryIcons[suggestion.category]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                  {suggestion.text}
                </p>
                {!compact && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "mt-1.5 text-xs",
                      categoryColors[suggestion.category]
                    )}
                  >
                    {suggestion.category}
                  </Badge>
                )}
              </div>
              <Send className="h-3 w-3 text-gray-400 dark:text-gray-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Button>
        ))}
      </div>

      {/* Footer Info */}
      {!compact && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Cliquez sur une suggestion pour l'envoyer • {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} disponible{suggestions.length > 1 ? 's' : ''}
        </p>
      )}
    </Card>
  );
}
