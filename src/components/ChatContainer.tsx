import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { Sparkles, ArrowDown, MessageCircle, Mic, Zap, Brain, Clock, Info, ExternalLink, Shield, Wand2 } from 'lucide-react'; // Added Info, ExternalLink
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils'; // Assuming cn utility is available for Tailwind class merging

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

// Type spécial pour le contexte RAG
interface RagContextPassage {
  id: number;
  titre: string;
  contenu: string;
  sourceUrl?: string; // Added optional source URL for RAG passages
}

interface RagContextMessage {
  id: string;
  passages: RagContextPassage[];
  isRagContext: true;
  timestamp: Date;
}

type ChatMessage = Message | RagContextMessage;

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onEditMessage?: (id: string, newText: string) => void; // New prop for editing messages
  onDeleteMessage?: (id: string) => void; // New prop for deleting messages
  onReplyToMessage?: (messageContent: string) => void; // New prop for replying to messages
  selectMode?: boolean; // Ajouté
  selectedMessageIds?: string[]; // Ajouté
  onSelectMessage?: (id: string) => void; // Ajouté
  modePrive?: boolean; // Ajouté
}

export function ChatContainer({ messages, isLoading, onEditMessage, onDeleteMessage, onReplyToMessage, selectMode = false, selectedMessageIds = [], onSelectMessage, modePrive = false }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showAllPassages, setShowAllPassages] = useState<{ [id: string]: boolean }>({});

  // Effect to scroll to bottom when new messages arrive or loading state changes, but only if near bottom
  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isNearBottom]);

  // Callback for handling scroll events to determine button visibility
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100; // Threshold for "near bottom"

    setIsNearBottom(nearBottom);
    // Show scroll button if not near bottom and there are messages to scroll through
    setShowScrollButton(!nearBottom && messages.length > 0);
  }, [messages.length]);

  // Callback to manually scroll to the bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handler for toggling RAG passage visibility
  const togglePassagesVisibility = useCallback((id: string) => {
    setShowAllPassages(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div
      className={cn(
        "flex-1 relative bg-gradient-to-br from-slate-50/80 via-white/90 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-800/60 backdrop-blur-xl",
        modePrive && "ring-2 ring-red-400/40 shadow-2xl shadow-red-400/20 bg-gradient-to-br from-red-50/20 via-white/90 to-purple-50/30 dark:from-red-950/20 dark:via-slate-900/90 dark:to-purple-950/30"
      )}
      style={{
        minHeight: '0',
        height: '100%',
        maxHeight: '100vh',
      }}
    >
      
      
      <ScrollArea
        className="flex-1 h-full overflow-y-auto p-2 sm:p-4 pb-24 custom-scrollbar"
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
        style={{
          minHeight: 0,
          maxHeight: 'calc(100vh - 120px)',
        }}
      >
        <div className="space-y-3 sm:space-y-4 min-h-[calc(60vh)] sm:min-h-0">
          {/* Hero sections améliorées */}
          {messages.length === 0 ? (
            modePrive ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                      Session Confidentielle
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                      Vos conversations sont <span className="font-semibold text-emerald-600 dark:text-emerald-400">totalement privées</span> et <span className="font-semibold text-blue-600 dark:text-blue-400">automatiquement effacées</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Shield, title: "Chiffrement", desc: "Messages protégés", color: "from-red-500 to-red-600" },
                      { icon: Zap, title: "Éphémère", desc: "Auto-suppression", color: "from-purple-500 to-purple-600" },
                      { icon: Brain, title: "Privé", desc: "Aucun stockage", color: "from-blue-500 to-blue-600" }
                    ].map((feature, idx) => (
                      <div 
                        key={feature.title}
                        className="group p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/60 dark:border-slate-700/60 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:rotate-12 transition-transform duration-300`}>
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{feature.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                
                
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                      Bienvenue sur NeuroChat
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
                      L'IA conversationnelle nouvelle génération avec support vocal, visuel et recherche documentaire avancée
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { icon: Brain, title: "IA Avancée", desc: "Réponses intelligentes", color: "from-blue-500 to-blue-600" },
                      { icon: Mic, title: "Vocal", desc: "Dictée & écoute", color: "from-emerald-500 to-green-600" },
                      { icon: Zap, title: "Instantané", desc: "Réponses rapides", color: "from-purple-500 to-purple-600" },
                      { icon: Wand2, title: "Magique", desc: "Expérience fluide", color: "from-indigo-500 to-indigo-600" }
                    ].map((feature, idx) => (
                      <div 
                        key={feature.title}
                        className="group p-3 sm:p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/60 dark:border-slate-700/60 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-2 mx-auto group-hover:rotate-12 transition-transform duration-300`}>
                          <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mb-1">{feature.title}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  
                </div>
              </div>
            )
          ) : (
            <>
              {/* Chat Header amélioré */}
              <div className="sticky top-0 z-10 mb-4 animate-in slide-in-from-top-2 duration-500">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                        {messages.filter(msg => !(msg as RagContextMessage).isRagContext).length} message{messages.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Conversation active</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-110"
                  >
                    <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </Button>
                </div>
              </div>

              {/* Messages avec animations améliorées */}
              {messages.map((message, index) => {
                if ((message as RagContextMessage).isRagContext && index === messages.length - 1) {
                  const rag = message as RagContextMessage;
                  const passagesToShow = showAllPassages[rag.id] ? rag.passages : rag.passages.slice(0, 3);
                  return (
                    <div key={rag.id} className="animate-in slide-in-from-left-4 fade-in-0 duration-500 my-3">
                      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-blue-50/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border-l-4 border-blue-500 dark:border-blue-400 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
                        <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <span>Base de connaissances</span>
                          <div className="ml-auto px-2 py-1 bg-blue-500/20 rounded-full text-xs">
                            {rag.passages.length} passage{rag.passages.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {passagesToShow.map((p, idx) => (
                            <div 
                              key={p.id} 
                              className="group p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-blue-200/30 dark:border-blue-800/30 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left-2"
                              style={{ animationDelay: `${idx * 100}ms` }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">{p.titre}</h4>
                                  <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                                    {p.contenu.length > 150 && !showAllPassages[rag.id] ? p.contenu.slice(0, 150) + '…' : p.contenu}
                                  </p>
                                  {p.sourceUrl && (
                                    <a
                                      href={p.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 hover:underline text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
                                      title="Voir la source"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Source</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {rag.passages.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all duration-200 hover:scale-105"
                            onClick={() => togglePassagesVisibility(rag.id)}
                          >
                            {showAllPassages[rag.id] ? 'Réduire les passages' : `Voir les ${rag.passages.length} passages`}
                            <ArrowDown className={cn("ml-2 h-4 w-4 transition-transform duration-300", showAllPassages[rag.id] && "rotate-180")} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                } else if (!(message as RagContextMessage).isRagContext) {
                  const msg = message as Message;
                  return (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex items-center gap-3 min-w-0 animate-in slide-in-from-bottom-2 fade-in-0 duration-300",
                        `animate-delay-${Math.min(index * 50, 500)}`
                      )}
                    >
                      {selectMode && (
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedMessageIds.includes(msg.id)}
                            onChange={() => onSelectMessage && onSelectMessage(msg.id)}
                            className="w-4 h-4 accent-blue-600 rounded border-2 border-blue-300 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            title="Sélectionner ce message"
                          />
                        </div>
                      )}
                      <MessageBubble
                        message={msg.text}
                        isUser={msg.isUser}
                        timestamp={msg.timestamp}
                        imageUrl={msg.imageUrl}
                        isLatest={index === messages.length - 1}
                        onEdit={onEditMessage ? (newText) => onEditMessage(msg.id, newText) : undefined}
                        onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
                        onReply={onReplyToMessage}
                      />
                    </div>
                  );
                } else {
                  return null;
                }
              })}
              
              {/* Typing Indicator amélioré */}
              {isLoading && (
                <div className="flex justify-start animate-in slide-in-from-left-4 fade-in-0 duration-300 ml-3 mb-4">
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/60 dark:border-slate-800/60">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
          
          {/* Scroll to bottom button amélioré */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="fixed bottom-24 right-4 h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 animate-in slide-in-from-bottom-4 hover:scale-110 group z-30 border-2 border-white/20"
              aria-label="Retour en bas"
            >
              <ArrowDown className="h-5 w-5 group-hover:animate-bounce drop-shadow-sm" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur animate-pulse" />
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}