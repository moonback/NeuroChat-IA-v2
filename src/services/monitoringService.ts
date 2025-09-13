// Service de monitoring avancé pour NeuroChat
// Collecte des métriques de sécurité et performance en temps réel

export interface MonitoringConfig {
  enableSecurityMonitoring: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserAnalytics: boolean;
  refreshInterval: number; // en millisecondes
  maxHistoryEntries: number;
  alertThresholds: {
    memoryUsage: number; // pourcentage
    errorRate: number; // pourcentage
    responseTime: number; // millisecondes
    failedDecryptions: number; // nombre
  };
}

export interface SecurityEvent {
  type: 'encryption' | 'decryption' | 'key_rotation' | 'integrity_check' | 'access_denied';
  success: boolean;
  timestamp: number;
  details?: string;
  duration?: number; // en millisecondes
}

export interface PerformanceEvent {
  type: 'api_call' | 'render' | 'memory_usage' | 'cache_hit' | 'cache_miss';
  value: number;
  timestamp: number;
  details?: string;
}

export interface ErrorEvent {
  type: 'javascript' | 'network' | 'security' | 'performance';
  message: string;
  stack?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

class MonitoringService {
  private config: MonitoringConfig;
  private securityEvents: SecurityEvent[] = [];
  private performanceEvents: PerformanceEvent[] = [];
  private errorEvents: ErrorEvent[] = [];
  private isActive = false;
  private refreshTimer: NodeJS.Timeout | null = null;
  private observers: Set<(data: any) => void> = new Set();

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      enableSecurityMonitoring: true,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableUserAnalytics: false,
      refreshInterval: 10000, // 10 secondes
      maxHistoryEntries: 1000,
      alertThresholds: {
        memoryUsage: 90,
        errorRate: 5,
        responseTime: 5000,
        failedDecryptions: 5,
      },
      ...config,
    };

    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Initialiser le monitoring d'erreurs JavaScript
    if (this.config.enableErrorTracking) {
      this.setupErrorHandling();
    }

    // Initialiser le monitoring de performance
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    // Initialiser le monitoring de sécurité
    if (this.config.enableSecurityMonitoring) {
      this.setupSecurityMonitoring();
    }
  }

  private setupErrorHandling() {
    // Capturer les erreurs JavaScript non gérées
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Capturer les promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'javascript',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        severity: 'medium',
        context: {
          reason: event.reason,
        },
      });
    });
  }

  private setupPerformanceMonitoring() {
    // Monitoring de la mémoire
    if ('memory' in performance) {
      const checkMemory = () => {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          const usage = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
          
          this.recordPerformance({
            type: 'memory_usage',
            value: usage,
            timestamp: Date.now(),
            details: `Used: ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB, Total: ${Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)}MB`,
          });

          // Alerte si utilisation mémoire élevée
          if (usage > this.config.alertThresholds.memoryUsage) {
            this.triggerAlert('memory_high', {
              level: 'high',
              message: `Utilisation mémoire élevée: ${usage.toFixed(1)}%`,
              details: `Utilisée: ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB sur ${Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)}MB`,
            });
          }
        }
      };

      // Vérifier la mémoire toutes les 30 secondes
      setInterval(checkMemory, 30000);
    }

    // Monitoring des performances de rendu
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordPerformance({
                type: 'render',
                value: entry.duration,
                timestamp: Date.now(),
                details: `Measure: ${entry.name}`,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('PerformanceObserver non supporté:', error);
      }
    }
  }

  private setupSecurityMonitoring() {
    // Intercepter les appels de chiffrement/déchiffrement
    const originalEncrypt = window.crypto?.subtle?.encrypt;
    const originalDecrypt = window.crypto?.subtle?.decrypt;

    if (originalEncrypt) {
      (window.crypto.subtle as any).encrypt = async (...args: any[]) => {
        const start = performance.now();
        try {
          const result = await originalEncrypt.apply(window.crypto.subtle, args);
          const duration = performance.now() - start;
          
          this.recordSecurity({
            type: 'encryption',
            success: true,
            timestamp: Date.now(),
            duration,
            details: 'Chiffrement réussi',
          });
          
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          
          this.recordSecurity({
            type: 'encryption',
            success: false,
            timestamp: Date.now(),
            duration,
            details: `Échec chiffrement: ${error}`,
          });
          
          throw error;
        }
      };
    }

    if (originalDecrypt) {
      (window.crypto.subtle as any).decrypt = async (...args: any[]) => {
        const start = performance.now();
        try {
          const result = await originalDecrypt.apply(window.crypto.subtle, args);
          const duration = performance.now() - start;
          
          this.recordSecurity({
            type: 'decryption',
            success: true,
            timestamp: Date.now(),
            duration,
            details: 'Déchiffrement réussi',
          });
          
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          
          this.recordSecurity({
            type: 'decryption',
            success: false,
            timestamp: Date.now(),
            duration,
            details: `Échec déchiffrement: ${error}`,
          });
          
          throw error;
        }
      };
    }
  }

  // Méthodes publiques
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.refreshInterval);
    
    console.log('🔍 Monitoring service démarré');
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    console.log('🔍 Monitoring service arrêté');
  }

  private collectMetrics() {
    const metrics = {
      timestamp: Date.now(),
      security: this.getSecurityMetrics(),
      performance: this.getPerformanceMetrics(),
      errors: this.getErrorMetrics(),
    };

    // Notifier les observateurs
    this.observers.forEach(observer => {
      try {
        observer(metrics);
      } catch (error) {
        console.error('Erreur dans l\'observateur de monitoring:', error);
      }
    });
  }

  private getSecurityMetrics() {
    const recentEvents = this.securityEvents.filter(
      e => Date.now() - e.timestamp < 60000 // 1 minute
    );

    const successful = recentEvents.filter(e => e.success).length;
    const failed = recentEvents.filter(e => !e.success).length;
    const total = recentEvents.length;

    return {
      totalEvents: this.securityEvents.length,
      recentEvents: recentEvents.length,
      successRate: total > 0 ? (successful / total) * 100 : 100,
      failedDecryptions: recentEvents.filter(e => e.type === 'decryption' && !e.success).length,
      averageEncryptionTime: this.calculateAverageTime('encryption'),
      averageDecryptionTime: this.calculateAverageTime('decryption'),
    };
  }

  private getPerformanceMetrics() {
    const recentEvents = this.performanceEvents.filter(
      e => Date.now() - e.timestamp < 60000 // 1 minute
    );

    const memoryEvents = recentEvents.filter(e => e.type === 'memory_usage');
    const renderEvents = recentEvents.filter(e => e.type === 'render');
    const cacheEvents = recentEvents.filter(e => e.type === 'cache_hit' || e.type === 'cache_miss');

    const cacheHits = cacheEvents.filter(e => e.type === 'cache_hit').length;
    const cacheMisses = cacheEvents.filter(e => e.type === 'cache_miss').length;
    const cacheHitRate = (cacheHits + cacheMisses) > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0;

    return {
      totalEvents: this.performanceEvents.length,
      recentEvents: recentEvents.length,
      averageMemoryUsage: memoryEvents.length > 0 
        ? memoryEvents.reduce((sum, e) => sum + e.value, 0) / memoryEvents.length 
        : 0,
      averageRenderTime: renderEvents.length > 0 
        ? renderEvents.reduce((sum, e) => sum + e.value, 0) / renderEvents.length 
        : 0,
      cacheHitRate,
      memoryInfo: this.getMemoryInfo(),
    };
  }

  private getErrorMetrics() {
    const recentErrors = this.errorEvents.filter(
      e => Date.now() - e.timestamp < 60000 // 1 minute
    );

    const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
    const highErrors = recentErrors.filter(e => e.severity === 'high').length;
    const totalErrors = recentErrors.length;

    return {
      totalErrors: this.errorEvents.length,
      recentErrors: totalErrors,
      criticalErrors,
      highErrors,
      errorRate: totalErrors > 0 ? (totalErrors / 60) * 100 : 0, // erreurs par minute
    };
  }

  private getMemoryInfo() {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memoryInfo = (performance as any).memory;
    return {
      used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024),
      usage: (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100,
    };
  }

  private calculateAverageTime(type: 'encryption' | 'decryption'): number {
    const events = this.securityEvents.filter(
      e => e.type === type && e.duration !== undefined
    );
    
    if (events.length === 0) return 0;
    
    const totalTime = events.reduce((sum, e) => sum + (e.duration || 0), 0);
    return totalTime / events.length;
  }

  // Méthodes d'enregistrement
  recordSecurity(event: SecurityEvent) {
    this.securityEvents.push(event);
    this.trimHistory();
  }

  recordPerformance(event: PerformanceEvent) {
    this.performanceEvents.push(event);
    this.trimHistory();
  }

  recordError(event: ErrorEvent) {
    this.errorEvents.push(event);
    this.trimHistory();
  }

  private trimHistory() {
    if (this.securityEvents.length > this.config.maxHistoryEntries) {
      this.securityEvents = this.securityEvents.slice(-this.config.maxHistoryEntries);
    }
    if (this.performanceEvents.length > this.config.maxHistoryEntries) {
      this.performanceEvents = this.performanceEvents.slice(-this.config.maxHistoryEntries);
    }
    if (this.errorEvents.length > this.config.maxHistoryEntries) {
      this.errorEvents = this.errorEvents.slice(-this.config.maxHistoryEntries);
    }
  }

  // Gestion des alertes
  private triggerAlert(type: string, alert: { level: string; message: string; details?: string }) {
    console.warn(`🚨 Alerte ${alert.level.toUpperCase()}: ${alert.message}`, alert.details);
    
    // Ici on pourrait envoyer des notifications ou déclencher des actions
    // Par exemple, afficher une notification toast
  }

  // Observateurs
  subscribe(observer: (data: any) => void) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  // Getters
  getConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getHistory() {
    return {
      security: [...this.securityEvents],
      performance: [...this.performanceEvents],
      errors: [...this.errorEvents],
    };
  }

  clearHistory() {
    this.securityEvents = [];
    this.performanceEvents = [];
    this.errorEvents = [];
  }

  // Export des données
  exportData() {
    return {
      timestamp: new Date().toISOString(),
      config: this.config,
      history: this.getHistory(),
      metrics: {
        security: this.getSecurityMetrics(),
        performance: this.getPerformanceMetrics(),
        errors: this.getErrorMetrics(),
      },
    };
  }
}

// Instance singleton
export const monitoringService = new MonitoringService();

// Fonctions utilitaires pour l'utilisation dans les composants
export function startMonitoring() {
  monitoringService.start();
}

export function stopMonitoring() {
  monitoringService.stop();
}

export function recordSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  monitoringService.recordSecurity({
    ...event,
    timestamp: Date.now(),
  });
}

export function recordPerformanceEvent(event: Omit<PerformanceEvent, 'timestamp'>) {
  monitoringService.recordPerformance({
    ...event,
    timestamp: Date.now(),
  });
}

export function recordErrorEvent(event: Omit<ErrorEvent, 'timestamp'>) {
  monitoringService.recordError({
    ...event,
    timestamp: Date.now(),
  });
}

export function subscribeToMonitoring(callback: (data: any) => void) {
  return monitoringService.subscribe(callback);
}

export function getMonitoringData() {
  return monitoringService.exportData();
}
