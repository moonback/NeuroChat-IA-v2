import * as React from 'react';
import { cn } from '@/lib/utils';
import { utilsEnhanced, shadowsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedContainerEnhancedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'premium' | 'neon' | 'gradient' | 'solid';
  securityMode?: 'normal' | 'private' | 'child';
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  floating?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  mode?: 'normal' | 'private' | 'child'; // Alias pour securityMode
}

const UnifiedContainerEnhanced = React.forwardRef<HTMLDivElement, UnifiedContainerEnhancedProps>(
  ({ 
    className,
    variant = 'glass',
    securityMode,
    mode,
    shimmer = false,
    glow = false,
    morph = false,
    floating = false,
    size = 'md',
    children,
    ...props 
  }, ref) => {
    const actualSecurityMode = mode || securityMode;
    const variantClasses = {
      glass: 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-2xl border border-white/20 dark:border-slate-700/20',
      premium: 'bg-gradient-to-br from-white/95 via-blue-50/50 to-purple-50/50 dark:from-slate-900/95 dark:via-blue-950/30 dark:to-purple-950/30',
      neon: 'bg-gradient-to-br from-cyan-50/80 via-blue-50/60 to-purple-50/80 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-purple-950/40',
      gradient: 'bg-gradient-to-br from-slate-50/90 via-white/95 to-blue-50/70 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-800/70',
      solid: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    };

    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
      full: 'p-0',
    };

    const baseClasses = cn(
      // Classes de base
      'relative overflow-hidden transition-all duration-300',
      // Variant
      variantClasses[variant],
      // Taille
      sizeClasses[size],
      // Effets spéciaux
      floating && shadowsEnhanced.special.floating,
      morph && 'hover:scale-[1.02] hover:rotate-1',
      glow && shadowsEnhanced.hover.glow,
      shimmer && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer',
      // Classes de sécurité
      actualSecurityMode && utilsEnhanced.getSecurityClasses(actualSecurityMode),
      // Classes personnalisées
      className
    );

    return (
      <div
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {children}
        
        {/* Effet de brillance pour shimmer */}
        {shimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
        )}
        
        {/* Effet de glow pour neon */}
        {glow && variant === 'neon' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Overlay pour les modes de sécurité */}
        {actualSecurityMode === 'private' && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />
        )}
        {actualSecurityMode === 'child' && (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-yellow-500/5 to-orange-500/5 pointer-events-none" />
        )}
      </div>
    );
  }
);

UnifiedContainerEnhanced.displayName = 'UnifiedContainerEnhanced';

export { UnifiedContainerEnhanced };