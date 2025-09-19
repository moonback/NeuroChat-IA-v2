import * as React from 'react';
import { cn } from '@/lib/utils';
import { components, borderRadius, shadows, animations } from '@/lib/design-tokens';

export interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  children: React.ReactNode;
}

const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    shadow = 'lg',
    hover = false,
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'glass':
          return components.card.glass;
        case 'interactive':
          return `${components.card.base} ${components.card.interactive}`;
        default:
          return components.card.base;
      }
    };

    const getPaddingClasses = () => {
      switch (padding) {
        case 'sm': return 'p-3';
        case 'md': return 'p-4';
        case 'lg': return 'p-6';
        case 'xl': return 'p-8';
        default: return 'p-4';
      }
    };

    const getShadowClasses = () => {
      switch (shadow) {
        case 'sm': return 'shadow-sm';
        case 'md': return 'shadow-md';
        case 'lg': return 'shadow-lg';
        case 'xl': return 'shadow-xl';
        case '2xl': return 'shadow-2xl';
        default: return 'shadow-lg';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Classes de base
          getVariantClasses(),
          // Border radius
          borderRadius.card,
          // Padding
          getPaddingClasses(),
          // Shadow
          getShadowClasses(),
          // Hover effects
          hover && animations.micro.card,
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

UnifiedCard.displayName = 'UnifiedCard';

// Composants enfants pour la structure
const UnifiedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
UnifiedCardHeader.displayName = 'UnifiedCardHeader';

const UnifiedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
UnifiedCardTitle.displayName = 'UnifiedCardTitle';

const UnifiedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
UnifiedCardDescription.displayName = 'UnifiedCardDescription';

const UnifiedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
UnifiedCardContent.displayName = 'UnifiedCardContent';

const UnifiedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
));
UnifiedCardFooter.displayName = 'UnifiedCardFooter';

export {
  UnifiedCard,
  UnifiedCardHeader,
  UnifiedCardFooter,
  UnifiedCardTitle,
  UnifiedCardDescription,
  UnifiedCardContent,
};
