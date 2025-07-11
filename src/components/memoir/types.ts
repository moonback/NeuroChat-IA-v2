export interface MemoryCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  keywords: string[];
  examples: string[];
}

export interface MemoryFact {
  id: string;
  content: string;
  date: string;
  category?: string;
  importance?: 'low' | 'medium' | 'high';
  tags?: string[];
  confidence?: number;
  lastUpdated?: string;
}

export interface MemoryPreferences {
  autoDetection: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  enabledCategories: string[];
  retentionDays: number;
  privacyLevel: 'basic' | 'enhanced' | 'paranoid';
}

export interface SearchOptions {
  query: string;
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  importance?: ('low' | 'medium' | 'high')[];
  fuzzySearch?: boolean;
  contextual?: boolean;
}

export interface SearchResult {
  fact: MemoryFact;
  relevanceScore: number;
  matchedTerms: string[];
  contextSnippet?: string;
}

// Constantes pour les catégories de mémoire
export const MEMORY_CATEGORIES: MemoryCategory[] = [
  {
    id: 'identity',
    name: 'Identité',
    icon: 'User',
    color: 'blue',
    keywords: ['nom', 'prénom', 'âge', 'né', 'naissance', 'appelle', 'suis'],
    examples: [
      "Je m'appelle Sophie et j'ai 28 ans",
      "Mon nom de famille est Dubois",
      "Je suis née le 12 mars 1995"
    ]
  },
  {
    id: 'location',
    name: 'Localisation',
    icon: 'MapPin',
    color: 'green',
    keywords: ['habite', 'vis', 'adresse', 'ville', 'région', 'pays', 'code postal'],
    examples: [
      "J'habite au 15 rue de la Paix à Lyon",
      "Je vis dans le 13ème arrondissement",
      "Mon code postal est 69000"
    ]
  },
  {
    id: 'work',
    name: 'Professionnel',
    icon: 'Briefcase',
    color: 'purple',
    keywords: ['travaille', 'métier', 'profession', 'entreprise', 'bureau', 'collègue', 'patron'],
    examples: [
      "Je travaille comme ingénieure informatique",
      "Mon entreprise s'appelle TechCorp",
      "Je suis freelance en développement"
    ]
  },
  {
    id: 'family',
    name: 'Famille',
    icon: 'Heart',
    color: 'pink',
    keywords: ['famille', 'parent', 'enfant', 'mari', 'femme', 'frère', 'sœur', 'fils', 'fille'],
    examples: [
      "J'ai deux enfants : Emma et Lucas",
      "Mon mari s'appelle Pierre",
      "Mes parents habitent en Bretagne"
    ]
  },
  {
    id: 'health',
    name: 'Santé',
    icon: 'Shield',
    color: 'red',
    keywords: ['santé', 'maladie', 'allergique', 'médecin', 'traitement', 'sport', 'exercice'],
    examples: [
      "Je suis allergique aux fruits de mer",
      "Je porte des lunettes depuis l'âge de 10 ans",
      "Je fais du jogging 3 fois par semaine"
    ]
  },
  {
    id: 'hobbies',
    name: 'Loisirs',
    icon: 'Star',
    color: 'yellow',
    keywords: ['aime', 'adore', 'préfère', 'loisir', 'hobby', 'sport', 'lecture', 'musique'],
    examples: [
      "J'adore la cuisine italienne",
      "Mon sport préféré est la natation",
      "J'aime lire des romans policiers"
    ]
  },
  {
    id: 'technology',
    name: 'Technologie',
    icon: 'Smartphone',
    color: 'indigo',
    keywords: ['téléphone', 'ordinateur', 'utilise', 'application', 'internet', 'email', 'mot de passe'],
    examples: [
      "Mon téléphone est un iPhone 14",
      "J'utilise Gmail pour mes emails",
      "Je préfère Netflix à Amazon Prime"
    ]
  },
  {
    id: 'goals',
    name: 'Objectifs',
    icon: 'Target',
    color: 'orange',
    keywords: ['objectif', 'rêve', 'veux', 'souhaite', 'espère', 'projet', 'futur'],
    examples: [
      "Je rêve de voyager au Japon",
      "Je veux acheter une maison l'année prochaine",
      "Mon objectif est de courir un marathon"
    ]
  }
]; 