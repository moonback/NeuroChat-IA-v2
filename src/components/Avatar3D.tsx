import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface Avatar3DProps {
  /** État émotionnel actuel de l'avatar */
  emotion?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'thinking' | 'speaking' | 'listening';
  /** Style visuel de l'avatar */
  style?: 'modern' | 'classic' | 'futuristic' | 'minimal';
  /** Thème de vêtements */
  clothing?: 'casual' | 'formal' | 'tech' | 'creative';
  /** Accessoires à afficher */
  accessories?: string[];
  /** Taille de l'avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Animation active */
  animated?: boolean;
  /** Callback lors du clic */
  onClick?: () => void;
  /** Classe CSS personnalisée */
  className?: string;
}

export interface EmotionConfig {
  expression: string;
  color: string;
  animation: string;
  intensity: number;
}

const EMOTION_CONFIGS: Record<string, EmotionConfig> = {
  neutral: {
    expression: '😐',
    color: 'from-slate-400 to-slate-600',
    animation: 'pulse',
    intensity: 0.5
  },
  happy: {
    expression: '😊',
    color: 'from-yellow-400 to-orange-500',
    animation: 'bounce',
    intensity: 0.8
  },
  sad: {
    expression: '😔',
    color: 'from-blue-400 to-indigo-600',
    animation: 'fadeIn',
    intensity: 0.6
  },
  surprised: {
    expression: '😲',
    color: 'from-pink-400 to-purple-500',
    animation: 'zoomIn',
    intensity: 0.9
  },
  thinking: {
    expression: '🤔',
    color: 'from-gray-400 to-slate-700',
    animation: 'float',
    intensity: 0.4
  },
  speaking: {
    expression: '💬',
    color: 'from-green-400 to-emerald-600',
    animation: 'pulse',
    intensity: 0.7
  },
  listening: {
    expression: '👂',
    color: 'from-cyan-400 to-blue-600',
    animation: 'fadeIn',
    intensity: 0.5
  }
};

const STYLE_CONFIGS = {
  modern: {
    shape: 'rounded-3xl',
    shadow: 'shadow-2xl',
    border: 'border-2 border-white/20',
    glow: 'shadow-blue-500/30'
  },
  classic: {
    shape: 'rounded-full',
    shadow: 'shadow-lg',
    border: 'border-4 border-white/30',
    glow: 'shadow-amber-500/20'
  },
  futuristic: {
    shape: 'rounded-2xl',
    shadow: 'shadow-2xl',
    border: 'border-2 border-cyan-400/40',
    glow: 'shadow-cyan-400/50'
  },
  minimal: {
    shape: 'rounded-xl',
    shadow: 'shadow-md',
    border: 'border border-white/10',
    glow: 'shadow-gray-500/10'
  }
};

const CLOTHING_CONFIGS = {
  casual: {
    primary: 'from-blue-500 to-indigo-600',
    secondary: 'from-gray-300 to-gray-400',
    accent: 'from-red-400 to-pink-500'
  },
  formal: {
    primary: 'from-slate-700 to-gray-800',
    secondary: 'from-white to-gray-100',
    accent: 'from-blue-600 to-blue-700'
  },
  tech: {
    primary: 'from-cyan-500 to-blue-600',
    secondary: 'from-gray-800 to-slate-900',
    accent: 'from-emerald-400 to-teal-500'
  },
  creative: {
    primary: 'from-purple-500 to-pink-600',
    secondary: 'from-yellow-400 to-orange-500',
    accent: 'from-green-400 to-emerald-500'
  }
};

const SIZE_CONFIGS = {
  sm: { size: 'w-16 h-16', text: 'text-2xl' },
  md: { size: 'w-24 h-24', text: 'text-3xl' },
  lg: { size: 'w-32 h-32', text: 'text-4xl' },
  xl: { size: 'w-40 h-40', text: 'text-5xl' }
};

export const Avatar3D: React.FC<Avatar3DProps> = ({
  emotion = 'neutral',
  style = 'modern',
  clothing = 'casual',
  accessories = [],
  size = 'md',
  animated = true,
  onClick,
  className
}) => {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout>();
  const emotionRef = useRef(emotion);

  // Configuration actuelle basée sur les props
  const config = useMemo(() => {
    const emotionConfig = EMOTION_CONFIGS[currentEmotion || 'neutral'];
    const styleConfig = STYLE_CONFIGS[style];
    const clothingConfig = CLOTHING_CONFIGS[clothing];
    const sizeConfig = SIZE_CONFIGS[size];

    return {
      emotion: emotionConfig,
      style: styleConfig,
      clothing: clothingConfig,
      size: sizeConfig
    };
  }, [currentEmotion, style, clothing, size]);

  // Gestion des changements d'émotion avec animation
  useEffect(() => {
    if (emotion !== emotionRef.current) {
      emotionRef.current = emotion;
      
      if (animated) {
        setIsAnimating(true);
        setCurrentEmotion(emotion);
        
        // Animation de transition
        animationRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      } else {
        setCurrentEmotion(emotion);
      }
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [emotion, animated]);

  // Génération des classes CSS dynamiques
  const avatarClasses = cn(
    'relative flex items-center justify-center cursor-pointer transition-all duration-300',
    'bg-gradient-to-br',
    config.emotion.color,
    config.style.shape,
    config.style.shadow,
    config.style.border,
    config.style.glow,
    config.size.size,
    animated && 'hover:scale-105 hover:rotate-2',
    isAnimating && 'animate-pulse',
    className
  );

  const expressionClasses = cn(
    'select-none transition-all duration-200',
    config.size.text,
    isAnimating && `animate-${config.emotion.animation}`,
    'drop-shadow-lg'
  );

  // Rendu des accessoires
  const renderAccessories = () => {
    if (!accessories.length) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {accessories.map((accessory, index) => (
          <div
            key={index}
            className={cn(
              'absolute text-xs opacity-70',
              index === 0 && '-top-2 -right-2',
              index === 1 && '-bottom-2 -left-2',
              index === 2 && '-top-2 -left-2',
              index === 3 && '-bottom-2 -right-2'
            )}
          >
            {accessory}
          </div>
        ))}
      </div>
    );
  };

  // Rendu des vêtements stylisés
  const renderClothing = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Vêtement principal */}
        <div className={cn(
          'absolute bottom-0 left-1/2 transform -translate-x-1/2',
          'w-3/4 h-1/3 rounded-t-full bg-gradient-to-t',
          config.clothing.primary
        )} />
        
        {/* Détails secondaires */}
        <div className={cn(
          'absolute bottom-0 left-1/2 transform -translate-x-1/2',
          'w-1/2 h-1/6 rounded-t-full bg-gradient-to-t',
          config.clothing.secondary
        )} />
        
        {/* Accents */}
        <div className={cn(
          'absolute top-1/4 right-1/4',
          'w-2 h-2 rounded-full bg-gradient-to-r',
          config.clothing.accent
        )} />
      </div>
    );
  };

  return (
    <div
      className={avatarClasses}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Avatar ${currentEmotion} - Style ${style}`}
    >
      {/* Expression faciale principale */}
      <div className={cn('relative z-10', expressionClasses)}>
        {config.emotion.expression}
      </div>

      {/* Vêtements */}
      {renderClothing()}

      {/* Accessoires */}
      {renderAccessories()}

      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-inherit pointer-events-none" />
      
      {/* Indicateur d'état animé */}
      {animated && (
        <div className={cn(
          'absolute -top-1 -right-1 w-3 h-3 rounded-full',
          'bg-gradient-to-r from-green-400 to-emerald-500',
          'animate-pulse shadow-lg'
        )} />
      )}
    </div>
  );
};

export default Avatar3D;
