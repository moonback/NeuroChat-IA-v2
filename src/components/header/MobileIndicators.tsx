import React from 'react';
import { Shield, Baby, Database, Globe } from 'lucide-react';

interface MobileStatusIndicatorProps {
  modePrive: boolean;
  modeEnfant?: boolean;
  ragEnabled: boolean;
  webEnabled?: boolean;
}

export const MobileStatusIndicator: React.FC<MobileStatusIndicatorProps> = React.memo(({ 
  modePrive, 
  modeEnfant, 
  ragEnabled, 
  webEnabled 
}) => (
  <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
    <div className="max-w-12xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between text-xs">
        {/* Modes actifs */}
        <div className="flex items-center gap-2">
          {modePrive && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <Shield className="w-3 h-3" />
              <span className="text-xs font-medium">Privé</span>
            </div>
          )}
          {modeEnfant && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <Baby className="w-3 h-3" />
              <span className="text-xs font-medium">Enfant</span>
            </div>
          )}
          {ragEnabled && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Database className="w-3 h-3" />
              <span className="text-xs font-medium">RAG</span>
            </div>
          )}
          {webEnabled && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Globe className="w-3 h-3" />
              <span className="text-xs font-medium">Web</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
));

MobileStatusIndicator.displayName = 'MobileStatusIndicator';
