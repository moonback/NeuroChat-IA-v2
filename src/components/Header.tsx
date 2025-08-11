// =====================
// Imports
// =====================
import { useEffect, useState, useRef } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  MessageCircle, History, Settings2, Volume2, VolumeX, Sun, Moon, PlusCircle, Mic, Brain, Shield, BookOpen, CheckSquare, Square, Trash2, Menu, X
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
// Sélecteur de personnalité retiré

// =====================
// Constantes & Utilitaires
// =====================

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
  // Personnalité retirée
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
  // Props pour la sélection de messages
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
  
  modeVocalAuto,
  setModeVocalAuto,
  hasActiveConversation,
  ragEnabled,
  setRagEnabled,
  onOpenGeminiSettings,
  modePrive,
  setModePrive,
  onOpenMemoryModal,
  selectMode,
  onToggleSelectMode,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onRequestDelete,
  showConfirmDelete,
  setShowConfirmDelete,
  onDeleteConfirmed,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  return (
    <header className="app-header w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
      {/* Audio bip premium */}
      <audio ref={audioRef} src="/bip2.mp3" preload="auto" />

      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo et branding */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={onNewDiscussion}>
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 hover-lift">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                {/* Indicateur de statut */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isOnline && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  NeuroChat
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isOnline ? 'Connecté' : 'Hors ligne'}
                </p>
              </div>
            </div>

            {/* Indicateurs de statut - Badges compacts */}
            <div className="hidden sm:flex md:hidden lg:flex items-center gap-1.5">
              {modePrive && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 hover-lift">
                  <Shield className="w-3 h-3 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">Privé</span>
                </div>
              )}
              {ragEnabled && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 hover-lift">
                  <Brain className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">RAG</span>
                </div>
              )}
              {modeVocalAuto && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 hover-lift">
                  <Mic className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Auto</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions principales - Desktop */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Bouton Nouvelle discussion */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewDiscussion}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau</span>
              <span className="sm:hidden">New</span>
            </Button>

            {/* Historique */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenHistory}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">Hist.</span>
            </Button>

            {/* Sélection de messages - Si conversation active */}
            {hasActiveConversation && (
              <>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
                <Button
                  variant={selectMode ? "default" : "ghost"}
                  size="sm"
                  onClick={onToggleSelectMode}
                  className={`h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium hover-lift transition-colors ${
                    selectMode ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300" : ""
                  }`}
                >
                  {selectMode ? <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> : <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
                  <span className="hidden sm:inline">{selectMode ? 'Annuler' : 'Sélectionner'}</span>
                  <span className="sm:hidden">{selectMode ? 'Ann.' : 'Sel.'}</span>
                </Button>

                {selectMode && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
                      className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
                    >
                      <span className="hidden sm:inline">{selectedCount === totalCount ? 'Désélectionner tout' : 'Tout sélectionner'}</span>
                      <span className="sm:hidden">{selectedCount === totalCount ? 'Désel.' : 'Tout'}</span>
                    </Button>

                    {selectedCount > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={onRequestDelete}
                        className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium hover-lift"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">Supprimer ({selectedCount})</span>
                        <span className="sm:hidden">Supp. ({selectedCount})</span>
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Contrôles vocaux */}
            <Button
              variant="ghost"
              size="sm"
              onClick={muted ? onUnmute : onMute}
              className={`h-8 sm:h-9 w-8 sm:w-9 p-0 transition-colors hover-lift ${muted ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50'}`}
              title={muted ? 'Activer audio' : 'Désactiver audio'}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>

            <Button
              variant={modeVocalAuto ? "default" : "ghost"}
              size="sm"
              onClick={() => setModeVocalAuto(!modeVocalAuto)}
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 transition-colors hover-lift"
              title="Mode vocal automatique"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* Thème */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
              title="Changer le thème"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Personnalité IA retirée */}

            {/* Mode privé */}
            <Button
              variant={modePrive ? "destructive" : "ghost"}
              size="sm"
              onClick={() => setModePrive(!modePrive)}
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 transition-colors hover-lift"
              title="Mode privé"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* RAG */}
            <Button
              variant={ragEnabled ? "default" : "ghost"}
              size="sm"
              onClick={() => setRagEnabled(!ragEnabled)}
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 transition-colors hover-lift"
              title="Recherche documentaire"
            >
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* Bouton Menu pour autres options */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(true)}
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
              title="Plus d'options"
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Menu mobile button */}
          <div className="md:hidden flex items-center gap-1.5">
            {/* Boutons d'action rapide sur mobile */}
            <Button
              variant={modeVocalAuto ? "default" : "ghost"}
              size="sm"
              onClick={() => setModeVocalAuto(!modeVocalAuto)}
              className="h-8 w-8 p-0 transition-colors hover-lift"
              title="Mode vocal automatique"
            >
              <Mic className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
              title="Changer le thème"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(true)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover-lift"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile/options */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="max-w-sm mx-auto p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-2xl border shadow-xl">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">Options</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(false)} className="h-8 w-8 p-0 hover-lift">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {/* Actions principales mobile */}
              <div className="md:hidden space-y-1.5 sm:space-y-2">
                <Button variant="ghost" className="w-full justify-start h-10 rounded-xl hover-lift" onClick={() => { onNewDiscussion(); setShowMobileMenu(false); }}>
                  <PlusCircle className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                  Nouvelle discussion
                </Button>
                <Button variant="ghost" className="w-full justify-start h-10 rounded-xl hover-lift" onClick={() => { onOpenHistory(); setShowMobileMenu(false); }}>
                  <History className="w-4 h-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                  Historique
                </Button>
                
                {hasActiveConversation && (
                  <>
                    <div className="border-t border-slate-200 dark:border-slate-800 my-2 sm:my-3" />
                    <Button 
                      variant={selectMode ? "default" : "ghost"} 
                      className={`w-full justify-start h-10 rounded-xl hover-lift ${selectMode ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300" : ""}`} 
                      onClick={() => { onToggleSelectMode(); setShowMobileMenu(false); }}
                    >
                      {selectMode ? <CheckSquare className="w-4 h-4 mr-3" /> : <Square className="w-4 h-4 mr-3" />}
                      {selectMode ? 'Annuler sélection' : 'Sélectionner messages'}
                    </Button>
                    {selectMode && selectedCount > 0 && (
                      <Button variant="destructive" className="w-full justify-start h-10 rounded-xl hover-lift" onClick={() => { onRequestDelete(); setShowMobileMenu(false); }}>
                        <Trash2 className="w-4 h-4 mr-3" />
                        Supprimer sélection ({selectedCount})
                      </Button>
                    )}
                  </>
                )}
                
                <div className="border-t border-slate-200 dark:border-slate-800 my-2 sm:my-3" />
                
                <Button 
                  variant={modePrive ? "destructive" : "ghost"} 
                  className="w-full justify-start h-10 rounded-xl hover-lift" 
                  onClick={() => { setModePrive(!modePrive); setShowMobileMenu(false); }}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  {modePrive ? 'Désactiver mode privé' : 'Activer mode privé'}
                </Button>
                
                <Button 
                  variant={ragEnabled ? "default" : "ghost"} 
                  className="w-full justify-start h-10 rounded-xl hover-lift" 
                  onClick={() => { setRagEnabled(!ragEnabled); setShowMobileMenu(false); }}
                >
                  <Brain className="w-4 h-4 mr-3" />
                  {ragEnabled ? 'Désactiver RAG' : 'Activer RAG'}
                </Button>
                
                <div className="border-t border-slate-200 dark:border-slate-800 my-3" />
              </div>

              {/* Options toujours visibles */}
              {/* Personnalité IA retirée du menu */}

              <Button variant="ghost" className="w-full justify-start h-10" onClick={() => { onOpenTTSSettings(); setShowMobileMenu(false); }}>
                <Settings2 className="w-4 h-4 mr-3" />
                Réglages synthèse vocale
              </Button>

              <Button variant="ghost" className="w-full justify-start h-10" onClick={() => { onOpenRagDocs(); setShowMobileMenu(false); }}>
                <BookOpen className="w-4 h-4 mr-3" />
                Documents RAG
              </Button>

              <Button variant="ghost" className="w-full justify-start h-10" onClick={() => { onOpenMemoryModal(); setShowMobileMenu(false); }}>
                <BookOpen className="w-4 h-4 mr-3" />
                Mémoire utilisateur
              </Button>

              {onOpenGeminiSettings && (
                <Button variant="ghost" className="w-full justify-start h-10" onClick={() => { onOpenGeminiSettings(); setShowMobileMenu(false); }}>
                  <Settings2 className="w-4 h-4 mr-3" />
                  Réglages Gemini
                </Button>
              )}

              <Button variant="ghost" className="w-full justify-start h-10" onClick={() => { toggleTheme(); setShowMobileMenu(false); }}>
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* AlertDialog pour la confirmation de suppression */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selectedCount} message{selectedCount > 1 ? 's' : ''} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les messages sélectionnés seront définitivement supprimés de la conversation et de l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirmed}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReactTooltip id="header-tooltip" place="bottom" className="!bg-slate-900 !text-white !text-xs !px-2 !py-1 !rounded-lg !shadow-lg" />
      <ReactTooltip id="gemini-summary-tooltip" place="bottom" className="!bg-purple-900 !text-white !text-xs !px-2 !py-1 !rounded-lg !shadow-lg" />
    </header>
  );
}