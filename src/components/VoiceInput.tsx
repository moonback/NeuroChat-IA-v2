import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff, ImageIcon, X, Command, Paperclip, FileText, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { Provider } from '@/services/llm';

interface VoiceInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
  provider?: Provider;
  agentEnabled?: boolean;
  onToggleAgent?: () => void;
}

export function VoiceInput({ onSendMessage, isLoading, provider = 'gemini', agentEnabled = false, onToggleAgent }: VoiceInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [fileInfo, setFileInfo] = useState<{ kind: 'image' | 'pdf' | 'docx' | 'other'; pages?: number; words?: number }>({ kind: 'other' });

  // Commandes slash supportées
  const slashCommands = [
    { cmd: '/memoir', label: 'Ajouter à la mémoire', icon: '💾' },
    { cmd: '/supp', label: 'Supprimer de la mémoire', icon: '🗑️' },
    { cmd: '/memlist', label: 'Lister 5 éléments', icon: '📋' },
  ];
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);

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
    continuous: true,
    onResult: (finalText) => {
      setInputValue(finalText);
    },
    onEnd: (finalText) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setExtractedText("");
    const mime = file.type || '';
    const name = file.name.toLowerCase();
    if (mime.startsWith('image/')) {
      setFileInfo({ kind: 'image' });
      return;
    }
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfModule: any = await import('pdfjs-dist');
        const pdfjsLib = pdfModule?.default ?? pdfModule;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setFileInfo({ kind: 'pdf', pages: pdf.numPages });
        // Extraction légère: première page texte (optionnel, court)
        try {
          const page = await pdf.getPage(1);
          const content = await page.getTextContent();
          const text = content.items.map((it: any) => (it?.str || '')).join(' ');
          setExtractedText(text.trim());
        } catch {}
      } catch {
        setFileInfo({ kind: 'pdf' });
      }
      return;
    }
    if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx') ||
      mime === 'application/msword' ||
      name.endsWith('.doc')
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothModule: any = await import('mammoth');
        const mammoth = mammothModule?.default ?? mammothModule;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = (result?.value || '').trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        setFileInfo({ kind: 'docx', words });
        setExtractedText(text);
      } catch {
        setFileInfo({ kind: 'docx' });
      }
      return;
    }
    setFileInfo({ kind: 'other' });
  };

  const handleSend = () => {
    const baseText = listening && transcript ? transcript : inputValue;
    if (!baseText.trim() && !selectedFile) return;
    if (listening) {
      stop();
    }
    // Pour PDF/DOCX, injecter un extrait texte dans le message
    let finalText = baseText;
    if (selectedFile && (fileInfo.kind === 'pdf' || fileInfo.kind === 'docx')) {
      const header = `\n\n[Pièce jointe: ${selectedFile.name}]`;
      const excerpt = extractedText ? `\n${extractedText.slice(0, 6000)}` : '';
      finalText = `${baseText}${header}${excerpt}`.trim();
    }
    const imageToSend = selectedFile && fileInfo.kind === 'image' ? selectedFile : undefined;
    onSendMessage(finalText, imageToSend);
    setInputValue('');
    setSelectedFile(null);
    setExtractedText("");
    setFileInfo({ kind: 'other' });
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
  const hasContent = displayValue.trim().length > 0 || !!selectedFile;
  const showSlashHelp = displayValue.trim().startsWith('/');
  const slashToken = showSlashHelp ? displayValue.trim().split(/\s+/)[0] : '';
  const filteredCommands = showSlashHelp
    ? slashCommands.filter(c => c.cmd.toLowerCase().startsWith(slashToken.toLowerCase()))
    : [];

  useEffect(() => {
    setActiveSuggestionIdx(0);
  }, [slashToken]);

  const handleInsert = (template: string) => {
    if (listening) {
      stop();
    }
    setInputValue(template.endsWith(' ') ? template : template + ' ');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSlashHelp || filteredCommands.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx((idx) => (idx + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx((idx) => (idx - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleInsert(filteredCommands[activeSuggestionIdx].cmd);
    } else if (e.key === 'Enter') {
      if (slashToken !== filteredCommands[activeSuggestionIdx].cmd) {
        e.preventDefault();
        handleInsert(filteredCommands[activeSuggestionIdx].cmd);
      }
    }
  };

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
      {/* Container principal avec effet glassmorphism */}
       <div className="sticky bottom-0 z-50">
        <div className="relative">
           {/* Gradient retiré pour éviter le chevauchement des messages */}
          
           <div className="backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-t border-white/40 dark:border-slate-800/40 shadow-xl">
             <div className="px-3 py-3 sm:px-4 sm:py-3 max-w-5xl mx-auto">
              
               {/* Timeline retirée */}

              {/* Aperçu fichier élégant (image, pdf, docx, autres) */}
               {selectedFile && (
                 <div className="mb-3 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                  <div className="relative inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-sm">
                    <div className="relative">
                      {fileInfo.kind === 'image' ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Aperçu"
                          className="w-10 h-10 rounded-lg object-cover border border-white/80 dark:border-slate-700/80 shadow"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-white/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center shadow">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        {fileInfo.kind === 'image' ? (
                          <ImageIcon className="w-3 h-3 text-white" />
                        ) : (
                          <FileText className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-blue-700/80 dark:text-blue-300/80">
                        {(() => {
                          const size = selectedFile.size;
                          const sizeStr = size >= 1024 * 1024 ? `${(size / (1024*1024)).toFixed(1)} Mo` : `${(size / 1024).toFixed(1)} Ko`;
                          const ext = (selectedFile.type || '').split('/')[1]?.toUpperCase() || selectedFile.name.split('.').pop()?.toUpperCase();
                          const meta = fileInfo.kind === 'pdf' && fileInfo.pages ? ` • ${fileInfo.pages} page${fileInfo.pages>1?'s':''}` : fileInfo.kind === 'docx' && fileInfo.words ? ` • ${fileInfo.words} mots` : '';
                          return `${sizeStr} • ${ext || 'FICHIER'}${meta}`;
                        })()}
                      </div>
                      {extractedText && fileInfo.kind !== 'image' && (
                        <div className="mt-1 text-xs text-blue-900/80 dark:text-blue-100/80 line-clamp-2">
                          {extractedText}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => { setSelectedFile(null); setExtractedText(""); setFileInfo({ kind: 'other' }); }}
                      className="h-7 w-7 p-0 rounded-md hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
                      title="Retirer le fichier"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Zone de saisie principale redesignée */}
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
                    
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      size="icon"
                      variant="ghost"
                       className={cn(
                         "h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden group",
                        "bg-gradient-to-br from-slate-100/90 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-700/90",
                        "hover:from-blue-100/90 hover:to-blue-200/90 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50",
                        "border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300/60 dark:hover:border-blue-600/60",
                        "shadow-lg hover:shadow-xl shadow-black/5 dark:shadow-black/20"
                      )}
                      title="Joindre un fichier (image, PDF, DOCX)"
                    >
                      <Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>

                    {/* Toggle Agent (Gemini/Mistral) */}
                    {(provider === 'gemini' || provider === 'mistral') && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onToggleAgent}
                        disabled={isLoading}
                        className={cn(
                          "h-9 px-3 rounded-xl border transition-all duration-300 flex items-center gap-2",
                          agentEnabled
                            ? provider === 'gemini'
                              ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border-indigo-300/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-purple-300/60 text-purple-700 dark:text-purple-300'
                            : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50/90 dark:hover:bg-slate-700/90'
                        )}
                        title={agentEnabled ? `Désactiver ${provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}` : `Activer ${provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}`}
                      >
                        {provider === 'gemini' ? (
                          <Sparkles className={cn("w-4 h-4", agentEnabled ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400')} />
                        ) : (
                          <Bot className={cn("w-4 h-4", agentEnabled ? 'text-purple-600 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400')} />
                        )}
                        <span className="text-xs font-medium">
                          {agentEnabled ? 'Agent: ON' : 'Activer agent'}
                        </span>
                      </Button>
                    )}
                  </div>

                  {/* Input principal avec design moderne */}
                   <div className="flex-1 relative group">
                    <Input
                      ref={inputRef}
                      value={displayValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
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
                         isFocused && !listening && "shadow-md border-blue-400/70"
                      )}
                    />
                    
                    {/* Indicateur de caractères (optionnel) */}
                    {displayValue.length > 100 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-lg">
                        {displayValue.length}
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action droite */}
                   <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleMicClick}
                      disabled={isLoading || !isSupported}
                      className={cn(
                         "h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden group",
                        listening
                          ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-600 shadow-lg shadow-red-500/30"
                          : "bg-gradient-to-br from-slate-100/90 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-700/90 hover:from-green-100/90 hover:to-green-200/90 dark:hover:from-green-900/50 dark:hover:to-green-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-green-300/60 dark:hover:border-green-600/60 shadow-lg hover:shadow-xl shadow-black/5 dark:shadow-black/20"
                      )}
                      title={listening ? "Arrêter la dictée" : !isSupported ? "Non supporté" : "Démarrer la dictée"}
                    >
                      {listening ? (
                        <MicOff className="h-5 w-5 animate-pulse" />
                      ) : (
                        <Mic className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>

                     <Button
                      onClick={handleSend}
                      disabled={!hasContent || isLoading}
                      size="icon"
                      className={cn(
                         "h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden group",
                        hasContent && !isLoading
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 scale-100 hover:scale-105"
                          : "bg-gradient-to-br from-slate-200/90 to-slate-300/90 dark:from-slate-700/90 dark:to-slate-600/90 text-slate-400 dark:text-slate-500 shadow-lg opacity-60",
                        "disabled:cursor-not-allowed disabled:hover:scale-100"
                      )}
                      aria-label="Envoyer le message"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Suggestions de commandes slash améliorées */}
               {showSlashHelp && (
                 <div className="mt-2 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <Command className="w-4 h-4" />
                      <span className="font-medium">Commandes disponibles :</span>
                    </div>
                    <div className="w-full flex flex-wrap gap-2">
                      {(filteredCommands.length > 0 ? filteredCommands : slashCommands).map((c, idx) => (
                         <Button
                          key={c.cmd}
                          type="button"
                          size="sm"
                          variant="ghost"
                          className={cn(
                             "h-8 px-3 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                            activeSuggestionIdx === idx
                              ? "bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-300/60 dark:border-blue-600/60 text-blue-700 dark:text-blue-300"
                              : "bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300"
                          )}
                          onClick={() => handleInsert(c.cmd)}
                          title={c.label}
                        >
                          <div className="flex items-center gap-2">
                             <span className="text-xs">{c.icon}</span>
                             <code className="font-mono text-xs font-medium">{c.cmd}</code>
                             <span className="text-[10px] opacity-70 hidden sm:inline">• {c.label}</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Indicateur de dictée vocale redesigné */}
               {listening && (
                 <div className="mt-3 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-50/90 via-pink-50/90 to-red-50/90 dark:from-red-950/50 dark:via-pink-950/50 dark:to-red-950/50 border border-red-200/60 dark:border-red-800/60 shadow-xl backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex gap-1.5">
                            {[...Array(4)].map((_, i) => (
                              <div 
                                key={i}
                                className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce shadow-md" 
                                style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }} 
                              />
                            ))}
                          </div>
                          <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-pulse" />
                        </div>
                        
                        <div className="text-center sm:text-left">
                          <div className="text-base font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                            🎤 Dictée vocale active
                          </div>
                          <div className="text-sm text-red-600/80 dark:text-red-400/80">
                            Parlez naturellement, arrêtez quand vous avez terminé
                          </div>
                        </div>
                      </div>
                      
                       <Button
                        type="button"
                        onClick={handleMicClick}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/40 transition-all duration-200 px-6 py-3 rounded-xl border-2 border-red-400/30 group"
                      >
                        <MicOff className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                        Arrêter
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}