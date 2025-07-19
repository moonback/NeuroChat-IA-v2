import { useState, useEffect, useCallback } from 'react';

interface VRDisplay {
  displayName: string;
  isConnected: boolean;
  isPresenting: boolean;
}

interface UseVRModeReturn {
  isVRMode: boolean;
  isVRSupported: boolean;
  vrDisplays: VRDisplay[];
  enterVR: () => void;
  exitVR: () => void;
  toggleVR: () => void;
  checkVRSupport: () => Promise<boolean>;
}

export const useVRMode = (): UseVRModeReturn => {
  const [isVRMode, setIsVRMode] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [vrDisplays, setVrDisplays] = useState<VRDisplay[]>([]);

  const checkVRSupport = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined') return false;

    try {
      // Vérifier le support WebXR
      if ('xr' in navigator) {
        const isSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
        setIsVRSupported(isSupported);
        return isSupported;
      }

      // Vérifier l'ancien support VR (pour compatibilité)
      if ('getVRDisplays' in navigator) {
        const displays = await (navigator as any).getVRDisplays();
        const supported = displays.length > 0;
        setIsVRSupported(supported);
        setVrDisplays(displays);
        return supported;
      }

      return false;
    } catch (error) {
      console.warn('Erreur lors de la vérification du support VR:', error);
      return false;
    }
  }, []);

  const enterVR = useCallback(() => {
    if (isVRSupported) {
      setIsVRMode(true);
      // Ajouter une classe au body pour les styles VR
      document.body.classList.add('vr-mode');
    }
  }, [isVRSupported]);

  const exitVR = useCallback(() => {
    setIsVRMode(false);
    // Retirer la classe VR du body
    document.body.classList.remove('vr-mode');
  }, []);

  const toggleVR = useCallback(() => {
    if (isVRMode) {
      exitVR();
    } else {
      enterVR();
    }
  }, [isVRMode, enterVR, exitVR]);

  useEffect(() => {
    // Vérifier le support VR au chargement
    checkVRSupport();

    // Écouter les changements de connectivité VR
    const handleVRDisplayConnect = () => {
      checkVRSupport();
    };

    const handleVRDisplayDisconnect = () => {
      checkVRSupport();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('vrdisplayconnect', handleVRDisplayConnect);
      window.addEventListener('vrdisplaydisconnect', handleVRDisplayDisconnect);

      return () => {
        window.removeEventListener('vrdisplayconnect', handleVRDisplayConnect);
        window.removeEventListener('vrdisplaydisconnect', handleVRDisplayDisconnect);
      };
    }
  }, [checkVRSupport]);

  // Nettoyer le mode VR lors du démontage
  useEffect(() => {
    return () => {
      if (isVRMode) {
        exitVR();
      }
    };
  }, [isVRMode, exitVR]);

  return {
    isVRMode,
    isVRSupported,
    vrDisplays,
    enterVR,
    exitVR,
    toggleVR,
    checkVRSupport
  };
}; 