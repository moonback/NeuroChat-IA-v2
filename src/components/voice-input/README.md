# 🎤 VoiceInput - Composants Refactorisés

## 📋 Vue d'ensemble

Le composant `VoiceInput` a été refactorisé pour améliorer la maintenabilité, la lisibilité et la réutilisabilité. La logique complexe a été extraite dans des hooks personnalisés et des sous-composants modulaires.

## 🏗️ Architecture

### Composants

- **`VoiceInput.tsx`** - Composant principal (réduit de 509 à ~120 lignes)
- **`FilePreview.tsx`** - Aperçu des fichiers sélectionnés
- **`SlashCommands.tsx`** - Suggestions de commandes slash
- **`VoiceIndicator.tsx`** - Indicateur de dictée vocale active
- **`ActionButtons.tsx`** - Boutons d'action (fichier, agent, micro, envoi)

### Hooks

- **`useVoiceInput.ts`** - Gestion de l'état et de la logique principale
- **`useFileHandling.ts`** - Traitement des fichiers (PDF, DOCX, images)

### Utilitaires

- **`fileUtils.ts`** - Fonctions de formatage des fichiers

## 🔧 Fonctionnalités

### Reconnaissance Vocale
- Support multilingue (FR/EN)
- Transcription en temps réel
- Gestion des états d'écoute

### Gestion des Fichiers
- Support des images (aperçu)
- Support des PDF (extraction de texte)
- Support des documents Word (extraction de texte)
- Métadonnées intelligentes

### Commandes Slash
- Suggestions contextuelles
- Navigation clavier (flèches, Tab, Enter)
- Commandes mémoire intégrées

### Interface
- Design responsive mobile-first
- Support du mode sombre
- Animations et transitions fluides
- Accessibilité ARIA complète

## 📱 Responsive Design

- **Mobile** : Boutons empilés, interface adaptée
- **Tablet** : Layout intermédiaire optimisé
- **Desktop** : Interface complète avec tous les éléments

## ♿ Accessibilité

- Labels ARIA pour tous les boutons
- Support de la navigation clavier
- Indicateurs visuels clairs
- Messages d'état explicites

## 🎨 Thèmes

- **Light** : Couleurs claires avec transparences
- **Dark** : Couleurs sombres avec transparences
- Transitions fluides entre les modes

## 🚀 Performance

- `React.memo` pour éviter les re-renders inutiles
- `useCallback` et `useMemo` pour optimiser les fonctions
- Lazy loading des modules PDF/DOCX
- Gestion efficace de l'état

## 📁 Structure des Fichiers

```
src/components/voice-input/
├── index.ts              # Exports
├── VoiceInput.tsx        # Composant principal
├── FilePreview.tsx       # Aperçu des fichiers
├── SlashCommands.tsx     # Commandes slash
├── VoiceIndicator.tsx    # Indicateur vocal
├── ActionButtons.tsx     # Boutons d'action
└── README.md            # Documentation
```

## 🔌 Utilisation

```tsx
import { VoiceInput } from '@/components/VoiceInput';

<VoiceInput
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
  provider="gemini"
  agentEnabled={agentEnabled}
  onToggleAgent={handleToggleAgent}
/>
```

## 🧪 Tests

Chaque composant est conçu pour être testable :
- Props clairement typées
- Logique extraite dans des hooks
- Composants purs et prévisibles
- Pas de dépendances externes complexes

## 🔄 Évolutions Futures

- Support de plus de formats de fichiers
- Amélioration de la reconnaissance vocale
- Intégration avec d'autres services IA
- Personnalisation avancée des thèmes
