import { MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Square, Mic } from 'lucide-react';
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
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-white/80 dark:bg-slate-900/80 shadow-md rounded-2xl mb-4 gap-2">
      {/* Logo & nom */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-lg sm:text-xl font-bold truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">NeuroChat</span>
          <span className="text-xs text-muted-foreground truncate">Conversations IA, à votre image</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Nouvelle discussion */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewDiscussion}
          className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
          title="Nouvelle discussion"
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
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" />
          )}
        </Button>
        {/* Mute/unmute TTS */}
        <Button
          variant="ghost"
          size="icon"
          onClick={muted ? onUnmute : onMute}
          className="hover:bg-red-100 dark:hover:bg-red-900 group"
          title={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-red-500" />
          ) : (
            <Volume2 className="w-5 h-5 text-green-500" />
          )}
        </Button>
        {/* Bouton mode vocal automatique */}
        <Button
          variant={modeVocalAuto ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setModeVocalAuto(!modeVocalAuto)}
          className={modeVocalAuto ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}
          title={modeVocalAuto ? 'Désactiver le mode vocal automatique' : 'Activer le mode vocal automatique'}
        >
          <Mic className={modeVocalAuto ? 'text-white' : 'text-blue-500'} />
        </Button>
        {/* Réglages TTS */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenTTSSettings}
          className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
          title="Réglages synthèse vocale"
        >
          <Settings2 className="w-5 h-5 text-blue-500" />
        </Button>
        {/* Gestion des documents RAG */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenRagDocs}
          className="hover:bg-green-100 dark:hover:bg-green-900 group"
          title="Gérer les documents RAG"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </Button>
        {/* Sélecteur de personnalité IA */}
        <select
          value={selectedPersonality}
          onChange={e => onChangePersonality(e.target.value)}
          className="ml-2 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Personnalité de l'IA"
        >
          <option value="formel">Formel</option>
          <option value="amical">Amical</option>
          <option value="expert">Expert</option>
          <option value="humoristique">Humoristique</option>
        </select>
        {/* Bouton Stop voix */}
        <Button
          variant="ghost"
          size="sm"
          onClick={stop}
          disabled={muted}
          className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 rounded-md text-xs px-2 py-1 ml-2"
          title="Arrêter la voix"
        >
          <Square className="w-3 h-3 mr-1" />
          Stop
        </Button>
      </div>
    </header>
  );
}