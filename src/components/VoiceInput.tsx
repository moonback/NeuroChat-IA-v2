import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, Smile, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

export function VoiceInput({ onSendMessage, isLoading }: VoiceInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Reconnaissance vocale
  const {
    listening,
    transcript,
    error: speechError,
    start,
    stop,
    reset,
    isSupported,
  } = useSpeechRecognition({
    interimResults: true,
    lang: 'fr-FR',
    continuous: false,
    onResult: (finalText) => {
      setInputValue(finalText);
    },
    onEnd: (finalText) => {
      // Envoi automatique à la fin de la dictée
      if (finalText && finalText.trim().length > 0) {
        onSendMessage(finalText.trim(), selectedImage || undefined);
        setInputValue('');
        setSelectedImage(null);
        reset();
      }
    },
  });

  // Auto-focus input quand pas sur mobile
  useEffect(() => {
    if (!('ontouchstart' in window)) {
      inputRef.current?.focus();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSend = () => {
    const valueToSend = listening && transcript ? transcript : inputValue;
    if (!valueToSend.trim() && !selectedImage) return;
    onSendMessage(valueToSend, selectedImage || undefined);
    setInputValue('');
    setSelectedImage(null);
    reset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Affichage prioritaire de la voix si écoute en cours
  const displayValue = listening ? transcript : inputValue;
  const hasContent = displayValue.trim().length > 0 || !!selectedImage;

  // Gestion du micro (start/stop)
  const handleMicClick = () => {
    if (!isSupported) return;
    if (listening) {
      stop();
    } else {
      reset();
      start();
    }
  };

  return (
    <div className="p-2 sm:p-3 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/20">
      {/* Aperçu compact de l'image sélectionnée au-dessus de la barre d'envoi */}
      {selectedImage && (
        <div className="relative flex items-center gap-2 mb-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs shadow-md animate-fadeIn">
          <div className="relative group">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Aperçu"
              className="max-h-16 max-w-16 rounded-lg border shadow hover:scale-105 transition-transform duration-200"
              style={{ objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition text-xs flex items-center justify-center w-5 h-5"
              title="Retirer l'image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-xs text-blue-700 dark:text-blue-200 truncate max-w-[90px]"
              title={selectedImage.name}
            >
              {selectedImage.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {(selectedImage.size / 1024).toFixed(1)} Ko
            </span>
          </div>
        </div>
      )}
      {/* Input container */}
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Bouton upload image */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-200"
          title="Envoyer une image"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828M7 7h.01M7 7a5 5 0 017.071 7.071l-6.586 6.586a2 2 0 01-2.828-2.828L15.172 7z" /></svg>
        </button>
        {/* Main input area */}
        <div className="flex-1 relative">
          <div className={cn(
            "relative rounded-xl sm:rounded-2xl transition-all duration-200 border",
            isFocused 
              ? "border-blue-400 dark:border-blue-500 shadow-md shadow-blue-200/50 dark:shadow-blue-800/50" 
              : "border-slate-200 dark:border-slate-700",
            "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          )}>
            <Input
              ref={inputRef}
              value={displayValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={listening ? "Parle, je t'écoute..." : "Écris ton message..."}
              disabled={isLoading || listening}
              className={cn(
                "border-0 bg-transparent h-8 sm:h-9 text-xs sm:text-sm rounded-xl sm:rounded-2xl",
                "pr-20 sm:pr-24 pl-2 sm:pl-3 py-2 sm:py-2.5",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60"
              )}
            />
            {/* Bouton micro */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant={listening ? "default" : "ghost"}
                className={cn(
                  "h-7 w-7 rounded-lg transition-all duration-200",
                  listening
                    ? "bg-red-500 text-white animate-pulse shadow-lg hover:bg-red-600"
                    : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground"
                )}
                onClick={handleMicClick}
                title={listening ? "Arrêter la dictée vocale" : !isSupported ? "Reconnaissance vocale non supportée" : "Activer la dictée vocale"}
                disabled={isLoading || !isSupported}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            {/* Emoji button */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground transition-all duration-200"
              >
                <Smile className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {/* Erreur reconnaissance vocale */}
          {speechError && (
            <div className="text-xs text-red-500 mt-1 animate-fadeIn">{speechError}</div>
          )}
          {/* Character count */}
          {displayValue && (
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
    </div>
  );
}