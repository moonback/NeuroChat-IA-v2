import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { Loader2, Sparkles, ArrowDown, Trash2, Square, MessageCircle, Mic, Zap, Brain, Clock } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

// Type spécial pour le contexte RAG
interface RagContextMessage {
  id: string;
  passages: { id: number; titre: string; contenu: string }[];
  isRagContext: true;
  timestamp: Date;
}

type ChatMessage = Message | RagContextMessage;

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  // État global pour l'affichage des passages RAG
  const [showAllPassages, setShowAllPassages] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isNearBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;
    
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && messages.length > 0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearChat = () => {
    // This would need to be implemented in the parent component
    // For now, we'll just show a toast
    console.log('Clear chat functionality would be implemented here');
  };

  return (
    <div className="flex-1 h-full relative bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
      <ScrollArea 
        className="flex-1 h-full overflow-y-auto p-2 sm:p-3" 
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        <div className="space-y-2 sm:space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-center px-2">
              {/* Hero section améliorée */}
              <div className="relative mb-4 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
                  <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {/* Indicateur de statut animé */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
                {/* Particules flottantes */}
                <div className="absolute -top-3 -left-3 w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.5s] opacity-70 shadow-lg"></div>
                <div className="absolute -bottom-3 -right-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:1s] opacity-70 shadow-md"></div>
                <div className="absolute top-1/2 -left-4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:1.5s] opacity-70 shadow-md"></div>
                <div className="absolute -top-2 right-3 w-1 h-1 bg-pink-400 rounded-full animate-bounce [animation-delay:2s] opacity-60 shadow-sm"></div>
                {/* Cercles de pulsation */}
                <div className="absolute inset-0 rounded-full border border-blue-300 animate-ping opacity-30"></div>
                <div className="absolute inset-0 rounded-full border border-purple-300 animate-ping opacity-20 [animation-delay:1s]"></div>
              </div>
              <div className="max-w-xl mx-auto">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
                  Bienvenue sur NeuroChat
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-xs sm:text-sm leading-relaxed mb-4">
                  Découvre le futur de la conversation avec l'IA : reconnaissance vocale avancée, langage naturel et réponses intelligentes propulsées par Google Gemini Pro.
                </p>
                {/* Cartes de fonctionnalités */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-xl mb-4">
                  <div className="group p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:scale-105 transition-transform duration-300">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-xs">IA avancée</h4>
                    <p className="text-[10px] text-blue-700 dark:text-blue-300">Compréhension contextuelle et réponses naturelles</p>
                  </div>
                  <div className="group p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:scale-105 transition-transform duration-300">
                      <Mic className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1 text-xs">Prêt pour la voix</h4>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Parle naturellement et écoute les réponses</p>
                  </div>
                  <div className="group p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30 hover:shadow-lg transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:scale-105 transition-transform duration-300">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1 text-xs">Temps réel</h4>
                    <p className="text-[10px] text-purple-700 dark:text-purple-300">Réponses instantanées et fluides</p>
                  </div>
                </div>
                {/* Call to action */}
                <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Prêt à commencer ?
                    </span>
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse [animation-delay:0.5s]" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/80">
                    Écris un message ou clique sur le micro pour parler
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* En-tête du chat */}
              {messages.length > 0 && (
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md p-2 mx-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2 h-2" />
                        Conversation active
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message, index) => {
                if ((message as any).isRagContext) {
                  const rag = message as RagContextMessage;
                  const passagesToShow = showAllPassages[rag.id] ? rag.passages : rag.passages.slice(0, 3);
                  return (
                    <div key={rag.id} className="animate-fadeIn">
                      <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 rounded-xl p-2 mb-2">
                        <div className="font-semibold text-blue-800 dark:text-blue-200 text-xs flex items-center gap-1 mb-1">
                          <span role="img" aria-label="Livre">📚</span> Passages de la base :
                        </div>
                        <ol className="list-decimal pl-3 space-y-1">
                          {passagesToShow.map((p) => (
                            <li key={p.id}>
                              <span className="font-bold text-blue-900 dark:text-blue-100 text-xs">{p.titre} : </span>
                              <span className="text-xs text-blue-900 dark:text-blue-100 bg-blue-100/60 dark:bg-blue-800/40 rounded px-1">
                                {p.contenu.length > 150 ? p.contenu.slice(0, 150) + '…' : p.contenu}
                              </span>
                            </li>
                          ))}
                        </ol>
                        {rag.passages.length > 3 && (
                          <button
                            className="text-xs text-blue-600 hover:underline mt-1"
                            onClick={() => setShowAllPassages((prev) => ({ ...prev, [rag.id]: !prev[rag.id] }))}
                          >
                            {showAllPassages[rag.id] ? 'Réduire' : `Afficher tout (${rag.passages.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const msg = message as Message;
                  return (
                    <div key={msg.id} className="animate-fadeIn">
                      <MessageBubble
                        message={msg.text}
                        isUser={msg.isUser}
                        timestamp={msg.timestamp}
                        isLatest={index === messages.length - 1}
                        imageUrl={msg.imageUrl}
                      />
                    </div>
                  );
                }
              })}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
          {/* Bouton de scroll */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn hover:scale-110 group"
            >
              <ArrowDown className="h-4 w-4 group-hover:animate-bounce" />
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}