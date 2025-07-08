import { MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Square, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';

// Dropdown custom pour la personnalité IA
const personalities = [
  { value: 'formel', label: 'Formel', icon: <User className="w-4 h-4 mr-1 text-blue-500" />, color: 'from-blue-500 to-blue-700', bg: 'bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900' },
  { value: 'amical', label: 'Amical', icon: <User className="w-4 h-4 mr-1 text-emerald-500" />, color: 'from-emerald-400 to-green-500', bg: 'bg-gradient-to-r from-emerald-100 to-green-200 dark:from-emerald-800 dark:to-green-900' },
  { value: 'expert', label: 'Expert', icon: <User className="w-4 h-4 mr-1 text-purple-500" />, color: 'from-purple-500 to-indigo-600', bg: 'bg-gradient-to-r from-purple-100 to-indigo-200 dark:from-purple-800 dark:to-indigo-900' },
  { value: 'humoristique', label: 'Humoristique', icon: <User className="w-4 h-4 mr-1 text-yellow-500" />, color: 'from-yellow-400 to-orange-500', bg: 'bg-gradient-to-r from-yellow-100 to-orange-200 dark:from-yellow-800 dark:to-orange-900' },
];

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
      <Tooltip id="personality-tooltip" place="bottom" />
    </div>
  );
}

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
}

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
  stop,
  modeVocalAuto,
  setModeVocalAuto,
  hasActiveConversation,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
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

  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/90 dark:bg-slate-900/90 shadow-2xl rounded-3xl mb-4 gap-2 border border-white/40 dark:border-slate-800/60 backdrop-blur-2xl transition-all duration-300 glass relative z-10">
      {/* Logo & nom avec indicateur de statut */}
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto mb-2 sm:mb-0 group cursor-pointer hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg relative">
          <MessageCircle className="w-6 h-6 group-hover:rotate-6 transition-transform duration-200" />
          {/* Point vert animé */}
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">NeuroChat</span>
          <span className="text-xs text-muted-foreground truncate font-medium">Conversations IA, à votre image</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end w-full sm:w-auto">
        {/* Groupe principal */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl px-2 py-1 shadow-inner backdrop-blur-xl hover:shadow-xl transition-all duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewDiscussion}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
            title="Nouvelle discussion"
            aria-label="Nouvelle discussion"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Démarrer une nouvelle discussion"
          >
            <PlusCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenHistory}
            className="hover:bg-slate-200 dark:hover:bg-blue-900 group"
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
            className="hover:bg-yellow-100 dark:hover:bg-slate-800 group"
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
        </div>
        {/* Groupe vocal */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl px-2 py-1 shadow-inner backdrop-blur-xl hover:shadow-xl transition-all duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={muted ? onUnmute : onMute}
            className="hover:bg-red-100 dark:hover:bg-red-900 group"
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
            className={modeVocalAuto ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg animate-pulse' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}
            title={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            aria-label={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
          >
            <Mic className={modeVocalAuto ? 'text-white animate-pulse' : 'text-blue-500 group-hover:scale-110 transition-transform'} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenTTSSettings}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
            title="Réglages synthèse vocale"
            aria-label="Réglages synthèse vocale"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Réglages de la synthèse vocale"
          >
            <Settings2 className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
        {/* Groupe IA & RAG */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl px-2 py-1 shadow-inner backdrop-blur-xl hover:shadow-xl transition-all duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenRagDocs}
            className="hover:bg-green-100 dark:hover:bg-green-900 group"
            title="Gérer les documents RAG"
            aria-label="Gérer les documents RAG"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Gérer les documents RAG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </Button>
          {/* Sélecteur de personnalité IA (dropdown custom) */}
          <PersonalityDropdown selected={selectedPersonality} onChange={onChangePersonality} />
        </div>
        {/* Bouton Stop voix */}
        {hasActiveConversation && (
          <Button
            variant="destructive"
            size="sm"
            onClick={stop}
            disabled={muted}
            className="text-xs px-3 py-1 ml-2 rounded-lg flex items-center gap-1 shadow hover:bg-red-600/90 bg-red-500/90 text-white border-0 transition-all duration-200 focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Arrêter la voix"
            aria-label="Arrêter la voix"
            data-tooltip-id="header-tooltip"
            data-tooltip-content="Arrêter la lecture vocale en cours"
          >
            <Square className="w-3 h-3 mr-1" />
            Stop
          </Button>
        )}
      </div>
      <Tooltip id="header-tooltip" place="bottom" />
    </header>
  );
}