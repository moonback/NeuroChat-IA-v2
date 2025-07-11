// Types pour le mode Deep Research
export interface DeepResearchConfig {
  enabled: boolean;
  maxSubQuestions: number;
  maxSources: number;
  includeWebSearch: boolean;
  includePerspectives: boolean;
  synthesisLevel: 'basic' | 'detailed' | 'comprehensive';
}

export interface DeepResearchSubQuestion {
  id: string;
  question: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'researching' | 'completed';
  findings?: string;
  sources?: string[];
}

export interface DeepResearchPerspective {
  id: string;
  title: string;
  description: string;
  arguments: string[];
  sources: string[];
  credibilityScore: number;
}

export interface DeepResearchInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  supportingEvidence: string[];
}

export interface DeepResearchResult {
  id: string;
  originalQuery: string;
  timestamp: Date;
  status: 'analyzing' | 'researching' | 'synthesizing' | 'completed' | 'error';
  progress: number;
  
  // Décomposition
  subQuestions: DeepResearchSubQuestion[];
  categories: string[];
  
  // Perspectives multiples
  perspectives: DeepResearchPerspective[];
  
  // Synthèse
  executiveSummary: string;
  keyFindings: string[];
  insights: DeepResearchInsight[];
  
  // Recommandations
  nextSteps: string[];
  relatedTopics: string[];
  
  // Métadonnées
  duration: number;
  sourcesUsed: string[];
  confidenceScore: number;
}

export interface DeepResearchSession {
  id: string;
  title: string;
  results: DeepResearchResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeepResearchContext {
  config: DeepResearchConfig;
  currentSession: DeepResearchSession | null;
  sessions: DeepResearchSession[];
  
  // Actions
  startResearch: (query: string, config?: Partial<DeepResearchConfig>) => Promise<DeepResearchResult>;
  stopResearch: (resultId: string) => void;
  updateConfig: (config: Partial<DeepResearchConfig>) => void;
  saveSession: (session: DeepResearchSession) => void;
  loadSession: (sessionId: string) => DeepResearchSession | null;
  deleteSession: (sessionId: string) => void;
}

// Types pour les messages Deep Research
export interface DeepResearchMessage {
  id: string;
  type: 'deep_research_result';
  result: DeepResearchResult;
  timestamp: Date;
  isUser: false;
}

export type ExtendedChatMessage = Message | RagContextMessage | DeepResearchMessage;

// Import des types existants
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

export interface RagContextMessage {
  id: string;
  passages: { id: number; titre: string; contenu: string }[];
  isRagContext: true;
  timestamp: Date;
} 