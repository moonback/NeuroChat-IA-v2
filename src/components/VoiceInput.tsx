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
    <div className="p-4 sm:p-6 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/20">
      {/* Input container */}
      <div className="flex items-end gap-3 sm:gap-4">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20 transition-all duration-200"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Main input area */}
        <div className="flex-1 relative">
          <div className={cn(
            "relative rounded-2xl sm:rounded-3xl transition-all duration-200 border-2",
            isFocused 
              ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-200/50 dark:shadow-blue-800/50" 
              : "border-slate-200 dark:border-slate-700",
            isListening && "border-red-400 dark:border-red-500 shadow-lg shadow-red-200/50 dark:shadow-red-800/50",
            "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          )}>
            <Input
              ref={inputRef}
              value={displayValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isListening ? "Listening... Speak now" : "Type your message or use voice..."}
              disabled={isLoading}
              className={cn(
                "border-0 bg-transparent h-12 sm:h-14 text-sm sm:text-base rounded-2xl sm:rounded-3xl",
                "pr-20 sm:pr-24 pl-4 sm:pl-6 py-3 sm:py-4",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60"
              )}
            />
            
            {/* Voice button */}
            {isSupported && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-all duration-200",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse" 
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground"
                  )}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Emoji button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground transition-all duration-200"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Character count */}
          {hasContent && (
            <div className="absolute -bottom-6 right-0 text-xs text-muted-foreground/60">
              {displayValue.length} characters
            </div>
          )}
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!hasContent || isLoading}
          size="icon"
          className={cn(
            "h-11 w-11 sm:h-12 sm:w-12 rounded-2xl transition-all duration-200 shadow-lg",
            hasContent && !isLoading
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-200 dark:shadow-blue-800 scale-100"
              : "bg-slate-200 dark:bg-slate-700 text-muted-foreground scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          ) : (
            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
      </div>
      
      {/* Voice status indicator */}
      {isListening && (
        <div className="flex items-center justify-center mt-4 gap-2 text-sm text-red-600 dark:text-red-400">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
          </div>
          <span className="font-medium">Recording... Tap microphone to stop</span>
        </div>
      )}
      
      {/* Quick suggestions */}
      {!hasContent && !isListening && (
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "Tell me a joke",
            "What's the weather like?",
            "Help me write an email",
            "Explain quantum physics"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              onClick={() => setInputValue(suggestion)}
              className="text-xs bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20 rounded-full"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}