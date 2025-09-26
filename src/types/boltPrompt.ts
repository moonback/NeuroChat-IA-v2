/**
 * Types pour le module de génération de prompts système bolt.new
 */

export interface BoltPromptTemplate {
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

export interface BoltPromptVariable {
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: string | string[] | number | boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  min?: number;
  max?: number;
}

export type BoltPromptCategory = 
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
  | 'other';

export interface BoltPromptConfig {
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

export interface GeneratedBoltPrompt {
  id: string;
  templateId: string;
  config: BoltPromptConfig;
  generatedPrompt: string;
  createdAt: Date;
  rating?: number;
  feedback?: string;
}

export interface BoltPromptPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<BoltPromptConfig>;
  category: BoltPromptCategory;
  isDefault?: boolean;
}

export interface BoltPromptStats {
  totalTemplates: number;
  totalGenerated: number;
  mostUsedCategory: BoltPromptCategory;
  averageRating: number;
  recentActivity: Array<{
    date: Date;
    action: 'generated' | 'created' | 'updated';
    templateId?: string;
  }>;
}
