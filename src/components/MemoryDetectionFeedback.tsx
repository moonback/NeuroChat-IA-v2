import React from 'react';
import { Brain, CheckCircle, AlertCircle, Info, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type MemoryCategory } from '@/services/memoryService';

interface MemoryDetectionFeedbackProps {
  autoDetectedFacts: Array<{
    content: string;
    category: MemoryCategory;
    confidence: number;
  }>;
  semanticAnalysis: {
    isRelevant: boolean;
    confidence: number;
    suggestedCategory: MemoryCategory;
  };
  recommendations: string[];
  isVisible: boolean;
  onClose?: () => void;
}

export const MemoryDetectionFeedback: React.FC<MemoryDetectionFeedbackProps> = ({
  autoDetectedFacts,
  semanticAnalysis,
  recommendations,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const getCategoryColor = (category: MemoryCategory) => {
    const colors: Record<MemoryCategory, string> = {
      'identité': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'localisation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'préférences': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'professionnel': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'personnel': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'relations': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'habitudes': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'objectifs': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'santé': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'loisirs': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'éducation': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'autre': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors.autre;
  };

  const getStatusIcon = () => {
    if (autoDetectedFacts.length > 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (semanticAnalysis.isRelevant) {
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
    return <Info className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (autoDetectedFacts.length > 0) {
      return `${autoDetectedFacts.length} information(s) détectée(s) automatiquement`;
    }
    if (semanticAnalysis.isRelevant) {
      return `Information potentiellement pertinente (${(semanticAnalysis.confidence * 100).toFixed(1)}%)`;
    }
    return `Information non pertinente (${(semanticAnalysis.confidence * 100).toFixed(1)}%)`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-3 mb-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
          Détection Mémoire
        </span>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Statut principal */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>
        </div>

        {/* Faits détectés automatiquement */}
        {autoDetectedFacts.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-green-700 dark:text-green-300">
              Informations extraites :
            </div>
            {autoDetectedFacts.map((fact, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded p-2">
                <Badge className={getCategoryColor(fact.category)}>
                  {fact.category}
                </Badge>
                <span className="text-sm flex-1">{fact.content}</span>
                <span className="text-xs text-muted-foreground">
                  {(fact.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Analyse sémantique */}
        {autoDetectedFacts.length === 0 && semanticAnalysis.isRelevant && (
          <div className="bg-white dark:bg-slate-800 rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Analyse sémantique
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(semanticAnalysis.suggestedCategory)}>
                {semanticAnalysis.suggestedCategory}
              </Badge>
              <span className="text-sm">Catégorie suggérée</span>
            </div>
          </div>
        )}

        {/* Recommandations */}
        {recommendations.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Recommandations :
            </div>
            <div className="space-y-1">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 rounded px-2 py-1">
                  • {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 