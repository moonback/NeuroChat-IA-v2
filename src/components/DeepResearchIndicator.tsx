import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Brain, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { DeepResearchResult } from '../types/deepResearch';

interface DeepResearchIndicatorProps {
  result: DeepResearchResult;
  onStop?: () => void;
  compact?: boolean;
}

export function DeepResearchIndicator({ result, onStop, compact = false }: DeepResearchIndicatorProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'analyzing':
        return <Brain className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'researching':
        return <Search className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'synthesizing':
        return <Target className="w-4 h-4 text-purple-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (result.status) {
      case 'analyzing':
        return 'Analyse de la question...';
      case 'researching':
        return 'Recherche en cours...';
      case 'synthesizing':
        return 'Synthèse des résultats...';
      case 'completed':
        return 'Recherche terminée';
      case 'error':
        return 'Erreur lors de la recherche';
      default:
        return 'En préparation...';
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'analyzing':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'researching':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'synthesizing':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const getCurrentStep = () => {
    if (result.status === 'analyzing') return 'Décomposition de la question';
    if (result.status === 'researching') {
      const completedSQ = result.subQuestions.filter(sq => sq.status === 'completed').length;
      const totalSQ = result.subQuestions.length;
      return `Recherche (${completedSQ}/${totalSQ} sous-questions)`;
    }
    if (result.status === 'synthesizing') return 'Synthèse et analyse';
    if (result.status === 'completed') return 'Recherche terminée';
    return 'Préparation...';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
        {getStatusIcon()}
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {getStatusText()}
        </span>
        <Badge variant="outline" className="text-xs">
          {result.progress}%
        </Badge>
        {onStop && result.status !== 'completed' && result.status !== 'error' && (
          <Button size="sm" variant="ghost" onClick={onStop} className="p-1 h-auto">
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-full">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Recherche Approfondie
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.originalQuery}
                </p>
              </div>
            </div>
            {onStop && result.status !== 'completed' && result.status !== 'error' && (
              <Button size="sm" variant="outline" onClick={onStop}>
                <X className="w-4 h-4 mr-1" />
                Arrêter
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getCurrentStep()}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {result.progress}%
              </span>
            </div>
            
            {result.status !== 'completed' && result.status !== 'error' && (
              <Progress value={result.progress} className="h-2" />
            )}
          </div>

          {result.subQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Sous-questions explorées:
              </div>
              <div className="space-y-1">
                {result.subQuestions.map((sq, index) => (
                  <div key={sq.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      sq.status === 'completed' ? 'bg-green-500' :
                      sq.status === 'researching' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {sq.question}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.status === 'completed' && (
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    Recherche terminée avec succès
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    {result.keyFindings.length} conclusions • {result.insights.length} insights • 
                    Confiance: {Math.round(result.confidenceScore * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.status === 'error' && (
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <div>
                  <div className="text-sm font-medium text-red-900 dark:text-red-100">
                    Erreur lors de la recherche
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    Veuillez réessayer ou reformuler votre question
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 