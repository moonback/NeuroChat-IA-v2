import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

export const PWAMeta = () => {
  const { isInstalled, isOnline } = usePWA();

  useEffect(() => {
    // Mettre à jour le titre de la page selon l'état
    const updateTitle = () => {
      const baseTitle = 'NeuroChat IA - Assistant Intelligent';
      let title = baseTitle;
      
      if (!isOnline) {
        title = `🔴 ${baseTitle} (Hors ligne)`;
      } else if (isInstalled) {
        title = `📱 ${baseTitle}`;
      }
      
      document.title = title;
    };

    updateTitle();
  }, [isInstalled, isOnline]);

  useEffect(() => {
    // Mettre à jour la couleur de la barre d'état iOS
    const updateThemeColor = () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        if (!isOnline) {
          metaThemeColor.setAttribute('content', '#ef4444'); // Rouge pour hors ligne
        } else if (isInstalled) {
          metaThemeColor.setAttribute('content', '#10b981'); // Vert pour PWA installé
        } else {
          metaThemeColor.setAttribute('content', '#3b82f6'); // Bleu par défaut
        }
      }
    };

    updateThemeColor();
  }, [isInstalled, isOnline]);

  useEffect(() => {
    // Gérer les événements de visibilité de la page
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée - économiser les ressources
        console.log('[PWA] Page cachée - mode économie d\'énergie');
      } else {
        // Page visible - reprendre les activités
        console.log('[PWA] Page visible - reprise des activités');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Gérer les événements de mise en arrière-plan/avant-plan
    const handlePageShow = () => {
      console.log('[PWA] Page mise en avant-plan');
      // Ici, vous pouvez ajouter la logique de synchronisation
    };

    const handlePageHide = () => {
      console.log('[PWA] Page mise en arrière-plan');
      // Ici, vous pouvez ajouter la logique de sauvegarde
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Ce composant ne rend rien, il ne fait que gérer les effets de bord
  return null;
};
