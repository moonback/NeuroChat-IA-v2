// Test des alertes de monitoring
// Utilisez cette fonction pour tester l'affichage des alertes

export function testAlerts() {
  console.log('🧪 Test des alertes de monitoring...');
  
  // Simuler des alertes de test
  const testAlerts = [
    {
      id: 'test_1',
      type: 'security',
      level: 'critical',
      message: 'Test d\'alerte critique - Chiffrement désactivé',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: 'Ceci est un test d\'alerte critique pour vérifier l\'affichage'
    },
    {
      id: 'test_2',
      type: 'performance',
      level: 'high',
      message: 'Test d\'alerte performance - Utilisation mémoire élevée',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: 'Utilisation mémoire: 95% (seuil: 90%)'
    },
    {
      id: 'test_3',
      type: 'error',
      level: 'medium',
      message: 'Test d\'alerte erreur - Problème de connexion',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: 'Timeout sur l\'appel API Gemini'
    },
    {
      id: 'test_4',
      type: 'security',
      level: 'low',
      message: 'Test d\'alerte faible - Suggestion d\'optimisation',
      timestamp: new Date().toISOString(),
      resolved: true,
      details: 'Considérer l\'activation du cache'
    }
  ];
  
  // Sauvegarder les alertes de test
  localStorage.setItem('nc_monitoring_alerts', JSON.stringify(testAlerts));
  
  console.log('✅ Alertes de test ajoutées:', testAlerts);
  console.log('🔄 Rechargez la page pour voir les alertes dans le dashboard de monitoring');
  
  return testAlerts;
}

// Fonction pour nettoyer les alertes de test
export function clearTestAlerts() {
  localStorage.removeItem('nc_monitoring_alerts');
  console.log('🧹 Alertes de test supprimées');
}

// Fonction pour ajouter une alerte spécifique
export function addTestAlert(type: 'security' | 'performance' | 'error', level: 'low' | 'medium' | 'high' | 'critical', message: string) {
  const existingAlerts = JSON.parse(localStorage.getItem('nc_monitoring_alerts') || '[]');
  
  const newAlert = {
    id: `test_${Date.now()}`,
    type,
    level,
    message,
    timestamp: new Date().toISOString(),
    resolved: false,
    details: 'Alerte de test ajoutée manuellement'
  };
  
  existingAlerts.unshift(newAlert);
  localStorage.setItem('nc_monitoring_alerts', JSON.stringify(existingAlerts));
  
  console.log('✅ Alerte de test ajoutée:', newAlert);
  return newAlert;
}

// Exposer les fonctions globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).testAlerts = testAlerts;
  (window as any).clearTestAlerts = clearTestAlerts;
  (window as any).addTestAlert = addTestAlert;
  
  console.log('🔍 Fonctions de test des alertes disponibles:');
  console.log('- testAlerts() : Ajouter des alertes de test');
  console.log('- clearTestAlerts() : Supprimer les alertes de test');
  console.log('- addTestAlert(type, level, message) : Ajouter une alerte spécifique');
}
