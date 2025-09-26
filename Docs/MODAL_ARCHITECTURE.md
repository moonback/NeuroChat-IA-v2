# 🏗️ Architecture du Design Unifié des Modales

## Structure Hiérarchique

```
ModalBase (Composant de Base)
├── Dialog (Radix UI)
│   └── DialogContent (Plein écran)
│       ├── DialogHeader (Header moderne)
│       │   ├── Icône avec gradient
│       │   ├── Titre + Description
│       │   └── Bouton fermer (X)
│       │
│       ├── Contenu Principal (Scrollable)
│       │   └── Contenu spécifique à chaque modal
│       │
│       └── Footer (Actions & Badges)
│           ├── Badges informatifs
│           └── Actions (boutons)
```

## Modales Implémentées

```
Modales NeuroChat
├── BoltPromptModal (Référence)
│   ├── Icône: Sparkles
│   ├── Badges: Optimisé pour bolt.new, Templates prédéfinis
│   └── Actions: Ouvrir bolt.new, Fermer
│
├── TTSSettingsModal
│   ├── Icône: Sliders
│   ├── Badges: Synthèse vocale, Configuration avancée
│   └── Actions: Fermer
│
├── RagDocsModal
│   ├── Icône: UploadCloud
│   ├── Badges: Documents RAG, Recherche augmentée
│   └── Actions: Fermer
│
├── HistoryModal
│   ├── Icône: History
│   ├── Badges: Historique, Conversations sauvegardées
│   └── Actions: Fermer
│
├── HelpModal
│   ├── Icône: HelpCircle
│   ├── Badges: Guide d'aide, Documentation complète
│   └── Actions: Fermer
│
├── VocalAutoSettingsModal
│   ├── Icône: Mic
│   ├── Badges: Mode vocal, Configuration avancée
│   └── Actions: Réinitialiser, Fermer
│
└── EncryptionSetupModal
    ├── Icône: Shield
    ├── Badges: Chiffrement AES-256, Sécurité gouvernementale
    └── Actions: Annuler, Activer le Chiffrement
```

## Flux de Données

```
Props ModalBase
├── open: boolean
├── onClose: () => void
├── icon: React.ReactNode
├── title: string
├── description?: string
├── children: React.ReactNode
├── badges?: BadgeConfig[]
├── actions?: React.ReactNode
└── contentClassName?: string
```

## Styles CSS Unifiés

```
Classes Principales
├── DialogContent
│   └── w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none
│
├── DialogHeader
│   └── px-6 py-4 border-b
│
├── Icône Container
│   └── p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg
│
├── Contenu Principal
│   └── flex-1 overflow-hidden
│
├── Scroll Container
│   └── h-full overflow-y-auto
│
└── Footer
    └── px-6 py-4 border-t bg-muted/50
```

## Avantages de l'Architecture

### 🎯 Cohérence
- Structure identique pour toutes les modales
- Comportement prévisible
- Maintenance centralisée

### 🚀 Performance
- Composant réutilisable
- Moins de code dupliqué
- Optimisations partagées

### ♿ Accessibilité
- Standards ARIA intégrés
- Navigation clavier
- Contraste respecté

### 📱 Responsive
- Adaptation automatique
- Scroll intelligent
- Touch-friendly

## Migration Future

Pour ajouter une nouvelle modal :

1. **Utiliser ModalBase** comme base
2. **Définir l'icône** appropriée (5x5, blanc)
3. **Créer le contenu** dans children
4. **Ajouter les badges** informatifs
5. **Définir les actions** si nécessaire
6. **Tester** l'accessibilité et responsive

## Exemple de Code

```tsx
// Nouvelle modal utilisant ModalBase
export function NouvelleModal({ open, onClose }) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      icon={<NouvelleIcon className="w-5 h-5 text-white" />}
      title="Titre de la Nouvelle Modal"
      description="Description de la fonctionnalité"
      badges={[
        { icon: <Icon1 className="w-3 h-3" />, text: "Badge 1" },
        { text: "Badge 2", variant: "outline" }
      ]}
      actions={
        <Button onClick={handleAction}>
          Action Personnalisée
        </Button>
      }
    >
      <div className="p-6">
        {/* Contenu spécifique à la modal */}
      </div>
    </ModalBase>
  );
}
```

---

*Cette architecture garantit une expérience utilisateur cohérente et une maintenance simplifiée pour toutes les modales de NeuroChat.*
