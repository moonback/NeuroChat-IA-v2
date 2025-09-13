# 🔍 Guide d'Utilisation du Monitoring - NeuroChat

## Vue d'ensemble

Le système de monitoring de NeuroChat fournit une surveillance en temps réel de la sécurité et des performances de l'application. Il collecte automatiquement des métriques, génère des alertes et offre un tableau de bord complet pour l'analyse.

## 🚀 Démarrage Rapide

### 1. Accès au Monitoring

Le monitoring est accessible via l'indicateur de statut dans la barre d'outils :

```
[Logo NeuroChat] [Indicateur Monitoring] [Sélecteur d'espace de travail]
```

Cliquez sur l'indicateur de monitoring pour ouvrir le tableau de bord complet.

### 2. Interface Principale

Le tableau de bord comprend 4 onglets :

- **Vue d'ensemble** : Métriques clés et statut général
- **Sécurité** : Détails du chiffrement et des clés
- **Performance** : Mémoire, cache, et temps de réponse
- **Alertes** : Liste des alertes actives et résolues

## 📊 Comprendre les Métriques

### Indicateurs de Statut

#### 🔐 Sécurité
- **🔐 Sécurisé** : Chiffrement AES-256 actif, toutes les métriques sont bonnes
- **⚠️ Risque** : Problème de sécurité détecté (chiffrement inactif, échecs, etc.)

#### ⚡ Performance
- **Score élevé (80-100%)** : Performance excellente
- **Score moyen (60-79%)** : Performance acceptable
- **Score faible (<60%)** : Performance dégradée

#### 🚨 Alertes
- **OK** : Aucune alerte active
- **Nombre** : Nombre d'alertes actives nécessitant attention

### Métriques Détaillées

#### Sécurité
- **Taux de succès** : Pourcentage d'opérations de chiffrement réussies
- **Clés actives** : Nombre de clés cryptographiques en cours d'utilisation
- **Échecs de déchiffrement** : Nombre d'échecs récents
- **Temps de chiffrement** : Durée moyenne des opérations

#### Performance
- **Utilisation mémoire** : Pourcentage de mémoire utilisée
- **Taux de cache** : Efficacité du cache (plus c'est élevé, mieux c'est)
- **Temps de rendu** : Durée moyenne du rendu des composants
- **Temps de réponse API** : Latence des appels aux services IA

## 🚨 Gestion des Alertes

### Types d'Alertes

#### 🔴 Critique
- Chiffrement désactivé
- Échecs de vérification d'intégrité
- Utilisation mémoire > 95%

#### 🟠 Élevé
- Échecs de déchiffrement > 5
- Utilisation mémoire > 90%
- Taux d'erreur > 10%

#### 🟡 Moyen
- Taux de cache < 50%
- Temps de réponse API > 5s

#### 🔵 Faible
- Informations générales
- Suggestions d'optimisation

### Actions Recommandées

#### Pour les Alertes de Sécurité
1. **Chiffrement désactivé** : Réactiver le chiffrement AES-256
2. **Échecs de déchiffrement** : Vérifier l'intégrité des données
3. **Échecs d'intégrité** : Redémarrer l'application

#### Pour les Alertes de Performance
1. **Mémoire élevée** : Fermer les onglets inutiles, redémarrer
2. **Cache faible** : Vérifier la connectivité réseau
3. **Temps de réponse** : Vérifier la connexion internet

## ⚙️ Configuration

### Auto-refresh

L'auto-refresh est activé par défaut (toutes les 10 secondes) :

```typescript
// Désactiver l'auto-refresh
const { setAutoRefresh } = useMonitoring();
setAutoRefresh(false);

// Réactiver l'auto-refresh
setAutoRefresh(true);
```

### Seuils d'Alerte

Les seuils peuvent être configurés dans le service de monitoring :

```typescript
import { monitoringService } from '@/services/monitoringService';

monitoringService.updateConfig({
  alertThresholds: {
    memoryUsage: 85,        // 85% au lieu de 90%
    errorRate: 3,           // 3% au lieu de 5%
    responseTime: 3000,     // 3s au lieu de 5s
    failedDecryptions: 3,   // 3 au lieu de 5
  }
});
```

## 📈 Export et Analyse

### Export des Données

1. Ouvrir le tableau de bord de monitoring
2. Cliquer sur le bouton "Exporter"
3. Un fichier JSON sera téléchargé avec toutes les métriques

### Format d'Export

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metrics": {
    "security": {
      "successRate": 98.5,
      "failedDecryptions": 2,
      "averageEncryptionTime": 3.2
    },
    "performance": {
      "memoryUsage": 45.2,
      "cacheHitRate": 87.3,
      "averageRenderTime": 12.5
    }
  },
  "alerts": [...],
  "history": {...}
}
```

### Analyse des Données

Les données exportées peuvent être analysées avec :
- **Excel/Google Sheets** : Pour des graphiques simples
- **Outils de monitoring** : Grafana, Prometheus, etc.
- **Scripts Python** : Pour des analyses avancées

## 🧪 Tests et Validation

### Tests Automatiques

Le système inclut des tests de validation :

```typescript
import { runMonitoringTests } from '@/utils/monitoringTest';

// Exécuter tous les tests
const results = await runMonitoringTests();
console.log('Tests:', results);
```

### Tests depuis la Console

Ouvrir la console du navigateur et exécuter :

```javascript
// Afficher les fonctions de test disponibles
testMonitoringFromConsole();

// Exécuter tous les tests
runMonitoringTests();

// Test spécifique
const tester = new MonitoringTester();
await tester.testSecurityMetrics();
```

### Validation Manuelle

1. **Vérifier l'indicateur** : Doit afficher le statut correct
2. **Ouvrir le tableau de bord** : Doit charger sans erreur
3. **Vérifier les métriques** : Doivent être mises à jour
4. **Tester l'export** : Doit générer un fichier valide

## 🔧 Dépannage

### Problèmes Courants

#### L'indicateur ne s'affiche pas
- Vérifier que le monitoring est démarré
- Vérifier la console pour les erreurs
- Redémarrer l'application

#### Les métriques ne se mettent pas à jour
- Vérifier que l'auto-refresh est activé
- Vérifier la connexion internet
- Actualiser manuellement

#### Erreurs de performance
- Fermer les onglets inutiles
- Vérifier l'utilisation mémoire
- Redémarrer le navigateur

### Logs de Débogage

Activer les logs détaillés :

```typescript
// Dans la console du navigateur
localStorage.setItem('nc_debug_monitoring', 'true');
location.reload();
```

### Réinitialisation

En cas de problème, réinitialiser le monitoring :

```typescript
// Dans la console du navigateur
localStorage.removeItem('nc_monitoring_stats');
localStorage.removeItem('nc_monitoring_alerts');
localStorage.removeItem('nc_metrics_history');
location.reload();
```

## 📚 API de Développement

### Hook useMonitoring

```typescript
import { useMonitoring } from '@/hooks/useMonitoring';

function MyComponent() {
  const {
    stats,                    // Métriques actuelles
    alerts,                   // Alertes actives
    isRefreshing,            // État de rafraîchissement
    autoRefresh,             // Auto-refresh activé
    updateMetrics,           // Fonction de mise à jour
    getSecurityLevel,        // Niveau de sécurité
    getActiveAlertsCount,    // Nombre d'alertes
    exportMetrics,           // Export des données
  } = useMonitoring();

  // Utilisation...
}
```

### Service de Monitoring

```typescript
import { monitoringService } from '@/services/monitoringService';

// Démarrer/arrêter
monitoringService.start();
monitoringService.stop();

// Configuration
monitoringService.updateConfig({...});

// Données
const data = monitoringService.exportData();
const config = monitoringService.getConfig();

// Historique
const history = monitoringService.getHistory();
```

### Enregistrement d'Événements

```typescript
import { 
  recordSecurityEvent, 
  recordPerformanceEvent, 
  recordErrorEvent 
} from '@/services/monitoringService';

// Événement de sécurité
recordSecurityEvent({
  type: 'encryption',
  success: true,
  duration: 5.2,
  details: 'Chiffrement réussi'
});

// Événement de performance
recordPerformanceEvent({
  type: 'api_call',
  value: 1250,
  details: 'Appel API Gemini'
});

// Événement d'erreur
recordErrorEvent({
  type: 'javascript',
  message: 'Erreur de parsing',
  severity: 'medium',
  context: { url: '/api/data' }
});
```

## 🎯 Bonnes Pratiques

### Pour les Utilisateurs
- ✅ Surveiller régulièrement l'indicateur de statut
- ✅ Réagir aux alertes critiques rapidement
- ✅ Exporter les données avant les mises à jour importantes
- ✅ Redémarrer l'application en cas de problème persistant

### Pour les Développeurs
- ✅ Enregistrer les événements importants
- ✅ Utiliser des niveaux d'alerte appropriés
- ✅ Éviter de logger des données sensibles
- ✅ Tester le monitoring après les modifications

### Pour la Maintenance
- ✅ Analyser les tendances de performance
- ✅ Ajuster les seuils d'alerte selon l'usage
- ✅ Nettoyer régulièrement l'historique
- ✅ Documenter les incidents et solutions

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- **Graphiques temps réel** : Visualisation des tendances
- **Alertes intelligentes** : Détection de patterns anormaux
- **Intégration SIEM** : Envoi vers des systèmes de sécurité
- **Machine Learning** : Prédiction des problèmes
- **Rapports automatiques** : Génération de rapports périodiques

### Améliorations Techniques
- **Web Workers** : Collecte en arrière-plan
- **IndexedDB** : Stockage plus performant
- **Service Workers** : Monitoring hors ligne
- **Compression** : Réduction de la taille des données

---

> **💡 Conseil**  
> Le monitoring est conçu pour être non-intrusif et informatif. 
> Il vous aide à maintenir la performance et la sécurité de NeuroChat 
> sans impacter l'expérience utilisateur.

**🔍 NeuroChat - Monitoring Intelligent**  
*Surveillance proactive • Alertes intelligentes • Performance optimisée*
