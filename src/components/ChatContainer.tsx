import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { ArrowDown, Zap, Brain, Clock, Info, ExternalLink, Shield, X, Smile, BookOpen } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils'; // Assuming cn utility is available for Tailwind class merging

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  memoryFactsCount?: number;
  sources?: Array<{ title: string; url: string }>;
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
  modeEnfant?: boolean; // Ajouté
}

export function ChatContainer({ messages, isLoading, onEditMessage, onDeleteMessage, onReplyToMessage, selectMode = false, selectedMessageIds = [], onSelectMessage, modePrive = false, modeEnfant = false }: ChatContainerProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showAllPassages, setShowAllPassages] = useState<{ [id: string]: boolean }>({});
  const [showChatInfo, setShowChatInfo] = useState(false);

  // Recalculer la position bas de page via Virtuoso
  const handleAtBottomChange = useCallback((atBottom: boolean) => {
    setIsNearBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 0);
  }, [messages.length]);

  // Callback to manually scroll to the bottom
  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({ index: messages.length + (isLoading ? 1 : 0), behavior: 'smooth' });
  }, [messages.length, isLoading]);

  // Handler for toggling RAG passage visibility
  const togglePassagesVisibility = useCallback((id: string) => {
    setShowAllPassages(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Handler for showing chat info
  const handleShowChatInfo = useCallback(() => {
    setShowChatInfo(true);
  }, []);

  // Handler for closing chat info
  const handleCloseChatInfo = useCallback(() => {
    setShowChatInfo(false);
  }, []);

  // Auto-scroll vers le bas lors de la réception d'un nouveau message
  // Ne s'exécute que si l'utilisateur est proche du bas (intention de suivre la conversation)
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

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
      <div className="flex-1 h-full p-2 sm:p-4 pb-24 custom-scrollbar">
        <div className="space-y-3 sm:space-y-4 min-h-[calc(60vh)] sm:min-h-0">
          {/* Hero sections améliorées */}
          {messages.length === 0 ? (
            modeEnfant ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                      Espace Enfants
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                      Un endroit <span className="font-semibold text-pink-600 dark:text-pink-400">amusant</span> et <span className="font-semibold text-emerald-600 dark:text-emerald-400">sécurisé</span> pour apprendre, jouer et discuter
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Smile, title: 'Ludique', desc: 'Jeux et quiz adaptés', color: 'from-pink-500 to-rose-500' },
                      { icon: BookOpen, title: 'Pédagogique', desc: 'Explications simples', color: 'from-violet-500 to-indigo-500' },
                      { icon: Shield, title: 'Sécurisé', desc: 'Contenu approprié', color: 'from-emerald-500 to-teal-500' }
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
            ) : modePrive ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                
                {/* Avatar retiré */}
                
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
              <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 relative">
                
                {/* Avatar retiré */}
                
                {/* Halo décoratif au-dessus du titre */}
                <div className="hero-top-glow" aria-hidden="true" />
                {/* Halo en bas à gauche */}
                <div className="hero-bottom-left-glow" aria-hidden="true" />

                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                      Bienvenue sur NeuroChat
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
                      L'IA conversationnelle nouvelle génération avec support vocal, visuel et recherche documentaire avancée
                    </p>
                  </div>
                  
                </div>
              </div>
            )
          ) : (
            <>
              <Virtuoso
                ref={virtuosoRef}
                style={{ height: 'calc(100vh - 160px)' }}
                atBottomStateChange={handleAtBottomChange}
                atBottomThreshold={200}
                followOutput={isNearBottom ? 'smooth' : false}
                totalCount={messages.length + (isLoading ? 1 : 0)}
                components={{
                  Header: () => (
                    <div className="sticky top-0 z-10 mb-2 animate-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center justify-between p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {messages.filter(msg => !(msg as RagContextMessage).isRagContext).length} message{messages.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Active</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200"
                          onClick={handleShowChatInfo}
                          title="Informations sur la conversation"
                        >
                          <Info className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  ),
                }}
                itemContent={(index: number) => {
                  if (index === messages.length && isLoading) {
                    return (
                      <div className="flex justify-start animate-in slide-in-from-left-4 fade-in-0 duration-300 ml-3 mb-4">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/60 dark:border-slate-800/60">
                          <TypingIndicator />
                        </div>
                      </div>
                    );
                  }
                  const message = messages[index];
                  if (!message) return null;
                  if ((message as RagContextMessage).isRagContext && index === messages.length - 1) {
                    const rag = message as RagContextMessage;
                    const passagesToShow = showAllPassages[rag.id] ? rag.passages : rag.passages.slice(0, 3);
                    return (
                      <div className="animate-in slide-in-from-left-4 fade-in-0 duration-500 my-3">
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
                  }
                  const msg = message as Message;
                  return (
                    <div 
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
                        memoryFactsCount={msg.memoryFactsCount}
                        sources={msg.sources}
                        isLatest={index === messages.length - 1}
                        onEdit={onEditMessage ? (newText) => onEditMessage(msg.id, newText) : undefined}
                        onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
                        onReply={onReplyToMessage}
                      />
                    </div>
                  );
                }}
              />
            </>
          )}
          
          {/* Scroll to bottom button amélioré */}
          {showScrollButton && messages.length > 0 && (
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
      </div>

      {/* Modal d'informations sur la conversation */}
      {showChatInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Informations de la conversation
                  </h2>
                </div>
                <button 
                  onClick={handleCloseChatInfo}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {messages.filter(msg => !(msg as RagContextMessage).isRagContext).length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Messages</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {messages.filter(msg => (msg as RagContextMessage).isRagContext).length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Contexte RAG</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Messages utilisateur</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {messages.filter(msg => !(msg as RagContextMessage).isRagContext && (msg as Message).isUser).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Réponses IA</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {messages.filter(msg => !(msg as RagContextMessage).isRagContext && !(msg as Message).isUser).length}
                  </span>
                </div>
                {messages.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Démarré le</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {messages.find(msg => !(msg as RagContextMessage).isRagContext)?.timestamp.toLocaleString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {modePrive && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Mode privé activé</span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Cette conversation sera automatiquement supprimée
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={handleCloseChatInfo}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}