# 🥽 Fonctionnalités VR - NeuroChat

## Vue d'ensemble

NeuroChat intègre maintenant la compatibilité WebXR pour les casques de réalité virtuelle, notamment le Meta Quest 3. Cette implémentation permet une expérience immersive de chat avec l'IA.

## 🚀 Fonctionnalités principales

### 1. **Interface VR Immersive**
- Scène 3D avec Three.js
- Avatar IA sous forme de sphère pulsante
- Messages flottants dans l'espace 3D
- Contrôles avec les contrôleurs VR

### 2. **Interaction Vocale**
- Reconnaissance vocale intégrée en VR
- Microphone spatialisé
- Feedback audio pour les interactions
- Transcription en temps réel

### 3. **Personnalisation**
- Paramètres de scène (éclairage, couleurs)
- Configuration UI (distances, échelles)
- Réglages audio (volume, spatialisation)
- Sauvegarde des préférences

## 📁 Structure des fichiers

```
src/xr/
├── types.ts              # Types TypeScript pour VR
├── useWebXR.ts           # Hook personnalisé WebXR
├── VRScene.tsx           # Composant principal VR
├── VRVoiceInput.tsx      # Interface vocale VR
├── VRSettings.tsx        # Paramètres VR
├── VRDetection.tsx       # Détection compatibilité
└── index.ts              # Exports
```

## 🛠️ Installation et utilisation

### Dépendances requises
```bash
npm install three @types/three
```

### Activation du mode VR
1. Cliquez sur l'icône VR dans le header
2. Le casque VR doit être connecté et détecté
3. L'interface bascule automatiquement en mode VR

### Contrôles VR
- **Contrôleurs** : Pointer et cliquer sur les éléments
- **Voix** : Parler pour envoyer des messages
- **Mouvement** : Se déplacer dans l'espace virtuel

## ⚙️ Configuration

### Paramètres de scène
- Couleur de fond
- Intensité lumière ambiante
- Intensité lumière directionnelle

### Paramètres UI
- Distance des messages (1-10m)
- Échelle des messages (0.5-2x)
- Échelle de l'avatar (0.5-3x)
- Distance du panneau (1-5m)

### Paramètres audio
- Volume général
- Audio spatialisé
- Sons de feedback

## 🔧 Développement

### Ajout de nouvelles fonctionnalités VR

1. **Créer un nouveau composant VR**
```typescript
// src/xr/NewVRComponent.tsx
import React from 'react';
import { VRController } from './types';

interface NewVRComponentProps {
  controllers: VRController[];
  // ... autres props
}

export const NewVRComponent: React.FC<NewVRComponentProps> = ({ controllers }) => {
  // Logique du composant
};
```

2. **Intégrer dans VRScene**
```typescript
// Dans VRScene.tsx
import { NewVRComponent } from './NewVRComponent';

// Ajouter dans le rendu
<NewVRComponent controllers={controllers} />
```

3. **Ajouter les types nécessaires**
```typescript
// Dans types.ts
export interface NewVRType {
  // Types pour la nouvelle fonctionnalité
}
```

### Tests VR

Pour tester les fonctionnalités VR :

1. **Navigateur compatible** : Chrome, Firefox avec WebXR
2. **Casque VR** : Meta Quest 3, HTC Vive, etc.
3. **Serveur HTTPS** : WebXR nécessite HTTPS en production

```bash
# Démarrage en mode développement
npm run dev

# Test avec casque VR connecté
# Ouvrir https://localhost:5173
```

## 🐛 Dépannage

### Problèmes courants

1. **WebXR non détecté**
   - Vérifier que le navigateur supporte WebXR
   - S'assurer que le casque est connecté
   - Tester avec un navigateur compatible

2. **Contrôleurs non détectés**
   - Vérifier la connexion des contrôleurs
   - Redémarrer la session VR
   - Vérifier les permissions du navigateur

3. **Audio non fonctionnel**
   - Vérifier les permissions microphone
   - Tester avec un casque audio
   - Vérifier les paramètres audio VR

## 📈 Améliorations futures

- [ ] Support pour d'autres casques VR
- [ ] Avatars 3D personnalisables
- [ ] Environnements VR variés
- [ ] Interactions gestuelles avancées
- [ ] Multi-utilisateur en VR
- [ ] Export/import de configurations VR

## 🤝 Contribution

Pour contribuer aux fonctionnalités VR :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Implémenter avec tests
4. Soumettre une pull request

## 📄 Licence

Ce projet utilise la même licence que NeuroChat principal. 