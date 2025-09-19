import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { components, animations } from '@/lib/design-tokens';

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  active?: boolean;
  tooltip?: string;
}

const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    asChild = false, 
    loading = false,
    active = false,
    tooltip,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(
          // Classes de base
          components.button.base,
          // Variant
          components.button.variants[variant],
          // Taille
          components.button.sizes[size],
          // Animations
          animations.micro.button,
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
      </Comp>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

export { UnifiedButton };
