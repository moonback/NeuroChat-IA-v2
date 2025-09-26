/**
 * 🚀 BoltPromptGenerator - Générateur de Prompts Système bolt.new
 * 
 * Composant principal pour générer des prompts système optimisés pour bolt.new
 * - Sélection de templates prédéfinis
 * - Configuration dynamique des paramètres
 * - Génération et prévisualisation des prompts
 * - Gestion de l'historique et des favoris
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, Star, Sparkles, Code, Smartphone, Brain, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { boltPromptService } from '@/services/boltPromptService';
import type { 
  BoltPromptTemplate, 
  BoltPromptConfig, 
  GeneratedBoltPrompt, 
  BoltPromptCategory,
  BoltPromptPreset,
  BoltPromptVariable 
} from '@/types/boltPrompt';

interface BoltPromptGeneratorProps {
  className?: string;
}

const CATEGORY_ICONS: Record<BoltPromptCategory, React.ReactNode> = {
  'web-app': <Globe className="w-4 h-4" />,
  'mobile-app': <Smartphone className="w-4 h-4" />,
  'desktop-app': <Code className="w-4 h-4" />,
  'api': <Code className="w-4 h-4" />,
  'database': <Code className="w-4 h-4" />,
  'ai-ml': <Brain className="w-4 h-4" />,
  'game': <Sparkles className="w-4 h-4" />,
  'ecommerce': <Globe className="w-4 h-4" />,
  'social': <Globe className="w-4 h-4" />,
  'productivity': <Code className="w-4 h-4" />,
  'education': <Brain className="w-4 h-4" />,
  'healthcare': <Brain className="w-4 h-4" />,
  'finance': <Code className="w-4 h-4" />,
  'entertainment': <Sparkles className="w-4 h-4" />,
  'other': <Code className="w-4 h-4" />
};

const CATEGORY_LABELS: Record<BoltPromptCategory, string> = {
  'web-app': 'Application Web',
  'mobile-app': 'Application Mobile',
  'desktop-app': 'Application Desktop',
  'api': 'API',
  'database': 'Base de Données',
  'ai-ml': 'IA/ML',
  'game': 'Jeu',
  'ecommerce': 'E-commerce',
  'social': 'Social',
  'productivity': 'Productivité',
  'education': 'Éducation',
  'healthcare': 'Santé',
  'finance': 'Finance',
  'entertainment': 'Divertissement',
  'other': 'Autre'
};

export function BoltPromptGenerator({ className }: BoltPromptGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BoltPromptTemplate | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<BoltPromptPreset | null>(null);
  const [config, setConfig] = useState<BoltPromptConfig>({
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
  });
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedBoltPrompt | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'presets' | 'history'>('templates');
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper function pour vérifier si un template est sélectionné
  const isTemplateSelected = (templateId: string): boolean => {
    return selectedTemplate?.id === templateId;
  };

  const templates = useMemo(() => boltPromptService.getTemplates(), []);
  const presets = useMemo(() => boltPromptService.getPresets(), []);
  const generatedPrompts = useMemo(() => boltPromptService.getGeneratedPrompts(), []);

  // Appliquer un preset sélectionné
  useEffect(() => {
    if (selectedPreset) {
      setConfig(prev => ({
        ...prev,
        ...selectedPreset.config
      }));
    }
  }, [selectedPreset]);

  // Réinitialiser la configuration
  const resetConfig = () => {
    setConfig({
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
    });
    setSelectedTemplate(null);
    setSelectedPreset(null);
    setGeneratedPrompt(null);
  };

  // Générer le prompt
  const handleGeneratePrompt = async () => {
    if (!selectedTemplate) {
      toast.error('Veuillez sélectionner un template');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = boltPromptService.generatePrompt(selectedTemplate.id, config);
      setGeneratedPrompt(generated);
      toast.success('Prompt généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération du prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copier le prompt généré
  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt.generatedPrompt);
      toast.success('Prompt copié dans le presse-papiers !');
    }
  };

  // Télécharger le prompt
  const handleDownloadPrompt = () => {
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
  };

  // Noter un prompt généré
  const handleRatePrompt = (rating: number) => {
    if (generatedPrompt) {
      boltPromptService.updateGeneratedPromptRating(generatedPrompt.id, rating);
      toast.success('Note enregistrée !');
    }
  };

  // Rendu d'un champ de configuration
  const renderConfigField = (variable: BoltPromptVariable) => {
    const value = config[variable.name as keyof BoltPromptConfig] || variable.defaultValue;

    switch (variable.type) {
      case 'text':
        return (
          <div key={variable.name} className="space-y-2">
            <Label htmlFor={variable.name}>
              {variable.label}
              {variable.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={variable.name}
              value={String(value)}
              onChange={(e) => setConfig(prev => ({ ...prev, [variable.name]: e.target.value }))}
              placeholder={variable.placeholder}
            />
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={variable.name} className="space-y-2">
            <Label htmlFor={variable.name}>
              {variable.label}
              {variable.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => setConfig(prev => ({ ...prev, [variable.name]: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={variable.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {variable.options?.map((option: { value: string; label: string }) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={variable.name} className="space-y-2">
            <Label htmlFor={variable.name}>
              {variable.label}
              {variable.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex flex-wrap gap-2">
              {variable.options?.map((option: { value: string; label: string }) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = isSelected
                        ? currentValues.filter((v: string) => v !== option.value)
                        : [...currentValues, option.value];
                      setConfig(prev => ({ ...prev, [variable.name]: newValues }));
                    }}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={variable.name} className="space-y-2">
            <Label htmlFor={variable.name}>
              {variable.label}
              {variable.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={variable.name}
              type="number"
              value={String(value)}
              onChange={(e) => setConfig(prev => ({ ...prev, [variable.name]: Number(e.target.value) }))}
              placeholder={variable.placeholder}
              min={variable.min}
              max={variable.max}
            />
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={variable.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                id={variable.name}
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => setConfig(prev => ({ ...prev, [variable.name]: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor={variable.name}>
                {variable.label}
                {variable.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full max-w-12xl mx-auto p-6 space-y-6', className)}>
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card className="p-6 space-y-6 flex flex-col max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Configuration</h2>
            <Button variant="outline" size="sm" onClick={resetConfig}>
              Réinitialiser
            </Button>
          </div>

          {/* Sélection du template */}
          {!selectedTemplate ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'templates' | 'presets' | 'history')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          'p-4 cursor-pointer transition-all hover:shadow-md',
                          isTemplateSelected(template.id) ? 'ring-2 ring-blue-500' : ''
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {CATEGORY_ICONS[template.category]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{template.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORY_LABELS[template.category]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="presets" className="space-y-4">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {presets.map((preset) => (
                      <Card
                        key={preset.id}
                        className={cn(
                          'p-4 cursor-pointer transition-all hover:shadow-md',
                          selectedPreset?.id === preset.id && 'ring-2 ring-blue-500'
                        )}
                        onClick={() => setSelectedPreset(preset)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {CATEGORY_ICONS[preset.category]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{preset.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORY_LABELS[preset.category]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {generatedPrompts.slice(0, 10).map((prompt) => (
                      <Card
                        key={prompt.id}
                        className="p-4 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => setGeneratedPrompt(prompt)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {templates.find(t => t.id === prompt.templateId)?.name || 'Template'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(prompt.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {prompt.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{prompt.rating}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            /* Template sélectionné - Affichage du formulaire */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {CATEGORY_ICONS[selectedTemplate.category]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                >
                  Changer de template
                </Button>
              </div>
              
              <Separator />
            </div>
          )}

          {/* Configuration des variables */}
          {selectedTemplate && (
            <>
              <Separator />
              <div className="space-y-4 flex-1 overflow-hidden">
                <h3 className="font-medium">Paramètres du projet</h3>
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-1 gap-4 pr-4">
                    {selectedTemplate.variables.map(renderConfigField)}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Bouton de génération - Toujours visible */}
          <div className="flex-shrink-0 pt-4 border-t">
            <Button
              onClick={handleGeneratePrompt}
              disabled={!selectedTemplate || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer le Prompt
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Résultat */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prompt Généré</h2>
            {generatedPrompt && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copier
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPrompt}>
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            )}
          </div>

          {generatedPrompt ? (
            <div className="space-y-4">
              <ScrollArea className="h-96">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedPrompt.generatedPrompt}
                  </pre>
                </div>
              </ScrollArea>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Évaluez ce prompt</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={cn(
                        'w-5 h-5 cursor-pointer transition-colors',
                        generatedPrompt.rating && rating <= generatedPrompt.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground hover:text-yellow-400'
                      )}
                      onClick={() => handleRatePrompt(rating)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center space-y-2">
                <Sparkles className="w-12 h-12 mx-auto opacity-50" />
                <p>Générez un prompt pour voir le résultat ici</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Instructions */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Comment utiliser :</strong> Sélectionnez un template, configurez les paramètres de votre projet, 
          puis générez le prompt système. Copiez-le dans bolt.new pour commencer le développement !
        </AlertDescription>
      </Alert>
    </div>
  );
}
