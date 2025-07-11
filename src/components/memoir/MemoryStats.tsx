import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Calendar, 
  Tag, 
  Target, 
  BarChart3, 
  Clock, 
  Zap,
  Award,
  Activity
} from "lucide-react";
import { type MemoryFact, MEMORY_CATEGORIES } from './types';
import { MemoryCategoryIndicator } from './MemoryCategoryIndicator';

interface MemoryStatsProps {
  facts: MemoryFact[];
  className?: string;
}

export function MemoryStats({ facts, className }: MemoryStatsProps) {
  const stats = useMemo(() => {
    const total = facts.length;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Statistiques temporelles
    const recentFacts = facts.filter(fact => new Date(fact.date) > oneWeekAgo).length;
    const monthlyFacts = facts.filter(fact => new Date(fact.date) > oneMonthAgo).length;

    // Statistiques par catégorie
    const byCategory = facts.reduce((acc, fact) => {
      if (fact.category) {
        acc[fact.category] = (acc[fact.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Statistiques par importance
    const byImportance = facts.reduce((acc, fact) => {
      const importance = fact.importance || 'low';
      acc[importance] = (acc[importance] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    // Statistiques de qualité
    const withCategory = facts.filter(fact => fact.category).length;
    const withTags = facts.filter(fact => fact.tags && fact.tags.length > 0).length;
    const withHighConfidence = facts.filter(fact => fact.confidence && fact.confidence > 0.8).length;

    // Taux de croissance
    const growthRate = recentFacts > 0 ? ((recentFacts / 7) * 30) : 0;

    // Catégories les plus populaires
    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoryId, count]) => ({
        category: MEMORY_CATEGORIES.find(cat => cat.id === categoryId),
        count,
        percentage: (count / total) * 100
      }))
      .filter(item => item.category);

    // Score de qualité global
    const qualityScore = Math.round(
      ((withCategory / total) * 0.4 + 
       (withTags / total) * 0.3 + 
       (withHighConfidence / total) * 0.3) * 100
    );

    return {
      total,
      recentFacts,
      monthlyFacts,
      byCategory,
      byImportance,
      withCategory,
      withTags,
      withHighConfidence,
      growthRate,
      topCategories,
      qualityScore
    };
  }, [facts]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend,
    color = "default"
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: 'up' | 'down' | 'stable';
    color?: 'default' | 'success' | 'warning' | 'error';
  }) => {
    const colorClasses = {
      default: "text-gray-600 dark:text-gray-300",
      success: "text-green-600 dark:text-green-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      error: "text-red-600 dark:text-red-400"
    };

    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total des faits"
          value={stats.total}
          icon={BarChart3}
          description={`${stats.recentFacts} ajoutés cette semaine`}
          trend={stats.recentFacts > 0 ? 'up' : 'stable'}
        />
        
        <StatCard
          title="Activité récente"
          value={stats.recentFacts}
          icon={Activity}
          description="Nouveaux faits (7 derniers jours)"
          color={stats.recentFacts > 3 ? 'success' : stats.recentFacts > 0 ? 'warning' : 'default'}
        />
        
        <StatCard
          title="Score de qualité"
          value={`${stats.qualityScore}%`}
          icon={Award}
          description="Basé sur la complétude des données"
          color={stats.qualityScore > 80 ? 'success' : stats.qualityScore > 60 ? 'warning' : 'error'}
        />
        
        <StatCard
          title="Croissance estimée"
          value={`${Math.round(stats.growthRate)}/mois`}
          icon={TrendingUp}
          description="Basé sur l'activité récente"
          trend={stats.growthRate > 10 ? 'up' : 'stable'}
        />
      </div>

      {/* Détails par catégorie */}
      {stats.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Répartition par catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCategories.map(({ category, count, percentage }) => (
                <div key={category?.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MemoryCategoryIndicator 
                      category={category?.id}
                      showText={true}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="text-right min-w-16">
                      <Badge variant="outline" className="text-xs">
                        {count} ({Math.round(percentage)}%)
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Importance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Par importance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Élevée</span>
                <Badge variant="destructive" className="text-xs">
                  {stats.byImportance.high}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Moyenne</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.byImportance.medium}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Faible</span>
                <Badge variant="outline" className="text-xs">
                  {stats.byImportance.low}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualité des données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Qualité des données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avec catégorie</span>
                <Badge className="text-xs">
                  {stats.withCategory} ({Math.round((stats.withCategory / stats.total) * 100)}%)
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avec tags</span>
                <Badge variant="outline" className="text-xs">
                  {stats.withTags} ({Math.round((stats.withTags / stats.total) * 100)}%)
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Haute confiance</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.withHighConfidence} ({Math.round((stats.withHighConfidence / stats.total) * 100)}%)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendances temporelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activité temporelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.recentFacts}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Cette semaine
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.monthlyFacts}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ce mois-ci
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(stats.growthRate)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Prévision/mois
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 