import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReactiveAvatar } from '../ReactiveAvatar';
import { AvatarCustomizationPanel } from '../AvatarCustomizationPanel';
import { useAvatarState } from '../../hooks/useAvatarState';
import { Settings, Home } from 'lucide-react';

export const AvatarTestPage: React.FC = () => {
  const [showCustomization, setShowCustomization] = useState(false);
  
  const avatarState = useAvatarState({
    initialConfig: {
      style: 'modern',
      clothing: 'tech',
      size: 'xl',
      animated: true,
      accessories: ['👓']
    },
    persistConfig: true,
    storageKey: 'test-avatar-config'
  });

  const testMessages = [
    { text: "Bonjour ! Comment allez-vous ?", isUser: false },
    { text: "Très bien, merci !", isUser: true },
    { text: "Parfait ! Que puis-je faire pour vous ?", isUser: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      {/* Navigation simple */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          🎭 Test Avatar
        </h1>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Retour
        </Button>
      </div>

      {/* Avatar centré avec bouton de personnalisation */}
      <div className="flex flex-col items-center space-y-8">
        {/* Bouton de personnalisation */}
        <Button
          onClick={() => setShowCustomization(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Settings className="w-4 h-4 mr-2" />
          Personnaliser l'Avatar
        </Button>

        {/* Avatar */}
        <div className="relative p-8 backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl">
          <ReactiveAvatar
            recentMessages={testMessages}
            baseConfig={avatarState.config}
            onConfigChange={avatarState.updateConfig}
            isLoading={false}
            isConversing={true}
            position="center"
            defaultSize="xl"
          />
        </div>

        {/* Informations de test */}
        <div className="text-center space-y-4">
          <div className="p-4 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <h3 className="text-lg font-semibold mb-2">Configuration Actuelle</h3>
            <div className="text-sm space-y-1">
              <p><strong>Style:</strong> {avatarState.config.style}</p>
              <p><strong>Vêtements:</strong> {avatarState.config.clothing}</p>
              <p><strong>Taille:</strong> {avatarState.config.size}</p>
              <p><strong>Accessoires:</strong> {avatarState.config.accessories?.join(', ') || 'Aucun'}</p>
              <p><strong>Animations:</strong> {avatarState.config.animated ? 'Activées' : 'Désactivées'}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <h3 className="text-lg font-semibold mb-2">Messages de Test</h3>
            <div className="text-sm space-y-1">
              {testMessages.map((msg, index) => (
                <p key={index} className={msg.isUser ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}>
                  <strong>{msg.isUser ? 'Utilisateur:' : 'IA:'}</strong> {msg.text}
                </p>
              ))}
            </div>
          </div>
        </div>
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
