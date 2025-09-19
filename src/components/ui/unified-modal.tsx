import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { components, borderRadius, animations } from '@/lib/design-tokens';
import { UnifiedButton } from './unified-button';

const UnifiedModal = DialogPrimitive.Root;

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
      components.modal.overlay,
      animations.common.fadeIn,
      className
    )}
    {...props}
  />
));
UnifiedModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const UnifiedModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <UnifiedModalPortal>
    <UnifiedModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        components.modal.content,
        borderRadius.modal,
        animations.common.zoomIn,
        animations.duration.normal,
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <UnifiedButton
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </UnifiedButton>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </UnifiedModalPortal>
));
UnifiedModalContent.displayName = DialogPrimitive.Content.displayName;

const UnifiedModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(components.modal.header, className)}
    {...props}
  />
);
UnifiedModalHeader.displayName = 'UnifiedModalHeader';

const UnifiedModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(components.modal.footer, className)}
    {...props}
  />
);
UnifiedModalFooter.displayName = 'UnifiedModalFooter';

const UnifiedModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
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
  UnifiedModal,
  UnifiedModalPortal,
  UnifiedModalOverlay,
  UnifiedModalTrigger,
  UnifiedModalClose,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalFooter,
  UnifiedModalTitle,
  UnifiedModalDescription,
};
