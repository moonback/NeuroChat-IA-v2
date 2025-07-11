import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, X, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { SmartSuggestion, smartSuggestionsService } from '@/services/smartSuggestions';
import { MemoryFact } from '@/hooks/MemoryContext';

interface SmartSuggestionsProps {
  conversationHistory: string[];
  memory: MemoryFact[];
  onAddSuggestion: (suggestion: SmartSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
  visible: boolean;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  conversationHistory,
  memory,
  onAddSuggestion,
  onDismiss,
  visible
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<{
    missingCategories: string[];
    suggestions: SmartSuggestion[];
  }>({ missingCategories: [], suggestions: [] });
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);

  // Emojis par catégorie
  const categoryEmojis = {
    identité: "👤", localisation: "📍", profession: "💼", préférences: "❤️",
    dates: "📅", relations: "👥", habitudes: "🔄", santé: "🏥",
    loisirs: "🎯", voyages: "✈️", personnalité: "🧠"
  };

  // Générer les suggestions
  useEffect(() => {
    if (conversationHistory.length > 0) {
      const newSuggestions = smartSuggestionsService.generateSuggestions(
        conversationHistory.slice(-5), // 5 derniers messages
        memory,
        3
      );
      setSuggestions(newSuggestions);

      // Analyser les lacunes
      const analysis = smartSuggestionsService.analyzeMemoryGaps(memory);
      setGapAnalysis(analysis);
    }
  }, [conversationHistory, memory]);

  const handleAddSuggestion = (suggestion: SmartSuggestion) => {
    onAddSuggestion(suggestion);
    smartSuggestionsService.markSuggestionUsed(suggestion.id);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleDismiss = (suggestionId: string) => {
    onDismiss(suggestionId);
    smartSuggestionsService.markSuggestionUsed(suggestionId);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  if (!visible || (suggestions.length === 0 && gapAnalysis.suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-sm">
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Suggestions Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Suggestions contextuelles */}
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">
                  {categoryEmojis[suggestion.category as keyof typeof categoryEmojis] || "💭"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {suggestion.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleAddSuggestion(suggestion)}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(suggestion.id)}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <X className="w-3 h-3" />
                  Ignorer
                </Button>
              </div>
            </div>
          ))}

          {/* Analyse des lacunes */}
          {gapAnalysis.missingCategories.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGapAnalysis(!showGapAnalysis)}
                className="w-full flex items-center gap-2 text-xs"
              >
                <TrendingUp className="w-4 h-4" />
                Analyse des lacunes
                {showGapAnalysis ? "−" : "+"}
              </Button>
              
              {showGapAnalysis && (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {gapAnalysis.missingCategories.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {categoryEmojis[category as keyof typeof categoryEmojis] || "💭"}
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  {gapAnalysis.suggestions.slice(0, 2).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            {suggestion.question}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              onClick={() => handleAddSuggestion(suggestion)}
                              className="text-xs h-6"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistiques */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Brain className="w-4 h-4" />
              <span>
                {memory.length} faits • {gapAnalysis.missingCategories.length} catégories manquantes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 