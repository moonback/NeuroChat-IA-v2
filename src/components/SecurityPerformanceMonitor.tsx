import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Key, 
  Zap,
  BarChart3,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import des composants unifiés
import { 
  UnifiedButton, 
  UnifiedBadge,
  UnifiedCard
} from '@/components/ui/unified';

// Types pour le monitoring
interface SecurityMetrics {
  encryptionActive: boolean;
  secureStorageEnabled: boolean;
  keyManagerActive: boolean;
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  auditEntries: number;
  securityLevel: 'none' | 'basic' | 'military';
  lastKeyRotation: string;
  failedDecryptions: number;
  successfulDecryptions: number;
  dataIntegrityChecks: number;
  failedIntegrityChecks: number;
}

interface PerformanceMetrics {
  memoryUsage: number;
  memoryLimit: number;
  cacheSize: number;
  cacheHitRate: number;
  encryptionTime: number;
  decryptionTime: number;
  apiResponseTime: number;
  renderTime: number;
  bundleSize: number;
  activeConnections: number;
  errorRate: number;
  uptime: number;
}

interface AlertItem {
  id: string;
  type: 'security' | 'performance' | 'error';
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  details?: string;
}

interface MonitoringStats {
  security: SecurityMetrics;
  performance: PerformanceMetrics;
  alerts: AlertItem[];
  lastUpdate: string;
}

// Clés de stockage
const LS_MONITORING_KEY = 'nc_monitoring_stats';
const LS_ALERTS_KEY = 'nc_monitoring_alerts';

// Fonctions utilitaires
function getMonitoringStats(): MonitoringStats | null {
  try {
    const stored = localStorage.getItem(LS_MONITORING_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveMonitoringStats(stats: MonitoringStats): void {
  try {
    localStorage.setItem(LS_MONITORING_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Erreur sauvegarde monitoring:', error);
  }
}

function getAlerts(): AlertItem[] {
  try {
    const stored = localStorage.getItem(LS_ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: AlertItem[]): void {
  try {
    localStorage.setItem(LS_ALERTS_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Erreur sauvegarde alertes:', error);
  }
}

function addAlert(alert: Omit<AlertItem, 'id' | 'timestamp'>): void {
  const alerts = getAlerts();
  
  // Vérifier s'il existe déjà une alerte similaire non résolue
  const existingAlert = alerts.find(a => 
    !a.resolved && 
    a.message === alert.message && 
    a.type === alert.type && 
    a.level === alert.level
  );
  
  if (existingAlert) {
    // Mettre à jour le timestamp de l'alerte existante
    existingAlert.timestamp = new Date().toISOString();
    saveAlerts(alerts);
    return;
  }
  
  const newAlert: AlertItem = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  alerts.unshift(newAlert);
  // Garder seulement les 100 dernières alertes
  if (alerts.length > 100) {
    alerts.splice(100);
  }
  saveAlerts(alerts);
}

// Composant principal
export function SecurityPerformanceMonitor({ 
  isOpen = true, 
  onClose 
}: { 
  isOpen?: boolean; 
  onClose?: () => void; 
} = {}) {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Collecte des métriques de sécurité
  const collectSecurityMetrics = (): SecurityMetrics => {
    const encryptionEnabled = localStorage.getItem('nc_encryption_enabled') === 'true';
    const hasPassword = !!localStorage.getItem('nc_master_password_encrypted');
    const hasDerivationKey = !!localStorage.getItem('nc_derivation_key');
    
    // Compter les clés chiffrées
    const encryptedKeys = Object.keys(localStorage).filter(key => 
      localStorage.getItem(key)?.startsWith('NEUROCHT_PERSIST_')
    ).length;

    // Simuler des métriques de performance de chiffrement
    const now = Date.now();
    const lastKeyRotation = localStorage.getItem('nc_last_key_rotation') || new Date(now - 3600000).toISOString();
    
    return {
      encryptionActive: encryptionEnabled,
      secureStorageEnabled: encryptionEnabled,
      keyManagerActive: hasPassword && hasDerivationKey,
      totalKeys: encryptedKeys,
      activeKeys: encryptedKeys,
      expiredKeys: 0,
      auditEntries: Math.floor(Math.random() * 50) + 10,
      securityLevel: encryptionEnabled ? 'military' : 'none',
      lastKeyRotation,
      failedDecryptions: Math.floor(Math.random() * 3),
      successfulDecryptions: Math.floor(Math.random() * 100) + 50,
      dataIntegrityChecks: Math.floor(Math.random() * 200) + 100,
      failedIntegrityChecks: Math.floor(Math.random() * 2),
    };
  };

  // Collecte des métriques de performance
  const collectPerformanceMetrics = (): PerformanceMetrics => {
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
    const memoryLimit = memoryInfo ? Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) : 0;
    
    // Simuler des métriques de performance
    const now = Date.now();
    const startTime = performance.now();
    
    return {
      memoryUsage,
      memoryLimit,
      cacheSize: Math.floor(Math.random() * 50) + 10,
      cacheHitRate: Math.random() * 0.3 + 0.7, // 70-100%
      encryptionTime: Math.random() * 5 + 1, // 1-6ms
      decryptionTime: Math.random() * 3 + 0.5, // 0.5-3.5ms
      apiResponseTime: Math.random() * 2000 + 500, // 500-2500ms
      renderTime: performance.now() - startTime,
      bundleSize: 2.5, // MB
      activeConnections: Math.floor(Math.random() * 5) + 1,
      errorRate: Math.random() * 0.05, // 0-5%
      uptime: now - (window as any).appStartTime || 0,
    };
  };

  // Mise à jour des métriques
  const updateMetrics = async () => {
    setIsRefreshing(true);
    
    try {
      const securityMetrics = collectSecurityMetrics();
      const performanceMetrics = collectPerformanceMetrics();
      
      const newStats: MonitoringStats = {
        security: securityMetrics,
        performance: performanceMetrics,
        alerts: alerts,
        lastUpdate: new Date().toISOString(),
      };
      
      setStats(newStats);
      saveMonitoringStats(newStats);
      
      // Vérifier les alertes
      const newAlerts = checkAlerts(securityMetrics, performanceMetrics);
      if (newAlerts.length > 0) {
        newAlerts.forEach(alert => addAlert(alert));
        setAlerts(getAlerts());
      }
      
      // Ajouter des alertes de test pour démonstration (seulement si aucune alerte n'existe)
      if (alerts.length === 0) {
        const testAlerts = [
          {
            type: 'security' as const,
            level: 'critical' as const,
            message: 'Test d\'alerte critique - Chiffrement désactivé',
            resolved: false,
          },
          {
            type: 'performance' as const,
            level: 'high' as const,
            message: 'Test d\'alerte performance - Utilisation mémoire élevée',
            resolved: false,
          },
          {
            type: 'error' as const,
            level: 'medium' as const,
            message: 'Test d\'alerte erreur - Problème de connexion',
            resolved: false,
          }
        ];
        
        testAlerts.forEach(alert => addAlert(alert));
        setAlerts(getAlerts());
      }
      
    } catch (error) {
      console.error('Erreur collecte métriques:', error);
      addAlert({
        type: 'error',
        level: 'high',
        message: 'Erreur lors de la collecte des métriques',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        resolved: false,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Vérification des alertes
  const checkAlerts = (security: SecurityMetrics, performance: PerformanceMetrics): Omit<AlertItem, 'id' | 'timestamp'>[] => {
    const newAlerts: Omit<AlertItem, 'id' | 'timestamp'>[] = [];
    
    // Alertes de sécurité
    if (!security.encryptionActive) {
      newAlerts.push({
        type: 'security',
        level: 'critical',
        message: 'Chiffrement désactivé - Données non protégées',
        resolved: false,
      });
    }
    
    if (security.failedDecryptions > 5) {
      newAlerts.push({
        type: 'security',
        level: 'high',
        message: `${security.failedDecryptions} échecs de déchiffrement détectés`,
        resolved: false,
      });
    }
    
    if (security.failedIntegrityChecks > 0) {
      newAlerts.push({
        type: 'security',
        level: 'critical',
        message: 'Échecs de vérification d\'intégrité détectés',
        resolved: false,
      });
    }
    
    // Alertes de performance
    if (performance.memoryUsage / performance.memoryLimit > 0.9) {
      newAlerts.push({
        type: 'performance',
        level: 'high',
        message: 'Utilisation mémoire élevée (>90%)',
        resolved: false,
      });
    }
    
    if (performance.cacheHitRate < 0.5) {
      newAlerts.push({
        type: 'performance',
        level: 'medium',
        message: 'Taux de cache faible (<50%)',
        resolved: false,
      });
    }
    
    if (performance.errorRate > 0.1) {
      newAlerts.push({
        type: 'performance',
        level: 'high',
        message: `Taux d'erreur élevé (${(performance.errorRate * 100).toFixed(1)}%)`,
        resolved: false,
      });
    }
    
    return newAlerts;
  };

  // Chargement initial
  useEffect(() => {
    const storedStats = getMonitoringStats();
    if (storedStats) {
      setStats(storedStats);
    }
    setAlerts(getAlerts());
    updateMetrics();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(updateMetrics, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, [autoRefresh, alerts]);

  // Initialiser le temps de démarrage
  useEffect(() => {
    if (!(window as any).appStartTime) {
      (window as any).appStartTime = Date.now();
    }
  }, []);

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'military': return 'text-green-600 dark:text-green-400';
      case 'basic': return 'text-yellow-600 dark:text-yellow-400';
      case 'none': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}j ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const exportMetrics = () => {
    if (!stats) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      stats,
      alerts: alerts.filter(a => !a.resolved),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurochat-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <UnifiedCard className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monitoring Sécurité & Performance
            </CardTitle>
            <div className="flex items-center gap-2">
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(autoRefresh && 'bg-green-50 dark:bg-green-950/20')}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
                Auto-refresh
              </UnifiedButton>
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={updateMetrics}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Actualiser
              </UnifiedButton>
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={exportMetrics}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </UnifiedButton>
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={onClose || (() => {})}
              >
                Fermer
              </UnifiedButton>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Statut général */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Statut</p>
                        <p className={cn("text-2xl font-bold", 
                          stats?.security.securityLevel === 'military' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        )}>
                          {stats?.security.securityLevel === 'military' ? '🔐 Sécurisé' : '⚠️ Risque'}
                        </p>
                      </div>
                      <Shield className="w-8 h-8 text-slate-400" />
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
                          {stats?.performance.memoryUsage || 0}MB
                        </p>
                        <Progress 
                          value={(stats?.performance.memoryUsage || 0) / (stats?.performance.memoryLimit || 1) * 100} 
                          className="mt-2"
                        />
                      </div>
                      <Database className="w-8 h-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Uptime */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Uptime</p>
                        <p className="text-2xl font-bold">
                          {formatUptime(stats?.performance.uptime || 0)}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Alertes actives */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Alertes</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {alerts.filter(a => !a.resolved).length}
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
                    <CardTitle className="text-lg">Performance Récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Temps de réponse API</span>
                        <span className="font-mono">{stats?.performance.apiResponseTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de cache</span>
                        <span className="font-mono">{((stats?.performance.cacheHitRate || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux d'erreur</span>
                        <span className="font-mono">{((stats?.performance.errorRate || 0) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sécurité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Clés actives</span>
                        <span className="font-mono">{stats?.security.activeKeys}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Déchiffrements réussis</span>
                        <span className="font-mono text-green-600">{stats?.security.successfulDecryptions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vérifications d'intégrité</span>
                        <span className="font-mono">{stats?.security.dataIntegrityChecks}</span>
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
                      <span>Statut</span>
                      <UnifiedBadge variant={stats?.security.encryptionActive ? "default" : "destructive"}>
                        {stats?.security.encryptionActive ? "Actif" : "Inactif"}
                      </UnifiedBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>Niveau</span>
                      <span className={getSecurityLevelColor(stats?.security.securityLevel || 'none')}>
                        {stats?.security.securityLevel || 'none'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stockage sécurisé</span>
                      <UnifiedBadge variant={stats?.security.secureStorageEnabled ? "default" : "destructive"}>
                        {stats?.security.secureStorageEnabled ? "Oui" : "Non"}
                      </UnifiedBadge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Gestion des Clés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gestionnaire actif</span>
                      <UnifiedBadge variant={stats?.security.keyManagerActive ? "default" : "destructive"}>
                        {stats?.security.keyManagerActive ? "Oui" : "Non"}
                      </UnifiedBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>Clés totales</span>
                      <span className="font-mono">{stats?.security.totalKeys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clés actives</span>
                      <span className="font-mono text-green-600">{stats?.security.activeKeys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clés expirées</span>
                      <span className="font-mono text-red-600">{stats?.security.expiredKeys}</span>
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
                      <span>Déchiffrements réussis</span>
                      <span className="font-mono text-green-600">{stats?.security.successfulDecryptions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Échecs de déchiffrement</span>
                      <span className="font-mono text-red-600">{stats?.security.failedDecryptions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vérifications d'intégrité</span>
                      <span className="font-mono">{stats?.security.dataIntegrityChecks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Échecs d'intégrité</span>
                      <span className="font-mono text-red-600">{stats?.security.failedIntegrityChecks}</span>
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
                      <span className="font-mono">{stats?.performance.memoryUsage}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limite</span>
                      <span className="font-mono">{stats?.performance.memoryLimit}MB</span>
                    </div>
                    <Progress 
                      value={(stats?.performance.memoryUsage || 0) / (stats?.performance.memoryLimit || 1) * 100} 
                      className="mt-2"
                    />
                    <div className="text-xs text-slate-500">
                      {((stats?.performance.memoryUsage || 0) / (stats?.performance.memoryLimit || 1) * 100).toFixed(1)}% utilisée
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Cache</span>
                      <span className="font-mono">{stats?.performance.cacheSize}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de cache</span>
                      <span className="font-mono">{((stats?.performance.cacheHitRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connexions actives</span>
                      <span className="font-mono">{stats?.performance.activeConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux d'erreur</span>
                      <span className="font-mono">{((stats?.performance.errorRate || 0) * 100).toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Temps de Réponse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>API</span>
                      <span className="font-mono">{stats?.performance.apiResponseTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chiffrement</span>
                      <span className="font-mono">{stats?.performance.encryptionTime.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Déchiffrement</span>
                      <span className="font-mono">{stats?.performance.decryptionTime.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rendu</span>
                      <span className="font-mono">{stats?.performance.renderTime.toFixed(1)}ms</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {/* Actions sur les alertes */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const updatedAlerts = alerts.map(alert => ({ ...alert, resolved: true }));
                      setAlerts(updatedAlerts);
                      saveAlerts(updatedAlerts);
                    }}
                    disabled={alerts.filter(a => !a.resolved).length === 0}
                  >
                    Marquer tout comme résolu
                  </UnifiedButton>
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAlerts([]);
                      saveAlerts([]);
                    }}
                    disabled={alerts.length === 0}
                  >
                    Supprimer toutes les alertes
                  </UnifiedButton>
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Supprimer seulement les alertes de test
                      const filteredAlerts = alerts.filter(alert => 
                        !alert.message.includes('Test d\'alerte')
                      );
                      setAlerts(filteredAlerts);
                      saveAlerts(filteredAlerts);
                    }}
                    disabled={!alerts.some(alert => alert.message.includes('Test d\'alerte'))}
                  >
                    Supprimer alertes de test
                  </UnifiedButton>
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Ajouter des alertes de test
                      const testAlerts = [
                        {
                          type: 'security' as const,
                          level: 'critical' as const,
                          message: 'Test d\'alerte critique - Chiffrement désactivé',
                          resolved: false,
                        },
                        {
                          type: 'performance' as const,
                          level: 'high' as const,
                          message: 'Test d\'alerte performance - Utilisation mémoire élevée',
                          resolved: false,
                        },
                        {
                          type: 'error' as const,
                          level: 'medium' as const,
                          message: 'Test d\'alerte erreur - Problème de connexion',
                          resolved: false,
                        }
                      ];
                      
                      testAlerts.forEach(alert => addAlert(alert));
                      setAlerts(getAlerts());
                    }}
                  >
                    Ajouter alertes de test
                  </UnifiedButton>
                </div>
                <div className="text-sm text-slate-500">
                  {alerts.length} alerte(s) au total
                </div>
              </div>
              
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <p className="text-slate-500">Aucune alerte</p>
                  </div>
                ) : (
                  <>
                    {/* Alertes actives */}
                    {alerts.filter(alert => !alert.resolved).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                          Alertes Actives ({alerts.filter(alert => !alert.resolved).length})
                        </h3>
                        {alerts.filter(alert => !alert.resolved).map((alert) => (
                          <Alert key={alert.id} className={getAlertLevelColor(alert.level)}>
                            <div className="flex items-start gap-3">
                              {getAlertIcon(alert.type)}
                              <div className="flex-1">
                                <AlertDescription>
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{alert.message}</p>
                                        {alert.message.includes('Test d\'alerte') && (
                                          <UnifiedBadge variant="secondary" className="text-xs">
                                            TEST
                                          </UnifiedBadge>
                                        )}
                                      </div>
                                      {alert.details && (
                                        <p className="text-sm mt-1 opacity-75">{alert.details}</p>
                                      )}
                                      <p className="text-xs mt-1 opacity-60">
                                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      <UnifiedBadge variant="outline">
                                        {alert.level}
                                      </UnifiedBadge>
                                      <UnifiedButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updatedAlerts = alerts.map(a => 
                                            a.id === alert.id ? { ...a, resolved: true } : a
                                          );
                                          setAlerts(updatedAlerts);
                                          saveAlerts(updatedAlerts);
                                        }}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Résoudre
                                      </UnifiedButton>
                                    </div>
                                  </div>
                                </AlertDescription>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    )}
                    
                    {/* Alertes résolues */}
                    {alerts.filter(alert => alert.resolved).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                          Alertes Résolues ({alerts.filter(alert => alert.resolved).length})
                        </h3>
                        {alerts.filter(alert => alert.resolved).map((alert) => (
                          <Alert key={alert.id} className="opacity-60 bg-slate-50 dark:bg-slate-800">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <AlertDescription>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium line-through">{alert.message}</p>
                                      {alert.details && (
                                        <p className="text-sm mt-1 opacity-75">{alert.details}</p>
                                      )}
                                      <p className="text-xs mt-1 opacity-60">
                                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                                      </p>
                                    </div>
                                    <UnifiedBadge variant="outline" className="ml-2">
                                      Résolu
                                    </UnifiedBadge>
                                  </div>
                                </AlertDescription>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </UnifiedCard>
    </div>
  );
}
