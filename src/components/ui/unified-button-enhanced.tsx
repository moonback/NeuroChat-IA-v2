import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { componentsEnhanced, animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedButtonEnhancedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'premium' | 'neon' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  active?: boolean;
  tooltip?: string;
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  pulse?: boolean;
  glass?: boolean; // Alias pour variant="glass"
  neon?: boolean; // Alias pour variant="neon"
}

const UnifiedButtonEnhanced = React.forwardRef<HTMLButtonElement, UnifiedButtonEnhancedProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    asChild = false, 
    loading = false,
    active = false,
    shimmer = false,
    glow = false,
    morph = false,
    pulse = false,
    glass = false,
    neon = false,
    tooltip,
    children,
    ...props 
  }, ref) => {
    // Gestion des alias
    const actualVariant = glass ? 'glass' : neon ? 'neon' : variant;
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(
          // Classes de base
          componentsEnhanced.button.base,
          // Variant
          componentsEnhanced.button.variants[actualVariant],
          // Taille
          componentsEnhanced.button.sizes[size],
          // Animations
          animationsEnhanced.micro.button,
          // Effets spéciaux
          shimmer && componentsEnhanced.button.effects.shimmer,
          glow && componentsEnhanced.button.effects.glow,
          morph && componentsEnhanced.button.effects.morph,
          // État actif
          active && 'ring-2 ring-blue-500/50 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-lg',
          // État de chargement
          loading && 'animate-pulse',
          // Pulse effect
          pulse && animationsEnhanced.special.pulse,
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
        
        {/* Effet de brillance pour shimmer */}
        {shimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
        
        {/* Effet de glow pour neon */}
        {glow && actualVariant === 'neon' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Comp>
    );
  }
);

UnifiedButtonEnhanced.displayName = 'UnifiedButtonEnhanced';

export { UnifiedButtonEnhanced };