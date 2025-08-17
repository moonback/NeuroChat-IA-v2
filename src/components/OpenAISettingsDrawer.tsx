import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button as UIButton } from '@/components/ui/button';
import { Info, Sliders } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { OpenAIGenerationConfig } from '@/services/openaiApi';

interface OpenAISettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openaiConfig: OpenAIGenerationConfig;
  onConfigChange: (key: keyof OpenAIGenerationConfig, value: any) => void;
  onReset: () => void;
  onClose: () => void;
  DEFAULTS: Required<Pick<OpenAIGenerationConfig, 'temperature' | 'top_p' | 'max_tokens' | 'model'>>;
  autoRagEnabled?: boolean;
  autoWebEnabled?: boolean;
  ragKeywords?: string[];
  webKeywords?: string[];
  onToggleAutoRag?: (enabled: boolean) => void;
  onToggleAutoWeb?: (enabled: boolean) => void;
  onChangeRagKeywords?: (keywords: string[]) => void;
  onChangeWebKeywords?: (keywords: string[]) => void;
}

export const OpenAISettingsDrawer: React.FC<OpenAISettingsDrawerProps> = ({
  open,
  onOpenChange,
  openaiConfig,
  onConfigChange,
  onReset,
  onClose,
  DEFAULTS,
  autoRagEnabled,
  autoWebEnabled,
  ragKeywords,
  webKeywords,
  onToggleAutoRag,
  onToggleAutoWeb,
  onChangeRagKeywords,
  onChangeWebKeywords,
}) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-w-full w-[95vw] sm:w-[100%] px-2 py-2">
      <DrawerHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-500 p-1.5 rounded-xl shadow">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 dark:from-emerald-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Réglages OpenAI
          </DrawerTitle>
        </div>
        <div className="text-xs text-muted-foreground text-center max-w-xs mx-auto mt-1">
          Ajustez le comportement du modèle. <Info className="inline w-3 h-3 align-text-bottom" /> pour infos.
        </div>
      </DrawerHeader>
      <div className="border-b border-slate-200 dark:border-slate-700 mb-2" />
      <div className="p-0 space-y-3">
        {/* Heuristiques automatiques Web/RAG */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-2 shadow-sm">
          <div className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-200">Heuristiques automatiques</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <input id="auto-rag-oai" type="checkbox" checked={!!autoRagEnabled} onChange={() => onToggleAutoRag?.(!autoRagEnabled)} />
              <Label htmlFor="auto-rag-oai" className="text-xs">Activer RAG auto</Label>
            </div>
            <div className="flex items-center gap-2">
              <input id="auto-web-oai" type="checkbox" checked={!!autoWebEnabled} onChange={() => onToggleAutoWeb?.(!autoWebEnabled)} />
              <Label htmlFor="auto-web-oai" className="text-xs">Activer Web auto</Label>
            </div>
            <div className="col-span-1 sm:col-span-1">
              <Label htmlFor="rag-kw-oai" className="text-xs">Mots-clés RAG (séparés par virgule)</Label>
              <Input id="rag-kw-oai" type="text" value={(ragKeywords || []).join(', ')} onChange={e => onChangeRagKeywords?.(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="doc, pdf, rapport, mémoire" className="mt-1 text-xs" />
            </div>
            <div className="col-span-1 sm:col-span-1">
              <Label htmlFor="web-kw-oai" className="text-xs">Mots-clés Web (séparés par virgule)</Label>
              <Input id="web-kw-oai" type="text" value={(webKeywords || []).join(', ')} onChange={e => onChangeWebKeywords?.(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="aujourd'hui, actualité, prix, version" className="mt-1 text-xs" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Température */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="openai-temperature" className="text-xs">Température
                <span className="font-mono ml-1">{(openaiConfig.temperature ?? DEFAULTS.temperature).toFixed(2)}</span>
              </Label>
              {openaiConfig.temperature === DEFAULTS.temperature && (
                <span className="ml-1 px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[10px] text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-temp">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-1 rounded" onClick={() => onConfigChange('temperature', DEFAULTS.temperature)}>Reset</button>
              <Tooltip id="tip-openai-temp" place="right" content="0 = déterministe, 2 = créatif. Reco : 0.7" />
            </div>
            <Slider
              id="openai-temperature"
              min={0}
              max={2}
              step={0.01}
              value={[openaiConfig.temperature ?? DEFAULTS.temperature]}
              onValueChange={([v]) => onConfigChange('temperature', v)}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Déterministe</span>
              <span>Créatif</span>
            </div>
          </div>
          {/* top_p */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="openai-topp" className="text-xs">top_p
                <span className="font-mono ml-1">{(openaiConfig.top_p ?? DEFAULTS.top_p).toFixed(2)}</span>
              </Label>
              {openaiConfig.top_p === DEFAULTS.top_p && (
                <span className="ml-1 px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[10px] text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-topp">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-1 rounded" onClick={() => onConfigChange('top_p', DEFAULTS.top_p)}>Reset</button>
              <Tooltip id="tip-openai-topp" place="right" content="Probabilité cumulative. 1 = diversité. Reco : 0.95" />
            </div>
            <Slider
              id="openai-topp"
              min={0}
              max={1}
              step={0.01}
              value={[openaiConfig.top_p ?? DEFAULTS.top_p]}
              onValueChange={([v]) => onConfigChange('top_p', v)}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Moins varié</span>
              <span>Plus varié</span>
            </div>
          </div>
          {/* max_tokens */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="openai-maxtokens" className="text-xs">max_tokens
                <span className="font-mono ml-1">{openaiConfig.max_tokens ?? DEFAULTS.max_tokens}</span>
              </Label>
              {openaiConfig.max_tokens === DEFAULTS.max_tokens && (
                <span className="ml-1 px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[10px] text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-maxtokens">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-1 rounded" onClick={() => onConfigChange('max_tokens', DEFAULTS.max_tokens)}>Reset</button>
              <Tooltip id="tip-openai-maxtokens" place="right" content="Max tokens générés. Reco : 4096" />
            </div>
            <Input
              id="openai-maxtokens"
              type="number"
              min={64}
              max={16384}
              value={openaiConfig.max_tokens ?? DEFAULTS.max_tokens}
              onChange={e => onConfigChange('max_tokens', Number(e.target.value))}
              className="mt-1 w-24 text-xs"
            />
          </div>
          {/* model */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="openai-model" className="text-xs">model</Label>
              {openaiConfig.model === DEFAULTS.model && (
                <span className="ml-1 px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[10px] text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-model">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-1 rounded" onClick={() => onConfigChange('model', DEFAULTS.model)}>Reset</button>
              <Tooltip id="tip-openai-model" place="right" content="Nom du modèle (ex: gpt-4o-mini, gpt-4o, gpt-4.1)" />
            </div>
            <Input
              id="openai-model"
              type="text"
              value={openaiConfig.model ?? DEFAULTS.model}
              onChange={e => onConfigChange('model', e.target.value)}
              placeholder="gpt-4o-mini"
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


