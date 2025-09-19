import * as React from 'react';
import { cn } from '@/lib/utils';
import { components, borderRadius } from '@/lib/design-tokens';

export interface UnifiedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  ({ className, type, variant = 'default', size = 'md', ...props }, ref) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm': return 'h-8 px-2 text-xs';
        case 'md': return 'h-10 px-3 text-sm';
        case 'lg': return 'h-12 px-4 text-base';
        default: return 'h-10 px-3 text-sm';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'error': return components.input.error;
        default: return '';
      }
    };

    return (
      <input
        type={type}
        className={cn(
          components.input.base,
          borderRadius.input,
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
UnifiedInput.displayName = 'UnifiedInput';

export { UnifiedInput };
