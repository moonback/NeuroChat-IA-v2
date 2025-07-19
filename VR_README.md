# 🥽 Mode VR NeuroChat

## Vue d'ensemble

Le mode VR de NeuroChat offre une expérience immersive en réalité virtuelle pour interagir avec l'IA conversationnelle. Utilisant A-Frame et Three.js, cette fonctionnalité permet de chatter avec un avatar 3D animé dans un environnement virtuel.

## ✨ Fonctionnalités

### 🎭 Avatar 3D Interactif
- **Avatar personnalisé** : Robot 3D avec animations en temps réel
- **Expressions dynamiques** : Les yeux et l'indicateur de statut s'animent selon l'état
- **Animations fluides** : Respiration, rotation douce, et réactions aux interactions

### 🎤 Reconnaissance Vocale VR
- **Micro intégré** : Contrôles vocaux directement dans l'environnement VR
- **Transcription en temps réel** : Voir vos paroles s'afficher dans l'espace 3D
- **Commandes vocales** : Parlez naturellement avec l'avatar

### 🔊 Synthèse Vocale Immersive
- **Voix spatialisée** : L'avatar parle avec une voix naturelle
- **Contrôles audio** : Mute/démute directement en VR
- **Réglages vocaux** : Personnalisation de la voix de l'avatar

### 🎮 Contrôles VR
- **Boutons 3D** : Contrôles flottants dans l'espace virtuel
- **Navigation intuitive** : Utilisez les contrôleurs VR ou la souris
- **Interface adaptative** : Interface qui s'adapte au mode VR/Desktop

## 🛠️ Technologies Utilisées

### A-Frame (WebXR)
- **Scène 3D** : Environnement virtuel complet
- **Entités interactives** : Avatar, boutons, textes flottants
- **Support WebXR** : Compatible avec tous les casques VR

### Three.js (Animations Avancées)
- **Rendu 3D** : Graphiques haute performance
- **Animations fluides** : Transitions et effets visuels
- **Optimisations** : Performance optimisée pour VR

### Web Speech API
- **Reconnaissance vocale** : Dictée en temps réel
- **Synthèse vocale** : Voix naturelle pour l'avatar
- **Contrôles audio** : Gestion du son immersif

## 🚀 Installation et Utilisation

### Prérequis
1. **Navigateur compatible** : Chrome, Edge (support WebXR)
2. **Casque VR** : Oculus Quest, HTC Vive, ou similaire
3. **Microphone** : Pour la reconnaissance vocale
4. **Haut-parleurs/Casque** : Pour la synthèse vocale

### Activation du Mode VR
1. **Bouton VR** : Cliquez sur l'icône VR en bas à droite
2. **Vérification** : Le système détecte automatiquement le support VR
3. **Entrée en VR** : Cliquez sur "Entrer en VR" pour l'expérience immersive

### Contrôles en VR
- **Micro** : Bouton rouge pour activer/désactiver l'écoute
- **Mute** : Bouton gris pour couper le son
- **Sortie** : Bouton rouge pour quitter le mode VR

## 🎨 Interface VR

### Environnement 3D
```
┌─────────────────────────────────────┐
│           Ciel (Sky)               │
│                                     │
│    ┌─────────┐    ┌─────────┐     │
│    │ Message │    │ Message │     │
│    │ Utilis. │    │   IA    │     │
│    └─────────┘    └─────────┘     │
│                                     │
│         🤖 Avatar 3D               │
│         (Animé)                    │
│                                     │
│    ┌─────┐  ┌─────┐  ┌─────┐     │
│    │ MIC │  │MUTE │  │EXIT │     │
│    └─────┘  └─────┘  └─────┘     │
│                                     │
│           Sol (Ground)              │
└─────────────────────────────────────┘
```

### États de l'Avatar
- **🟢 Normal** : Avatar au repos, respiration douce
- **🔴 Écoute** : Indicateur rouge pulsant, yeux animés
- **🟦 Réponse** : Indicateur bleu, animation de parole
- **🟡 Chargement** : Indicateur vert, traitement en cours

## 🔧 Configuration

### Paramètres VR
```javascript
// Configuration A-Frame
<a-scene
  vr-mode-ui="enabled: true"
  embedded
  renderer="logarithmicDepthBuffer: true;"
  antialias="true"
>
```

### Animations Three.js
```javascript
// Animation de respiration
avatar.scale.y = 1 + Math.sin(time * 2) * 0.02;

// Animation des yeux
if (isListening || isLoading) {
  leftPupil.position.x = -0.08 + Math.sin(time * 3) * 0.01;
  rightPupil.position.x = 0.08 + Math.sin(time * 3) * 0.01;
}
```

## 📱 Compatibilité

### Navigateurs Supportés
- ✅ **Chrome 79+** : Support WebXR complet
- ✅ **Edge 79+** : Support WebXR complet
- ❌ **Firefox** : Support WebXR limité
- ❌ **Safari** : Pas de support WebXR

### Casques VR Compatibles
- ✅ **Oculus Quest/Quest 2** : Support natif
- ✅ **HTC Vive** : Support complet
- ✅ **Valve Index** : Support complet
- ✅ **Windows Mixed Reality** : Support complet

## 🎯 Fonctionnalités Avancées

### Mode Desktop
- **Aperçu 3D** : Visualisation de l'avatar sans VR
- **Contrôles souris** : Navigation avec la souris
- **Interface adaptative** : Optimisé pour écran 2D

### Intégration IA
- **Personnalités** : L'avatar s'adapte à la personnalité sélectionnée
- **Mémoire** : L'avatar se souvient des conversations
- **RAG** : Support des documents en contexte VR

### Personnalisation
- **Couleurs** : Personnalisation de l'apparence de l'avatar
- **Animations** : Ajustement des animations selon les préférences
- **Environnement** : Modification de l'espace 3D

## 🐛 Dépannage

### Problèmes Courants

**VR ne se lance pas**
- Vérifiez que votre navigateur supporte WebXR
- Assurez-vous que votre casque VR est connecté
- Testez avec Chrome ou Edge

**Pas de son**
- Vérifiez les permissions microphone
- Testez les haut-parleurs/casque
- Vérifiez les paramètres audio du navigateur

**Performance lente**
- Fermez les autres applications
- Réduisez la qualité graphique
- Vérifiez les spécifications matérielles

### Logs de Débogage
```javascript
// Activer les logs VR
console.log('[VR] Support détecté:', isVRSupported);
console.log('[VR] Session active:', isVRActive);
console.log('[VR] Avatar animé:', avatarRef.current);
```

## 🔮 Roadmap VR

### Fonctionnalités Futures
- [ ] **Avatars personnalisables** : Choisir l'apparence de l'avatar
- [ ] **Environnements multiples** : Différents espaces 3D
- [ ] **Gestes** : Reconnaissance des gestes de la main
- [ ] **Multi-utilisateurs** : Chat VR en groupe
- [ ] **Objets 3D** : Manipulation d'objets dans l'espace VR

### Optimisations
- [ ] **Performance** : Optimisation pour casques bas de gamme
- [ ] **Accessibilité** : Support pour utilisateurs handicapés
- [ ] **Mobile VR** : Support pour smartphones VR
- [ ] **AR Mode** : Réalité augmentée sur mobile

## 📚 Ressources

### Documentation
- [A-Frame Documentation](https://aframe.io/docs/)
- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Three.js Documentation](https://threejs.org/docs/)

### Exemples
- [A-Frame VR Examples](https://aframe.io/examples/)
- [WebXR Samples](https://github.com/immersive-web/webxr-samples)

### Communauté
- [A-Frame Slack](https://aframevr-slack.herokuapp.com/)
- [WebXR Discord](https://discord.gg/Jt5tfaM)

---

**NeuroChat VR** - L'avenir de la conversation immersive avec l'IA 🚀 