export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'learning' | 'creative' | 'technical' | 'analysis' | 'personal' | 'custom';
  icon: string;
  color: string;
  prompt: string;
  placeholders?: TemplatePlaceholder[];
  settings: TemplateSettings;
  tags: string[];
  isCustom?: boolean;
  usage?: number;
  lastUsed?: Date;
  createdAt?: Date;
}

export interface TemplatePlaceholder {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Pour type 'select'
  defaultValue?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface TemplateSettings {
  ragEnabled: boolean;
  webEnabled: boolean;
  agentEnabled: boolean;
  provider?: 'gemini' | 'openai' | 'mistral';
  autoConfig?: boolean; // Configuration automatique selon le contexte
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templates: string[]; // IDs des templates
}

export interface TemplateUsage {
  templateId: string;
  timestamp: Date;
  placeholderValues?: Record<string, string>;
  satisfaction?: number; // 1-5
}
