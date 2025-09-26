import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database, Loader2, Sparkles } from 'lucide-react';

interface WorkspaceOpeningDialogProps {
  open: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceOpeningDialog({ open, name, onOpenChange }: WorkspaceOpeningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Chargement de l'espace
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
            Ouverture de l'espace « <span className="font-semibold text-slate-900 dark:text-white">{name}</span> » en cours...
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animation de chargement améliorée */}
          <div className="relative">
            {/* Cercle principal avec gradient */}
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-slate-500 via-slate-500 to-slate-600 p-0.5">
              <div className="h-full w-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>
            
            {/* Particules animées */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full border-2 border-blue-200 dark:border-blue-800 animate-ping opacity-20" />
              <div className="absolute h-24 w-24 rounded-full border border-purple-200 dark:border-purple-800 animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
            </div>
            
            {/* Icônes flottantes */}
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Database className="h-3 w-3 text-blue-500 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
          </div>
          
          {/* Texte de chargement avec animation */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Chargement des données...
            </p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-slate-500 via-slate-500 to-slate-600 rounded-full animate-pulse" 
                   style={{ 
                     width: '70%',
                     animation: 'loading-bar 2s ease-in-out infinite'
                   }} />
            </div>
          </div>
        </div>
        
        {/* Styles CSS personnalisés */}
        <style >{`
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

export default WorkspaceOpeningDialog;


