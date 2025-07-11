import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  CheckCircle,
  Clock,
  Brain,
  Eye,
  ArrowRight
} from 'lucide-react';
import { DeepResearchResult, DeepResearchSubQuestion, DeepResearchInsight } from '../types/deepResearch';

interface DeepResearchCardProps {
  result: DeepResearchResult;
  onStopResearch?: (resultId: string) => void;
  onRestartResearch?: (query: string) => void;
}

export function DeepResearchCard({ result, onStopResearch, onRestartResearch }: DeepResearchCardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'researching': return 'text-blue-600 dark:text-blue-400';
      case 'analyzing': return 'text-yellow-600 dark:text-yellow-400';
      case 'synthesizing': return 'text-purple-600 dark:text-purple-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'researching': return <Search className="w-4 h-4" />;
      case 'analyzing': return <Brain className="w-4 h-4" />;
      case 'synthesizing': return <Target className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'opportunity': return <Target className="w-4 h-4" />;
      case 'risk': return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Recherche Approfondie
              </CardTitle>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {result.originalQuery}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${getStatusColor(result.status)}`}>
              {getStatusIcon(result.status)}
              <span className="text-sm font-medium">
                {result.status === 'completed' ? 'Terminée' : 
                 result.status === 'researching' ? 'En cours' : 
                 result.status === 'analyzing' ? 'Analyse' : 
                 result.status === 'synthesizing' ? 'Synthèse' : 
                 result.status === 'error' ? 'Erreur' : 'En attente'}
              </span>
            </div>
            {result.status !== 'completed' && result.status !== 'error' && onStopResearch && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onStopResearch(result.id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Arrêter
              </Button>
            )}
          </div>
        </div>
        
        {result.status !== 'completed' && result.status !== 'error' && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progression</span>
              <span>{result.progress}%</span>
            </div>
            <Progress value={result.progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="research">Recherche</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {result.executiveSummary && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📊 Résumé Exécutif
                </h4>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  {result.executiveSummary}
                </p>
              </div>
            )}

            {result.keyFindings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🎯 Conclusions Clés
                </h4>
                <div className="space-y-2">
                  {result.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sources utilisées</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {[...new Set(result.sourcesUsed)].length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Confiance</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(result.confidenceScore * 100)}%
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Catégories</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {result.categories.length}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {result.categories.map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                📋 Sous-questions explorées
              </h4>
              {result.subQuestions.map((subQuestion, index) => (
                <Collapsible key={subQuestion.id}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          subQuestion.status === 'completed' ? 'bg-green-500' :
                          subQuestion.status === 'researching' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-left">
                          {subQuestion.question}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {subQuestion.priority}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="pl-6 pr-3 pb-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Catégorie: {subQuestion.category}
                        </div>
                        {subQuestion.findings && (
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            {subQuestion.findings}
                          </div>
                        )}
                        {subQuestion.sources && subQuestion.sources.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Sources:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {subQuestion.sources.map((source, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            {result.perspectives.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  👁️ Perspectives Analysées
                </h4>
                <div className="space-y-3">
                  {result.perspectives.map((perspective, index) => (
                    <div key={perspective.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {perspective.title}
                        </h5>
                        <Badge variant="outline">
                          {Math.round(perspective.credibilityScore * 100)}% fiable
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {perspective.description}
                      </p>
                      <div className="space-y-1">
                        {perspective.arguments.map((arg, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {arg}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {result.insights.length > 0 ? (
              <div className="space-y-3">
                {result.insights.map((insight, index) => (
                  <div key={insight.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {insight.title}
                          </h5>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(insight.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {insight.description}
                        </p>
                        {insight.supportingEvidence.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Preuves à l'appui:
                            </div>
                            <div className="space-y-1">
                              {insight.supportingEvidence.map((evidence, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {evidence}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun insight généré pour le moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {result.nextSteps.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  📋 Prochaines Étapes
                </h4>
                <div className="space-y-2">
                  {result.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Target className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.relatedTopics.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🔗 Sujets Connexes à Explorer
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.relatedTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onRestartResearch?.(topic)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-950"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {result.status === 'completed' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      Recherche terminée avec succès
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Confiance globale: {Math.round(result.confidenceScore * 100)}% • 
                      Sources: {[...new Set(result.sourcesUsed)].length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 