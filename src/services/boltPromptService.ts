/**
 * 🔧 Service de Génération de Prompts Système bolt.new
 * 
 * Service intelligent pour créer des prompts système optimisés pour bolt.new
 * - Templates prédéfinis pour différents types de projets
 * - Génération dynamique basée sur les spécifications utilisateur
 * - Optimisation pour le développement rapide et efficace
 */

import type { 
  BoltPromptTemplate, 
  BoltPromptConfig, 
  GeneratedBoltPrompt, 
  BoltPromptCategory,
  BoltPromptPreset 
} from '@/types/boltPrompt';

// Templates prédéfinis pour différents types de projets
const DEFAULT_TEMPLATES: BoltPromptTemplate[] = [
  {
    id: 'web-app-modern',
    name: 'Application Web Moderne',
    description: 'Template pour une application web moderne avec React/Next.js',
    category: 'web-app',
    template: `Tu es un développeur expert spécialisé dans la création d'applications web modernes avec bolt.new.

PROJET: {{projectName}}
TYPE: Application Web Moderne
STACK TECHNIQUE: {{techStack}}
COMPLEXITÉ: {{complexity}}

OBJECTIFS DU PROJET:
{{goals}}

FONCTIONNALITÉS PRINCIPALES:
{{features}}

PUBLIC CIBLE: {{targetAudience}}

CONTRAINTES ET EXIGENCES:
{{constraints}}

INSTRUCTIONS DE DÉVELOPPEMENT:

1. ARCHITECTURE ET STRUCTURE:
- Utilise une architecture modulaire et scalable
- Implémente les meilleures pratiques React/Next.js
- Structure le code de manière claire et maintenable
- Utilise TypeScript pour la sécurité des types

2. DESIGN ET UX:
- Crée une interface moderne et responsive
- Utilise Tailwind CSS pour le styling
- Implémente un design system cohérent
- Optimise l'expérience utilisateur mobile-first

3. FONCTIONNALITÉS TECHNIQUES:
- Implémente l'authentification sécurisée
- Ajoute la gestion d'état appropriée (Zustand/Context)
- Intègre les APIs nécessaires
- Optimise les performances et le SEO

4. QUALITÉ ET TESTS:
- Écris du code propre et documenté
- Ajoute des tests unitaires pour les fonctions critiques
- Implémente la gestion d'erreurs robuste
- Optimise le bundle et les performances

5. DÉPLOIEMENT:
- Configure le déploiement automatique
- Optimise pour la production
- Ajoute le monitoring et les analytics

CONTEXTE ADDITIONNEL:
{{additionalContext}}

Commence par créer la structure de base du projet et implémente les fonctionnalités une par une, en suivant les meilleures pratiques de développement moderne.`,
    variables: [
      {
        name: 'projectName',
        type: 'text',
        label: 'Nom du projet',
        description: 'Le nom de votre application web',
        required: true,
        placeholder: 'MonApp'
      },
      {
        name: 'techStack',
        type: 'multiselect',
        label: 'Stack technique',
        description: 'Technologies à utiliser',
        required: true,
        options: [
          { value: 'React', label: 'React' },
          { value: 'Next.js', label: 'Next.js' },
          { value: 'TypeScript', label: 'TypeScript' },
          { value: 'Tailwind CSS', label: 'Tailwind CSS' },
          { value: 'Zustand', label: 'Zustand' },
          { value: 'React Query', label: 'React Query' },
          { value: 'Supabase', label: 'Supabase' },
          { value: 'Prisma', label: 'Prisma' },
          { value: 'PostgreSQL', label: 'PostgreSQL' }
        ],
        defaultValue: ['React', 'TypeScript', 'Tailwind CSS']
      },
      {
        name: 'complexity',
        type: 'select',
        label: 'Complexité',
        description: 'Niveau de complexité du projet',
        required: true,
        options: [
          { value: 'simple', label: 'Simple' },
          { value: 'intermediate', label: 'Intermédiaire' },
          { value: 'advanced', label: 'Avancé' },
          { value: 'expert', label: 'Expert' }
        ],
        defaultValue: 'intermediate'
      },
      {
        name: 'goals',
        type: 'text',
        label: 'Objectifs',
        description: 'Objectifs principaux du projet',
        required: true,
        placeholder: 'Créer une plateforme de gestion de tâches intuitive'
      },
      {
        name: 'features',
        type: 'text',
        label: 'Fonctionnalités',
        description: 'Fonctionnalités principales à implémenter',
        required: true,
        placeholder: 'Authentification, CRUD tâches, notifications, dashboard'
      },
      {
        name: 'targetAudience',
        type: 'text',
        label: 'Public cible',
        description: 'Qui va utiliser cette application',
        required: true,
        placeholder: 'Équipes de développement, freelancers'
      },
      {
        name: 'constraints',
        type: 'text',
        label: 'Contraintes',
        description: 'Contraintes techniques ou business',
        required: false,
        placeholder: 'Budget limité, délai serré, accessibilité requise'
      },
      {
        name: 'additionalContext',
        type: 'text',
        label: 'Contexte additionnel',
        description: 'Informations supplémentaires',
        required: false,
        placeholder: 'Inspiration, références, exigences spéciales'
      }
    ],
    tags: ['web', 'react', 'modern', 'fullstack'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true
  },
  {
    id: 'mobile-app-react-native',
    name: 'Application Mobile React Native',
    description: 'Template pour une application mobile avec React Native',
    category: 'mobile-app',
    template: `Tu es un développeur expert spécialisé dans la création d'applications mobiles avec React Native et Expo.

PROJET: {{projectName}}
TYPE: Application Mobile
PLATEFORME: {{platform}}
STACK TECHNIQUE: {{techStack}}
COMPLEXITÉ: {{complexity}}

OBJECTIFS DU PROJET:
{{goals}}

FONCTIONNALITÉS PRINCIPALES:
{{features}}

PUBLIC CIBLE: {{targetAudience}}

CONTRAINTES ET EXIGENCES:
{{constraints}}

INSTRUCTIONS DE DÉVELOPPEMENT:

1. ARCHITECTURE MOBILE:
- Utilise Expo pour le développement rapide
- Implémente une navigation fluide (React Navigation)
- Structure le code avec des composants réutilisables
- Optimise pour les performances mobiles

2. DESIGN MOBILE:
- Suis les guidelines iOS/Android
- Crée une interface intuitive et tactile
- Implémente des animations fluides
- Optimise pour différentes tailles d'écran

3. FONCTIONNALITÉS NATIVES:
- Intègre les APIs natives (caméra, GPS, notifications)
- Implémente l'authentification biométrique
- Ajoute le support offline
- Optimise la gestion de la batterie

4. QUALITÉ ET TESTS:
- Teste sur différents appareils
- Implémente la gestion d'erreurs robuste
- Optimise les performances et la mémoire
- Ajoute les tests automatisés

CONTEXTE ADDITIONNEL:
{{additionalContext}}

Commence par configurer l'environnement Expo et créer la structure de base de l'application mobile.`,
    variables: [
      {
        name: 'projectName',
        type: 'text',
        label: 'Nom du projet',
        required: true,
        placeholder: 'MonAppMobile'
      },
      {
        name: 'platform',
        type: 'multiselect',
        label: 'Plateforme',
        required: true,
        options: [
          { value: 'iOS', label: 'iOS' },
          { value: 'Android', label: 'Android' },
          { value: 'Web', label: 'Web' }
        ],
        defaultValue: ['iOS', 'Android']
      },
      {
        name: 'techStack',
        type: 'multiselect',
        label: 'Stack technique',
        required: true,
        options: [
          { value: 'React Native', label: 'React Native' },
          { value: 'Expo', label: 'Expo' },
          { value: 'TypeScript', label: 'TypeScript' },
          { value: 'React Navigation', label: 'React Navigation' },
          { value: 'NativeWind', label: 'NativeWind' },
          { value: 'Zustand', label: 'Zustand' },
          { value: 'React Query', label: 'React Query' }
        ],
        defaultValue: ['React Native', 'Expo', 'TypeScript']
      },
      {
        name: 'complexity',
        type: 'select',
        label: 'Complexité',
        required: true,
        options: [
          { value: 'simple', label: 'Simple' },
          { value: 'intermediate', label: 'Intermédiaire' },
          { value: 'advanced', label: 'Avancé' },
          { value: 'expert', label: 'Expert' }
        ],
        defaultValue: 'intermediate'
      },
      {
        name: 'goals',
        type: 'text',
        label: 'Objectifs',
        required: true,
        placeholder: 'Créer une app de fitness avec suivi d\'activités'
      },
      {
        name: 'features',
        type: 'text',
        label: 'Fonctionnalités',
        required: true,
        placeholder: 'Authentification, GPS tracking, notifications push, dashboard'
      },
      {
        name: 'targetAudience',
        type: 'text',
        label: 'Public cible',
        required: true,
        placeholder: 'Sportifs, coureurs, utilisateurs fitness'
      },
      {
        name: 'constraints',
        type: 'text',
        label: 'Contraintes',
        required: false,
        placeholder: 'App Store guidelines, performance batterie, offline support'
      },
      {
        name: 'additionalContext',
        type: 'text',
        label: 'Contexte additionnel',
        required: false,
        placeholder: 'Inspiration, références design, intégrations spéciales'
      }
    ],
    tags: ['mobile', 'react-native', 'expo', 'cross-platform'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true
  },
  {
    id: 'ai-ml-project',
    name: 'Projet IA/ML',
    description: 'Template pour un projet d\'intelligence artificielle ou machine learning',
    category: 'ai-ml',
    template: `Tu es un expert en intelligence artificielle et machine learning spécialisé dans le développement d'applications IA avec bolt.new.

PROJET: {{projectName}}
TYPE: Application IA/ML
DOMAINE: {{domain}}
STACK TECHNIQUE: {{techStack}}
COMPLEXITÉ: {{complexity}}

OBJECTIFS DU PROJET:
{{goals}}

FONCTIONNALITÉS IA:
{{features}}

DONNÉES ET MODÈLES:
{{dataAndModels}}

PUBLIC CIBLE: {{targetAudience}}

CONTRAINTES TECHNIQUES:
{{constraints}}

INSTRUCTIONS DE DÉVELOPPEMENT:

1. ARCHITECTURE IA:
- Conçois une architecture modulaire pour les composants IA
- Implémente la gestion des modèles et des données
- Crée des APIs robustes pour les prédictions
- Optimise les performances de calcul

2. INTÉGRATION IA:
- Intègre les modèles de machine learning appropriés
- Implémente le preprocessing des données
- Ajoute la validation et l'évaluation des modèles
- Crée des interfaces pour la visualisation des résultats

3. EXPÉRIENCE UTILISATEUR:
- Conçois des interfaces intuitives pour l'IA
- Implémente le feedback utilisateur
- Ajoute la visualisation des données et prédictions
- Optimise l'interaction homme-machine

4. QUALITÉ ET MONITORING:
- Implémente le monitoring des performances IA
- Ajoute la validation des prédictions
- Crée des tests pour les modèles
- Optimise la précision et la vitesse

CONTEXTE ADDITIONNEL:
{{additionalContext}}

Commence par définir l'architecture IA et implémente les composants de base pour le machine learning.`,
    variables: [
      {
        name: 'projectName',
        type: 'text',
        label: 'Nom du projet',
        required: true,
        placeholder: 'MonProjetIA'
      },
      {
        name: 'domain',
        type: 'select',
        label: 'Domaine IA',
        required: true,
        options: [
          { value: 'computer-vision', label: 'Computer Vision' },
          { value: 'nlp', label: 'Natural Language Processing' },
          { value: 'recommendation', label: 'Système de recommandation' },
          { value: 'prediction', label: 'Prédiction/Analytics' },
          { value: 'chatbot', label: 'Chatbot/Assistant IA' },
          { value: 'generative', label: 'IA Générative' },
          { value: 'other', label: 'Autre' }
        ],
        defaultValue: 'nlp'
      },
      {
        name: 'techStack',
        type: 'multiselect',
        label: 'Stack technique',
        required: true,
        options: [
          { value: 'Python', label: 'Python' },
          { value: 'TensorFlow', label: 'TensorFlow' },
          { value: 'PyTorch', label: 'PyTorch' },
          { value: 'OpenAI API', label: 'OpenAI API' },
          { value: 'Hugging Face', label: 'Hugging Face' },
          { value: 'LangChain', label: 'LangChain' },
          { value: 'FastAPI', label: 'FastAPI' },
          { value: 'React', label: 'React' },
          { value: 'Streamlit', label: 'Streamlit' }
        ],
        defaultValue: ['Python', 'OpenAI API', 'React']
      },
      {
        name: 'complexity',
        type: 'select',
        label: 'Complexité',
        required: true,
        options: [
          { value: 'simple', label: 'Simple' },
          { value: 'intermediate', label: 'Intermédiaire' },
          { value: 'advanced', label: 'Avancé' },
          { value: 'expert', label: 'Expert' }
        ],
        defaultValue: 'intermediate'
      },
      {
        name: 'goals',
        type: 'text',
        label: 'Objectifs',
        required: true,
        placeholder: 'Créer un assistant IA pour l\'analyse de documents'
      },
      {
        name: 'features',
        type: 'text',
        label: 'Fonctionnalités IA',
        required: true,
        placeholder: 'Analyse de texte, génération de résumés, classification automatique'
      },
      {
        name: 'dataAndModels',
        type: 'text',
        label: 'Données et modèles',
        required: true,
        placeholder: 'GPT-4, embeddings, base de données de documents'
      },
      {
        name: 'targetAudience',
        type: 'text',
        label: 'Public cible',
        required: true,
        placeholder: 'Professionnels, chercheurs, entreprises'
      },
      {
        name: 'constraints',
        type: 'text',
        label: 'Contraintes',
        required: false,
        placeholder: 'Latence faible, précision élevée, coût API limité'
      },
      {
        name: 'additionalContext',
        type: 'text',
        label: 'Contexte additionnel',
        required: false,
        placeholder: 'Cas d\'usage spécifiques, intégrations, exigences de sécurité'
      }
    ],
    tags: ['ai', 'ml', 'python', 'openai', 'llm'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true
  }
];

// Presets prédéfinis pour différents cas d'usage
const DEFAULT_PRESETS: BoltPromptPreset[] = [
  {
    id: 'startup-mvp',
    name: 'MVP Startup',
    description: 'Configuration optimisée pour un MVP de startup',
    category: 'web-app',
    config: {
      complexity: 'intermediate',
      timeline: '2-4 semaines',
      budget: 'limité',
      constraints: ['Délai serré', 'Budget limité', 'Validation rapide'],
      goals: ['Validation du marché', 'Feedback utilisateurs', 'Itération rapide']
    },
    isDefault: true
  },
  {
    id: 'enterprise-app',
    name: 'Application Entreprise',
    description: 'Configuration pour une application d\'entreprise robuste',
    category: 'web-app',
    config: {
      complexity: 'advanced',
      timeline: '3-6 mois',
      budget: 'important',
      constraints: ['Sécurité élevée', 'Scalabilité', 'Conformité'],
      goals: ['Productivité équipe', 'Gestion centralisée', 'Intégration systèmes']
    },
    isDefault: true
  },
  {
    id: 'mobile-consumer',
    name: 'App Mobile Consommateur',
    description: 'Configuration pour une app mobile grand public',
    category: 'mobile-app',
    config: {
      complexity: 'intermediate',
      timeline: '2-3 mois',
      budget: 'modéré',
      constraints: ['App Store guidelines', 'Performance', 'UX optimale'],
      goals: ['Engagement utilisateur', 'Croissance', 'Monétisation']
    },
    isDefault: true
  }
];

class BoltPromptService {
  private templates: BoltPromptTemplate[] = [];
  private presets: BoltPromptPreset[] = [];
  private generatedPrompts: GeneratedBoltPrompt[] = [];

  constructor() {
    this.loadDefaultData();
    this.loadFromStorage();
  }

  /**
   * Charge les données par défaut
   */
  private loadDefaultData(): void {
    this.templates = [...DEFAULT_TEMPLATES];
    this.presets = [...DEFAULT_PRESETS];
  }

  /**
   * Charge les données depuis le localStorage
   */
  private loadFromStorage(): void {
    try {
      const savedTemplates = localStorage.getItem('bolt_prompt_templates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        this.templates = [...DEFAULT_TEMPLATES, ...parsed];
      }

      const savedPresets = localStorage.getItem('bolt_prompt_presets');
      if (savedPresets) {
        const parsed = JSON.parse(savedPresets);
        this.presets = [...DEFAULT_PRESETS, ...parsed];
      }

      const savedGenerated = localStorage.getItem('bolt_prompt_generated');
      if (savedGenerated) {
        this.generatedPrompts = JSON.parse(savedGenerated);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données bolt prompt:', error);
    }
  }

  /**
   * Sauvegarde les données dans le localStorage
   */
  private saveToStorage(): void {
    try {
      const customTemplates = this.templates.filter(t => !t.isDefault);
      localStorage.setItem('bolt_prompt_templates', JSON.stringify(customTemplates));

      const customPresets = this.presets.filter(p => !p.isDefault);
      localStorage.setItem('bolt_prompt_presets', JSON.stringify(customPresets));

      localStorage.setItem('bolt_prompt_generated', JSON.stringify(this.generatedPrompts));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données bolt prompt:', error);
    }
  }

  /**
   * Génère un prompt système basé sur un template et une configuration
   */
  generatePrompt(templateId: string, config: BoltPromptConfig): GeneratedBoltPrompt {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trouvé`);
    }

    let generatedPrompt = template.template;

    // Remplace les variables dans le template
    template.variables.forEach(variable => {
      const value = this.getVariableValue(variable.name, config);
      const placeholder = `{{${variable.name}}}`;
      generatedPrompt = generatedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    });

    const generated: GeneratedBoltPrompt = {
      id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      config,
      generatedPrompt,
      createdAt: new Date()
    };

    this.generatedPrompts.unshift(generated);
    this.saveToStorage();

    return generated;
  }

  /**
   * Récupère la valeur d'une variable depuis la configuration
   */
  private getVariableValue(variableName: string, config: BoltPromptConfig): string {
    const configMap: Record<string, string | string[] | number | boolean> = {
      projectName: config.projectType || 'Mon Projet',
      techStack: Array.isArray(config.techStack) ? config.techStack.join(', ') : config.techStack || '',
      complexity: config.complexity || 'intermediate',
      goals: Array.isArray(config.goals) ? config.goals.join('\n- ') : config.goals || '',
      features: Array.isArray(config.features) ? config.features.join('\n- ') : config.features || '',
      targetAudience: config.targetAudience || '',
      constraints: Array.isArray(config.constraints) ? config.constraints.join('\n- ') : config.constraints || '',
      additionalContext: config.additionalContext || '',
      timeline: config.timeline || '',
      budget: config.budget || '',
      inspiration: config.inspiration || ''
    };

    return String(configMap[variableName] || '');
  }

  /**
   * Récupère tous les templates disponibles
   */
  getTemplates(): BoltPromptTemplate[] {
    return [...this.templates];
  }

  /**
   * Récupère les templates par catégorie
   */
  getTemplatesByCategory(category: BoltPromptCategory): BoltPromptTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  /**
   * Récupère un template par ID
   */
  getTemplate(id: string): BoltPromptTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  /**
   * Crée un nouveau template personnalisé
   */
  createTemplate(template: Omit<BoltPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): BoltPromptTemplate {
    const newTemplate: BoltPromptTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.push(newTemplate);
    this.saveToStorage();

    return newTemplate;
  }

  /**
   * Met à jour un template existant
   */
  updateTemplate(id: string, updates: Partial<BoltPromptTemplate>): BoltPromptTemplate | null {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage();
    return this.templates[index];
  }

  /**
   * Supprime un template personnalisé
   */
  deleteTemplate(id: string): boolean {
    const template = this.templates.find(t => t.id === id);
    if (!template || template.isDefault) return false;

    this.templates = this.templates.filter(t => t.id !== id);
    this.saveToStorage();
    return true;
  }

  /**
   * Récupère tous les presets disponibles
   */
  getPresets(): BoltPromptPreset[] {
    return [...this.presets];
  }

  /**
   * Récupère les presets par catégorie
   */
  getPresetsByCategory(category: BoltPromptCategory): BoltPromptPreset[] {
    return this.presets.filter(p => p.category === category);
  }

  /**
   * Crée un nouveau preset personnalisé
   */
  createPreset(preset: Omit<BoltPromptPreset, 'id'>): BoltPromptPreset {
    const newPreset: BoltPromptPreset = {
      ...preset,
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.presets.push(newPreset);
    this.saveToStorage();

    return newPreset;
  }

  /**
   * Récupère l'historique des prompts générés
   */
  getGeneratedPrompts(): GeneratedBoltPrompt[] {
    return [...this.generatedPrompts];
  }

  /**
   * Récupère un prompt généré par ID
   */
  getGeneratedPrompt(id: string): GeneratedBoltPrompt | undefined {
    return this.generatedPrompts.find(p => p.id === id);
  }

  /**
   * Met à jour le rating d'un prompt généré
   */
  updateGeneratedPromptRating(id: string, rating: number, feedback?: string): boolean {
    const prompt = this.generatedPrompts.find(p => p.id === id);
    if (!prompt) return false;

    prompt.rating = rating;
    if (feedback) prompt.feedback = feedback;

    this.saveToStorage();
    return true;
  }

  /**
   * Supprime un prompt généré
   */
  deleteGeneratedPrompt(id: string): boolean {
    const index = this.generatedPrompts.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.generatedPrompts.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  /**
   * Récupère les statistiques d'utilisation
   */
  getStats() {
    const categories = this.templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as BoltPromptCategory || 'other';

    const averageRating = this.generatedPrompts
      .filter(p => p.rating)
      .reduce((sum, p) => sum + (p.rating || 0), 0) / 
      this.generatedPrompts.filter(p => p.rating).length || 0;

    return {
      totalTemplates: this.templates.length,
      totalGenerated: this.generatedPrompts.length,
      mostUsedCategory,
      averageRating,
      recentActivity: this.generatedPrompts
        .slice(0, 10)
        .map(p => ({
          date: p.createdAt,
          action: 'generated' as const,
          templateId: p.templateId
        }))
    };
  }
}

// Instance singleton du service
export const boltPromptService = new BoltPromptService();
