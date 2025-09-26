import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Sliders, X, Bot } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { OpenAIGenerationConfig } from '@/services/openaiApi';

interface OpenAISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openaiConfig: OpenAIGenerationConfig;
  onConfigChange: (key: keyof OpenAIGenerationConfig, value: unknown) => void;
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

export const OpenAISettingsModal: React.FC<OpenAISettingsModalProps> = ({
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
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
      <DialogHeader className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Réglages OpenAI
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Ajustez le comportement du modèle OpenAI
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
          <div className="space-y-6">
            {/* Heuristiques automatiques Web/RAG */}
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 shadow-sm">
              <div className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Heuristiques automatiques
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input id="auto-rag-oai" type="checkbox" checked={!!autoRagEnabled} onChange={() => onToggleAutoRag?.(!autoRagEnabled)} />
                  <Label htmlFor="auto-rag-oai" className="text-sm">Activer RAG auto</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="auto-web-oai" type="checkbox" checked={!!autoWebEnabled} onChange={() => onToggleAutoWeb?.(!autoWebEnabled)} />
                  <Label htmlFor="auto-web-oai" className="text-sm">Activer Web auto</Label>
                </div>
                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="rag-kw-oai" className="text-sm">Mots-clés RAG (séparés par virgule)</Label>
                  <Input id="rag-kw-oai" type="text" value={(ragKeywords || []).join(', ')} onChange={e => onChangeRagKeywords?.(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="doc, pdf, rapport, mémoire" className="mt-1" />
                </div>
                <div className="col-span-1 md:col-span-1">
                  <Label htmlFor="web-kw-oai" className="text-sm">Mots-clés Web (séparés par virgule)</Label>
                  <Input id="web-kw-oai" type="text" value={(webKeywords || []).join(', ')} onChange={e => onChangeWebKeywords?.(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="aujourd'hui, actualité, prix, version" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Température */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Label htmlFor="openai-temperature" className="text-sm font-medium">Température
                    <span className="font-mono ml-1 text-emerald-600">{(openaiConfig.temperature ?? DEFAULTS.temperature).toFixed(2)}</span>
                  </Label>
                  {openaiConfig.temperature === DEFAULTS.temperature && (
                    <Badge variant="secondary" className="text-xs">défaut</Badge>
                  )}
                  <button type="button" className="text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-temp">
                    <Info className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-xs text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded" onClick={() => onConfigChange('temperature', DEFAULTS.temperature)}>Reset</button>
                  <Tooltip id="tip-openai-temp" place="right" content="0 = déterministe, 2 = créatif. Reco : 0.7" />
                </div>
                <Slider
                  id="openai-temperature"
                  min={0}
                  max={2}
                  step={0.01}
                  value={[openaiConfig.temperature ?? DEFAULTS.temperature]}
                  onValueChange={([v]) => onConfigChange('temperature', v)}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Déterministe</span>
                  <span>Créatif</span>
                </div>
              </div>

              {/* top_p */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Label htmlFor="openai-topp" className="text-sm font-medium">top_p
                    <span className="font-mono ml-1 text-emerald-600">{(openaiConfig.top_p ?? DEFAULTS.top_p).toFixed(2)}</span>
                  </Label>
                  {openaiConfig.top_p === DEFAULTS.top_p && (
                    <Badge variant="secondary" className="text-xs">défaut</Badge>
                  )}
                  <button type="button" className="text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-topp">
                    <Info className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-xs text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded" onClick={() => onConfigChange('top_p', DEFAULTS.top_p)}>Reset</button>
                  <Tooltip id="tip-openai-topp" place="right" content="Probabilité cumulative. 1 = diversité. Reco : 0.95" />
                </div>
                <Slider
                  id="openai-topp"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[openaiConfig.top_p ?? DEFAULTS.top_p]}
                  onValueChange={([v]) => onConfigChange('top_p', v)}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Moins varié</span>
                  <span>Plus varié</span>
                </div>
              </div>

              {/* max_tokens */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Label htmlFor="openai-maxtokens" className="text-sm font-medium">max_tokens
                    <span className="font-mono ml-1 text-emerald-600">{openaiConfig.max_tokens ?? DEFAULTS.max_tokens}</span>
                  </Label>
                  {openaiConfig.max_tokens === DEFAULTS.max_tokens && (
                    <Badge variant="secondary" className="text-xs">défaut</Badge>
                  )}
                  <button type="button" className="text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-maxtokens">
                    <Info className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-xs text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded" onClick={() => onConfigChange('max_tokens', DEFAULTS.max_tokens)}>Reset</button>
                  <Tooltip id="tip-openai-maxtokens" place="right" content="Max tokens générés. Reco : 4096" />
                </div>
                <Input
                  id="openai-maxtokens"
                  type="number"
                  min={64}
                  max={16384}
                  value={openaiConfig.max_tokens ?? DEFAULTS.max_tokens}
                  onChange={e => onConfigChange('max_tokens', Number(e.target.value))}
                  className="mt-2 w-32"
                />
              </div>

              {/* model */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Label htmlFor="openai-model" className="text-sm font-medium">model</Label>
                  {openaiConfig.model === DEFAULTS.model && (
                    <Badge variant="secondary" className="text-xs">défaut</Badge>
                  )}
                  <button type="button" className="text-emerald-600 hover:text-emerald-800" data-tooltip-id="tip-openai-model">
                    <Info className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-xs text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded" onClick={() => onConfigChange('model', DEFAULTS.model)}>Reset</button>
                  <Tooltip id="tip-openai-model" place="right" content="Nom du modèle (ex: gpt-4o-mini, gpt-4o, gpt-4.1)" />
                </div>
                <Input
                  id="openai-model"
                  type="text"
                  value={openaiConfig.model ?? DEFAULTS.model}
                  onChange={e => onConfigChange('model', e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer avec actions rapides */}
      <div className="px-6 py-4 border-t bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              OpenAI
            </Badge>
            <Badge variant="outline" className="text-xs">
              Configuration
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onReset}>
              Réinitialiser
            </Button>
            <Button size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);


