import React from 'react';
import { X, PlusCircle, History, Brain, Shield, Baby, Database, Globe, Settings2, Sparkles, BookOpen, HelpCircle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { TileButton } from './HeaderButtons';


interface MobileMenuSheetProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  closeMobileMenu: () => void;
  handleMenuAction: (action: () => void) => () => void;
  modeEnfant?: boolean;
  modePrive: boolean;
  handlePrivateModeToggle: () => void;
  handleChildModeToggle: () => void;
  ragEnabled: boolean;
  handleRagToggle: () => void;
  webEnabled?: boolean;
  handleWebToggle: () => void;
  onOpenTTSSettings: () => void;
  onOpenGeminiSettings?: () => void;
  onOpenRagDocs: () => void;
  autoVoiceConfig?: { silenceMs: number; minChars: number; minWords: number; cooldownMs: number };
  onUpdateAutoVoiceConfig?: (key: 'silenceMs' | 'minChars' | 'minWords' | 'cooldownMs', value: number) => void;
  onOpenChildPinSettings?: () => void;
  toggleTheme: () => void;
  theme: string;
  setShowHelpModal: (show: boolean) => void;
  onChangeProvider?: (p: 'gemini' | 'openai' | 'mistral') => void;
  provider?: 'gemini' | 'openai' | 'mistral';
  setShowVocalSettings: (show: boolean) => void;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = React.memo(({
  showMobileMenu,
  setShowMobileMenu,
  closeMobileMenu,
  handleMenuAction,
  modeEnfant,
  modePrive,
  handlePrivateModeToggle,
  handleChildModeToggle,
  ragEnabled,
  handleRagToggle,
  webEnabled,
  handleWebToggle,
  onOpenTTSSettings,
  onOpenGeminiSettings,
  onOpenRagDocs,
  autoVoiceConfig,
  onUpdateAutoVoiceConfig,
  onOpenChildPinSettings,
  toggleTheme,
  theme,
  setShowHelpModal,
  onChangeProvider,
  provider,
  setShowVocalSettings
}) => (
  <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
    <SheetContent side="right" className="p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/50 shadow-2xl w-[95vw] max-w-[480px] sm:w-[420px]">
      <SheetHeader className="p-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Menu Principal
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">Navigation et réglages</p>
          </div>
          <Button variant="ghost" size="sm" onClick={closeMobileMenu} className="h-8 w-8 p-0 rounded-xl" aria-label="Fermer">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </SheetHeader>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Section: Actions Principales */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide">Actions</span>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              <TileButton
                onClick={handleMenuAction(() => {})}
                label={'Nouveau'}
                icon={PlusCircle}
                tooltip="Démarrer une nouvelle conversation"
              />
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(() => {})}
                  label={'Historique'}
                  icon={History}
                  tooltip="Consulter les conversations passées"
                />
              )}
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(() => {})}
                  label={'Mémoire'}
                  icon={Brain}
                  tooltip="Gérer les informations mémorisées"
                />
              )}
            </div>
          </div>



          {/* Section: Modes et Fonctionnalités */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide">Modes & IA</span>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(handlePrivateModeToggle)}
                  label={modePrive ? 'Privé: ON' : 'Privé: OFF'}
                  icon={Shield}
                  active={modePrive}
                  intent={modePrive ? 'danger' : 'default'}
                  tooltip="Mode privé"
                />
              )}

              <TileButton
                onClick={handleMenuAction(handleChildModeToggle)}
                label={modeEnfant ? 'Enfant: ON' : 'Enfant: OFF'}
                icon={Baby}
                active={!!modeEnfant}
                intent={modeEnfant ? 'info' : 'default'}
                tooltip="Mode enfant"
              />
            
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(handleRagToggle)}
                  label={ragEnabled ? 'RAG: ON' : 'RAG: OFF'}
                  icon={Database}
                  active={ragEnabled}
                  intent={ragEnabled ? 'success' : 'default'}
                  tooltip="Recherche documentaire"
                />
              )}

              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(handleWebToggle)}
                  label={webEnabled ? 'Web: ON' : 'Web: OFF'}
                  icon={Globe}
                  active={!!webEnabled}
                  intent={webEnabled ? 'warning' : 'default'}
                  tooltip="Recherche web"
                />
              )}
            </div>
          </div>

          <div className="border-t border-slate-200/60 dark:border-slate-800/60" />

          {/* Section: Paramètres et Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <Settings2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide">Configuration</span>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(onOpenTTSSettings)}
                  label={'Synthèse'}
                  icon={Settings2}
                  tooltip="Synthèse vocale"
                />
              )}
              
              {!modeEnfant && onOpenGeminiSettings && (
                <TileButton
                  onClick={handleMenuAction(onOpenGeminiSettings)}
                  label={'Gemini'}
                  icon={Sparkles}
                  tooltip="Réglages Gemini"
                />
              )}
              
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(() => document.dispatchEvent(new CustomEvent('openai:settings:open') as any))}
                  label={'OpenAI'}
                  icon={Brain}
                  tooltip="Réglages OpenAI"
                />
              )}
              
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(() => document.dispatchEvent(new CustomEvent('mistral:settings:open') as any))}
                  label={'Mistral'}
                  icon={Sparkles}
                  tooltip="Réglages Mistral"
                />
              )}
              
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(onOpenRagDocs)}
                  label={'Docs RAG'}
                  icon={BookOpen}
                  tooltip="Documents RAG"
                />
              )}
              
              {!modeEnfant && autoVoiceConfig && onUpdateAutoVoiceConfig && (
                <TileButton
                  onClick={() => setShowVocalSettings(true)}
                  label={'Vocal réglages'}
                  icon={Settings2}
                  tooltip="Ouvrir les réglages du mode vocal"
                />
              )}
              
              {onOpenChildPinSettings && (
                <TileButton
                  onClick={handleMenuAction(onOpenChildPinSettings)}
                  label={'PIN enfant'}
                  icon={Settings2}
                  tooltip="PIN mode enfant"
                />
              )}
              
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(toggleTheme)}
                  label={theme === 'dark' ? 'Clair' : 'Sombre'}
                  icon={theme === 'dark' ? Sun : Moon}
                  tooltip={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                />
              )}
              
              <TileButton
                onClick={handleMenuAction(() => setShowHelpModal(true))}
                label={'Aide'}
                icon={HelpCircle}
                tooltip="Besoin d'aide ? Consultez la documentation complète"
              />
            </div>
          </div>

          {/* Sélecteur de provider IA - Version mobile optimisée */}
          {!modeEnfant && onChangeProvider && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">IA Provider</span>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={provider === 'gemini' ? 'default' : 'ghost'}
                    className="h-10 rounded-lg text-xs font-medium"
                    onClick={handleMenuAction(() => onChangeProvider('gemini'))}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Gemini</span>
                    </div>
                  </Button>
                  <Button
                    variant={provider === 'openai' ? 'default' : 'ghost'}
                    className="h-10 rounded-lg text-xs font-medium"
                    onClick={handleMenuAction(() => onChangeProvider('openai'))}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Brain className="w-4 h-4" />
                      <span>OpenAI</span>
                    </div>
                  </Button>
                  <Button
                    variant={provider === 'mistral' ? 'default' : 'ghost'}
                    className="h-10 rounded-lg text-xs font-medium"
                    onClick={handleMenuAction(() => onChangeProvider('mistral'))}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Mistral</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Réglages OpenAI spécifiques */}
          {!modeEnfant && provider === 'openai' && (
            <Button
              variant="ghost"
              className="w-full justify-start h-12 rounded-xl text-left font-medium hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-200"
              onClick={handleMenuAction(() => document.dispatchEvent(new CustomEvent('openai:settings:open')))}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium">Réglages OpenAI</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Configuration du modèle IA</div>
                </div>
              </div>
            </Button>
          )}
        </div>
      </div>
    </SheetContent>
  </Sheet>
));

MobileMenuSheet.displayName = 'MobileMenuSheet';
