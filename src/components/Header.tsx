import { ThemeToggle } from './ThemeToggle';
import { History, MessageCircle, Volume2, VolumeX, Plus, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 mb-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              
              {/* Indicateur de statut amélioré */}
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-red-500'
              } transition-all duration-300`}>
                <div className={`w-full h-full rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}></div>
              </div>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Voice Chat
                </h1>
                <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                  Des conversations IA, à ta façon
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-xs font-semibold ${
                    isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Bouton TTS amélioré */}
            <Button
              onClick={onToggleTTS}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 ${
                ttsMuted 
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400' 
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              }`}
              title={ttsMuted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            >
              {ttsMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            {/* Bouton Historique redesigné */}
            <Button
              onClick={onOpenHistory}
              variant="outline"
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 hover:shadow-md"
              title="Afficher l'historique"
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Historique</span>
            </Button>

            {/* Version mobile du bouton historique */}
            <Button
              onClick={onOpenHistory}
              variant="outline"
              size="icon"
              className="sm:hidden h-10 w-10 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
              title="Afficher l'historique"
            >
              <History className="w-4 h-4" />
            </Button>

            {/* Bouton Nouvelle Discussion redesigné */}
            <Button
              onClick={onNewDiscussion}
              className="group relative h-10 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 overflow-hidden"
              title="Nouvelle discussion"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle discussion</span>
                <span className="sm:hidden">Nouveau</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}