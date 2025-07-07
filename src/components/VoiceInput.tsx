import { useState, useRef } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported
  } = useSpeechRecognition();

  const handleSend = () => {
    const message = inputValue.trim() || transcript.trim();
    if (message) {
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

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isListening ? "Listening..." : "Type a message or use voice..."}
          disabled={isLoading}
          className={cn(
            "pr-12 sm:pr-14 h-11 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl border-2 transition-all duration-200",
            "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
            "border-slate-200 dark:border-slate-700",
            "focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800",
            isListening && "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20"
          )}
        />
        {isSupported && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleListening}
            disabled={isLoading}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200",
              isListening && "animate-pulse text-red-500 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
            )}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      <Button
        onClick={handleSend}
        disabled={!displayValue.trim() || isLoading}
        size="icon"
        className={cn(
          "h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl transition-all duration-200",
          "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
          "shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>
    </div>
  );
}