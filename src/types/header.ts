/**
 * Types partagés pour les composants header
 */

export interface HeaderProps {
  muted: boolean;
  onMute: () => void;
  onUnmute: () => void;
  onNewDiscussion: () => void;
  onOpenHistory: () => void;
  onOpenTTSSettings: () => void;
  onOpenRagDocs: () => void;
  onOpenMemory: () => void;
  stop: () => void;
  modeVocalAuto: boolean;
  setModeVocalAuto: (v: boolean) => void;
  hasActiveConversation: boolean;
  ragEnabled: boolean;
  setRagEnabled: (v: boolean) => void;
  webEnabled?: boolean;
  setWebEnabled?: (v: boolean) => void;
  webSearching?: boolean;
  onOpenGeminiSettings?: () => void;
  geminiConfig?: any;
  provider?: 'gemini' | 'openai' | 'mistral';
  onChangeProvider?: (p: 'gemini' | 'openai' | 'mistral') => void;
  modePrive: boolean;
  setModePrive: (v: boolean) => void;
  modeEnfant?: boolean;
  onToggleModeEnfant?: () => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRequestDelete: () => void;
  showConfirmDelete: boolean;
  setShowConfirmDelete: (open: boolean) => void;
  onDeleteConfirmed: () => void;
  onOpenChildPinSettings?: () => void;
  onOpenVocalSettings?: () => void;
  // Vocal auto config
  autoVoiceConfig?: { silenceMs: number; minChars: number; minWords: number; cooldownMs: number };
  onUpdateAutoVoiceConfig?: (key: 'silenceMs' | 'minChars' | 'minWords' | 'cooldownMs', value: number) => void;
  // Workspaces
  workspaceId?: string;
  workspaces?: Array<{ id: string; name: string }>;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}

export interface ConnectionStatus {
  connectionQuality: "excellent" | "good" | "poor";
  isOnline: boolean;
  quality: 'excellent' | 'good' | 'poor';
}

export interface Workspace {
  id: string;
  name: string;
}

export interface AutoVoiceConfig {
  silenceMs: number;
  minChars: number;
  minWords: number;
  cooldownMs: number;
}

export type Provider = 'gemini' | 'openai' | 'mistral';

export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  variant?: "ghost" | "default" | "destructive" | "outline";
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  [key: string]: any;
}

export interface IconButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  variant?: "ghost" | "default" | "destructive" | "outline";
  className?: string;
  active?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  [key: string]: any;
}

export interface TileButtonProps {
  onClick: () => void;
  label: string;
  icon: any;
  active?: boolean;
  intent?: 'default' | 'danger' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  tooltip?: string;
}
