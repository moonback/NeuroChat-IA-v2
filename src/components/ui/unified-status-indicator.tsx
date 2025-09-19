import * as React from 'react';
import { cn } from '@/lib/utils';
import { colors, animations } from '@/lib/design-tokens';

export interface UnifiedStatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'online' | 'offline' | 'loading' | 'error' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  showLabel?: boolean;
}

const UnifiedStatusIndicator = React.forwardRef<HTMLDivElement, UnifiedStatusIndicatorProps>(
  ({ 
    className, 
    status,
    size = 'md',
    pulse = true,
    label,
    showLabel = false,
    ...props 
  }, ref) => {
    const getStatusClasses = () => {
      switch (status) {
        case 'online':
        case 'success':
          return 'bg-emerald-500';
        case 'offline':
        case 'error':
          return 'bg-red-500';
        case 'loading':
          return 'bg-blue-500';
        case 'warning':
          return 'bg-amber-500';
        default:
          return 'bg-slate-500';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm': return 'w-2 h-2';
        case 'md': return 'w-3 h-3';
        case 'lg': return 'w-4 h-4';
        default: return 'w-3 h-3';
      }
    };

    const getLabelClasses = () => {
      switch (size) {
        case 'sm': return 'text-xs';
        case 'md': return 'text-sm';
        case 'lg': return 'text-base';
        default: return 'text-sm';
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <div className="relative">
          <div
            className={cn(
              'rounded-full',
              getSizeClasses(),
              getStatusClasses(),
              pulse && status === 'online' && 'animate-pulse'
            )}
          />
          {pulse && status === 'online' && (
            <div
              className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-75',
                getStatusClasses()
              )}
            />
          )}
        </div>
        {showLabel && label && (
          <span className={cn('font-medium text-slate-700 dark:text-slate-300', getLabelClasses())}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

UnifiedStatusIndicator.displayName = 'UnifiedStatusIndicator';

export { UnifiedStatusIndicator };
