import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReactiveAvatar } from '../ReactiveAvatar';
import { AvatarCustomizationPanel } from '../AvatarCustomizationPanel';
import { useAvatarState } from '../../hooks/useAvatarState';
import { Settings, Sparkles } from 'lucide-react';

export const AvatarDemo: React.FC = () => {
  const [showCustomization, setShowCustomization] = useState(false);
  
  const avatarState = useAvatarState({
    initialConfig: {
      style: 'modern',
      clothing: 'tech',
      size: 'xl',
      animated: true,
      accessories: ['👓', '💻']
    },
    persistConfig: true,
    storageKey: 'demo-avatar-config'
  });

  const demoMessages = [
    { text: "Bonjour ! Je suis votre assistant IA.", isUser: false },
    { text: "Comment puis-je vous aider aujourd'hui ?", isUser: false },
    { text: "J'aimerais personnaliser mon avatar.", isUser: true },
    { text: "Bien sûr ! Voici les options disponibles.", isUser: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
          🎭 Avatar IA 3D Réactif
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Découvrez notre avatar intelligent qui réagit à vos messages et se personnalise selon vos préférences
        </p>
      </div>

      {/* Avatar Centré */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          {/* Bouton de personnalisation */}
          <Button
            onClick={() => setShowCustomization(true)}
            className="absolute -top-4 -right-4 z-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Personnaliser
          </Button>
          
          {/* Avatar */}
          <div className="relative p-8 backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl">
            <ReactiveAvatar
              recentMessages={demoMessages}
              baseConfig={avatarState.config}
              onConfigChange={avatarState.updateConfig}
              isLoading={false}
              isConversing={true}
              position="center"
              defaultSize="xl"
            />
            
            {/* Badge d'état */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-green-500/20 text-green-300 border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                En conversation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-semibold mb-2">Personnalisation Avancée</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choisissez le style, les vêtements, la taille et les accessoires de votre avatar
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Intelligence Émotionnelle</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              L'avatar analyse vos messages et adapte ses expressions en temps réel
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold mb-2">Design Moderne</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Interface intuitive avec effets visuels et animations fluides
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowCustomization(true)}
          className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Commencer la Personnalisation
        </Button>
      </div>

      {/* Modal de personnalisation */}
      <AvatarCustomizationPanel
        open={showCustomization}
        onClose={() => setShowCustomization(false)}
        avatarConfig={avatarState.config}
        onConfigChange={avatarState.updateConfig}
      />
    </div>
  );
};
