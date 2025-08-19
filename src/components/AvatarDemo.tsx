import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar3D, Avatar3DProps } from './Avatar3D';
import { ReactiveAvatar } from './ReactiveAvatar';
import { useAvatarState } from '@/hooks/useAvatarState';
import { EmotionType } from '@/services/sentimentAnalyzer';

export const AvatarDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demo' | 'reactive' | 'customization'>('demo');
  const [demoEmotion, setDemoEmotion] = useState<EmotionType>('neutral');
  const [demoStyle, setDemoStyle] = useState<Avatar3DProps['style']>('modern');
  const [demoClothing, setDemoClothing] = useState<Avatar3DProps['clothing']>('casual');
  const [demoSize, setDemoSize] = useState<Avatar3DProps['size']>('lg');
  const [demoAccessories, setDemoAccessories] = useState<string[]>([]);

  // Hook pour l'avatar réactif
  const avatarState = useAvatarState({
    initialConfig: {
      style: 'modern',
      clothing: 'casual',
      size: 'lg',
      accessories: []
    }
  });

  // Messages de démonstration
  const demoMessages = [
    { text: "Bonjour ! Comment allez-vous aujourd'hui ?", isUser: false },
    { text: "Je vais très bien, merci !", isUser: true },
    { text: "C'est fantastique ! Je suis ravi de l'entendre.", isUser: false },
    { text: "Pouvez-vous m'aider avec un problème ?", isUser: true },
    { text: "Bien sûr ! Je vais réfléchir à la meilleure solution.", isUser: false }
  ];

  const emotions: EmotionType[] = ['neutral', 'happy', 'sad', 'surprised', 'thinking', 'speaking', 'listening'];
  const styles: Avatar3DProps['style'][] = ['modern', 'classic', 'futuristic', 'minimal'];
  const clothing: Avatar3DProps['clothing'][] = ['casual', 'formal', 'tech', 'creative'];
  const sizes: Avatar3DProps['size'][] = ['sm', 'md', 'lg', 'xl'];
  const accessories = ['👓', '🎩', '💍', '⌚', '🎧', '👜', '🌂', '🎭'];

  const toggleAccessory = (accessory: string) => {
    setDemoAccessories(prev => 
      prev.includes(accessory) 
        ? prev.filter(a => a !== accessory)
        : [...prev, accessory]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎭 Avatar IA 3D Réactif
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez l'avatar intelligent qui réagit aux émotions et s'adapte à votre style de conversation
          </p>
        </div>

        {/* Onglets */}
        <div className="flex justify-center space-x-2">
          {[
            { id: 'demo', label: '🎨 Démo Interactive', icon: '✨' },
            { id: 'reactive', label: '🤖 Avatar Réactif', icon: '⚡' },
            { id: 'customization', label: '⚙️ Configuration', icon: '🔧' }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'demo' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Démonstration Interactive
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar de démonstration */}
              <div className="flex justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                <Avatar3D
                  emotion={demoEmotion}
                  style={demoStyle}
                  clothing={demoClothing}
                  size={demoSize}
                  accessories={demoAccessories}
                  animated={true}
                />
              </div>

              {/* Contrôles d'émotion */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">😊 Émotions</h3>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {emotions.map(emotion => (
                    <Button
                      key={emotion}
                      variant={demoEmotion === emotion ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDemoEmotion(emotion)}
                      className="flex-col gap-1 h-16"
                    >
                      <span className="text-lg">
                        {emotion === 'neutral' && '😐'}
                        {emotion === 'happy' && '😊'}
                        {emotion === 'sad' && '😔'}
                        {emotion === 'surprised' && '😲'}
                        {emotion === 'thinking' && '🤔'}
                        {emotion === 'speaking' && '💬'}
                        {emotion === 'listening' && '👂'}
                      </span>
                      <span className="text-xs capitalize">{emotion}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contrôles de style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🎭 Style Visuel</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {styles.map(style => (
                      <Button
                        key={style}
                        variant={demoStyle === style ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDemoStyle(style)}
                        className="flex-col gap-1 h-16"
                      >
                        <span className="text-lg">
                          {style === 'modern' && '✨'}
                          {style === 'classic' && '🎭'}
                          {style === 'futuristic' && '🚀'}
                          {style === 'minimal' && '⚪'}
                        </span>
                        <span className="text-xs capitalize">{style}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">👔 Vêtements</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {clothing.map(cloth => (
                      <Button
                        key={cloth}
                        variant={demoClothing === cloth ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDemoClothing(cloth)}
                        className="flex-col gap-1 h-16"
                      >
                        <span className="text-lg">
                          {cloth === 'casual' && '👕'}
                          {cloth === 'formal' && '👔'}
                          {cloth === 'tech' && '💻'}
                          {cloth === 'creative' && '🎨'}
                        </span>
                        <span className="text-xs capitalize">{cloth}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📏 Taille</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map(size => (
                      <Button
                        key={size}
                        variant={demoSize === size ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDemoSize(size)}
                        className="flex-col gap-1 h-16"
                      >
                        <div className={`
                          rounded-full bg-gradient-to-br from-blue-400 to-purple-500
                          ${size === 'sm' ? 'w-4 h-4' : ''}
                          ${size === 'md' ? 'w-6 h-6' : ''}
                          ${size === 'lg' ? 'w-8 h-8' : ''}
                          ${size === 'xl' ? 'w-10 h-10' : ''}
                        `} />
                        <span className="text-xs capitalize">{size}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accessoires */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🎁 Accessoires</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {accessories.map(accessory => (
                    <Button
                      key={accessory}
                      variant={demoAccessories.includes(accessory) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAccessory(accessory)}
                      className="flex-col gap-1 h-16"
                    >
                      <span className="text-lg">{accessory}</span>
                      <span className="text-xs">
                        {demoAccessories.includes(accessory) ? '✓' : '○'}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reactive' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Avatar Réactif en Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar réactif */}
                <div className="lg:col-span-1">
                  <ReactiveAvatar
                    recentMessages={demoMessages}
                    baseConfig={avatarState.config}
                    onConfigChange={avatarState.updateConfig}
                    isLoading={false}
                    isConversing={true}
                  />
                </div>

                {/* Messages de démonstration */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold">💬 Conversation de Démonstration</h3>
                  <div className="space-y-3">
                    {demoMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          message.isUser
                            ? 'bg-blue-100 dark:bg-blue-900 ml-8'
                            : 'bg-gray-100 dark:bg-gray-800 mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={message.isUser ? 'default' : 'secondary'}>
                            {message.isUser ? '👤 Utilisateur' : '🤖 IA'}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'customization' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Configuration et Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration actuelle */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🔧 Configuration Actuelle</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Style:</span>
                      <Badge variant="outline">{avatarState.config.style}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Vêtements:</span>
                      <Badge variant="outline">{avatarState.config.clothing}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Taille:</span>
                      <Badge variant="outline">{avatarState.config.size}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Accessoires:</span>
                      <Badge variant="outline">{avatarState.config.accessories?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Animations:</span>
                      <Badge variant={avatarState.config.animated ? 'default' : 'secondary'}>
                        {avatarState.config.animated ? 'Activées' : 'Désactivées'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📊 Statistiques d'Utilisation</h3>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const stats = avatarState.getStats();
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Total émotions:</span>
                            <Badge variant="outline">{stats.totalEmotions}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Émotion principale:</span>
                            <Badge variant="outline">{stats.mostUsedEmotion}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Version config:</span>
                            <Badge variant="outline">{stats.configVersion}</Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => avatarState.resetConfig()}
                >
                  🔄 Réinitialiser
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const config = avatarState.exportConfig();
                    navigator.clipboard.writeText(config);
                  }}
                >
                  📋 Exporter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => avatarState.clearEmotionHistory()}
                >
                  🗑️ Nettoyer Historique
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AvatarDemo;
