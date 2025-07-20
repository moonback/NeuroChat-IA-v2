import { useState, useEffect, useCallback, useRef } from 'react';

export interface WebXRCapabilities {
  isSupported: boolean;
  isVRSupported: boolean;
  isARSupported: boolean;
  isMixedRealitySupported: boolean;
}

export interface WebXRSession {
  isActive: boolean;
  mode: 'vr' | 'ar' | 'mixed-reality' | null;
  session: XRSession | null;
}

export const useWebXR = () => {
  const [capabilities, setCapabilities] = useState<WebXRCapabilities>({
    isSupported: false,
    isVRSupported: false,
    isARSupported: false,
    isMixedRealitySupported: false,
  });

  const [xrSession, setXRSession] = useState<WebXRSession>({
    isActive: false,
    mode: null,
    session: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<XRSession | null>(null);

  // Vérifier les capacités WebXR au montage
  useEffect(() => {
    const checkWebXRSupport = async () => {
      if (!navigator.xr) {
        setCapabilities({
          isSupported: false,
          isVRSupported: false,
          isARSupported: false,
          isMixedRealitySupported: false,
        });
        return;
      }

      try {
        const [vrSupported, arSupported] = await Promise.all([
          navigator.xr.isSessionSupported('immersive-vr'),
          navigator.xr.isSessionSupported('immersive-ar'),
        ]);

        setCapabilities({
          isSupported: true,
          isVRSupported: vrSupported,
          isARSupported: arSupported,
          isMixedRealitySupported: arSupported, // AR inclut les capacités de réalité mixte
        });
      } catch (err) {
        console.error('Erreur lors de la vérification du support WebXR:', err);
        setError('Impossible de vérifier le support WebXR');
      }
    };

    checkWebXRSupport();
  }, []);

  // Démarrer une session WebXR
  const startXRSession = useCallback(async (mode: 'vr' | 'ar' | 'mixed-reality') => {
    if (!navigator.xr) {
      setError('WebXR non supporté');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionMode = mode === 'mixed-reality' ? 'immersive-ar' : `immersive-${mode}`;
      
      // Configuration spécifique pour Meta Quest 3
      const sessionInit: XRSessionInit = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: [
          'hand-tracking',
          'hit-test',
          'plane-detection',
          'mesh-detection',
          'anchors',
          'depth-sensing',
          'camera-access',
        ],
      };

      // Ajouter des fonctionnalités spécifiques pour la réalité mixte
      if (mode === 'mixed-reality' || mode === 'ar') {
        sessionInit.optionalFeatures?.push(
          'dom-overlay',
          'light-estimation',
          'occlusion',
          'real-world-geometry'
        );
      }

      const session = await navigator.xr.requestSession(sessionMode as XRSessionMode, sessionInit);
      sessionRef.current = session;

      // Gérer la fin de session
      session.addEventListener('end', () => {
        setXRSession({
          isActive: false,
          mode: null,
          session: null,
        });
        sessionRef.current = null;
      });

      setXRSession({
        isActive: true,
        mode,
        session,
      });

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Erreur lors du démarrage de la session WebXR:', err);
      setError(`Impossible de démarrer la session ${mode}`);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Arrêter la session WebXR
  const endXRSession = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.end();
      } catch (err) {
        console.error('Erreur lors de l\'arrêt de la session WebXR:', err);
      }
    }
  }, []);

  // Démarrer spécifiquement une session de réalité mixte pour Meta Quest 3
  const startMixedRealitySession = useCallback(() => {
    return startXRSession('mixed-reality');
  }, [startXRSession]);

  // Démarrer une session VR
  const startVRSession = useCallback(() => {
    return startXRSession('vr');
  }, [startXRSession]);

  // Démarrer une session AR
  const startARSession = useCallback(() => {
    return startXRSession('ar');
  }, [startXRSession]);

  return {
    capabilities,
    xrSession,
    isLoading,
    error,
    startMixedRealitySession,
    startVRSession,
    startARSession,
    endXRSession,
  };
};