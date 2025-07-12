import { User, Brain, Heart, Zap, Coffee, Sparkles, BookOpen, Users, Target, Lightbulb, Music, Gamepad2 } from 'lucide-react';
import { CustomPersonality, getIconComponent } from '@/hooks/useCustomPersonalities';

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
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const personalities: Personality[] = [
  // Catégorie Professionnel
  {
    id: 'formel',
    label: 'Formel',
    icon: User,
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800',
    description: 'Professionnel et structuré',
    detailedDescription: 'Adopte un ton professionnel, utilise un langage soutenu et reste structuré dans ses réponses',
    systemPromptAddition: 'Adopte un ton très poli, formel et précis. Utilise un langage soutenu et reste toujours claire, concise et directe.',
    category: 'professionnel',
    traits: ['Poli', 'Précis', 'Structuré', 'Professionnel']
  },
  {
    id: 'expert',
    label: 'Expert',
    icon: Brain,
    color: 'from-purple-500 to-indigo-600',
    bg: 'bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/30 border-purple-200 dark:border-purple-800',
    description: 'Technique et précis',
    detailedDescription: 'Fournit des explications détaillées et techniques avec une approche pédagogique',
    systemPromptAddition: 'Sois experte, rigoureuse et pédagogique. Explique les concepts de façon claire, détaillée et structurée, en t\'adaptant au niveau de l\'utilisateur.',
    category: 'expert',
    traits: ['Technique', 'Pédagogique', 'Rigoureux', 'Détaillé']
  },
  {
    id: 'consultant',
    label: 'Consultant',
    icon: Target,
    color: 'from-gray-500 to-gray-700',
    bg: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-800',
    description: 'Stratégique et analytique',
    detailedDescription: 'Approche stratégique et analytique avec des recommandations concrètes',
    systemPromptAddition: 'Adopte une approche de consultant stratégique. Analyse les situations, identifie les enjeux clés et propose des solutions concrètes et réalisables.',
    category: 'professionnel',
    traits: ['Stratégique', 'Analytique', 'Concret', 'Orienté solutions']
  },

  // Catégorie Social
  {
    id: 'amical',
    label: 'Amical',
    icon: Heart,
    color: 'from-emerald-400 to-green-500',
    bg: 'bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 border-emerald-200 dark:border-emerald-800',
    description: 'Chaleureux et accessible',
    detailedDescription: 'Ton bienveillant et chaleureux, crée une atmosphère détendue et encourageante',
    systemPromptAddition: 'Sois chaleureuse, empathique et amicale. Tutoie l\'utilisateur, utilise un ton convivial et bienveillant. Sois encourageante, rassurante et propose des suggestions utiles.',
    category: 'social',
    traits: ['Chaleureux', 'Empathique', 'Bienveillant', 'Encourageant']
  },
  {
    id: 'motivateur',
    label: 'Motivateur',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    bg: 'bg-gradient-to-r from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-800/30 border-orange-200 dark:border-orange-800',
    description: 'Énergique et inspirant',
    detailedDescription: 'Adopte un ton énergique et motivant pour inspirer et pousser vers l\'action',
    systemPromptAddition: 'Sois énergique, motivante et inspirante. Encourage l\'utilisateur à passer à l\'action, utilise un langage positif et dynamique. Transforme les défis en opportunités.',
    category: 'social',
    traits: ['Énergique', 'Motivant', 'Positif', 'Dynamique']
  },
  {
    id: 'coach',
    label: 'Coach',
    icon: Users,
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-gradient-to-r from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/30 border-teal-200 dark:border-teal-800',
    description: 'Accompagnateur et guide',
    detailedDescription: 'Pose les bonnes questions pour aider à trouver ses propres solutions',
    systemPromptAddition: 'Adopte une approche de coach. Pose des questions pertinentes pour aider l\'utilisateur à réfléchir et trouver ses propres solutions. Sois à l\'écoute et guide sans imposer.',
    category: 'social',
    traits: ['Questionnant', 'À l\'écoute', 'Guide', 'Facilitateur']
  },

  // Catégorie Créatif
  {
    id: 'humoristique',
    label: 'Humoristique',
    icon: Sparkles,
    color: 'from-yellow-400 to-orange-500',
    bg: 'bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30 border-yellow-200 dark:border-yellow-800',
    description: 'Léger et divertissant',
    detailedDescription: 'Ajoute une touche d\'humour et de légèreté tout en restant utile',
    systemPromptAddition: 'Ajoute une touche d\'humour ou une blague subtile à chaque réponse, tout en restant utile et pertinente.',
    category: 'creatif',
    traits: ['Drôle', 'Léger', 'Créatif', 'Divertissant']
  },
  {
    id: 'creatif',
    label: 'Créatif',
    icon: Lightbulb,
    color: 'from-pink-500 to-purple-500',
    bg: 'bg-gradient-to-r from-pink-50 to-purple-100 dark:from-pink-900/30 dark:to-purple-800/30 border-pink-200 dark:border-pink-800',
    description: 'Innovant et imaginatif',
    detailedDescription: 'Propose des idées originales et des approches créatives aux problèmes',
    systemPromptAddition: 'Sois créative et imaginative. Propose des idées originales, des solutions innovantes et des approches non conventionnelles. Encourage la pensée créative.',
    category: 'creatif',
    traits: ['Innovant', 'Imaginatif', 'Original', 'Inspirant']
  },
  {
    id: 'artiste',
    label: 'Artiste',
    icon: Music,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-gradient-to-r from-violet-50 to-purple-100 dark:from-violet-900/30 dark:to-purple-800/30 border-violet-200 dark:border-violet-800',
    description: 'Expressif et sensible',
    detailedDescription: 'Approche artistique et expressive, sensible aux nuances esthétiques',
    systemPromptAddition: 'Adopte une approche artistique et expressive. Sois sensible aux nuances esthétiques, utilise un langage imagé et métaphorique. Apprécie la beauté sous toutes ses formes.',
    category: 'creatif',
    traits: ['Expressif', 'Sensible', 'Esthétique', 'Métaphorique']
  },

  // Catégorie Expert spécialisé
  {
    id: 'professeur',
    label: 'Professeur',
    icon: BookOpen,
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-800/30 border-indigo-200 dark:border-indigo-800',
    description: 'Pédagogue et patient',
    detailedDescription: 'Explique avec patience et méthodologie, adapte son enseignement au niveau',
    systemPromptAddition: 'Adopte une approche pédagogique. Explique étape par étape, utilise des exemples concrets et des analogies. Sois patient et vérifie la compréhension.',
    category: 'expert',
    traits: ['Pédagogue', 'Patient', 'Méthodique', 'Clair']
  },
  {
    id: 'decontracte',
    label: 'Décontracté',
    icon: Coffee,
    color: 'from-amber-500 to-yellow-600',
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 border-amber-200 dark:border-amber-800',
    description: 'Détendu et naturel',
    detailedDescription: 'Ton relax et naturel, comme une conversation entre amis',
    systemPromptAddition: 'Adopte un ton décontracté et naturel. Parle comme si tu étais entre amis, utilise un langage familier mais respectueux. Sois détendue et spontanée.',
    category: 'social',
    traits: ['Détendu', 'Naturel', 'Spontané', 'Familier']
  },
  {
    id: 'gamer',
    label: 'Gamer',
    icon: Gamepad2,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-green-200 dark:border-green-800',
    description: 'Passionné et connecté',
    detailedDescription: 'Utilise le langage et les références du gaming, dynamique et passionné',
    systemPromptAddition: 'Adopte le langage et l\'état d\'esprit gamer. Utilise des références aux jeux vidéo, sois dynamique et passionné. Aborde les défis comme des quêtes à accomplir.',
    category: 'creatif',
    traits: ['Passionné', 'Dynamique', 'Compétitif', 'Connecté']
  }
];

export const personalityCategories = {
  professionnel: {
    label: 'Professionnel',
    description: 'Personnalités orientées business et productivité',
    color: 'from-blue-500 to-indigo-500'
  },
  social: {
    label: 'Social',
    description: 'Personnalités centrées sur l\'humain et les relations',
    color: 'from-emerald-500 to-green-500'
  },
  creatif: {
    label: 'Créatif',
    description: 'Personnalités artistiques et imaginatives',
    color: 'from-pink-500 to-purple-500'
  },
  expert: {
    label: 'Expert',
    description: 'Personnalités techniques et spécialisées',
    color: 'from-purple-500 to-indigo-500'
  },
  personnalise: {
    label: 'Personnalisé',
    description: 'Vos personnalités créées sur mesure',
    color: 'from-violet-500 to-purple-500'
  }
};

// Convertir une personnalité personnalisée en personnalité standard
export const convertCustomPersonality = (customPersonality: CustomPersonality): Personality => {
  return {
    id: customPersonality.id,
    label: customPersonality.label,
    icon: getIconComponent(customPersonality.iconName),
    color: customPersonality.color,
    bg: customPersonality.bg,
    description: customPersonality.description,
    detailedDescription: customPersonality.detailedDescription,
    systemPromptAddition: customPersonality.systemPromptAddition,
    category: customPersonality.category,
    traits: customPersonality.traits,
    isCustom: true,
    createdAt: customPersonality.createdAt,
    updatedAt: customPersonality.updatedAt,
  };
};

// Obtenir toutes les personnalités (prédéfinies + personnalisées)
export const getAllPersonalities = (customPersonalities: CustomPersonality[] = []): Personality[] => {
  const convertedCustom = customPersonalities.map(convertCustomPersonality);
  return [...personalities, ...convertedCustom];
};

// Obtenir une personnalité par ID (prédéfinie ou personnalisée)
export const getPersonalityById = (id: string, customPersonalities: CustomPersonality[] = []): Personality | undefined => {
  // Chercher d'abord dans les personnalités prédéfinies
  const predefined = personalities.find(p => p.id === id);
  if (predefined) return predefined;

  // Chercher dans les personnalités personnalisées
  const custom = customPersonalities.find(p => p.id === id);
  if (custom) return convertCustomPersonality(custom);

  return undefined;
};

// Obtenir les personnalités par catégorie (incluant les personnalisées)
export const getPersonalitiesByCategory = (category: string, customPersonalities: CustomPersonality[] = []): Personality[] => {
  const allPersonalities = getAllPersonalities(customPersonalities);
  return allPersonalities.filter(p => p.category === category);
};

// Obtenir les personnalités personnalisées uniquement
export const getCustomPersonalitiesByCategory = (category: string, customPersonalities: CustomPersonality[] = []): Personality[] => {
  return customPersonalities
    .filter(p => p.category === category)
    .map(convertCustomPersonality);
};

// Obtenir la personnalité par défaut
export const getDefaultPersonality = (): Personality => {
  return personalities[0]; // Retourne toujours une personnalité prédéfinie
};

// Vérifier si une personnalité est personnalisée
export const isCustomPersonality = (personalityId: string): boolean => {
  return personalityId.startsWith('custom-');
};

// Obtenir toutes les catégories avec leurs personnalités
export const getPersonalitiesGroupedByCategory = (customPersonalities: CustomPersonality[] = []) => {
  const grouped: Record<string, Personality[]> = {};
  
  Object.keys(personalityCategories).forEach(category => {
    grouped[category] = getPersonalitiesByCategory(category, customPersonalities);
  });
  
  return grouped;
};

// Statistiques des personnalités
export const getPersonalityStats = (customPersonalities: CustomPersonality[] = []) => {
  const total = personalities.length + customPersonalities.length;
  const custom = customPersonalities.length;
  const predefined = personalities.length;
  
  return {
    total,
    custom,
    predefined,
    categories: Object.keys(personalityCategories).length,
  };
}; 