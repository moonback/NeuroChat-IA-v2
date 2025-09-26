/**
 * 🚀 useBoltPrompt - Hook pour le Générateur de Prompts bolt.new
 * 
 * Hook personnalisé pour gérer l'état et les actions du générateur de prompts
 * - Gestion des templates et presets
 * - Configuration des paramètres
 * - Génération et historique des prompts
 * - Intégration avec le service boltPromptService
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { boltPromptService } from '@/services/boltPromptService';
import type { 
  BoltPromptTemplate, 
  BoltPromptConfig, 
  GeneratedBoltPrompt, 
  BoltPromptCategory,
  BoltPromptPreset 
} from '@/types/boltPrompt';

interface UseBoltPromptOptions {
  workspaceId?: string;
  autoSave?: boolean;
}

interface UseBoltPromptReturn {
  // État
  templates: BoltPromptTemplate[];
  presets: BoltPromptPreset[];
  generatedPrompts: GeneratedBoltPrompt[];
  selectedTemplate: BoltPromptTemplate | null;
  selectedPreset: BoltPromptPreset | null;
  config: BoltPromptConfig;
  generatedPrompt: GeneratedBoltPrompt | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  selectTemplate: (template: BoltPromptTemplate | null) => void;
  selectPreset: (preset: BoltPromptPreset | null) => void;
  updateConfig: (updates: Partial<BoltPromptConfig>) => void;
  resetConfig: () => void;
  generatePrompt: () => Promise<void>;
  copyPrompt: () => void;
  downloadPrompt: () => void;
  ratePrompt: (rating: number, feedback?: string) => void;
  deleteGeneratedPrompt: (id: string) => void;
  loadGeneratedPrompt: (id: string) => void;

  // Utilitaires
  getTemplatesByCategory: (category: BoltPromptCategory) => BoltPromptTemplate[];
  getPresetsByCategory: (category: BoltPromptCategory) => BoltPromptPreset[];
  getStats: () => any;
  exportConfig: () => string;
  importConfig: (configString: string) => boolean;
}

const DEFAULT_CONFIG: BoltPromptConfig = {
  projectType: '',
  techStack: [],
  features: [],
  targetAudience: '',
  complexity: 'intermediate',
  timeline: '',
  budget: '',
  constraints: [],
  goals: [],
  inspiration: '',
  additionalContext: ''
};

export function useBoltPrompt(options: UseBoltPromptOptions = {}): UseBoltPromptReturn {
  const { workspaceId, autoSave = true } = options;

  // État local
  const [selectedTemplate, setSelectedTemplate] = useState<BoltPromptTemplate | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<BoltPromptPreset | null>(null);
  const [config, setConfig] = useState<BoltPromptConfig>(DEFAULT_CONFIG);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedBoltPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données du service
  const templates = useMemo(() => boltPromptService.getTemplates(), []);
  const presets = useMemo(() => boltPromptService.getPresets(), []);
  const generatedPrompts = useMemo(() => boltPromptService.getGeneratedPrompts(), []);

  // Charger la configuration depuis le localStorage
  useEffect(() => {
    if (workspaceId) {
      try {
        const savedConfig = localStorage.getItem(`bolt_prompt_config_${workspaceId}`);
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, [workspaceId]);

  // Sauvegarder la configuration dans le localStorage
  useEffect(() => {
    if (autoSave && workspaceId) {
      try {
        localStorage.setItem(`bolt_prompt_config_${workspaceId}`, JSON.stringify(config));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
      }
    }
  }, [config, workspaceId, autoSave]);

  // Appliquer un preset sélectionné
  useEffect(() => {
    if (selectedPreset) {
      setConfig(prev => ({
        ...prev,
        ...selectedPreset.config
      }));
    }
  }, [selectedPreset]);

  // Sélectionner un template
  const selectTemplate = useCallback((template: BoltPromptTemplate | null) => {
    setSelectedTemplate(template);
    setError(null);
  }, []);

  // Sélectionner un preset
  const selectPreset = useCallback((preset: BoltPromptPreset | null) => {
    setSelectedPreset(preset);
    setError(null);
  }, []);

  // Mettre à jour la configuration
  const updateConfig = useCallback((updates: Partial<BoltPromptConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setSelectedPreset(null);
    setGeneratedPrompt(null);
    setError(null);
  }, []);

  // Générer un prompt
  const generatePrompt = useCallback(async () => {
    if (!selectedTemplate) {
      setError('Veuillez sélectionner un template');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generated = boltPromptService.generatePrompt(selectedTemplate.id, config);
      setGeneratedPrompt(generated);
      toast.success('Prompt généré avec succès !');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du prompt';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTemplate, config]);

  // Copier le prompt généré
  const copyPrompt = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt.generatedPrompt);
      toast.success('Prompt copié dans le presse-papiers !');
    }
  }, [generatedPrompt]);

  // Télécharger le prompt
  const downloadPrompt = useCallback(() => {
    if (generatedPrompt) {
      const blob = new Blob([generatedPrompt.generatedPrompt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bolt-prompt-${generatedPrompt.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Prompt téléchargé !');
    }
  }, [generatedPrompt]);

  // Noter un prompt généré
  const ratePrompt = useCallback((rating: number, feedback?: string) => {
    if (generatedPrompt) {
      const success = boltPromptService.updateGeneratedPromptRating(generatedPrompt.id, rating, feedback);
      if (success) {
        toast.success('Note enregistrée !');
      }
    }
  }, [generatedPrompt]);

  // Supprimer un prompt généré
  const deleteGeneratedPrompt = useCallback((id: string) => {
    const success = boltPromptService.deleteGeneratedPrompt(id);
    if (success) {
      if (generatedPrompt?.id === id) {
        setGeneratedPrompt(null);
      }
      toast.success('Prompt supprimé !');
    }
  }, [generatedPrompt]);

  // Charger un prompt généré
  const loadGeneratedPrompt = useCallback((id: string) => {
    const prompt = boltPromptService.getGeneratedPrompt(id);
    if (prompt) {
      setGeneratedPrompt(prompt);
      // Charger aussi le template associé
      const template = boltPromptService.getTemplate(prompt.templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, []);

  // Récupérer les templates par catégorie
  const getTemplatesByCategory = useCallback((category: BoltPromptCategory) => {
    return boltPromptService.getTemplatesByCategory(category);
  }, []);

  // Récupérer les presets par catégorie
  const getPresetsByCategory = useCallback((category: BoltPromptCategory) => {
    return boltPromptService.getPresetsByCategory(category);
  }, []);

  // Récupérer les statistiques
  const getStats = useCallback(() => {
    return boltPromptService.getStats();
  }, []);

  // Exporter la configuration
  const exportConfig = useCallback(() => {
    const exportData = {
      config,
      selectedTemplate: selectedTemplate?.id,
      selectedPreset: selectedPreset?.id,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }, [config, selectedTemplate, selectedPreset]);

  // Importer la configuration
  const importConfig = useCallback((configString: string) => {
    try {
      const importData = JSON.parse(configString);
      
      if (importData.config) {
        setConfig(importData.config);
      }
      
      if (importData.selectedTemplate) {
        const template = boltPromptService.getTemplate(importData.selectedTemplate);
        if (template) {
          setSelectedTemplate(template);
        }
      }
      
      if (importData.selectedPreset) {
        const preset = boltPromptService.getPresets().find(p => p.id === importData.selectedPreset);
        if (preset) {
          setSelectedPreset(preset);
        }
      }
      
      toast.success('Configuration importée avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import de la configuration:', error);
      toast.error('Erreur lors de l\'import de la configuration');
      return false;
    }
  }, []);

  return {
    // État
    templates,
    presets,
    generatedPrompts,
    selectedTemplate,
    selectedPreset,
    config,
    generatedPrompt,
    isLoading,
    error,

    // Actions
    selectTemplate,
    selectPreset,
    updateConfig,
    resetConfig,
    generatePrompt,
    copyPrompt,
    downloadPrompt,
    ratePrompt,
    deleteGeneratedPrompt,
    loadGeneratedPrompt,

    // Utilitaires
    getTemplatesByCategory,
    getPresetsByCategory,
    getStats,
    exportConfig,
    importConfig
  };
}
