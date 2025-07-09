// =====================
// Imports
// =====================
import { useEffect, useState, useRef } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Square, Mic, User, Brain, Shield
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// =====================
// Constantes & Utilitaires
// =====================
const personalities = [
  { value: 'formel', label: 'Formel', icon: <User className="w-4 h-4 mr-1 text-blue-500" />, color: 'from-blue-500 to-blue-700', bg: 'bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900' },
  { value: 'amical', label: 'Amical', icon: <User className="w-4 h-4 mr-1 text-emerald-500" />, color: 'from-emerald-400 to-green-500', bg: 'bg-gradient-to-r from-emerald-100 to-green-200 dark:from-emerald-800 dark:to-green-900' },
  { value: 'expert', label: 'Expert', icon: <User className="w-4 h-4 mr-1 text-purple-500" />, color: 'from-purple-500 to-indigo-600', bg: 'bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-800 dark:to-indigo-900' },
  { value: 'humoristique', label: 'Humoristique', icon: <User className="w-4 h-4 mr-1 text-yellow-500" />, color: 'from-yellow-400 to-orange-500', bg: 'bg-gradient-to-r from-yellow-100 to-orange-200 dark:from-yellow-800 dark:to-orange-900' },
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
function PersonalityDropdown({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = personalities.find(p => p.value === selected) || personalities[0];
  return (
    <div className="relative ml-1">
      <button
        className={`flex items-center gap-2 px-3 py-1 rounded-lg shadow font-semibold text-xs transition-all duration-200 cursor-pointer border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${current.bg} hover:scale-105 hover:shadow-xl`}
        onClick={() => setOpen(v => !v)}
        title="Personnalité de l'IA"
        aria-label="Personnalité de l'IA"
        type="button"
        data-tooltip-id="personality-tooltip"
        data-tooltip-content="Choisir la personnalité de l'IA"
      >
        <span className="flex items-center">{current.icon} {current.label}</span>
        <svg className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path fill="currentColor" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"/></svg>
      </button>
      {open && (
        <ul className="absolute z-30 left-0 mt-2 w-44 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden animate-fadeIn animate-slideInFromRight">
          {personalities.map(p => (
            <li key={p.value}>
              <button
                className={`flex items-center w-full gap-2 px-3 py-2 text-xs font-semibold transition-all duration-150 ${p.bg} hover:scale-105 hover:bg-opacity-80 focus:bg-opacity-90 ${selected === p.value ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => { onChange(p.value); setOpen(false); }}
                type="button"
                data-tooltip-id="personality-tooltip"
                data-tooltip-content={`Sélectionner la personnalité : ${p.label}`}
              >
                {p.icon} {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ReactTooltip id="personality-tooltip" place="bottom" />
    </div>
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
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [, setShowStopButton] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Ajout menu mobile
  const closeMobileMenu = () => setShowMobileMenu(false);

  // Effet bip mode privé
  useEffect(() => {
    if (modePrive && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
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
      className="w-full flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-1 sm:py-0 bg-white/80 dark:bg-slate-900/90 shadow-2xl rounded-3xl mb-1 gap-1 border border-white/40 dark:border-slate-800/60 backdrop-blur-2xl transition-all duration-300 glass relative z-20 ring-1 ring-blue-100/40 dark:ring-blue-900/30"
      style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)' }}
    >
      {/* Audio bip premium */}
      <audio ref={audioRef} src="/bip2.mp3" preload="auto" />

      {/* Logo & nom + statut */}
      <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto mb-1 sm:mb-0 group cursor-pointer hover:scale-105 transition-transform duration-200 relative">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl relative group/logo transition-all duration-300 hover:shadow-blue-400/40 hover:scale-110 ring-2 ring-blue-400/10 dark:ring-blue-900/30">
          <MessageCircle className="w-6 h-6 group-hover/logo:rotate-12 group-hover/logo:scale-110 transition-transform duration-300" />
          {/* Point vert animé */}
          <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
        </div>
        <div
          className="flex flex-col min-w-0 cursor-pointer"
          onClick={onNewDiscussion}
          title="Nouvelle conversation"
        >
          <span className="text-lg sm:text-xl font-extrabold truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-md tracking-tight animate-glowText group-hover:scale-105 transition-transform duration-200">
            <span className="hidden xs:inline">NeuroChat</span>
            <span className="inline xs:hidden">NC</span>
          </span>
        </div>
        {/* Badges d'état (desktop: à droite, mobile: icônes à droite du logo) */}
        <div className="hidden sm:flex flex-col gap-1 ml-4 items-end min-w-[120px]">
          <button
            onClick={() => setModePrive(!modePrive)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow border select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400/60 ${modePrive ? 'bg-gradient-to-r from-red-500 to-red-700 text-white border-red-600 scale-105 shadow-lg' : 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-700 border-slate-400 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow'}"}`}
            aria-label={modePrive ? 'Désactiver le mode privé/éphémère' : 'Activer le mode privé/éphémère'}
            title={modePrive ? 'Désactiver le mode privé/éphémère' : 'Activer le mode privé/éphémère'}
            type="button"
          >
            <Shield className="w-4 h-4 mr-1" /> {modePrive ? 'Privé activé' : 'Privé désactivé'}
          </button>
          <button
            onClick={() => setRagEnabled(!ragEnabled)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow border select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400/60 ${ragEnabled ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white border-green-500 scale-105 shadow-lg' : 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-700 border-slate-400 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow'}"}`}
            aria-label={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            title={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            type="button"
          >
            <Brain className="w-4 h-4 mr-1" /> {ragEnabled ? 'RAG activé' : 'RAG désactivé'}
          </button>
        </div>
        {/* Badges d'état mobile (icônes sur une ligne à droite du logo) + bouton burger */}
        <div className="flex sm:hidden flex-row gap-2 items-center ml-auto">
          <button
            onClick={() => setModePrive(!modePrive)}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400/60 ${modePrive ? 'bg-gradient-to-r from-red-500 to-red-700 border-red-600 scale-105 shadow-lg' : 'bg-gradient-to-r from-slate-200 to-slate-400 border-slate-400 dark:from-slate-700 dark:to-slate-800 dark:border-slate-700 hover:scale-105 hover:shadow'}"}`}
            aria-label={modePrive ? 'Désactiver le mode privé/éphémère' : 'Activer le mode privé/éphémère'}
            title={modePrive ? 'Désactiver le mode privé/éphémère' : 'Activer le mode privé/éphémère'}
            type="button"
          >
            <Shield className={`w-4 h-4 ${modePrive ? 'text-white' : 'text-slate-500 dark:text-slate-200'}`} />
          </button>
          <button
            onClick={() => setRagEnabled(!ragEnabled)}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400/60 ${ragEnabled ? 'bg-gradient-to-r from-green-400 to-emerald-600 border-green-500 scale-105 shadow-lg' : 'bg-gradient-to-r from-slate-200 to-slate-400 border-slate-400 dark:from-slate-700 dark:to-slate-800 dark:border-slate-700 hover:scale-105 hover:shadow'}"}`}
            aria-label={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            title={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            type="button"
          >
            <Brain className={`w-4 h-4 ${ragEnabled ? 'text-white' : 'text-slate-500 dark:text-slate-200'}`} />
          </button>
          <button
            className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 ml-1"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Ouvrir le menu"
          >
            <svg className="w-6 h-6 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
      {/* Badges d'état mobile (sous le logo) */}
      {/* SUPPRIMÉ : plus d'affichage vertical sous le logo sur mobile */}

      {/* Actions principales - desktop */}
      <div className="hidden sm:flex flex-wrap items-center gap-1 justify-end w-full sm:w-auto flex-1 overflow-x-auto">
        {/* Groupe : Actions principales */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/60 dark:bg-slate-800/70 rounded-xl px-1 py-0 shadow-xl backdrop-blur-xl hover:shadow-blue-400/20 transition-all duration-200 border border-slate-200 dark:border-slate-700 ring-1 ring-blue-200/20 dark:ring-blue-900/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewDiscussion}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 group focus:ring-2 focus:ring-blue-400/60 shadow-md hover:shadow-blue-400/30 transition-all duration-200 animate-glowBtn w-7 h-7"
            title="Nouvelle discussion"
            aria-label="Nouvelle discussion"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Démarrer une nouvelle discussion"
          >
            <PlusCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-transform drop-shadow-blue" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenHistory}
            className="hover:bg-slate-200 dark:hover:bg-blue-900 group focus:ring-2 focus:ring-blue-400/60 w-7 h-7"
            title="Historique"
            aria-label="Historique"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Afficher l'historique des discussions"
          >
            <History className="w-5 h-5 text-slate-600 dark:text-slate-200 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-yellow-100 dark:hover:bg-slate-800 group focus:ring-2 focus:ring-yellow-400/60 w-7 h-7"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" />
            )}
          </Button>
          {onOpenGeminiSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenGeminiSettings}
              className="hover:bg-purple-100 dark:hover:bg-purple-900 group focus:ring-2 focus:ring-purple-400/60 w-7 h-7"
              title="Réglages Gemini"
              aria-label="Réglages Gemini"
              data-tooltip-id="gemini-summary-tooltip"
              data-tooltip-content={geminiConfigSummary(geminiConfig)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" className="w-5 h-5 group-hover:scale-125 group-hover:rotate-6 transition-transform drop-shadow-lg" fill="none">
                <defs>
                  <radialGradient id="gemini-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f3e8ff" />
                    <stop offset="60%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </radialGradient>
                </defs>
                <circle cx="22" cy="22" r="20" fill="url(#gemini-gradient)" />
                <ellipse cx="22" cy="22" rx="11" ry="11" fill="#fff" fillOpacity="0.15" />
                <path d="M22 11a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm0 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#7c3aed" />
                <circle cx="22" cy="22" r="5" fill="#a78bfa" />
                <circle cx="22" cy="22" r="3" fill="#fff" fillOpacity="0.7" />
              </svg>
            </Button>
          )}
          <Button
            variant={modePrive ? 'destructive' : 'outline'}
            size="icon"
            onClick={() => setModePrive(!modePrive)}
            className={modePrive ? 'bg-red-600 text-white animate-pulse border-red-700 shadow-lg ring-2 ring-red-400/40 w-7 h-7' : 'hover:bg-red-100 dark:hover:bg-red-900 focus:ring-2 focus:ring-red-400/60 w-7 h-7'}
            title={modePrive ? 'Désactiver le mode privé/éphémère' : 'Activer le mode privé/éphémère'}
            aria-label={modePrive ? 'Désactiver le mode privé/éphémère' : 'Activer le mode privé/éphémère'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={modePrive ? 'Mode privé activé : rien n’est sauvegardé.' : 'Activer le mode privé : les messages ne seront pas sauvegardés et seront effacés à la fermeture.'}
          >
            {modePrive ? (
              // Icône mode privé activé améliorée (bouclier fermé avec effet)
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-md" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="shield-locked" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                </defs>
                <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" fill="url(#shield-locked)" stroke="#fff" strokeWidth="1.5"/>
                <rect x="9" y="13" width="6" height="4" rx="2" fill="#fff" fillOpacity="0.7"/>
                <circle cx="12" cy="15" r="1" fill="#b91c1c"/>
              </svg>
            ) : (
              // Icône mode privé désactivé améliorée (bouclier ouvert)
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-md" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="shield-open" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                </defs>
                <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" fill="url(#shield-open)" stroke="#b91c1c" strokeWidth="1.2"/>
                <path d="M12 13v2" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </Button>
        </div>

        {/* Séparateur visuel */}
        <div className="w-px h-6 bg-gradient-to-b from-blue-200/60 via-slate-300/30 to-purple-200/60 mx-1 hidden sm:block" />

        {/* Groupe : Vocal */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/60 dark:bg-slate-800/70 rounded-xl px-1 py-0 shadow-xl backdrop-blur-xl hover:shadow-blue-400/20 transition-all duration-200 border border-slate-200 dark:border-slate-700 ring-1 ring-blue-200/20 dark:ring-blue-900/10 mx-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={muted ? onUnmute : onMute}
            className="hover:bg-red-100 dark:hover:bg-red-900 group focus:ring-2 focus:ring-red-400/60 w-7 h-7"
            title={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            aria-label={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            ) : (
              <Volume2 className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
            )}
          </Button>
          <Button
            variant={modeVocalAuto ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setModeVocalAuto(!modeVocalAuto)}
            className={modeVocalAuto ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg animate-pulse ring-2 ring-blue-400/40 w-7 h-7' : 'hover:bg-blue-100 dark:hover:bg-blue-900 focus:ring-2 focus:ring-blue-400/60 w-7 h-7'}
            title={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            aria-label={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
          >
            <Mic className={modeVocalAuto ? 'text-white animate-pulse w-5 h-5' : 'text-blue-500 group-hover:scale-110 transition-transform w-5 h-5'} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenTTSSettings}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 group focus:ring-2 focus:ring-blue-400/60 w-7 h-7"
            title="Réglages synthèse vocale"
            aria-label="Réglages synthèse vocale"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Réglages de la synthèse vocale"
          >
            <Settings2 className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </Button>
        </div>

        {/* Séparateur visuel */}
        <div className="w-px h-6 bg-gradient-to-b from-blue-200/60 via-slate-300/30 to-purple-200/60 mx-1 hidden sm:block" />

        {/* Groupe : IA & RAG */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/60 dark:bg-slate-800/70 rounded-xl px-1 py-0 shadow-xl backdrop-blur-xl hover:shadow-blue-400/20 transition-all duration-200 border border-slate-200 dark:border-slate-700 ring-1 ring-blue-200/20 dark:ring-blue-900/10 mx-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenRagDocs}
            className="hover:bg-green-100 dark:hover:bg-green-900 group focus:ring-2 focus:ring-green-400/60 w-7 h-7"
            title="Gérer les documents RAG"
            aria-label="Gérer les documents RAG"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Gérer les documents RAG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </Button>
          <Button
            variant={ragEnabled ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRagEnabled(!ragEnabled)}
            className={`relative ${ragEnabled ? 'bg-white text-black hover:bg-white ring-2 ring-green-400/40' : 'bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-400/40'}`}
            title={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            aria-label={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
          >
            {ragEnabled ? (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-lg"></span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-lg"></span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V5a4 4 0 00-8 0v2m8 0a4 4 0 01-8 0" /></svg>
            {ragEnabled ? 'RAG' : 'RAG'}
          </Button>
          <PersonalityDropdown selected={selectedPersonality} onChange={onChangePersonality} />
        </div>

        
      </div>

      {/* Menu mobile (modale centrée) */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-md p-0 bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 rounded-3xl shadow-2xl border-0 overflow-hidden animate-fadeIn animate-slideInFromTop backdrop-blur-2xl">
          <div className="flex flex-col gap-6 p-0 max-h-[90vh] overflow-y-auto">
            {/* Header du menu mobile */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-blue-100 dark:border-slate-800 bg-gradient-to-r from-blue-100/60 via-white/60 to-indigo-100/60 dark:from-blue-900/40 dark:via-slate-900/40 dark:to-indigo-950/40 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-7 h-7 text-blue-500 drop-shadow" />
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Menu</span>
              </div>
              <button onClick={closeMobileMenu} aria-label="Fermer le menu" className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-6 px-6 pb-6">
              {/* Groupe 1 : Actions principales */}
              <div className="flex flex-col gap-3">
                <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-blue-300/30 dark:hover:shadow-blue-900/30 hover:scale-[1.03] transition-all duration-200 text-blue-900 dark:text-blue-100 font-semibold text-base" onClick={() => { onNewDiscussion(); closeMobileMenu(); }}>
                  <PlusCircle className="w-5 h-5 text-blue-500" /> Nouvelle discussion
                </Button>
                <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-indigo-300/30 dark:hover:shadow-indigo-900/30 hover:scale-[1.03] transition-all duration-200 text-indigo-900 dark:text-indigo-100 font-semibold text-base" onClick={() => { onOpenHistory(); closeMobileMenu(); }}>
                  <History className="w-5 h-5 text-indigo-500" /> Historique
                </Button>
                <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-yellow-300/30 dark:hover:shadow-yellow-900/30 hover:scale-[1.03] transition-all duration-200 text-yellow-900 dark:text-yellow-100 font-semibold text-base" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />} {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                </Button>
                {onOpenGeminiSettings && (
                  <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-purple-300/30 dark:hover:shadow-purple-900/30 hover:scale-[1.03] transition-all duration-200 text-purple-900 dark:text-purple-100 font-semibold text-base" onClick={() => { onOpenGeminiSettings(); closeMobileMenu(); }}>
                    <Settings2 className="w-5 h-5 text-purple-500" /> Réglages Gemini
                  </Button>
                )}
                <Button variant={modePrive ? 'destructive' : 'ghost'} size="lg" className={`w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-red-300/30 dark:hover:shadow-red-900/30 hover:scale-[1.03] transition-all duration-200 font-semibold text-base ${modePrive ? 'text-red-700 dark:text-red-200' : 'text-slate-900 dark:text-slate-100'}`} onClick={() => { setModePrive(!modePrive); closeMobileMenu(); }}>
                  <Square className="w-5 h-5 text-red-500" /> {modePrive ? 'Désactiver le mode privé' : 'Activer le mode privé'}
                </Button>
              </div>
              {/* Séparateur */}
              <div className="h-px w-full bg-gradient-to-r from-blue-200 via-slate-200 to-indigo-200 dark:from-blue-900 dark:via-slate-800 dark:to-indigo-900 my-2" />
              {/* Groupe 2 : Vocal */}
              <div className="flex flex-col gap-3">
                <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-green-300/30 dark:hover:shadow-green-900/30 hover:scale-[1.03] transition-all duration-200 text-green-900 dark:text-green-100 font-semibold text-base" onClick={muted ? onUnmute : onMute}>
                  {muted ? <Volume2 className="w-5 h-5 text-green-500" /> : <VolumeX className="w-5 h-5 text-red-500" />} {muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
                </Button>
                <Button variant={modeVocalAuto ? 'secondary' : 'ghost'} size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-blue-300/30 dark:hover:shadow-blue-900/30 hover:scale-[1.03] transition-all duration-200 font-semibold text-base" onClick={() => { setModeVocalAuto(!modeVocalAuto); closeMobileMenu(); }}>
                  <Mic className="w-5 h-5 text-blue-500" /> {modeVocalAuto ? 'Désactiver vocal auto' : 'Activer vocal auto'}
                </Button>
                <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-blue-300/30 dark:hover:shadow-blue-900/30 hover:scale-[1.03] transition-all duration-200 text-blue-900 dark:text-blue-100 font-semibold text-base" onClick={() => { onOpenTTSSettings(); closeMobileMenu(); }}>
                  <Settings2 className="w-5 h-5 text-blue-500" /> Réglages synthèse vocale
                </Button>
              </div>
              {/* Séparateur */}
              <div className="h-px w-full bg-gradient-to-r from-blue-200 via-slate-200 to-indigo-200 dark:from-blue-900 dark:via-slate-800 dark:to-indigo-900 my-2" />
              {/* Groupe 3 : IA & RAG */}
              <div className="flex flex-col gap-3">
                <Button variant="ghost" size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-green-300/30 dark:hover:shadow-green-900/30 hover:scale-[1.03] transition-all duration-200 text-green-900 dark:text-green-100 font-semibold text-base" onClick={() => { onOpenRagDocs(); closeMobileMenu(); }}>
                  <Settings2 className="w-5 h-5 text-green-500" /> Docs RAG
                </Button>
                <Button variant={ragEnabled ? 'secondary' : 'ghost'} size="lg" className="w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md hover:shadow-indigo-300/30 dark:hover:shadow-indigo-900/30 hover:scale-[1.03] transition-all duration-200 font-semibold text-base" onClick={() => { setRagEnabled(!ragEnabled); closeMobileMenu(); }}>
                  <Square className="w-5 h-5 text-indigo-500" /> {ragEnabled ? 'Désactiver RAG' : 'Activer RAG'}
                </Button>
                <div className="mt-1">
                  <PersonalityDropdown selected={selectedPersonality} onChange={v => { onChangePersonality(v); closeMobileMenu(); }} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ReactTooltip id="header-tooltip" place="bottom" />
    </header>
  );
}