import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button as UIButton } from '@/components/ui/button';
import { Info, Sliders } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { MistralGenerationConfig } from '@/services/mistralApi';

interface MistralSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mistralConfig: MistralGenerationConfig;
  onConfigChange: (key: keyof MistralGenerationConfig, value: any) => void;
  onReset: () => void;
  onClose: () => void;
  DEFAULTS: Required<Pick<MistralGenerationConfig, 'temperature' | 'top_p' | 'max_tokens' | 'model'>>;
}

export const MistralSettingsDrawer: React.FC<MistralSettingsDrawerProps> = ({
  open,
  onOpenChange,
  mistralConfig,
  onConfigChange,
  onReset,
  onClose,
  DEFAULTS,
}) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-w-full w-[95vw] sm:w-[100%] px-2 py-2">
      <DrawerHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1.5 rounded-xl shadow">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-300 dark:via-pink-300 dark:to-orange-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Réglages Mistral
          </DrawerTitle>
        </div>
        <div className="text-xs text-muted-foreground text-center max-w-xs mx-auto mt-1">
          Ajustez le comportement du modèle. <Info className="inline w-3 h-3 align-text-bottom" /> pour infos.
        </div>
      </DrawerHeader>
      <div className="border-b border-slate-200 dark:border-slate-700 mb-2" />
      <div className="p-0 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Température */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-100 dark:border-purple-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="mistral-temperature" className="text-xs">Température
                <span className="font-mono ml-1">{(mistralConfig.temperature ?? DEFAULTS.temperature).toFixed(2)}</span>
              </Label>
              {mistralConfig.temperature === DEFAULTS.temperature && (
                <span className="ml-1 px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-[10px] text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-purple-600 hover:text-purple-800" data-tooltip-id="tip-mistral-temp">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 px-1 rounded" onClick={() => onConfigChange('temperature', DEFAULTS.temperature)}>Reset</button>
              <Tooltip id="tip-mistral-temp" place="right" content="0 = déterministe, 2 = créatif. Reco : 0.7" />
            </div>
            <Slider
              id="mistral-temperature"
              min={0}
              max={2}
              step={0.01}
              value={[mistralConfig.temperature ?? DEFAULTS.temperature]}
              onValueChange={([v]) => onConfigChange('temperature', v)}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Déterministe</span>
              <span>Créatif</span>
            </div>
          </div>
          {/* top_p */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-100 dark:border-purple-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="mistral-topp" className="text-xs">top_p
                <span className="font-mono ml-1">{(mistralConfig.top_p ?? DEFAULTS.top_p).toFixed(2)}</span>
              </Label>
              {mistralConfig.top_p === DEFAULTS.top_p && (
                <span className="ml-1 px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-[10px] text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-purple-600 hover:text-purple-800" data-tooltip-id="tip-mistral-topp">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 px-1 rounded" onClick={() => onConfigChange('top_p', DEFAULTS.top_p)}>Reset</button>
              <Tooltip id="tip-mistral-topp" place="right" content="Probabilité cumulative. 1 = diversité. Reco : 0.95" />
            </div>
            <Slider
              id="mistral-topp"
              min={0}
              max={1}
              step={0.01}
              value={[mistralConfig.top_p ?? DEFAULTS.top_p]}
              onValueChange={([v]) => onConfigChange('top_p', v)}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Moins varié</span>
              <span>Plus varié</span>
            </div>
          </div>
          {/* max_tokens */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-100 dark:border-purple-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="mistral-maxtokens" className="text-xs">max_tokens
                <span className="font-mono ml-1">{mistralConfig.max_tokens ?? DEFAULTS.max_tokens}</span>
              </Label>
              {mistralConfig.max_tokens === DEFAULTS.max_tokens && (
                <span className="ml-1 px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-[10px] text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-purple-600 hover:text-purple-800" data-tooltip-id="tip-mistral-maxtokens">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 px-1 rounded" onClick={() => onConfigChange('max_tokens', DEFAULTS.max_tokens)}>Reset</button>
              <Tooltip id="tip-mistral-maxtokens" place="right" content="Max tokens générés. Reco : 4096" />
            </div>
            <Input
              id="mistral-maxtokens"
              type="number"
              min={64}
              max={16384}
              value={mistralConfig.max_tokens ?? DEFAULTS.max_tokens}
              onChange={e => onConfigChange('max_tokens', Number(e.target.value))}
              className="mt-1 w-24 text-xs"
            />
          </div>
          {/* model */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-100 dark:border-purple-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="mistral-model" className="text-xs">model</Label>
              {mistralConfig.model === DEFAULTS.model && (
                <span className="ml-1 px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-[10px] text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-purple-600 hover:text-purple-800" data-tooltip-id="tip-mistral-model">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 px-1 rounded" onClick={() => onConfigChange('model', DEFAULTS.model)}>Reset</button>
              <Tooltip id="tip-mistral-model" place="right" content="Nom du modèle (ex: mistral-small-latest, mistral-medium-latest)" />
            </div>
            <Input
              id="mistral-model"
              type="text"
              value={mistralConfig.model ?? DEFAULTS.model}
              onChange={e => onConfigChange('model', e.target.value)}
              placeholder="mistral-small-latest"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>
      <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
        <UIButton variant="secondary" size="sm" onClick={onReset}>
          Réinitialiser
        </UIButton>
        <UIButton size="sm" onClick={onClose}>
          Fermer
        </UIButton>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);


