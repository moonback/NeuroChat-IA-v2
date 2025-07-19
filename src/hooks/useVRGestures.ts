import { useState, useEffect, useCallback } from 'react';

interface GestureState {
  isPointing: boolean;
  isGrabbing: boolean;
  isThumbsUp: boolean;
  isThumbsDown: boolean;
  isWaving: boolean;
  isClapping: boolean;
}

interface UseVRGesturesReturn {
  gestureState: GestureState;
  onGestureDetected: (gesture: keyof GestureState) => void;
  setupGestureHandlers: () => void;
  cleanupGestureHandlers: () => void;
}

export const useVRGestures = (): UseVRGesturesReturn => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isPointing: false,
    isGrabbing: false,
    isThumbsUp: false,
    isThumbsDown: false,
    isWaving: false,
    isClapping: false
  });

  const onGestureDetected = useCallback((gesture: keyof GestureState) => {
    setGestureState(prev => ({
      ...prev,
      [gesture]: true
    }));

    // Reset gesture after a short delay
    setTimeout(() => {
      setGestureState(prev => ({
        ...prev,
        [gesture]: false
      }));
    }, 1000);
  }, []);

  const setupGestureHandlers = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Détection des contrôleurs VR
    const detectControllers = () => {
      const controllers = document.querySelectorAll('[vive-controls], [oculus-touch-controls], [daydream-controls]');
      return Array.from(controllers);
    };

    // Gestionnaire pour les événements de contrôleurs
    const handleControllerEvent = (event: any) => {
      const { type } = event;
      
      console.log('Événement contrôleur VR:', type);
      
      switch (type) {
        case 'triggerdown':
          onGestureDetected('isPointing');
          break;
        case 'gripdown':
          onGestureDetected('isGrabbing');
          break;
        case 'thumbstickup':
          onGestureDetected('isThumbsUp');
          break;
        case 'thumbstickdown':
          onGestureDetected('isThumbsDown');
          break;
        case 'trackpaddown':
          onGestureDetected('isWaving');
          break;
        case 'abuttondown':
        case 'bbuttondown':
          onGestureDetected('isClapping');
          break;
      }
    };

    // Gestionnaire pour les événements de clavier (simulation)
    const handleKeyPress = (event: KeyboardEvent) => {
      console.log('Touche pressée:', event.key);
      
      switch (event.key.toLowerCase()) {
        case '1':
          onGestureDetected('isPointing');
          break;
        case '2':
          onGestureDetected('isGrabbing');
          break;
        case '3':
          onGestureDetected('isThumbsUp');
          break;
        case '4':
          onGestureDetected('isThumbsDown');
          break;
        case '5':
          onGestureDetected('isWaving');
          break;
        case '6':
          onGestureDetected('isClapping');
          break;
      }
    };

    // Ajouter les écouteurs d'événements
    const controllers = detectControllers();
    controllers.forEach(controller => {
      controller.addEventListener('triggerdown', handleControllerEvent);
      controller.addEventListener('gripdown', handleControllerEvent);
      controller.addEventListener('thumbstickup', handleControllerEvent);
      controller.addEventListener('thumbstickdown', handleControllerEvent);
      controller.addEventListener('trackpaddown', handleControllerEvent);
      controller.addEventListener('abuttondown', handleControllerEvent);
      controller.addEventListener('bbuttondown', handleControllerEvent);
    });

    // Ajouter l'écouteur de clavier pour la simulation
    document.addEventListener('keydown', handleKeyPress);

    // Gestionnaire pour les gestes de main (WebXR Hand Tracking)
    const handleHandGesture = (event: any) => {
      const { joints } = event.detail;
      
      // Détection de gestes basiques
      if (joints && joints.length > 0) {
        const indexFinger = joints[8]; // Index finger tip
        const thumb = joints[4]; // Thumb tip
        const wrist = joints[0]; // Wrist
        
        if (indexFinger && thumb && wrist) {
          // Geste de pointage
          const pointingDistance = Math.abs(indexFinger.y - wrist.y);
          if (pointingDistance > 0.1) {
            onGestureDetected('isPointing');
          }
          
          // Geste de pouce en l'air
          const thumbsUpDistance = Math.abs(thumb.y - wrist.y);
          if (thumbsUpDistance > 0.15) {
            onGestureDetected('isThumbsUp');
          }
        }
      }
    };

    // Écouter les événements de main
    document.addEventListener('hand-gesture', handleHandGesture);

    // Gestionnaire pour les mouvements de tête (regard)
    const handleHeadMovement = (event: any) => {
      const { rotation } = event.detail;
      
      // Détection de hochement de tête (oui/non)
      if (rotation && Math.abs(rotation.y) > 0.3) {
        if (rotation.y > 0) {
          onGestureDetected('isThumbsUp'); // Oui
        } else {
          onGestureDetected('isThumbsDown'); // Non
        }
      }
    };

    document.addEventListener('head-movement', handleHeadMovement);

    return () => {
      // Nettoyage des écouteurs
      controllers.forEach(controller => {
        controller.removeEventListener('triggerdown', handleControllerEvent);
        controller.removeEventListener('gripdown', handleControllerEvent);
        controller.removeEventListener('thumbstickup', handleControllerEvent);
        controller.removeEventListener('thumbstickdown', handleControllerEvent);
        controller.removeEventListener('trackpaddown', handleControllerEvent);
        controller.removeEventListener('abuttondown', handleControllerEvent);
        controller.removeEventListener('bbuttondown', handleControllerEvent);
      });
      
      document.removeEventListener('hand-gesture', handleHandGesture);
      document.removeEventListener('head-movement', handleHeadMovement);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onGestureDetected]);

  const cleanupGestureHandlers = useCallback(() => {
    // Le nettoyage est géré dans setupGestureHandlers
  }, []);

  useEffect(() => {
    const cleanup = setupGestureHandlers();
    return cleanup;
  }, [setupGestureHandlers]);

  return {
    gestureState,
    onGestureDetected,
    setupGestureHandlers,
    cleanupGestureHandlers
  };
}; 