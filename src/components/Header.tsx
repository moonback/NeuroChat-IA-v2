import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, 
  PlusCircle, Mic, Brain, Shield, BookOpen, CheckSquare, Square, 
  Trash2, Menu, X, Wifi, WifiOff, Baby
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

// =====================
// Types améliorés
// =====================
interface HeaderProps {
  muted: boolean;
  onMute: () => void;
  onUnmute: () => void;
  onNewDiscussion: () => void;
  onOpenHistory: () => void;
  onOpenTTSSettings: () => void;
  onOpenRagDocs: () => void;
  onOpenMemory: () => void;
  stop: () => void;
  modeVocalAuto: boolean;
  setModeVocalAuto: (v: boolean) => void;
  hasActiveConversation: boolean;
  ragEnabled: boolean;
  setRagEnabled: (v: boolean) => void;
  // Nouveau: recherche web
  webEnabled?: boolean;
  setWebEnabled?: (v: boolean) => void;
  onOpenGeminiSettings?: () => void;
  geminiConfig?: any;
  provider?: 'gemini' | 'openai';
  onChangeProvider?: (p: 'gemini' | 'openai') => void;
  modePrive: boolean;
  setModePrive: (v: boolean) => void;
  modeEnfant?: boolean;
  onToggleModeEnfant?: () => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRequestDelete: () => void;
  showConfirmDelete: boolean;
  setShowConfirmDelete: (open: boolean) => void;
  onDeleteConfirmed: () => void;
  onOpenChildPinSettings?: () => void;
}

// =====================
// Hooks personnalisés
// =====================
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

const usePrivateModeFeedback = (modePrive: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!modePrive) return;

    // Audio feedback
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (autoplay restrictions)
      });
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, [modePrive]);

  return audioRef;
};

// =====================
// Sous-composants
// =====================
const StatusIndicator = ({ isOnline }: { isOnline: boolean }) => (
  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
      {isOnline && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
    </div>
  </div>
);

const Logo = ({ onNewDiscussion, isOnline }: { onNewDiscussion: () => void; isOnline: boolean }) => (
  <div className="flex items-center gap-3 cursor-pointer group" onClick={onNewDiscussion}>
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <MessageCircle className="w-5 h-5 text-white" />
      </div>
      <StatusIndicator isOnline={isOnline} />
    </div>
    <div className="hidden sm:block">
      <h1 className="text-[1.35rem] sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900/90 to-slate-600/80 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
        NeuroChat
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            Connecté
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            Hors ligne
          </>
        )}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ 
  active, 
  icon: Icon, 
  tooltip, 
  color 
}: { 
  active: boolean;
  icon: any;
  tooltip: string;
  color: 'red' | 'green' | 'blue';
}) => {
  if (!active) return null;

  const colorClasses = {
    red: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400'
  };

  return (
    <div
      className={`w-6 h-6 rounded-full border flex items-center justify-center shadow-sm ${colorClasses[color]}`}
      data-tooltip-id="header-tooltip"
      data-tooltip-content={tooltip}
    >
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

const ActionButton = ({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  ...props 
}: any) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    data-tooltip-id="header-tooltip"
    data-tooltip-content={tooltip}
    className={`h-9 px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${className}`}
    {...props}
  >
    {children}
  </Button>
);

const IconButton = ({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  ...props 
}: any) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    data-tooltip-id="header-tooltip"
    data-tooltip-content={tooltip}
    className={`h-8 w-8 p-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${className}`}
    {...props}
  >
    {children}
  </Button>
);

const ButtonGroup = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 p-1 shadow-sm ${className}`}>
    {children}
  </div>
);

// =====================
// Composant principal amélioré
// =====================
export function Header(props: HeaderProps) {
  const {
    muted, onMute, onUnmute, onNewDiscussion, onOpenHistory, onOpenTTSSettings,
    onOpenRagDocs, onOpenMemory, modeVocalAuto, setModeVocalAuto,
    hasActiveConversation, ragEnabled, setRagEnabled, onOpenGeminiSettings,
    webEnabled, setWebEnabled,
    provider, onChangeProvider, modePrive, setModePrive, selectMode,
    onToggleSelectMode, selectedCount, totalCount, onSelectAll, onDeselectAll,
    onRequestDelete, showConfirmDelete, setShowConfirmDelete, onDeleteConfirmed
  } = props;

  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const audioRef = usePrivateModeFeedback(modePrive);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mémoisation des handlers pour éviter les re-renders inutiles
  const handleVolumeToggle = useCallback(() => {
    muted ? onUnmute() : onMute();
  }, [muted, onMute, onUnmute]);

  const handleModeVocalToggle = useCallback(() => {
    setModeVocalAuto(!modeVocalAuto);
  }, [modeVocalAuto, setModeVocalAuto]);

  const handlePrivateModeToggle = useCallback(() => {
    setModePrive(!modePrive);
  }, [modePrive, setModePrive]);

  const handleRagToggle = useCallback(() => {
    setRagEnabled(!ragEnabled);
  }, [ragEnabled, setRagEnabled]);

  const handleWebToggle = useCallback(() => {
    if (setWebEnabled) setWebEnabled(!webEnabled);
  }, [webEnabled, setWebEnabled]);

  const handleChildModeToggle = useCallback(() => {
    props.onToggleModeEnfant?.();
  }, [props.onToggleModeEnfant]);

  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  // Actions combinées pour le menu mobile
  const handleMenuAction = useCallback((action: () => void) => {
    return () => {
      action();
      closeMobileMenu();
    };
  }, [closeMobileMenu]);

  // Mémoisation des composants coûteux
  const selectionActions = useMemo(() => {
    if (!hasActiveConversation) return null;

    return (
      <>
        <ActionButton
          variant={selectMode ? "default" : "ghost"}
          onClick={onToggleSelectMode}
          tooltip={selectMode ? 'Quitter la sélection' : 'Sélectionner des messages'}
        >
          {selectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
          {selectMode ? 'Annuler' : 'Sélectionner'}
        </ActionButton>

        {selectMode && (
          <>
            <ActionButton
              onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
              tooltip={selectedCount === totalCount ? 'Tout désélectionner' : 'Tout sélectionner'}
            >
              {selectedCount === totalCount ? 'Désélectionner tout' : 'Tout sélectionner'}
            </ActionButton>

            {selectedCount > 0 && (
              <ActionButton
                variant="destructive"
                onClick={onRequestDelete}
                tooltip={`Supprimer ${selectedCount} message${selectedCount > 1 ? 's' : ''}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ({selectedCount})
              </ActionButton>
            )}
          </>
        )}
      </>
    );
  }, [hasActiveConversation, selectMode, selectedCount, totalCount, onToggleSelectMode, onSelectAll, onDeselectAll, onRequestDelete]);

  const mobileMenuActions = useMemo(() => (
    <div className="md:hidden space-y-2">
      <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onNewDiscussion)}>
        <PlusCircle className="w-4 h-4 mr-3" />
        Nouvelle discussion
      </Button>
      {!props.modeEnfant && (
      <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onOpenHistory)}>
        <History className="w-4 h-4 mr-3" />
        Historique
      </Button>
      )}
      {!props.modeEnfant && (
      <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onOpenMemory)}>
        <Brain className="w-4 h-4 mr-3" />
        Mémoire
      </Button>
      )}
      
      {hasActiveConversation && (
        <>
          <div className="border-t border-slate-200 dark:border-slate-800 my-3" />
          <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onToggleSelectMode)}>
            {selectMode ? <CheckSquare className="w-4 h-4 mr-3" /> : <Square className="w-4 h-4 mr-3" />}
            {selectMode ? 'Annuler sélection' : 'Sélectionner messages'}
          </Button>
          {selectMode && selectedCount > 0 && (
            <Button variant="destructive" className="w-full justify-start h-10" onClick={handleMenuAction(onRequestDelete)}>
              <Trash2 className="w-4 h-4 mr-3" />
              Supprimer sélection ({selectedCount})
            </Button>
          )}
        </>
      )}
      
      <div className="border-t border-slate-200 dark:border-slate-800 my-3" />
      
      {!props.modeEnfant && (
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(handlePrivateModeToggle)}>
          <Shield className="w-4 h-4 mr-3" />
          {modePrive ? 'Désactiver mode privé' : 'Activer mode privé'}
        </Button>
      )}
      <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(handleChildModeToggle)}>
        <Baby className="w-4 h-4 mr-3" />
        {props.modeEnfant ? 'Désactiver mode enfant' : 'Activer mode enfant'}
      </Button>
      
      {!props.modeEnfant && (
      <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(handleRagToggle)}>
        <Brain className="w-4 h-4 mr-3" />
        {ragEnabled ? 'Désactiver RAG' : 'Activer RAG'}
      </Button>
      )}
      {!props.modeEnfant && (
      <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(handleWebToggle)}>
        <Wifi className="w-4 h-4 mr-3" />
        {webEnabled ? 'Désactiver recherche web' : 'Activer recherche web'}
      </Button>
      )}
      
      <div className="border-t border-slate-200 dark:border-slate-800 my-3" />
    </div>
  ), [hasActiveConversation, selectMode, selectedCount, modePrive, ragEnabled, props.modeEnfant, handleMenuAction, onNewDiscussion, onOpenHistory, onOpenMemory, onToggleSelectMode, onRequestDelete, handlePrivateModeToggle, handleChildModeToggle, handleRagToggle]);

  return (
    <header className="w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
      {/* Audio bip premium */}
      <audio ref={audioRef} preload="auto">
        <source src="/bip2.mp3" type="audio/mpeg" />
        <source src="/bip2.ogg" type="audio/ogg" />
      </audio>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et branding */}
          <div className="flex items-center gap-4">
            <Logo onNewDiscussion={onNewDiscussion} isOnline={isOnline} />

            {/* Indicateurs de statut - Desktop uniquement */}
            <div className="hidden lg:flex items-center gap-2">
              <StatusBadge active={modePrive && !props.modeEnfant} icon={Shield} tooltip="Mode privé activé" color="red" />
              <StatusBadge active={!!props.modeEnfant} icon={Baby} tooltip="Mode enfant activé" color="blue" />
              <StatusBadge active={ragEnabled} icon={Brain} tooltip="RAG actif" color="green" />
              <StatusBadge active={!!webEnabled} icon={Wifi} tooltip="Recherche web active" color="blue" />
              <StatusBadge active={modeVocalAuto} icon={Mic} tooltip="Mode vocal automatique" color="blue" />
            </div>

            {/* Indicateurs mobiles compacts */}
            {ragEnabled && (
              <div className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <Brain className="w-3.5 h-3.5" /> RAG
              </div>
            )}
            {webEnabled && (
              <div className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <Wifi className="w-3.5 h-3.5" /> Web
              </div>
            )}
          </div>

          {/* Actions principales - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Actions principales */}
            <ActionButton onClick={onNewDiscussion} tooltip="Nouvelle discussion">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nouveau
            </ActionButton>

            <ActionButton onClick={onOpenHistory} tooltip="Voir l'historique">
              <History className="w-4 h-4 mr-2" />
              Historique
            </ActionButton>

            {!props.modeEnfant && (
              <ActionButton onClick={onOpenMemory} tooltip="Ouvrir la mémoire">
                <Brain className="w-4 h-4 mr-2" />
                Mémoire
              </ActionButton>
            )}

            {/* Actions de sélection */}
            {selectionActions}

            {/* Contrôles vocaux */}
            <ButtonGroup>
              <IconButton
                onClick={handleVolumeToggle}
                tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
                className={muted
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50'
                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 animate-pulse'
                }
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </IconButton>

              {!props.modeEnfant && (
                <IconButton
                  variant={modeVocalAuto ? 'default' : 'ghost'}
                  onClick={handleModeVocalToggle}
                  tooltip="Mode vocal automatique"
                  className={modeVocalAuto 
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-400/30 animate-pulse' 
                    : ''
                  }
                >
                  <Mic className="w-4 h-4" />
                </IconButton>
              )}
            </ButtonGroup>

            {/* Modes IA */}
            <ButtonGroup>
              {!props.modeEnfant && (
                <IconButton
                  variant={modePrive ? 'destructive' : 'ghost'}
                  onClick={handlePrivateModeToggle}
                  tooltip="Mode privé"
                >
                  <Shield className="w-4 h-4" />
                </IconButton>
              )}
              <IconButton
                variant={props.modeEnfant ? 'default' : 'ghost'}
                onClick={handleChildModeToggle}
                tooltip="Mode enfant"
              >
                <Baby className="w-4 h-4" />
              </IconButton>
              
              {!props.modeEnfant && (
                <IconButton
                  variant={ragEnabled ? 'default' : 'ghost'}
                  onClick={handleRagToggle}
                  tooltip="Recherche documentaire (RAG)"
                >
                  <Brain className="w-4 h-4" />
                </IconButton>
              )}
              {!props.modeEnfant && (
                <IconButton
                  variant={webEnabled ? 'default' : 'ghost'}
                  onClick={handleWebToggle}
                  tooltip="Recherche web"
                >
                  <Wifi className="w-4 h-4" />
                </IconButton>
              )}
            </ButtonGroup>

            {/* Réglages */}
            {!props.modeEnfant && (
              <ButtonGroup>
                <IconButton
                  onClick={toggleTheme}
                  tooltip={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </IconButton>

                <IconButton
                  onClick={() => setShowMobileMenu(true)}
                  tooltip="Plus d'options"
                >
                  <Settings2 className="w-4 h-4" />
                </IconButton>
              </ButtonGroup>
            )}
          </div>

          {/* Menu mobile button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Menu mobile/options */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="max-w-sm mx-auto p-0 bg-white dark:bg-slate-950 rounded-2xl border shadow-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Menu options</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Options</h2>
              <Button variant="ghost" size="sm" onClick={closeMobileMenu} className="h-8 w-8 p-0" aria-label="Fermer">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {props.modeEnfant ? (
                <div className="md:hidden space-y-2">
                  <Button
                    variant="destructive"
                    className="w-full justify-start h-10"
                    onClick={handleMenuAction(handleChildModeToggle)}
                  >
                    <Baby className="w-4 h-4 mr-3" />
                    Désactiver mode enfant
                  </Button>
                </div>
              ) : (
                mobileMenuActions
              )}

              {/* Options toujours visibles */}
              {!props.modeEnfant && (
                <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onOpenTTSSettings)}>
                  <Settings2 className="w-4 h-4 mr-3" />
                  Réglages synthèse vocale
                </Button>
              )}

              {!props.modeEnfant && (
                <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onOpenRagDocs)}>
                  <BookOpen className="w-4 h-4 mr-3" />
                  Documents RAG
                </Button>
              )}

              {!props.modeEnfant && props.onOpenChildPinSettings && (
                <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(props.onOpenChildPinSettings)}>
                  <Settings2 className="w-4 h-4 mr-3" />
                  Changer le PIN (mode enfant)
                </Button>
              )}

              {/* Sélecteur de provider IA */}
              {!props.modeEnfant && onChangeProvider && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={provider === 'gemini' ? 'default' : 'ghost'}
                    className="flex-1 h-10"
                    onClick={handleMenuAction(() => onChangeProvider('gemini'))}
                  >
                    Gemini
                  </Button>
                  <Button
                    variant={provider === 'openai' ? 'default' : 'ghost'}
                    className="flex-1 h-10"
                    onClick={handleMenuAction(() => onChangeProvider('openai'))}
                  >
                    OpenAI
                  </Button>
                </div>
              )}

              {!props.modeEnfant && onOpenGeminiSettings && provider === 'gemini' && (
                <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(onOpenGeminiSettings)}>
                  <Settings2 className="w-4 h-4 mr-3" />
                  Réglages Gemini
                </Button>
              )}

              {!props.modeEnfant && provider === 'openai' && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10"
                  onClick={handleMenuAction(() => document.dispatchEvent(new CustomEvent('openai:settings:open')))}
                >
                  <Settings2 className="w-4 h-4 mr-3" />
                  Réglages OpenAI
                </Button>
              )}

              <Button variant="ghost" className="w-full justify-start h-10" onClick={handleMenuAction(toggleTheme)}>
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog pour la confirmation de suppression */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {selectedCount} message{selectedCount > 1 ? 's' : ''} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les messages sélectionnés seront définitivement supprimés de la conversation et de l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirmed} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReactTooltip 
        id="header-tooltip" 
        place="bottom" 
        className="!bg-slate-900 !text-white !text-xs !px-2 !py-1 !rounded-lg !shadow-lg !z-50" 
      />
    </header>
  );
}