import { ThemeToggle } from './ThemeToggle';
import { History, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isOnline: boolean;
  onNewDiscussion: () => void;
  onOpenHistory: () => void;
  ttsMuted: boolean;
  onToggleTTS: () => void;
}

export function Header({ isOnline, onNewDiscussion, onOpenHistory, ttsMuted, onToggleTTS }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          {/* Online status indicator */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <div className={`w-full h-full rounded-full ${
              isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Voice Chat
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
            <span>Des conversations IA, à ta façon</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button
          onClick={onToggleTTS}
          variant="ghost"
          size="icon"
          className="ml-2"
          title={ttsMuted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
        >
          {ttsMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-green-500" />}
        </Button>
        <Button
          onClick={onNewDiscussion}
          className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          title="Nouvelle discussion"
        >
          Nouvelle discussion
        </Button>
        <Button
          onClick={onOpenHistory}
          className="ml-2 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-100 font-semibold shadow hover:from-blue-100 hover:to-blue-300 dark:hover:from-blue-900 dark:hover:to-blue-800 transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-2"
          title="Afficher l'historique"
        >
          <History className="w-4 h-4" />
          Historique
        </Button>
      </div>
    </div>
  );
} 