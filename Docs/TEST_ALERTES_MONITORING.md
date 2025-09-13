# 🧪 Test des Alertes de Monitoring - NeuroChat

## Vue d'ensemble

Ce guide explique comment tester et valider le système d'alertes du monitoring de NeuroChat.

## 🚀 Tests Rapides

### 1. Test Automatique

Ouvrez la console du navigateur et exécutez :

```javascript
// Ajouter des alertes de test
testAlerts();

// Recharger la page pour voir les alertes
location.reload();
```

### 2. Test Manuel

```javascript
// Ajouter une alerte spécifique
addTestAlert('security', 'critical', 'Test d\'alerte critique personnalisée');

// Ajouter une alerte de performance
addTestAlert('performance', 'high', 'Test d\'alerte performance personnalisée');

// Ajouter une alerte d'erreur
addTestAlert('error', 'medium', 'Test d\'alerte erreur personnalisée');
```

### 3. Nettoyage

```javascript
// Supprimer toutes les alertes de test
clearTestAlerts();

// Recharger la page
location.reload();
```

## 📊 Types d'Alertes de Test

### Alertes de Sécurité
- **Critique** : Chiffrement désactivé
- **Élevé** : Échecs de déchiffrement
- **Moyen** : Tentatives d'accès suspectes
- **Faible** : Suggestions de sécurité

### Alertes de Performance
- **Critique** : Utilisation mémoire > 95%
- **Élevé** : Utilisation mémoire > 90%
- **Moyen** : Taux de cache < 50%
- **Faible** : Temps de réponse > 5s

### Alertes d'Erreur
- **Critique** : Erreurs JavaScript non gérées
- **Élevé** : Erreurs de réseau
- **Moyen** : Erreurs de sécurité
- **Faible** : Erreurs de performance

## 🎛️ Interface de Test

### Accès au Dashboard
1. Cliquez sur l'indicateur de monitoring dans la barre d'outils
2. Allez dans l'onglet "Alertes"
3. Vérifiez que les alertes s'affichent correctement

### Fonctionnalités à Tester

#### Affichage des Alertes
- ✅ Alertes actives avec couleurs appropriées
- ✅ Alertes résolues avec style barré
- ✅ Compteurs d'alertes corrects
- ✅ Timestamps formatés

#### Actions sur les Alertes
- ✅ Bouton "Résoudre" pour chaque alerte active
- ✅ Bouton "Marquer tout comme résolu"
- ✅ Bouton "Supprimer toutes les alertes"
- ✅ Compteur total d'alertes

#### Gestion des États
- ✅ Alertes actives vs résolues
- ✅ Filtrage par niveau de criticité
- ✅ Persistance des changements

## 🔧 Configuration des Tests

### Seuils d'Alerte

```javascript
// Modifier les seuils pour déclencher des alertes
monitoringService.updateConfig({
  alertThresholds: {
    memoryUsage: 80,        // 80% au lieu de 90%
    errorRate: 2,           // 2% au lieu de 5%
    responseTime: 3000,     // 3s au lieu de 5s
    failedDecryptions: 2,   // 2 au lieu de 5
  }
});
```

### Génération d'Alertes Réelles

```javascript
// Forcer des conditions d'alerte
recordPerformanceEvent({
  type: 'memory_usage',
  value: 95, // Au-dessus du seuil
  details: 'Test de mémoire élevée'
});

recordSecurityEvent({
  type: 'decryption',
  success: false,
  details: 'Test d\'échec de déchiffrement'
});
```

## 📈 Validation des Tests

### Checklist de Validation

#### Affichage
- [ ] Les alertes s'affichent dans l'onglet "Alertes"
- [ ] Les couleurs correspondent aux niveaux de criticité
- [ ] Les icônes sont appropriées pour chaque type
- [ ] Les timestamps sont formatés correctement

#### Fonctionnalités
- [ ] Le bouton "Résoudre" fonctionne
- [ ] Le bouton "Marquer tout comme résolu" fonctionne
- [ ] Le bouton "Supprimer toutes les alertes" fonctionne
- [ ] Les compteurs se mettent à jour correctement

#### Persistance
- [ ] Les alertes persistent après rechargement
- [ ] Les changements d'état sont sauvegardés
- [ ] L'historique est conservé

#### Performance
- [ ] L'affichage est fluide avec de nombreuses alertes
- [ ] Le scroll fonctionne correctement
- [ ] Les actions sont rapides

## 🐛 Dépannage

### Problèmes Courants

#### Les alertes ne s'affichent pas
```javascript
// Vérifier que les alertes sont dans localStorage
console.log(localStorage.getItem('nc_monitoring_alerts'));

// Forcer le rechargement des alertes
location.reload();
```

#### Les alertes ne se mettent pas à jour
```javascript
// Vérifier que le monitoring est actif
console.log(monitoringService.getConfig());

// Forcer la mise à jour
monitoringService.start();
```

#### Erreurs de console
```javascript
// Vérifier les erreurs
console.error('Erreurs de monitoring:', error);

// Nettoyer et recommencer
clearTestAlerts();
testAlerts();
```

### Logs de Débogage

```javascript
// Activer les logs détaillés
localStorage.setItem('nc_debug_monitoring', 'true');

// Vérifier l'état du monitoring
console.log('État du monitoring:', {
  config: monitoringService.getConfig(),
  alerts: JSON.parse(localStorage.getItem('nc_monitoring_alerts') || '[]'),
  stats: monitoringService.exportData()
});
```

## 📋 Scénarios de Test

### Scénario 1 : Alertes de Sécurité
1. Désactiver le chiffrement
2. Vérifier qu'une alerte critique apparaît
3. Réactiver le chiffrement
4. Vérifier que l'alerte disparaît

### Scénario 2 : Alertes de Performance
1. Simuler une utilisation mémoire élevée
2. Vérifier qu'une alerte performance apparaît
3. Résoudre l'alerte
4. Vérifier qu'elle passe en "résolue"

### Scénario 3 : Gestion des Alertes
1. Ajouter plusieurs alertes de test
2. Résoudre certaines alertes
3. Supprimer toutes les alertes
4. Vérifier que l'interface se met à jour

### Scénario 4 : Persistance
1. Ajouter des alertes
2. Recharger la page
3. Vérifier que les alertes persistent
4. Modifier l'état des alertes
5. Recharger à nouveau
6. Vérifier que les changements persistent

## 🎯 Résultats Attendus

### Interface Utilisateur
- **Alertes actives** : Affichées avec couleurs vives et boutons d'action
- **Alertes résolues** : Affichées avec style barré et opacité réduite
- **Compteurs** : Mis à jour en temps réel
- **Actions** : Fonctionnelles et intuitives

### Performance
- **Affichage fluide** : Même avec de nombreuses alertes
- **Actions rapides** : Réponse immédiate aux clics
- **Persistance** : Données sauvegardées correctement

### Fonctionnalités
- **Gestion complète** : Création, résolution, suppression
- **Filtrage** : Séparation actives/résolues
- **Export** : Données exportables au format JSON

## 🔮 Tests Avancés

### Test de Charge
```javascript
// Ajouter 100 alertes de test
for (let i = 0; i < 100; i++) {
  addTestAlert('performance', 'medium', `Alerte de test ${i + 1}`);
}
```

### Test de Persistance
```javascript
// Tester la persistance avec des données complexes
const complexAlerts = [
  {
    type: 'security',
    level: 'critical',
    message: 'Alerte complexe avec détails',
    details: 'Détails très longs...'.repeat(100),
    resolved: false
  }
];
localStorage.setItem('nc_monitoring_alerts', JSON.stringify(complexAlerts));
```

### Test de Performance
```javascript
// Mesurer le temps d'affichage
console.time('Affichage des alertes');
testAlerts();
console.timeEnd('Affichage des alertes');
```

---

> **💡 Conseil**  
> Utilisez ces tests pour valider que le système d'alertes fonctionne 
> correctement avant la mise en production. Les tests automatiques 
> peuvent être intégrés dans un pipeline CI/CD.

**🔍 NeuroChat - Tests d'Alertes**  
*Validation complète • Tests automatisés • Qualité assurée*
