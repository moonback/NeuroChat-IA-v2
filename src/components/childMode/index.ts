// Composants du mode enfant
export { default as ChildModeBanner } from '../ChildModeBanner';
export { default as ChildModePinDialog } from '../ChildModePinDialog';
export { default as ChildModeChangePinDialog } from '../ChildModeChangePinDialog';
export { default as ChildRewards } from '../ChildRewards';
export { default as ChildActivitySuggestions } from '../ChildActivitySuggestions';
export { default as ChildModeSettings } from '../ChildModeSettings';

// Composants de récompenses
export { ChildProgressBar, ChildRewardStats } from '../ChildRewards';

// Composants d'activités
export { QuickActivityCard, ActivityTracker } from '../ChildActivitySuggestions';

// Services
export * from '../../services/childContentFilter';
export * from '../../services/childContentService';

// Hooks
export { default as useChildMode } from '../../hooks/useChildMode';
export type { 
  ChildModeConfig, 
  ChildModeStats, 
  ChildReward 
} from '../../hooks/useChildMode';
