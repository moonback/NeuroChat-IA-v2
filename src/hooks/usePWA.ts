import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: PWAInstallPrompt | null;
  registration: ServiceWorkerRegistration | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
    registration: null,
  });

  // Détection de l'installabilité
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as any;
      
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: {
          prompt: () => prompt.prompt(),
          userChoice: prompt.userChoice,
        },
      }));
    };

    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Détection de l'état en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enregistrement du Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker enregistré:', registration);
          setPwaState(prev => ({ ...prev, registration }));

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    }
  }, []);

  // Fonction d'installation
  const installApp = useCallback(async () => {
    if (pwaState.installPrompt) {
      try {
        await pwaState.installPrompt.prompt();
        const choiceResult = await pwaState.installPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installé avec succès');
        } else {
          console.log('Installation PWA annulée');
        }
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error);
      }
    }
  }, [pwaState.installPrompt]);

  // Fonction de mise à jour
  const updateApp = useCallback(() => {
    if (pwaState.registration && pwaState.registration.waiting) {
      pwaState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [pwaState.registration]);

  // Fonction de gestion du cache
  const clearCache = useCallback(async () => {
    if (pwaState.registration) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
        });

        pwaState.registration.active?.postMessage(
          { type: 'CACHE_CLEAR' },
          [messageChannel.port2]
        );

        await promise;
        console.log('Cache vidé avec succès');
      } catch (error) {
        console.error('Erreur lors du vidage du cache:', error);
      }
    }
  }, [pwaState.registration]);

  // Fonction de préchargement
  const prefetchResources = useCallback(async (resources: string[]) => {
    if (pwaState.registration) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
        });

        pwaState.registration.active?.postMessage(
          { type: 'PREFETCH_RESOURCES', payload: { resources } },
          [messageChannel.port2]
        );

        await promise;
        console.log('Ressources préchargées avec succès');
      } catch (error) {
        console.error('Erreur lors du préchargement:', error);
      }
    }
  }, [pwaState.registration]);

  // Fonction de synchronisation en arrière-plan
  const triggerBackgroundSync = useCallback(async () => {
    if (pwaState.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await pwaState.registration.sync.register('background-sync');
        console.log('Synchronisation en arrière-plan déclenchée');
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
      }
    }
  }, [pwaState.registration]);

  // Fonction de notification
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo-p.png',
        badge: '/logo-p.png',
        ...options,
      });
    }
  }, []);

  return {
    ...pwaState,
    installApp,
    updateApp,
    clearCache,
    prefetchResources,
    triggerBackgroundSync,
    requestNotificationPermission,
    showNotification,
  };
};
