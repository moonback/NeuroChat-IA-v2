import { MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Square, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

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

const personalities = [
  { value: 'formel', label: 'Formel', icon: <User className="w-4 h-4 mr-1 text-blue-500" /> },
  { value: 'amical', label: 'Amical', icon: <User className="w-4 h-4 mr-1 text-emerald-500" /> },
  { value: 'expert', label: 'Expert', icon: <User className="w-4 h-4 mr-1 text-purple-500" /> },
  { value: 'humoristique', label: 'Humoristique', icon: <User className="w-4 h-4 mr-1 text-yellow-500" /> },
];

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

  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/90 dark:bg-slate-900/90 shadow-xl rounded-3xl mb-4 gap-2 border border-white/40 dark:border-slate-800/60 backdrop-blur-xl transition-all duration-300">
      {/* Logo & nom */}
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto mb-2 sm:mb-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-transform duration-200">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm">NeuroChat</span>
          <span className="text-xs text-muted-foreground truncate font-medium">Conversations IA, à votre image</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end w-full sm:w-auto">
        {/* Groupe principal */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl px-2 py-1 shadow-inner">
          {/* Nouvelle discussion */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewDiscussion}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
            title="Nouvelle discussion"
            aria-label="Nouvelle discussion"
          >
            <PlusCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </Button>
          {/* Historique */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenHistory}
            className="hover:bg-slate-200 dark:hover:bg-blue-900 group"
            title="Historique"
            aria-label="Historique"
          >
            <History className="w-5 h-5 text-slate-600 dark:text-slate-200 group-hover:text-blue-500" />
          </Button>
          {/* Thème */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-yellow-100 dark:hover:bg-slate-800 group"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" />
            )}
          </Button>
        </div>
        {/* Groupe vocal */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl px-2 py-1 shadow-inner">
          {/* Mute/unmute TTS */}
          <Button
            variant="ghost"
            size="icon"
            onClick={muted ? onUnmute : onMute}
            className="hover:bg-red-100 dark:hover:bg-red-900 group"
            title={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            aria-label={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-red-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-green-500" />
            )}
          </Button>
          {/* Mode vocal automatique */}
          <Button
            variant={modeVocalAuto ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setModeVocalAuto(!modeVocalAuto)}
            className={modeVocalAuto ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}
            title={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
            aria-label={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
          >
            <Mic className={modeVocalAuto ? 'text-white animate-pulse' : 'text-blue-500'} />
          </Button>
          {/* Réglages TTS */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenTTSSettings}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
            title="Réglages synthèse vocale"
            aria-label="Réglages synthèse vocale"
          >
            <Settings2 className="w-5 h-5 text-blue-500" />
          </Button>
        </div>
        {/* Groupe IA & RAG */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl px-2 py-1 shadow-inner">
          {/* Gestion des documents RAG */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenRagDocs}
            className="hover:bg-green-100 dark:hover:bg-green-900 group"
            title="Gérer les documents RAG"
            aria-label="Gérer les documents RAG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </Button>
          {/* Sélecteur de personnalité IA */}
          <div className="relative ml-1">
            <select
              value={selectedPersonality}
              onChange={e => onChangePersonality(e.target.value)}
              className="appearance-none pl-7 pr-6 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all min-w-[110px] cursor-pointer"
              title="Personnalité de l'IA"
              aria-label="Personnalité de l'IA"
              style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat' }}
            >
              {personalities.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {personalities.find(p => p.value === selectedPersonality)?.icon}
            </span>
          </div>
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
          >
            <Square className="w-3 h-3 mr-1" />
            Stop
          </Button>
        )}
      </div>
    </header>
  );
}