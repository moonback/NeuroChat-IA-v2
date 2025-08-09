import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff, ImageIcon, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { ReasoningTimeline, type ReasoningStep } from '@/components/ReasoningTimeline';

interface VoiceInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
  reasoningVisible?: boolean;
  reasoningSteps?: ReasoningStep[];
  reasoningLoading?: boolean;
  reasoningSpeaking?: boolean;
}

// Emoji UI retirée

export function VoiceInput({ onSendMessage, isLoading, reasoningVisible = false, reasoningSteps = [], reasoningLoading = false, reasoningSpeaking = false }: VoiceInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // Emoji picker retiré

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

  // handleEmojiClick retiré

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
      {/* Container principal plus compact et discret */}
      <div className="p-3 sm:p-4 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-white/30 dark:border-slate-800/40 shadow-xl">
        {/* Timeline compacte inline */}
        <div className="mb-2">
          <ReasoningTimeline
            visible={reasoningVisible}
            steps={reasoningSteps}
            loading={reasoningLoading}
            speaking={reasoningSpeaking}
            variant="inline"
            showProgress
            allowPin={false}
            disableAutoClose
          />
        </div>

        {/* Aperçu image compact et discret */}
        {selectedImage && (
          <div className="mb-2 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 shadow-sm">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Aperçu"
                className="w-8 h-8 rounded-md object-cover border border-white/50 dark:border-slate-700"
              />
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="max-w-[120px] truncate" title={selectedImage.name}>{selectedImage.name}</span>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>{(selectedImage.size / 1024).toFixed(0)} Ko</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="ml-1 text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200"
                title="Retirer l'image"
              >
                Retirer
              </button>
            </div>
          </div>
        )}

        {/* Zone de saisie principale: actions à gauche, input au centre, actions à droite */}
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-4xl mx-auto">
          {/* Groupe gauche: image + emoji */}
          <div className="relative flex items-center gap-1.5">
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
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-100/90 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200/70 dark:border-slate-700/60"
              title="Envoyer une image"
              aria-label="Envoyer une image"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            {/* Bouton emoji et picker retirés */}
          </div>

          {/* Input au centre */}
          <div className="flex-1">
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
                "border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 h-11 sm:h-12 text-sm sm:text-base rounded-xl px-3 sm:px-4 py-2 focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-0 placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70 text-slate-800 dark:text-slate-200",
                isFocused && !listening && "shadow-sm"
              )}
            />
          </div>

          {/* Groupe droite: micro + envoyer */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant={listening ? 'default' : 'ghost'}
              className={cn(
                "h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-200 border",
                listening
                  ? "bg-red-500 text-white border-red-600 hover:bg-red-600"
                  : "bg-slate-100/90 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              )}
              onClick={handleMicClick}
              title={listening ? "Arrêter la dictée vocale" : !isSupported ? "Reconnaissance vocale non supportée" : "Démarrer la dictée vocale"}
              aria-label={listening ? "Arrêter la dictée vocale" : "Démarrer la dictée vocale"}
              disabled={isLoading || !isSupported}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              onClick={handleSend}
              disabled={!hasContent || isLoading}
              size="icon"
              className={cn(
                "h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-200 shadow-sm border",
                hasContent && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
              aria-label="Envoyer le message"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Indicateur de statut vocal */}
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

        {/* Indicateur de chargement */}
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

      {/* Overlay emoji retiré */}
    </div>
  );
}