# 🚀 Module Générateur de Prompts bolt.new

## Vue d'ensemble

Le module **Générateur de Prompts bolt.new** est une fonctionnalité avancée intégrée à NeuroChat-IA-v2 qui permet de créer des prompts système optimisés pour le développement avec [bolt.new](https://bolt.new).

## Fonctionnalités principales

### ✨ Templates prédéfinis
- **Application Web Moderne** : Template pour React/Next.js avec TypeScript
- **Application Mobile React Native** : Template pour applications mobiles cross-platform
- **Projet IA/ML** : Template pour projets d'intelligence artificielle et machine learning

### 🎯 Presets intelligents
- **MVP Startup** : Configuration optimisée pour validation rapide
- **Application Entreprise** : Configuration pour applications robustes
- **App Mobile Consommateur** : Configuration pour applications grand public

### 🔧 Configuration dynamique
- Paramètres personnalisables par template
- Variables avec validation et types appropriés
- Interface intuitive avec sélecteurs multiples

### 📊 Gestion avancée
- Historique des prompts générés
- Système de notation et feedback
- Export/import de configurations
- Statistiques d'utilisation

## Architecture technique

### Structure des fichiers

```
src/
├── types/
│   └── boltPrompt.ts              # Types TypeScript
├── services/
│   └── boltPromptService.ts       # Service principal
├── components/
│   ├── BoltPromptGenerator.tsx    # Composant principal
│   └── BoltPromptModal.tsx        # Modal d'intégration
└── hooks/
    └── useBoltPrompt.ts           # Hook personnalisé
```

### Types principaux

```typescript
interface BoltPromptTemplate {
  id: string;
  name: string;
  description: string;
  category: BoltPromptCategory;
  template: string;
  variables: BoltPromptVariable[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

interface BoltPromptConfig {
  projectType: string;
  techStack: string[];
  features: string[];
  targetAudience: string;
  complexity: 'simple' | 'intermediate' | 'advanced' | 'expert';
  timeline: string;
  budget: string;
  constraints: string[];
  goals: string[];
  inspiration?: string;
  additionalContext?: string;
}
```

## Utilisation

### Accès au générateur

1. **Via le Header** : Cliquez sur le bouton "Prompts bolt.new" dans le menu
2. **Via le menu mobile** : Accédez via le menu hamburger sur mobile
3. **Raccourci clavier** : `Ctrl+Shift+B` (à implémenter)

### Workflow de génération

1. **Sélection du template** : Choisissez parmi les templates disponibles
2. **Configuration** : Remplissez les paramètres du projet
3. **Génération** : Cliquez sur "Générer le Prompt"
4. **Utilisation** : Copiez le prompt dans bolt.new

### Exemple de prompt généré

```
Tu es un développeur expert spécialisé dans la création d'applications web modernes avec bolt.new.

PROJET: MonApp
TYPE: Application Web Moderne
STACK TECHNIQUE: React, TypeScript, Tailwind CSS
COMPLEXITÉ: Intermédiaire

OBJECTIFS DU PROJET:
- Créer une plateforme de gestion de tâches intuitive

FONCTIONNALITÉS PRINCIPALES:
- Authentification, CRUD tâches, notifications, dashboard

PUBLIC CIBLE: Équipes de développement, freelancers

CONTRAINTES ET EXIGENCES:
- Budget limité, délai serré, accessibilité requise

INSTRUCTIONS DE DÉVELOPPEMENT:

1. ARCHITECTURE ET STRUCTURE:
- Utilise une architecture modulaire et scalable
- Implémente les meilleures pratiques React/Next.js
- Structure le code de manière claire et maintenable
- Utilise TypeScript pour la sécurité des types

[... suite du prompt ...]
```

## Intégration avec NeuroChat

### Sécurité et chiffrement
- Respecte les modes de sécurité (Normal, Privé, Enfant)
- Chiffrement AES-256 des données sensibles
- Pas d'accès en mode privé pour protéger la confidentialité

### Espaces de travail
- Configuration sauvegardée par espace de travail
- Isolation des données entre projets
- Synchronisation automatique

### Interface responsive
- Design mobile-first avec Tailwind CSS
- Composants shadcn/ui pour la cohérence
- Accessibilité WCAG 2.1

## API du service

### Méthodes principales

```typescript
// Génération de prompt
generatePrompt(templateId: string, config: BoltPromptConfig): GeneratedBoltPrompt

// Gestion des templates
getTemplates(): BoltPromptTemplate[]
getTemplatesByCategory(category: BoltPromptCategory): BoltPromptTemplate[]
createTemplate(template: Omit<BoltPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): BoltPromptTemplate

// Gestion des presets
getPresets(): BoltPromptPreset[]
createPreset(preset: Omit<BoltPromptPreset, 'id'>): BoltPromptPreset

// Historique et statistiques
getGeneratedPrompts(): GeneratedBoltPrompt[]
updateGeneratedPromptRating(id: string, rating: number, feedback?: string): boolean
getStats(): BoltPromptStats
```

## Personnalisation

### Création de templates personnalisés

```typescript
const customTemplate = {
  name: 'Mon Template Personnalisé',
  description: 'Description du template',
  category: 'web-app' as BoltPromptCategory,
  template: 'Mon prompt personnalisé avec {{variable}}',
  variables: [
    {
      name: 'variable',
      type: 'text' as const,
      label: 'Ma Variable',
      required: true,
      placeholder: 'Valeur par défaut'
    }
  ],
  tags: ['custom', 'web']
};

boltPromptService.createTemplate(customTemplate);
```

### Extension des catégories

```typescript
type BoltPromptCategory = 
  | 'web-app'
  | 'mobile-app'
  | 'desktop-app'
  | 'api'
  | 'database'
  | 'ai-ml'
  | 'game'
  | 'ecommerce'
  | 'social'
  | 'productivity'
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'entertainment'
  | 'other'
  | 'ma-nouvelle-categorie'; // Ajouter ici
```

## Performance et optimisation

### Lazy loading
- Composants chargés à la demande
- Réduction du bundle initial
- Amélioration des temps de chargement

### Mise en cache
- Templates et presets en localStorage
- Configuration persistante par workspace
- Optimisation des re-renders

### Gestion mémoire
- Nettoyage automatique des données temporaires
- Limitation de l'historique (100 entrées max)
- Compression des données stockées

## Tests et qualité

### Tests unitaires recommandés
```typescript
describe('BoltPromptService', () => {
  it('should generate prompt with valid template', () => {
    const config = { projectType: 'Test', techStack: ['React'] };
    const result = boltPromptService.generatePrompt('web-app-modern', config);
    expect(result.generatedPrompt).toContain('Test');
  });
});
```

### Validation des données
- Validation TypeScript stricte
- Vérification des types à l'exécution
- Gestion d'erreurs robuste

## Roadmap et évolutions

### Fonctionnalités futures
- [ ] Templates communautaires
- [ ] Partage de prompts
- [ ] Intégration API bolt.new
- [ ] Templates par domaine métier
- [ ] IA pour suggestions de prompts

### Améliorations techniques
- [ ] Tests automatisés complets
- [ ] Monitoring des performances
- [ ] Analytics d'utilisation
- [ ] Export en formats multiples

## Support et contribution

### Documentation
- Code documenté avec JSDoc
- Exemples d'utilisation
- Guide de contribution

### Issues et bugs
- Rapport via GitHub Issues
- Priorité selon la criticité
- Corrections rapides

---

*Ce module fait partie intégrante de NeuroChat-IA-v2 et respecte toutes les conventions de sécurité et de qualité du projet.*
