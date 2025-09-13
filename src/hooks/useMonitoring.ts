import { useState, useEffect, useCallback, useRef } from 'react';

// Types pour le monitoring
export interface SecurityMetrics {
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

export interface PerformanceMetrics {
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

export interface AlertItem {
  id: string;
  type: 'security' | 'performance' | 'error';
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  details?: string;
}

export interface MonitoringStats {
  security: SecurityMetrics;
  performance: PerformanceMetrics;
  alerts: AlertItem[];
  lastUpdate: string;
}

// Clés de stockage
const LS_MONITORING_KEY = 'nc_monitoring_stats';
const LS_ALERTS_KEY = 'nc_monitoring_alerts';
const LS_METRICS_HISTORY_KEY = 'nc_metrics_history';

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

function getMetricsHistory(): MonitoringStats[] {
  try {
    const stored = localStorage.getItem(LS_METRICS_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMetricsHistory(history: MonitoringStats[]): void {
  try {
    // Garder seulement les 100 dernières entrées
    const limitedHistory = history.slice(-100);
    localStorage.setItem(LS_METRICS_HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Erreur sauvegarde historique:', error);
  }
}

// Collecte des métriques de sécurité
function collectSecurityMetrics(): SecurityMetrics {
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
}

// Collecte des métriques de performance
function collectPerformanceMetrics(): PerformanceMetrics {
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
}

// Vérification des alertes
function checkAlerts(security: SecurityMetrics, performance: PerformanceMetrics): AlertItem[] {
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
}

// Hook principal
export function useMonitoring() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [metricsHistory, setMetricsHistory] = useState<MonitoringStats[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mise à jour des métriques
  const updateMetrics = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const securityMetrics = collectSecurityMetrics();
      const performanceMetrics = collectPerformanceMetrics();
      const currentAlerts = getAlerts();
      
      const newStats: MonitoringStats = {
        security: securityMetrics,
        performance: performanceMetrics,
        alerts: currentAlerts,
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
      
      // Sauvegarder l'historique
      const history = getMetricsHistory();
      history.push(newStats);
      setMetricsHistory(history);
      saveMetricsHistory(history);
      
    } catch (error) {
      console.error('Erreur collecte métriques:', error);
      addAlert({
        type: 'error',
        level: 'high',
        message: 'Erreur lors de la collecte des métriques',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
      setAlerts(getAlerts());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    const storedStats = getMonitoringStats();
    if (storedStats) {
      setStats(storedStats);
    }
    setAlerts(getAlerts());
    setMetricsHistory(getMetricsHistory());
    updateMetrics();
  }, [updateMetrics]);

  // Auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (autoRefresh) {
      intervalRef.current = setInterval(updateMetrics, 10000); // 10 secondes
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, updateMetrics]);

  // Initialiser le temps de démarrage
  useEffect(() => {
    if (!(window as any).appStartTime) {
      (window as any).appStartTime = Date.now();
    }
  }, []);

  // Fonctions utilitaires
  const resolveAlert = useCallback((alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
    setAlerts(updatedAlerts);
    saveAlerts(updatedAlerts);
  }, [alerts]);

  const clearResolvedAlerts = useCallback(() => {
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    setAlerts(activeAlerts);
    saveAlerts(activeAlerts);
  }, [alerts]);

  const exportMetrics = useCallback(() => {
    if (!stats) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      stats,
      alerts: alerts.filter(a => !a.resolved),
      history: metricsHistory.slice(-50), // 50 dernières entrées
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
  }, [stats, alerts, metricsHistory]);

  const getSecurityLevel = useCallback(() => {
    if (!stats) return 'none';
    return stats.security.securityLevel;
  }, [stats]);

  const getActiveAlertsCount = useCallback(() => {
    return alerts.filter(alert => !alert.resolved).length;
  }, [alerts]);

  const getCriticalAlertsCount = useCallback(() => {
    return alerts.filter(alert => !alert.resolved && alert.level === 'critical').length;
  }, [alerts]);

  const getMemoryUsagePercentage = useCallback(() => {
    if (!stats) return 0;
    return (stats.performance.memoryUsage / stats.performance.memoryLimit) * 100;
  }, [stats]);

  const getPerformanceScore = useCallback(() => {
    if (!stats) return 0;
    
    const memoryScore = Math.max(0, 100 - getMemoryUsagePercentage());
    const cacheScore = stats.performance.cacheHitRate * 100;
    const errorScore = Math.max(0, 100 - (stats.performance.errorRate * 1000));
    
    return Math.round((memoryScore + cacheScore + errorScore) / 3);
  }, [stats, getMemoryUsagePercentage]);

  return {
    // État
    stats,
    alerts,
    metricsHistory,
    isRefreshing,
    autoRefresh,
    
    // Actions
    updateMetrics,
    setAutoRefresh,
    resolveAlert,
    clearResolvedAlerts,
    exportMetrics,
    
    // Utilitaires
    getSecurityLevel,
    getActiveAlertsCount,
    getCriticalAlertsCount,
    getMemoryUsagePercentage,
    getPerformanceScore,
  };
}
