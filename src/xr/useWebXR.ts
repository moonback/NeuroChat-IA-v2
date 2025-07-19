import { useState, useEffect, useRef, useCallback } from 'react';
import { XRSession, VRController, VRAudioConfig, VRUISettings } from './types';

export interface UseWebXROptions {
  onSessionStart?: (session: XRSession) => void;
  onSessionEnd?: () => void;
  onControllerUpdate?: (controllers: VRController[]) => void;
  audioConfig?: VRAudioConfig;
  uiSettings?: VRUISettings;
}

export function useWebXR(options: UseWebXROptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [session, setSession] = useState<XRSession | null>(null);
  const [controllers, setControllers] = useState<VRController[]>([]);
  const [referenceSpace, setReferenceSpace] = useState<any>(null);
  
  const sessionRef = useRef<any>(null);
  const frameRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Vérifier la compatibilité WebXR
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr!.isSessionSupported('immersive-vr');
          setIsSupported(!!supported);
        } catch {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, []);

  // Initialiser l'audio context pour la spatialisation
  useEffect(() => {
    if (options.audioConfig?.enabled && isSessionActive) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [isSessionActive, options.audioConfig?.enabled]);

  // Démarrer une session VR
  const startSession = useCallback(async () => {
    if (!isSupported) {
      console.error('WebXR non supporté');
      return false;
    }

    try {
      const session = await navigator.xr!.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
        requiredFeatures: []
      });

      sessionRef.current = session;
      
      // Configurer la session
      session.addEventListener('end', () => {
        setIsSessionActive(false);
        setSession(null);
        options.onSessionEnd?.();
      });

      // Démarrer le rendu
      session.requestReferenceSpace('local').then((space) => {
        setReferenceSpace(space);
        session.requestAnimationFrame(onFrame);
      });

      const xrSession: XRSession = {
        isVR: true,
        isAR: false,
        isImmersive: true
      };

      setSession(xrSession);
      setIsSessionActive(true);
      options.onSessionStart?.(xrSession);

      return true;
    } catch (error) {
      console.error('Erreur lors du démarrage de la session VR:', error);
      return false;
    }
  }, [isSupported, options]);

  // Arrêter la session VR
  const endSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.end();
      sessionRef.current = null;
    }
  }, []);

  // Fonction de rendu pour chaque frame
  const onFrame = useCallback((_time: number, frame: any) => {
    frameRef.current = frame;
    
    if (frame) {
      // Mettre à jour les contrôleurs
      const inputSources = frame.session.inputSources;
      const updatedControllers: VRController[] = [];
      
      for (const inputSource of inputSources) {
        if (inputSource.handedness) {
          const pose = frame.getPose(inputSource.gripSpace, referenceSpace);
          if (pose) {
            const controller: VRController = {
              id: inputSource.handedness,
              position: {
                x: pose.transform.position.x,
                y: pose.transform.position.y,
                z: pose.transform.position.z
              },
              rotation: {
                x: pose.transform.orientation.x,
                y: pose.transform.orientation.y,
                z: pose.transform.orientation.z
              },
              buttons: inputSource.buttons?.map((btn: any) => ({
                pressed: btn.pressed,
                touched: btn.touched,
                value: btn.value
              })) || [],
              axes: inputSource.axes || []
            };
            updatedControllers.push(controller);
          }
        }
      }
      
      setControllers(updatedControllers);
      options.onControllerUpdate?.(updatedControllers);
    }

    // Continuer le rendu
    if (sessionRef.current) {
      sessionRef.current.requestAnimationFrame(onFrame);
    }
  }, [referenceSpace, options]);

  // Jouer un son spatialisé
  const playSpatialSound = useCallback((audioBuffer: AudioBuffer, position: { x: number; y: number; z: number }) => {
    if (!audioContextRef.current || !options.audioConfig?.enabled) return;

    const source = audioContextRef.current.createBufferSource();
    const panner = audioContextRef.current.createPanner();
    
    source.buffer = audioBuffer;
    source.connect(panner);
    panner.connect(audioContextRef.current.destination);
    
    panner.setPosition(position.x, position.y, position.z);
    source.start();
  }, [options.audioConfig?.enabled]);

  return {
    isSupported,
    isSessionActive,
    session,
    controllers,
    startSession,
    endSession,
    playSpatialSound
  };
} 