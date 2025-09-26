import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, Settings2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VocalAutoSettingsModalProps {
  open: boolean;
  onClose: () => void;
  config: { silenceMs: number; minChars: number; minWords: number; cooldownMs: number };
  onUpdate: (key: 'silenceMs' | 'minChars' | 'minWords' | 'cooldownMs', value: number) => void;
  onReset?: () => void;
}

export function VocalAutoSettingsModal({ open, onClose, config, onUpdate, onReset }: VocalAutoSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Réglages du mode vocal
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Configurez les paramètres de reconnaissance vocale automatique
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-300">Silence (ms)</label>
              <Input
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
              <Input
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
              <Input
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
              <Input
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
        </div>

        {/* Footer avec actions rapides */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Mic className="w-3 h-3 mr-1" />
                Mode vocal
              </Badge>
              <Badge variant="outline" className="text-xs">
                Configuration avancée
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {onReset && (
                <Button variant="outline" onClick={onReset} className="inline-flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Réinitialiser
                </Button>
              )}
              <Button onClick={onClose}>Fermer</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VocalAutoSettingsModal;


