import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar3D, Avatar3DProps } from './Avatar3D';
import { cn } from '@/lib/utils';

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
  { value: 'modern', label: 'Moderne', icon: '✨' },
  { value: 'classic', label: 'Classique', icon: '🎭' },
  { value: 'futuristic', label: 'Futuriste', icon: '🚀' },
  { value: 'minimal', label: 'Minimal', icon: '⚪' }
] as const;

const CLOTHING_OPTIONS = [
  { value: 'casual', label: 'Décontracté', icon: '👕' },
  { value: 'formal', label: 'Formel', icon: '👔' },
  { value: 'tech', label: 'Tech', icon: '💻' },
  { value: 'creative', label: 'Créatif', icon: '🎨' }
] as const;

const ACCESSORY_OPTIONS = [
  { value: '👓', label: 'Lunettes' },
  { value: '🎩', label: 'Chapeau' },
  { value: '💍', label: 'Bague' },
  { value: '⌚', label: 'Montre' },
  { value: '🎧', label: 'Écouteurs' },
  { value: '👜', label: 'Sac' },
  { value: '🌂', label: 'Parapluie' },
  { value: '🎭', label: 'Masque' }
];

const SIZE_OPTIONS = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
  { value: 'xl', label: 'Très grand' }
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Personnalisation de l'Avatar
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Aperçu de l'avatar */}
          <div className="flex justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
            <Avatar3D
              {...avatarConfig}
              accessories={selectedAccessories}
              size="xl"
              emotion="happy"
            />
          </div>

          {/* Styles visuels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">🎭 Style Visuel</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STYLE_OPTIONS.map((style) => (
                <Button
                  key={style.value}
                  variant={avatarConfig.style === style.value ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => handleStyleChange(style.value)}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <span className="text-xs">{style.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Vêtements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">👔 Style de Vêtements</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CLOTHING_OPTIONS.map((clothing) => (
                <Button
                  key={clothing.value}
                  variant={avatarConfig.clothing === clothing.value ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => handleClothingChange(clothing.value)}
                >
                  <span className="text-2xl">{clothing.icon}</span>
                  <span className="text-xs">{clothing.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Taille */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">📏 Taille de l'Avatar</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SIZE_OPTIONS.map((size) => (
                <Button
                  key={size.value}
                  variant={avatarConfig.size === size.value ? 'default' : 'outline'}
                  className="h-16 flex-col gap-1"
                  onClick={() => handleSizeChange(size.value)}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500',
                    size.value === 'sm' && 'w-4 h-4',
                    size.value === 'lg' && 'w-8 h-8',
                    size.value === 'xl' && 'w-10 h-10'
                  )} />
                  <span className="text-xs">{size.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Accessoires */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">🎁 Accessoires</Label>
              <Badge variant="secondary">
                {selectedAccessories.length} sélectionné(s)
              </Badge>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {ACCESSORY_OPTIONS.map((accessory) => (
                <Button
                  key={accessory.value}
                  variant={selectedAccessories.includes(accessory.value) ? 'default' : 'outline'}
                  size="sm"
                  className="h-16 flex-col gap-2"
                  onClick={() => handleAccessoryToggle(accessory.value)}
                >
                  <span className="text-xl">{accessory.value}</span>
                  <span className="text-xs text-center leading-tight">
                    {accessory.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Options d'animation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">🎬 Animations</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="animations"
                  checked={avatarConfig.animated}
                  onCheckedChange={handleAnimationToggle}
                />
                <Label htmlFor="animations">Animations actives</Label>
              </div>
            </div>
            
            {avatarConfig.animated && (
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">
                  Vitesse des animations: {animationSpeed}x
                </Label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  max={3}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetToDefaults}>
              🔄 Réinitialiser
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={onClose}>
                ✅ Appliquer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarCustomizationPanel;
