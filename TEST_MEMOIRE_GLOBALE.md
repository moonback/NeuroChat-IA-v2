# 🧠 Guide de Test de la Mémoire Globale

## 🎯 Objectif
Ce guide vous aide à tester et déboguer le système de mémoire globale de NeuroChat-IA-v2.

## 🚀 Comment Tester

### 1. Démarrer l'Application
```bash
npm run dev
```

### 2. Ouvrir la Mémoire Globale
- Cliquez sur le bouton "Mémoire" dans le menu mobile (trois barres)
- Ou utilisez le raccourci clavier si configuré

### 3. Test Initial
- Ouvrez la console du navigateur (F12)
- Vérifiez que vous voyez le message : `🧠 Service de mémoire globale exposé globalement pour le débogage`

### 4. Créer des Souvenirs de Test
- Dans la modal de mémoire globale, cliquez sur le bouton "Test"
- Cela créera 3 souvenirs de démonstration
- Vérifiez la console pour les logs détaillés

### 5. Vérifier les Souvenirs
- L'onglet "Souvenirs" devrait maintenant afficher 3 éléments
- L'onglet "Statistiques" devrait montrer le total et la répartition par catégorie

## 🔍 Débogage

### Logs de la Console
Les logs suivants devraient apparaître dans la console :

```
🧠 Service de mémoire globale exposé globalement pour le débogage
🧠 Mémoire globale initialisée: 0 éléments
🧠 Chargement mémoire depuis localStorage: 0 caractères
🧠 Aucune mémoire trouvée dans localStorage
🧠 Souvenirs de test créés: 3
🧠 Ajout mémoire: [preferences] "J'aime la programmation et l'intelligence artificielle"
🧠 Nouvelle mémoire ajoutée: test_1234567890_1
🧠 Mémoire sauvegardée. Total: 1
🧠 Mémoire sauvegardée dans localStorage: 1234 caractères
```

### Test Manuel via Console
Vous pouvez aussi tester directement dans la console :

```javascript
// Vérifier que le service est accessible
console.log(window.globalMemoryService);

// Créer des souvenirs de test
await window.globalMemoryService.createTestMemories();

// Vérifier les statistiques
const stats = window.globalMemoryService.getMemoryStats();
console.log(stats);

// Récupérer tous les souvenirs
const memories = window.globalMemoryService.getAllMemories();
console.log(memories);
```

## 🐛 Problèmes Courants

### 1. Mémoire Reste Vide
**Symptôme** : L'onglet "Souvenirs" affiche "Aucun souvenir enregistré"

**Solutions** :
- Vérifiez la console pour les erreurs
- Cliquez sur le bouton "Test" pour créer des souvenirs de démonstration
- Vérifiez que `localStorage` n'est pas bloqué

### 2. Erreurs de Console
**Symptôme** : Messages d'erreur dans la console

**Solutions** :
- Vérifiez que tous les imports sont corrects
- Assurez-vous que le service est initialisé
- Vérifiez les permissions du navigateur

### 3. Souvenirs Non Sauvegardés
**Symptôme** : Les souvenirs disparaissent après rechargement

**Solutions** :
- Vérifiez que `localStorage` fonctionne
- Regardez les logs de sauvegarde dans la console
- Vérifiez les erreurs de JSON

## 📊 Vérification du Fonctionnement

### 1. Sauvegarde
- Créez des souvenirs via le bouton "Test"
- Vérifiez que `localStorage` contient la clé `nc_global_memory`
- Rechargez la page et vérifiez que les souvenirs persistent

### 2. Extraction Automatique
- Créez une nouvelle conversation
- Dites quelque chose comme "J'aime la programmation"
- Sauvegardez la conversation
- Vérifiez que la mémoire globale est mise à jour

### 3. Recherche et Contexte
- Utilisez la barre de recherche dans la modal
- Vérifiez que les souvenirs pertinents sont trouvés
- Testez la génération de contexte pour le prompt système

## 🎯 Tests Recommandés

### Test 1 : Création de Souvenirs
1. Ouvrez la mémoire globale
2. Cliquez sur "Test"
3. Vérifiez que 3 souvenirs apparaissent
4. Vérifiez les statistiques

### Test 2 : Persistance
1. Créez des souvenirs de test
2. Rechargez la page
3. Rouvrez la mémoire globale
4. Vérifiez que les souvenirs sont toujours là

### Test 3 : Extraction Automatique
1. Créez une conversation avec des informations personnelles
2. Sauvegardez la conversation
3. Vérifiez que la mémoire globale est mise à jour
4. Vérifiez les logs dans la console

### Test 4 : Interface Utilisateur
1. Testez la recherche par texte
2. Testez le filtrage par catégorie
3. Testez l'édition d'un souvenir
4. Testez la suppression d'un souvenir

## 🔧 Commandes de Débogage

### Vérifier l'État du Service
```javascript
// Dans la console du navigateur
const service = window.globalMemoryService;
console.log('État du service:', {
  isInitialized: service.isInitialized,
  memoryCount: service.getMemoryStats().total,
  conversationsCount: service.getAllConversations().length
});
```

### Vérifier le LocalStorage
```javascript
// Vérifier les clés de mémoire
console.log('Clés localStorage:', Object.keys(localStorage).filter(k => k.includes('nc_')));
console.log('Mémoire globale:', localStorage.getItem('nc_global_memory'));
console.log('Conversations:', localStorage.getItem('nc_conversation_summaries'));
```

### Test de Performance
```javascript
// Mesurer le temps de traitement
console.time('test-memory');
await window.globalMemoryService.createTestMemories();
console.timeEnd('test-memory');
```

## 📝 Notes Importantes

- **Mode Développement** : Le service est exposé globalement uniquement en mode développement
- **LocalStorage** : Assurez-vous que le navigateur autorise le stockage local
- **Console** : Tous les logs commencent par 🧠 pour faciliter le filtrage
- **Erreurs** : Les erreurs sont loggées avec des détails complets

## 🎉 Succès
Si tout fonctionne correctement, vous devriez voir :
- ✅ 3 souvenirs de test créés
- ✅ Interface utilisateur fonctionnelle
- ✅ Persistance des données
- ✅ Logs détaillés dans la console
- ✅ Extraction automatique des conversations

---

**Besoin d'aide ?** Vérifiez d'abord la console du navigateur pour les messages d'erreur détaillés.
