import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebXR } from '@/hooks/useWebXR';
import { toast } from 'sonner';

interface WebXRButtonProps {
  onSessionStart?: (mode: 'vr' | 'ar' | 'mixed-reality') => void;
  onSessionEnd?: () => void;
  className?: string;
}

export const WebXRButton: React.FC<WebXRButtonProps> = ({
  onSessionStart,
  onSessionEnd,
  className = '',
}) => {
  const {
    capabilities,
    xrSession,
    isLoading,
    error,
    startMixedRealitySession,
    startVRSession,
    startARSession,
    endXRSession,
  } = useWebXR();

  const handleStartMixedReality = async () => {
    const success = await startMixedRealitySession();
    if (success) {
      toast.success('Session de réalité mixte démarrée !');
      onSessionStart?.('mixed-reality');
    } else {
      toast.error('Impossible de démarrer la réalité mixte');
    }
  };

  const handleStartVR = async () => {
    const success = await startVRSession();
    if (success) {
      toast.success('Session VR démarrée !');
      onSessionStart?.('vr');
    } else {
      toast.error('Impossible de démarrer la VR');
    }
  };

  const handleStartAR = async () => {
    const success = await startARSession();
    if (success) {
      toast.success('Session AR démarrée !');
      onSessionStart?.('ar');
    } else {
      toast.error('Impossible de démarrer l\'AR');
    }
  };

  const handleEndSession = async () => {
    await endXRSession();
    toast.info('Session WebXR terminée');
    onSessionEnd?.();
  };

  if (!capabilities.isSupported) {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <Button disabled variant="outline">
          WebXR non supporté
        </Button>
        <Badge variant="destructive">
          Votre navigateur ne supporte pas WebXR
        </Badge>
      </div>
    );
  }

  if (xrSession.isActive) {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <Button 
          onClick={handleEndSession}
          variant="destructive"
          disabled={isLoading}
        >
          {isLoading ? 'Arrêt...' : 'Quitter la session'}
        </Button>
        <Badge variant="default">
          Session {xrSession.mode} active
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Titre */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Réalité Mixte Meta Quest 3</h3>
        <p className="text-sm text-muted-foreground">
          Choisissez votre mode d'expérience immersive
        </p>
      </div>

      {/* Boutons de session */}
      <div className="grid grid-cols-1 gap-2">
        {/* Réalité Mixte (recommandé pour Meta Quest 3) */}
        {capabilities.isMixedRealitySupported && (
          <div className="relative">
            <Button
              onClick={handleStartMixedReality}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? 'Démarrage...' : '🥽 Réalité Mixte'}
            </Button>
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 bg-green-500 text-white"
            >
              Recommandé
            </Badge>
          </div>
        )}

        {/* Réalité Virtuelle */}
        {capabilities.isVRSupported && (
          <Button
            onClick={handleStartVR}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Démarrage...' : '🎮 Réalité Virtuelle'}
          </Button>
        )}

        {/* Réalité Augmentée */}
        {capabilities.isARSupported && (
          <Button
            onClick={handleStartAR}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Démarrage...' : '📱 Réalité Augmentée'}
          </Button>
        )}
      </div>

      {/* Informations sur les capacités */}
      <div className="flex flex-wrap gap-1 justify-center">
        {capabilities.isVRSupported && (
          <Badge variant="outline">VR ✓</Badge>
        )}
        {capabilities.isARSupported && (
          <Badge variant="outline">AR ✓</Badge>
        )}
        {capabilities.isMixedRealitySupported && (
          <Badge variant="outline">MR ✓</Badge>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="text-center">
          <Badge variant="destructive">{error}</Badge>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Assurez-vous que votre Meta Quest 3 est connecté</p>
        <p>• Utilisez un navigateur compatible WebXR</p>
        <p>• La réalité mixte permet de voir votre environnement réel</p>
      </div>
    </div>
  );
};