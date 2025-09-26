import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useTheme } from '@/hooks/useTheme';
import {
  History, Settings2, Volume2, VolumeX, Sun, Moon, 
  PlusCircle, Mic, Shield, BookOpen, CheckSquare, Square, 
  Trash2, Menu, X, Baby,
  Globe, Database, Pencil, HelpCircle,
  Download, Sparkles
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader} from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { VocalAutoSettingsModal } from '@/components/VocalAutoSettingsModal';
import { HelpModal } from '@/components/HelpModal';
import { usePWA } from '@/hooks/usePWA';
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
  onOpenBoltPrompt?: () => void;
  stop: () => void;
  modeVocalAuto: boolean;
  setModeVocalAuto: (v: boolean) => void;
  hasActiveConversation: boolean;
  ragEnabled: boolean;
  setRagEnabled: (v: boolean) => void;
  webEnabled?: boolean;
  setWebEnabled?: (v: boolean) => void;
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


// Logo avec design épuré et moderne
const Logo = ({ 
  onNewDiscussion, 
  isOnline, 
  quality 
}: { 
  onNewDiscussion: () => void; 
  isOnline: boolean; 
  quality: 'excellent' | 'good' | 'poor';
}) => (
  <div className="flex items-center gap-4">
    <div 
      className="group flex items-center gap-3 cursor-pointer" 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onNewDiscussion();
      }}
    >
      {/* Logo avec effet glassmorphism */}
      <div className="relative">
          <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-950 flex items-center justify-center">
            <img 
              src="/logo-p.png" 
              alt="NeuroChat" 
              className="w-10 h-10 object-contain"
            />
          </div>
        
        {/* Indicateur de qualité */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <div className={`w-2 h-2 rounded-full ${
            !isOnline ? 'bg-red-500' :
            quality === 'excellent' ? 'bg-emerald-500' :
            quality === 'good' ? 'bg-amber-500' : 'bg-orange-500'
          }`} />
        </div>
      </div>
      
      {/* Texte avec animation au hover */}
      <div className="hidden sm:flex flex-col justify-center">
        <h1
          className="text-2xl font-extrabold bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 dark:from-white dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200 drop-shadow-sm tracking-tight"
          aria-label="NeuroChat"
        >
          NeuroChat
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          
        </div>
      </div>
    </div>
    
  </div>
);

// Bouton moderne avec effets améliorés
const ModernButton = ({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  active = false,
  loading = false,
  size = "default",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  variant?: "ghost" | "primary" | "secondary" | "danger" | "success";
  className?: string;
  active?: boolean;
  loading?: boolean;
  size?: "sm" | "default" | "lg" | "xl";
  disabled?: boolean;
}) => {
  const variants = {
    ghost: "hover:bg-slate-100/90 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm",
    primary: "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 text-white shadow-xl shadow-slate-600/30 border border-slate-500/20 backdrop-blur-sm",
    secondary: "bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-600/50 backdrop-blur-sm",
    danger: "bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white shadow-xl shadow-red-600/30 border border-red-500/20 backdrop-blur-sm",
    success: "bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 text-white shadow-xl shadow-emerald-600/30 border border-emerald-500/20 backdrop-blur-sm"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm min-w-[36px]",
    default: "h-12 px-6 text-base min-w-[48px]",
    lg: "h-14 px-8 text-lg min-w-[56px]",
    xl: "h-16 px-10 text-xl min-w-[64px]"
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      data-tooltip-id="header-tooltip"
      data-tooltip-content={tooltip}
      className={`
        ${sizes[size]} rounded-2xl font-semibold transition-all duration-300 
        hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${active ? 'ring-4 ring-blue-500/40 bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-lg' : ''}
        ${loading ? 'animate-pulse' : ''}
        backdrop-blur-sm hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/5
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Groupe de boutons avec design glassmorphism amélioré
const ButtonGroup = ({ 
  children, 
  className = "",
  label 
}: { 
  children: React.ReactNode; 
  className?: string;
  label?: string;
}) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {label && (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-2 hidden lg:block bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-md">
        {label}
      </span>
    )}
    <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-black/5 dark:shadow-white/5">
      {children}
    </div>
  </div>
);

// Sélecteur d'espace de travail modernisé
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
  const [showModal, setShowModal] = useState(false);
  
  if (modeEnfant) return null;

  const currentWorkspace = workspaces?.find(w => w.id === workspaceId);

  return (
    <>
      {/* Version desktop */}
      <button
        data-workspace-button
        onClick={() => setShowModal(true)}
        className="hidden md:flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl px-3 py-2 max-w-[200px] hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 group"
      >
        <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
          {currentWorkspace?.name || 'Espace par défaut'}
        </span>
        <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Version mobile */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-lg px-2 py-1.5 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
      >
        <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
          {currentWorkspace?.name || 'Espace'}
        </span>
      </button>

      {/* Modal workspace */}
      <WorkspaceModal
        open={showModal}
        onOpenChange={setShowModal}
        workspaces={workspaces || []}
        currentWorkspaceId={workspaceId}
        onChangeWorkspace={onChangeWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        onRenameWorkspace={onRenameWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
      />
    </>
  );
};

// Modal workspace modernisée et améliorée
const WorkspaceModal = ({
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
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    if (newName.trim() && onCreateWorkspace) {
      onCreateWorkspace();
      setNewName('');
    }
  };

  const handleEdit = (workspace: { id: string; name: string }) => {
    setEditingId(workspace.id);
    setEditingName(workspace.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim() && onRenameWorkspace) {
      onRenameWorkspace(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    if (onDeleteWorkspace && window.confirm('Êtes-vous sûr de vouloir supprimer cet espace de travail ?')) {
      onDeleteWorkspace(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Espaces de travail
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Organisez vos conversations par projets ou sujets
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section de création améliorée */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Créer un nouvel espace
            </h3>
            <div className="flex gap-3">
              <Input
                placeholder="Nom de l'espace de travail..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="flex-1 rounded-2xl"
              />
              <ModernButton
                variant="primary"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-2xl"
              >
                <PlusCircle className="w-4 h-4" />
              </ModernButton>
            </div>
          </div>

          {/* Liste des espaces améliorée */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Espaces disponibles ({workspaces.length})
            </h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`group p-4 rounded-2xl border transition-all duration-200 ${
                    workspace.id === currentWorkspaceId
                      ? 'border-slate-300 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/40 dark:to-slate-950/40 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800 dark:hover:to-gray-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        workspace.id === currentWorkspaceId 
                          ? 'bg-blue-500 shadow-blue-500/50' 
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                      
                      {editingId === workspace.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="h-8 px-2 py-1 text-sm"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {workspace.name}
                          </span>
                          {workspace.id === currentWorkspaceId && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                              Actif
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {editingId === workspace.id ? (
                        <>
                          <ModernButton
                            variant="success"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="rounded-2xl"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </ModernButton>
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="rounded-2xl"
                          >
                            <X className="w-4 h-4" />
                          </ModernButton>
                        </>
                      ) : (
                        <>
                          {workspace.id !== currentWorkspaceId && (
                            <ModernButton
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                onChangeWorkspace?.(workspace.id);
                                onOpenChange(false);
                              }}
                              className="rounded-2xl"
                            >
                              Activer
                            </ModernButton>
                          )}
                          
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(workspace)}
                            className="rounded-2xl"
                          >
                            <Pencil className="w-4 h-4" />
                          </ModernButton>
                          
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(workspace.id)}
                            className="rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </ModernButton>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {workspaces.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucun espace de travail créé</p>
                  <p className="text-xs mt-1">Créez votre premier espace ci-dessus</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex gap-2">
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Implémenter l'import/export
                  console.log('Importer espaces');
                }}
                className="flex-1 rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Importer
              </ModernButton>
              
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Implémenter l'export
                  console.log('Exporter espaces');
                }}
                className="flex-1 rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </ModernButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Actions mobiles repensées
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
  <div className="md:hidden flex items-center gap-1">
    {/* Actions essentielles */}
    <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      <ModernButton
        variant="primary"
        size="sm"
        onClick={onNewDiscussion}
        tooltip="Nouvelle discussion"
        className="w-8 h-8 p-0"
      >
        <PlusCircle className="w-4 h-4" />
      </ModernButton>
      
      <ModernButton
        variant={muted ? "danger" : "success"}
        size="sm"
        onClick={handleVolumeToggle}
        tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
        className="w-8 h-8 p-0"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </ModernButton>
    </div>

    {/* Menu */}
    <ModernButton
      variant="ghost"
      size="sm"
      onClick={() => setShowMenu(true)}
      className="w-8 h-8 p-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg"
    >
      <Menu className="w-4 h-4" />
    </ModernButton>
  </div>
);

// Actions desktop modernisées - CORRIGÉ
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
  setShowMenu,
  ...unusedProps
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
  setShowMenu: (show: boolean) => void;
}) => {
  // Supprimer les avertissements pour les props non utilisées
  void unusedProps;
  
  return (
  <div
    className="hidden md:flex items-center gap-4"
    aria-label="Actions principales de la barre d'en-tête"
  >
    {/* Nouvelle discussion */}
    <ModernButton
      variant="primary"
      size="sm"
      onClick={onNewDiscussion}
      tooltip="Nouvelle discussion"
      aria-label="Démarrer une nouvelle discussion"
      className="flex items-center gap-2"
    >
      <PlusCircle className="w-5 h-5" aria-hidden="true" />
      <span className="font-semibold">Nouveau</span>
    </ModernButton>

    {selectionActions}

    {/* Contrôles */}
    <ButtonGroup label="Audio">
      <ModernButton
        variant="ghost"
        onClick={handleVolumeToggle}
        active={!muted}
        tooltip={muted ? 'Activer audio' : 'Désactiver audio'}
        className="w-9 h-9 p-0"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </ModernButton>
      
      {!modeEnfant && (
        <ModernButton
          variant="ghost"
          onClick={handleModeVocalToggle}
          tooltip="Mode vocal"
          className="w-9 h-9 p-0"
        >
          <Mic className="w-4 h-4" />
        </ModernButton>
      )}
    </ButtonGroup>

    {/* Modes IA */}
    {/* <ButtonGroup label="Modes">
      {!modeEnfant && (
        <ModernButton
          variant="ghost"
          onClick={handlePrivateModeToggle}
          active={modePrive}
          tooltip="Mode privé"
          className="w-9 h-9 p-0"
        >
          <Shield className="w-4 h-4" />
        </ModernButton>
      )}
      
      <ModernButton
        variant="ghost"
        onClick={handleChildModeToggle}
        active={!!modeEnfant}
        tooltip="Mode enfant"
        className="w-9 h-9 p-0"
      >
        <Baby className="w-4 h-4" />
      </ModernButton>
      
      {!modeEnfant && (
        <>
          <ModernButton
            variant="ghost"
            onClick={handleRagToggle}
            active={ragEnabled}
            tooltip="RAG"
            className="w-9 h-9 p-0"
          >
            <Database className="w-4 h-4" />
          </ModernButton>
          
          <ModernButton
            variant="ghost"
            onClick={handleWebToggle}
            active={!!webEnabled}
            tooltip="Recherche web"
            className="w-9 h-9 p-0"
          >
            <Globe className="w-4 h-4" />
          </ModernButton>
          
        </>
      )}
    </ButtonGroup> */}

    {/* Settings */}
    <ModernButton
      variant="ghost"
      onClick={() => setShowMenu(true)}
      tooltip="Paramètres"
      className="w-9 h-9 p-0"
    >
      <Settings2 className="w-4 h-4" />
    </ModernButton>
  </div>
  );
};

// Banner mode privé modernisé
const PrivateModeBanner = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-center py-2 shadow-lg animate-slide-down">
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
  usePWA();
  const [showMenu, setShowMenu] = useState(false);
  const [showVocalSettings, setShowVocalSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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


  const handleChildModeToggle = useCallback(() => {
    onToggleModeEnfant?.();
  }, [onToggleModeEnfant]);

  // Actions de sélection
  const selectionActions = useMemo(() => {
    if (!props.hasActiveConversation) return null;

    return (
      <ButtonGroup>
        <ModernButton
          variant={props.selectMode ? "primary" : "ghost"}
          onClick={props.onToggleSelectMode}
          tooltip={props.selectMode ? 'Quitter la sélection' : 'Sélectionner des messages'}
          size="sm"
        >
          {props.selectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
          {props.selectMode ? 'Sélection' : 'Sélectionner'}
        </ModernButton>

        {props.selectMode && (
          <>
            <ModernButton
              variant="ghost"
              onClick={props.selectedCount === props.totalCount ? props.onDeselectAll : props.onSelectAll}
              tooltip={props.selectedCount === props.totalCount ? 'Tout désélectionner' : 'Tout sélectionner'}
              size="sm"
            >
              {props.selectedCount === props.totalCount ? 'Désélectionner' : 'Tout sélectionner'}
            </ModernButton>

            {props.selectedCount > 0 && (
              <ModernButton
                variant="danger"
                onClick={props.onRequestDelete}
                tooltip={`Supprimer ${props.selectedCount} message${props.selectedCount > 1 ? 's' : ''}`}
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                ({props.selectedCount})
              </ModernButton>
            )}
          </>
        )}
      </ButtonGroup>
    );
  }, [props.hasActiveConversation, props.selectMode, props.selectedCount, props.totalCount, props.onToggleSelectMode, props.onSelectAll, props.onDeselectAll, props.onRequestDelete]);

  return (
    <>
      <header className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 relative">
        {/* Audio */}
        <audio ref={audioRef} preload="auto">
          <source src="/bip2.mp3" type="audio/mpeg" />
          <source src="/bip2.ogg" type="audio/ogg" />
        </audio>

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et branding */}
            <div className="flex items-center flex-1 min-w-0">
              <Logo 
                onNewDiscussion={props.onNewDiscussion} 
                isOnline={isOnline} 
                quality={connectionQuality} 
              />
              
               
               {/* PWA Status */}
               {/* {(isInstalled || isInstallable) && (
                 <div className="ml-2">
                   {isInstalled ? (
                     <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                       <Smartphone className="w-3 h-3" />
                       <span className="hidden sm:inline">PWA</span>
                     </div>
                   ) : isInstallable ? (
                     <button
                       onClick={installApp}
                       className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                     >
                       <Download className="w-3 h-3" />
                       <span className="hidden sm:inline">Installer</span>
                     </button>
                   ) : null}
                 </div>
               )} */}
              
              {/* Workspace selector */}
              <div className="ml-4">
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
            </div>

            {/* Actions desktop */}
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
              setShowMenu={setShowMenu}
            />

            {/* Actions mobiles */}
            <MobileActions
              muted={props.muted}
              onNewDiscussion={props.onNewDiscussion}
              handleVolumeToggle={handleVolumeToggle}
              setShowMenu={setShowMenu}
            />
          </div>
        </div>

        {/* Banner mode privé */}
        <PrivateModeBanner show={showPrivateIndicator} />

         {/* Indicateurs de statut mobile */}
         {(props.modePrive || props.modeEnfant || props.ragEnabled || props.webEnabled) && (
           <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
             <div className="w-full px-4 py-2">
              <div className="flex items-center gap-2 text-xs">
                {props.modePrive && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    <Shield className="w-3 h-3" />
                    <span className="font-medium">Privé</span>
                  </div>
                )}
                {props.modeEnfant && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300">
                    <Baby className="w-3 h-3" />
                    <span className="font-medium">Enfant</span>
                  </div>
                )}
                {props.ragEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    <Database className="w-3 h-3" />
                    <span className="font-medium">RAG</span>
                  </div>
                )}
                {props.webEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    <Globe className="w-3 h-3" />
                    <span className="font-medium">Web</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sheet menu mobile modernisé */}
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetContent side="right" className="p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/50 w-[90vw] max-w-md">
            <SheetHeader className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Paramètres
                </h2>
                <ModernButton
                  variant="ghost"
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </ModernButton>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Actions principales */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Actions
                </h3>
                 <div className="grid grid-cols-2 gap-2">
                   <ModernButton
                     variant="primary"
                     onClick={() => {
                       props.onNewDiscussion();
                       setShowMenu(false);
                     }}
                     className="h-12 flex-col gap-1"
                   >
                     <PlusCircle className="w-4 h-4" />
                     <span className="text-xs">Nouveau</span>
                   </ModernButton>
                  
                   {!props.modeEnfant && (
                     <ModernButton
                       variant="secondary"
                       onClick={() => {
                         props.onOpenHistory();
                         setShowMenu(false);
                       }}
                       className="h-12 flex-col gap-1"
                     >
                       <History className="w-4 h-4" />
                       <span className="text-xs">Historique</span>
                     </ModernButton>
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
                     <ModernButton
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
                     </ModernButton>
                   )}
                   
                   <ModernButton
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
                   </ModernButton>
                   
                   {!props.modeEnfant && (
                     <>
                       <ModernButton
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
                       </ModernButton>
                       
                       <ModernButton
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
                       </ModernButton>
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
                      <ModernButton
                        variant="ghost"
                        onClick={() => {
                          props.onOpenTTSSettings();
                          setShowMenu(false);
                        }}
                        className="w-full justify-start h-12"
                      >
                        <Volume2 className="w-4 h-4 mr-3" />
                        Synthèse vocale
                      </ModernButton>
                      
                      <ModernButton
                        variant="ghost"
                        onClick={() => {
                          props.onOpenRagDocs();
                          setShowMenu(false);
                        }}
                        className="w-full justify-start h-12"
                      >
                        <BookOpen className="w-4 h-4 mr-3" />
                        Documents RAG
                      </ModernButton>
                      
                      <ModernButton
                        variant="ghost"
                        onClick={() => {
                          props.onOpenBoltPrompt?.();
                          setShowMenu(false);
                        }}
                        className="w-full justify-start h-12"
                      >
                        <Sparkles className="w-4 h-4 mr-3" />
                        Prompts bolt.new
                      </ModernButton>
                    </>
                  )}
                  
                  <ModernButton
                    variant="ghost"
                    onClick={() => {
                      toggleTheme();
                      setShowMenu(false);
                    }}
                    className="w-full justify-start h-12"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                    {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  </ModernButton>
                  
                  
                  {!props.modeEnfant && (
                    <ModernButton
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
                    </ModernButton>
                  )}
                  
                  <ModernButton
                    variant="ghost"
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full justify-start h-12"
                  >
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Aide et documentation
                  </ModernButton>
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


      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={props.showConfirmDelete} onOpenChange={props.setShowConfirmDelete}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Supprimer {props.selectedCount} message{props.selectedCount > 1 ? 's' : ''} ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Cette action est <strong>irréversible</strong>. Les messages seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={props.onDeleteConfirmed} 
              className="rounded-xl bg-red-600 hover:bg-red-700"
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
        className="!bg-slate-900/90 !text-white !text-xs !px-3 !py-2 !rounded-xl !shadow-lg !z-50" 
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
        
        /* Barre de défilement personnalisée */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgb(148 163 184 / 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(148 163 184 / 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgb(148 163 184 / 0.8);
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