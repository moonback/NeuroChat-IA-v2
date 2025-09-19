import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { borderRadius, typography } from '@/lib/design-tokens';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // Variants de sécurité
        normal: 'border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
        private: 'border-transparent bg-gradient-to-r from-red-500 to-rose-500 text-white',
        child: 'border-transparent bg-gradient-to-r from-pink-500 to-orange-500 text-white',
        // Variants d'état
        success: 'border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        warning: 'border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        error: 'border-transparent bg-gradient-to-r from-red-500 to-rose-500 text-white',
        info: 'border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface UnifiedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
}

const UnifiedBadge = React.forwardRef<HTMLDivElement, UnifiedBadgeProps>(
  ({ className, variant, size, icon, pulse = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);
UnifiedBadge.displayName = 'UnifiedBadge';

export { UnifiedBadge, badgeVariants };
