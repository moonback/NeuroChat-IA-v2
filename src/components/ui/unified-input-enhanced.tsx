import * as React from 'react';
import { cn } from '@/lib/utils';
import { componentsEnhanced, animationsEnhanced } from '@/lib/design-tokens-enhanced';

export interface UnifiedInputEnhancedProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'base' | 'error' | 'success';
  shimmer?: boolean;
  glow?: boolean;
  clearButton?: () => void;
}

const UnifiedInputEnhanced = React.forwardRef<HTMLInputElement, UnifiedInputEnhancedProps>(
  ({ 
    className,
    variant = 'base',
    shimmer = false,
    glow = false,
    clearButton,
    type = 'text',
    ...props 
  }, ref) => {
    const [showClear, setShowClear] = React.useState(false);
    const [value, setValue] = React.useState(props.value || '');

    React.useEffect(() => {
      setValue(props.value || '');
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      setShowClear(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setValue('');
      setShowClear(false);
      clearButton?.();
    };

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            // Classes de base
            componentsEnhanced.input.base,
            // Variant
            componentsEnhanced.input[variant],
            // Animations
            animationsEnhanced.micro.button,
            // Effets spéciaux
            shimmer && 'bg-gradient-to-r from-white/50 via-white/80 to-white/50 bg-[length:200%_100%] animate-shimmer',
            glow && 'shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
            // Padding pour le bouton clear
            clearButton && 'pr-10',
            // Classes personnalisées
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
        
        {/* Bouton de suppression */}
        {clearButton && showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Effet de glow pour neon */}
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-lg blur-sm opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </div>
    );
  }
);

UnifiedInputEnhanced.displayName = 'UnifiedInputEnhanced';

export { UnifiedInputEnhanced };