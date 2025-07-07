import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function VoiceInput({ onSendMessage, isLoading }: VoiceInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported
  } = useSpeechRecognition();

  // Auto-focus input when not on mobile
  useEffect(() => {
    if (!('ontouchstart' in window)) {
      inputRef.current?.focus();
    }
  }, []);

  const handleSend = () => {
    const message = inputValue.trim() || transcript.trim();
    if (message && !isLoading) {
      onSendMessage(message);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      inputRef.current?.focus();
    }
  };

  const displayValue = inputValue || transcript;
  const hasContent = displayValue.trim().length > 0;

  return (
    <div className="p-2 sm:p-3 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/20">
      {/* Input container */}
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20 transition-all duration-200"
        >
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </Button>
        {/* Main input area */}
        <div className="flex-1 relative">
          <div className={cn(
            "relative rounded-xl sm:rounded-2xl transition-all duration-200 border",
            isFocused 
              ? "border-blue-400 dark:border-blue-500 shadow-md shadow-blue-200/50 dark:shadow-blue-800/50" 
              : "border-slate-200 dark:border-slate-700",
            isListening && "border-red-400 dark:border-red-500 shadow-md shadow-red-200/50 dark:shadow-red-800/50",
            "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          )}>
            <Input
              ref={inputRef}
              value={displayValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isListening ? "J'écoute... Parle maintenant" : "Écris ton message ou utilise la voix..."}
              disabled={isLoading}
              className={cn(
                "border-0 bg-transparent h-8 sm:h-9 text-xs sm:text-sm rounded-xl sm:rounded-2xl",
                "pr-14 sm:pr-16 pl-2 sm:pl-3 py-2 sm:py-2.5",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60"
              )}
            />
            {/* Voice button */}
            {isSupported && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 rounded-lg transition-all duration-200",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-md animate-pulse" 
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground"
                  )}
                >
                  {isListening ? (
                    <MicOff className="h-3 w-3" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                </Button>
                {/* Emoji button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground transition-all duration-200"
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {/* Character count */}
          {hasContent && (
            <div className="absolute -bottom-4 right-0 text-[10px] text-muted-foreground/60">
              {displayValue.length} caractères
            </div>
          )}
        </div>
        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!hasContent || isLoading}
          size="icon"
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-all duration-200 shadow-md",
            hasContent && !isLoading
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-200 dark:shadow-blue-800 scale-100"
              : "bg-slate-200 dark:bg-slate-700 text-muted-foreground scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          ) : (
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>
      </div>
      {/* Voice status indicator */}
      {isListening && (
        <div className="flex items-center justify-center mt-2 gap-1 text-xs text-red-600 dark:text-red-400">
          <div className="flex space-x-0.5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
          </div>
          <span className="font-medium">Enregistrement... Clique sur le micro pour arrêter</span>
        </div>
      )}
      {/* Quick suggestions */}
      {!hasContent && !isListening && (
        <div className="flex flex-wrap gap-1 mt-2">
          {[
            "Raconte-moi une blague",
            "Quel temps fait-il ?",
            "Aide-moi à écrire un mail",
            "Explique-moi la physique quantique"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              onClick={() => setInputValue(suggestion)}
              className="text-[11px] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20 rounded-full"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}