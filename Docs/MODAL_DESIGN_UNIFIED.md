# 🎨 Design Unifié des Modales NeuroChat

## Vue d'ensemble

Toutes les modales de NeuroChat utilisent maintenant un design unifié inspiré de `BoltPromptModal`. Ce design offre :

- **Cohérence visuelle** : Toutes les modales ont le même look & feel
- **Expérience utilisateur** : Navigation intuitive et prévisible
- **Accessibilité** : Support complet des standards WCAG
- **Responsive** : Adaptation parfaite sur tous les écrans
- **Maintenabilité** : Code réutilisable et facile à maintenir

## Structure du Design

### 1. Header Moderne
```tsx
<DialogHeader className="px-6 py-4 border-b">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <DialogTitle className="text-xl font-bold">
          Titre de la Modal
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          Description optionnelle
        </p>
      </div>
    </div>
    <Button variant="ghost" size="sm" onClick={onClose}>
      <X className="w-4 h-4" />
    </Button>
  </div>
</DialogHeader>
```

### 2. Contenu Scrollable
```tsx
<div className="flex-1 overflow-hidden">
  <div className="h-full overflow-y-auto">
    {/* Contenu de la modal */}
  </div>
</div>
```

### 3. Footer avec Badges et Actions
```tsx
<div className="px-6 py-4 border-t bg-muted/50">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        Badge 1
      </Badge>
    </div>
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={onClose}>
        Fermer
      </Button>
    </div>
  </div>
</div>
```

## Composant ModalBase

Pour faciliter la création de nouvelles modales, utilisez le composant `ModalBase` :

```tsx
import { ModalBase } from '@/components/ui/modal-base';

export function MaModal({ open, onClose }) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      icon={<Settings className="w-5 h-5 text-white" />}
      title="Titre de ma Modal"
      description="Description optionnelle"
      badges={[
        { icon: <Icon className="w-3 h-3" />, text: "Badge 1" },
        { text: "Badge 2", variant: "outline" }
      ]}
    >
      <div className="p-6">
        {/* Contenu de votre modal */}
      </div>
    </ModalBase>
  );
}
```

## Modales Mises à Jour

Les modales suivantes ont été mises à jour avec le nouveau design :

### ✅ TTSSettingsModal
- **Icône** : Sliders
- **Badges** : Synthèse vocale, Configuration avancée
- **Fonctionnalités** : Configuration voix, vitesse, tonalité, volume

### ✅ RagDocsModal  
- **Icône** : UploadCloud
- **Badges** : Documents RAG, Recherche augmentée
- **Fonctionnalités** : Import/export documents, gestion fichiers

### ✅ HistoryModal
- **Icône** : History
- **Badges** : Historique, Conversations sauvegardées
- **Fonctionnalités** : Gestion historique, recherche, tri

### ✅ HelpModal
- **Icône** : HelpCircle
- **Badges** : Guide d'aide, Documentation complète
- **Fonctionnalités** : Guide utilisateur, onglets thématiques

### ✅ VocalAutoSettingsModal
- **Icône** : Mic
- **Badges** : Mode vocal, Configuration avancée
- **Fonctionnalités** : Paramètres reconnaissance vocale

### ✅ EncryptionSetupModal
- **Icône** : Shield
- **Badges** : Chiffrement AES-256, Sécurité gouvernementale
- **Fonctionnalités** : Configuration chiffrement, validation mot de passe

## Avantages du Nouveau Design

### 🎯 Cohérence
- Même structure pour toutes les modales
- Navigation prévisible pour l'utilisateur
- Identité visuelle forte

### 🚀 Performance
- Composant `ModalBase` réutilisable
- Moins de code dupliqué
- Maintenance simplifiée

### ♿ Accessibilité
- Support complet du clavier
- Labels ARIA appropriés
- Contraste respecté

### 📱 Responsive
- Adaptation automatique aux écrans
- Scroll géré intelligemment
- Touch-friendly sur mobile

## Bonnes Pratiques

### 1. Utilisation des Icônes
```tsx
// ✅ Bon - Icône avec taille cohérente
<Settings className="w-5 h-5 text-white" />

// ❌ Éviter - Tailles variables
<Settings className="w-4 h-4 text-white" />
```

### 2. Badges Informatifs
```tsx
// ✅ Bon - Badges descriptifs
badges={[
  { icon: <Volume2 className="w-3 h-3" />, text: "Synthèse vocale" },
  { text: "Configuration avancée", variant: "outline" }
]}

// ❌ Éviter - Badges génériques
badges={[
  { text: "Info" },
  { text: "Settings" }
]}
```

### 3. Contenu Structuré
```tsx
// ✅ Bon - Contenu dans un conteneur avec padding
<div className="p-6">
  <h3>Titre section</h3>
  <p>Contenu...</p>
</div>

// ❌ Éviter - Contenu sans structure
<p>Contenu direct</p>
```

## Migration des Modales Existantes

Pour migrer une modale existante vers le nouveau design :

1. **Remplacer la structure** par `ModalBase`
2. **Définir l'icône** appropriée (5x5, blanc)
3. **Ajouter des badges** informatifs
4. **Structurer le contenu** avec padding approprié
5. **Tester l'accessibilité** et le responsive

## Exemples Complets

Voir `src/components/examples/ModalBaseExample.tsx` pour des exemples d'utilisation complète du composant `ModalBase`.

---

*Ce design unifié garantit une expérience utilisateur cohérente et professionnelle sur toutes les modales de NeuroChat.*
