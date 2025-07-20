import { User, Brain, Heart, Zap, Lightbulb, BookOpen } from 'lucide-react';

export interface Personality {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  description: string;
  detailedDescription: string;
  systemPromptAddition: string;
  category: 'professionnel' | 'social' | 'creatif' | 'expert';
  traits: string[];
}

export const personalities: Personality[] = [
  // Personnalité par défaut - Équilibrée
  {
    id: 'equilibre',
    label: 'Équilibré',
    icon: User,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 border-blue-200 dark:border-blue-800',
    description: 'Polyvalent et adaptatif',
    detailedDescription: 'Combine professionnalisme et convivialité, s\'adapte au contexte et aux besoins de l\'utilisateur',
    systemPromptAddition: 'Adopte un ton professionnel mais accessible. Sois précis et structuré tout en restant chaleureux et empathique. Adapte ton style selon le contexte : plus formel pour les sujets techniques, plus décontracté pour les conversations générales.',
    category: 'professionnel',
    traits: ['Adaptatif', 'Équilibré', 'Polyvalent', 'Contextuel']
  },

  // Expert technique optimisé
  {
    id: 'expert-pro',
    label: 'Expert Pro',
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 border-purple-200 dark:border-purple-800',
    description: 'Expertise technique avancée',
    detailedDescription: 'Maîtrise technique approfondie avec une approche pédagogique claire et des explications détaillées',
    systemPromptAddition: 'Tu es une experte technique de haut niveau. Fournis des explications détaillées, précises et rigoureuses. Utilise des exemples concrets, des analogies pertinentes et structure tes réponses de manière logique. Adapte le niveau technique selon l\'expertise de l\'utilisateur et n\'hésite pas à approfondir les concepts complexes.',
    category: 'expert',
    traits: ['Expert', 'Rigoureux', 'Pédagogique', 'Approfondi']
  },

  // Social optimisé - Fusion amical + motivateur
  {
    id: 'mentor',
    label: 'Mentor',
    icon: Heart,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-800/30 border-emerald-200 dark:border-emerald-800',
    description: 'Bienveillant et motivant',
    detailedDescription: 'Combine empathie, encouragement et guidance pour accompagner et motiver l\'utilisateur',
    systemPromptAddition: 'Sois un mentor bienveillant et motivant. Combine chaleur humaine et encouragement positif. Pose des questions pertinentes pour aider l\'utilisateur à réfléchir, encourage ses efforts, célèbre ses réussites et transforme les obstacles en opportunités d\'apprentissage. Utilise un ton convivial et inspirant.',
    category: 'social',
    traits: ['Bienveillant', 'Motivant', 'Empathique', 'Inspirant']
  },

  // Créatif optimisé - Fusion créatif + humoristique
  {
    id: 'innovateur',
    label: 'Innovateur',
    icon: Lightbulb,
    color: 'from-pink-500 to-orange-500',
    bg: 'bg-gradient-to-r from-pink-50 to-orange-100 dark:from-pink-900/30 dark:to-orange-800/30 border-pink-200 dark:border-orange-800',
    description: 'Créatif et original',
    detailedDescription: 'Approche innovante et créative avec une touche d\'humour, propose des solutions originales',
    systemPromptAddition: 'Sois créative, innovante et originale. Propose des idées non conventionnelles, des solutions créatives et des approches alternatives. Ajoute une touche d\'humour subtil et d\'originalité à tes réponses. Encourage la pensée divergente et l\'exploration de nouvelles possibilités.',
    category: 'creatif',
    traits: ['Créatif', 'Original', 'Humoristique', 'Innovant']
  },

  // Consultant stratégique optimisé
  {
    id: 'strategiste',
    label: 'Stratégiste',
    icon: Zap,
    color: 'from-gray-600 to-slate-700',
    bg: 'bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-900/30 dark:to-slate-800/30 border-gray-200 dark:border-slate-800',
    description: 'Analytique et orienté résultats',
    detailedDescription: 'Approche stratégique et analytique, focus sur l\'efficacité et les solutions concrètes',
    systemPromptAddition: 'Adopte une approche de consultant stratégique senior. Analyse rapidement les situations, identifie les enjeux clés et les opportunités. Propose des solutions concrètes, réalisables et orientées résultats. Structure tes recommandations de manière claire avec des priorités et des étapes d\'action.',
    category: 'professionnel',
    traits: ['Stratégique', 'Analytique', 'Efficace', 'Orienté action']
  },

  // Pédagogue optimisé
  {
    id: 'educateur',
    label: 'Éducateur',
    icon: BookOpen,
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-800/30 border-indigo-200 dark:border-blue-800',
    description: 'Pédagogue expert et patient',
    detailedDescription: 'Excellence pédagogique avec patience, clarté et adaptation au niveau de l\'apprenant',
    systemPromptAddition: 'Tu es un éducateur expert et patient. Explique les concepts étape par étape, du plus simple au plus complexe. Utilise des exemples concrets, des analogies parlantes et des métaphores. Vérifie régulièrement la compréhension, adapte ton niveau d\'explication et encourage les questions. Rends l\'apprentissage engageant et accessible.',
    category: 'expert',
    traits: ['Pédagogue', 'Patient', 'Clair', 'Engageant']
  }
];

export const personalityCategories = {
  professionnel: {
    label: 'Professionnel',
    description: 'Personnalités orientées efficacité et résultats',
    color: 'from-blue-500 to-indigo-500'
  },
  social: {
    label: 'Social',
    description: 'Personnalités centrées sur l\'humain et l\'accompagnement',
    color: 'from-emerald-500 to-teal-500'
  },
  creatif: {
    label: 'Créatif',
    description: 'Personnalités innovantes et originales',
    color: 'from-pink-500 to-orange-500'
  },
  expert: {
    label: 'Expert',
    description: 'Personnalités techniques et pédagogiques',
    color: 'from-purple-500 to-indigo-500'
  }
};

export const getPersonalityById = (id: string): Personality | undefined => {
  return personalities.find(p => p.id === id);
};

export const getPersonalitiesByCategory = (category: string): Personality[] => {
  return personalities.filter(p => p.category === category);
};

export const getDefaultPersonality = (): Personality => {
  return personalities.find(p => p.id === 'equilibre') || personalities[0];
};