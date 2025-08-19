/**
 * Service de contenu adapté pour le mode enfant
 * Fournit des prompts simplifiés et des activités ludiques
 */

export interface ChildPromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: 'apprentissage' | 'créativité' | 'jeu' | 'découverte' | 'émotions';
  ageRange: '3-6' | '7-10' | '11-14';
  difficulty: 'facile' | 'moyen' | 'difficile';
}

export interface ChildActivity {
  id: string;
  title: string;
  description: string;
  type: 'devinette' | 'quiz' | 'histoire' | 'dessin' | 'musique' | 'science';
  duration: number; // en minutes
  materials?: string[];
  instructions: string[];
}

export interface ChildLanguageLevel {
  level: 'débutant' | 'intermédiaire' | 'avancé';
  maxSentenceLength: number;
  maxWordLength: number;
  vocabularyComplexity: 'simple' | 'modéré' | 'riche';
  examples: string[];
}

// Templates de prompts adaptés aux enfants
const CHILD_PROMPT_TEMPLATES: ChildPromptTemplate[] = [
  {
    id: 'story_creation',
    title: 'Création d\'histoire',
    prompt: 'Inventons ensemble une histoire amusante ! Choisis un personnage, un lieu et une aventure. Je t\'aiderai à la développer étape par étape.',
    category: 'créativité',
    ageRange: '7-10',
    difficulty: 'moyen'
  },
  {
    id: 'science_exploration',
    title: 'Exploration scientifique',
    prompt: 'Découvrons ensemble le monde qui nous entoure ! Pose-moi une question sur la nature, les animaux, ou l\'espace, et je t\'expliquerai de manière simple et amusante.',
    category: 'découverte',
    ageRange: '7-10',
    difficulty: 'facile'
  },
  {
    id: 'emotion_help',
    title: 'Aide aux émotions',
    prompt: 'Parle-moi de tes émotions ! Si tu te sens triste, en colère, ou joyeux, je suis là pour t\'écouter et t\'aider à comprendre ce que tu ressens.',
    category: 'émotions',
    ageRange: '3-6',
    difficulty: 'facile'
  },
  {
    id: 'learning_help',
    title: 'Aide aux devoirs',
    prompt: 'Besoin d\'aide pour tes devoirs ? Je peux t\'expliquer les mathématiques, la grammaire, ou l\'histoire de manière simple et avec des exemples concrets.',
    category: 'apprentissage',
    ageRange: '7-10',
    difficulty: 'moyen'
  },
  {
    id: 'creative_art',
    title: 'Art créatif',
    prompt: 'Créons quelque chose ensemble ! Je peux t\'aider à dessiner, à inventer des histoires, ou à créer des jeux. Que veux-tu faire aujourd\'hui ?',
    category: 'créativité',
    ageRange: '3-6',
    difficulty: 'facile'
  }
];

// Activités ludiques pour enfants
const CHILD_ACTIVITIES: ChildActivity[] = [
  {
    id: 'riddle_time',
    title: 'L\'heure des devinettes',
    description: 'Amuse-toi avec des devinettes amusantes !',
    type: 'devinette',
    duration: 10,
    instructions: [
      'Je vais te poser une devinette',
      'Réfléchis bien avant de répondre',
      'Si tu ne trouves pas, je te donnerai des indices'
    ]
  },
  {
    id: 'story_chain',
    title: 'Histoire en chaîne',
    description: 'Créons une histoire ensemble, phrase par phrase !',
    type: 'histoire',
    duration: 15,
    instructions: [
      'Je commence l\'histoire',
      'Tu ajoutes une phrase',
      'On continue à tour de rôle',
      'L\'histoire devient de plus en plus drôle !'
    ]
  },
  {
    id: 'word_game',
    title: 'Jeu de mots',
    description: 'Jouons avec les mots et les lettres !',
    type: 'quiz',
    duration: 12,
    instructions: [
      'Je te donne un mot',
      'Tu trouves un mot qui rime',
      'Ou un mot qui commence par la même lettre',
      'On continue la chaîne !'
    ]
  },
  {
    id: 'science_experiment',
    title: 'Expérience scientifique',
    description: 'Découvrons la science avec des expériences simples !',
    type: 'science',
    duration: 20,
    materials: ['Papier', 'Crayons', 'Imagination'],
    instructions: [
      'Je te propose une expérience simple',
      'Tu la réalises avec tes parents',
      'On observe ensemble les résultats',
      'On discute de ce qui se passe'
    ]
  },
  {
    id: 'music_creation',
    title: 'Création musicale',
    description: 'Créons de la musique ensemble !',
    type: 'musique',
    duration: 15,
    instructions: [
      'Choisis un rythme simple',
      'Invente des paroles amusantes',
      'Chantons ensemble !',
      'On peut même danser !'
    ]
  }
];

// Niveaux de langage adaptés aux enfants
const CHILD_LANGUAGE_LEVELS: Record<string, ChildLanguageLevel> = {
  '3-6': {
    level: 'débutant',
    maxSentenceLength: 8,
    maxWordLength: 6,
    vocabularyComplexity: 'simple',
    examples: [
      'Bonjour ! Comment vas-tu ?',
      'Regarde ce joli chat !',
      'Veux-tu jouer avec moi ?'
    ]
  },
  '7-10': {
    level: 'intermédiaire',
    maxSentenceLength: 12,
    maxWordLength: 8,
    vocabularyComplexity: 'modéré',
    examples: [
      'Salut ! Comment s\'est passée ta journée ?',
      'C\'est fascinant de découvrir de nouvelles choses !',
      'Peux-tu m\'expliquer ce que tu veux dire ?'
    ]
  },
  '11-14': {
    level: 'avancé',
    maxSentenceLength: 15,
    maxWordLength: 10,
    vocabularyComplexity: 'riche',
    examples: [
      'Bonjour ! J\'espère que tu passes une excellente journée !',
      'C\'est vraiment passionnant d\'explorer de nouveaux sujets ensemble.',
      'Peux-tu me donner plus de détails sur ce qui t\'intéresse ?'
    ]
  }
};

/**
 * Obtient un template de prompt adapté à l'âge
 */
export function getChildPromptTemplate(ageRange: string, category?: string): ChildPromptTemplate | null {
  let templates = CHILD_PROMPT_TEMPLATES.filter(t => t.ageRange === ageRange);
  
  if (category) {
    templates = templates.filter(t => t.category === category);
  }
  
  if (templates.length === 0) {
    templates = CHILD_PROMPT_TEMPLATES.filter(t => t.ageRange === '7-10');
  }
  
  return templates[Math.floor(Math.random() * templates.length)] || null;
}

/**
 * Obtient une activité ludique adaptée
 */
export function getChildActivity(type?: string, maxDuration?: number): ChildActivity | null {
  let activities = CHILD_ACTIVITIES;
  
  if (type) {
    activities = activities.filter(a => a.type === type);
  }
  
  if (maxDuration) {
    activities = activities.filter(a => a.duration <= maxDuration);
  }
  
  if (activities.length === 0) {
    activities = CHILD_ACTIVITIES;
  }
  
  return activities[Math.floor(Math.random() * activities.length)] || null;
}

/**
 * Obtient le niveau de langage adapté à l'âge
 */
export function getChildLanguageLevel(ageRange: string): ChildLanguageLevel {
  return CHILD_LANGUAGE_LEVELS[ageRange] || CHILD_LANGUAGE_LEVELS['7-10'];
}

/**
 * Génère un prompt système adapté au mode enfant
 */
export function generateChildSystemPrompt(ageRange: string = '7-10'): string {
  const languageLevel = getChildLanguageLevel(ageRange);
  
  const basePrompt = [
    'MODE ENFANT ACTIF - Niveau ' + languageLevel.level.toUpperCase(),
    '',
    'RÈGLES DE COMMUNICATION :',
    `- Utilise des phrases de maximum ${languageLevel.maxSentenceLength} mots`,
    `- Évite les mots de plus de ${languageLevel.maxWordLength} lettres`,
    `- Vocabulaire : ${languageLevel.vocabularyComplexity}`,
    '',
    'TON ET APPROCHE :',
    '- Sois chaleureux, patient et encourageant',
    '- Utilise des exemples concrets et familiers',
    '- Pose des questions pour maintenir l\'engagement',
    '- Célèbre les efforts et les réussites',
    '',
    'ACTIVITÉS LUDIQUES :',
    '- Propose régulièrement des jeux et activités',
    '- Adapte la difficulté au niveau de l\'enfant',
    '- Encourage la créativité et l\'imagination',
    '- Fais des liens avec la vie quotidienne',
    '',
    'SÉCURITÉ ET MODÉRATION :',
    '- Évite tout contenu inapproprié ou violent',
    '- Redirige vers des sujets positifs et éducatifs',
    '- Encourage la demande d\'aide aux adultes si nécessaire',
    '- Maintiens un environnement bienveillant et sécurisé'
  ].join('\n');
  
  return basePrompt;
}

/**
 * Génère des suggestions de conversation pour enfants
 */
export function generateConversationStarters(ageRange: string, mood?: string): string[] {
  const starters = {
    '3-6': [
      'Bonjour ! Comment te sens-tu aujourd\'hui ?',
      'Quel est ton animal préféré ?',
      'Veux-tu que je te raconte une histoire ?',
      'Qu\'est-ce qui te fait rire ?',
      'Quel est ton jeu préféré ?'
    ],
    '7-10': [
      'Salut ! Comment s\'est passée ta journée ?',
      'Qu\'est-ce que tu aimerais apprendre aujourd\'hui ?',
      'Raconte-moi quelque chose d\'amusant !',
      'Quel est ton livre préféré ?',
      'Que veux-tu créer ensemble ?'
    ],
    '11-14': [
      'Bonjour ! Comment va ?',
      'Qu\'est-ce qui t\'intéresse en ce moment ?',
      'Raconte-moi tes dernières découvertes !',
      'Sur quoi travailles-tu en ce moment ?',
      'Quel est ton projet du moment ?'
    ]
  };
  
  let selectedStarters = starters[ageRange as keyof typeof starters] || starters['7-10'];
  
  // Filtrer par humeur si spécifiée
  if (mood) {
    const moodStarters = {
      'joyeux': ['Tu as l\'air de bonne humeur !', 'Qu\'est-ce qui te rend si heureux ?'],
      'curieux': ['Tu as l\'air curieux !', 'Qu\'est-ce qui t\'intrigue ?'],
      'créatif': ['Tu as envie de créer quelque chose ?', 'Qu\'est-ce qui t\'inspire ?'],
      'fatigué': ['Tu as l\'air fatigué...', 'Veux-tu qu\'on fasse quelque chose de calme ?']
    };
    
    if (moodStarters[mood as keyof typeof moodStarters]) {
      selectedStarters = [...moodStarters[mood as keyof typeof moodStarters], ...selectedStarters];
    }
  }
  
  // Retourner 3 starters mélangés
  return selectedStarters.sort(() => Math.random() - 0.5).slice(0, 3);
}

/**
 * Génère des récompenses et encouragements
 */
export function generateEncouragement(achievement: string, ageRange: string): string {
  const encouragements = {
    '3-6': [
      'Bravo ! Tu es vraiment doué ! 🌟',
      'Excellent travail ! Continue comme ça ! 🎉',
      'Tu apprends tellement vite ! 👏',
      'C\'est fantastique ! Tu me surprends ! ⭐'
    ],
    '7-10': [
      'Félicitations ! Tu as fait un excellent travail ! 🎯',
      'Impressionnant ! Tu progresses vraiment bien ! 🚀',
      'Tu es sur la bonne voie ! Continue tes efforts ! 💪',
      'Super ! Tu as raison d\'être fier de toi ! 🏆'
    ],
    '11-14': [
      'Excellent travail ! Tu montres une vraie compréhension ! 🎓',
      'Impressionnant ! Tu as une approche très mature ! 🌟',
      'Tu progresses vraiment bien ! Continue tes efforts ! 💪',
      'Félicitations ! Tu as raison d\'être satisfait ! 🎯'
    ]
  };
  
  const ageEncouragements = encouragements[ageRange as keyof typeof encouragements] || encouragements['7-10'];
  const randomEncouragement = ageEncouragements[Math.floor(Math.random() * ageEncouragements.length)];
  
  return `${randomEncouragement}\n\n${achievement}`;
}

/**
 * Statistiques du service de contenu enfant
 */
export function getChildContentStats(): {
  totalTemplates: number;
  totalActivities: number;
  languageLevels: number;
  categories: string[];
} {
  return {
    totalTemplates: CHILD_PROMPT_TEMPLATES.length,
    totalActivities: CHILD_ACTIVITIES.length,
    languageLevels: Object.keys(CHILD_LANGUAGE_LEVELS).length,
    categories: [...new Set(CHILD_PROMPT_TEMPLATES.map(t => t.category))]
  };
}
