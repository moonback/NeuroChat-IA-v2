import * as React from 'react';
import { cn } from '@/lib/utils';
import { animationsEnhanced, shadowsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedBadgeEnhancedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'premium' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
  glow?: boolean;
  pulse?: boolean;
  morph?: boolean;
  floating?: boolean; // Alias pour morph
}

const UnifiedBadgeEnhanced = React.forwardRef<HTMLDivElement, UnifiedBadgeEnhancedProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    shimmer = false,
    glow = false,
    pulse = false,
    morph = false,
    floating = false,
    children,
    ...props 
  }, ref) => {
    const actualMorph = morph || floating;
    const variantClasses = {
      default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      primary: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg',
      secondary: 'bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-lg',
      success: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg',
      warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg',
      error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
      info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
      premium: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-amber-500/30',
      neon: 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/30',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Classes de base
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 rounded-full',
          // Variant
          variantClasses[variant],
          // Taille
          sizeClasses[size],
          // Animations
          animationsEnhanced.micro.button,
          // Effets spéciaux
          shimmer && 'bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] animate-shimmer',
          glow && shadowsEnhanced.hover.glow,
          pulse && animationsEnhanced.special.pulse,
          actualMorph && 'hover:scale-105 hover:rotate-1',
          // Classes personnalisées
          className
        )}
        {...props}
      >
        {children}
        
        {/* Effet de brillance pour shimmer */}
        {shimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer rounded-full" />
        )}
        
        {/* Effet de glow pour neon */}
        {glow && variant === 'neon' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-cyan-400/20 rounded-full blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    );
  }
);

UnifiedBadgeEnhanced.displayName = 'UnifiedBadgeEnhanced';

export { UnifiedBadgeEnhanced };