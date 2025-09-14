import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Trash2,
  Bell,
  BellOff
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt = ({ className }: PWAInstallPromptProps) => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
    clearCache,
    requestNotificationPermission,
    showNotification
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Afficher le prompt d'installation après 3 secondes si installable
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  useEffect(() => {
    // Vérifier les permissions de notification
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleUpdate = () => {
    updateApp();
  };

  const handleClearCache = async () => {
    await clearCache();
    showNotification('Cache vidé', { body: 'Le cache a été vidé avec succès' });
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      showNotification('Notifications activées', { 
        body: 'Vous recevrez maintenant les notifications de NeuroChat' 
      });
    }
  };

  if (isInstalled && !isUpdateAvailable) {
    return null;
  }

  return (
    <>
      {/* Prompt d'installation */}
      {showPrompt && isInstallable && !isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
          <Card className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Installer NeuroChat
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrompt(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Installez NeuroChat pour une expérience optimale :
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                  <li className="flex items-center gap-2">
                    <Smartphone className="h-3 w-3" />
                    Accès rapide depuis l'écran d'accueil
                  </li>
                  <li className="flex items-center gap-2">
                    <Monitor className="h-3 w-3" />
                    Fonctionnement hors ligne
                  </li>
                  <li className="flex items-center gap-2">
                    <Wifi className="h-3 w-3" />
                    Synchronisation automatique
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Installer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPrompt(false)}
                  className="px-3"
                >
                  Plus tard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification de mise à jour */}
      {isUpdateAvailable && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Card className="w-80 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50 border border-emerald-200/50 dark:border-emerald-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Mise à jour disponible
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Une nouvelle version de NeuroChat est disponible
                  </p>
                </div>
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Mettre à jour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicateur de statut */}
      <div className={cn("fixed top-4 left-4 z-40", className)}>
        <div className="flex items-center gap-2">
          {/* Statut en ligne/hors ligne */}
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Badge>

          {/* Statut PWA */}
          {isInstalled && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              PWA
            </Badge>
          )}

          {/* Permissions de notification */}
          {notificationPermission === 'granted' ? (
            <Badge variant="outline" className="flex items-center gap-1 text-emerald-600">
              <Bell className="h-3 w-3" />
              Notifications
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRequestNotifications}
              className="h-6 px-2 text-xs"
            >
              <BellOff className="h-3 w-3 mr-1" />
              Activer
            </Button>
          )}
        </div>
      </div>

      {/* Actions de développement (uniquement en mode dev) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40">
          <Card className="w-64 bg-slate-900/90 text-white">
            <CardContent className="p-3">
              <div className="space-y-2">
                <p className="text-xs font-medium">Actions PWA</p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                    className="h-6 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Cache
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showNotification('Test', { body: 'Notification de test' })}
                    className="h-6 px-2 text-xs"
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
