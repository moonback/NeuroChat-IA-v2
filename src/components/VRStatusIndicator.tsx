import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, Mic, Volume2, Eye, Hand } from 'lucide-react';

interface VRStatusIndicatorProps {
  isVRMode: boolean;
  isAISpeaking: boolean;
  isLoading: boolean;
  gestureState: {
    isPointing: boolean;
    isGrabbing: boolean;
    isThumbsUp: boolean;
    isThumbsDown: boolean;
    isWaving: boolean;
    isClapping: boolean;
  };
}

export const VRStatusIndicator: React.FC<VRStatusIndicatorProps> = ({
  isVRMode,
  isAISpeaking,
  isLoading,
  gestureState
}) => {
  const getActiveGesture = () => {
    if (gestureState.isPointing) return 'Pointer';
    if (gestureState.isGrabbing) return 'Saisir';
    if (gestureState.isThumbsUp) return 'Pouce en l\'air';
    if (gestureState.isThumbsDown) return 'Pouce en bas';
    if (gestureState.isWaving) return 'Salut';
    if (gestureState.isClapping) return 'Applaudir';
    return null;
  };

  const activeGesture = getActiveGesture();

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      {/* Statut VR */}
      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-white text-sm font-medium">
          {isVRMode ? 'Mode VR Actif' : 'Mode Normal'}
        </span>
      </div>

      {/* Statut IA */}
      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          isAISpeaking ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-blue-500'
        }`}></div>
        <span className="text-white text-sm">
          {isAISpeaking ? 'IA Parle' : isLoading ? 'IA Réfléchit' : 'IA Connectée'}
        </span>
      </div>

      {/* Geste actif */}
      {activeGesture && (
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <Hand className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm">
            Geste: {activeGesture}
          </span>
        </div>
      )}

      {/* Instructions rapides */}
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-white text-sm font-medium mb-2">Contrôles rapides:</h4>
        <div className="space-y-1 text-xs text-gray-300">
          <div>WASD - Se déplacer</div>
          <div>Souris - Regarder</div>
          <div>1-6 - Gestes VR</div>
          <div>Clic - Interagir</div>
        </div>
      </div>
    </div>
  );
}; 