import React from 'react';
import { Activity, WifiOff } from 'lucide-react';
interface StatusIndicatorProps {
  isOnline: boolean;
  quality: 'excellent' | 'good' | 'poor';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({ isOnline, quality }) => {
  const getQualityColor = () => {
    if (!isOnline) return 'bg-red-500';
    switch (quality) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getSignalBars = () => {
    if (!isOnline) return 0;
    switch (quality) {
      case 'excellent': return 3;
      case 'good': return 2;
      case 'poor': return 1;
      default: return 0;
    }
  };

  return (
    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm">
      <div className={`w-2.5 h-2.5 rounded-full ${getQualityColor()} relative`}>
        {isOnline && quality === 'excellent' && (
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
        )}
        {/* Mini signal bars */}
        <div className="absolute -top-0.5 -right-0.5 flex gap-px">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-px h-1 ${
                i < getSignalBars() ? getQualityColor().replace('bg-', 'bg-') : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: `${(i + 1) * 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

export const ConnectionStatus: React.FC<{ isOnline: boolean; quality: 'excellent' | 'good' | 'poor' }> = React.memo(({ isOnline, quality }) => (
  <div className="hidden xs:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
    {isOnline ? (
      <div className="flex items-center gap-1">
        <Activity className="w-3 h-3" />
        <span className="capitalize truncate">
          {quality === 'excellent' ? 'Excellente' : quality === 'good' ? 'Bonne' : 'Faible'} connexion
        </span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-500">
        <WifiOff className="w-3 h-3" />
        <span className="truncate">Hors ligne</span>
      </div>
    )}
  </div>
));

ConnectionStatus.displayName = 'ConnectionStatus';

interface PrivateModeBannerProps {
  show: boolean;
}

export const PrivateModeBanner: React.FC<PrivateModeBannerProps> = React.memo(({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-medium animate-slide-down shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        Mode privé activé - Aucune donnée n'est sauvegardée
      </div>
    </div>
  );
});

PrivateModeBanner.displayName = 'PrivateModeBanner';
