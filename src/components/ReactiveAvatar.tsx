import React, { useEffect, useState, useCallback } from 'react';
import { Avatar3D, Avatar3DProps } from './Avatar3D';
import { analyzeSentiment, EmotionType } from '@/services/sentimentAnalyzer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarCustomizationPanel } from './AvatarCustomizationPanel';

export interface ReactiveAvatarProps {
  /** Messages récents pour l'analyse des sentiments */
  recentMessages: Array<{ text: string; isUser: boolean }>;
  /** Configuration de base de l'avatar */
  baseConfig?: Partial<Avatar3DProps>;
  /** Position de l'avatar dans l'interface */
  position?: 'left' | 'right' | 'center';
  /** Taille par défaut */
  defaultSize?: Avatar3DProps['size'];
  /** Callback lors de la modification de la configuration */
  onConfigChange?: (config: Partial<Avatar3DProps>) => void;
  /** État de chargement */
  isLoading?: boolean;
  /** Mode conversation actif */
  isConversing?: boolean;
}

export const ReactiveAvatar: React.FC<ReactiveAvatarProps> = ({
  recentMessages,
  baseConfig = {},
  position = 'left',
  defaultSize = 'lg',
  onConfigChange,
  isLoading = false,
  isConversing = false
}) => {
  const [avatarConfig, setAvatarConfig] = useState<Avatar3DProps>({
    emotion: 'neutral',
    style: 'modern',
    clothing: 'casual',
    size: defaultSize,
    animated: true,
    accessories: [],
    ...baseConfig
  });

  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [showCustomization, setShowCustomization] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState<EmotionType[]>([]);

  // Analyser les sentiments des messages récents
  const analyzeRecentSentiments = useCallback(() => {
    if (recentMessages.length === 0) return 'neutral';

    const lastMessage = recentMessages[recentMessages.length - 1];
    if (lastMessage.isUser) {
      // L'utilisateur parle, l'avatar écoute
      return 'listening';
    }

    // Analyser le sentiment du message de l'IA
    const sentiment = analyzeSentiment(lastMessage.text);
    return sentiment.emotion;
  }, [recentMessages]);

  // Mettre à jour l'émotion basée sur le contexte
  useEffect(() => {
    const newEmotion = analyzeRecentSentiments();
    
    if (newEmotion !== currentEmotion) {
      setCurrentEmotion(newEmotion);
      setEmotionHistory(prev => [...prev.slice(-4), newEmotion]);
    }
  }, [recentMessages, analyzeRecentSentiments, currentEmotion]);

  // Gérer le mode de conversation
  useEffect(() => {
    if (isConversing) {
      setCurrentEmotion('speaking');
    } else if (isLoading) {
      setCurrentEmotion('thinking');
    }
  }, [isConversing, isLoading]);

  // Mettre à jour la configuration
  const handleConfigChange = (newConfig: Partial<Avatar3DProps>) => {
    const updatedConfig = { ...avatarConfig, ...newConfig };
    setAvatarConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Obtenir la position CSS
  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'ml-auto';
      case 'center':
        return 'mx-auto';
      default:
        return 'mr-auto';
    }
  };

  // Obtenir l'émotion actuelle avec fallback
  const getCurrentEmotion = (): EmotionType => {
    if (isLoading) return 'thinking';
    if (isConversing) return 'speaking';
    return currentEmotion;
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', getPositionClasses())}>
      {/* Avatar principal */}
      <div className="relative group">
        <Avatar3D
          {...avatarConfig}
          emotion={getCurrentEmotion()}
          onClick={() => setShowCustomization(true)}
          className="transition-all duration-300 group-hover:scale-105"
        />
        
        {/* Indicateur d'état */}
        <div className="absolute -top-2 -right-2">
          {isLoading && (
            <Badge variant="secondary" className="animate-pulse">
              ⚡
            </Badge>
          )}
          {isConversing && (
            <Badge variant="default" className="animate-bounce">
              💬
            </Badge>
          )}
        </div>

        {/* Tooltip d'émotion */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Badge variant="outline" className="whitespace-nowrap">
            {getCurrentEmotion() === 'neutral' && '😐 Neutre'}
            {getCurrentEmotion() === 'happy' && '😊 Heureux'}
            {getCurrentEmotion() === 'sad' && '😔 Triste'}
            {getCurrentEmotion() === 'surprised' && '😲 Surpris'}
            {getCurrentEmotion() === 'thinking' && '🤔 Réfléchit'}
            {getCurrentEmotion() === 'speaking' && '💬 Parle'}
            {getCurrentEmotion() === 'listening' && '👂 Écoute'}
          </Badge>
        </div>
      </div>

      {/* Bouton de personnalisation */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCustomization(true)}
        className="text-xs opacity-70 hover:opacity-100 transition-opacity"
      >
        🎨 Personnaliser
      </Button>

      {/* Historique des émotions */}
      {emotionHistory.length > 0 && (
        <div className="flex space-x-1 opacity-60">
          {emotionHistory.slice(-3).map((emotion, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-current"
              style={{
                opacity: 0.3 + (index * 0.2),
                backgroundColor: getEmotionColor(emotion)
              }}
            />
          ))}
        </div>
      )}

      {/* Panneau de personnalisation */}
      <AvatarCustomizationPanel
        open={showCustomization}
        avatarConfig={avatarConfig}
        onConfigChange={handleConfigChange}
        onClose={() => setShowCustomization(false)}
      />
    </div>
  );
};

// Fonction utilitaire pour obtenir la couleur de l'émotion
function getEmotionColor(emotion: EmotionType): string {
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

// Fonction utilitaire pour les classes CSS
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default ReactiveAvatar;
