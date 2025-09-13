import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Database,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Eye,
  EyeOff,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Key,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { monitoringService, subscribeToMonitoring } from '@/services/monitoringService';

interface MonitoringDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonitoringDashboard({ isOpen, onClose }: MonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Démarrer le monitoring
    monitoringService.start();

    // S'abonner aux mises à jour
    const unsubscribe = subscribeToMonitoring((data) => {
      setMetrics(data);
    });

    // Collecter les métriques initiales
    const initialData = monitoringService.exportData();
    setMetrics(initialData);

    return () => {
      unsubscribe();
      monitoringService.stop();
    };
  }, [isOpen]);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const data = monitoringService.exportData();
      setMetrics(data);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportData = () => {
    const data = monitoringService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurochat-monitoring-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 dark:text-green-400';
    if (value >= thresholds.warning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Dashboard de Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showDetails ? 'Masquer' : 'Détails'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(autoRefresh && 'bg-green-50 dark:bg-green-950/20')}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
                Auto-refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMetrics}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="errors">Erreurs</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Statut général */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Statut</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {metrics?.metrics?.security?.successRate > 95 ? '🔐 Excellent' : '⚠️ Attention'}
                        </p>
                      </div>
                      <Shield className="w-8 h-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Performance */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Performance</p>
                        <p className="text-2xl font-bold">
                          {metrics?.metrics?.performance?.cacheHitRate?.toFixed(1) || 0}%
                        </p>
                        <Progress 
                          value={metrics?.metrics?.performance?.cacheHitRate || 0} 
                          className="mt-2"
                        />
                      </div>
                      <Zap className="w-8 h-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Mémoire */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mémoire</p>
                        <p className="text-2xl font-bold">
                          {metrics?.metrics?.performance?.memoryInfo?.used || 0}MB
                        </p>
                        <Progress 
                          value={metrics?.metrics?.performance?.memoryInfo?.usage || 0} 
                          className="mt-2"
                        />
                      </div>
                      <Database className="w-8 h-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Erreurs */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Erreurs</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {metrics?.metrics?.errors?.recentErrors || 0}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques de tendances */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métriques de Sécurité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de succès</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(metrics?.metrics?.security?.successRate || 0, { good: 95, warning: 80 })}
                          <span className="font-mono">{(metrics?.metrics?.security?.successRate || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Échecs de déchiffrement</span>
                        <span className="font-mono text-red-600">{metrics?.metrics?.security?.failedDecryptions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Temps moyen chiffrement</span>
                        <span className="font-mono">{(metrics?.metrics?.security?.averageEncryptionTime || 0).toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Temps moyen déchiffrement</span>
                        <span className="font-mono">{(metrics?.metrics?.security?.averageDecryptionTime || 0).toFixed(1)}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métriques de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de cache</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(metrics?.metrics?.performance?.cacheHitRate || 0, { good: 80, warning: 60 })}
                          <span className="font-mono">{(metrics?.metrics?.performance?.cacheHitRate || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Temps de rendu moyen</span>
                        <span className="font-mono">{(metrics?.metrics?.performance?.averageRenderTime || 0).toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utilisation mémoire</span>
                        <span className="font-mono">{(metrics?.metrics?.performance?.averageMemoryUsage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux d'erreur</span>
                        <span className="font-mono text-red-600">{(metrics?.metrics?.errors?.errorRate || 0).toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Chiffrement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Événements récents</span>
                      <span className="font-mono">{metrics?.metrics?.security?.recentEvents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total événements</span>
                      <span className="font-mono">{metrics?.metrics?.security?.totalEvents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de succès</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metrics?.metrics?.security?.successRate || 0, { good: 95, warning: 80 })}
                        <span className="font-mono">{(metrics?.metrics?.security?.successRate || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Chiffrement moyen</span>
                      <span className="font-mono">{(metrics?.metrics?.security?.averageEncryptionTime || 0).toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Déchiffrement moyen</span>
                      <span className="font-mono">{(metrics?.metrics?.security?.averageDecryptionTime || 0).toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Échecs récents</span>
                      <span className="font-mono text-red-600">{metrics?.metrics?.security?.failedDecryptions || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Dernière mise à jour</span>
                      <span className="text-xs text-slate-500">
                        {metrics?.timestamp ? new Date(metrics.timestamp).toLocaleTimeString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut</span>
                      <Badge variant={metrics?.metrics?.security?.successRate > 95 ? "default" : "destructive"}>
                        {metrics?.metrics?.security?.successRate > 95 ? "Sain" : "Problème"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Mémoire
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Utilisée</span>
                      <span className="font-mono">{metrics?.metrics?.performance?.memoryInfo?.used || 0}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Totale</span>
                      <span className="font-mono">{metrics?.metrics?.performance?.memoryInfo?.total || 0}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limite</span>
                      <span className="font-mono">{metrics?.metrics?.performance?.memoryInfo?.limit || 0}MB</span>
                    </div>
                    <Progress 
                      value={metrics?.metrics?.performance?.memoryInfo?.usage || 0} 
                      className="mt-2"
                    />
                    <div className="text-xs text-slate-500">
                      {(metrics?.metrics?.performance?.memoryInfo?.usage || 0).toFixed(1)}% utilisée
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Cache
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Taux de cache</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metrics?.metrics?.performance?.cacheHitRate || 0, { good: 80, warning: 60 })}
                        <span className="font-mono">{(metrics?.metrics?.performance?.cacheHitRate || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Événements récents</span>
                      <span className="font-mono">{metrics?.metrics?.performance?.recentEvents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total événements</span>
                      <span className="font-mono">{metrics?.metrics?.performance?.totalEvents || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Rendu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Temps moyen</span>
                      <span className="font-mono">{(metrics?.metrics?.performance?.averageRenderTime || 0).toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilisation mémoire</span>
                      <span className="font-mono">{(metrics?.metrics?.performance?.averageMemoryUsage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance</span>
                      <Badge variant={metrics?.metrics?.performance?.cacheHitRate > 80 ? "default" : "destructive"}>
                        {metrics?.metrics?.performance?.cacheHitRate > 80 ? "Bonne" : "Faible"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              <div className="space-y-3">
                {metrics?.metrics?.errors?.recentErrors === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <p className="text-slate-500">Aucune erreur récente</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Erreurs Critiques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                          {metrics?.metrics?.errors?.criticalErrors || 0}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Dernière heure</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Erreurs Élevées
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                          {metrics?.metrics?.errors?.highErrors || 0}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Dernière heure</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          Taux d'Erreur
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {(metrics?.metrics?.errors?.errorRate || 0).toFixed(2)}%
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Par minute</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="text-center py-8">
                <Clock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">Historique des métriques</p>
                <p className="text-sm text-slate-400 mt-2">
                  {metrics?.history ? 
                    `${Object.keys(metrics.history).reduce((total, key) => total + metrics.history[key].length, 0)} événements enregistrés` :
                    'Aucun historique disponible'
                  }
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
