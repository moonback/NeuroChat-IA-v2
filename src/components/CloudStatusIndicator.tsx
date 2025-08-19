import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Cloud, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import cloudSyncService from '@/services/cloudSync';

interface CloudStatusIndicatorProps {
  className?: string;
}

export function CloudStatusIndicator({ className = '' }: CloudStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le statut cloud au chargement et périodiquement
  useEffect(() => {
    const checkStatus = () => {
      const authManager = cloudSyncService.getAuthManager();
      const authenticated = authManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsOnline(navigator.onLine);
      
      if (authenticated) {
        setError(null);
      }
    };

    // Vérification initiale
    checkStatus();

    // Vérification périodique
    const interval = setInterval(checkStatus, 10000);

    // Écouter les changements de connectivité
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ouvrir le modal d'authentification
  const openAuthModal = () => {
    document.dispatchEvent(new CustomEvent('cloud:auth:open'));
  };

  // Synchronisation manuelle
  const handleManualSync = async () => {
    if (!isAuthenticated) return;

    setIsSyncing(true);
    setError(null);

    try {
      // TODO: Implémenter la synchronisation avec useDiscussions
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  // Rendu du composant
  if (!isOnline) {
    return (
      <Badge 
        variant="secondary" 
        className={`flex items-center gap-1 px-2 py-1 ${className}`}
      >
        <WifiOff className="w-3 h-3" />
        <span className="text-xs">Hors ligne</span>
      </Badge>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={openAuthModal}
        className={`h-8 px-3 text-xs ${className}`}
      >
        <Cloud className="w-4 h-4 mr-1" />
        Connexion
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Statut de synchronisation */}
      <Badge 
        variant={error ? "destructive" : "default"}
        className="flex items-center gap-1 px-2 py-1"
      >
        {isSyncing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : error ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <CheckCircle className="w-3 h-3" />
        )}
        <span className="text-xs">
          {isSyncing ? 'Sync...' : error ? 'Erreur' : 'Connecté'}
        </span>
      </Badge>

      {/* Bouton de synchronisation manuelle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isSyncing}
        className="h-8 px-2 text-xs"
        title={lastSync ? `Dernière sync: ${lastSync.toLocaleTimeString()}` : 'Synchroniser'}
      >
        {isSyncing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Wifi className="w-3 h-3" />
        )}
      </Button>

      {/* Bouton pour ouvrir le modal */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openAuthModal}
        className="h-8 px-2 text-xs"
        title="Gérer le compte cloud"
      >
        <Cloud className="w-3 h-3" />
      </Button>
    </div>
  );
}
