import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Shield, 
  Brain, 
  Clock,
  Trash2,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { MEMORY_CATEGORIES, type MemoryPreferences } from './types';
import { cn } from "@/lib/utils";

interface MemoryPreferencesProps {
  preferences: MemoryPreferences;
  onChange: (preferences: MemoryPreferences) => void;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

const SENSITIVITY_LABELS = {
  low: 'Faible',
  medium: 'Moyenne', 
  high: 'Élevée'
};

const PRIVACY_LABELS = {
  basic: 'Basique',
  enhanced: 'Renforcée',
  paranoid: 'Maximale'
};

const PRIVACY_DESCRIPTIONS = {
  basic: 'Chiffrement local simple',
  enhanced: 'Chiffrement avancé + anonymisation',
  paranoid: 'Chiffrement militaire + isolation complète'
};

export function MemoryPreferences({ 
  preferences, 
  onChange, 
  onReset,
  onExport,
  onImport
}: MemoryPreferencesProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['detection']));

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const updatePreferences = useCallback((updates: Partial<MemoryPreferences>) => {
    onChange({ ...preferences, ...updates });
  }, [preferences, onChange]);

  const toggleCategory = useCallback((categoryId: string) => {
    const newCategories = preferences.enabledCategories.includes(categoryId)
      ? preferences.enabledCategories.filter(id => id !== categoryId)
      : [...preferences.enabledCategories, categoryId];
    
    updatePreferences({ enabledCategories: newCategories });
  }, [preferences.enabledCategories, updatePreferences]);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  }, [onImport]);

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Préférences de mémoire
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personnalisez le comportement de la détection automatique
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section Détection automatique */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => toggleSection('detection')}
          className="w-full justify-between p-0 h-auto"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Détection automatique</span>
          </div>
          {expandedSections.has('detection') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        {expandedSections.has('detection') && (
          <div className="space-y-4 pl-8 border-l-2 border-blue-100 dark:border-blue-800">
            {/* Auto-détection activée */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-detection">Détection automatique</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Analyse automatique des messages pour extraire les informations
                </p>
              </div>
              <Switch
                id="auto-detection"
                checked={preferences.autoDetection}
                onCheckedChange={(checked) => updatePreferences({ autoDetection: checked })}
              />
            </div>

            {/* Niveau de sensibilité */}
            <div className="space-y-3">
              <Label>Sensibilité de détection</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Faible</span>
                  <span>Moyenne</span>
                  <span>Élevée</span>
                </div>
                <Slider
                  value={[preferences.sensitivityLevel === 'low' ? 0 : preferences.sensitivityLevel === 'medium' ? 1 : 2]}
                  onValueChange={([value]) => {
                    const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
                    updatePreferences({ sensitivityLevel: levels[value] });
                  }}
                  max={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <Badge variant="outline">
                    {SENSITIVITY_LABELS[preferences.sensitivityLevel]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Catégories activées */}
            <div className="space-y-3">
              <Label>Catégories de détection</Label>
              <div className="grid grid-cols-2 gap-2">
                {MEMORY_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      preferences.enabledCategories.includes(category.id)
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                        : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    )}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        category.color === 'blue' ? 'bg-blue-500' :
                        category.color === 'green' ? 'bg-green-500' :
                        category.color === 'purple' ? 'bg-purple-500' :
                        category.color === 'pink' ? 'bg-pink-500' :
                        category.color === 'red' ? 'bg-red-500' :
                        category.color === 'yellow' ? 'bg-yellow-500' :
                        category.color === 'indigo' ? 'bg-indigo-500' :
                        'bg-orange-500'
                      )} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Switch
                      checked={preferences.enabledCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Section Confidentialité */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => toggleSection('privacy')}
          className="w-full justify-between p-0 h-auto"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-medium">Confidentialité</span>
          </div>
          {expandedSections.has('privacy') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        {expandedSections.has('privacy') && (
          <div className="space-y-4 pl-8 border-l-2 border-green-100 dark:border-green-800">
            {/* Niveau de confidentialité */}
            <div className="space-y-3">
              <Label>Niveau de confidentialité</Label>
              <div className="space-y-2">
                {Object.entries(PRIVACY_LABELS).map(([level, label]) => (
                  <div
                    key={level}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      preferences.privacyLevel === level
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
                        : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    )}
                    onClick={() => updatePreferences({ privacyLevel: level as any })}
                  >
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {PRIVACY_DESCRIPTIONS[level as keyof typeof PRIVACY_DESCRIPTIONS]}
                      </div>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2",
                      preferences.privacyLevel === level
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 dark:border-gray-600"
                    )} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Section Rétention */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => toggleSection('retention')}
          className="w-full justify-between p-0 h-auto"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="font-medium">Rétention des données</span>
          </div>
          {expandedSections.has('retention') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        {expandedSections.has('retention') && (
          <div className="space-y-4 pl-8 border-l-2 border-orange-100 dark:border-orange-800">
            <div className="space-y-3">
              <Label>Durée de rétention (jours)</Label>
              <div className="space-y-2">
                <Slider
                  value={[preferences.retentionDays]}
                  onValueChange={([value]) => updatePreferences({ retentionDays: value })}
                  max={365}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>1 jour</span>
                  <Badge variant="outline">
                    {preferences.retentionDays} jours
                  </Badge>
                  <span>1 an</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Les données plus anciennes seront automatiquement supprimées
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Exporter */}
          {onExport && (
            <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          )}

          {/* Importer */}
          {onImport && (
            <Label htmlFor="import-file" className="cursor-pointer">
              <Button variant="outline" asChild className="w-full flex items-center gap-2">
                <span>
                  <Upload className="w-4 h-4" />
                  Importer
                </span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </Label>
          )}

          {/* Reset */}
          {onReset && (
            <Button variant="outline" onClick={onReset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </Button>
          )}

          {/* Nettoyer */}
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Nettoyer
          </Button>
        </div>
      </div>
    </div>
  );
} 