import * as React from 'react';
import { cn } from '@/lib/utils';
import { componentsEnhanced, animationsEnhanced, shadowsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedCardEnhancedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'interactive' | 'glass' | 'premium' | 'neon';
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  hover?: boolean;
  floating?: boolean; // Alias pour morph
}

const UnifiedCardEnhanced = React.forwardRef<HTMLDivElement, UnifiedCardEnhancedProps>(
  ({ 
    className,
    variant = 'base',
    shimmer = false,
    glow = false,
    morph = false,
    hover = true,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Classes de base
          componentsEnhanced.card.base,
          // Variant
          componentsEnhanced.card[variant],
          // Animations
          hover && animationsEnhanced.micro.card,
          // Effets spéciaux
          shimmer && animationsEnhanced.special.shimmer,
          glow && shadowsEnhanced.hover.glow,
          morph && 'hover:rotate-1 hover:scale-105',
          // Classes personnalisées
          className
        )}
        {...props}
      >
        {children}
        
        {/* Effet de brillance pour shimmer */}
        {shimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        )}
        
        {/* Effet de glow pour neon */}
        {glow && variant === 'neon' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>
    );
  }
);

UnifiedCardEnhanced.displayName = 'UnifiedCardEnhanced';

export { UnifiedCardEnhanced };