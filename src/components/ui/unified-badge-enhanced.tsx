import * as React from 'react';
import { cn } from '@/lib/utils';
import { animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedBadgeEnhancedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'premium' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
  glow?: boolean;
  morph?: boolean;
  floating?: boolean;
  children: React.ReactNode;
}

const UnifiedBadgeEnhanced = React.forwardRef<HTMLDivElement, UnifiedBadgeEnhancedProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    shimmer = false,
    glow = false,
    morph = false,
    floating = false,
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
      
      return effects.join(' ');
    }, [shimmer, glow, morph, floating]);
    
    // Classes de variant
    const variantClasses = {
      default: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg',
      secondary: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      destructive: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
      outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent',
      premium: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg',
      neon: 'bg-slate-900 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/20',
    };
    
    // Classes de taille
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs rounded-md',
      md: 'px-3 py-1.5 text-sm rounded-lg',
      lg: 'px-4 py-2 text-base rounded-xl',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          // Classes de base
          'inline-flex items-center justify-center font-medium transition-all duration-300',
          // Variant
          variantClasses[variant],
          // Taille
          sizeClasses[size],
          // Animations
          animationsEnhanced.micro.buttonHover,
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
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-lg" />
        )}
        
        {/* Effet glow */}
        {glow && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    );
  }
);

UnifiedBadgeEnhanced.displayName = 'UnifiedBadgeEnhanced';

export { UnifiedBadgeEnhanced };
