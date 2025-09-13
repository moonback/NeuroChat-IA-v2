// Utilitaires de test pour le système de monitoring
// Permet de valider le bon fonctionnement des métriques

import { 
  monitoringService, 
  recordSecurityEvent, 
  recordPerformanceEvent, 
  recordErrorEvent 
} from '@/services/monitoringService';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class MonitoringTester {
  private results: TestResult[] = [];

  // Test de base du service de monitoring
  async testBasicFunctionality(): Promise<TestResult> {
    try {
      // Démarrer le monitoring
      monitoringService.start();
      
      // Attendre un peu pour la collecte
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier que le service est actif
      const config = monitoringService.getConfig();
      if (!config.enableSecurityMonitoring || !config.enablePerformanceMonitoring) {
        return {
          success: false,
          message: 'Configuration de monitoring incorrecte',
          details: config
        };
      }

      // Arrêter le monitoring
      monitoringService.stop();

      return {
        success: true,
        message: 'Service de monitoring fonctionnel',
        details: config
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test de base',
        details: error
      };
    }
  }

  // Test de collecte des métriques de sécurité
  async testSecurityMetrics(): Promise<TestResult> {
    try {
      // Enregistrer des événements de test
      recordSecurityEvent({
        type: 'encryption',
        success: true,
        details: 'Test de chiffrement',
        duration: 5.2
      });

      recordSecurityEvent({
        type: 'decryption',
        success: true,
        details: 'Test de déchiffrement',
        duration: 3.1
      });

      recordSecurityEvent({
        type: 'integrity_check',
        success: true,
        details: 'Test de vérification d\'intégrité'
      });

      // Attendre un peu pour la collecte
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier les métriques
      const data = monitoringService.exportData();
      const securityMetrics = data.metrics.security;

      if (!securityMetrics || securityMetrics.totalEvents === 0) {
        return {
          success: false,
          message: 'Aucune métrique de sécurité collectée',
          details: securityMetrics
        };
      }

      return {
        success: true,
        message: `Métriques de sécurité collectées: ${securityMetrics.totalEvents} événements`,
        details: securityMetrics
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test des métriques de sécurité',
        details: error
      };
    }
  }

  // Test de collecte des métriques de performance
  async testPerformanceMetrics(): Promise<TestResult> {
    try {
      // Enregistrer des événements de test
      recordPerformanceEvent({
        type: 'memory_usage',
        value: 45.2,
        details: 'Test d\'utilisation mémoire'
      });

      recordPerformanceEvent({
        type: 'cache_hit',
        value: 1,
        details: 'Test de cache hit'
      });

      recordPerformanceEvent({
        type: 'render',
        value: 12.5,
        details: 'Test de temps de rendu'
      });

      // Attendre un peu pour la collecte
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier les métriques
      const data = monitoringService.exportData();
      const performanceMetrics = data.metrics.performance;

      if (!performanceMetrics || performanceMetrics.totalEvents === 0) {
        return {
          success: false,
          message: 'Aucune métrique de performance collectée',
          details: performanceMetrics
        };
      }

      return {
        success: true,
        message: `Métriques de performance collectées: ${performanceMetrics.totalEvents} événements`,
        details: performanceMetrics
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test des métriques de performance',
        details: error
      };
    }
  }

  // Test de gestion des erreurs
  async testErrorHandling(): Promise<TestResult> {
    try {
      // Enregistrer des erreurs de test
      recordErrorEvent({
        type: 'javascript',
        message: 'Test d\'erreur JavaScript',
        severity: 'low',
        context: { test: true }
      });

      recordErrorEvent({
        type: 'security',
        message: 'Test d\'erreur de sécurité',
        severity: 'medium',
        context: { test: true }
      });

      // Attendre un peu pour la collecte
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier les métriques
      const data = monitoringService.exportData();
      const errorMetrics = data.metrics.errors;

      if (!errorMetrics || errorMetrics.totalErrors === 0) {
        return {
          success: false,
          message: 'Aucune erreur enregistrée',
          details: errorMetrics
        };
      }

      return {
        success: true,
        message: `Erreurs enregistrées: ${errorMetrics.totalErrors} erreurs`,
        details: errorMetrics
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test de gestion des erreurs',
        details: error
      };
    }
  }

  // Test de stockage et persistance
  async testStoragePersistence(): Promise<TestResult> {
    try {
      // Enregistrer des données de test
      const testData = {
        timestamp: Date.now(),
        test: true,
        metrics: {
          security: { test: 'security' },
          performance: { test: 'performance' },
          errors: { test: 'errors' }
        }
      };

      // Simuler la sauvegarde
      monitoringService.start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      monitoringService.stop();

      // Vérifier que les données sont persistées
      const data = monitoringService.exportData();
      
      if (!data || !data.timestamp) {
        return {
          success: false,
          message: 'Données non persistées',
          details: data
        };
      }

      return {
        success: true,
        message: 'Données persistées correctement',
        details: {
          timestamp: data.timestamp,
          hasMetrics: !!data.metrics,
          hasHistory: !!data.history
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test de persistance',
        details: error
      };
    }
  }

  // Test de génération d'alertes
  async testAlertGeneration(): Promise<TestResult> {
    try {
      // Simuler des conditions d'alerte
      recordPerformanceEvent({
        type: 'memory_usage',
        value: 95, // Au-dessus du seuil de 90%
        details: 'Test d\'alerte mémoire élevée'
      });

      recordSecurityEvent({
        type: 'decryption',
        success: false,
        details: 'Test d\'alerte échec de déchiffrement'
      });

      // Attendre un peu pour la collecte
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier les métriques
      const data = monitoringService.exportData();
      const performanceMetrics = data.metrics.performance;
      const securityMetrics = data.metrics.security;

      const hasMemoryAlert = performanceMetrics.averageMemoryUsage > 90;
      const hasSecurityAlert = securityMetrics.failedDecryptions > 0;

      if (!hasMemoryAlert && !hasSecurityAlert) {
        return {
          success: false,
          message: 'Aucune alerte générée',
          details: { performanceMetrics, securityMetrics }
        };
      }

      return {
        success: true,
        message: 'Alertes générées correctement',
        details: {
          memoryAlert: hasMemoryAlert,
          securityAlert: hasSecurityAlert,
          performanceMetrics,
          securityMetrics
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test de génération d\'alertes',
        details: error
      };
    }
  }

  // Exécuter tous les tests
  async runAllTests(): Promise<TestResult[]> {
    this.results = [];

    console.log('🧪 Démarrage des tests de monitoring...');

    // Test 1: Fonctionnalité de base
    console.log('1️⃣ Test de fonctionnalité de base...');
    const basicTest = await this.testBasicFunctionality();
    this.results.push(basicTest);

    // Test 2: Métriques de sécurité
    console.log('2️⃣ Test des métriques de sécurité...');
    const securityTest = await this.testSecurityMetrics();
    this.results.push(securityTest);

    // Test 3: Métriques de performance
    console.log('3️⃣ Test des métriques de performance...');
    const performanceTest = await this.testPerformanceMetrics();
    this.results.push(performanceTest);

    // Test 4: Gestion des erreurs
    console.log('4️⃣ Test de gestion des erreurs...');
    const errorTest = await this.testErrorHandling();
    this.results.push(errorTest);

    // Test 5: Persistance
    console.log('5️⃣ Test de persistance...');
    const storageTest = await this.testStoragePersistence();
    this.results.push(storageTest);

    // Test 6: Génération d'alertes
    console.log('6️⃣ Test de génération d\'alertes...');
    const alertTest = await this.testAlertGeneration();
    this.results.push(alertTest);

    // Résumé
    const successCount = this.results.filter(r => r.success).length;
    const totalCount = this.results.length;

    console.log(`\n📊 Résultats des tests: ${successCount}/${totalCount} réussis`);

    if (successCount === totalCount) {
      console.log('✅ Tous les tests de monitoring ont réussi !');
    } else {
      console.log('❌ Certains tests ont échoué. Vérifiez les détails ci-dessus.');
    }

    return this.results;
  }

  // Obtenir les résultats
  getResults(): TestResult[] {
    return this.results;
  }

  // Nettoyer les données de test
  cleanup(): void {
    monitoringService.clearHistory();
    console.log('🧹 Données de test nettoyées');
  }
}

// Fonction utilitaire pour exécuter les tests
export async function runMonitoringTests(): Promise<TestResult[]> {
  const tester = new MonitoringTester();
  return await tester.runAllTests();
}

// Fonction pour tester depuis la console
export function testMonitoringFromConsole(): void {
  console.log('🔍 Tests de monitoring disponibles:');
  console.log('- runMonitoringTests() : Exécuter tous les tests');
  console.log('- new MonitoringTester().testBasicFunctionality() : Test de base');
  console.log('- new MonitoringTester().testSecurityMetrics() : Test sécurité');
  console.log('- new MonitoringTester().testPerformanceMetrics() : Test performance');
  console.log('- new MonitoringTester().testErrorHandling() : Test erreurs');
  console.log('- new MonitoringTester().testStoragePersistence() : Test persistance');
  console.log('- new MonitoringTester().testAlertGeneration() : Test alertes');
  console.log('- new MonitoringTester().cleanup() : Nettoyer les données de test');
}

// Exposer les fonctions globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).runMonitoringTests = runMonitoringTests;
  (window as any).MonitoringTester = MonitoringTester;
  (window as any).testMonitoringFromConsole = testMonitoringFromConsole;
}
