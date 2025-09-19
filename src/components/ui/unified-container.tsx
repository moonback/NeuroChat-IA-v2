import * as React from 'react';
import { cn } from '@/lib/utils';
import { utils, animations } from '@/lib/design-tokens';

export interface UnifiedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'normal' | 'private' | 'child';
  variant?: 'default' | 'glass' | 'solid';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const UnifiedContainer = React.forwardRef<HTMLDivElement, UnifiedContainerProps>(
  ({ 
    className, 
    mode = 'normal', 
    variant = 'default',
    padding = 'md',
    children,
    ...props 
  }, ref) => {
    const getPaddingClasses = () => {
      switch (padding) {
        case 'none': return '';
        case 'sm': return 'p-3';
        case 'md': return 'p-4';
        case 'lg': return 'p-6';
        case 'xl': return 'p-8';
        default: return 'p-4';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'glass':
          return 'backdrop-blur-2xl bg-white/10 dark:bg-slate-800/20';
        case 'solid':
          return 'bg-white dark:bg-slate-900';
        default:
          return '';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Classes de sécurité par mode
          utils.getSecurityClasses(mode),
          // Variant
          getVariantClasses(),
          // Padding
          getPaddingClasses(),
          // Animations
          animations.duration.slower,
          // Classes personnalisées
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UnifiedContainer.displayName = 'UnifiedContainer';

export { UnifiedContainer };
