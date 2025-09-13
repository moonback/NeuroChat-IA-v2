# 🏗️ Architecture du Système de Monitoring - NeuroChat

## Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NEUROCHAT APP                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Header.tsx    │    │   App.tsx       │    │  Components     │            │
│  │                 │    │                 │    │                 │            │
│  │ • Monitoring    │    │ • Initialize    │    │ • ChatContainer │            │
│  │   Status        │    │   Monitoring    │    │ • VoiceInput    │            │
│  │ • Dashboard     │    │ • Start/Stop    │    │ • RAG Sidebar   │            │
│  │   Button        │    │   Service       │    │ • Web Sources   │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           │                       │                       │                    │
│           ▼                       ▼                       ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    MONITORING SERVICE LAYER                            │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │   │
│  │  │ monitoringService│    │  useMonitoring  │    │  Security/Perf  │    │   │
│  │  │                 │    │                 │    │  Monitor        │    │   │
│  │  │ • Collect       │    │ • React Hook    │    │                 │    │   │
│  │  │   Metrics       │    │ • State Mgmt    │    │ • Dashboard     │    │   │
│  │  │ • Manage        │    │ • Auto-refresh  │    │ • Status        │    │   │
│  │  │   Alerts        │    │ • Callbacks     │    │   Indicator     │    │   │
│  │  │ • Store         │    │                 │    │                 │    │   │
│  │  │   History       │    │                 │    │                 │    │   │
│  │  │ • Export        │    │                 │    │                 │    │   │
│  │  │   Data          │    │                 │    │                 │    │   │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA COLLECTION LAYER                          │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │   │
│  │  │   Security      │    │   Performance   │    │     Errors      │    │   │
│  │  │   Metrics       │    │   Metrics       │    │   Tracking      │    │   │
│  │  │                 │    │                 │    │                 │    │   │
│  │  │ • Encryption    │    │ • Memory        │    │ • JavaScript    │    │   │
│  │  │   Status        │    │   Usage         │    │   Errors        │    │   │
│  │  │ • Key Manager   │    │ • Cache Hit     │    │ • Network       │    │   │
│  │  │   Status        │    │   Rate          │    │   Errors        │    │   │
│  │  │ • Success/Fail  │    │ • Render Time   │    │ • Security      │    │   │
│  │  │   Rates         │    │ • API Response  │    │   Errors        │    │   │
│  │  │ • Integrity     │    │ • Bundle Size   │    │ • Performance   │    │   │
│  │  │   Checks        │    │ • Connections   │    │   Errors        │    │   │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        STORAGE LAYER                                   │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │   │
│  │  │   localStorage  │    │   sessionStorage│    │   Memory Cache   │    │   │
│  │  │                 │    │                 │    │                 │    │   │
│  │  │ • Metrics       │    │ • Temporary     │    │ • Active Data   │    │   │
│  │  │   History       │    │   Data          │    │ • Real-time     │    │   │
│  │  │ • Alerts        │    │ • Session       │    │   Updates       │    │   │
│  │  │   Log           │    │   State         │    │ • Performance   │    │   │
│  │  │ • Configuration │    │ • Monitoring    │    │   Buffers       │    │   │
│  │  │   Settings      │    │   State         │    │                 │    │   │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Flux de Données

### 1. Initialisation
```
App.tsx → startMonitoring() → monitoringService.start()
                                ↓
                        Collecte automatique des métriques
                                ↓
                        Stockage dans localStorage
                                ↓
                        Notification des observateurs
```

### 2. Collecte des Métriques
```
monitoringService → collectSecurityMetrics()
                  → collectPerformanceMetrics()
                  → collectErrorMetrics()
                                ↓
                        Enregistrement des événements
                                ↓
                        Vérification des seuils d'alerte
                                ↓
                        Mise à jour des observateurs
```

### 3. Affichage des Données
```
useMonitoring Hook → État React local
                  → Auto-refresh (10s)
                  → Callbacks utilitaires
                                ↓
                        Composants UI
                                ↓
                        Affichage temps réel
```

## Composants Clés

### 1. MonitoringService
- **Rôle** : Service central de collecte et gestion des métriques
- **Responsabilités** :
  - Collecte automatique des métriques
  - Gestion des alertes et seuils
  - Stockage et historique
  - Export des données

### 2. useMonitoring Hook
- **Rôle** : Interface React pour le monitoring
- **Responsabilités** :
  - Gestion de l'état React
  - Auto-refresh configurable
  - Callbacks utilitaires
  - Synchronisation avec le service

### 3. SecurityPerformanceMonitor
- **Rôle** : Tableau de bord principal
- **Responsabilités** :
  - Affichage des métriques
  - Gestion des onglets
  - Export des données
  - Configuration des paramètres

### 4. MonitoringStatusIndicator
- **Rôle** : Indicateur compact dans la barre d'outils
- **Responsabilités** :
  - Affichage du statut général
  - Compteur d'alertes
  - Accès rapide au dashboard
  - Tooltips informatifs

## Types de Métriques

### Sécurité
```typescript
interface SecurityMetrics {
  encryptionActive: boolean;        // Chiffrement AES-256 actif
  secureStorageEnabled: boolean;    // Stockage sécurisé activé
  keyManagerActive: boolean;        // Gestionnaire de clés actif
  totalKeys: number;                // Nombre total de clés
  activeKeys: number;               // Clés actives
  expiredKeys: number;              // Clés expirées
  auditEntries: number;             // Entrées d'audit
  securityLevel: 'none' | 'basic' | 'military'; // Niveau de sécurité
  lastKeyRotation: string;          // Dernière rotation de clé
  failedDecryptions: number;        // Échecs de déchiffrement
  successfulDecryptions: number;    // Succès de déchiffrement
  dataIntegrityChecks: number;      // Vérifications d'intégrité
  failedIntegrityChecks: number;    // Échecs d'intégrité
}
```

### Performance
```typescript
interface PerformanceMetrics {
  memoryUsage: number;              // Utilisation mémoire (MB)
  memoryLimit: number;              // Limite mémoire (MB)
  cacheSize: number;                // Taille du cache (MB)
  cacheHitRate: number;             // Taux de cache (0-1)
  encryptionTime: number;           // Temps de chiffrement (ms)
  decryptionTime: number;           // Temps de déchiffrement (ms)
  apiResponseTime: number;          // Temps de réponse API (ms)
  renderTime: number;               // Temps de rendu (ms)
  bundleSize: number;               // Taille du bundle (MB)
  activeConnections: number;        // Connexions actives
  errorRate: number;                // Taux d'erreur (0-1)
  uptime: number;                   // Temps de fonctionnement (ms)
}
```

## Système d'Alertes

### Niveaux d'Alerte
- **🔴 Critique** : Intervention immédiate requise
- **🟠 Élevé** : Intervention rapide recommandée
- **🟡 Moyen** : Surveillance renforcée
- **🔵 Faible** : Information

### Seuils par Défaut
```typescript
const DEFAULT_THRESHOLDS = {
  memoryUsage: 90,        // 90% d'utilisation mémoire
  errorRate: 5,           // 5% de taux d'erreur
  responseTime: 5000,     // 5 secondes de temps de réponse
  failedDecryptions: 5,   // 5 échecs de déchiffrement
};
```

## Stockage et Persistance

### localStorage
- **Métriques historiques** : Jusqu'à 1000 entrées
- **Configuration** : Paramètres du monitoring
- **Alertes** : Log des alertes (100 dernières)

### sessionStorage
- **Données temporaires** : État de session
- **Cache de performance** : Données en cours de collecte

### Mémoire
- **Données actives** : Métriques en temps réel
- **Cache de calculs** : Résultats mis en cache
- **Observateurs** : Callbacks enregistrés

## Optimisations

### Performance
- **Collecte asynchrone** : Non-bloquante
- **Cache intelligent** : Évite les recalculs
- **Lazy loading** : Composants chargés à la demande
- **Debouncing** : Limite les mises à jour fréquentes

### Mémoire
- **Nettoyage automatique** : Suppression des anciennes données
- **Limite d'historique** : Contrôle de la taille
- **Garbage collection** : Libération des références

### Sécurité
- **Anonymisation** : Pas de données personnelles
- **Chiffrement optionnel** : Métriques sensibles
- **Validation** : Vérification des seuils

## Intégration

### Dans l'Application
```typescript
// App.tsx
import { startMonitoring, stopMonitoring } from '@/services/monitoringService';

useEffect(() => {
  startMonitoring();
  return () => stopMonitoring();
}, []);
```

### Dans les Composants
```typescript
// Header.tsx
import { MonitoringStatusIndicator } from '@/components/MonitoringStatusIndicator';

<MonitoringStatusIndicator 
  onOpenMonitor={() => setShowMonitoring(true)}
  compact={true}
/>
```

### Dans les Services
```typescript
// encryption.ts
import { recordSecurityEvent } from '@/services/monitoringService';

recordSecurityEvent({
  type: 'encryption',
  success: true,
  duration: 5.2,
});
```

## Évolutions Futures

### Fonctionnalités Prévues
- **Graphiques temps réel** : Visualisation des tendances
- **Alertes intelligentes** : Détection de patterns
- **Intégration SIEM** : Envoi vers systèmes externes
- **Machine Learning** : Prédiction des problèmes
- **Rapports automatiques** : Génération périodique

### Améliorations Techniques
- **Web Workers** : Collecte en arrière-plan
- **IndexedDB** : Stockage plus performant
- **Service Workers** : Monitoring hors ligne
- **Compression** : Réduction de la taille des données

---

> **💡 Architecture Modulaire**  
> Le système de monitoring est conçu de manière modulaire pour faciliter 
> la maintenance et l'évolution. Chaque couche a des responsabilités 
> claires et des interfaces bien définies.

**🔍 NeuroChat - Architecture de Monitoring**  
*Surveillance intelligente • Performance optimisée • Sécurité renforcée*
