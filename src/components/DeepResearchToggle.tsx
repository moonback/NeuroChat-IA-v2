import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Settings, 
  Brain, 
  Target,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { DeepResearchConfig } from '../types/deepResearch';

interface DeepResearchToggleProps {
  config: DeepResearchConfig;
  onConfigChange: (config: DeepResearchConfig) => void;
  disabled?: boolean;
}

export function DeepResearchToggle({ config, onConfigChange, disabled = false }: DeepResearchToggleProps) {
  const [showConfig, setShowConfig] = useState(false);

  const handleToggle = (enabled: boolean) => {
    onConfigChange({ ...config, enabled });
  };

  const handleConfigChange = (key: keyof DeepResearchConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const getSynthesisLevelDescription = (level: string) => {
    switch (level) {
      case 'basic':
        return 'Analyse rapide avec conclusions essentielles';
      case 'detailed':
        return 'Analyse approfondie avec perspectives multiples';
      case 'comprehensive':
        return 'Analyse exhaustive avec insights stratégiques';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Switch
          id="deep-research-mode"
          checked={config.enabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
        <Label htmlFor="deep-research-mode" className="text-sm font-medium">
          Mode Deep Research
        </Label>
        {config.enabled && (
          <Badge variant="secondary" className="text-xs">
            Activé
          </Badge>
        )}
      </div>

      {config.enabled && (
        <Popover open={showConfig} onOpenChange={setShowConfig}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <h4 className="font-medium">Configuration Deep Research</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Personnalisez le comportement de la recherche approfondie
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-sub-questions" className="text-sm">
                      Nombre de sous-questions
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {config.maxSubQuestions}
                    </span>
                  </div>
                  <Slider
                    id="max-sub-questions"
                    min={3}
                    max={10}
                    step={1}
                    value={[config.maxSubQuestions]}
                    onValueChange={(value) => handleConfigChange('maxSubQuestions', value[0])}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Plus de questions = analyse plus complète mais plus lente
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-sources" className="text-sm">
                      Sources maximum
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {config.maxSources}
                    </span>
                  </div>
                  <Slider
                    id="max-sources"
                    min={5}
                    max={20}
                    step={1}
                    value={[config.maxSources]}
                    onValueChange={(value) => handleConfigChange('maxSources', value[0])}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="synthesis-level" className="text-sm">
                    Niveau de synthèse
                  </Label>
                  <Select
                    value={config.synthesisLevel}
                    onValueChange={(value) => handleConfigChange('synthesisLevel', value)}
                  >
                    <SelectTrigger id="synthesis-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        <div className="flex flex-col">
                          <span>Basique</span>
                          <span className="text-xs text-muted-foreground">
                            Rapide, conclusions essentielles
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="detailed">
                        <div className="flex flex-col">
                          <span>Détaillé</span>
                          <span className="text-xs text-muted-foreground">
                            Équilibré, perspectives multiples
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="comprehensive">
                        <div className="flex flex-col">
                          <span>Complet</span>
                          <span className="text-xs text-muted-foreground">
                            Exhaustif, insights stratégiques
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getSynthesisLevelDescription(config.synthesisLevel)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Options avancées</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Analyses multiples perspectives</span>
                      </div>
                      <Switch
                        checked={config.includePerspectives}
                        onCheckedChange={(value) => handleConfigChange('includePerspectives', value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Analyse différents points de vue sur le sujet
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Recherche Web</span>
                        <Badge variant="outline" className="text-xs">
                          Bientôt
                        </Badge>
                      </div>
                      <Switch
                        checked={config.includeWebSearch}
                        onCheckedChange={(value) => handleConfigChange('includeWebSearch', value)}
                        disabled={true}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Recherche sur Internet pour des informations à jour
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <HelpCircle className="w-3 h-3" />
                  <span>
                    Le mode Deep Research analyse votre question en profondeur pour des réponses complètes
                  </span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// Composant compact pour la barre d'outils
export function DeepResearchCompactToggle({ config, onConfigChange, disabled = false }: DeepResearchToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <Switch
        id="deep-research-compact"
        checked={config.enabled}
        onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })}
        disabled={disabled}
      />
      <Label htmlFor="deep-research-compact" className="text-xs">
        Deep Research
      </Label>
    </div>
  );
}

// Hook pour détecter si une question nécessite le Deep Research
export function useDeepResearchSuggestion(query: string) {
  const [shouldSuggest, setShouldSuggest] = useState(false);

  React.useEffect(() => {
    if (!query || query.length < 20) {
      setShouldSuggest(false);
      return;
    }

    const deepResearchKeywords = [
      'analyser', 'étudier', 'explorer', 'comparer', 'évaluer',
      'recherche', 'investigation', 'analyse', 'synthèse',
      'perspectives', 'avantages', 'inconvénients', 'stratégie',
      'tendances', 'opportunités', 'risques', 'recommandations',
      'comment', 'pourquoi', 'quelles sont', 'quels sont',
      'différences', 'similitudes', 'impact', 'conséquences'
    ];

    const queryLower = query.toLowerCase();
    const hasKeywords = deepResearchKeywords.some(keyword => queryLower.includes(keyword));
    const isLongQuery = query.length > 50;
    const hasQuestionWords = /\b(comment|pourquoi|quand|où|qui|quoi|quel|quelle)\b/i.test(query);

    setShouldSuggest(hasKeywords || isLongQuery || hasQuestionWords);
  }, [query]);

  return shouldSuggest;
}

// Composant de suggestion pour activer le Deep Research
export function DeepResearchSuggestion({ 
  onActivate, 
  onDismiss,
  query 
}: { 
  onActivate: () => void;
  onDismiss: () => void;
  query: string;
}) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
      <div className="flex items-start gap-3">
        <div className="bg-blue-500 p-1.5 rounded-full">
          <Search className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Question complexe détectée
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Cette question pourrait bénéficier d'une analyse approfondie avec le mode Deep Research
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onActivate}
            className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-700"
          >
            Activer
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onDismiss}
            className="text-blue-600 hover:bg-blue-100 dark:text-blue-400"
          >
            Ignorer
          </Button>
        </div>
      </div>
    </div>
  );
} 