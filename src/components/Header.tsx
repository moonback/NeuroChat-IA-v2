import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useTheme } from '@/hooks/useTheme';
import {
  History, Settings2, Volume2, VolumeX, Sun, Moon, 
  Plus, Mic, Shield, BookOpen, CheckSquare, Square, 
  Trash2, Menu, X, Baby, Layers,
  Globe, Database, HelpCircle, BarChart3,
  Smartphone, Download, ChevronDown, Wifi, WifiOff
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader} from '@/components/ui/sheet';
import { UnifiedInput } from '@/components/ui/unified-input';
import { VocalAutoSettingsModal } from '@/components/VocalAutoSettingsModal';
import { HelpModal } from '@/components/HelpModal';
import { MonitoringStatusIndicator } from '@/components/MonitoringStatusIndicator';
import { SecurityPerformanceMonitor } from '@/components/SecurityPerformanceMonitor';
import { usePWA } from '@/hooks/usePWA';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

// Import des composants unifiés
import { 
  UnifiedButton, 
  UnifiedButtonGroup, 
  UnifiedModal, 
  UnifiedModalContent, 
  UnifiedModalHeader, 
  UnifiedModalTitle
} from '@/components/ui/unified';

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
  stop: () => void;
  modeVocalAuto: boolean;
  setModeVocalAuto: (v: boolean) => void;
  hasActiveConversation: boolean;
  ragEnabled: boolean;
  setRagEnabled: (v: boolean) => void;
  webEnabled?: boolean;
  setWebEnabled?: (v: boolean) => void;
  structuredMode?: boolean;
  setStructuredMode?: (v: boolean) => void;
  webSearching?: boolean;
  onOpenGeminiSettings?: () => void;
  geminiConfig?: Record<string, unknown>;
  provider?: 'gemini' | 'openai' | 'mistral';
  onChangeProvider?: (p: 'gemini' | 'openai' | 'mistral') => void;
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
  autoVoiceConfig?: { silenceMs: number; minChars: number; minWords: number; cooldownMs: number };
  onUpdateAutoVoiceConfig?: (key: 'silenceMs' | 'minChars' | 'minWords' | 'cooldownMs', value: number) => void;
  workspaceId?: string;
  workspaces?: Array<{ id: string; name: string }>;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}

// =====================
// Hooks personnalisés
// =====================
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      const start = Date.now();
      fetch('/api/ping', { method: 'HEAD' }).then(() => {
        const latency = Date.now() - start;
        setConnectionQuality(latency < 100 ? 'excellent' : latency < 300 ? 'good' : 'poor');
      }).catch(() => setConnectionQuality('poor'));
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('poor');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    handleOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionQuality };
};

const usePrivateModeFeedback = (modePrive: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPrivateIndicator, setShowPrivateIndicator] = useState(false);

  useEffect(() => {
    if (!modePrive) {
      setShowPrivateIndicator(false);
      return;
    }

    setShowPrivateIndicator(true);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    const timer = setTimeout(() => setShowPrivateIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, [modePrive]);

  return { audioRef, showPrivateIndicator };
};

// =====================
// Composants modernisés
// =====================


// Logo avec design professionnel et responsive
const Logo = ({ 
  onNewDiscussion, 
  isOnline, 
  quality 
}: { 
  onNewDiscussion: () => void; 
  isOnline: boolean; 
  quality: 'excellent' | 'good' | 'poor';
}) => (
  <div className="flex items-center gap-3">
    <div 
      className="group flex items-center gap-3 cursor-pointer" 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onNewDiscussion();
      }}
    >
      {/* Logo professionnel */}
      <div className="relative">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
          <img 
            src="/logo-p.png" 
            alt="NeuroChat" 
            className="w-6 h-6 lg:w-7 lg:h-7 object-contain brightness-0 invert"
          />
        </div>
        
        {/* Indicateur de connexion */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
            !isOnline ? 'bg-red-500' :
            quality === 'excellent' ? 'bg-emerald-500' :
            quality === 'good' ? 'bg-amber-500' : 'bg-orange-500'
          }`} />
        </div>
      </div>
      
      {/* Texte professionnel */}
      <div className="hidden sm:block">
        <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          NeuroChat-IA-v2
        </h1>
        <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium">Assistant IA Professionnel</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            {isOnline ? <Wifi className="w-3 h-3 lg:w-4 lg:h-4" /> : <WifiOff className="w-3 h-3 lg:w-4 lg:h-4" />}
            <span className="font-medium">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ModernButton remplacé par UnifiedButton - voir imports ci-dessus

// ButtonGroup remplacé par UnifiedButtonGroup - voir imports ci-dessus

// Sélecteur d'espace de travail professionnel
const WorkspaceSelector = ({ 
  modeEnfant, 
  workspaces, 
  workspaceId, 
  onChangeWorkspace, 
  onCreateWorkspace
}: {
  modeEnfant?: boolean;
  workspaces?: Array<{ id: string; name: string }>;
  workspaceId?: string;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
}) => {
  const [showModal, setShowModal] = useState(false);
  
  if (modeEnfant) return null;

  const currentWorkspace = workspaces?.find(w => w.id === workspaceId);

  return (
    <>
      {/* Version desktop professionnelle */}
      <UnifiedButton
        variant="secondary"
        size="lg"
        onClick={() => setShowModal(true)}
        className="hidden lg:flex items-center gap-3 px-4 py-3 max-w-[220px] rounded-full"
        tooltip="Gérer les espaces de travail"
        data-workspace-button
      >
        <Database className="w-5 h-5" />
        <span className="truncate font-medium">
          {currentWorkspace?.name || 'Espace par défaut'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </UnifiedButton>

      {/* Version tablette */}
      <UnifiedButton
        variant="secondary"
        size="md"
        onClick={() => setShowModal(true)}
        className="hidden md:flex lg:hidden items-center gap-2 max-w-[160px] rounded-full"
        tooltip="Changer d'espace de travail"
      >
        <Database className="w-4 h-4" />
        <span className="truncate">
          {currentWorkspace?.name || 'Espace par défaut'}
        </span>
        <ChevronDown className="w-3 h-3" />
      </UnifiedButton>

      {/* Version mobile */}
      <UnifiedButton
        variant="secondary"
        size="sm"
        onClick={() => setShowModal(true)}
        className="md:hidden flex items-center gap-1 max-w-[80px] rounded-full"
      >
        <Database className="w-4 h-4" />
        <span className="truncate text-xs">
          {currentWorkspace?.name || 'Espace'}
        </span>
      </UnifiedButton>

      {/* Modal workspace avec design unifié */}
      <UnifiedModal open={showModal} onOpenChange={setShowModal}>
        <UnifiedModalContent className="sm:max-w-md">
          <UnifiedModalHeader>
            <UnifiedModalTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Espaces de travail
            </UnifiedModalTitle>
          </UnifiedModalHeader>

          <div className="space-y-4">
            {/* Création */}
            <div className="flex gap-2">
              <UnifiedInput
                placeholder="Nouveau workspace"
                className="flex-1"
              />
              <UnifiedButton
                variant="primary"
                size="icon"
                onClick={() => {
                  onCreateWorkspace?.();
                  setShowModal(false);
                }}
              >
                <Plus className="w-4 h-4" />
              </UnifiedButton>
            </div>

            {/* Liste */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workspaces?.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`p-3 rounded-lg border transition-all ${
                    workspace.id === workspaceId
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">{workspace.name}</span>
                    <div className="flex gap-1">
                      {workspace.id !== workspaceId && (
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onChangeWorkspace?.(workspace.id);
                            setShowModal(false);
                          }}
                        >
                          Sélectionner
                        </UnifiedButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UnifiedModalContent>
      </UnifiedModal>
    </>
  );
};

// WorkspaceModal remplacé par UnifiedModal - voir ci-dessus

// Actions mobiles simplifiées avec design unifié
const MobileActions = ({ 
  muted, 
  onNewDiscussion, 
  handleVolumeToggle, 
  setShowMenu 
}: {
  muted: boolean;
  onNewDiscussion: () => void;
  handleVolumeToggle: () => void;
  setShowMenu: (show: boolean) => void;
}) => (
  <div className="md:hidden flex items-center gap-2">
    {/* Actions essentielles */}
    <UnifiedButton
      variant="primary"
      size="icon"
      onClick={onNewDiscussion}
      tooltip="Nouvelle discussion"
      className="rounded-full"
    >
      <Plus className="w-4 h-4" />
    </UnifiedButton>
    
    <UnifiedButton
      variant={muted ? "danger" : "success"}
      size="icon"
      onClick={handleVolumeToggle}
      tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
      className="rounded-full"
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </UnifiedButton>

    {/* Menu */}
    <UnifiedButton
      variant="ghost"
      size="icon"
      onClick={() => setShowMenu(true)}
      className="rounded-full"
    >
      <Menu className="w-4 h-4" />
    </UnifiedButton>
  </div>
);

// Actions desktop professionnelles et étendues
const DesktopActions = ({ 
  modeEnfant, 
  onNewDiscussion, 
  selectionActions, 
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
  structuredMode,
  handleStructuredToggle,
  setShowMenu 
}: {
  modeEnfant?: boolean;
  onNewDiscussion: () => void;
  selectionActions: React.ReactNode;
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
  structuredMode?: boolean;
  handleStructuredToggle?: () => void;
  setShowMenu: (show: boolean) => void;
}) => (
  <div
    className="hidden lg:flex items-center gap-4"
    aria-label="Actions principales de la barre d'en-tête"
  >
    {/* Nouvelle discussion - Version professionnelle */}
    <UnifiedButton
      variant="primary"
      size="lg"
      onClick={onNewDiscussion}
      tooltip="Démarrer une nouvelle discussion"
      aria-label="Démarrer une nouvelle discussion"
      className="flex items-center gap-3 px-6 py-3 font-semibold rounded-full"
    >
      <Plus className="w-5 h-5" aria-hidden="true" />
      <span>Nouvelle Discussion</span>
    </UnifiedButton>

    {selectionActions}

    {/* Contrôles audio professionnels */}
    <div className="flex items-center gap-2">
      <UnifiedButton
        variant={muted ? "danger" : "success"}
        onClick={handleVolumeToggle}
        active={!muted}
        tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
        size="lg"
        className="px-4 py-3 rounded-full"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </UnifiedButton>
      
      {!modeEnfant && (
        <UnifiedButton
          variant="secondary"
          onClick={handleModeVocalToggle}
          tooltip="Mode vocal automatique"
          size="lg"
          className="px-4 py-3 rounded-full"
        >
          <Mic className="w-5 h-5" />
        </UnifiedButton>
      )}
    </div>

    {/* Modes IA professionnels */}
    <div className="flex items-center gap-2">
      {!modeEnfant && (
        <UnifiedButton
          variant={modePrive ? "danger" : "secondary"}
          onClick={handlePrivateModeToggle}
          active={modePrive}
          tooltip="Mode privé - Données non sauvegardées"
          size="lg"
          className="px-4 py-3 rounded-full"
        >
          <Shield className="w-5 h-5" />
        </UnifiedButton>
      )}
      
      <UnifiedButton
        variant={modeEnfant ? "primary" : "secondary"}
        onClick={handleChildModeToggle}
        active={!!modeEnfant}
        tooltip="Mode enfant - Interface simplifiée"
        size="lg"
        className="px-4 py-3 rounded-full"
      >
        <Baby className="w-5 h-5" />
      </UnifiedButton>
      
      {!modeEnfant && (
        <>
          <UnifiedButton
            variant={ragEnabled ? "success" : "secondary"}
            onClick={handleRagToggle}
            active={ragEnabled}
            tooltip="RAG - Recherche dans les documents"
            size="lg"
            className="px-4 py-3 rounded-full"
          >
            <Database className="w-5 h-5" />
          </UnifiedButton>
          
          <UnifiedButton
            variant={webEnabled ? "success" : "secondary"}
            onClick={handleWebToggle}
            active={!!webEnabled}
            tooltip="Recherche web en temps réel"
            size="lg"
            className="px-4 py-3 rounded-full"
          >
            <Globe className="w-5 h-5" />
          </UnifiedButton>
          
          <UnifiedButton
            variant={structuredMode ? "success" : "secondary"}
            onClick={handleStructuredToggle}
            active={!!structuredMode}
            tooltip="Mode structuré - Réponses organisées"
            size="lg"
            className="px-4 py-3 rounded-full"
          >
            <Layers className="w-5 h-5" />
          </UnifiedButton>
        </>
      )}
    </div>

    {/* Paramètres */}
    <UnifiedButton
      variant="ghost"
      onClick={() => setShowMenu(true)}
      tooltip="Paramètres et configuration"
      size="lg"
      className="px-4 py-3 rounded-full"
    >
      <Settings2 className="w-5 h-5" />
    </UnifiedButton>
  </div>
);

// Banner mode privé simplifié
const PrivateModeBanner = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-red-600 text-white text-center py-2 shadow-lg animate-slide-down">
      <div className="flex items-center justify-center gap-2">
        <Shield className="w-4 h-4" />
        <span className="font-medium">Mode privé activé</span>
        <span className="text-red-100">•</span>
        <span className="text-sm">Données non sauvegardées</span>
      </div>
    </div>
  );
};

// =====================
// Composant principal
// =====================
export function Header(props: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { isOnline, connectionQuality } = useOnlineStatus();
  const { audioRef, showPrivateIndicator } = usePrivateModeFeedback(props.modePrive);
  const { isInstalled, isInstallable, installApp } = usePWA();
  const [showMenu, setShowMenu] = useState(false);
  const [showVocalSettings, setShowVocalSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);

  // Destructuration des props pour éviter les dépendances circulaires
  const {
    muted,
    onMute,
    onUnmute,
    modeVocalAuto,
    setModeVocalAuto,
    modePrive,
    setModePrive,
    ragEnabled,
    setRagEnabled,
    webEnabled,
    setWebEnabled,
    structuredMode,
    setStructuredMode,
    onToggleModeEnfant
  } = props;

  // Handlers
  const handleVolumeToggle = useCallback(() => {
    if (muted) {
      onUnmute();
    } else {
      onMute();
    }
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
    if (setWebEnabled) {
      setWebEnabled(!webEnabled);
    }
  }, [webEnabled, setWebEnabled]);

  const handleStructuredToggle = useCallback(() => {
    if (setStructuredMode) {
      setStructuredMode(!structuredMode);
    }
  }, [structuredMode, setStructuredMode]);

  const handleChildModeToggle = useCallback(() => {
    onToggleModeEnfant?.();
  }, [onToggleModeEnfant]);

  // Actions de sélection avec design unifié
  const selectionActions = useMemo(() => {
    if (!props.hasActiveConversation) return null;

    return (
      <UnifiedButtonGroup>
        <UnifiedButton
          variant={props.selectMode ? "primary" : "ghost"}
          onClick={props.onToggleSelectMode}
          tooltip={props.selectMode ? 'Quitter la sélection' : 'Sélectionner des messages'}
          size="sm"
        >
          {props.selectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
          {props.selectMode ? 'Sélection' : 'Sélectionner'}
        </UnifiedButton>

        {props.selectMode && (
          <>
            <UnifiedButton
              variant="ghost"
              onClick={props.selectedCount === props.totalCount ? props.onDeselectAll : props.onSelectAll}
              tooltip={props.selectedCount === props.totalCount ? 'Tout désélectionner' : 'Tout sélectionner'}
              size="sm"
            >
              {props.selectedCount === props.totalCount ? 'Désélectionner' : 'Tout sélectionner'}
            </UnifiedButton>

            {props.selectedCount > 0 && (
              <UnifiedButton
                variant="danger"
                onClick={props.onRequestDelete}
                tooltip={`Supprimer ${props.selectedCount} message${props.selectedCount > 1 ? 's' : ''}`}
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                ({props.selectedCount})
              </UnifiedButton>
            )}
          </>
        )}
      </UnifiedButtonGroup>
    );
  }, [props.hasActiveConversation, props.selectMode, props.selectedCount, props.totalCount, props.onToggleSelectMode, props.onSelectAll, props.onDeselectAll, props.onRequestDelete]);

  return (
    <>
      <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 relative">
        {/* Audio */}
        <audio ref={audioRef} preload="auto">
          <source src="/bip2.mp3" type="audio/mpeg" />
          <source src="/bip2.ogg" type="audio/ogg" />
        </audio>

        {/* Conteneur principal avec largeur complète */}
        <div className="w-full">
          {/* Barre principale - Desktop */}
          <div className="hidden lg:block">
            <div className="w-full px-6 xl:px-8 2xl:px-12">
              <div className="flex items-center justify-between h-20">
                {/* Logo et branding - Version desktop étendue */}
                <div className="flex items-center flex-1 min-w-0">
                  <Logo 
                    onNewDiscussion={props.onNewDiscussion} 
                    isOnline={isOnline} 
                    quality={connectionQuality} 
                  />
                  
                  {/* Monitoring */}
                  <div className="ml-4">
                    <MonitoringStatusIndicator 
                      compact={true} 
                      onOpenMonitor={() => setShowMonitoringModal(true)}
                    />
                  </div>
                  
                  {/* PWA Status */}
                  {(isInstalled || isInstallable) && (
                    <div className="ml-3">
                      {isInstalled ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium shadow-sm">
                          <Smartphone className="w-4 h-4" />
                          <span>PWA Installé</span>
                        </div>
                      ) : isInstallable ? (
                        <button
                          onClick={installApp}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Installer PWA</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                 
                  {/* Workspace selector */}
                  <div className="ml-4">
                    <WorkspaceSelector
                      modeEnfant={props.modeEnfant}
                      workspaces={props.workspaces}
                      workspaceId={props.workspaceId}
                      onChangeWorkspace={props.onChangeWorkspace}
                      onCreateWorkspace={props.onCreateWorkspace}
                    />
                  </div>
                </div>

                {/* Actions desktop étendues */}
                <DesktopActions
                  modeEnfant={props.modeEnfant}
                  onNewDiscussion={props.onNewDiscussion}
                  selectionActions={selectionActions}
                  muted={props.muted}
                  handleVolumeToggle={handleVolumeToggle}
                  handleModeVocalToggle={handleModeVocalToggle}
                  modePrive={props.modePrive}
                  handlePrivateModeToggle={handlePrivateModeToggle}
                  handleChildModeToggle={handleChildModeToggle}
                  ragEnabled={props.ragEnabled}
                  handleRagToggle={handleRagToggle}
                  webEnabled={props.webEnabled}
                  handleWebToggle={handleWebToggle}
                  structuredMode={props.structuredMode}
                  handleStructuredToggle={handleStructuredToggle}
                  setShowMenu={setShowMenu}
                />
              </div>
            </div>
          </div>

          {/* Barre mobile/tablette */}
          <div className="lg:hidden">
            <div className="w-full px-4 sm:px-6">
              <div className="flex items-center justify-between h-16">
                {/* Logo et branding mobile */}
                <div className="flex items-center flex-1 min-w-0">
                  <Logo 
                    onNewDiscussion={props.onNewDiscussion} 
                    isOnline={isOnline} 
                    quality={connectionQuality} 
                  />
                  
                  {/* Monitoring mobile */}
                  <div className="ml-2">
                    <MonitoringStatusIndicator 
                      compact={true} 
                      onOpenMonitor={() => setShowMonitoringModal(true)}
                    />
                  </div>
                  
                  {/* PWA Status mobile */}
                  {(isInstalled || isInstallable) && (
                    <div className="ml-2">
                      {isInstalled ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium shadow-sm">
                          <Smartphone className="w-3 h-3" />
                          <span className="hidden sm:inline">PWA</span>
                        </div>
                      ) : isInstallable ? (
                        <button
                          onClick={installApp}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">Installer</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                 
                  {/* Workspace selector mobile */}
                  <div className="ml-2">
                    <WorkspaceSelector
                      modeEnfant={props.modeEnfant}
                      workspaces={props.workspaces}
                      workspaceId={props.workspaceId}
                      onChangeWorkspace={props.onChangeWorkspace}
                      onCreateWorkspace={props.onCreateWorkspace}
                    />
                  </div>
                </div>

                {/* Actions mobiles */}
                <MobileActions
                  muted={props.muted}
                  onNewDiscussion={props.onNewDiscussion}
                  handleVolumeToggle={handleVolumeToggle}
                  setShowMenu={setShowMenu}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banner mode privé */}
        <PrivateModeBanner show={showPrivateIndicator} />

         {/* Indicateurs de statut mobile */}
         {(props.modePrive || props.modeEnfant || props.ragEnabled || props.webEnabled) && (
           <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
             <div className="w-full px-4 py-2">
              <div className="flex items-center gap-2 text-xs">
                {props.modePrive && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 shadow-sm">
                    <Shield className="w-3 h-3" />
                    <span className="font-medium">Privé</span>
                  </div>
                )}
                {props.modeEnfant && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 shadow-sm">
                    <Baby className="w-3 h-3" />
                    <span className="font-medium">Enfant</span>
                  </div>
                )}
                {props.ragEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm">
                    <Database className="w-3 h-3" />
                    <span className="font-medium">RAG</span>
                  </div>
                )}
                {props.webEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm">
                    <Globe className="w-3 h-3" />
                    <span className="font-medium">Web</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sheet menu mobile simplifié */}
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetContent side="right" className="p-0 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 w-[90vw] max-w-md">
            <SheetHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Paramètres
                </h2>
                <UnifiedButton
                  variant="ghost"
                  onClick={() => setShowMenu(false)}
                  size="icon"
                >
                  <X className="w-4 h-4" />
                </UnifiedButton>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Actions principales */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Actions
                </h3>
                 <div className="grid grid-cols-2 gap-2">
                   <UnifiedButton
                     variant="primary"
                     onClick={() => {
                       props.onNewDiscussion();
                       setShowMenu(false);
                     }}
                     className="h-12 flex-col gap-1"
                   >
                     <Plus className="w-4 h-4" />
                     <span className="text-xs">Nouveau</span>
                   </UnifiedButton>
                  
                   {!props.modeEnfant && (
                     <UnifiedButton
                       variant="secondary"
                       onClick={() => {
                         props.onOpenHistory();
                         setShowMenu(false);
                       }}
                       className="h-12 flex-col gap-1"
                     >
                       <History className="w-4 h-4" />
                       <span className="text-xs">Historique</span>
                     </UnifiedButton>
                   )}
                </div>
              </div>

              {/* Modes et fonctionnalités */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Modes IA
                </h3>
                 <div className="grid grid-cols-2 gap-2">
                   {!props.modeEnfant && (
                     <UnifiedButton
                       variant={props.modePrive ? "danger" : "ghost"}
                       onClick={() => {
                         handlePrivateModeToggle();
                         setShowMenu(false);
                       }}
                       active={props.modePrive}
                       className="h-12 flex-col gap-1"
                     >
                       <Shield className="w-4 h-4" />
                       <span className="text-xs">{props.modePrive ? 'Privé ON' : 'Privé OFF'}</span>
                     </UnifiedButton>
                   )}
                   
                   <UnifiedButton
                     variant={props.modeEnfant ? "primary" : "ghost"}
                     onClick={() => {
                       handleChildModeToggle();
                       setShowMenu(false);
                     }}
                     active={!!props.modeEnfant}
                     className="h-12 flex-col gap-1"
                   >
                     <Baby className="w-4 h-4" />
                     <span className="text-xs">{props.modeEnfant ? 'Enfant ON' : 'Enfant OFF'}</span>
                   </UnifiedButton>
                   
                   {!props.modeEnfant && (
                     <>
                       <UnifiedButton
                         variant={props.ragEnabled ? "success" : "ghost"}
                         onClick={() => {
                           handleRagToggle();
                           setShowMenu(false);
                         }}
                         active={props.ragEnabled}
                         className="h-12 flex-col gap-1"
                       >
                         <Database className="w-4 h-4" />
                         <span className="text-xs">{props.ragEnabled ? 'RAG ON' : 'RAG OFF'}</span>
                       </UnifiedButton>
                       
                       <UnifiedButton
                         variant={props.webEnabled ? "success" : "ghost"}
                         onClick={() => {
                           handleWebToggle();
                           setShowMenu(false);
                         }}
                         active={!!props.webEnabled}
                         className="h-12 flex-col gap-1"
                       >
                         <Globe className="w-4 h-4" />
                         <span className="text-xs">{props.webEnabled ? 'Web ON' : 'Web OFF'}</span>
                       </UnifiedButton>
                     </>
                   )}
                 </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Configuration
                </h3>
                <div className="space-y-3">
                  {!props.modeEnfant && (
                    <>
                      <UnifiedButton
                        variant="ghost"
                        onClick={() => {
                          props.onOpenTTSSettings();
                          setShowMenu(false);
                        }}
                        className="w-full justify-start h-12"
                      >
                        <Volume2 className="w-4 h-4 mr-3" />
                        Synthèse vocale
                      </UnifiedButton>
                      
                      <UnifiedButton
                        variant="ghost"
                        onClick={() => {
                          props.onOpenRagDocs();
                          setShowMenu(false);
                        }}
                        className="w-full justify-start h-12"
                      >
                        <BookOpen className="w-4 h-4 mr-3" />
                        Documents RAG
                      </UnifiedButton>
                    </>
                  )}
                  
                  <UnifiedButton
                    variant="ghost"
                    onClick={() => {
                      toggleTheme();
                      setShowMenu(false);
                    }}
                    className="w-full justify-start h-12"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                    {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  </UnifiedButton>
                  
                  <UnifiedButton
                    variant="ghost"
                    onClick={() => {
                      setShowMonitoringModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full justify-start h-12"
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Monitoring système
                  </UnifiedButton>
                  
                  {!props.modeEnfant && (
                    <UnifiedButton
                      variant="ghost"
                      onClick={() => {
                        // Ouvrir le modal des espaces de travail
                        const workspaceButton = document.querySelector('[data-workspace-button]');
                        if (workspaceButton) {
                          (workspaceButton as HTMLButtonElement).click();
                        }
                        setShowMenu(false);
                      }}
                      className="w-full justify-start h-12"
                    >
                      <Database className="w-4 h-4 mr-3" />
                      Espaces de travail
                    </UnifiedButton>
                  )}
                  
                  <UnifiedButton
                    variant="ghost"
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full justify-start h-12"
                  >
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Aide et documentation
                  </UnifiedButton>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Modals */}
      {props.autoVoiceConfig && props.onUpdateAutoVoiceConfig && (
        <VocalAutoSettingsModal
          open={showVocalSettings}
          onClose={() => setShowVocalSettings(false)}
          config={props.autoVoiceConfig}
          onUpdate={props.onUpdateAutoVoiceConfig}
          onReset={() => {
            props.onUpdateAutoVoiceConfig?.('silenceMs', 2500);
            props.onUpdateAutoVoiceConfig?.('minChars', 6);
            props.onUpdateAutoVoiceConfig?.('minWords', 2);
            props.onUpdateAutoVoiceConfig?.('cooldownMs', 1500);
          }}
        />
      )}

      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Modal de monitoring */}
      <SecurityPerformanceMonitor 
        isOpen={showMonitoringModal} 
        onClose={() => setShowMonitoringModal(false)} 
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={props.showConfirmDelete} onOpenChange={props.setShowConfirmDelete}>
        <AlertDialogContent className="rounded-xl max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Supprimer {props.selectedCount} message{props.selectedCount > 1 ? 's' : ''} ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Cette action est <strong>irréversible</strong>. Les messages seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-lg">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={props.onDeleteConfirmed} 
              className="rounded-lg bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tooltips */}
      <ReactTooltip 
        id="header-tooltip" 
        place="bottom" 
        className="!bg-slate-900/90 !text-white !text-xs !px-3 !py-2 !rounded-lg !shadow-lg !z-50" 
      />

      {/* CSS personnalisé */}
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        /* Optimisations mobile */
        @media (max-width: 768px) {
          .mobile-optimized {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        }
      `}</style>
    </>
  );
}