import React, { useState, useEffect } from 'react';
import { ReactiveAvatar } from '../ReactiveAvatar';
import { useAvatarState } from '../../hooks/useAvatarState';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Sparkles, Settings, RefreshCw, Copy, Heart, Brain, Zap } from 'lucide-react';

/**
 * Composant Avatar avec design amélioré pour NeuroChat
 * Design moderne avec glassmorphism, animations fluides et interface intuitive
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
          <div className="relative">
            <ReactiveAvatar
              {...baseProps}
              position="left"
              defaultSize="md"
            />
            {isGenerating && (
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        );
      
      case 'floating':
        return (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl scale-110 group-hover:scale-125 transition-transform duration-300"></div>
              <ReactiveAvatar
                {...baseProps}
                position="center"
                defaultSize="lg"
              />
              {isConversing && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default: // sidebar
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            <ReactiveAvatar
              {...baseProps}
              position="center"
              defaultSize="lg"
            />
          </div>
        );
    }
  };

  // Statistiques de l'avatar
  const avatarStats = avatarState.getStats();

  // Obtenir l'icône du thème
  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'tech': return <Brain className="w-4 h-4" />;
      case 'creative': return <Sparkles className="w-4 h-4" />;
      case 'formal': return <Zap className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar principal avec effet glassmorphism */}
      <div className="relative">
        <div className="flex justify-center">
          <div className="relative p-8 backdrop-blur-xl bg-white/10 dark:bg-black/10 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl">
            {renderAvatar()}
            
            {/* Badge d'état */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                isGenerating 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                  : isConversing 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isGenerating ? 'bg-blue-400 animate-pulse' :
                  isConversing ? 'bg-green-400 animate-pulse' :
                  'bg-gray-400'
                }`}></div>
                {isGenerating ? 'Génération...' : isConversing ? 'En conversation' : 'En attente'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques avec design moderne */}
      <Card className="backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/10 dark:border-white/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                🤖
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Intelligence Émotionnelle
              </span>
            </div>
            <Badge variant="outline" className="bg-white/5 border-white/10">
              v2.0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métriques principales avec design amélioré */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/20 hover:scale-105 transition-all duration-300">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {avatarStats.totalEmotions}
                </div>
                <div className="text-sm text-blue-300/80 font-medium">
                  Émotions Analysées
                </div>
              </div>
              <div className="absolute inset-0 bg-blue-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="group relative p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/20 hover:scale-105 transition-all duration-300">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  {avatarStats.mostUsedEmotion}
                </div>
                <div className="text-sm text-green-300/80 font-medium">
                  Émotion Dominante
                </div>
              </div>
              <div className="absolute inset-0 bg-green-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="group relative p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/20 hover:scale-105 transition-all duration-300">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-xl font-bold text-purple-300">
                  {getThemeIcon(conversationTheme)}
                  <span className="capitalize">{conversationTheme}</span>
                </div>
                <div className="text-sm text-purple-300/80 font-medium">
                  Contexte Détecté
                </div>
              </div>
              <div className="absolute inset-0 bg-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="group relative p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-400/20 hover:scale-105 transition-all duration-300">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {avatarState.config.accessories?.length || 0}
                </div>
                <div className="text-sm text-orange-300/80 font-medium">
                  Accessoires Actifs
                </div>
              </div>
              <div className="absolute inset-0 bg-orange-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Historique des émotions avec timeline */}
          {avatarState.emotionHistory.length > 0 && (
            <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-400/10">
              <h4 className="flex items-center space-x-2 font-semibold text-indigo-300">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span>Timeline Émotionnelle</span>
              </h4>
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {avatarState.emotionHistory.slice(-6).map((emotion, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 min-w-fit">
                    <Badge
                      className="text-xs font-medium transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: `${getEmotionColor(emotion)}20`,
                        borderColor: getEmotionColor(emotion),
                        color: getEmotionColor(emotion),
                        opacity: 0.4 + (index * 0.1)
                      }}
                    >
                      {emotion}
                    </Badge>
                    <div className="w-1 h-4 rounded-full" style={{ 
                      backgroundColor: getEmotionColor(emotion),
                      opacity: 0.4 + (index * 0.1)
                    }}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions avec design moderne */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 p-2 rounded-2xl bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-400/20 text-pink-300 hover:text-pink-200 transition-all duration-300"
                onClick={() => avatarState.setCustomizing(true)}
              >
                <Sparkles className="w-4 h-4" />
                <span>Personnaliser</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-400/20 text-blue-300 hover:text-blue-200 transition-all duration-300"
                onClick={() => avatarState.resetConfig()}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-400/20 text-green-300 hover:text-green-200 transition-all duration-300"
                onClick={() => {
                  const config = avatarState.exportConfig();
                  navigator.clipboard.writeText(config);
                }}
              >
                <Copy className="w-4 h-4" />
                <span>Exporter</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration avec design glassmorphism */}
      <Card className="backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/10 dark:border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Settings className="w-5 h-5 text-indigo-300" />
            </div>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Configuration Actuelle
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-400/10">
              <div className="text-sm font-medium text-blue-300/80">Style</div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                {avatarState.config.style}
              </Badge>
            </div>
            
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-400/10">
              <div className="text-sm font-medium text-green-300/80">Vêtements</div>
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                {avatarState.config.clothing}
              </Badge>
            </div>
            
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-400/10">
              <div className="text-sm font-medium text-purple-300/80">Taille</div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                {avatarState.config.size}
              </Badge>
            </div>
            
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-orange-600/5 border border-orange-400/10">
              <div className="text-sm font-medium text-orange-300/80">Animations</div>
              <Badge className={`${
                avatarState.config.animated 
                  ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' 
                  : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
              }`}>
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