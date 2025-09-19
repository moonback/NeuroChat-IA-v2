import * as React from 'react';
import { cn } from '@/lib/utils';
import { borderRadius, shadows } from '@/lib/design-tokens';

export interface UnifiedButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const UnifiedButtonGroup = React.forwardRef<HTMLDivElement, UnifiedButtonGroupProps>(
  ({ 
    className, 
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    children,
    ...props 
  }, ref) => {
    const getOrientationClasses = () => {
      switch (orientation) {
        case 'vertical': return 'flex-col';
        default: return 'flex-row';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'outlined':
          return 'bg-transparent border border-slate-200 dark:border-slate-700';
        case 'ghost':
          return 'bg-transparent';
        default:
          return 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm': return 'p-1 gap-1';
        case 'md': return 'p-1.5 gap-1';
        case 'lg': return 'p-2 gap-2';
        default: return 'p-1.5 gap-1';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          getOrientationClasses(),
          getVariantClasses(),
          getSizeClasses(),
          borderRadius.lg,
          shadows.sm,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UnifiedButtonGroup.displayName = 'UnifiedButtonGroup';

export { UnifiedButtonGroup };
