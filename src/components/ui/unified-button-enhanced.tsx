import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { componentsEnhanced, animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedButtonEnhancedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  active?: boolean;
  tooltip?: string;
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  glass?: boolean;
  neon?: boolean;
}

const UnifiedButtonEnhanced = React.forwardRef<HTMLButtonElement, UnifiedButtonEnhancedProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    asChild = false, 
    loading = false,
    active = false,
    tooltip,
    shimmer = false,
    glow = false,
    morph = false,
    glass = false,
    neon = false,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Déterminer les classes d'effets
    const effectClasses = React.useMemo(() => {
      const effects = [];
      
      if (shimmer) effects.push('animate-shimmer');
      if (glow) effects.push('hover-glow');
      if (morph) effects.push('hover-morph');
      if (glass) effects.push('backdrop-blur-glass');
      if (neon) effects.push('shadow-lg shadow-blue-500/25');
      
      return effects.join(' ');
    }, [shimmer, glow, morph, glass, neon]);
    
    return (
      <Comp
        className={cn(
          // Classes de base améliorées
          componentsEnhanced.button.base,
          // Variant
          componentsEnhanced.button.variants[variant],
          // Taille
          componentsEnhanced.button.sizes[size],
          // Animations
          animationsEnhanced.micro.buttonHover,
          // Effets spéciaux
          effectClasses,
          // État actif
          active && 'ring-2 ring-blue-500/50 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
          // État de chargement
          loading && 'animate-pulse',
          // Classes personnalisées
          className
        )}
        ref={ref}
        data-tooltip-content={tooltip}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </div>
        ) : (
          children
        )}
        
        {/* Effet shimmer */}
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
        
        {/* Effet glow */}
        {glow && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </Comp>
    );
  }
);

UnifiedButtonEnhanced.displayName = 'UnifiedButtonEnhanced';

export { UnifiedButtonEnhanced };
