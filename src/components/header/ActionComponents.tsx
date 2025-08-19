import React from 'react';
import { PlusCircle, History, Brain, Volume2, VolumeX, Mic, Shield, Baby, Database, Globe, Settings2 } from 'lucide-react';
import { ActionButton, IconButton, ButtonGroup } from './HeaderButtons';





interface MobileActionsProps {
  modeEnfant?: boolean;
  muted: boolean;
  onNewDiscussion: () => void;
  handleVolumeToggle: () => void;
  setShowMobileMenu: (show: boolean) => void;
}

export const MobileActions: React.FC<MobileActionsProps> = React.memo(({ 
  muted, 
  onNewDiscussion, 
  handleVolumeToggle, 
  setShowMobileMenu 
}) => (
  <div className="md:hidden flex items-center gap-1 mobile-optimized">
    {/* Barre d'actions mobile ultra-optimisée */}
    <div className="flex items-center gap-1 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-1 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-mobile">
      {/* Bouton Nouveau - Priorité haute */}
      <IconButton 
        onClick={onNewDiscussion} 
        tooltip="Nouvelle discussion" 
        className="h-8 w-8 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 mobile-button transition-smooth"
        aria-label="Nouvelle discussion"
      >
        <PlusCircle className="w-4 h-4" />
      </IconButton>
      
      {/* Contrôle audio - Priorité haute */}
      <IconButton
        onClick={handleVolumeToggle}
        tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
        active={!muted}
        className={`h-8 w-8 rounded-xl mobile-button transition-smooth ${
          muted
            ? 'bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100/80 dark:hover:bg-red-900/60'
            : 'bg-green-50/80 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100/80 dark:hover:bg-green-900/60'
        }`}
        aria-label={muted ? 'Activer audio' : 'Désactiver audio'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </IconButton>
    </div>

    {/* Bouton menu principal - Accès aux options avancées */}
    <IconButton
      onClick={() => setShowMobileMenu(true)}
      tooltip="Menu principal"
      className="h-9 w-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 transition-smooth hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 mobile-button"
      aria-label="Menu principal"
    >
      <Settings2 className="w-5 h-5" />
    </IconButton>
  </div>
));

MobileActions.displayName = 'MobileActions';

interface DesktopActionsProps {
  modeEnfant?: boolean;
  onNewDiscussion: () => void;
  onOpenHistory: () => void;
  onOpenMemory: () => void;
  muted: boolean;
  handleVolumeToggle: () => void;
  handleModeVocalToggle: () => void;
  modePrive: boolean;
  handlePrivateModeToggle: () => void;
  handleChildModeToggle: () => void;
  ragEnabled: boolean;
  handleRagToggle: () => void;
  webEnabled?: boolean;
  handleWebToggle: () => void;
  webSearching?: boolean;
  setShowMobileMenu: (show: boolean) => void;
}

export const DesktopActions: React.FC<DesktopActionsProps> = React.memo(({ 
  modeEnfant, 
  onNewDiscussion, 
  onOpenHistory, 
  onOpenMemory, 
  muted, 
  handleVolumeToggle, 
  handleModeVocalToggle, 
  modePrive, 
  handlePrivateModeToggle, 
  handleChildModeToggle, 
  ragEnabled, 
  handleRagToggle, 
  webEnabled, 
  handleWebToggle, 
  webSearching, 
  setShowMobileMenu 
}) => (
  <div className="hidden md:flex items-center gap-3">
    {/* Actions de base */}
    <div className="flex items-center gap-2">
      <ActionButton onClick={onNewDiscussion} tooltip="Nouvelle discussion" aria-label="Nouvelle discussion">
        <PlusCircle className="w-4 h-4 mr-2" />
        Nouveau
      </ActionButton>

      {!modeEnfant && (
        <ButtonGroup>
          <IconButton onClick={onOpenHistory} tooltip="Historique" aria-label="Historique">
            <History className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onOpenMemory} tooltip="Mémoire" aria-label="Mémoire">
            <Brain className="w-4 h-4" />
          </IconButton>
        </ButtonGroup>
      )}
    </div>



    {/* Contrôles vocaux modernisés */}
    <ButtonGroup>
      <IconButton
        onClick={handleVolumeToggle}
        tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
        active={!muted}
        className={muted
          ? 'text-red-600 hover:bg-red-50/80 dark:hover:bg-red-950/50'
          : 'text-green-600 hover:bg-green-50/80 dark:hover:bg-green-950/50'
        }
        aria-label={muted ? 'Activer audio' : 'Désactiver audio'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </IconButton>

      {!modeEnfant && (
        <IconButton
          onClick={handleModeVocalToggle}
          tooltip="Mode vocal automatique"
          active={false}
          aria-label="Mode vocal automatique"
        >
          <Mic className="w-4 h-4" />
        </IconButton>
      )}
    </ButtonGroup>

    {/* Modes IA modernisés */}
    <ButtonGroup>
      {!modeEnfant && (
        <IconButton
          onClick={handlePrivateModeToggle}
          tooltip="Mode privé"
          active={modePrive}
          className={modePrive 
            ? 'text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40' 
            : 'hover:bg-red-50/80 dark:hover:bg-red-950/50'
          }
          aria-label="Mode privé"
        >
          <Shield className="w-4 h-4" />
        </IconButton>
      )}

      <IconButton
        onClick={handleChildModeToggle}
        tooltip="Mode enfant"
        active={!!modeEnfant}
        aria-label="Mode enfant"
      >
        <Baby className="w-4 h-4" />
      </IconButton>

      {!modeEnfant && (
        <>
          <IconButton
            onClick={handleRagToggle}
            tooltip="Recherche documentaire (RAG)"
            active={ragEnabled}
            aria-label="Recherche documentaire (RAG)"
          >
            <Database className="w-4 h-4" />
          </IconButton>

          <IconButton
            onClick={handleWebToggle}
            tooltip="Recherche web"
            active={!!webEnabled}
            aria-label="Recherche web"
          >
            <Globe className={`w-4 h-4 ${webSearching ? 'animate-spin' : ''}`} />
          </IconButton>
        </>
      )}
    </ButtonGroup>

    {/* Réglages */}
    {!modeEnfant && (
      <ButtonGroup>
        {/* Badge de sécurité permanent (non désactivable) */}
        {!modeEnfant && !modePrive && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50/80 dark:bg-green-950/40 text-green-600 dark:text-green-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold">AES-256</span>
          </div>
        )}

        <IconButton
          onClick={() => setShowMobileMenu(true)}
          tooltip="Plus d'options"
          aria-label="Plus d'options"
        >
          <Settings2 className="w-4 h-4" />
        </IconButton>
      </ButtonGroup>
    )}
  </div>
));

DesktopActions.displayName = 'DesktopActions';
