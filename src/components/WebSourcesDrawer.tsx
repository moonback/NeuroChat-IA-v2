// React import supprimé: non nécessaire avec JSX runtime moderne
import { Globe, X, ExternalLink } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import type { WebSource } from './WebSourcesSidebar';

interface WebSourcesDrawerProps {
  open: boolean;
  onClose: () => void;
  usedSources: WebSource[];
}

export function WebSourcesDrawer({ open, onClose, usedSources }: WebSourcesDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-500" />
            <DrawerTitle>Sources Web</DrawerTitle>
            <span className="text-sm text-slate-500">({usedSources.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Version mobile simplifiée des sources web */}
          <div className="space-y-3">
            {usedSources.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <Globe className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm">Aucune source web utilisée</p>
                <p className="text-xs text-slate-400 mt-1">Les sources apparaîtront ici lors des recherches web</p>
              </div>
            ) : (
              usedSources.map((source, index) => (
                <div key={`${source.url}-${index}`} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="flex items-start gap-3">
                    <div className="text-lg">🌐</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {source.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        {source.url}
                      </p>
                      {source.snippet && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                          {source.snippet}
                        </p>
                      )}
                      {source.timestamp && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          {new Date(source.timestamp).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => window.open(source.url, '_blank')}
                      className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                      aria-label="Ouvrir la source"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default WebSourcesDrawer;
