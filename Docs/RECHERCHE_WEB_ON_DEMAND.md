# 🔍 Recherche Web à la Demande - NeuroChat

## Vue d'ensemble

La recherche web dans NeuroChat a été modifiée pour ne s'exécuter **que lorsque l'utilisateur l'active explicitement**. Cette approche donne un contrôle total à l'utilisateur sur quand et comment la recherche web est utilisée.

## 🎯 Objectifs

### Contrôle Utilisateur
- ✅ **Activation manuelle** : La recherche web ne s'exécute que si l'utilisateur l'active
- ✅ **Transparence** : L'utilisateur sait toujours quand la recherche web est active
- ✅ **Performance** : Évite les recherches web inutiles et améliore les temps de réponse
- ✅ **Privacité** : L'utilisateur contrôle quand ses questions sont envoyées sur le web

### Interface Utilisateur
- ✅ **Indicateurs visuels** : Statut clair de la recherche web dans l'interface
- ✅ **Feedback en temps réel** : Placeholder dynamique dans la zone de saisie
- ✅ **Tooltips informatifs** : Explications claires des actions possibles
- ✅ **Cohérence** : Interface uniforme entre desktop et mobile

## 🔧 Modifications Techniques

### 1. Logique de Recherche Web

#### Avant (Automatique)
```typescript
// Recherche web automatique basée sur plusieurs conditions
if (webEnabled || autoUseWeb || (provider === 'mistral' && mistralAgentEnabled) || (provider === 'gemini' && geminiAgentEnabled)) {
  // Exécution automatique de la recherche web
}
```

#### Après (À la Demande)
```typescript
// Recherche web UNIQUEMENT si explicitement activée par l'utilisateur
if (webEnabled) {
  try {
    setIsWebSearching(true);
    const { searchWeb } = await import('@/services/webSearch');
    const webResults = await searchWeb(userMessage, 5, { enrich: false });
    // Traitement des résultats...
  } catch (error) {
    console.warn('Erreur recherche web:', error);
    addMessage('⚠️ Erreur lors de la recherche web. Vérifiez votre connexion internet.', false);
  } finally {
    setIsWebSearching(false);
  }
}
```

### 2. Interface Utilisateur

#### Header - Bouton de Contrôle
```typescript
<IconButton
  onClick={handleWebToggle}
  tooltip={webEnabled ? "Recherche web activée - Cliquez pour désactiver" : "Recherche web désactivée - Cliquez pour activer"}
  active={!!webEnabled}
  className={webEnabled 
    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40' 
    : 'hover:bg-blue-50/80 dark:hover:bg-blue-950/50'
  }
>
  <Globe className={`w-4 h-4 ${webSearching ? 'animate-spin' : ''}`} />
</IconButton>
```

#### Zone de Saisie - Placeholder Dynamique
```typescript
placeholder={
  listening 
    ? "🎤 Dictée en cours..." 
    : webSearching 
      ? "🔍 Recherche web en cours..." 
      : webEnabled 
        ? "Tapez un message (recherche web activée)…" 
        : "Tapez un message (recherche web désactivée)…"
}
```

### 3. Suppression des Fonctionnalités Automatiques

#### Variables Supprimées
- ❌ `autoUseWeb` - Activation automatique basée sur les mots-clés
- ❌ `autoWebEnabled` - Paramètre d'activation automatique
- ❌ `webKeywords` - Mots-clés pour l'activation automatique
- ❌ `memoizedWebKeywords` - Version mémorisée des mots-clés
- ❌ `setAutoWebEnabled` - Fonction de modification du paramètre
- ❌ `setWebKeywords` - Fonction de modification des mots-clés

#### Composants Nettoyés
- ✅ Suppression des props liées à l'auto-activation dans les composants de paramètres
- ✅ Nettoyage des références dans `GeminiSettingsDrawer`, `OpenAISettingsDrawer`, `MistralSettingsDrawer`
- ✅ Suppression des useEffect liés au stockage des paramètres automatiques

## 🎨 Indicateurs Visuels

### Statut de la Recherche Web

#### 🔵 Activée
- **Bouton** : Bleu avec fond coloré
- **Icône** : Globe normal
- **Placeholder** : "Tapez un message (recherche web activée)…"
- **Tooltip** : "Recherche web activée - Cliquez pour désactiver"

#### ⚪ Désactivée
- **Bouton** : Gris avec hover bleu
- **Icône** : Globe normal
- **Placeholder** : "Tapez un message (recherche web désactivée)…"
- **Tooltip** : "Recherche web désactivée - Cliquez pour activer"

#### 🔄 En Cours
- **Bouton** : Bleu avec fond coloré
- **Icône** : Globe avec animation de rotation
- **Placeholder** : "🔍 Recherche web en cours..."
- **Tooltip** : "Recherche web en cours..."

### Feedback Utilisateur

#### Activation
```typescript
if (newWebEnabled) {
  console.log('🔍 Recherche web activée - Les prochaines questions incluront des résultats web');
  // Vibration différente pour l'activation
  if ('vibrate' in navigator) navigator.vibrate(100);
}
```

#### Désactivation
```typescript
else {
  console.log('🔍 Recherche web désactivée - Les questions utiliseront uniquement les connaissances de base');
  // Vibration différente pour la désactivation
  if ('vibrate' in navigator) navigator.vibrate(50);
}
```

## 📱 Compatibilité Mobile

### Interface Mobile
- ✅ **TileButton** avec statut visuel clair
- ✅ **Intent** : `success` quand activé, `default` quand désactivé
- ✅ **Tooltips** adaptés pour mobile
- ✅ **Feedback haptic** sur les appareils compatibles

### Cohérence Desktop/Mobile
- ✅ Même logique de contrôle
- ✅ Même feedback utilisateur
- ✅ Même indicateurs visuels
- ✅ Même comportement de recherche

## 🚀 Avantages

### Performance
- **Temps de réponse** : Plus rapide quand la recherche web est désactivée
- **Bande passante** : Économie de données internet
- **Ressources** : Moins de charge sur les serveurs de recherche

### Contrôle Utilisateur
- **Transparence** : L'utilisateur sait exactement quand la recherche web est utilisée
- **Choix** : Contrôle total sur l'activation/désactivation
- **Privacité** : Pas de recherche web non désirée

### Expérience Utilisateur
- **Clarté** : Interface claire et compréhensible
- **Feedback** : Indicateurs visuels et sonores appropriés
- **Cohérence** : Comportement prévisible et logique

## 🔧 Configuration

### Activation de la Recherche Web

#### Méthode 1 : Bouton Header
1. Cliquer sur l'icône Globe dans le header
2. Le bouton devient bleu (activé)
3. Le placeholder change pour indiquer l'activation

#### Méthode 2 : Menu Mobile
1. Ouvrir le menu mobile (hamburger)
2. Cliquer sur "Web: OFF" pour l'activer
3. Le statut change en "Web: ON"

### Désactivation de la Recherche Web

#### Méthode 1 : Bouton Header
1. Cliquer sur l'icône Globe bleue dans le header
2. Le bouton redevient gris (désactivé)
3. Le placeholder change pour indiquer la désactivation

#### Méthode 2 : Menu Mobile
1. Ouvrir le menu mobile (hamburger)
2. Cliquer sur "Web: ON" pour le désactiver
3. Le statut change en "Web: OFF"

## 🛡️ Gestion d'Erreurs

### Erreurs de Connexion
```typescript
catch (error) {
  console.warn('Erreur recherche web:', error);
  // Ajouter une alerte pour informer l'utilisateur
  addMessage('⚠️ Erreur lors de la recherche web. Vérifiez votre connexion internet.', false);
}
```

### Indicateurs d'Erreur
- **Message d'erreur** : Affiché dans le chat
- **Console** : Logs détaillés pour le débogage
- **Interface** : Retour à l'état normal après l'erreur

## 📊 Métriques et Monitoring

### Suivi des Activations
- **Console logs** : Activation/désactivation trackées
- **Feedback utilisateur** : Messages informatifs
- **État persistant** : Mémorisé dans le localStorage

### Performance
- **Temps de réponse** : Amélioration quand désactivé
- **Utilisation réseau** : Réduction significative
- **Expérience utilisateur** : Plus fluide et prévisible

## 🔮 Évolutions Futures

### Fonctionnalités Possibles
- **Recherche web contextuelle** : Activation automatique pour certains types de questions
- **Paramètres avancés** : Configuration fine des déclencheurs
- **Historique des recherches** : Suivi des recherches web effectuées
- **Statistiques d'usage** : Métriques sur l'utilisation de la recherche web

### Améliorations Interface
- **Raccourcis clavier** : Activation/désactivation rapide
- **Notifications** : Alertes pour les nouvelles fonctionnalités
- **Tutoriel** : Guide d'utilisation pour les nouveaux utilisateurs

---

> **💡 Conseil**  
> La recherche web à la demande donne un contrôle total à l'utilisateur 
> tout en améliorant les performances et la transparence du système.

**🔍 NeuroChat - Recherche Web Intelligente**  
*Contrôle utilisateur • Performance optimisée • Interface claire*
