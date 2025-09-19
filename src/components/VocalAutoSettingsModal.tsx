import { Mic, Settings2 } from 'lucide-react';

// Import des composants unifiés
import { 
  UnifiedButton, 
  UnifiedModal, 
  UnifiedModalContent, 
  UnifiedModalHeader, 
  UnifiedModalTitle,
  UnifiedModalFooter,
  UnifiedInput
} from '@/components/ui/unified';

interface VocalAutoSettingsModalProps {
  open: boolean;
  onClose: () => void;
  config: { silenceMs: number; minChars: number; minWords: number; cooldownMs: number };
  onUpdate: (key: 'silenceMs' | 'minChars' | 'minWords' | 'cooldownMs', value: number) => void;
  onReset?: () => void;
}

export function VocalAutoSettingsModal({ open, onClose, config, onUpdate, onReset }: VocalAutoSettingsModalProps) {
  return (
    <UnifiedModal open={open} onOpenChange={(v) => !v && onClose()}>
      <UnifiedModalContent className="sm:max-w-lg">
        <UnifiedModalHeader>
          <UnifiedModalTitle className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
              <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            Réglages du mode vocal
          </UnifiedModalTitle>
        </UnifiedModalHeader>

        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-300">Silence (ms)</label>
              <UnifiedInput
                type="number"
                min={500}
                max={8000}
                value={config.silenceMs}
                onChange={(e) => onUpdate('silenceMs', Math.max(500, Math.min(8000, Number(e.target.value) || 0)))}
              />
              <p className="text-[10px] text-slate-500">Délai d'attente après la dernière parole avant l'envoi automatique.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-300">Cooldown (ms)</label>
              <UnifiedInput
                type="number"
                min={0}
                max={10000}
                value={config.cooldownMs}
                onChange={(e) => onUpdate('cooldownMs', Math.max(0, Math.min(10000, Number(e.target.value) || 0)))}
              />
              <p className="text-[10px] text-slate-500">Temps minimal entre deux envois automatiques.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-300">Min. caractères</label>
              <UnifiedInput
                type="number"
                min={1}
                max={200}
                value={config.minChars}
                onChange={(e) => onUpdate('minChars', Math.max(1, Math.min(200, Number(e.target.value) || 0)))}
              />
              <p className="text-[10px] text-slate-500">Nombre minimal de caractères requis.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-300">Min. mots</label>
              <UnifiedInput
                type="number"
                min={1}
                max={20}
                value={config.minWords}
                onChange={(e) => onUpdate('minWords', Math.max(1, Math.min(20, Number(e.target.value) || 0)))}
              />
              <p className="text-[10px] text-slate-500">Nombre minimal de mots requis.</p>
            </div>
          </div>
        </div>

        <UnifiedModalFooter className="mt-4 gap-2">
          {onReset && (
            <UnifiedButton variant="outline" onClick={onReset} className="inline-flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Réinitialiser
            </UnifiedButton>
          )}
          <UnifiedButton variant="primary" onClick={onClose}>Fermer</UnifiedButton>
        </UnifiedModalFooter>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}

export default VocalAutoSettingsModal;


