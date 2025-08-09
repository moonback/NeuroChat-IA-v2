import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Smile, Mic, MicOff, ImageIcon, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

const EMOJIS = ['😀','😂','😍','😎','🥳','😢','😡','👍','🙏','👏','🤔','😅','😇','😱','🎉','❤️','🔥','💡','🤖','🙌'];

export function VoiceInput({ onSendMessage, isLoading }: VoiceInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Pré-remplissage via un événement global (pour le bouton Répondre)
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent<string>).detail;
        if (typeof detail === 'string') {
          setInputValue(detail);
          inputRef.current?.focus();
        }
      } catch {}
    };
    document.addEventListener('voice-input:prefill', handler as EventListener);
    return () => document.removeEventListener('voice-input:prefill', handler as EventListener);
  }, []);

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
    continuous: true, // Mode continu pour ne pas s'arrêter à chaque pause
    onResult: (finalText) => {
      setInputValue(finalText);
    },
    onEnd: (finalText) => {
      // Ne plus envoyer automatiquement - laisser l'utilisateur décider
      if (finalText) {
        setInputValue(finalText);
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
    
    // Arrêter la dictée vocale si elle est en cours
    if (listening) {
      stop();
    }
    
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
    <div className="relative">
      {/* Container principal avec glass morphism */}
      <div className="p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border-t border-white/40 dark:border-slate-800/60 shadow-2xl">
        {/* Aperçu image amélioré */}
        {selectedImage && (
          <div className="mb-4 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
            <div className="relative inline-flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-300 group">
              <div className="relative overflow-hidden rounded-xl border-2 border-white/80 dark:border-slate-800/80 shadow-md">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Aperçu"
                  className="w-16 h-16 object-cover bg-white dark:bg-slate-900 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm truncate max-w-[150px]" title={selectedImage.name}>
                  {selectedImage.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span>{(selectedImage.size / 4096).toFixed(1)} Ko</span>
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span>Image</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-red-500/40 hover:scale-110 transition-all duration-200 flex items-center justify-center border-2 border-white dark:border-slate-900 group/close"
                title="Retirer l'image"
              >
                <svg className="w-3 h-3 group-hover/close:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Zone de saisie principale */}
        <div className="flex items-end gap-2 sm:gap-4 w-full max-w-4xl mx-auto">
          {/* Bouton upload image amélioré */}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="icon"
            className="h-11 w-11 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110 group border-2 border-white/20 backdrop-blur-xl"
            title="Envoyer une image"
          >
            <ImageIcon className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
          </Button>

          {/* Container input principal */}
          <div className="flex-1 relative">
            <div
              className={cn(
                "relative rounded-2xl transition-all duration-300 backdrop-blur-xl border-2",
                listening 
                  ? "bg-gradient-to-r from-red-50/90 via-red-100/90 to-red-50/90 dark:from-red-950/50 dark:via-red-900/50 dark:to-red-950/50 border-red-400 shadow-xl shadow-red-200/40 dark:shadow-red-900/40"
                  : isFocused
                  ? "bg-white/95 dark:bg-slate-800/95 border-blue-400 shadow-xl shadow-blue-200/40 dark:shadow-blue-800/40"
                  : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600"
              )}
            >
              {/* Effet de lueur pour le mode vocal */}
              {listening && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 to-red-600/20 blur animate-pulse pointer-events-none" />
              )}
              
              <Input
                ref={inputRef}
                value={displayValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={listening ? "🎤 Dictée en cours... Cliquez sur 'Arrêter' quand vous avez fini" : "💭 Votre message..."}
                disabled={isLoading || listening}
                className={cn(
                  "border-0 bg-transparent h-12 sm:h-14 text-sm sm:text-base rounded-2xl pr-28 sm:pr-32 pl-4 sm:pl-6 py-3 sm:py-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70 text-slate-800 dark:text-slate-200 font-medium",
                  listening && "placeholder:text-red-600/80 dark:placeholder:text-red-400/80"
                )}
              />

              {/* Boutons d'action dans l'input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Bouton micro amélioré */}
                <Button
                  type="button"
                  size="icon"
                  variant={listening ? "default" : "ghost"}
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-all duration-300 border-2",
                    listening
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg hover:shadow-red-500/40 border-white/20"
                      : "bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:scale-110 border-transparent"
                  )}
                  onClick={handleMicClick}
                  title={listening ? "Arrêter la dictée vocale" : !isSupported ? "Reconnaissance vocale non supportée" : "Démarrer la dictée vocale (mode continu)"}
                  disabled={isLoading || !isSupported}
                >
                  {listening ? (
                    <MicOff className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                {/* Bouton emoji amélioré */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-110 border-2 border-transparent"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  tabIndex={-1}
                  aria-label="Insérer un emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              {/* Picker emoji amélioré */}
              {showEmojiPicker && (
                <div className="absolute z-50 bottom-14 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 text-center">Émojis populaires</div>
                  <div className="grid grid-cols-8 gap-2 w-80">
                    {EMOJIS.map((emoji, idx) => (
                      <button
                        key={emoji}
                        type="button"
                        className="text-2xl p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all duration-200 hover:scale-125 active:scale-110 animate-in zoom-in-0"
                        onClick={() => handleEmojiClick(emoji)}
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}

              {/* Indicateur d'erreur vocal */}
              {speechError && (
                <div className="absolute left-0 -bottom-10 right-0 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
                  <div className="text-xs text-red-600 dark:text-red-400 bg-red-50/90 dark:bg-red-950/50 px-3 py-2 rounded-xl shadow-lg backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>{speechError}</span>
                  </div>
                </div>
              )}

              {/* Compteur de caractères */}
              {displayValue && (
                <div className="absolute -bottom-8 right-0 text-xs text-slate-500/70 dark:text-slate-400/70 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                  {displayValue.length} caractère{displayValue.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Bouton envoi amélioré */}
          <Button
            onClick={handleSend}
            disabled={!hasContent || isLoading}
            size="icon"
            className={cn(
              "h-11 w-11 sm:h-12 sm:w-12 rounded-2xl transition-all duration-300 shadow-xl border-2 border-white/20",
              hasContent && !isLoading
                ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-blue-200 dark:shadow-blue-800 hover:scale-110 hover:shadow-2xl"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 scale-95 shadow-slate-200 dark:shadow-slate-800",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-95"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : hasContent ? (
              <>
                <Send className="h-5 w-5" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur animate-pulse pointer-events-none" />
              </>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Indicateur de statut vocal amélioré */}
        {listening && (
          <div className="flex flex-col items-center gap-3 mt-4 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-red-500 rounded-full animate-bounce" 
                      style={{ animationDelay: `${i * 150}ms` }} 
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">🎤 Dictée en cours - Parlez librement</span>
              </div>
              
              <Button
                type="button"
                size="sm"
                onClick={handleMicClick}
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/40 transition-all duration-200 px-4 py-2 rounded-xl border-2 border-white/20"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Arrêter
              </Button>
              
              <div className="px-3 py-1 bg-red-100/80 dark:bg-red-950/50 rounded-full border border-red-200 dark:border-red-800 backdrop-blur-xl">
                <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300">
                  <Zap className="w-3 h-3" />
                  <span>Mode continu</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-slate-600 dark:text-slate-400 text-center bg-blue-50/80 dark:bg-blue-950/30 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 backdrop-blur-xl">
              💡 <span className="font-medium">Conseil :</span> Parlez naturellement avec des pauses. Cliquez sur "Arrêter" quand vous avez fini, puis sur "Envoyer".
            </div>
          </div>
        )}

        {/* Indicateur de chargement amélioré */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 mt-4 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Envoi en cours...</span>
            </div>
            <div className="px-3 py-1 bg-blue-100/80 dark:bg-blue-950/50 rounded-full border border-blue-200 dark:border-blue-800 backdrop-blur-xl">
              <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Traitement</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour fermer l'emoji picker */}
      {showEmojiPicker && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}