import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentsEnhanced } from '@/lib/design-tokens-enhanced';

const UnifiedModalEnhanced = DialogPrimitive.Root;

const UnifiedModalTrigger = DialogPrimitive.Trigger;

const UnifiedModalPortal = DialogPrimitive.Portal;

const UnifiedModalClose = DialogPrimitive.Close;

const UnifiedModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      componentsEnhanced.modal.overlay,
      className
    )}
    {...props}
  />
));
UnifiedModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const UnifiedModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    shimmer?: boolean;
    glow?: boolean;
    glass?: boolean;
  }
>(({ className, children, shimmer = false, glow = false, glass = false, ...props }, ref) => (
  <UnifiedModalPortal>
    <UnifiedModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        componentsEnhanced.modal.content,
        glass && 'backdrop-blur-heavy',
        glow && 'shadow-2xl shadow-blue-500/20',
        shimmer && 'animate-shimmer',
        className
      )}
      {...props}
    >
      {children}
      
      {/* Effet shimmer */}
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-2xl" />
      )}
      
      {/* Effet glow */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-50" />
      )}
      
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </UnifiedModalPortal>
));
UnifiedModalContent.displayName = DialogPrimitive.Content.displayName;

const UnifiedModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      componentsEnhanced.modal.header,
      className
    )}
    {...props}
  />
);
UnifiedModalHeader.displayName = 'UnifiedModalHeader';

const UnifiedModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      componentsEnhanced.modal.footer,
      className
    )}
    {...props}
  />
);
UnifiedModalFooter.displayName = 'UnifiedModalFooter';

const UnifiedModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    glow?: boolean;
    shimmer?: boolean;
  }
>(({ className, glow = false, shimmer = false, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      glow && 'animate-text-glow',
      shimmer && 'animate-text-shimmer',
      className
    )}
    {...props}
  />
));
UnifiedModalTitle.displayName = DialogPrimitive.Title.displayName;

const UnifiedModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
UnifiedModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  UnifiedModalEnhanced,
  UnifiedModalTrigger,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalFooter,
  UnifiedModalTitle,
  UnifiedModalDescription,
  UnifiedModalClose,
};
