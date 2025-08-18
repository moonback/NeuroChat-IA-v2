import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Bookmark, 
  Star,
  ArrowRight,
  Settings,
  Trash2,
  Download,
  Upload,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import type { ConversationTemplate, TemplatePlaceholder, TemplateCategory } from '@/types/templates';
import TemplateService, { TEMPLATE_CATEGORIES } from '@/services/templateService';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ConversationTemplate, filledPrompt: string, settings: any) => void;
  workspaceId?: string;
}

interface PlaceholderFormProps {
  template: ConversationTemplate;
  onSubmit: (values: Record<string, string>) => void;
  onBack: () => void;
}

const PlaceholderForm: React.FC<PlaceholderFormProps> = ({ template, onSubmit, onBack }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser les valeurs par défaut
  useEffect(() => {
    const defaultValues: Record<string, string> = {};
    template.placeholders?.forEach(placeholder => {
      if (placeholder.defaultValue) {
        defaultValues[placeholder.id] = placeholder.defaultValue;
      }
    });
    setValues(defaultValues);
  }, [template]);

  const validateField = (placeholder: TemplatePlaceholder, value: string): string | null => {
    if (placeholder.required && !value.trim()) {
      return 'Ce champ est obligatoire';
    }

    if (placeholder.validation) {
      const { minLength, maxLength, pattern } = placeholder.validation;
      
      if (minLength && value.length < minLength) {
        return `Minimum ${minLength} caractères`;
      }
      
      if (maxLength && value.length > maxLength) {
        return `Maximum ${maxLength} caractères`;
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        return 'Format invalide';
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validation
    template.placeholders?.forEach(placeholder => {
      const error = validateField(placeholder, values[placeholder.id] || '');
      if (error) {
        newErrors[placeholder.id] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  };

  const renderField = (placeholder: TemplatePlaceholder) => {
    const value = values[placeholder.id] || '';
    const error = errors[placeholder.id];

    const commonProps = {
      id: placeholder.id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues(prev => ({ ...prev, [placeholder.id]: e.target.value }));
        if (error) {
          setErrors(prev => ({ ...prev, [placeholder.id]: '' }));
        }
      },
      placeholder: placeholder.placeholder,
      className: cn(error && "border-red-500")
    };

    switch (placeholder.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={6}
            className="resize-none min-h-[120px]"
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => {
            setValues(prev => ({ ...prev, [placeholder.id]: newValue }));
            if (error) {
              setErrors(prev => ({ ...prev, [placeholder.id]: '' }));
            }
          }}>
            <SelectTrigger className={cn(error && "border-red-500")}>
              <SelectValue placeholder={placeholder.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {placeholder.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
          />
        );
      
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6 min-h-0 pb-8">
      <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Configuration du template
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Remplissez les champs pour personnaliser votre template
          </p>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-slate-900">
          Retour
        </Button>
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{template.icon}</div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              {template.name}
            </h4>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
              {template.description}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {template.placeholders?.map(placeholder => (
          <div key={placeholder.id} className="space-y-3">
            <Label htmlFor={placeholder.id} className="text-sm font-medium">
              {placeholder.label}
              {placeholder.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(placeholder)}
            {errors[placeholder.id] && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors[placeholder.id]}
              </p>
            )}
          </div>
        ))}

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-6 pb-2 mt-8">
          <Button type="submit" className="w-full h-12 text-base">
            <ArrowRight className="w-5 h-5 mr-2" />
            Créer la conversation
          </Button>
        </div>
      </form>
    </div>
  );
};

const TemplateCard: React.FC<{
  template: ConversationTemplate;
  onClick: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}> = ({ template, onClick, onFavorite, isFavorited = false }) => {
  return (
    <div
      onClick={onClick}
      className="group p-4 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-200 cursor-pointer hover:shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-lg`}>
            {template.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {template.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          >
            <Star className={cn("w-4 h-4", isFavorited ? "fill-yellow-400 text-yellow-400" : "text-slate-400")} />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{template.tags.length - 2}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          {template.usage && template.usage > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {template.usage}
            </span>
          )}
          {template.isCustom && (
            <Badge variant="outline" className="text-xs">
              Personnalisé
            </Badge>
          )}
        </div>
      </div>

      {/* Indicateurs de configuration */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
        {template.settings.ragEnabled && (
          <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400">
            RAG
          </Badge>
        )}
        {template.settings.webEnabled && (
          <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">
            Web
          </Badge>
        )}
        {template.settings.agentEnabled && (
          <Badge variant="outline" className="text-xs text-purple-600 dark:text-purple-400">
            Agent
          </Badge>
        )}
      </div>
    </div>
  );
};

export function TemplateModal({ isOpen, onClose, onSelectTemplate, workspaceId = 'default' }: TemplateModalProps) {
  const [templateService] = useState(() => new TemplateService(workspaceId));
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Charger les favoris
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`ws:${workspaceId}:template_favorites`);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, [workspaceId]);

  // Sauvegarder les favoris
  const saveFavorites = (newFavorites: Set<string>) => {
    try {
      localStorage.setItem(`ws:${workspaceId}:template_favorites`, JSON.stringify([...newFavorites]));
      setFavorites(newFavorites);
    } catch {}
  };

  const handleToggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    saveFavorites(newFavorites);
  };

  // Templates filtrés selon la catégorie et la recherche
  const filteredTemplates = useMemo(() => {
    let templates = templateService.getAllTemplates();

    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        templates = templates.filter(t => favorites.has(t.id));
      } else {
        templates = templates.filter(t => t.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      templates = templateService.searchTemplates(searchQuery);
    }

    return templates;
  }, [templateService, selectedCategory, searchQuery, favorites]);

  const mostUsedTemplates = useMemo(() => templateService.getMostUsedTemplates(6), [templateService]);
  const recentTemplates = useMemo(() => templateService.getRecentTemplates(6), [templateService]);

  const handleTemplateSelect = (template: ConversationTemplate) => {
    if (template.placeholders && template.placeholders.length > 0) {
      setSelectedTemplate(template);
    } else {
      // Template sans placeholders, utiliser directement
      handleTemplateSubmit(template, {});
    }
  };

  const handleTemplateSubmit = (template: ConversationTemplate, values: Record<string, string>) => {
    const filledPrompt = templateService.fillTemplate(template, values);
    
    // Enregistrer l'utilisation
    templateService.recordUsage(template.id, values);

    // Préparer les settings
    const settings = {
      ragEnabled: template.settings.ragEnabled,
      webEnabled: template.settings.webEnabled,
      agentEnabled: template.settings.agentEnabled,
      provider: template.settings.provider
    };

    onSelectTemplate(template, filledPrompt, settings);
    onClose();
    setSelectedTemplate(null);
    
    toast.success(`Template "${template.name}" appliqué !`);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
  };

  const handleExportTemplates = () => {
    try {
      const data = templateService.exportCustomTemplates();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neurochat-templates-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Templates exportés !');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = templateService.importCustomTemplates(content);
        
        if (result.success) {
          toast.success(`${result.imported} template(s) importé(s) !`);
        } else {
          toast.error('Échec de l\'import');
        }
        
        if (result.errors.length > 0) {
          console.warn('Erreurs d\'import:', result.errors);
        }
      } catch {
        toast.error('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  if (selectedTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[80vw] max-w-4xl h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle>Utiliser un template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <PlaceholderForm
              template={selectedTemplate}
              onSubmit={(values) => handleTemplateSubmit(selectedTemplate, values)}
              onBack={handleBack}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Templates de conversation
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-auto grid-cols-3">
                <TabsTrigger value="browse">Parcourir</TabsTrigger>
                <TabsTrigger value="recent">Récents</TabsTrigger>
                <TabsTrigger value="manage">Gérer</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="browse" className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="favorites">⭐ Favoris</SelectItem>
                    <Separator />
                    {TEMPLATE_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredTemplates.length} template(s)
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {filteredTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateSelect(template)}
                      onFavorite={() => handleToggleFavorite(template.id)}
                      isFavorited={favorites.has(template.id)}
                    />
                  ))}
                </div>
                
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Aucun template trouvé
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              {mostUsedTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <h3 className="font-medium">Les plus utilisés</h3>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mostUsedTemplates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateSelect(template)}
                          onFavorite={() => handleToggleFavorite(template.id)}
                          isFavorited={favorites.has(template.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {recentTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <h3 className="font-medium">Récemment utilisés</h3>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentTemplates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateSelect(template)}
                          onFavorite={() => handleToggleFavorite(template.id)}
                          isFavorited={favorites.has(template.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {mostUsedTemplates.length === 0 && recentTemplates.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Aucun historique
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Utilisez des templates pour voir vos récents et favoris ici
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Gestion des templates</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTemplates}
                    className="hidden"
                    id="import-templates"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('import-templates')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportTemplates}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Fonctionnalités à venir
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Création de templates personnalisés</li>
                  <li>• Modification des templates existants</li>
                  <li>• Partage de templates</li>
                  <li>• Statistiques d'utilisation détaillées</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 pt-0">
          <Button onClick={onClose} variant="outline" className="w-full">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
