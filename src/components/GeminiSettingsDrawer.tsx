import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button as UIButton } from '@/components/ui/button';
import { Info, Sliders, Sparkles } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import React from 'react';
import type { GeminiGenerationConfig } from '@/services/geminiApi';

interface GeminiSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  geminiConfig: GeminiGenerationConfig;
  onConfigChange: (key: keyof GeminiGenerationConfig, value: any) => void;
  onReset: () => void;
  onClose: () => void;
  DEFAULTS: GeminiGenerationConfig & { stopSequences: string[]; candidateCount: number };
  agentEnabled?: boolean;
  onToggleAgent?: (enabled: boolean) => void;
  autoRagEnabled?: boolean;
  autoWebEnabled?: boolean;
  ragKeywords?: string[];
  webKeywords?: string[];
  onToggleAutoRag?: (enabled: boolean) => void;
  onToggleAutoWeb?: (enabled: boolean) => void;
  onChangeRagKeywords?: (keywords: string[]) => void;
  onChangeWebKeywords?: (keywords: string[]) => void;
}

export const GeminiSettingsDrawer: React.FC<GeminiSettingsDrawerProps> = ({
  open,
  onOpenChange,
  geminiConfig,
  onConfigChange,
  onReset,
  onClose,
  DEFAULTS,
  agentEnabled,
  onToggleAgent,
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
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 p-1.5 rounded-xl shadow">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Réglages Gemini
          </DrawerTitle>
        </div>
        <div className="text-xs text-muted-foreground text-center max-w-xs mx-auto mt-1">
          Ajustez le comportement du modèle. <Info className="inline w-3 h-3 align-text-bottom" /> pour infos.
        </div>
      </DrawerHeader>
      <div className="border-b border-slate-200 dark:border-slate-700 mb-2" />
      {/* Agent Gemini toggle */}
      <button
        type="button"
        onClick={() => onToggleAgent?.(!agentEnabled)}
        className={`w-full mb-2 flex items-center justify-between p-3 rounded-xl border transition-all duration-200 shadow-sm ${agentEnabled ? 'border-indigo-400/40 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20' : 'border-indigo-100 dark:border-indigo-900/30 bg-white/70 dark:bg-slate-900/70'} hover:scale-[1.01] active:scale-100`}
        aria-pressed={agentEnabled}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agentEnabled ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600'}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Agent Gemini</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Orchestration auto Web/RAG et réponse guidée.</div>
          </div>
        </div>
        <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${agentEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          {agentEnabled ? 'Activé' : 'Désactivé'}
        </div>
      </button>
      <div className="p-0 space-y-3">
        {/* Heuristiques automatiques Web/RAG */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100 dark:border-indigo-900/30 p-2 shadow-sm">
          <div className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-200">Heuristiques automatiques</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <input id="auto-rag-gem" type="checkbox" checked={!!autoRagEnabled} onChange={() => onToggleAutoRag?.(!autoRagEnabled)} />
              <Label htmlFor="auto-rag-gem" className="text-xs">Activer RAG auto</Label>
            </div>
            <div className="flex items-center gap-2">
              <input id="auto-web-gem" type="checkbox" checked={!!autoWebEnabled} onChange={() => onToggleAutoWeb?.(!autoWebEnabled)} />
              <Label htmlFor="auto-web-gem" className="text-xs">Activer Web auto</Label>
            </div>
            <div className="col-span-1 sm:col-span-1">
              <Label htmlFor="rag-kw-gem" className="text-xs">Mots-clés RAG (séparés par virgule)</Label>
              <Input id="rag-kw-gem" type="text" value={(ragKeywords || []).join(', ')} onChange={e => onChangeRagKeywords?.(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="doc, pdf, rapport, mémoire" className="mt-1 text-xs" />
            </div>
            <div className="col-span-1 sm:col-span-1">
              <Label htmlFor="web-kw-gem" className="text-xs">Mots-clés Web (séparés par virgule)</Label>
              <Input id="web-kw-gem" type="text" value={(webKeywords || []).join(', ')} onChange={e => onChangeWebKeywords?.(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="aujourd'hui, actualité, prix, version" className="mt-1 text-xs" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Température */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="gemini-temperature" className="text-xs">Température
                <span className="font-mono ml-1">{geminiConfig.temperature?.toFixed(2)}</span>
              </Label>
              {geminiConfig.temperature === DEFAULTS.temperature && (
                <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-temp">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => onConfigChange('temperature', DEFAULTS.temperature)}>Reset</button>
              <Tooltip id="tip-temp" place="right" content="0 = déterministe, 2 = créatif. Reco : 0.7" />
            </div>
            <Slider
              id="gemini-temperature"
              min={0}
              max={2}
              step={0.01}
              value={[geminiConfig.temperature ?? 0.7]}
              onValueChange={([v]) => onConfigChange('temperature', v)}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Déterministe</span>
              <span>Créatif</span>
            </div>
          </div>
          {/* topK */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="gemini-topk" className="text-xs">topK
                <span className="font-mono ml-1">{geminiConfig.topK}</span>
              </Label>
              {geminiConfig.topK === DEFAULTS.topK && (
                <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-topk">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => onConfigChange('topK', DEFAULTS.topK)}>Reset</button>
              <Tooltip id="tip-topk" place="right" content="Tokens candidats. Plus = diversité. Reco : 40" />
            </div>
            <Input
              id="gemini-topk"
              type="number"
              min={1}
              max={100}
              value={geminiConfig.topK ?? 40}
              onChange={e => onConfigChange('topK', Number(e.target.value))}
              className="mt-1 w-20 text-xs"
            />
          </div>
          {/* topP */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="gemini-topp" className="text-xs">topP
                <span className="font-mono ml-1">{geminiConfig.topP?.toFixed(2)}</span>
              </Label>
              {geminiConfig.topP === DEFAULTS.topP && (
                <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-topp">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => onConfigChange('topP', DEFAULTS.topP)}>Reset</button>
              <Tooltip id="tip-topp" place="right" content="Probabilité cumulative. 1 = diversité. Reco : 0.95" />
            </div>
            <Slider
              id="gemini-topp"
              min={0}
              max={1}
              step={0.01}
              value={[geminiConfig.topP ?? 0.95]}
              onValueChange={([v]) => onConfigChange('topP', v)}
              className="mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Moins varié</span>
              <span>Plus varié</span>
            </div>
          </div>
          {/* maxOutputTokens */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="gemini-maxoutput" className="text-xs">maxTokens
                <span className="font-mono ml-1">{geminiConfig.maxOutputTokens}</span>
              </Label>
              {geminiConfig.maxOutputTokens === DEFAULTS.maxOutputTokens && (
                <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-maxout">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => onConfigChange('maxOutputTokens', DEFAULTS.maxOutputTokens)}>Reset</button>
              <Tooltip id="tip-maxout" place="right" content="Max tokens générés. Reco : 1024" />
            </div>
            <Input
              id="gemini-maxoutput"
              type="number"
              min={64}
              max={4096}
              value={geminiConfig.maxOutputTokens ?? 1024}
              onChange={e => onConfigChange('maxOutputTokens', Number(e.target.value))}
              className="mt-1 w-20 text-xs"
            />
            {(geminiConfig.maxOutputTokens ?? 1024) > 4096 && (
              <div className="mt-1 text-[10px] text-red-600 flex items-center gap-1 animate-fadeIn">
                <span className="font-bold">⚠️</span>
                Max 4096 tokens.
              </div>
            )}
          </div>
          {/* stopSequences */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="gemini-stopseq" className="text-xs">stopSeq</Label>
              {Array.isArray(geminiConfig.stopSequences) && geminiConfig.stopSequences.length === 0 && (
                <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-stopseq">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => onConfigChange('stopSequences', DEFAULTS.stopSequences)}>Reset</button>
              <Tooltip id="tip-stopseq" place="right" content="Séquences d'arrêt. Ex: END,STOP" />
            </div>
            <Input
              id="gemini-stopseq"
              type="text"
              value={geminiConfig.stopSequences?.join(',') ?? ''}
              onChange={e => onConfigChange('stopSequences', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Ex: END,STOP"
              className="mt-1 text-xs"
            />
            <div className="text-[10px] text-muted-foreground mt-0.5">Séparez par virgule</div>
          </div>
          {/* candidateCount */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="gemini-candidates" className="text-xs">candidates
                <span className="font-mono ml-1">{geminiConfig.candidateCount}</span>
              </Label>
              {geminiConfig.candidateCount === DEFAULTS.candidateCount && (
                <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-cand">
                <Info className="w-3 h-3" />
              </button>
              <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => onConfigChange('candidateCount', DEFAULTS.candidateCount)}>Reset</button>
              <Tooltip id="tip-cand" place="right" content="Nombre de réponses générées. Reco : 1" />
            </div>
            <Input
              id="gemini-candidates"
              type="number"
              min={1}
              max={8}
              value={geminiConfig.candidateCount ?? 1}
              onChange={e => onConfigChange('candidateCount', Number(e.target.value))}
              className="mt-1 w-20 text-xs"
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