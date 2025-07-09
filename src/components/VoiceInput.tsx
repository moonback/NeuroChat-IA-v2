import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Smile, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

const EMOJIS = ['😀','😂','😍','😎','🥳','😢','😡','👍','🙏','👏','🤔','😅','😇','😱','🎉','❤️','��','💡','🤖','🙌'];

export function VoiceInput({ onSendMessage, isLoading }: VoiceInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const handleEmojiClick = (emoji: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    setInputValue(prev => prev.slice(0, start) + emoji + prev.slice(end));
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
    setShowEmojiPicker(false);
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
    <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 border-t border-white/20 dark:border-slate-800/40 shadow-inner backdrop-blur-xl rounded-b-3xl">
      {/* Aperçu compact de l'image sélectionnée au-dessus de la barre d'envoi */}
      {selectedImage && (
        <div className="relative flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl max-w-xs shadow-lg animate-fadeIn border border-blue-200/40 dark:border-blue-800/40">
          <div className="relative group">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Aperçu"
              className="max-h-16 max-w-16 rounded-lg border-2 border-white/60 dark:border-slate-800/60 shadow-md hover:scale-105 transition-transform duration-200 bg-white dark:bg-slate-900"
              style={{ objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition text-xs flex items-center justify-center w-5 h-5 border-2 border-white dark:border-slate-900"
              title="Retirer l'image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-xs text-blue-700 dark:text-blue-200 truncate max-w-24 sm:max-w-36"
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
      <div className="flex items-end gap-2 sm:gap-3 w-full max-w-2xl mx-auto">
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
          className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-200 shadow hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-800 dark:hover:to-indigo-800 border border-blue-200/40 dark:border-blue-800/40 flex items-center justify-center"
          title="Envoyer une image"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828M7 7h.01M7 7a5 5 0 017.071 7.071l-6.586 6.586a2 2 0 01-2.828-2.828L15.172 7z" />
          </svg>
        </button>
        {/* Main input area */}
        <div className="flex-1 relative">
          <div
            className={cn(
              "relative rounded-2xl border transition-all duration-200 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md",
              isFocused
                ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-200/40 dark:shadow-blue-800/40"
                : "border-slate-200 dark:border-slate-700 shadow-md"
            )}
          >
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
                "border-0 bg-transparent h-10 sm:h-11 text-sm sm:text-base rounded-2xl pr-20 sm:pr-24 pl-3 sm:pl-4 py-2 sm:py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-slate-800 dark:text-slate-200"
              )}
            />
            {/* Bouton micro */}
            <Button
              type="button"
              size="icon"
              variant={listening ? "default" : "ghost"}
              className={cn(
                "absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl transition-all duration-200",
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
            {/* Emoji button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-muted-foreground transition-all duration-200"
              onClick={() => setShowEmojiPicker(v => !v)}
              tabIndex={-1}
              aria-label="Insérer un emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute z-50 bottom-12 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 flex flex-wrap gap-1 w-72 animate-fadeIn">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    className="text-2xl p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                    onClick={() => handleEmojiClick(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
            {/* Erreur reconnaissance vocale */}
            {speechError && (
              <div className="absolute left-0 -bottom-7 text-xs text-red-500 animate-fadeIn bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg shadow">
                ⚠️ {speechError}
              </div>
            )}
            {/* Character count */}
            {displayValue && (
              <div className="absolute -bottom-7 right-0 text-xs text-muted-foreground/60">
                {displayValue.length} caractères
              </div>
            )}
          </div>
        </div>
        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!hasContent || isLoading}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl transition-all duration-200 shadow-md ml-2",
            hasContent && !isLoading
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-200 dark:shadow-blue-800 scale-100"
              : "bg-slate-200 dark:bg-slate-700 text-muted-foreground scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      {/* Indicateur de statut vocal */}
      {listening && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-red-600 dark:text-red-400 animate-fadeIn">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="font-medium">Écoute en cours...</span>
        </div>
      )}
    </div>
  );
}