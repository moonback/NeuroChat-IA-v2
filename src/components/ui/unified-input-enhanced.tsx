import * as React from 'react';
import { cn } from '@/lib/utils';
import { componentsEnhanced, animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedInputEnhancedProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'base' | 'error' | 'success' | 'premium';
  shimmer?: boolean;
  glow?: boolean;
  glass?: boolean;
  icon?: React.ReactNode;
  clearButton?: (() => void) | undefined;
}

const UnifiedInputEnhanced = React.forwardRef<HTMLInputElement, UnifiedInputEnhancedProps>(
  ({ 
    className, 
    type = 'text',
    variant = 'base',
    shimmer = false,
    glow = false,
    glass = false,
    icon,
    clearButton,
    ...props 
  }, ref) => {
    
    // Déterminer les classes d'effets
    const effectClasses = React.useMemo(() => {
      const effects = [];
      
      if (shimmer) effects.push('animate-shimmer');
      if (glow) effects.push('focus-glow');
      if (glass) effects.push('backdrop-blur-glass');
      
      return effects.join(' ');
    }, [shimmer, glow, glass]);
    
    return (
      <div className="relative">
        {/* Icône */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            // Classes de base améliorées
            componentsEnhanced.input[variant],
            // Animations
            animationsEnhanced.micro.buttonHover,
            // Effets spéciaux
            effectClasses,
            // Padding pour l'icône
            icon && 'pl-10',
            // Padding pour le bouton de suppression
            clearButton && 'pr-10',
            // Classes personnalisées
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Bouton de suppression */}
        {clearButton && (
          <button
            type="button"
            onClick={clearButton}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Effet shimmer */}
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-xl" />
        )}
        
        {/* Effet glow */}
        {glow && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    );
  }
);

UnifiedInputEnhanced.displayName = 'UnifiedInputEnhanced';

export { UnifiedInputEnhanced };
