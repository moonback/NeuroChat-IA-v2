import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  className?: string;
  autoShow?: boolean;
  showDelay?: number;
}

export const PWAInstallPrompt = ({ 
  className,
  autoShow = true,
  showDelay = 3000
}: PWAInstallPromptProps) => {
  const { isInstallable, isInstalled, installPrompt, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!autoShow || isInstalled) return;

    const timer = setTimeout(() => {
      if (isInstallable && installPrompt) {
        setShowPrompt(true);
      }
    }, showDelay);

    return () => clearTimeout(timer);
  }, [autoShow, isInstalled, isInstallable, installPrompt, showDelay]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
      setShowPrompt(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2",
      className
    )}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Installer NeuroChat
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Ajoutez NeuroChat à votre écran d'accueil pour un accès rapide.
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 text-xs"
              >
                {isInstalling ? 'Installation...' : 'Installer'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};