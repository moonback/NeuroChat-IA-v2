import * as React from 'react';
import { cn } from '@/lib/utils';
import { componentsEnhanced, animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedCardEnhancedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'interactive' | 'glass' | 'premium' | 'neon';
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  floating?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

const UnifiedCardEnhanced = React.forwardRef<HTMLDivElement, UnifiedCardEnhancedProps>(
  ({ 
    className, 
    variant = 'base',
    shimmer = false,
    glow = false,
    morph = false,
    floating = false,
    glass = false,
    children,
    ...props 
  }, ref) => {
    
    // Déterminer les classes d'effets
    const effectClasses = React.useMemo(() => {
      const effects = [];
      
      if (shimmer) effects.push('animate-shimmer');
      if (glow) effects.push('hover-glow');
      if (morph) effects.push('hover-morph');
      if (floating) effects.push('animate-float');
      if (glass) effects.push('backdrop-blur-glass');
      
      return effects.join(' ');
    }, [shimmer, glow, morph, floating, glass]);
    
    return (
      <div
        ref={ref}
        className={cn(
          // Classes de base améliorées
          componentsEnhanced.card[variant],
          // Animations
          animationsEnhanced.micro.cardHover,
          // Effets spéciaux
          effectClasses,
          // Classes personnalisées
          className
        )}
        {...props}
      >
        {children}
        
        {/* Effet shimmer */}
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-2xl" />
        )}
        
        {/* Effet glow */}
        {glow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    );
  }
);

UnifiedCardEnhanced.displayName = 'UnifiedCardEnhanced';

export { UnifiedCardEnhanced };
