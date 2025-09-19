import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMonitoring } from '@/hooks/useMonitoring';

// Import des composants unifiés
import { 
  UnifiedButton, 
  UnifiedBadge
} from '@/components/ui/unified';

interface MonitoringStatusIndicatorProps {
  onOpenMonitor?: () => void;
  compact?: boolean;
  showDetails?: boolean;
}

export function MonitoringStatusIndicator({ 
  onOpenMonitor, 
  compact = false, 
  showDetails = false 
}: MonitoringStatusIndicatorProps) {
  const {
    stats,
    getSecurityLevel,
    getActiveAlertsCount,
    getCriticalAlertsCount,
    getMemoryUsagePercentage,
    getPerformanceScore,
  } = useMonitoring();


  if (!stats) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Activity className="w-4 h-4 animate-pulse" />
        {!compact && <span className="text-sm">Chargement...</span>}
      </div>
    );
  }

  const securityLevel = getSecurityLevel();
  const activeAlerts = getActiveAlertsCount();
  const criticalAlerts = getCriticalAlertsCount();
  const memoryUsage = getMemoryUsagePercentage();
  const performanceScore = getPerformanceScore();

  const getSecurityIcon = () => {
    switch (securityLevel) {
      case 'military':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'basic':
        return <Shield className="w-4 h-4 text-yellow-600" />;
      case 'none':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSecurityLabel = () => {
    switch (securityLevel) {
      case 'military':
        return 'Sécurisé';
      case 'basic':
        return 'Partiel';
      case 'none':
        return 'Risque';
      default:
        return 'Inconnu';
    }
  };

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'military':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
      case 'basic':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'none':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getPerformanceIcon = () => {
    if (performanceScore >= 80) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (performanceScore >= 60) {
      return <Activity className="w-4 h-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getPerformanceColor = () => {
    if (performanceScore >= 80) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
    } else if (performanceScore >= 60) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800';
    } else {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
    }
  };

  const getAlertsIcon = () => {
    if (criticalAlerts > 0) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (activeAlerts > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getAlertsColor = () => {
    if (criticalAlerts > 0) {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
    } else if (activeAlerts > 0) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800';
    } else {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={onOpenMonitor}
              className="relative p-2"
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              <BarChart3 className="w-4 h-4" />
              {(activeAlerts > 0 || criticalAlerts > 0) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </UnifiedButton>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getSecurityIcon()}
                <span className="text-sm font-medium">{getSecurityLabel()}</span>
              </div>
              <div className="flex items-center gap-2">
                {getPerformanceIcon()}
                <span className="text-sm">Performance: {performanceScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                {getAlertsIcon()}
                <span className="text-sm">
                  {activeAlerts > 0 ? `${activeAlerts} alerte(s)` : 'Aucune alerte'}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Sécurité */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UnifiedBadge 
              variant="outline" 
              className={cn("flex items-center gap-1 px-2 py-1", getSecurityColor())}
            >
              {getSecurityIcon()}
              <span className="text-xs font-medium">{getSecurityLabel()}</span>
            </UnifiedBadge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Sécurité</p>
              <p className="text-sm">Niveau: {securityLevel}</p>
              <p className="text-sm">Clés actives: {stats.security.activeKeys}</p>
              <p className="text-sm">Chiffrement: {stats.security.encryptionActive ? 'Actif' : 'Inactif'}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Performance */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UnifiedBadge 
              variant="outline" 
              className={cn("flex items-center gap-1 px-2 py-1", getPerformanceColor())}
            >
              {getPerformanceIcon()}
              <span className="text-xs font-medium">{performanceScore}%</span>
            </UnifiedBadge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Performance</p>
              <p className="text-sm">Score: {performanceScore}%</p>
              <p className="text-sm">Mémoire: {memoryUsage.toFixed(1)}%</p>
              <p className="text-sm">Cache: {(stats.performance.cacheHitRate * 100).toFixed(1)}%</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Alertes */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UnifiedBadge 
              variant="outline" 
              className={cn("flex items-center gap-1 px-2 py-1", getAlertsColor())}
            >
              {getAlertsIcon()}
              <span className="text-xs font-medium">
                {activeAlerts > 0 ? activeAlerts : 'OK'}
              </span>
            </UnifiedBadge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Alertes</p>
              <p className="text-sm">
                {activeAlerts > 0 
                  ? `${activeAlerts} alerte(s) active(s)` 
                  : 'Aucune alerte active'
                }
              </p>
              {criticalAlerts > 0 && (
                <p className="text-sm text-red-600">
                  {criticalAlerts} critique(s)
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Bouton monitoring */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenMonitor}
        className="p-2"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>

      {/* Détails étendus */}
      {showDetails && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{stats.performance.memoryUsage}MB</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>{stats.performance.activeConnections}</span>
          </div>
        </div>
      )}
    </div>
  );
}
