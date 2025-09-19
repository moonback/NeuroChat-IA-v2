import * as React from 'react';
import { cn } from '@/lib/utils';
import { utilsEnhanced, animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedContainerEnhancedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'normal' | 'private' | 'child';
  variant?: 'base' | 'glass' | 'premium' | 'neon';
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  floating?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

const UnifiedContainerEnhanced = React.forwardRef<HTMLDivElement, UnifiedContainerEnhancedProps>(
  ({ 
    className, 
    mode = 'normal',
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
    
    // Classes de variant
    const variantClasses = {
      base: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-xl',
      glass: 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-2xl border border-white/20 dark:border-slate-700/20',
      premium: 'bg-gradient-to-br from-white/95 via-slate-50/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-700/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-2xl',
      neon: 'bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          // Classes de base
          'transition-all duration-700',
          // Classes de sécurité par mode
          utilsEnhanced.getSecurityClasses(mode),
          // Variant
          variantClasses[variant],
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
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    );
  }
);

UnifiedContainerEnhanced.displayName = 'UnifiedContainerEnhanced';

export { UnifiedContainerEnhanced };
