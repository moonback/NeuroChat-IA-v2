// Composants d'avatar 3D réactif
export { Avatar3D, type Avatar3DProps } from '../Avatar3D';
export { ReactiveAvatar, type ReactiveAvatarProps } from '../ReactiveAvatar';
export { AvatarCustomizationPanel, type AvatarCustomizationPanelProps } from '../AvatarCustomizationPanel';
export { AvatarDemo } from '../AvatarDemo';
export { IntegrationExample } from './IntegrationExample';

// Hook de gestion d'état
export { useAvatarState, type AvatarState, type UseAvatarStateOptions } from '../../hooks/useAvatarState';

// Service d'analyse des sentiments
export { 
  analyzeSentiment, 
  analyzeSentimentAdvanced, 
  analyzeSentimentRealtime, 
  detectCommunicationMode,
  type EmotionType, 
  type SentimentResult 
} from '../../services/sentimentAnalyzer';
