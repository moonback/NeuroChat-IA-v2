import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Trash2, Copy, Palette, Sparkles, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { personalityCategories } from '@/config/personalities';
import { CustomPersonality, availableIcons, getIconComponent } from '@/hooks/useCustomPersonalities';

interface CustomPersonalityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (personality: Omit<CustomPersonality, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Omit<CustomPersonality, 'id' | 'isCustom' | 'createdAt'>>) => void;
  editingPersonality?: CustomPersonality | null;
  title?: string;
}

// Couleurs prédéfinies pour la personnalité
const colorOptions = [
  { name: 'Bleu', gradient: 'from-blue-500 to-blue-700', bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800' },
  { name: 'Violet', gradient: 'from-purple-500 to-indigo-600', bg: 'bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/30 border-purple-200 dark:border-purple-800' },
  { name: 'Émeraude', gradient: 'from-emerald-400 to-green-500', bg: 'bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 border-emerald-200 dark:border-emerald-800' },
  { name: 'Orange', gradient: 'from-orange-500 to-red-500', bg: 'bg-gradient-to-r from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-800/30 border-orange-200 dark:border-orange-800' },
  { name: 'Rose', gradient: 'from-pink-500 to-purple-500', bg: 'bg-gradient-to-r from-pink-50 to-purple-100 dark:from-pink-900/30 dark:to-purple-800/30 border-pink-200 dark:border-pink-800' },
  { name: 'Cyan', gradient: 'from-teal-500 to-cyan-500', bg: 'bg-gradient-to-r from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/30 border-teal-200 dark:border-teal-800' },
  { name: 'Jaune', gradient: 'from-yellow-400 to-orange-500', bg: 'bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30 border-yellow-200 dark:border-yellow-800' },
  { name: 'Gris', gradient: 'from-gray-500 to-gray-700', bg: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-800' },
];

export function CustomPersonalityModal({ 
  open, 
  onClose, 
  onSave, 
  onUpdate, 
  editingPersonality = null, 
  title = "Créer une personnalité personnalisée" 
}: CustomPersonalityModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    iconName: 'User',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800',
    description: '',
    detailedDescription: '',
    systemPromptAddition: '',
    category: 'professionnel' as 'professionnel' | 'social' | 'creatif' | 'expert',
    traits: [] as string[],
  });

  const [newTrait, setNewTrait] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (open) {
      if (editingPersonality) {
        setFormData({
          label: editingPersonality.label,
          iconName: editingPersonality.iconName,
          color: editingPersonality.color,
          bg: editingPersonality.bg,
          description: editingPersonality.description,
          detailedDescription: editingPersonality.detailedDescription,
          systemPromptAddition: editingPersonality.systemPromptAddition,
          category: editingPersonality.category,
          traits: [...editingPersonality.traits],
        });
      } else {
        setFormData({
          label: '',
          iconName: 'User',
          color: 'from-blue-500 to-blue-700',
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800',
          description: '',
          detailedDescription: '',
          systemPromptAddition: '',
          category: 'professionnel' as 'professionnel' | 'social' | 'creatif' | 'expert',
          traits: [],
        });
      }
      setNewTrait('');
      setErrors({});
      setShowPreview(false);
    }
  }, [open, editingPersonality]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleColorChange = (colorOption: typeof colorOptions[0]) => {
    setFormData(prev => ({
      ...prev,
      color: colorOption.gradient,
      bg: colorOption.bg
    }));
  };

  const addTrait = () => {
    if (newTrait.trim() && !formData.traits.includes(newTrait.trim())) {
      setFormData(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }));
      setNewTrait('');
    }
  };

  const removeTrait = (traitToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter(trait => trait !== traitToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Le nom est requis';
    } else if (formData.label.length < 2) {
      newErrors.label = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description courte est requise';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }

    if (!formData.detailedDescription.trim()) {
      newErrors.detailedDescription = 'La description détaillée est requise';
    } else if (formData.detailedDescription.length < 20) {
      newErrors.detailedDescription = 'La description détaillée doit contenir au moins 20 caractères';
    }

    if (!formData.systemPromptAddition.trim()) {
      newErrors.systemPromptAddition = 'Les instructions système sont requises';
    } else if (formData.systemPromptAddition.length < 20) {
      newErrors.systemPromptAddition = 'Les instructions système doivent contenir au moins 20 caractères';
    }

    if (formData.traits.length === 0) {
      newErrors.traits = 'Au moins un trait est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingPersonality && onUpdate) {
      onUpdate(editingPersonality.id, formData);
    } else {
      onSave(formData);
    }
    onClose();
  };

  const SelectedIcon = getIconComponent(formData.iconName);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingPersonality ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div className="space-y-4">
            {/* Nom */}
            <div>
              <Label htmlFor="label">Nom de la personnalité *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="ex: Mentor bienveillant"
                className={errors.label ? 'border-red-500' : ''}
              />
              {errors.label && <p className="text-sm text-red-500 mt-1">{errors.label}</p>}
            </div>

            {/* Icône */}
            <div>
              <Label htmlFor="iconName">Icône</Label>
              <Select value={formData.iconName} onValueChange={(value) => handleInputChange('iconName', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map(iconName => {
                    const IconComponent = getIconComponent(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {iconName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Couleur */}
            <div>
              <Label>Couleur</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colorOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorChange(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.color === option.gradient 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${option.bg}`}
                    title={option.name}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${option.gradient} mx-auto`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(personalityCategories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description courte */}
            <div>
              <Label htmlFor="description">Description courte *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="ex: Un guide expérimenté et bienveillant"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Description détaillée */}
            <div>
              <Label htmlFor="detailedDescription">Description détaillée *</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                placeholder="ex: Cette personnalité offre des conseils réfléchis et encourage l'apprentissage..."
                className={errors.detailedDescription ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.detailedDescription && <p className="text-sm text-red-500 mt-1">{errors.detailedDescription}</p>}
            </div>

            {/* Instructions système */}
            <div>
              <Label htmlFor="systemPromptAddition">Instructions système *</Label>
              <Textarea
                id="systemPromptAddition"
                value={formData.systemPromptAddition}
                onChange={(e) => handleInputChange('systemPromptAddition', e.target.value)}
                placeholder="ex: Tu es un mentor bienveillant qui guide avec sagesse..."
                className={errors.systemPromptAddition ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.systemPromptAddition && <p className="text-sm text-red-500 mt-1">{errors.systemPromptAddition}</p>}
            </div>

            {/* Traits de personnalité */}
            <div>
              <Label>Traits de personnalité *</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  placeholder="ex: Empathique"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrait();
                    }
                  }}
                />
                <Button type="button" onClick={addTrait} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {errors.traits && <p className="text-sm text-red-500 mt-1">{errors.traits}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTrait(trait)}>
                    {trait}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Aperçu</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
            
            {showPreview && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className={`p-4 rounded-2xl ${formData.bg} border-2 border-transparent`}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
                      <SelectedIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {formData.label || 'Nom de la personnalité'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formData.description || 'Description courte'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/20 dark:border-slate-700/20">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {formData.detailedDescription || 'Description détaillée'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {formData.traits.map((trait, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conseils */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Conseils :</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Choisissez un nom distinctif et mémorable</li>
                  <li>• Soyez spécifique dans les instructions système</li>
                  <li>• Utilisez des traits qui définissent le comportement</li>
                  <li>• Testez votre personnalité après création</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {editingPersonality ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 