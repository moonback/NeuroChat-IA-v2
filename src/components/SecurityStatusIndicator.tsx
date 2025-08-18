/**
 * 🔐 Indicateur de Statut de Sécurité - Temps Réel
 * 
 * Composant d'affichage du niveau de protection AES-256
 * - Indicateurs visuels temps réel
 * - Métriques de sécurité
 * - Audit trail accessible
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Activity, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isSecureStorageActive } from '@/services/secureStorage';
import { isPrivateModeActive } from '@/services/secureMemory';
import { getKeyManagerStats, getKeyAuditTrail } from '@/services/keyManager';
import { getCryptoStats } from '@/services/encryption';

interface SecurityStatusIndicatorProps {
  /** Affichage compact ou détaillé */
  compact?: boolean;
  /** Callback lors de clic sur l'indicateur */
  onClick?: () => void;
}

interface SecurityMetrics {
  encryptionActive: boolean;
  storageSecured: boolean;
  memorySecured: boolean;
  keyManagerActive: boolean;
  totalKeys: number;
  auditEntries: number;
  securityLevel: 'none' | 'basic' | 'military';
}

/**
 * Composant principal d'indicateur de sécurité
 */
export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({
  compact = false,
  onClick
}) => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    encryptionActive: false,
    storageSecured: false,
    memorySecured: false,
    keyManagerActive: false,
    totalKeys: 0,
    auditEntries: 0,
    securityLevel: 'none'
  });
  
  const [showDetails, setShowDetails] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  
  // Mise à jour des métriques en temps réel
  useEffect(() => {
    const updateMetrics = () => {
      try {
        const cryptoStats = getCryptoStats();
        const keyStats = getKeyManagerStats();
        const auditData = getKeyAuditTrail(10);
        
        const storageActive = isSecureStorageActive();
        const memoryActive = isPrivateModeActive();
        
        setMetrics({
          encryptionActive: cryptoStats.isWebCryptoSupported,
          storageSecured: storageActive,
          memorySecured: memoryActive,
          keyManagerActive: keyStats !== null,
          totalKeys: keyStats?.totalKeys || 0,
          auditEntries: auditData.length,
          securityLevel: (storageActive && memoryActive) ? 'military' : 
                        (storageActive || memoryActive) ? 'basic' : 'none'
        });
        
        setAuditTrail(auditData);
      } catch (error) {
        console.error('Erreur mise à jour métriques sécurité:', error);
      }
    };
    
    // Mise à jour initiale
    updateMetrics();
    
    // Mise à jour périodique
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // Styles selon le niveau de sécurité
  const getSecurityStyle = () => {
    switch (metrics.securityLevel) {
      case 'military':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          text: 'text-white',
          border: 'border-green-400',
          icon: CheckCircle,
          label: 'PROTECTION MILITAIRE'
        };
      case 'basic':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
          text: 'text-white',
          border: 'border-yellow-400',
          icon: AlertTriangle,
          label: 'PROTECTION BASIQUE'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-600',
          text: 'text-white',
          border: 'border-gray-400',
          icon: Shield,
          label: 'AUCUNE PROTECTION'
        };
    }
  };
  
  const securityStyle = getSecurityStyle();
  const SecurityIcon = securityStyle.icon;
  
  // Version compacte pour le header
  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
          securityStyle.bg,
          securityStyle.text,
          "hover:scale-105 hover:shadow-lg"
        )}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center gap-2">
          <SecurityIcon className="w-4 h-4" />
          <span className="text-xs font-bold">
            {metrics.securityLevel === 'military' ? 'AES-256' : 'STANDARD'}
          </span>
        </div>
      </Button>
    );
  }
  
  // Version détaillée
  return (
    <div className="space-y-4">
      {/* Indicateur principal */}
      <div 
        className={cn(
          "p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-500 cursor-pointer group",
          securityStyle.bg,
          securityStyle.border,
          "hover:scale-102 hover:shadow-2xl"
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <SecurityIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm">{securityStyle.label}</h3>
              <p className="text-white/80 text-xs">
                {metrics.securityLevel === 'military' && 'Chiffrement AES-256-GCM actif'}
                {metrics.securityLevel === 'basic' && 'Protection partielle active'}
                {metrics.securityLevel === 'none' && 'Mode standard non chiffré'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {metrics.totalKeys} clés
          </Badge>
        </div>
        
        {/* Indicateurs de statut */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-white/90">
            <div className={cn(
              "w-2 h-2 rounded-full",
              metrics.encryptionActive ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            <span className="text-xs">Chiffrement</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <div className={cn(
              "w-2 h-2 rounded-full",
              metrics.storageSecured ? "bg-green-400 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-xs">Stockage</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <div className={cn(
              "w-2 h-2 rounded-full",
              metrics.memorySecured ? "bg-green-400 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-xs">Mémoire</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <div className={cn(
              "w-2 h-2 rounded-full",
              metrics.keyManagerActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-xs">Clés</span>
          </div>
        </div>
      </div>
      
      {/* Détails étendus */}
      {showDetails && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
          {/* Métriques détaillées */}
          <div className="p-4 bg-white/10 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Métriques de Sécurité
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Algorithme:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {metrics.securityLevel === 'military' ? 'AES-256-GCM' : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Clés actives:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{metrics.totalKeys}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Audit trail:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{metrics.auditEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Statut:</span>
                  <span className={cn(
                    "font-bold text-xs px-2 py-1 rounded-full",
                    metrics.securityLevel === 'military' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    metrics.securityLevel === 'basic' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  )}>
                    {metrics.securityLevel === 'military' ? 'SÉCURISÉ' : 
                     metrics.securityLevel === 'basic' ? 'PARTIEL' : 'STANDARD'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Audit trail récent */}
          {auditTrail.length > 0 && (
            <div className="p-4 bg-white/10 dark:bg-slate-800/50 rounded-xl border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Audit Trail (dernières activités)
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {auditTrail.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      entry.success ? "bg-green-400" : "bg-red-400"
                    )} />
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 capitalize">
                      {entry.action}
                    </span>
                    <span className="text-slate-500 dark:text-slate-500 truncate">
                      {entry.purpose}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Composant badge compact pour affichage dans le header
 */
export const SecurityBadge: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [securityLevel, setSecurityLevel] = useState<'none' | 'basic' | 'military'>('none');
  
  useEffect(() => {
    const updateLevel = () => {
      const storageActive = isSecureStorageActive();
      const memoryActive = isPrivateModeActive();
      
      setSecurityLevel(
        (storageActive && memoryActive) ? 'military' : 
        (storageActive || memoryActive) ? 'basic' : 'none'
      );
    };
    
    updateLevel();
    const interval = setInterval(updateLevel, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const getBadgeStyle = () => {
    switch (securityLevel) {
      case 'military':
        return 'bg-green-500 text-white animate-pulse';
      case 'basic':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <Badge 
      className={cn("cursor-pointer transition-all duration-300 hover:scale-110", getBadgeStyle())}
      onClick={onClick}
    >
      {securityLevel === 'military' && '🔐 AES-256'}
      {securityLevel === 'basic' && '🔒 PARTIEL'}
      {securityLevel === 'none' && '🔓 STANDARD'}
    </Badge>
  );
};

export default SecurityStatusIndicator;
