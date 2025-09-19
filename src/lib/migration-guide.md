# 🎨 Guide de Migration - Unification du Design

## Vue d'ensemble

Ce guide vous aide à migrer vers le nouveau système de design unifié de NeuroChat-IA-v2.

## Composants à remplacer

### 1. ModernButton → UnifiedButton

**Avant :**
```tsx
import { ModernButton } from '@/components/Header';

<ModernButton
  variant="primary"
  size="lg"
  onClick={handleClick}
  tooltip="Mon bouton"
>
  Cliquer
</ModernButton>
```

**Après :**
```tsx
import { UnifiedButton } from '@/components/ui/unified';

<UnifiedButton
  variant="primary"
  size="lg"
  onClick={handleClick}
  tooltip="Mon bouton"
>
  Cliquer
</UnifiedButton>
```

### 2. Button shadcn/ui → UnifiedButton

**Avant :**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm">
  Bouton
</Button>
```

**Après :**
```tsx
import { UnifiedButton } from '@/components/ui/unified';

<UnifiedButton variant="primary" size="sm">
  Bouton
</UnifiedButton>
```

### 3. Dialog → UnifiedModal

**Avant :**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Mon titre</DialogTitle>
    </DialogHeader>
    Contenu
  </DialogContent>
</Dialog>
```

**Après :**
```tsx
import { UnifiedModal, UnifiedModalContent, UnifiedModalHeader, UnifiedModalTitle } from '@/components/ui/unified';

<UnifiedModal open={open} onOpenChange={setOpen}>
  <UnifiedModalContent>
    <UnifiedModalHeader>
      <UnifiedModalTitle>Mon titre</UnifiedModalTitle>
    </UnifiedModalHeader>
    Contenu
  </UnifiedModalContent>
</UnifiedModal>
```

### 4. Input → UnifiedInput

**Avant :**
```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Mon input" />
```

**Après :**
```tsx
import { UnifiedInput } from '@/components/ui/unified';

<UnifiedInput placeholder="Mon input" />
```

### 5. Containers avec gradients → UnifiedContainer

**Avant :**
```tsx
<div className={cn(
  "flex-1 relative transition-all duration-700 group",
  modePrive 
    ? "bg-gradient-to-br from-red-50/40 via-purple-50/50 to-blue-50/40 dark:from-red-950/30 dark:via-purple-950/40 dark:to-blue-950/30" 
    : modeEnfant
    ? "bg-gradient-to-br from-pink-50/50 via-yellow-50/60 to-orange-50/50 dark:from-pink-950/30 dark:via-yellow-950/40 dark:to-orange-950/30"
    : "bg-gradient-to-br from-slate-50/70 via-white/90 to-blue-50/50 dark:from-slate-900/70 dark:via-slate-900/90 dark:to-slate-800/50",
  "backdrop-blur-2xl"
)}>
  Contenu
</div>
```

**Après :**
```tsx
import { UnifiedContainer } from '@/components/ui/unified';

<UnifiedContainer mode={modePrive ? 'private' : modeEnfant ? 'child' : 'normal'}>
  Contenu
</UnifiedContainer>
```

## Utilisation des Design Tokens

### Couleurs et gradients

```tsx
import { colors } from '@/lib/design-tokens';

// Gradients de sécurité
const normalGradient = colors.security.normal;
const privateGradient = colors.security.private;
const childGradient = colors.security.child;

// Couleurs d'état
const successColor = colors.status.success;
const errorColor = colors.status.error;
```

### Animations

```tsx
import { animations } from '@/lib/design-tokens';

// Animations communes
<div className={animations.common.fadeIn}>
  Contenu avec animation
</div>

// Micro-interactions
<button className={animations.micro.button}>
  Bouton avec micro-interaction
</button>
```

### Utilitaires

```tsx
import { utils } from '@/lib/design-tokens';

// Classes de sécurité par mode
const securityClasses = utils.getSecurityClasses('private');

// Classes de bouton unifiées
const buttonClasses = utils.getButtonClasses('primary', 'lg');

// Classes de carte unifiées
const cardClasses = utils.getCardClasses(true); // interactive
```

## Bonnes pratiques

### 1. Utilisez les composants unifiés

Préférez toujours les composants unifiés aux composants shadcn/ui de base :

```tsx
// ✅ Bon
import { UnifiedButton } from '@/components/ui/unified';

// ❌ Éviter
import { Button } from '@/components/ui/button';
```

### 2. Utilisez les design tokens

Pour les styles personnalisés, utilisez les design tokens :

```tsx
// ✅ Bon
import { colors, spacing, borderRadius } from '@/lib/design-tokens';

<div className={`bg-gradient-to-r ${colors.status.success} ${spacing.component.lg} ${borderRadius.card}`}>

// ❌ Éviter
<div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-2xl">
```

### 3. Respectez la hiérarchie des composants

```tsx
// ✅ Structure recommandée
<UnifiedContainer mode="normal">
  <UnifiedCard variant="interactive">
    <UnifiedCardHeader>
      <UnifiedCardTitle>Titre</UnifiedCardTitle>
    </UnifiedCardHeader>
    <UnifiedCardContent>
      <UnifiedButton variant="primary">
        Action
      </UnifiedButton>
    </UnifiedCardContent>
  </UnifiedCard>
</UnifiedContainer>
```

## Migration par étapes

### Étape 1 : Remplacer les boutons
1. Remplacer `ModernButton` par `UnifiedButton`
2. Remplacer `Button` shadcn/ui par `UnifiedButton`
3. Tester les interactions

### Étape 2 : Remplacer les modales
1. Remplacer `Dialog` par `UnifiedModal`
2. Remplacer `AlertDialog` par `UnifiedModal`
3. Tester les animations

### Étape 3 : Remplacer les containers
1. Remplacer les divs avec gradients par `UnifiedContainer`
2. Utiliser les modes de sécurité appropriés
3. Tester les transitions

### Étape 4 : Nettoyer le code
1. Supprimer les imports inutilisés
2. Supprimer les styles inline redondants
3. Optimiser les performances

## Tests

Après migration, vérifiez :

- [ ] Les animations fonctionnent correctement
- [ ] Les gradients de sécurité s'appliquent selon le mode
- [ ] Les interactions (hover, focus) sont cohérentes
- [ ] L'accessibilité est préservée
- [ ] Les performances ne sont pas dégradées

## Support

Pour toute question sur la migration, consultez :
- Le fichier `design-tokens.ts` pour les tokens disponibles
- Les composants dans `src/components/ui/unified-*.tsx` pour les exemples
- Ce guide pour les patterns de migration
