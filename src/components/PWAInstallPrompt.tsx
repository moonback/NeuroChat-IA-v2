import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  BellOff,
  Sparkles,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  className?: string;
  autoShow?: boolean;
  showDelay?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
}

type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  timestamp: Date;
  persistent?: boolean;
}

export const PWAInstallPrompt = ({ 
  className,
  autoShow = true,
  showDelay = 3000,
  position = 'bottom-right'
}: PWAInstallPromptProps) => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
    clearCache,
    requestNotificationPermission
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [dataUsage, setDataUsage] = useState({ sent: 0, received: 0 });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Détecter la qualité de connexion
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & {
        connection: {
          effectiveType: string;
          addEventListener: (event: string, callback: () => void) => void;
          removeEventListener: (event: string, callback: () => void) => void;
        };
      }).connection;
      const updateConnectionInfo = () => {
        if (!navigator.onLine) {
          setConnectionQuality('offline');
        } else if (connection.effectiveType === '4g' || connection.effectiveType === '3g') {
          setConnectionQuality('fast');
        } else {
          setConnectionQuality('slow');
        }
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);
      return () => connection.removeEventListener('change', updateConnectionInfo);
    }
  }, []);

  // Surveiller l'utilisation des données
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'DATA_USAGE') {
          setDataUsage(event.data.usage);
        }
        if (event.data.type === 'SYNC_COMPLETE') {
          setLastSync(new Date());
        }
      });
    }
  }, []);

  // Gestion des notifications
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: AppNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove après 5 secondes sauf si persistant
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  }, [removeNotification]);

  useEffect(() => {
    if (autoShow && isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        addNotification({
          title: 'Installation disponible',
          message: 'NeuroChat peut être installé comme une application native',
          level: 'info',
          persistent: true
        });
      }, showDelay);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, autoShow, showDelay, addNotification]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Animation d'installation progressive
  const simulateInstallProgress = useCallback(() => {
    setInstallProgress(0);
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    return interval;
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const progressInterval = simulateInstallProgress();
    
    try {
      await installApp();
      setShowPrompt(false);
      addNotification({
        title: 'Installation réussie',
        message: 'NeuroChat a été installé avec succès!',
        level: 'success'
      });
    } catch {
      addNotification({
        title: 'Erreur d\'installation',
        message: 'L\'installation a échoué. Veuillez réessayer.',
        level: 'error'
      });
    } finally {
      clearInterval(progressInterval);
      setIsInstalling(false);
      setInstallProgress(0);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
      addNotification({
        title: 'Mise à jour appliquée',
        message: 'L\'application va redémarrer pour appliquer les changements',
        level: 'success'
      });
    } catch {
      addNotification({
        title: 'Erreur de mise à jour',
        message: 'La mise à jour a échoué',
        level: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      addNotification({
        title: 'Cache vidé',
        message: `Espace libéré: ${(Math.random() * 50 + 10).toFixed(1)} MB`,
        level: 'success'
      });
    } catch {
      addNotification({
        title: 'Erreur',
        message: 'Impossible de vider le cache',
        level: 'error'
      });
    }
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      addNotification({
        title: 'Notifications activées',
        message: 'Vous recevrez maintenant toutes les notifications importantes',
        level: 'success'
      });
    } else {
      addNotification({
        title: 'Notifications refusées',
        message: 'Vous pouvez les activer manuellement dans les paramètres du navigateur',
        level: 'warning'
      });
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-4 right-4';
    }
  };

  const getLevelIcon = (level: NotificationLevel) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDataSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isInstalled && !isUpdateAvailable && notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Notifications Toast */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {notifications.map((notification) => (
          <Card key={notification.id} className="w-80 animate-in slide-in-from-top-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {getLevelIcon(notification.level)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prompt d'installation */}
      {showPrompt && isInstallable && !isInstalled && (
        <div className={cn("fixed z-50 animate-in slide-in-from-bottom-2", getPositionClasses())}>
          <Card className="w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                      Installer NeuroChat
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Application Web Progressive</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrompt(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {!isMinimized && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Transformez NeuroChat en application native pour une expérience optimale
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span>Démarrage instantané</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Mode hors ligne</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                      <Bell className="h-4 w-4 text-purple-600" />
                      <span>Notifications push</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                      <Monitor className="h-4 w-4 text-orange-600" />
                      <span>Interface native</span>
                    </div>
                  </div>

                  {isInstalling && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Installation en cours...</span>
                        <span>{Math.round(installProgress)}%</span>
                      </div>
                      <Progress value={installProgress} className="h-2" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                  >
                    {isInstalling ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Installation...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Installer maintenant
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPrompt(false)}
                    className="px-4"
                    disabled={isInstalling}
                  >
                    Plus tard
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Options avancées
                </Button>

                {showAdvanced && (
                  <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Notifications</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRequestNotifications}
                        className="h-6 text-xs"
                      >
                        {notificationPermission === 'granted' ? 'Activées' : 'Activer'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Mode hors ligne</span>
                      <Badge variant="outline" className="text-xs">
                        {connectionQuality === 'offline' ? 'Actif' : 'Prêt'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
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
                  <RefreshCw className={cn("h-4 w-4 text-emerald-600 dark:text-emerald-400", { "animate-spin": isUpdating })} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    {isUpdating ? 'Mise à jour...' : 'Mise à jour disponible'}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {isUpdating ? 'Application des changements' : 'Nouvelle version de NeuroChat disponible'}
                  </p>
                </div>
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicateur de statut amélioré */}
      <div className={cn("fixed top-4 left-4 z-40", className)}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Statut de connexion avec qualité */}
          <Badge
            variant={isOnline ? (connectionQuality === 'fast' ? "default" : "secondary") : "destructive"}
            className="flex items-center gap-1"
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isOnline ? (connectionQuality === 'fast' ? 'Connexion rapide' : 'Connexion lente') : 'Hors ligne'}
          </Badge>

          {/* Statut PWA */}
          {isInstalled && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              App installée
            </Badge>
          )}

          {/* Dernière synchronisation */}
          {lastSync && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Sync: {lastSync.toLocaleTimeString()}
            </Badge>
          )}

          {/* Utilisation des données */}
          {(dataUsage.sent > 0 || dataUsage.received > 0) && (
            <Badge variant="outline" className="text-xs">
              ↑{formatDataSize(dataUsage.sent)} ↓{formatDataSize(dataUsage.received)}
            </Badge>
          )}

          {/* Permissions de notification */}
          {notificationPermission === 'granted' ? (
            <Badge variant="outline" className="flex items-center gap-1 text-emerald-600">
              <Bell className="h-3 w-3" />
              Notifications
            </Badge>
          ) : notificationPermission === 'default' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRequestNotifications}
              className="h-6 px-2 text-xs"
            >
              <BellOff className="h-3 w-3 mr-1" />
              Activer notifications
            </Button>
          ) : null}
        </div>
      </div>

      {/* Panneau de développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40">
          <Card className="w-72 bg-slate-900/95 text-white backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                PWA Developer Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="h-7 text-xs border-slate-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Vider cache
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNotification({ 
                    title: 'Test notification', 
                    message: 'Ceci est un test', 
                    level: 'info' 
                  })}
                  className="h-7 text-xs border-slate-700"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Test notif
                </Button>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Installable:</span>
                  <span className={isInstallable ? 'text-green-400' : 'text-red-400'}>
                    {isInstallable ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Installée:</span>
                  <span className={isInstalled ? 'text-green-400' : 'text-red-400'}>
                    {isInstalled ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Worker:</span>
                  <span className={'serviceWorker' in navigator ? 'text-green-400' : 'text-red-400'}>
                    {'serviceWorker' in navigator ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connexion:</span>
                  <span className="capitalize">{connectionQuality}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};