/**
 * 🎨 Composants UI Unifiés pour NeuroChat-IA-v2
 * 
 * Export centralisé de tous les composants de design unifié
 * pour une expérience utilisateur cohérente
 */

// Composants de base
export { UnifiedButton } from './unified-button';
export { UnifiedInput } from './unified-input';
export { UnifiedBadge } from './unified-badge';

// Composants de layout
export { UnifiedCard, UnifiedCardHeader, UnifiedCardFooter, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from './unified-card';
export { UnifiedContainer } from './unified-container';
export { UnifiedButtonGroup } from './unified-button-group';

// Composants de dialogue
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
} from './unified-modal';

// Composants d'état
export { UnifiedStatusIndicator } from './unified-status-indicator';

// Design tokens
export { default as designTokens } from '@/lib/design-tokens';
