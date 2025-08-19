import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useFileHandling } from '@/hooks/useFileHandling';
import { FilePreview } from './voice-input/FilePreview';
import { SlashCommands } from './voice-input/SlashCommands';
import { VoiceIndicator } from './voice-input/VoiceIndicator';
import { ActionButtons } from './voice-input/ActionButtons';
import type { Provider } from '@/services/llm';

interface VoiceInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
  provider?: Provider;
  agentEnabled?: boolean;
  onToggleAgent?: () => void;
}

export function VoiceInput({ 
  onSendMessage, 
  isLoading, 
  provider = 'gemini', 
  agentEnabled = false, 
  onToggleAgent 
}: VoiceInputProps) {
  const {
    // État
    state,
    displayValue,
    hasContent,
    showSlashHelp,
    filteredCommands,
    listening,
    isSupported,
    
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
  } = useVoiceInput(onSendMessage, isLoading, provider, agentEnabled, onToggleAgent);

  const { processFile } = useFileHandling();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    const { fileInfo, extractedText } = await processFile(file);
    handleFileSelect(file, fileInfo, extractedText);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <div className="sticky bottom-0 z-50">
        <div className="relative">
          <div className="backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-t border-white/40 dark:border-slate-800/40 shadow-xl">
            <div className="px-3 py-3 sm:px-4 sm:py-3 max-w-5xl mx-auto">
              
              {/* Aperçu fichier */}
              {state.selectedFile && (
                <FilePreview
                  file={state.selectedFile}
                  fileInfo={state.fileInfo}
                  extractedText={state.extractedText}
                  onRemove={handleFileRemove}
                />
              )}

              {/* Zone de saisie principale */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  {/* Boutons d'action gauche */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    
                    <ActionButtons
                      onFileSelect={handleFileButtonClick}
                      fileInputRef={fileInputRef}
                      provider={provider}
                      agentEnabled={agentEnabled}
                      onToggleAgent={onToggleAgent}
                      listening={listening}
                      isSupported={isSupported}
                      onMicClick={handleMicClick}
                      hasContent={hasContent}
                      isLoading={isLoading}
                      onSend={handleSend}
                      disabled={listening}
                    />
                  </div>

                  {/* Input principal */}
                  <div className="flex-1 relative group">
                    <Input
                      ref={inputRef}
                      value={displayValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onKeyPress={handleKeyPress}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={listening ? "🎤 Dictée en cours..." : "Tapez un message… (/ pour commandes)"}
                      disabled={isLoading || listening}
                      className={cn(
                        "h-12 rounded-xl px-4 py-3 text-sm sm:text-base transition-all duration-300",
                        "bg-gradient-to-r from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95",
                        "border border-slate-200/70 dark:border-slate-700/70",
                        "focus-visible:border-blue-400/70 dark:focus-visible:border-blue-500/70",
                        "focus-visible:ring-2 focus-visible:ring-blue-400/20 dark:focus-visible:ring-blue-500/20",
                        "shadow-sm hover:shadow-md shadow-black/5 dark:shadow-black/20",
                        "placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70",
                        "text-slate-800 dark:text-slate-200",
                        listening && "border-red-400/60 dark:border-red-500/60 bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-950/40 dark:to-pink-950/40",
                        state.isFocused && !listening && "shadow-md border-blue-400/70"
                      )}
                      aria-label={listening ? "Dictée vocale en cours" : "Zone de saisie de message"}
                    />
                    
                    {/* Indicateur de caractères */}
                    {displayValue.length > 100 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-lg">
                        {displayValue.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions de commandes slash */}
              {showSlashHelp && (
                <SlashCommands
                  commands={filteredCommands}
                  activeIndex={state.activeSuggestionIdx}
                  onSelect={handleInsert}
                />
              )}

              {/* Indicateur de dictée vocale */}
              {listening && (
                <VoiceIndicator onStop={handleMicClick} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}