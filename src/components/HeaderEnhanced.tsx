import { useState } from 'react';
import { 
  UnifiedButtonEnhanced, 
  UnifiedModalEnhanced, 
  UnifiedInputEnhanced,
  UnifiedContainerEnhanced
} from '@/components/ui/unified-enhanced';
import { 
  UnifiedModal,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalTitle,
  UnifiedModalDescription,
  UnifiedModalFooter
} from '@/components/ui/unified';
import { 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun, 
  User, 
  Search
} from 'lucide-react';

export function HeaderEnhanced() {
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Mon Espace de Travail');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <UnifiedContainerEnhanced 
      mode="normal" 
      variant="premium" 
      glow={true}
      className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-slate-800/20"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NeuroChat-IA-v2
              </h1>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex items-center space-x-2">
            {/* Bouton de recherche */}
            <UnifiedButtonEnhanced
              variant="ghost"
              size="icon"
              shimmer={true}
              tooltip="Rechercher"
              className="h-10 w-10"
            >
              <Search className="h-4 w-4" />
            </UnifiedButtonEnhanced>

            {/* Bouton d'espace de travail */}
            <UnifiedButtonEnhanced
              variant="secondary"
              shimmer={true}
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="hidden sm:flex"
            >
              <User className="h-4 w-4 mr-2" />
              {workspaceName}
            </UnifiedButtonEnhanced>

            {/* Bouton d'aide */}
            <UnifiedButtonEnhanced
              variant="ghost"
              size="icon"
              glow={true}
              onClick={() => setIsHelpModalOpen(true)}
              tooltip="Aide"
            >
              <HelpCircle className="h-4 w-4" />
            </UnifiedButtonEnhanced>

            {/* Bouton de thème */}
            <UnifiedButtonEnhanced
              variant="ghost"
              size="icon"
              morph={true}
              onClick={toggleTheme}
              tooltip="Basculer le thème"
              className="h-10 w-10"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </UnifiedButtonEnhanced>

            {/* Bouton de paramètres */}
            <UnifiedButtonEnhanced
              variant="ghost"
              size="icon"
              shimmer={true}
              tooltip="Paramètres"
            >
              <Settings className="h-4 w-4" />
            </UnifiedButtonEnhanced>
          </div>
        </div>
      </div>

      {/* Modal d'espace de travail */}
      <UnifiedModalEnhanced open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
        <UnifiedModalContent shimmer={true} glow={true}>
          <UnifiedModalHeader>
            <UnifiedModalTitle glow={true}>Gérer l'Espace de Travail</UnifiedModalTitle>
            <UnifiedModalDescription>
              Créez ou modifiez votre espace de travail personnalisé
            </UnifiedModalDescription>
          </UnifiedModalHeader>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nom de l'espace de travail</label>
              <UnifiedInputEnhanced
                variant="premium"
                shimmer={true}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Entrez le nom de votre espace de travail"
                clearButton={() => setWorkspaceName('')}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <UnifiedButtonEnhanced variant="premium" shimmer={true} size="sm">
                <User className="h-4 w-4 mr-2" />
                Créer un nouvel espace
              </UnifiedButtonEnhanced>
            </div>
          </div>
          
          <UnifiedModalFooter>
            <UnifiedButtonEnhanced 
              variant="secondary" 
              onClick={() => setIsWorkspaceModalOpen(false)}
            >
              Annuler
            </UnifiedButtonEnhanced>
            <UnifiedButtonEnhanced 
              variant="primary" 
              shimmer={true}
              onClick={() => setIsWorkspaceModalOpen(false)}
            >
              Sauvegarder
            </UnifiedButtonEnhanced>
          </UnifiedModalFooter>
        </UnifiedModalContent>
      </UnifiedModalEnhanced>

      {/* Modal d'aide */}
      <UnifiedModalEnhanced open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <UnifiedModalContent glass={true} glow={true}>
          <UnifiedModalHeader>
            <UnifiedModalTitle glow={true}>Guide d'Utilisation</UnifiedModalTitle>
            <UnifiedModalDescription>
              Découvrez toutes les fonctionnalités de NeuroChat-IA-v2
            </UnifiedModalDescription>
          </UnifiedModalHeader>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  🚀 Fonctionnalités Principales
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Chat intelligent avec IA multi-providers</li>
                  <li>• Recherche web intégrée</li>
                  <li>• Synthèse vocale et reconnaissance</li>
                  <li>• Système de mémoire utilisateur</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-xl">
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  🎨 Design Amélioré
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Effets visuels avancés (shimmer, glow, morph)</li>
                  <li>• Animations fluides et modernes</li>
                  <li>• Glassmorphism et effets néon</li>
                  <li>• Interface responsive et accessible</li>
                </ul>
              </div>
            </div>
          </div>
          
          <UnifiedModalFooter>
            <UnifiedButtonEnhanced 
              variant="secondary" 
              onClick={() => setIsHelpModalOpen(false)}
            >
              Fermer
            </UnifiedButtonEnhanced>
            <UnifiedButtonEnhanced 
              variant="premium" 
              shimmer={true}
              onClick={() => setIsHelpModalOpen(false)}
            >
              Compris !
            </UnifiedButtonEnhanced>
          </UnifiedModalFooter>
        </UnifiedModalContent>
      </UnifiedModalEnhanced>
    </UnifiedContainerEnhanced>
  );
}
