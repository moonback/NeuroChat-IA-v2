import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar3D, Avatar3DProps } from './Avatar3D';
import { cn } from '@/lib/utils';
import { X, RotateCcw, Palette, Shirt, Zap, Save, Download, Maximize2, Glasses } from 'lucide-react';

export interface AvatarCustomizationPanelProps {
  /** Configuration actuelle de l'avatar */
  avatarConfig: Avatar3DProps;
  /** Callback lors de la modification de la configuration */
  onConfigChange: (config: Partial<Avatar3DProps>) => void;
  /** Callback de fermeture */
  onClose?: () => void;
  /** État d'ouverture */
  open?: boolean;
}

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Moderne', icon: '✨', color: 'from-blue-500 to-cyan-500' },
  { value: 'classic', label: 'Classique', icon: '🎭', color: 'from-purple-500 to-pink-500' },
  { value: 'futuristic', label: 'Futuriste', icon: '🚀', color: 'from-green-500 to-emerald-500' },
  { value: 'minimal', label: 'Minimal', icon: '⚪', color: 'from-gray-500 to-slate-500' }
] as const;

const CLOTHING_OPTIONS = [
  { value: 'casual', label: 'Décontracté', icon: '👕', color: 'from-orange-500 to-red-500' },
  { value: 'formal', label: 'Formel', icon: '👔', color: 'from-indigo-500 to-purple-500' },
  { value: 'tech', label: 'Tech', icon: '💻', color: 'from-cyan-500 to-blue-500' },
  { value: 'creative', label: 'Créatif', icon: '🎨', color: 'from-pink-500 to-rose-500' }
] as const;

const ACCESSORY_OPTIONS = [
  { value: '👓', label: 'Lunettes', category: 'face', icon: '👓' },
  { value: '🎩', label: 'Chapeau', category: 'head', icon: '🎩' },
  { value: '💍', label: 'Bague', category: 'hand', icon: '💍' },
  { value: '⌚', label: 'Montre', category: 'hand', icon: '⌚' },
  { value: '🎧', label: 'Écouteurs', category: 'head', icon: '🎧' },
  { value: '👜', label: 'Sac', category: 'body', icon: '👜' },
  { value: '🌂', label: 'Parapluie', category: 'hand', icon: '🌂' },
  { value: '🎭', label: 'Masque', category: 'face', icon: '🎭' }
];

const SIZE_OPTIONS = [
  { value: 'sm', label: 'Petit', size: 16, description: '16px' },
  { value: 'md', label: 'Moyen', size: 20, description: '20px' },
  { value: 'lg', label: 'Grand', size: 24, description: '24px' },
  { value: 'xl', label: 'Très grand', size: 32, description: '32px' }
] as const;

export const AvatarCustomizationPanel: React.FC<AvatarCustomizationPanelProps> = ({
  avatarConfig,
  onConfigChange,
  onClose,
  open = false
}) => {
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(
    avatarConfig.accessories || []
  );
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleStyleChange = (style: Avatar3DProps['style']) => {
    onConfigChange({ style });
  };

  const handleClothingChange = (clothing: Avatar3DProps['clothing']) => {
    onConfigChange({ clothing });
  };

  const handleSizeChange = (size: Avatar3DProps['size']) => {
    onConfigChange({ size });
  };

  const handleAccessoryToggle = (accessory: string) => {
    const newAccessories = selectedAccessories.includes(accessory)
      ? selectedAccessories.filter(a => a !== accessory)
      : [...selectedAccessories, accessory];
    
    setSelectedAccessories(newAccessories);
    onConfigChange({ accessories: newAccessories });
  };

  const handleAnimationToggle = (animated: boolean) => {
    onConfigChange({ animated });
  };

  const resetToDefaults = () => {
    const defaultConfig: Partial<Avatar3DProps> = {
      style: 'modern',
      clothing: 'casual',
      size: 'md',
      accessories: [],
      animated: true
    };
    onConfigChange(defaultConfig);
    setSelectedAccessories([]);
    setAnimationSpeed(1);
  };

  const exportConfig = () => {
    const config = {
      ...avatarConfig,
      accessories: selectedAccessories,
      animationSpeed
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full h-full max-w-none max-h-none m-0 rounded-none border-0 bg-gradient-to-br from-slate-50/95 to-slate-100/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-xl flex flex-col">
        <CardHeader className="pb-6 border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                🎨
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Personnalisation de l'Avatar
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
            {/* Aperçu de l'avatar - Colonne de gauche */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20">
                  <h3 className="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">
                    Aperçu Live
                  </h3>
                  <div className="flex justify-center p-6 bg-gradient-to-br from-white/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
                    <Avatar3D
                      {...avatarConfig}
                      accessories={selectedAccessories}
                      size="xl"
                      emotion="happy"
                      animated={true}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="text-sm bg-white/50 dark:bg-black/50">
                      {selectedAccessories.length} accessoire(s) actif(s)
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Contrôles de personnalisation - Colonnes de droite */}
            <div className="xl:col-span-2 space-y-8">
              {/* Styles visuels */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                    <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Style Visuel</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {STYLE_OPTIONS.map((style) => (
                    <Button
                      key={style.value}
                      variant={avatarConfig.style === style.value ? "default" : "outline"}
                      onClick={() => handleStyleChange(style.value)}
                      className={cn(
                        "h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200",
                        avatarConfig.style === style.value
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                          : "hover:scale-105 hover:shadow-md"
                      )}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <span className="text-sm font-medium">{style.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Vêtements */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                    <Shirt className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Vêtements</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CLOTHING_OPTIONS.map((clothing) => (
                    <Button
                      key={clothing.value}
                      variant={avatarConfig.clothing === clothing.value ? "default" : "outline"}
                      onClick={() => handleClothingChange(clothing.value)}
                      className={cn(
                        "h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200",
                        avatarConfig.clothing === clothing.value
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105"
                          : "hover:scale-105 hover:shadow-md"
                      )}
                    >
                      <span className="text-2xl">{clothing.icon}</span>
                      <span className="text-sm font-medium">{clothing.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Taille */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                    <Maximize2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Taille</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {SIZE_OPTIONS.map((size) => (
                    <Button
                      key={size.value}
                      variant={avatarConfig.size === size.value ? "default" : "outline"}
                      onClick={() => handleSizeChange(size.value)}
                      className={cn(
                        "h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200",
                        avatarConfig.size === size.value
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                          : "hover:scale-105 hover:shadow-md"
                      )}
                    >
                      <span className="text-lg font-bold">{size.label}</span>
                      <span className="text-xs text-muted-foreground">{size.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accessoires */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                    <Glasses className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Accessoires</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ACCESSORY_OPTIONS.map((accessory) => (
                    <Button
                      key={accessory.value}
                      variant={selectedAccessories.includes(accessory.value) ? "default" : "outline"}
                      onClick={() => handleAccessoryToggle(accessory.value)}
                      className={cn(
                        "h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200",
                        selectedAccessories.includes(accessory.value)
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                          : "hover:scale-105 hover:shadow-md"
                      )}
                    >
                      <span className="text-2xl">{accessory.icon}</span>
                      <span className="text-sm font-medium">{accessory.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20">
                    <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Animations</h3>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={avatarConfig.animated}
                    onCheckedChange={handleAnimationToggle}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-500"
                  />
                  <Label className="text-lg font-medium">
                    {avatarConfig.animated ? "Animations activées" : "Animations désactivées"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer avec actions */}
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-6 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </Button>
              
              <Button
                variant="outline"
                onClick={exportConfig}
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="px-6">
                Annuler
              </Button>
              <Button 
                onClick={onClose}
                className="px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AvatarCustomizationPanel;