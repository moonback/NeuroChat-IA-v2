import { MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Square, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

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
      <ReactTooltip id="personality-tooltip" place="bottom" />
    </div>
  );
}

// Utilitaire pour formater le résumé des hyperparamètres
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
  ragEnabled,
  setRagEnabled,
  onOpenGeminiSettings,
  geminiConfig,
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
    <header className="w-full flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/80 dark:bg-slate-900/80 shadow-2xl rounded-3xl mb-4 gap-2 border border-white/30 dark:border-slate-800/50 backdrop-blur-3xl transition-all duration-300 glass relative z-20 ring-1 ring-blue-100/40 dark:ring-blue-900/30">
      {/* Logo & nom avec indicateur de statut */}
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto mb-2 sm:mb-0 group cursor-pointer hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg relative group/logo transition-all duration-300 hover:shadow-2xl hover:scale-110">
          <MessageCircle className="w-6 h-6 group-hover/logo:rotate-12 group-hover/logo:scale-110 transition-transform duration-300" />
          {/* Point vert animé */}
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
        </div>
        <div
          className="flex flex-col min-w-0 cursor-pointer"
          onClick={onNewDiscussion}
          title="Nouvelle conversation"
        >
          <span className="text-xl sm:text-2xl font-extrabold truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            NeuroChat
          </span>
          <span className="text-xs text-muted-foreground truncate font-medium">
            Conversations IA, à votre image
          </span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end w-full sm:w-auto">
        {/* Groupe principal */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl px-2 py-1 shadow-inner backdrop-blur-xl hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-700">
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
          {onOpenGeminiSettings && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenGeminiSettings}
                className="hover:bg-purple-100 dark:hover:bg-purple-900 group"
                title="Réglages Gemini"
                aria-label="Réglages Gemini"
                data-tooltip-id="gemini-summary-tooltip"
                data-tooltip-content={geminiConfigSummary(geminiConfig)}
              >
                {/* Icône Gemini SVG officielle */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none">
                  <g>
                    <circle cx="20" cy="20" r="20" fill="#fff" />
                    <path d="M20 7C13.373 7 8 12.373 8 19c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm0 21c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9-4.029 9-9 9z" fill="#8B5CF6"/>
                    <path d="M20 13a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z" fill="#A78BFA"/>
                  </g>
                </svg>
              </Button>
              <ReactTooltip id="gemini-summary-tooltip" place="bottom" />
            </>
          )}
        </div>
        {/* Groupe vocal */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl px-2 py-1 shadow-inner backdrop-blur-xl hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-700 mx-2">
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
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl px-2 py-1 shadow-inner backdrop-blur-xl hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-700 mx-2">
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
          {/* Toggle RAG */}
          <Button
            variant={ragEnabled ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRagEnabled(!ragEnabled)}
            className={`relative ${ragEnabled ? 'bg-white text-black hover:bg-white' : 'bg-white dark:bg-slate-900'}`}
            title={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            aria-label={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
            data-tooltip-id="header-tooltip"
            data-tooltip-content={ragEnabled ? 'Désactiver la recherche documentaire' : 'Activer la recherche documentaire'}
          >
            {/* Badge animé selon l'état */}
            {ragEnabled ? (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-lg"></span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-lg"></span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V5a4 4 0 00-8 0v2m8 0a4 4 0 01-8 0" /></svg>
            {ragEnabled ? 'RAG' : 'RAG'}
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
      <ReactTooltip id="header-tooltip" place="bottom" />
    </header>
  );
}