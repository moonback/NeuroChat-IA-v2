// =====================
// Imports
// =====================
import { useEffect, useState, useRef } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Square, Mic, User, Brain, Shield, BookOpen, Sparkles
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';

// =====================
// Constantes & Utilitaires
// =====================
const personalities = [
  { 
    value: 'formel', 
    label: 'Formel', 
    icon: <User className="w-5 h-5 mr-2 text-blue-500" />, 
    color: 'from-blue-500 to-blue-700', 
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800',
    description: 'Professionnel et structuré'
  },
  { 
    value: 'amical', 
    label: 'Amical', 
    icon: <User className="w-5 h-5 mr-2 text-emerald-500" />, 
    color: 'from-emerald-400 to-green-500', 
    bg: 'bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 border-emerald-200 dark:border-emerald-800',
    description: 'Chaleureux et accessible'
  },
  { 
    value: 'expert', 
    label: 'Expert', 
    icon: <User className="w-5 h-5 mr-2 text-purple-500" />, 
    color: 'from-purple-500 to-indigo-600', 
    bg: 'bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/30 border-purple-200 dark:border-purple-800',
    description: 'Technique et précis'
  },
  { 
    value: 'humoristique', 
    label: 'Humoristique', 
    icon: <User className="w-5 h-5 mr-2 text-yellow-500" />, 
    color: 'from-yellow-400 to-orange-500', 
    bg: 'bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30 border-yellow-200 dark:border-yellow-800',
    description: 'Léger et divertissant'
  },
];

function geminiConfigSummary(config: any) {
  if (!config) return '';
  return [
    `Temp: ${config.temperature ?? 0.7}`,
    `topK: ${config.topK ?? 40}`,
    `topP: ${config.topP ?? 0.95}`,
    `maxTokens: ${config.maxOutputTokens ?? 4096}`,
    `stopSeq: ${(config.stopSequences && config.stopSequences.length > 0) ? config.stopSequences.join(',') : '-'}`,
    `cand: ${config.candidateCount ?? 1}`
  ].join(' | ');
}

// =====================
// Composants internes
// =====================
function PersonalityModal({ open, onClose, selected, onChange }: { open: boolean; onClose: () => void; selected: string; onChange: (v: string) => void }) {
  return (
    <Drawer open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DrawerContent className="w-[98vw] sm:w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-md mx-auto px-4 sm:px-6 py-4 sm:py-6 rounded-3xl shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300">
        <DrawerHeader className="text-center pb-4">
          <DrawerTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Personnalité de l'IA
          </DrawerTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choisissez le style de communication qui vous convient
          </p>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 rounded-full p-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-400" 
            title="Fermer" 
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-2 pb-2">
          {personalities.map((p, index) => (
            <button
              key={p.value}
              className={`group relative flex items-center gap-3 w-full px-4 py-4 rounded-2xl font-medium text-left transition-all duration-300 ${p.bg} border-2 ${selected === p.value ? 'border-blue-500 ring-2 ring-blue-400/20 scale-[1.02]' : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'} hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 animate-in slide-in-from-left duration-200`}
              onClick={() => { onChange(p.value); onClose(); }}
              type="button"
              aria-label={`Sélectionner la personnalité ${p.label}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {p.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {p.description}
                </div>
              </div>
              {selected === p.value && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Actif</span>
                </div>
              )}
            </button>
          ))}
        </div>
        <DrawerFooter className="pt-4">
          <button 
            onClick={onClose} 
            className="w-full py-3 mt-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Fermer
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// =====================
// Types
// =====================
interface HeaderProps {
  muted: boolean;
  onMute: () => void;
  onUnmute: () => void;
  onNewDiscussion: () => void;
  onOpenHistory: () => void;
  onOpenTTSSettings: () => void;
  onOpenRagDocs: () => void;
  selectedPersonality: string;
  onChangePersonality: (value: string) => void;
  stop: () => void;
  modeVocalAuto: boolean;
  setModeVocalAuto: (v: boolean) => void;
  hasActiveConversation: boolean;
  ragEnabled: boolean;
  setRagEnabled: (v: boolean) => void;
  onOpenGeminiSettings?: () => void;
  geminiConfig?: any;
  modePrive: boolean;
  setModePrive: (v: boolean) => void;
  onOpenMemoryModal: () => void;
}

// =====================
// Composant principal Header
// =====================
export function Header({
  muted,
  onMute,
  onUnmute,
  onNewDiscussion,
  onOpenHistory,
  onOpenTTSSettings,
  onOpenRagDocs,
  selectedPersonality,
  onChangePersonality,
  modeVocalAuto,
  setModeVocalAuto,
  hasActiveConversation,
  ragEnabled,
  setRagEnabled,
  onOpenGeminiSettings,
  geminiConfig,
  modePrive,
  setModePrive,
  onOpenMemoryModal,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [, setShowStopButton] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const closeMobileMenu = () => setShowMobileMenu(false);

  // Effet bip mode privé avec feedback tactile
  useEffect(() => {
    if (modePrive && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      // Vibration tactile sur mobile si disponible
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  }, [modePrive]);

  // Effet statut en ligne
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (hasActiveConversation && !muted) {
      setShowStopButton(true);
    } else {
      setShowStopButton(false);
    }
  }, [hasActiveConversation, muted]);

  return (
    <header
      className="group w-full flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/90 dark:bg-slate-900/90 shadow-lg shadow-blue-100/20 dark:shadow-blue-900/10 rounded-3xl mb-2 gap-2 border border-white/60 dark:border-slate-800/60 backdrop-blur-3xl transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 relative z-20 ring-1 ring-blue-100/40 dark:ring-blue-900/30 hover:ring-blue-200/60 dark:hover:ring-blue-800/40"
    >
      {/* Audio bip premium */}
      <audio ref={audioRef} src="/bip2.mp3" preload="auto" />

      {/* Logo & nom + statut */}
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto mb-1 sm:mb-0 group/logo cursor-pointer transition-all duration-300 hover:scale-105 relative">
        <div className="relative">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 group-hover/logo:shadow-xl group-hover/logo:shadow-blue-500/40 transition-all duration-300 ring-2 ring-blue-400/10 dark:ring-blue-900/30 group-hover/logo:ring-blue-400/30 dark:group-hover/logo:ring-blue-800/50 group-hover/logo:scale-110">
            <MessageCircle className="w-8 h-8 group-hover/logo:rotate-12 group-hover/logo:scale-110 transition-transform duration-300 drop-shadow-sm" />
          </div>
          {/* Indicateur de statut amélioré */}
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} relative`}>
              {isOnline && (
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              )}
            </div>
          </div>
        </div>
        
        <div
          className="flex flex-col min-w-0 cursor-pointer group-hover/logo:scale-105 transition-transform duration-300"
          onClick={onNewDiscussion}
          title="Nouvelle conversation"
        >
          <span className="text-xl sm:text-2xl font-bold truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            NeuroChat
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
        
        {/* Actions rapides mobile */}
        <div className="sm:hidden flex flex-row gap-2 items-center ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewDiscussion}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2"
            aria-label="Nouvelle conversation"
            title="Démarrer une nouvelle conversation"
          >
            <PlusCircle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModePrive(!modePrive)}
            className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-2 ${modePrive ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md focus:ring-red-400/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-slate-400/50'}`}
            aria-label={modePrive ? 'Désactiver le mode privé' : 'Activer le mode privé'}
            title={modePrive ? 'Désactiver le mode privé' : 'Activer le mode privé'}
          >
            <Shield className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRagEnabled(!ragEnabled)}
            className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-2 ${ragEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md focus:ring-green-400/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-slate-400/50'}`}
            aria-label={ragEnabled ? 'Désactiver RAG' : 'Activer RAG'}
            title={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
          >
            <Brain className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenMemoryModal}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2"
            title="Mémoire utilisateur"
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Actions principales - desktop */}
      <div className="hidden sm:flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto flex-1 overflow-x-auto">
        {/* Groupe : Actions principales */}
        <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 rounded-2xl px-2 py-1.5 shadow-sm shadow-blue-100/20 dark:shadow-blue-900/10 backdrop-blur-xl hover:shadow-md hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 ring-1 ring-blue-200/20 dark:ring-blue-900/10 hover:ring-blue-300/30 dark:hover:ring-blue-800/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewDiscussion}
            className="w-10 h-10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-1"
            title="Nouvelle discussion"
            aria-label="Nouvelle discussion"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Démarrer une nouvelle discussion"
          >
            <PlusCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-1"
            title="Historique"
            aria-label="Historique"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Afficher l'historique des discussions"
          >
            <History className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-200" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-1"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-200" />
            )}
          </Button>
          
          {onOpenGeminiSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenGeminiSettings}
              className="w-10 h-10 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-1"
              title="Réglages Gemini"
              aria-label="Réglages Gemini"
              data-tooltip-id="gemini-summary-tooltip"
              data-tooltip-content={geminiConfigSummary(geminiConfig)}
            >
              <Settings2 className="w-5 h-5 text-purple-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
            </Button>
          )}
          
          <Button
            variant={modePrive ? 'destructive' : 'ghost'}
            size="sm"
            onClick={() => setModePrive(!modePrive)}
            className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-1 ${modePrive ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-400/50' : 'hover:bg-red-100 dark:hover:bg-red-900/50 focus:ring-red-400/50'}`}
            title={modePrive ? 'Désactiver le mode privé' : 'Activer le mode privé'}
            aria-label={modePrive ? 'Désactiver le mode privé' : 'Activer le mode privé'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={modePrive ? 'Mode privé activé : rien n\'est sauvegardé.' : 'Activer le mode privé'}
          >
            <Shield className={`w-5 h-5 ${modePrive ? 'text-white' : 'text-red-500'} group-hover:scale-110 transition-transform duration-200`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenMemoryModal}
            className="w-10 h-10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-1"
            title="Mémoire utilisateur"
            aria-label="Mémoire utilisateur"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Afficher la mémoire utilisateur"
          >
            <BookOpen className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
          </Button>
        </div>

        {/* Séparateur visuel amélioré */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-300/50 to-transparent mx-2 hidden sm:block" />

        {/* Groupe : Vocal */}
        <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 rounded-2xl px-2 py-1.5 shadow-sm shadow-blue-100/20 dark:shadow-blue-900/10 backdrop-blur-xl hover:shadow-md hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 ring-1 ring-blue-200/20 dark:ring-blue-900/10 hover:ring-blue-300/30 dark:hover:ring-blue-800/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={muted ? onUnmute : onMute}
            className="w-10 h-10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-red-400/50 focus:ring-offset-1"
            title={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            aria-label={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <Volume2 className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform duration-200" />
            )}
          </Button>
          
          <Button
            variant={modeVocalAuto ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setModeVocalAuto(!modeVocalAuto)}
            className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-1 ${modeVocalAuto ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md focus:ring-blue-400/50' : 'hover:bg-blue-100 dark:hover:bg-blue-900/50 focus:ring-blue-400/50'}`}
            title={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            aria-label={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
          >
            <Mic className={`w-5 h-5 ${modeVocalAuto ? 'text-white' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-200`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTTSSettings}
            className="w-10 h-10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-1"
            title="Réglages synthèse vocale"
            aria-label="Réglages synthèse vocale"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Réglages de la synthèse vocale"
          >
            <Settings2 className="w-5 h-5 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
          </Button>
        </div>

        {/* Séparateur visuel amélioré */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-300/50 to-transparent mx-2 hidden sm:block" />

        {/* Groupe : IA & RAG */}
        <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 rounded-2xl px-2 py-1.5 shadow-sm shadow-blue-100/20 dark:shadow-blue-900/10 backdrop-blur-xl hover:shadow-md hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 ring-1 ring-blue-200/20 dark:ring-blue-900/10 hover:ring-blue-300/30 dark:hover:ring-blue-800/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenRagDocs}
            className="w-10 h-10 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 group transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-green-400/50 focus:ring-offset-1"
            title="Gérer les documents RAG"
            aria-label="Gérer les documents RAG"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Gérer les documents RAG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          
          <Button
            variant={ragEnabled ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRagEnabled(!ragEnabled)}
            className={`relative px-3 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-1 ${ragEnabled ? 'bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-sm hover:shadow-md focus:ring-green-400/50' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-400/50'}`}
            title={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            aria-label={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
          >
            <span className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              RAG
            </span>
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${ragEnabled ? 'bg-green-300' : 'bg-red-400'} animate-pulse`}></span>
          </Button>
          
          {/* Sélecteur de personnalité amélioré */}
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-sm font-medium text-xs transition-all duration-200 cursor-pointer border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 ${personalities.find(p => p.value === selectedPersonality)?.bg} hover:shadow-md focus:ring-blue-400/50`}
            onClick={() => setShowPersonalityModal(true)}
            title="Personnalité de l'IA"
            aria-label="Personnalité de l'IA"
            type="button"
          >
            <span className="flex items-center gap-1">
              {personalities.find(p => p.value === selectedPersonality)?.icon}
              {personalities.find(p => p.value === selectedPersonality)?.label}
            </span>
            <svg className="w-3 h-3 ml-1 transition-transform duration-200" viewBox="0 0 20 20">
              <path fill="currentColor" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"/>
            </svg>
          </button>
          
          <PersonalityModal
            open={showPersonalityModal}
            onClose={() => setShowPersonalityModal(false)}
            selected={selectedPersonality}
            onChange={onChangePersonality}
          />
        </div>
      </div>

      {/* Menu mobile amélioré */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-md p-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/90 rounded-3xl shadow-2xl border-0 overflow-hidden backdrop-blur-3xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex flex-col gap-0 max-h-[90vh] overflow-y-auto">
            {/* Header du menu mobile amélioré */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm border-b border-blue-100/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Menu</span>
              </div>
              <button 
                onClick={closeMobileMenu} 
                aria-label="Fermer le menu" 
                className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-6 p-6">
              {/* Groupe 1 : Actions principales */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Actions principales</h3>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-blue-900 dark:text-blue-100 font-medium text-base justify-start h-12" 
                  onClick={() => { onNewDiscussion(); closeMobileMenu(); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Nouvelle discussion</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-indigo-900 dark:text-indigo-100 font-medium text-base justify-start h-12" 
                  onClick={() => { onOpenHistory(); closeMobileMenu(); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span>Historique</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-yellow-900 dark:text-yellow-100 font-medium text-base justify-start h-12" 
                  onClick={() => { toggleTheme(); closeMobileMenu(); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                    {theme === 'dark' ? 
                      <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> : 
                      <Moon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    }
                  </div>
                  <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
                </Button>
                
                {onOpenGeminiSettings && (
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-purple-900 dark:text-purple-100 font-medium text-base justify-start h-12" 
                    onClick={() => { onOpenGeminiSettings(); closeMobileMenu(); }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Settings2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>Réglages Gemini</span>
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className={`w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-medium text-base justify-start h-12 ${modePrive ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'}`} 
                  onClick={() => { setModePrive(!modePrive); closeMobileMenu(); }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${modePrive ? 'bg-red-100 dark:bg-red-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Shield className={`w-4 h-4 ${modePrive ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`} />
                  </div>
                  <span>{modePrive ? 'Désactiver le mode privé' : 'Activer le mode privé'}</span>
                </Button>
              </div>
              
              {/* Séparateur */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              
              {/* Groupe 2 : Vocal */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Contrôles vocaux</h3>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-green-900 dark:text-green-100 font-medium text-base justify-start h-12" 
                  onClick={() => { muted ? onUnmute() : onMute(); closeMobileMenu(); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    {muted ? 
                      <Volume2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : 
                      <VolumeX className="w-4 h-4 text-red-600 dark:text-red-400" />
                    }
                  </div>
                  <span>{muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-medium text-base justify-start h-12" 
                  onClick={() => { setModeVocalAuto(!modeVocalAuto); closeMobileMenu(); }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${modeVocalAuto ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Mic className={`w-4 h-4 ${modeVocalAuto ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                  </div>
                  <span>{modeVocalAuto ? 'Désactiver vocal auto' : 'Activer vocal auto'}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-blue-900 dark:text-blue-100 font-medium text-base justify-start h-12" 
                  onClick={() => { onOpenTTSSettings(); closeMobileMenu(); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Réglages synthèse vocale</span>
                </Button>
              </div>
              
              {/* Séparateur */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              
              {/* Groupe 3 : IA & RAG */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Intelligence artificielle</h3>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-green-900 dark:text-green-100 font-medium text-base justify-start h-12" 
                  onClick={() => { onOpenRagDocs(); closeMobileMenu(); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Documents RAG</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-medium text-base justify-start h-12" 
                  onClick={() => { setRagEnabled(!ragEnabled); closeMobileMenu(); }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${ragEnabled ? 'bg-green-100 dark:bg-green-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Brain className={`w-4 h-4 ${ragEnabled ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`} />
                  </div>
                  <span>{ragEnabled ? 'Désactiver RAG' : 'Activer RAG'}</span>
                  <span className={`ml-auto w-2 h-2 rounded-full ${ragEnabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-blue-900 dark:text-blue-100 font-medium text-base justify-start h-12"
                  onClick={() => { setShowPersonalityModal(true); closeMobileMenu(); }}
                  type="button"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    {personalities.find(p => p.value === selectedPersonality)?.icon}
                  </div>
                  <span>{personalities.find(p => p.value === selectedPersonality)?.label}</span>
                  <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">Personnalité</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReactTooltip id="header-tooltip" place="bottom" className="!bg-slate-900 !text-white !text-xs !px-2 !py-1 !rounded-lg !shadow-lg" />
      <ReactTooltip id="gemini-summary-tooltip" place="bottom" className="!bg-purple-900 !text-white !text-xs !px-2 !py-1 !rounded-lg !shadow-lg" />
    </header>
  );
}