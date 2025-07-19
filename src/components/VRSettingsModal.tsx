import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { VRSettings, defaultVRSettings } from '@/config/vrSettings';

interface VRSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: VRSettings;
  onSettingsChange: (settings: VRSettings) => void;
}

export const VRSettingsModal: React.FC<VRSettingsModalProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<VRSettings>(settings);

  const handleSettingChange = (key: keyof VRSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleReset = () => {
    setLocalSettings(defaultVRSettings);
    onSettingsChange(defaultVRSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-6 bg-white dark:bg-slate-950 rounded-2xl border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-4">
            🥽 Paramètres VR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Environnement */}
          <div className="space-y-2">
            <Label htmlFor="environment">Environnement</Label>
            <Select
              value={localSettings.environment}
              onValueChange={(value) => handleSettingChange('environment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="space">Espace</SelectItem>
                <SelectItem value="forest">Forêt</SelectItem>
                <SelectItem value="ocean">Océan</SelectItem>
                <SelectItem value="city">Ville</SelectItem>
                <SelectItem value="abstract">Abstrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Style d'avatar */}
          <div className="space-y-2">
            <Label htmlFor="avatarStyle">Style d'avatar IA</Label>
            <Select
              value={localSettings.avatarStyle}
              onValueChange={(value) => handleSettingChange('avatarStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="humanoid">Humanoïde</SelectItem>
                <SelectItem value="robot">Robot</SelectItem>
                <SelectItem value="abstract">Abstrait</SelectItem>
                <SelectItem value="animal">Animal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Style d'interface */}
          <div className="space-y-2">
            <Label htmlFor="interfaceStyle">Style d'interface</Label>
            <Select
              value={localSettings.interfaceStyle}
              onValueChange={(value) => handleSettingChange('interfaceStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="floating">Flottante</SelectItem>
                <SelectItem value="immersive">Immersive</SelectItem>
                <SelectItem value="minimal">Minimale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Éclairage */}
          <div className="space-y-2">
            <Label htmlFor="lighting">Éclairage</Label>
            <Select
              value={localSettings.lighting}
              onValueChange={(value) => handleSettingChange('lighting', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambient">Ambient</SelectItem>
                <SelectItem value="dramatic">Dramatique</SelectItem>
                <SelectItem value="natural">Naturel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voiceRecognition">Reconnaissance vocale</Label>
              <Switch
                id="voiceRecognition"
                checked={localSettings.voiceRecognition}
                onCheckedChange={(checked) => handleSettingChange('voiceRecognition', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hapticFeedback">Retour haptique</Label>
              <Switch
                id="hapticFeedback"
                checked={localSettings.hapticFeedback}
                onCheckedChange={(checked) => handleSettingChange('hapticFeedback', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoRotation">Rotation automatique</Label>
              <Switch
                id="autoRotation"
                checked={localSettings.autoRotation}
                onCheckedChange={(checked) => handleSettingChange('autoRotation', checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 