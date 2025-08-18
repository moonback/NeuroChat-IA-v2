import type { ConversationTemplate, TemplateCategory, TemplateUsage } from '@/types/templates';

// Templates prédéfinis optimisés pour NeuroChat
export const PREDEFINED_TEMPLATES: ConversationTemplate[] = [
  // PRODUCTIVITÉ
  {
    id: 'email_writer',
    name: 'Rédaction d\'email professionnel',
    description: 'Rédigez des emails professionnels efficaces et bien structurés',
    category: 'productivity',
    icon: '📧',
    color: 'from-blue-500 to-blue-600',
    prompt: `Aide-moi à rédiger un email professionnel avec les détails suivants :

**Destinataire** : {{recipient}}
**Objet** : {{subject}}
**Contexte** : {{context}}
**Ton souhaité** : {{tone}}

Merci de créer un email bien structuré, professionnel et adapté au contexte.`,
    placeholders: [
      {
        id: 'recipient',
        label: 'Destinataire',
        type: 'text',
        placeholder: 'Ex: Mon manager, l\'équipe projet...',
        required: true
      },
      {
        id: 'subject',
        label: 'Objet de l\'email',
        type: 'text',
        placeholder: 'Ex: Demande de congés, Point projet...',
        required: true
      },
      {
        id: 'context',
        label: 'Contexte et message principal',
        type: 'textarea',
        placeholder: 'Décrivez la situation et ce que vous voulez communiquer...',
        required: true
      },
      {
        id: 'tone',
        label: 'Ton',
        type: 'select',
        options: ['Formel', 'Cordial', 'Direct', 'Amical'],
        defaultValue: 'Cordial'
      }
    ],
    settings: {
      ragEnabled: false,
      webEnabled: false,
      agentEnabled: true,
      provider: 'gemini'
    },
    tags: ['email', 'professionnel', 'communication', 'rédaction']
  },

  {
    id: 'meeting_prep',
    name: 'Préparation de réunion',
    description: 'Structurez votre réunion avec un ordre du jour efficace',
    category: 'productivity',
    icon: '📋',
    color: 'from-green-500 to-green-600',
    prompt: `Aide-moi à préparer une réunion productive :

**Sujet** : {{topic}}
**Participants** : {{participants}}
**Durée** : {{duration}}
**Objectifs** : {{objectives}}

Crée un ordre du jour structuré avec timing, points à aborder, et questions clés.`,
    placeholders: [
      {
        id: 'topic',
        label: 'Sujet de la réunion',
        type: 'text',
        required: true,
        placeholder: 'Ex: Lancement projet X, Point hebdomadaire...'
      },
      {
        id: 'participants',
        label: 'Participants',
        type: 'text',
        placeholder: 'Rôles et nombre de participants'
      },
      {
        id: 'duration',
        label: 'Durée',
        type: 'select',
        options: ['30 min', '45 min', '1h', '1h30', '2h'],
        defaultValue: '1h'
      },
      {
        id: 'objectives',
        label: 'Objectifs principaux',
        type: 'textarea',
        required: true,
        placeholder: 'Que voulez-vous accomplir dans cette réunion ?'
      }
    ],
    settings: {
      ragEnabled: false,
      webEnabled: false,
      agentEnabled: true
    },
    tags: ['réunion', 'productivité', 'organisation', 'agenda']
  },

  // APPRENTISSAGE
  {
    id: 'explain_concept',
    name: 'Explication de concept',
    description: 'Demandez une explication claire et pédagogique d\'un concept',
    category: 'learning',
    icon: '🎓',
    color: 'from-purple-500 to-purple-600',
    prompt: `Explique-moi le concept suivant de manière claire et pédagogique :

**Concept** : {{concept}}
**Mon niveau** : {{level}}
**Contexte d'usage** : {{context}}

Utilise des exemples concrets, des analogies si nécessaire, et structure l'explication du simple au complexe.`,
    placeholders: [
      {
        id: 'concept',
        label: 'Concept à expliquer',
        type: 'text',
        required: true,
        placeholder: 'Ex: Machine Learning, Blockchain, Photosynthèse...'
      },
      {
        id: 'level',
        label: 'Mon niveau',
        type: 'select',
        options: ['Débutant', 'Intermédiaire', 'Avancé'],
        defaultValue: 'Intermédiaire'
      },
      {
        id: 'context',
        label: 'Contexte d\'usage',
        type: 'text',
        placeholder: 'Ex: Pour mon travail, mes études, curiosité personnelle...'
      }
    ],
    settings: {
      ragEnabled: true,
      webEnabled: true,
      agentEnabled: true
    },
    tags: ['apprentissage', 'explication', 'pédagogie', 'formation']
  },

  // CRÉATIF
  {
    id: 'brainstorming',
    name: 'Session de brainstorming',
    description: 'Générez des idées créatives pour votre projet',
    category: 'creative',
    icon: '💡',
    color: 'from-yellow-500 to-orange-500',
    prompt: `Aidons ensemble à générer des idées créatives !

**Projet/Problème** : {{project}}
**Objectif** : {{goal}}
**Contraintes** : {{constraints}}
**Public cible** : {{audience}}

Propose 10 idées variées et créatives, puis développons ensemble les plus prometteuses.`,
    placeholders: [
      {
        id: 'project',
        label: 'Projet ou problème',
        type: 'text',
        required: true,
        placeholder: 'Ex: Nom pour ma startup, idée d\'article, concept d\'app...'
      },
      {
        id: 'goal',
        label: 'Objectif principal',
        type: 'text',
        required: true,
        placeholder: 'Que voulez-vous accomplir ?'
      },
      {
        id: 'constraints',
        label: 'Contraintes',
        type: 'text',
        placeholder: 'Budget, temps, style, audience...'
      },
      {
        id: 'audience',
        label: 'Public cible',
        type: 'text',
        placeholder: 'À qui s\'adresse votre projet ?'
      }
    ],
    settings: {
      ragEnabled: false,
      webEnabled: true,
      agentEnabled: true
    },
    tags: ['créativité', 'brainstorming', 'idées', 'innovation']
  },

  // TECHNIQUE
  {
    id: 'code_review',
    name: 'Revue de code',
    description: 'Obtenez un feedback sur votre code avec suggestions d\'amélioration',
    category: 'technical',
    icon: '💻',
    color: 'from-indigo-500 to-purple-500',
    prompt: `Analyse ce code et donne-moi tes suggestions d'amélioration :

**Langage** : {{language}}
**Contexte** : {{context}}
**Objectifs** : {{objectives}}

\`\`\`{{language}}
{{code}}
\`\`\`

Concentre-toi sur : lisibilité, performance, bonnes pratiques, et sécurité.`,
    placeholders: [
      {
        id: 'language',
        label: 'Langage de programmation',
        type: 'select',
        options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Autre'],
        required: true
      },
      {
        id: 'context',
        label: 'Contexte du code',
        type: 'text',
        placeholder: 'Ex: API REST, composant React, script d\'automatisation...'
      },
      {
        id: 'objectives',
        label: 'Objectifs d\'amélioration',
        type: 'text',
        placeholder: 'Performance, maintenabilité, sécurité...'
      },
      {
        id: 'code',
        label: 'Code à analyser',
        type: 'textarea',
        required: true,
        placeholder: 'Collez votre code ici...',
        validation: {
          minLength: 10
        }
      }
    ],
    settings: {
      ragEnabled: true,
      webEnabled: true,
      agentEnabled: true,
      provider: 'gemini'
    },
    tags: ['programmation', 'code', 'révision', 'amélioration']
  },

  // ANALYSE
  {
    id: 'document_analysis',
    name: 'Analyse de document',
    description: 'Analysez un document et obtenez un résumé structuré',
    category: 'analysis',
    icon: '📄',
    color: 'from-teal-500 to-cyan-500',
    prompt: `Analyse ce document et fournis-moi :

**Type d'analyse** : {{analysis_type}}
**Focus principal** : {{focus}}

1. **Résumé exécutif** (3-4 phrases clés)
2. **Points principaux** (liste structurée)
3. **Insights et recommandations**
4. **Questions pour approfondir**

Note : Le document sera ajouté via l'import de fichier.`,
    placeholders: [
      {
        id: 'analysis_type',
        label: 'Type d\'analyse',
        type: 'select',
        options: ['Résumé général', 'Analyse critique', 'Points d\'action', 'Recherche d\'insights', 'Comparaison'],
        defaultValue: 'Résumé général'
      },
      {
        id: 'focus',
        label: 'Focus principal',
        type: 'text',
        placeholder: 'Ex: Aspects financiers, stratégie, risques, opportunités...'
      }
    ],
    settings: {
      ragEnabled: true,
      webEnabled: false,
      agentEnabled: true
    },
    tags: ['analyse', 'document', 'résumé', 'insights']
  },

  // PERSONNEL
  {
    id: 'decision_helper',
    name: 'Aide à la décision',
    description: 'Structurez votre réflexion pour prendre une décision éclairée',
    category: 'personal',
    icon: '🤔',
    color: 'from-rose-500 to-pink-500',
    prompt: `Aide-moi à prendre une décision réfléchie :

**Décision à prendre** : {{decision}}
**Contexte** : {{context}}
**Enjeux** : {{stakes}}
**Délai** : {{deadline}}

Analysons ensemble les pour/contre, les risques, les alternatives, et structurons une approche méthodique.`,
    placeholders: [
      {
        id: 'decision',
        label: 'Décision à prendre',
        type: 'text',
        required: true,
        placeholder: 'Ex: Changer de travail, investir, déménager...'
      },
      {
        id: 'context',
        label: 'Contexte',
        type: 'textarea',
        required: true,
        placeholder: 'Décrivez votre situation actuelle...'
      },
      {
        id: 'stakes',
        label: 'Enjeux principaux',
        type: 'text',
        placeholder: 'Ce qui est important pour vous dans cette décision'
      },
      {
        id: 'deadline',
        label: 'Délai de décision',
        type: 'select',
        options: ['Urgent (< 1 semaine)', 'Court terme (1 mois)', 'Moyen terme (3 mois)', 'Long terme (> 6 mois)'],
        defaultValue: 'Moyen terme (3 mois)'
      }
    ],
    settings: {
      ragEnabled: false,
      webEnabled: false,
      agentEnabled: true
    },
    tags: ['décision', 'réflexion', 'analyse', 'personnel']
  },

  // MVP & STARTUP
  {
    id: 'mvp_web_creator',
    name: 'Créateur de MVP Web',
    description: 'Planifiez et structurez votre Minimum Viable Product pour le web',
    category: 'technical',
    icon: '🚀',
    color: 'from-emerald-500 to-teal-500',
    prompt: `Aide-moi à créer un plan complet pour développer un MVP (Minimum Viable Product) web :

**🎯 CONCEPT DU PROJET**
**Nom du projet** : {{project_name}}
**Problème résolu** : {{problem}}
**Public cible** : {{target_audience}}
**Proposition de valeur** : {{value_proposition}}

**⚙️ SPÉCIFICATIONS TECHNIQUES**
**Type d'application** : {{app_type}}
**Budget estimé** : {{budget}}
**Délai souhaité** : {{timeline}}
**Niveau technique équipe** : {{tech_level}}

**📋 FONCTIONNALITÉS PRIORITAIRES**
{{core_features}}

**🔧 CONTRAINTES & CONTEXTE**
{{constraints}}

---

**MISSION** : Crée-moi un plan détaillé pour ce MVP incluant :

1. **🏗️ ARCHITECTURE TECHNIQUE RECOMMANDÉE**
   - Stack technologique optimale (frontend/backend/base de données)
   - Justification des choix techniques selon le contexte
   - Services et outils recommandés (hébergement, analytics, etc.)

2. **📝 BACKLOG PRIORISÉ (USER STORIES)**
   - Fonctionnalités CORE (indispensables au MVP)
   - Fonctionnalités NICE-TO-HAVE (phase 2)
   - Estimation de complexité pour chaque fonctionnalité

3. **📅 PLANNING DE DÉVELOPPEMENT**
   - Découpage en sprints/phases logiques
   - Milestones clés et livrables
   - Chemin critique du projet

4. **💰 ESTIMATION BUDGÉTAIRE DÉTAILLÉE**
   - Coûts de développement
   - Coûts d'infrastructure et services
   - Coûts de maintenance mensuelle

5. **⚠️ RISQUES & MITIGATION**
   - Risques techniques identifiés
   - Risques business/marché
   - Stratégies de réduction des risques

6. **📊 MÉTRIQUES DE SUCCÈS**
   - KPIs à suivre dès le lancement
   - Objectifs quantifiés pour valider le MVP
   - Outils de mesure recommandés

7. **🚀 STRATÉGIE DE LANCEMENT**
   - Plan de déploiement technique
   - Stratégie de tests utilisateur
   - Plan de feedback et itération

Sois concret, actionnable et adapte tes recommandations au budget et délai indiqués.`,
    placeholders: [
      {
        id: 'project_name',
        label: 'Nom du projet',
        type: 'text',
        required: true,
        placeholder: 'Ex: TaskMaster, FoodieConnect, LearnFast...'
      },
      {
        id: 'problem',
        label: 'Quel problème votre MVP résout-il ?',
        type: 'textarea',
        required: true,
        placeholder: 'Décrivez clairement le problème que vous voulez résoudre...',
        validation: {
          minLength: 20
        }
      },
      {
        id: 'target_audience',
        label: 'Public cible principal',
        type: 'text',
        required: true,
        placeholder: 'Ex: Entrepreneurs 25-40 ans, Étudiants en design, PME tech...'
      },
      {
        id: 'value_proposition',
        label: 'Proposition de valeur unique',
        type: 'textarea',
        required: true,
        placeholder: 'En quoi votre solution est-elle différente et meilleure ?'
      },
      {
        id: 'app_type',
        label: 'Type d\'application web',
        type: 'select',
        required: true,
        options: [
          'Application web (SPA)',
          'Site vitrine avec fonctionnalités',
          'Plateforme e-commerce',
          'Marketplace/place de marché',
          'SaaS B2B',
          'Réseau social/communauté',
          'Application de gestion',
          'Outil de productivité',
          'Autre'
        ]
      },
      {
        id: 'budget',
        label: 'Budget de développement',
        type: 'select',
        required: true,
        options: [
          'Très serré (< 5K€)',
          'Limité (5K-15K€)',
          'Modéré (15K-50K€)',
          'Confortable (50K-100K€)',
          'Important (> 100K€)'
        ]
      },
      {
        id: 'timeline',
        label: 'Délai souhaité pour le MVP',
        type: 'select',
        required: true,
        options: [
          'Ultra-rapide (< 1 mois)',
          'Rapide (1-3 mois)',
          'Standard (3-6 mois)',
          'Étoffé (6-12 mois)',
          'Pas de contrainte temps'
        ]
      },
      {
        id: 'tech_level',
        label: 'Niveau technique de l\'équipe',
        type: 'select',
        required: true,
        options: [
          'Débutant (apprentissage)',
          'Intermédiaire (quelques projets)',
          'Avancé (expérience solide)',
          'Expert (architecte/lead)',
          'Équipe mixte'
        ]
      },
      {
        id: 'core_features',
        label: 'Fonctionnalités principales souhaitées',
        type: 'textarea',
        required: true,
        placeholder: 'Listez les 3-7 fonctionnalités core de votre MVP (une par ligne ou séparées par des virgules)...',
        validation: {
          minLength: 30
        }
      },
      {
        id: 'constraints',
        label: 'Contraintes et contexte particulier',
        type: 'textarea',
        placeholder: 'Ex: Intégration avec systèmes existants, réglementations spécifiques, contraintes de sécurité, équipe distribuée...'
      }
    ],
    settings: {
      ragEnabled: true,
      webEnabled: true,
      agentEnabled: true,
      provider: 'gemini'
    },
    tags: ['mvp', 'startup', 'développement web', 'planification', 'architecture', 'business']
  }
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'productivity',
    name: 'Productivité',
    description: 'Templates pour améliorer votre efficacité professionnelle',
    icon: '⚡',
    color: 'from-blue-500 to-blue-600',
    templates: ['email_writer', 'meeting_prep']
  },
  {
    id: 'learning',
    name: 'Apprentissage',
    description: 'Templates pour apprendre et comprendre de nouveaux concepts',
    icon: '🎓',
    color: 'from-purple-500 to-purple-600',
    templates: ['explain_concept']
  },
  {
    id: 'creative',
    name: 'Créativité',
    description: 'Templates pour stimuler votre créativité et générer des idées',
    icon: '🎨',
    color: 'from-yellow-500 to-orange-500',
    templates: ['brainstorming']
  },
  {
    id: 'technical',
    name: 'Technique',
    description: 'Templates pour les développeurs et professionnels techniques',
    icon: '⚙️',
    color: 'from-indigo-500 to-purple-500',
    templates: ['code_review', 'mvp_web_creator']
  },
  {
    id: 'analysis',
    name: 'Analyse',
    description: 'Templates pour analyser des documents et données',
    icon: '📊',
    color: 'from-teal-500 to-cyan-500',
    templates: ['document_analysis']
  },
  {
    id: 'personal',
    name: 'Personnel',
    description: 'Templates pour vos besoins personnels et décisions de vie',
    icon: '🌟',
    color: 'from-rose-500 to-pink-500',
    templates: ['decision_helper']
  },
  {
    id: 'custom',
    name: 'Personnalisés',
    description: 'Vos templates créés sur mesure',
    icon: '🔧',
    color: 'from-gray-500 to-gray-600',
    templates: []
  }
];

class TemplateService {
  private readonly USAGE_KEY = 'neurochat_template_usage';
  private readonly CUSTOM_KEY = 'neurochat_custom_templates';

  constructor(private workspaceId: string = 'default') {}

  private getStorageKey(suffix: string): string {
    return `ws:${this.workspaceId}:${suffix}`;
  }

  // Récupérer tous les templates (prédéfinis + personnalisés)
  getAllTemplates(): ConversationTemplate[] {
    const customTemplates = this.getCustomTemplates();
    return [...PREDEFINED_TEMPLATES, ...customTemplates];
  }

  // Récupérer les templates personnalisés
  getCustomTemplates(): ConversationTemplate[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(this.CUSTOM_KEY));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Récupérer les templates par catégorie
  getTemplatesByCategory(categoryId: string): ConversationTemplate[] {
    const allTemplates = this.getAllTemplates();
    return allTemplates.filter(t => t.category === categoryId);
  }

  // Récupérer un template par ID
  getTemplateById(id: string): ConversationTemplate | undefined {
    return this.getAllTemplates().find(t => t.id === id);
  }

  // Sauvegarder un template personnalisé
  saveCustomTemplate(template: Omit<ConversationTemplate, 'id' | 'isCustom' | 'createdAt'>): ConversationTemplate {
    const newTemplate: ConversationTemplate = {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date(),
      usage: 0
    };

    const customTemplates = this.getCustomTemplates();
    customTemplates.push(newTemplate);
    
    try {
      localStorage.setItem(this.getStorageKey(this.CUSTOM_KEY), JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
    }

    return newTemplate;
  }

  // Supprimer un template personnalisé
  deleteCustomTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates();
    const filteredTemplates = customTemplates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === customTemplates.length) {
      return false; // Template non trouvé
    }

    try {
      localStorage.setItem(this.getStorageKey(this.CUSTOM_KEY), JSON.stringify(filteredTemplates));
      return true;
    } catch {
      return false;
    }
  }

  // Enregistrer l'utilisation d'un template
  recordUsage(templateId: string, placeholderValues?: Record<string, string>): void {
    const usage: TemplateUsage = {
      templateId,
      timestamp: new Date(),
      placeholderValues
    };

    try {
      const stored = localStorage.getItem(this.getStorageKey(this.USAGE_KEY));
      const usageHistory: TemplateUsage[] = stored ? JSON.parse(stored) : [];
      usageHistory.push(usage);

      // Garder seulement les 1000 dernières utilisations
      if (usageHistory.length > 1000) {
        usageHistory.splice(0, usageHistory.length - 1000);
      }

      localStorage.setItem(this.getStorageKey(this.USAGE_KEY), JSON.stringify(usageHistory));

      // Mettre à jour le compteur d'usage du template
      this.updateTemplateUsageCount(templateId);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'usage:', error);
    }
  }

  // Mettre à jour le compteur d'usage d'un template
  private updateTemplateUsageCount(templateId: string): void {
    const template = this.getTemplateById(templateId);
    if (template && template.isCustom) {
      const customTemplates = this.getCustomTemplates();
      const templateIndex = customTemplates.findIndex(t => t.id === templateId);
      
      if (templateIndex !== -1) {
        customTemplates[templateIndex].usage = (customTemplates[templateIndex].usage || 0) + 1;
        customTemplates[templateIndex].lastUsed = new Date();
        
        try {
          localStorage.setItem(this.getStorageKey(this.CUSTOM_KEY), JSON.stringify(customTemplates));
        } catch {}
      }
    }
  }

  // Récupérer les templates les plus utilisés
  getMostUsedTemplates(limit: number = 5): ConversationTemplate[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(this.USAGE_KEY));
      const usageHistory: TemplateUsage[] = stored ? JSON.parse(stored) : [];
      
      const usageCount = new Map<string, number>();
      usageHistory.forEach(usage => {
        usageCount.set(usage.templateId, (usageCount.get(usage.templateId) || 0) + 1);
      });

      const allTemplates = this.getAllTemplates();
      return allTemplates
        .map(template => ({
          ...template,
          usage: usageCount.get(template.id) || 0
        }))
        .sort((a, b) => (b.usage || 0) - (a.usage || 0))
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  // Récupérer les templates récemment utilisés
  getRecentTemplates(limit: number = 5): ConversationTemplate[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(this.USAGE_KEY));
      const usageHistory: TemplateUsage[] = stored ? JSON.parse(stored) : [];
      
      const recentUsage = new Map<string, Date>();
      usageHistory.forEach(usage => {
        const currentDate = recentUsage.get(usage.templateId);
        const usageDate = new Date(usage.timestamp);
        if (!currentDate || usageDate > currentDate) {
          recentUsage.set(usage.templateId, usageDate);
        }
      });

      const allTemplates = this.getAllTemplates();
      return allTemplates
        .filter(template => recentUsage.has(template.id))
        .map(template => ({
          ...template,
          lastUsed: recentUsage.get(template.id)
        }))
        .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  // Rechercher des templates
  searchTemplates(query: string): ConversationTemplate[] {
    const allTemplates = this.getAllTemplates();
    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
    
    return allTemplates.filter(template => {
      const searchableText = [
        template.name,
        template.description,
        template.category,
        ...template.tags
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Remplir un template avec des valeurs
  fillTemplate(template: ConversationTemplate, values: Record<string, string>): string {
    let filledPrompt = template.prompt;
    
    // Remplacer les placeholders
    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      filledPrompt = filledPrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    // Nettoyer les placeholders non remplis
    filledPrompt = filledPrompt.replace(/\{\{[^}]+\}\}/g, '[Non spécifié]');

    return filledPrompt;
  }

  // Exporter tous les templates personnalisés
  exportCustomTemplates(): string {
    const customTemplates = this.getCustomTemplates();
    return JSON.stringify(customTemplates, null, 2);
  }

  // Importer des templates personnalisés
  importCustomTemplates(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importedTemplates = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;

      if (!Array.isArray(importedTemplates)) {
        return { success: false, imported: 0, errors: ['Le fichier doit contenir un tableau de templates'] };
      }

      const currentTemplates = this.getCustomTemplates();
      
      importedTemplates.forEach((template, index) => {
        try {
          // Validation basique
          if (!template.name || !template.prompt || !template.category) {
            errors.push(`Template ${index + 1}: Champs obligatoires manquants`);
            return;
          }

          // Générer un nouvel ID pour éviter les conflits
          const newTemplate: ConversationTemplate = {
            ...template,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isCustom: true,
            createdAt: new Date(),
            usage: 0
          };

          currentTemplates.push(newTemplate);
          imported++;
        } catch (error) {
          errors.push(`Template ${index + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      });

      if (imported > 0) {
        localStorage.setItem(this.getStorageKey(this.CUSTOM_KEY), JSON.stringify(currentTemplates));
      }

      return { success: imported > 0, imported, errors };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Erreur de parsing JSON: ${error instanceof Error ? error.message : 'Erreur inconnue'}`] 
      };
    }
  }
}

export default TemplateService;
