import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MemoryFact } from '@/hooks/MemoryContext';
import { learningService } from '@/services/learningService';

interface MemoryAnalyticsProps {
  memory: MemoryFact[];
  onClose: () => void;
}

export const MemoryAnalytics: React.FC<MemoryAnalyticsProps> = ({ memory, onClose }) => {
  const insights = learningService.getInsights();

  // Statistiques de la mémoire
  const memoryStats = {
    totalFacts: memory.length,
    byCategory: memory.reduce((acc, fact) => {
      const category = fact.category || 'non-catégorisé';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recent: memory.filter(fact => {
      const factDate = new Date(fact.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return factDate >= weekAgo;
    }).length
  };

  // Emojis par catégorie
  const categoryEmojis = {
    identité: "👤", localisation: "📍", profession: "💼", préférences: "❤️",
    dates: "📅", relations: "👥", habitudes: "🔄", santé: "🏥",
    loisirs: "🎯", personnalité: "🧠", "non-catégorisé": "💭"
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Analytiques de la Mémoire
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Faits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{memoryStats.totalFacts}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {memoryStats.recent} ajoutés cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Précision IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{insights.accuracyRate}%</div>
                <Progress value={insights.accuracyRate} className="mt-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insights.totalFeedbacks} retours utilisateur
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(memoryStats.byCategory).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Types d'informations détectées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Répartition par catégorie */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Répartition par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(memoryStats.byCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = (count / memoryStats.totalFacts) * 100;
                    const emoji = categoryEmojis[category as keyof typeof categoryEmojis] || "💭";
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <span className="font-medium capitalize">{category}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 flex-1 ml-4">
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Tendances récentes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tendances Récentes (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.recentTrends.length > 0 ? (
                  insights.recentTrends.map((trend, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {categoryEmojis[trend as keyof typeof categoryEmojis] || "💭"}
                      {trend}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucune tendance récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top catégories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Catégories les Plus Fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.topCategories.map((category, index) => (
                  <Badge key={category} variant={index === 0 ? "default" : "secondary"} className="flex items-center gap-1">
                    {categoryEmojis[category as keyof typeof categoryEmojis] || "💭"}
                    {category}
                    {index === 0 && "🏆"}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Faits récents */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Faits Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((fact) => (
                    <div key={fact.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-lg">
                        {categoryEmojis[fact.category as keyof typeof categoryEmojis] || "💭"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {fact.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {fact.category || 'non-catégorisé'}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(fact.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 