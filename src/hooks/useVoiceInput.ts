import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import type { 
  Provider, 
  VoiceInputState, 
  FileInfo, 
  SlashCommand 
} from '@/types/voiceInput';

import { SLASH_COMMANDS } from '@/constants/slashCommands';

export function useVoiceInput(
  onSendMessage: (message: string, imageFile?: File) => void,
  isLoading: boolean,
  provider: Provider = 'gemini',
  agentEnabled = false,
  onToggleAgent?: () => void
) {
  const [state, setState] = useState<VoiceInputState>({
    inputValue: '',
    isFocused: false,
    selectedFile: null,
    extractedText: '',
    fileInfo: { kind: 'other' },
    activeSuggestionIdx: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reconnaissance vocale
  const {
    listening,
    transcript,
    start,
    stop,
    reset,
    isSupported,
  } = useSpeechRecognition({
    interimResults: true,
    lang: 'fr-FR',
    continuous: true,
    onResult: (finalText) => {
      setState(prev => ({ ...prev, inputValue: finalText }));
    },
    onEnd: (finalText) => {
      if (finalText) {
        setState(prev => ({ ...prev, inputValue: finalText }));
      }
    },
  });

  // Auto-focus input quand pas sur mobile
  useEffect(() => {
    if (!('ontouchstart' in window)) {
      inputRef.current?.focus();
    }
  }, []);

  // Pré-remplissage via un événement global
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent<string>).detail;
        if (typeof detail === 'string') {
          setState(prev => ({ ...prev, inputValue: detail }));
          inputRef.current?.focus();
        }
      } catch {}
    };
    document.addEventListener('voice-input:prefill', handler as EventListener);
    return () => document.removeEventListener('voice-input:prefill', handler as EventListener);
  }, []);

  // Mise à jour de l'index de suggestion active
  useEffect(() => {
    setState(prev => ({ ...prev, activeSuggestionIdx: 0 }));
  }, [state.inputValue]);

  // Valeurs calculées
  const displayValue = useMemo(() => 
    listening ? transcript : state.inputValue, 
    [listening, transcript, state.inputValue]
  );

  const hasContent = useMemo(() => 
    displayValue.trim().length > 0 || !!state.selectedFile, 
    [displayValue, state.selectedFile]
  );

  const showSlashHelp = useMemo(() => 
    displayValue.trim().startsWith('/'), 
    [displayValue]
  );

  const slashToken = useMemo(() => 
    showSlashHelp ? displayValue.trim().split(/\s+/)[0] : '', 
    [showSlashHelp, displayValue]
  );

  const filteredCommands = useMemo(() => 
    showSlashHelp
      ? SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(slashToken.toLowerCase()))
      : [], 
    [showSlashHelp, slashToken]
  );

  // Gestionnaires d'événements
  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
  }, []);

  const handleFocus = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: true }));
  }, []);

  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: false }));
  }, []);

  const handleFileSelect = useCallback((file: File | null, fileInfo: FileInfo, extractedText = '') => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
      fileInfo,
      extractedText,
    }));
  }, []);

  const handleFileRemove = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFile: null,
      extractedText: '',
      fileInfo: { kind: 'other' },
    }));
  }, []);

  const handleInsert = useCallback((template: string) => {
    if (listening) {
      stop();
    }
    const newValue = template.endsWith(' ') ? template : template + ' ';
    setState(prev => ({ ...prev, inputValue: newValue }));
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [listening, stop]);

  const handleSend = useCallback(() => {
    const baseText = listening && transcript ? transcript : state.inputValue;
    if (!baseText.trim() && !state.selectedFile) return;
    
    if (listening) {
      stop();
    }

    // Pour PDF/DOCX, injecter un extrait texte dans le message
    let finalText = baseText;
    if (state.selectedFile && (state.fileInfo.kind === 'pdf' || state.fileInfo.kind === 'docx')) {
      const header = `\n\n[Pièce jointe: ${state.selectedFile.name}]`;
      const excerpt = state.extractedText ? `\n${state.extractedText.slice(0, 6000)}` : '';
      finalText = `${baseText}${header}${excerpt}`.trim();
    }

    const imageToSend = state.selectedFile && state.fileInfo.kind === 'image' ? state.selectedFile : undefined;
    onSendMessage(finalText, imageToSend);
    
    // Reset state
    setState(prev => ({
      ...prev,
      inputValue: '',
      selectedFile: null,
      extractedText: '',
      fileInfo: { kind: 'other' },
    }));
    reset();
  }, [listening, transcript, state, onSendMessage, stop, reset]);

  const handleMicClick = useCallback(() => {
    if (!isSupported) return;
    if (listening) {
      stop();
    } else {
      reset();
      start();
    }
  }, [isSupported, listening, start, stop, reset]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSlashHelp || filteredCommands.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setState(prev => ({ 
        ...prev, 
        activeSuggestionIdx: (prev.activeSuggestionIdx + 1) % filteredCommands.length 
      }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setState(prev => ({ 
        ...prev, 
        activeSuggestionIdx: (prev.activeSuggestionIdx - 1 + filteredCommands.length) % filteredCommands.length 
      }));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleInsert(filteredCommands[state.activeSuggestionIdx].cmd);
    } else if (e.key === 'Enter') {
      if (slashToken !== filteredCommands[state.activeSuggestionIdx].cmd) {
        e.preventDefault();
        handleInsert(filteredCommands[state.activeSuggestionIdx].cmd);
      }
    }
  }, [showSlashHelp, filteredCommands, state.activeSuggestionIdx, slashToken, handleInsert]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return {
    // État
    state,
    displayValue,
    hasContent,
    showSlashHelp,
    slashToken,
    filteredCommands,
    listening,
    transcript,
    isSupported,
    isLoading,
    provider,
    agentEnabled,
    
    // Refs
    inputRef,
    fileInputRef,
    
    // Gestionnaires
    handleInputChange,
    handleFocus,
    handleBlur,
    handleFileSelect,
    handleFileRemove,
    handleInsert,
    handleSend,
    handleMicClick,
    handleKeyDown,
    handleKeyPress,
    onToggleAgent,
  };
}
