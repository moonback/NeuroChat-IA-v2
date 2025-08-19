/**
 * Types partagés pour les composants voice-input
 */

export interface FileInfo {
  kind: 'image' | 'pdf' | 'docx' | 'other';
  pages?: number;
  words?: number;
}

export interface SlashCommand {
  cmd: string;
  label: string;
  icon: string;
}

export interface VoiceInputState {
  inputValue: string;
  isFocused: boolean;
  selectedFile: File | null;
  extractedText: string;
  fileInfo: FileInfo;
  activeSuggestionIdx: number;
}

export interface FileProcessingResult {
  fileInfo: FileInfo;
  extractedText: string;
}

export type Provider = 'gemini' | 'openai' | 'mistral';
