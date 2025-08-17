import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, Settings, Mic, Brain, Shield, Globe, 
  Database, Baby, History, Volume2, Palette,
  HelpCircle, Zap, Users, Lock
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            Guide d'utilisation NeuroChat
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="getting-started">Démarrage</TabsTrigger>
              <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
              <TabsTrigger value="modes">Modes</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Premiers pas
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Commencer une conversation
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Tapez votre message dans la zone de texte en bas de l'écran et appuyez sur Entrée ou cliquez sur le bouton d'envoi.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Utiliser la voix
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Cliquez sur l'icône microphone pour parler au lieu de taper. L'IA peut aussi vous répondre à voix haute.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Gérer l'historique
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Accédez à vos conversations précédentes via le bouton Historique dans le menu principal.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  Fonctionnalités principales
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      Mémoire intelligente
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      L'IA peut mémoriser des informations importantes sur vous pour personnaliser ses réponses.
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 ml-4">
                      <li>• Préférences personnelles</li>
                      <li>• Contexte professionnel</li>
                      <li>• Informations récurrentes</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-orange-500" />
                      Recherche documentaire (RAG)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Uploadez vos documents pour que l'IA puisse s'y référer dans ses réponses.
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 ml-4">
                      <li>• PDF, Word, texte</li>
                      <li>• Recherche intelligente</li>
                      <li>• Citations des sources</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Recherche web
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      L'IA peut rechercher des informations actuelles sur internet pour enrichir ses réponses.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-green-500" />
                      Synthèse vocale
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Écoutez les réponses de l'IA avec différentes voix et langues disponibles.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="modes" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Modes d'utilisation
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Mode Privé
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Vos conversations ne sont pas sauvegardées et la mémoire est désactivée.
                    </p>
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Idéal pour les informations sensibles
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-orange-500" />
                      Mode Enfant
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Interface simplifiée et contenu adapté aux enfants avec contrôles parentaux.
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 ml-4">
                      <li>• Filtrage du contenu</li>
                      <li>• Interface simplifiée</li>
                      <li>• Protection par PIN</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-blue-500" />
                      Mode Vocal Automatique
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      L'IA lit automatiquement ses réponses à voix haute sans intervention manuelle.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  Configuration
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Personnalisation
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Thème clair/sombre</li>
                      <li>• Voix de synthèse</li>
                      <li>• Langue d'interface</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Modèles IA
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• OpenAI GPT-4</li>
                      <li>• Google Gemini</li>
                      <li>• Mistral AI</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Sécurité
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• PIN mode enfant</li>
                      <li>• Mode privé</li>
                      <li>• Gestion des données</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        
        <div className="p-6 pt-0 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Besoin d'aide supplémentaire ? Contactez le support.
            </div>
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};