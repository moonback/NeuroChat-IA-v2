import React, { useState, useEffect } from 'react';
import { ReactiveAvatar } from './ReactiveAvatar';
import { useAvatarState } from '../../hooks/useAvatarState';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

/**
 * Exemple d'intégration de l'avatar dans NeuroChat
 * Ce composant montre comment intégrer l'avatar réactif
 * dans différentes parties de l'application
 */

interface IntegrationExampleProps {
  /** Messages récents du chat */
  chatMessages: Array<{ text: string; isUser: boolean; timestamp: Date }>;
  /** État de génération de l'IA */
  isGenerating: boolean;
  /** Mode conversation actif */
  isConversing: boolean;
  /** Position de l'avatar dans l'interface */
  avatarPosition?: 'sidebar' | 'header' | 'floating';
}

export const IntegrationExample: React.FC<IntegrationExampleProps> = ({
  chatMessages,
  isGenerating,
  isConversing,
  avatarPosition = 'sidebar'
}) => {
  // État de l'avatar
  const avatarState = useAvatarState({
    initialConfig: {
      style: 'modern',
      clothing: 'tech',
      size: 'lg',
      accessories: ['👓', '⌚']
    },
    persistConfig: true,
    storageKey: 'neurochat-avatar-config'
  });

  // Messages récents pour l'analyse des sentiments
  const recentMessages = chatMessages.slice(-5).map(msg => ({
    text: msg.text,
    isUser: msg.isUser
  }));

  // Détecter le thème de la conversation
  const [conversationTheme, setConversationTheme] = useState<'casual' | 'formal' | 'tech' | 'creative'>('casual');

  useEffect(() => {
    // Analyser le thème basé sur le contenu des messages
    const techKeywords = ['code', 'programmation', 'développement', 'technologie', 'IA', 'machine learning'];
    const formalKeywords = ['professionnel', 'entreprise', 'business', 'officiel', 'formel'];
    const creativeKeywords = ['art', 'créativité', 'design', 'imagination', 'inspiration'];

    const allText = chatMessages.map(m => m.text.toLowerCase()).join(' ');
    
    if (techKeywords.some(keyword => allText.includes(keyword))) {
      setConversationTheme('tech');
    } else if (formalKeywords.some(keyword => allText.includes(keyword))) {
      setConversationTheme('formal');
    } else if (creativeKeywords.some(keyword => allText.includes(keyword))) {
      setConversationTheme('creative');
    } else {
      setConversationTheme('casual');
    }
  }, [chatMessages]);

  // Adapter l'avatar au thème de la conversation
  useEffect(() => {
    avatarState.updateConfig({ clothing: conversationTheme });
  }, [conversationTheme, avatarState]);

  // Rendu selon la position
  const renderAvatar = () => {
    const baseProps = {
      recentMessages,
      baseConfig: avatarState.config,
      onConfigChange: avatarState.updateConfig,
      isLoading: isGenerating,
      isConversing
    };

    switch (avatarPosition) {
      case 'header':
        return (
          <ReactiveAvatar
            {...baseProps}
            position="left"
            defaultSize="md"
          />
        );
      
      case 'floating':
        return (
          <div className="fixed bottom-6 right-6 z-50">
            <ReactiveAvatar
              {...baseProps}
              position="center"
              defaultSize="lg"
            />
          </div>
        );
      
      default: // sidebar
        return (
          <ReactiveAvatar
            {...baseProps}
            position="center"
            defaultSize="lg"
          />
        );
    }
  };

  // Statistiques de l'avatar
  const avatarStats = avatarState.getStats();

  return (
    <div className="space-y-6">
      {/* Avatar principal */}
      <div className="flex justify-center">
        {renderAvatar()}
      </div>

      {/* Informations de l'avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 État de l'Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {avatarStats.totalEmotions}
              </div>
              <div className="text-sm text-muted-foreground">
                Émotions détectées
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {avatarStats.mostUsedEmotion}
              </div>
              <div className="text-sm text-muted-foreground">
                Émotion principale
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {conversationTheme}
              </div>
              <div className="text-sm text-muted-foreground">
                Thème détecté
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {avatarState.config.accessories?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Accessoires
              </div>
            </div>
          </div>

          {/* Historique des émotions */}
          {avatarState.emotionHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">📈 Historique des Émotions</h4>
              <div className="flex space-x-2">
                {avatarState.emotionHistory.slice(-4).map((emotion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs"
                    style={{
                      opacity: 0.3 + (index * 0.2),
                      backgroundColor: getEmotionColor(emotion)
                    }}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="flex justify-center space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => avatarState.setCustomizing(true)}
            >
              🎨 Personnaliser
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => avatarState.resetConfig()}
            >
              🔄 Réinitialiser
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const config = avatarState.exportConfig();
                navigator.clipboard.writeText(config);
              }}
            >
              📋 Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration actuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Configuration Actuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Style</div>
              <Badge variant="secondary">{avatarState.config.style}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Vêtements</div>
              <Badge variant="secondary">{avatarState.config.clothing}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Taille</div>
              <Badge variant="secondary">{avatarState.config.size}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Animations</div>
              <Badge variant={avatarState.config.animated ? 'default' : 'secondary'}>
                {avatarState.config.animated ? 'Activées' : 'Désactivées'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fonction utilitaire pour obtenir la couleur de l'émotion
function getEmotionColor(emotion: string): string {
  switch (emotion) {
    case 'happy': return '#fbbf24';
    case 'sad': return '#3b82f6';
    case 'surprised': return '#ec4899';
    case 'thinking': return '#6b7280';
    case 'speaking': return '#10b981';
    case 'listening': return '#06b6d4';
    default: return '#9ca3af';
  }
}

export default IntegrationExample;
