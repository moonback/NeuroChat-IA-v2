import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

interface PWAShortcutsProps {
  onNewDiscussion: () => void;
  onToggleVoice: () => void;
  onTogglePrivateMode: () => void;
}

export const PWAShortcuts = ({ 
  onNewDiscussion, 
  onToggleVoice, 
  onTogglePrivateMode 
}: PWAShortcutsProps) => {
  const { isInstalled } = usePWA();

  useEffect(() => {
    // Gérer les raccourcis PWA
    const handleShortcut = (event: KeyboardEvent) => {
      // Raccourcis uniquement si PWA installé
      if (!isInstalled) return;

      // Ctrl/Cmd + N : Nouvelle discussion
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onNewDiscussion();
      }

      // Ctrl/Cmd + V : Toggle vocal
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        onToggleVoice();
      }

      // Ctrl/Cmd + P : Toggle mode privé
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        onTogglePrivateMode();
      }

      // Escape : Fermer les modales
      if (event.key === 'Escape') {
        // Fermer toutes les modales ouvertes
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[data-dialog-close]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        });
      }
    };

    // Gérer les actions depuis l'URL
    const handleURLActions = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');

      switch (action) {
        case 'new':
          onNewDiscussion();
          // Nettoyer l'URL
          window.history.replaceState({}, '', window.location.pathname);
          break;
        case 'voice':
          onToggleVoice();
          window.history.replaceState({}, '', window.location.pathname);
          break;
        case 'private':
          onTogglePrivateMode();
          window.history.replaceState({}, '', window.location.pathname);
          break;
      }
    };

    // Gérer les messages du Service Worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'SHORTCUT_NEW_DISCUSSION':
          onNewDiscussion();
          break;
        case 'SHORTCUT_TOGGLE_VOICE':
          onToggleVoice();
          break;
        case 'SHORTCUT_TOGGLE_PRIVATE':
          onTogglePrivateMode();
          break;
        case 'NOTIFICATION_CLICK':
          // Gérer les clics sur les notifications
          if (payload?.action === 'new') {
            onNewDiscussion();
          }
          break;
      }
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('keydown', handleShortcut);
    window.addEventListener('load', handleURLActions);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    // Gérer les raccourcis au chargement
    handleURLActions();

    return () => {
      document.removeEventListener('keydown', handleShortcut);
      window.removeEventListener('load', handleURLActions);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [isInstalled, onNewDiscussion, onToggleVoice, onTogglePrivateMode]);

  // Gérer les raccourcis de l'application
  useEffect(() => {
    const handleAppShortcuts = () => {
      // Raccourcis pour les applications mobiles
      if ('standalone' in window.navigator && (window.navigator as any).standalone) {
        // iOS PWA
        console.log('[PWA] Application iOS PWA détectée');
      }

      // Raccourcis pour les applications desktop
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] Application PWA standalone détectée');
      }
    };

    handleAppShortcuts();
  }, []);

  // Ce composant ne rend rien, il ne fait que gérer les raccourcis
  return null;
};
