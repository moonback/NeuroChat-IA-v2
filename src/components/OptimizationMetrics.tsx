/**
 * 📊 Composant de Métriques d'Optimisation des Modèles IA
 * 
 * Affiche les métriques de performance, cache, retry et optimisations
 * appliquées aux modèles d'IA pour aider à comprendre l'efficacité du système.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Zap, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from './ui/dialog';

interface DeviceCapabilities {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  cpuPower: number;
  memoryMB: number;
  networkSpeed: 'slow' | 'medium' | 'fast' | 'unknown';
  supportsWebWorkers: boolean;
  supportsWebGL: boolean;
  supportsPerformanceAPI: boolean;
  performanceScore: number;
}

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  totalSize: number;
  hitRate: number;
  topEntries: Array<{
    queryHash: string;
    accessCount: number;
    qualityScore: number;
  }>;
  providerDistribution: Record<string, number>;
}

interface RetryStats {
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
  averageRetryTime: number;
  commonErrors: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  providerPerformance: Record<string, {
    attempts: number;
    successes: number;
    averageDelay: number;
  }>;
}

interface OptimizationMetricsProps {
  /** État d'ouverture du composant */
  isOpen?: boolean;
  /** Callback de fermeture */
  onClose?: () => void;
  /** Affichage compact */
  compact?: boolean;
}

export const OptimizationMetrics: React.FC<OptimizationMetricsProps> = ({
  isOpen = true,
  onClose,
  compact = false
}) => {
  const [showFullModal, setShowFullModal] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [retryStats, setRetryStats] = useState<RetryStats | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
      const interval = setInterval(loadMetrics, 10000); // Mise à jour toutes les 10 secondes
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement des métriques depuis les services
      // En réalité, ces données viendraient des services d'optimisation
      const mockDeviceCapabilities: DeviceCapabilities = {
        deviceType: 'desktop',
        cpuPower: 8,
        memoryMB: 8192,
        networkSpeed: 'fast',
        supportsWebWorkers: true,
        supportsWebGL: true,
        supportsPerformanceAPI: true,
        performanceScore: 8.5
      };

      const mockCacheStats: CacheStats = {
        totalEntries: 156,
        expiredEntries: 12,
        totalSize: 2048576, // 2MB
        hitRate: 0.73,
        topEntries: [
          { queryHash: 'abc123', accessCount: 45, qualityScore: 8.2 },
          { queryHash: 'def456', accessCount: 32, qualityScore: 7.8 },
          { queryHash: 'ghi789', accessCount: 28, qualityScore: 8.5 }
        ],
        providerDistribution: {
          gemini: 85,
          openai: 45,
          mistral: 26
        }
      };

      const mockRetryStats: RetryStats = {
        totalAttempts: 234,
        successfulAttempts: 198,
        successRate: 0.846,
        averageRetryTime: 1250,
        commonErrors: [
          { errorType: '429', count: 15, percentage: 0.064 },
          { errorType: 'timeout', count: 8, percentage: 0.034 },
          { errorType: 'network_error', count: 5, percentage: 0.021 }
        ],
        providerPerformance: {
          gemini: { attempts: 120, successes: 105, averageDelay: 800 },
          openai: { attempts: 80, successes: 68, averageDelay: 1200 },
          mistral: { attempts: 34, successes: 25, averageDelay: 1500 }
        }
      };

      setDeviceCapabilities(mockDeviceCapabilities);
      setCacheStats(mockCacheStats);
      setRetryStats(mockRetryStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNetworkIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'medium': return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'slow': return <Wifi className="w-4 h-4 text-red-500" />;
      default: return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!isOpen) return null;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullModal(true)}
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50"
            >
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Optimisations IA
              </span>
              <Badge variant="secondary" className="text-xs">
                {deviceCapabilities?.performanceScore.toFixed(1) || 'N/A'}
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div className="font-medium">Métriques d'Optimisation</div>
              <div className="text-sm space-y-1">
                <div>Score Performance: {deviceCapabilities?.performanceScore.toFixed(1)}/10</div>
                <div>Taux Cache: {((cacheStats?.hitRate ?? 0) * 100).toFixed(1)}%</div>
                <div>Succès Retry: {((retryStats?.successRate ?? 0) * 100).toFixed(1)}%</div>
              </div>
              <div className="text-xs text-muted-foreground">Cliquez pour voir les détails</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Métriques d'Optimisation des Modèles IA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMetrics}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2">Chargement des métriques...</span>
          </div>
        ) : (
          <>
            {/* Capacités de l'Appareil */}
            {deviceCapabilities && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Capacités de l'Appareil
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      {getDeviceIcon(deviceCapabilities.deviceType)}
                      <span className="font-medium">Type d'Appareil</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {deviceCapabilities.deviceType.charAt(0).toUpperCase() + 
                       deviceCapabilities.deviceType.slice(1)}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Puissance CPU</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{deviceCapabilities.cpuPower}/10</div>
                      <Progress value={deviceCapabilities.cpuPower * 10} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <MemoryStick className="w-4 h-4" />
                      <span className="font-medium">Mémoire</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(deviceCapabilities.memoryMB / 1024)}GB
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      {getNetworkIcon(deviceCapabilities.networkSpeed)}
                      <span className="font-medium">Vitesse Réseau</span>
                    </div>
                    <div className="text-xl font-bold capitalize">
                      {deviceCapabilities.networkSpeed}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Score Performance</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{deviceCapabilities.performanceScore.toFixed(1)}/10</div>
                      <Progress value={deviceCapabilities.performanceScore * 10} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistiques du Cache */}
            {cacheStats && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Cache des Réponses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Entrées Total</div>
                    <div className="text-2xl font-bold">{cacheStats.totalEntries}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Taux de Hit</div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{(cacheStats.hitRate * 100).toFixed(1)}%</div>
                      <Progress value={cacheStats.hitRate * 100} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Taille Cache</div>
                    <div className="text-2xl font-bold">{formatBytes(cacheStats.totalSize)}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Expirées</div>
                    <div className="text-2xl font-bold text-orange-600">{cacheStats.expiredEntries}</div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border bg-card">
                  <div className="font-medium mb-3">Répartition par Fournisseur</div>
                  <div className="flex gap-4">
                    {Object.entries(cacheStats.providerDistribution).map(([provider, count]) => (
                      <div key={provider} className="text-center">
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground capitalize">{provider}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Statistiques de Retry */}
            {retryStats && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Stratégies de Retry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Tentatives Total</div>
                    <div className="text-2xl font-bold">{retryStats.totalAttempts}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Taux de Succès</div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        {(retryStats.successRate * 100).toFixed(1)}%
                      </div>
                      <Progress value={retryStats.successRate * 100} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Temps Moyen</div>
                    <div className="text-2xl font-bold">{formatTime(retryStats.averageRetryTime)}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium text-muted-foreground">Succès</div>
                    <div className="text-2xl font-bold text-green-600">{retryStats.successfulAttempts}</div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border bg-card">
                  <div className="font-medium mb-3">Erreurs Communes</div>
                  <div className="space-y-2">
                    {retryStats.commonErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="font-mono text-sm">{error.errorType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {error.count} ({error.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recommandations d'Optimisation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommandations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deviceCapabilities && deviceCapabilities.performanceScore < 6 && (
                  <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        Performance Faible
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Utilisation de modèles légers recommandée pour améliorer les performances.
                    </p>
                  </div>
                )}
                
                {cacheStats && cacheStats.hitRate < 0.5 && (
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Cache Peu Efficace
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Augmentation de la taille du cache recommandée.
                    </p>
                  </div>
                )}
                
                {retryStats && retryStats.successRate < 0.7 && (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800 dark:text-red-200">
                        Taux d'Échec Élevé
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Vérification de la connectivité réseau recommandée.
                    </p>
                  </div>
                )}
                
                {deviceCapabilities && deviceCapabilities.performanceScore >= 8 && (
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Performance Optimale
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Toutes les optimisations sont activées et fonctionnent correctement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    {/* Modal complète des métriques */}
    {showFullModal && (
      <Dialog open={showFullModal} onOpenChange={setShowFullModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Métriques d'Optimisation des Modèles IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Métriques d'Optimisation IA</h3>
              <p className="text-muted-foreground">
                Détection automatique des capacités de l'appareil et optimisation des modèles.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
  </>
  );
};
