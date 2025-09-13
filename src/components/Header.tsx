import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  History, Settings2, Volume2, VolumeX, Sun, Moon, 
  PlusCircle, Mic, Brain, Shield, BookOpen, CheckSquare, Square, 
  Trash2, Menu, X, WifiOff, Baby, Sparkles, Layers,
  Globe, Database, Activity, Pencil, HelpCircle
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle} from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VocalAutoSettingsModal } from '@/components/VocalAutoSettingsModal';
import { HelpModal } from '@/components/HelpModal';
// import { Input } from '@/components/ui/input';
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
  // onOpenMemory supprimé - système de mémoire retiré
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
  // Vocal auto config
  autoVoiceConfig?: { silenceMs: number; minChars: number; minWords: number; cooldownMs: number };
  onUpdateAutoVoiceConfig?: (key: 'silenceMs' | 'minChars' | 'minWords' | 'cooldownMs', value: number) => void;
  // Workspaces
  workspaceId?: string;
  workspaces?: Array<{ id: string; name: string }>;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}

// =====================
// Hooks personnalisés améliorés
// =====================
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      // Test de latence simple
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

    // Test initial
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

    // Audio feedback amélioré
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Masquer l'indicateur après 3 secondes
    const timer = setTimeout(() => setShowPrivateIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, [modePrive]);

  return { audioRef, showPrivateIndicator };
};

// =====================
// Sous-composants améliorés
// =====================
const StatusIndicator = ({ isOnline, quality }: { isOnline: boolean; quality: 'excellent' | 'good' | 'poor' }) => {
  const getQualityColor = () => {
    if (!isOnline) return 'bg-red-500';
    switch (quality) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getSignalBars = () => {
    if (!isOnline) return 0;
    switch (quality) {
      case 'excellent': return 3;
      case 'good': return 2;
      case 'poor': return 1;
      default: return 0;
    }
  };

  return (
    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm">
      <div className={`w-2.5 h-2.5 rounded-full ${getQualityColor()} relative`}>
        {isOnline && quality === 'excellent' && (
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
        )}
        {/* Mini signal bars */}
        <div className="absolute -top-0.5 -right-0.5 flex gap-px">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-px h-1 ${
                i < getSignalBars() ? getQualityColor().replace('bg-', 'bg-') : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: `${(i + 1) * 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Logo = ({ onNewDiscussion, isOnline, quality }: { 
  onNewDiscussion: () => void; 
  isOnline: boolean; 
  quality: 'excellent' | 'good' | 'poor';
}) => (
  <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={onNewDiscussion}>
    <div className="relative">
      {/* Logo principal avec image */}
      <div>
        {/* Image du logo */}
        <img 
          src="/logo-p.png" 
          alt="NeuroChat - IA Intelligente" 
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain relative z-10"
        />
        
        {/* Effets de brillance */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" /> */}
        {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-transparent to-white/10 group-hover:to-white/20 transition-all duration-300" /> */}
        
        {/* Effet néon/glow */}
        {/* <div className="absolute inset-0 rounded-2xl bg-blue-400/20 group-hover:bg-blue-400/30 transition-all duration-300 blur-sm" /> */}
      </div>
      
      {/* Indicateur de statut */}
      <StatusIndicator isOnline={isOnline} quality={quality} />
    </div>
    
    {/* Texte du logo et statut de connexion - masqué sur mobile */}
    <div className="min-w-0 flex-1 hidden sm:block">
      <div className="flex items-center gap-2">
        <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-600 dark:from-white dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
          NeuroChat
        </h1>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
          v2
        </span>
      </div>
      <ConnectionStatus isOnline={isOnline} quality={quality} />
    </div>
  </div>
);

// (Badges de statut supprimés dans la nouvelle version épurée)

interface ActionButtonProps {
  onClick?: () => void;
  tooltip?: string;
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary" | "link";
  className?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const ActionButton = ({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  loading = false,
  ...props 
}: ActionButtonProps) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    disabled={loading}
    data-tooltip-id="header-tooltip"
    data-tooltip-content={tooltip}
    className={`
      h-8 px-3 text-sm font-medium rounded-lg
      hover:bg-slate-100/80 dark:hover:bg-slate-800/80 
      transition-all duration-200 hover:scale-[1.02] active:scale-95 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 
      focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950
      backdrop-blur-sm border-0
      ${loading ? 'animate-pulse' : ''}
      ${className}
    `}
    {...props}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        {children}
      </div>
    ) : (
      children
    )}
  </Button>
);

interface IconButtonProps {
  onClick?: () => void;
  tooltip?: string;
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary" | "link";
  className?: string;
  active?: boolean;
  children: React.ReactNode;
}

const IconButton = ({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  active = false,
  ...props 
}: IconButtonProps) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    data-tooltip-id="header-tooltip"
    data-tooltip-content={tooltip}
    className={`
      h-8 w-8 p-0 rounded-lg transition-all duration-200 
      hover:scale-105 active:scale-95 backdrop-blur-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 
      focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950
      ${active ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-400/30' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </Button>
);

const TileButton = ({
  onClick,
  label,
  icon: Icon,
  active = false,
  intent = 'default',
  disabled = false,
  tooltip,
}: {
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  intent?: 'default' | 'danger' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  tooltip?: string;
}) => {
  const intents: Record<string, string> = {
    default: 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60',
    danger: 'bg-red-50/80 dark:bg-red-950/40 border-red-200/60 dark:border-red-800/50',
    info: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/50',
    success: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/50',
    warning: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50',
  };
  const activeRing = active ? 'ring-1 ring-blue-400/40' : '';
  const intentBg = intents[intent] || intents.default;
  const textTone = active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300';
  const iconTone = active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-tooltip-id="header-tooltip"
      data-tooltip-content={tooltip || label}
      className={`group w-full h-16 rounded-xl border ${intentBg} ${activeRing} flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? 'bg-blue-100/70 dark:bg-blue-900/40' : 'bg-white/70 dark:bg-slate-800/60'} shadow-sm`}>
        <Icon className={`w-4 h-4 ${iconTone}`} />
      </div>
      <span className={`text-[10px] font-medium ${textTone} truncate w-full px-1 text-center`}>{label}</span>
    </button>
  );
};

const ButtonGroup = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    flex items-center gap-1 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 
    border border-slate-200/60 dark:border-slate-800/60 p-1 shadow-sm backdrop-blur-sm
    hover:shadow-md transition-all duration-200
    ${className}
  `}>
    {children}
  </div>
);

const PrivateModeBanner = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-medium animate-slide-down shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <Shield className="w-4 h-4" />
        Mode privé activé - Aucune donnée n'est sauvegardée
      </div>
    </div>
  );
};

// =====================
// Composants de base refactorisés
// =====================

// Composant pour le statut de connexion
const ConnectionStatus = ({ isOnline, quality }: { isOnline: boolean; quality: 'excellent' | 'good' | 'poor' }) => (
  <div className="hidden xs:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
    {isOnline ? (
      <div className="flex items-center gap-1">
        <Activity className="w-3 h-3" />
        <span className="capitalize truncate">
          {quality === 'excellent' ? 'Excellente' : quality === 'good' ? 'Bonne' : 'Faible'} connexion
        </span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-500">
        <WifiOff className="w-3 h-3" />
        <span className="truncate">Hors ligne</span>
      </div>
    )}
  </div>
);

// Composant pour le sélecteur d'espace de travail
const WorkspaceSelector = ({ 
  modeEnfant, 
  workspaces, 
  workspaceId, 
  onChangeWorkspace, 
  onCreateWorkspace, 
  onRenameWorkspace, 
  onDeleteWorkspace 
}: {
  modeEnfant?: boolean;
  workspaces?: Array<{ id: string; name: string }>;
  workspaceId?: string;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}) => {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  
  if (modeEnfant || !workspaces || !onChangeWorkspace) return null;

  const currentWorkspace = workspaces.find(w => w.id === workspaceId);

  return (
    <>
      <button
        onClick={() => setShowWorkspaceModal(true)}
        className="flex items-center gap-1.5 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-lg px-2 py-1.5 max-w-[160px] sm:max-w-none hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors group"
        title="Changer d'espace de travail"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Database className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
            {currentWorkspace?.name || 'Espace par défaut'}
          </span>
        </div>
        <Pencil className="w-3 h-3 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <WorkspaceSelectorModal
        open={showWorkspaceModal}
        onOpenChange={setShowWorkspaceModal}
        workspaces={workspaces}
        currentWorkspaceId={workspaceId}
        onChangeWorkspace={onChangeWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        onRenameWorkspace={onRenameWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
      />
    </>
  );
};

// Composant modal pour la sélection d'espace de travail
const WorkspaceSelectorModal = ({
  open,
  onOpenChange,
  workspaces,
  currentWorkspaceId,
  onChangeWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: Array<{ id: string; name: string }>;
  currentWorkspaceId?: string;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingWorkspace, setEditingWorkspace] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim() && onCreateWorkspace) {
      onCreateWorkspace();
      setNewWorkspaceName('');
      onOpenChange(false);
    }
  };

  const handleRenameWorkspace = () => {
    if (editingWorkspace && editName.trim() && onRenameWorkspace) {
      onRenameWorkspace(editingWorkspace.id, editName.trim());
      setEditingWorkspace(null);
      setEditName('');
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace && onDeleteWorkspace) {
      const ok = window.confirm(`Supprimer l'espace "${workspace.name}" ?\nToutes les données locales de cet espace seront perdues.`);
      if (ok) {
        onDeleteWorkspace(workspaceId);
        if (currentWorkspaceId === workspaceId) {
          onChangeWorkspace?.('default');
        }
      }
    }
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    onChangeWorkspace?.(workspaceId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Espaces de travail
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Gérez vos espaces de travail et changez d'environnement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Création d'un nouvel espace */}
          <div className="space-y-3">
            <Label htmlFor="new-workspace" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Créer un nouvel espace
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-workspace"
                placeholder="Nom de l'espace"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
              <Button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim()}
                size="sm"
                className="px-4"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer
              </Button>
            </div>
          </div>

          {/* Liste des espaces existants */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Espaces disponibles
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workspaces.map((workspace) => {
                const isCurrent = workspace.id === currentWorkspaceId;
                const isEditing = editingWorkspace?.id === workspace.id;
                const isDefault = workspace.id === 'default';

                return (
                  <div
                    key={workspace.id}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      isCurrent
                        ? 'border-blue-300 dark:border-blue-600 bg-blue-50/80 dark:bg-blue-950/40'
                        : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameWorkspace()}
                          autoFocus
                        />
                        <Button
                          onClick={handleRenameWorkspace}
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingWorkspace(null);
                            setEditName('');
                          }}
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium truncate ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {workspace.name}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full">
                                  Actuel
                                </span>
                              )}
                              {isDefault && (
                                <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                                  Par défaut
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isCurrent && (
                            <Button
                              onClick={() => handleSelectWorkspace(workspace.id)}
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                            >
                              Sélectionner
                            </Button>
                          )}
                          
                          {!isDefault && onRenameWorkspace && (
                            <Button
                              onClick={() => {
                                setEditingWorkspace(workspace);
                                setEditName(workspace.name);
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Renommer"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {!isDefault && onDeleteWorkspace && (
                            <Button
                              onClick={() => handleDeleteWorkspace(workspace.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="rounded-xl"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour les actions de sélection

// Composant pour les actions mobiles
const MobileActions = ({ 
  muted, 
  onNewDiscussion, 
  handleVolumeToggle, 
  setShowMobileMenu 
}: {
  modeEnfant?: boolean;
  muted: boolean;
  onNewDiscussion: () => void;
  handleVolumeToggle: () => void;
  setShowMobileMenu: (show: boolean) => void;
}) => (
  <div className="md:hidden flex items-center gap-1 mobile-optimized">
    {/* Barre d'actions mobile ultra-optimisée */}
    <div className="flex items-center gap-1 bg-slate-50/80 dark:bg-slate-900/60 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-mobile">
      {/* Bouton Nouveau - Priorité haute */}
      <IconButton 
        onClick={onNewDiscussion} 
        tooltip="Nouvelle discussion" 
        className="h-7 w-7 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 mobile-button transition-smooth"
        aria-label="Nouvelle discussion"
      >
        <PlusCircle className="w-4 h-4" />
      </IconButton>
      
      {/* Contrôle audio - Priorité haute */}
      <IconButton
        onClick={handleVolumeToggle}
        tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
        active={!muted}
        className={`h-7 w-7 rounded-lg mobile-button transition-smooth ${
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
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowMobileMenu(true)}
      className="h-8 w-8 p-0 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 transition-smooth hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 mobile-button"
      aria-label="Menu principal"
    >
      <Menu className="w-5 h-5" />
    </Button>
  </div>
);

// Composant pour l'indicateur de statut mobile
const MobileStatusIndicator = ({ 
  modePrive, 
  modeEnfant, 
  ragEnabled, 
  webEnabled 
}: {
  modePrive: boolean;
  modeEnfant?: boolean;
  ragEnabled: boolean;
  webEnabled?: boolean;
}) => (
    <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
    <div className="max-w-12xl mx-auto px-2 py-1.5">
      <div className="flex items-center justify-between text-xs">
        {/* Modes actifs */}
        <div className="flex items-center gap-2">
          {modePrive && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <Shield className="w-3 h-3" />
              <span className="text-xs font-medium">Privé</span>
            </div>
          )}
          {modeEnfant && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <Baby className="w-3 h-3" />
              <span className="text-xs font-medium">Enfant</span>
            </div>
          )}
          {ragEnabled && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Database className="w-3 h-3" />
              <span className="text-xs font-medium">RAG</span>
            </div>
          )}
          {webEnabled && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Globe className="w-3 h-3" />
              <span className="text-xs font-medium">Web</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Composant pour les actions desktop
const DesktopActions = ({ 
  modeEnfant, 
  onNewDiscussion, 
  onOpenHistory, 
  // onOpenMemory supprimé - système de mémoire retiré
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
  webSearching, 
  structuredMode,
  handleStructuredToggle,
  setShowMobileMenu 
}: {
  modeEnfant?: boolean;
  onNewDiscussion: () => void;
  onOpenHistory: () => void;
  // onOpenMemory supprimé - système de mémoire retiré
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
  webSearching?: boolean;
  structuredMode?: boolean;
  handleStructuredToggle?: () => void;
  toggleTheme: () => void;
  setShowMobileMenu: (show: boolean) => void;
}) => (
  <div className="hidden md:flex items-center gap-3">
    {/* Actions de base */}
    <div className="flex items-center gap-2">
      <ActionButton onClick={onNewDiscussion} tooltip="Nouvelle discussion">
        <PlusCircle className="w-4 h-4 mr-2" />
        Nouveau
      </ActionButton>

      {!modeEnfant && (
        <ButtonGroup>
          <IconButton onClick={onOpenHistory} tooltip="Historique" aria-label="Historique">
            <History className="w-4 h-4" />
          </IconButton>
          {/* Bouton mémoire supprimé - système de mémoire retiré */}
        </ButtonGroup>
      )}
    </div>

    {/* Actions de sélection */}
    {selectionActions}

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
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </IconButton>

      {!modeEnfant && (
        <IconButton
          onClick={handleModeVocalToggle}
          tooltip="Mode vocal automatique"
          active={false}
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
        >
          <Shield className="w-4 h-4" />
        </IconButton>
      )}

      <IconButton
        onClick={handleChildModeToggle}
        tooltip="Mode enfant"
        active={!!modeEnfant}
      >
        <Baby className="w-4 h-4" />
      </IconButton>

      
      
      {!modeEnfant && (
        <>
          <IconButton
            onClick={handleRagToggle}
            tooltip="Recherche documentaire (RAG)"
            active={ragEnabled}
          >
            <Database className="w-4 h-4" />
          </IconButton>

          <IconButton
            onClick={handleWebToggle}
            tooltip="Recherche web"
            active={!!webEnabled}
          >
            <Globe className={`w-4 h-4 ${webSearching ? 'animate-spin' : ''}`} />
          </IconButton>
        </>
      )}
    </ButtonGroup>

    {/* Mode Réponses structurées */}
    {!modeEnfant && (
      <ButtonGroup>
        <IconButton
          onClick={handleStructuredToggle}
          tooltip="Réponses structurées"
          active={!!structuredMode}
        >
          <Layers className="w-4 h-4" />
        </IconButton>
      </ButtonGroup>
    )}

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
        >
          <Settings2 className="w-4 h-4" />
        </IconButton>
      </ButtonGroup>
    )}
  </div>
);

// Composant pour le panneau latéral mobile
const MobileMenuSheet = ({ 
  showMobileMenu, 
  setShowMobileMenu, 
  closeMobileMenu, 
  handleMenuAction, 
  modeEnfant, 
  hasActiveConversation, 
  selectMode, 
  selectedCount, 
  onToggleSelectMode, 
  onRequestDelete, 
  modePrive, 
  handlePrivateModeToggle, 
  handleChildModeToggle, 
  ragEnabled, 
  handleRagToggle, 
  webEnabled, 
  handleWebToggle, 
  structuredMode,
  handleStructuredToggle,
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
}: {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  closeMobileMenu: () => void;
  handleMenuAction: (action: () => void) => () => void;
  modeEnfant?: boolean;
  hasActiveConversation: boolean;
  selectMode: boolean;
  selectedCount: number;
  onToggleSelectMode: () => void;
  onRequestDelete: () => void;
  modePrive: boolean;
  handlePrivateModeToggle: () => void;
  handleChildModeToggle: () => void;
  ragEnabled: boolean;
  handleRagToggle: () => void;
  webEnabled?: boolean;
  handleWebToggle: () => void;
  structuredMode?: boolean;
  handleStructuredToggle?: () => void;
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
}) => (
       <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
       <SheetContent side="right" className="p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/50 shadow-2xl w-[95vw] max-w-[480px] sm:w-[420px]">
             <SheetHeader className="p-6 border-b border-slate-200/60 dark:border-slate-800/60">
         <div className="flex items-center justify-between">
           <div className="flex-1 min-w-0">
             <SheetTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
               Menu Principal
             </SheetTitle>
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

          {/* Section: Gestion des Messages */}
          {hasActiveConversation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">Gestion</span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 rounded-xl text-left font-medium hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-200" 
                  onClick={handleMenuAction(onToggleSelectMode)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                      {selectMode ? <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Square className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{selectMode ? 'Annuler sélection' : 'Sélectionner messages'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {selectMode ? 'Quitter le mode sélection' : 'Choisir des messages à supprimer'}
                      </div>
                    </div>
                  </div>
                </Button>

                {selectMode && selectedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-12 rounded-xl text-left font-medium hover:bg-red-50/80 dark:hover:bg-red-950/60 transition-all duration-200" 
                    onClick={handleMenuAction(onRequestDelete)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">
                          Supprimer sélection ({selectedCount})
                        </div>
                        <div className="text-xs text-red-500/70 dark:text-red-400/70">
                          Action irréversible
                        </div>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="border-t border-slate-200/60 dark:border-slate-800/60" />

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

              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(handleStructuredToggle || (() => {}))}
                  label={structuredMode ? 'Structuré: ON' : 'Structuré: OFF'}
                  icon={Layers}
                  active={!!structuredMode}
                  intent={structuredMode ? 'info' : 'default'}
                  tooltip="Réponses structurées"
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
                  onClick={handleMenuAction(() => document.dispatchEvent(new CustomEvent('openai:settings:open')))}
                  label={'OpenAI'}
                  icon={Brain}
                  tooltip="Réglages OpenAI"
                />
              )}
              
              {!modeEnfant && (
                <TileButton
                  onClick={handleMenuAction(() => document.dispatchEvent(new CustomEvent('mistral:settings:open')))}
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
);

// =====================
// Composant principal amélioré
// =====================
export function Header(props: HeaderProps) {
  const {
    muted, onMute, onUnmute, onNewDiscussion, onOpenHistory, onOpenTTSSettings,
    onOpenRagDocs, modeVocalAuto, setModeVocalAuto,
    hasActiveConversation, ragEnabled, setRagEnabled, onOpenGeminiSettings,
    webEnabled, setWebEnabled, structuredMode, setStructuredMode, provider, onChangeProvider, modePrive, setModePrive, 
    selectMode, onToggleSelectMode, selectedCount, totalCount, onSelectAll, onDeselectAll,
    onRequestDelete, showConfirmDelete, setShowConfirmDelete, onDeleteConfirmed
  } = props;

  const { theme, toggleTheme } = useTheme();
  const { isOnline, connectionQuality } = useOnlineStatus();
  const { audioRef, showPrivateIndicator } = usePrivateModeFeedback(modePrive);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showVocalSettings, setShowVocalSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  

  // Handlers optimisés avec feedback
  const handleVolumeToggle = useCallback(() => {
    if (muted) {
      onUnmute();
    } else {
      onMute();
    }
  }, [muted, onMute, onUnmute]);

  const handleModeVocalToggle = useCallback(() => {
    setModeVocalAuto(!modeVocalAuto);
    // Feedback haptic
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [modeVocalAuto, setModeVocalAuto]);

  const handlePrivateModeToggle = useCallback(() => {
    setModePrive(!modePrive);
  }, [modePrive, setModePrive]);

  const handleRagToggle = useCallback(() => {
    setRagEnabled(!ragEnabled);
    // Feedback visuel avec micro-délai
    setTimeout(() => {
      if ('vibrate' in navigator) navigator.vibrate(30);
    }, 100);
  }, [ragEnabled, setRagEnabled]);

  const handleWebToggle = useCallback(() => {
    if (setWebEnabled) {
      setWebEnabled(!webEnabled);
      if ('vibrate' in navigator) navigator.vibrate(30);
    }
  }, [webEnabled, setWebEnabled]);

  const handleStructuredToggle = useCallback(() => {
    if (setStructuredMode) {
      setStructuredMode(!structuredMode);
      if ('vibrate' in navigator) navigator.vibrate(30);
    }
  }, [structuredMode, setStructuredMode]);

  const handleChildModeToggle = useCallback(() => {
    props.onToggleModeEnfant?.();
  }, [props]);

  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  const handleMenuAction = useCallback((action: () => void) => {
    return () => {
      action();
      closeMobileMenu();
    };
  }, [closeMobileMenu]);

  // Composants mémorisés
  const selectionActions = useMemo(() => {
    if (!hasActiveConversation) return null;

    return (
      <>
        <ActionButton
          variant={selectMode ? "default" : "ghost"}
          onClick={onToggleSelectMode}
          tooltip={selectMode ? 'Quitter la sélection' : 'Sélectionner des messages'}
          className={selectMode ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : ''}
        >
          {selectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
          {selectMode ? 'Sélection' : 'Sélectionner'}
        </ActionButton>

        {selectMode && (
          <div className="flex items-center gap-1 animate-slide-in">
            <ActionButton
              onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
              tooltip={selectedCount === totalCount ? 'Tout désélectionner' : 'Tout sélectionner'}
              className="text-xs px-3"
            >
              {selectedCount === totalCount ? 'Tout désélectionner' : 'Tout sélectionner'}
            </ActionButton>

            {selectedCount > 0 && (
              <ActionButton
                variant="destructive"
                onClick={onRequestDelete}
                tooltip={`Supprimer ${selectedCount} message${selectedCount > 1 ? 's' : ''}`}
                className="bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                <span className="text-xs">({selectedCount})</span>
              </ActionButton>
            )}
          </div>
        )}
      </>
    );
  }, [hasActiveConversation, selectMode, selectedCount, totalCount, onToggleSelectMode, onSelectAll, onDeselectAll, onRequestDelete]);

  return (
    <>
      <header className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 relative">
        {/* Audio amélioré */}
        <audio ref={audioRef} preload="auto">
          <source src="/bip2.mp3" type="audio/mpeg" />
          <source src="/bip2.ogg" type="audio/ogg" />
        </audio>

        <div className="max-w-12xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo et branding */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Logo onNewDiscussion={onNewDiscussion} isOnline={isOnline} quality={connectionQuality} />
              
              {/* Sélecteur d'espace de travail - Responsive */}
              <WorkspaceSelector
                modeEnfant={props.modeEnfant}
                workspaces={props.workspaces}
                workspaceId={props.workspaceId}
                onChangeWorkspace={props.onChangeWorkspace}
                onCreateWorkspace={props.onCreateWorkspace}
                onRenameWorkspace={props.onRenameWorkspace}
                onDeleteWorkspace={props.onDeleteWorkspace}
              />
            </div>

            {/* Actions principales - Desktop */}
            <DesktopActions
              modeEnfant={props.modeEnfant}
              onNewDiscussion={onNewDiscussion}
              onOpenHistory={onOpenHistory}
              // onOpenMemory supprimé - système de mémoire retiré
              selectionActions={selectionActions}
              muted={muted}
              handleVolumeToggle={handleVolumeToggle}
              handleModeVocalToggle={handleModeVocalToggle}
              modePrive={modePrive}
              handlePrivateModeToggle={handlePrivateModeToggle}
              handleChildModeToggle={handleChildModeToggle}
              ragEnabled={ragEnabled}
              handleRagToggle={handleRagToggle}
              webEnabled={webEnabled}
              handleWebToggle={handleWebToggle}
              webSearching={props.webSearching}
              structuredMode={structuredMode}
              handleStructuredToggle={handleStructuredToggle}
              toggleTheme={toggleTheme}
              setShowMobileMenu={setShowMobileMenu}
            />

            {/* Actions mobiles essentielles - Refonte complète */}
            <MobileActions
              modeEnfant={props.modeEnfant}
              muted={muted}
              onNewDiscussion={onNewDiscussion}
              handleVolumeToggle={handleVolumeToggle}
              setShowMobileMenu={setShowMobileMenu}
            />
          </div>
        </div>

        {/* Banner mode privé */}
        <PrivateModeBanner show={showPrivateIndicator} />

        {/* Indicateur de statut mobile - Affichage compact des informations importantes */}
        <MobileStatusIndicator
          modePrive={modePrive}
          modeEnfant={props.modeEnfant}
          ragEnabled={ragEnabled}
          webEnabled={webEnabled}
        />

        {/* Panneau latéral de réglages (Sheet) - Refonte mobile */}
        <MobileMenuSheet
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          closeMobileMenu={closeMobileMenu}
          handleMenuAction={handleMenuAction}
          modeEnfant={props.modeEnfant}
          hasActiveConversation={hasActiveConversation}
          selectMode={selectMode}
          selectedCount={selectedCount}
          onToggleSelectMode={onToggleSelectMode}
          onRequestDelete={onRequestDelete}
          modePrive={modePrive}
          handlePrivateModeToggle={handlePrivateModeToggle}
          handleChildModeToggle={handleChildModeToggle}
          ragEnabled={ragEnabled}
          handleRagToggle={handleRagToggle}
          webEnabled={webEnabled}
          handleWebToggle={handleWebToggle}
          structuredMode={structuredMode}
          handleStructuredToggle={handleStructuredToggle}
          onOpenTTSSettings={onOpenTTSSettings}
          onOpenGeminiSettings={onOpenGeminiSettings}
          onOpenRagDocs={onOpenRagDocs}
          autoVoiceConfig={props.autoVoiceConfig}
          onUpdateAutoVoiceConfig={props.onUpdateAutoVoiceConfig}
          onOpenChildPinSettings={props.onOpenChildPinSettings}
          toggleTheme={toggleTheme}
          theme={theme}
          setShowHelpModal={setShowHelpModal}
          onChangeProvider={onChangeProvider}
          provider={provider}
          setShowVocalSettings={setShowVocalSettings}
        />
      </header>

      {/* Modal Réglages Vocal Auto */}
      {!props.modeEnfant && props.autoVoiceConfig && props.onUpdateAutoVoiceConfig && (
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

      {/* Modal d'aide */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* AlertDialog modernisée pour la confirmation de suppression */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl max-w-md">
          <AlertDialogHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Supprimer {selectedCount} message{selectedCount > 1 ? 's' : ''} ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
              Cette action est <strong>irréversible</strong>. Les messages sélectionnés seront définitivement supprimés de la conversation et de l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-4">
            <AlertDialogCancel className="rounded-xl h-11 px-6 font-medium">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteConfirmed} 
              className="rounded-xl h-11 px-6 font-medium bg-red-600 hover:bg-red-700 focus:ring-red-500/50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReactTooltip 
        id="header-tooltip" 
        place="bottom" 
        className="!bg-slate-900/90 !text-white !text-xs !px-3 !py-2 !rounded-xl !shadow-2xl !z-50 !backdrop-blur-sm !border !border-slate-700/50" 
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)'
        }}
      />

      {/* Styles CSS custom pour les animations et responsive */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Optimisations mobile */
        @media (max-width: 768px) {
          .mobile-optimized {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          .mobile-button {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Breakpoint xs personnalisé pour très petits écrans */
        @media (min-width: 475px) {
          .xs:flex {
            display: flex;
          }
        }

        /* Améliorations pour les petits écrans */
        @media (max-width: 640px) {
          .sm:hidden {
            display: none !important;
          }
        }

        /* Transitions fluides pour tous les éléments interactifs */
        .transition-smooth {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Effet de pression tactile */
        .active:scale-95:active {
          transform: scale(0.95);
        }

        /* Optimisation des ombres pour mobile */
        @media (max-width: 768px) {
          .shadow-mobile {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        }
      `}</style>
    </>
  );
}