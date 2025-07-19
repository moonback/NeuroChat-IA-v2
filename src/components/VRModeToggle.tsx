import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, Monitor, Smartphone, Zap } from 'lucide-react';

interface VRModeToggleProps {
  isVRMode: boolean;
  onToggleVR: () => void;
  isVRSupported: boolean;
}

export const VRModeToggle: React.FC<VRModeToggleProps> = ({
  isVRMode,
  onToggleVR,
  isVRSupported
}) => {
  const checkVRSupport = () => {
    if (typeof navigator !== 'undefined') {
      return 'getVRDisplays' in navigator || 'getVRDisplays' in window;
    }
    return false;
  };

  const vrSupported = isVRSupported || checkVRSupport();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          Mode Réalité Virtuelle
          {vrSupported && (
            <Badge variant="secondary" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              VR Ready
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Plongez dans une expérience immersive avec votre assistant IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="text-sm font-medium">Mode Normal</span>
          </div>
          <Badge variant={!isVRMode ? "default" : "secondary"}>
            Actif
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-medium">Mode VR</span>
          </div>
          <Badge variant={isVRMode ? "default" : "secondary"}>
            {vrSupported ? "Disponible" : "Non supporté"}
          </Badge>
        </div>

        <Button
          onClick={onToggleVR}
          disabled={!vrSupported}
          className="w-full"
          variant={isVRMode ? "destructive" : "default"}
        >
          {isVRMode ? "Quitter le mode VR" : "Activer le mode VR"}
        </Button>

        {!vrSupported && (
          <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
            ⚠️ Votre appareil ne supporte pas la réalité virtuelle. 
            Utilisez un casque VR compatible ou un navigateur avec support WebXR.
          </div>
        )}

        {isVRMode && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            💡 Conseil : Utilisez les contrôleurs VR ou le regard pour interagir avec l'interface.
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 