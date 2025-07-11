import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Save, Sparkles } from "lucide-react";
import { type MemoryFact, MEMORY_CATEGORIES } from './types';
import { MemoryDetectionService } from './MemoryDetectionService';
import { MemoryCategoryIndicator } from './MemoryCategoryIndicator';
import { cn } from "@/lib/utils";

interface MemoryFactEditorProps {
  open: boolean;
  onClose: () => void;
  fact?: MemoryFact | null;
  onSave: (fact: Partial<MemoryFact>) => void;
  isEditing?: boolean;
}

export function MemoryFactEditor({
  open,
  onClose,
  fact,
  onSave,
  isEditing = false
}: MemoryFactEditorProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>('low');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectionService = MemoryDetectionService.getInstance();

  // Charger les données du fait à éditer
  useEffect(() => {
    if (fact && isEditing) {
      setContent(fact.content);
      setCategory(fact.category || '');
      setImportance(fact.importance || 'low');
      setTags(fact.tags || []);
    } else {
      // Réinitialiser pour un nouveau fait
      setContent('');
      setCategory('');
      setImportance('low');
      setTags([]);
    }
  }, [fact, isEditing, open]);

  // Analyse automatique du contenu
  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysis = detectionService.analyzeText(content);
      if (analysis.category) setCategory(analysis.category);
      if (analysis.importance) setImportance(analysis.importance);
      if (analysis.tags) setTags(analysis.tags);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Ajouter un tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Sauvegarder le fait
  const handleSave = () => {
    if (!content.trim()) return;

    const factData: Partial<MemoryFact> = {
      content: content.trim(),
      category: category || undefined,
      importance,
      tags: tags.length > 0 ? tags : undefined,
      ...(isEditing && fact ? { id: fact.id } : { id: Date.now().toString() }),
      date: fact?.date || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    onSave(factData);
    onClose();
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, content, category, importance, tags]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? 'Modifier le fait' : 'Ajouter un nouveau fait'}
            <Badge variant="outline" className="ml-auto">
              {isEditing ? 'Édition' : 'Nouveau'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations de ce fait mémoire'
              : 'Ajoutez un nouveau fait à votre mémoire personnelle'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contenu principal */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenu du fait *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Exemple: Je m'appelle Sophie et j'habite à Lyon..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {content.length} caractères
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeContent}
                disabled={!content.trim() || isAnalyzing}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzing ? 'Analyse...' : 'Analyser automatiquement'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Catégorie */}
          <div className="space-y-3">
            <Label>Catégorie</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEMORY_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(category === cat.id ? '' : cat.id)}
                  className="justify-start h-auto py-2"
                >
                  <MemoryCategoryIndicator
                    category={cat.id}
                    showText={false}
                    size="sm"
                  />
                  <span className="ml-2 text-xs">{cat.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Importance */}
          <div className="space-y-3">
            <Label>Niveau d'importance</Label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-700' },
                { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
                { value: 'high', label: 'Élevée', color: 'bg-red-100 text-red-700' }
              ].map(({ value, label, color }) => (
                <Button
                  key={value}
                  variant={importance === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImportance(value as any)}
                  className={cn(
                    "flex items-center gap-2",
                    importance === value && color
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    value === 'low' ? 'bg-gray-400' :
                    value === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="text-xs text-gray-500">
            {isEditing && fact ? (
              <>Créé le {new Date(fact.date).toLocaleDateString('fr-FR')}</>
            ) : (
              <>Ctrl + Entrée pour sauvegarder rapidement</>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 