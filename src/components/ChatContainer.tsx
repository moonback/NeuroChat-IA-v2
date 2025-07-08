import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { Sparkles, ArrowDown, MessageCircle, Mic, Zap, Brain, Clock, Info, ExternalLink } from 'lucide-react'; // Added Info, ExternalLink
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
    <div className={
      "flex-1 h-full relative bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30 " +
      (modePrive ? " animate-prive-glow ring-4 ring-red-400/60 shadow-2xl shadow-red-400/30" : "")
    }>
      {/* Badge privé animé en haut à droite
      {modePrive && (
        <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white font-bold text-xs shadow-lg animate-bouncePrivé border-2 border-white/40 select-none pointer-events-none">
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='inline align-middle mr-1'>
            <rect x='5' y='11' width='14' height='9' rx='2' className='fill-white/20'/>
            <path d='M12 17v-2' className='stroke-white'/>
            <path d='M7 11V7a5 5 0 0110 0v4' className='stroke-white'/>
          </svg>
          Privé
        </div>
      )} */}
      <ScrollArea
        className="flex-1 h-full overflow-y-auto p-2 sm:p-3"
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        <div className="space-y-2 sm:space-y-3">
          {/* Conditional rendering for hero section or chat content */}
          {messages.length === 0 ? (
            modePrive ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] sm:min-h-[320px] text-center px-2 mb-4 animate-fadeIn">
                {/* Icône héros : bouclier sécurisé avec effets de halo et particules */}
                <div className="relative mb-6 group animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20 dark:border-slate-800/60 backdrop-blur-xl relative">
                    {/* Effet de halo glass */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-emerald-300/10 blur-2xl pointer-events-none"></div>
                    {/* Glow subtil */}
                    <div className="absolute inset-0 rounded-3xl ring-2 ring-blue-400/20 animate-pulse pointer-events-none"></div>
                    {/* Icône bouclier stylisé */}
                    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="url(#shield-gradient)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-xl z-10 animate-popIn">
                      <defs>
                        <linearGradient id="shield-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="60%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a21caf" />
                        </linearGradient>
                      </defs>
                      <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" className="fill-white/10" />
                      <path d="M9.5 12.5l2 2 3-3" className="stroke-emerald-300 animate-pulse" />
                    </svg>
                  </div>
                  {/* Badge confidentiel glass */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl border border-blue-300/30 dark:border-blue-700/30 shadow-lg text-blue-900 dark:text-blue-100 font-bold text-xs select-none animate-bouncePrivé tracking-wide" style={{boxShadow:'0 2px 16px 0 rgba(99,102,241,0.12)'}}>Confidentiel</div>
                </div>
                <div className="max-w-2xl mx-auto w-full">
                  {/* Sous-titre rassurant premium */}
                  <p className="text-blue-900 dark:text-blue-100 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed mb-6 font-medium animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                    Profitez d'une confidentialité totale : vos messages ne sont <span className="underline underline-offset-2 decoration-emerald-400">jamais sauvegardés</span>, <span className="underline underline-offset-2 decoration-blue-400">effacés automatiquement</span> à la fermeture, et <span className="underline underline-offset-2 decoration-slate-400">chiffrés localement</span>.<br />
                    <span className="text-indigo-700 dark:text-indigo-300 font-bold">Aucune trace, aucune fuite, 100% sécurisé.</span>
                  </p>
                  {/* Grille de fonctionnalités premium glass */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl mx-auto mb-6 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                    {/* Carte 1 : Aucune sauvegarde */}
                    <div className="group p-4 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-blue-200/40 dark:border-blue-700/30 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center min-h-[120px] backdrop-blur-xl">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
                          <path d="M16 3v4H8V3" />
                          <path d="M10 12l2 2 4-4" className="stroke-emerald-200 animate-pulse" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-xs">Aucune sauvegarde</h4>
                      <p className="text-[11px] text-blue-800 dark:text-blue-200/90">Vos messages restent uniquement sur votre appareil.</p>
                    </div>
                    {/* Carte 2 : Effacement automatique */}
                    <div className="group p-4 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-indigo-200/40 dark:border-indigo-700/30 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center min-h-[120px] backdrop-blur-xl">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <rect x="3" y="6" width="18" height="14" rx="2" className="fill-white/10" />
                          <path d="M8 10v6" />
                          <path d="M16 10v6" />
                          <path d="M5 6V4a2 2 0 012-2h10a2 2 0 012 2v2" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1 text-xs">Effacement auto</h4>
                      <p className="text-[11px] text-indigo-800 dark:text-indigo-200/90">Tout est supprimé dès que vous quittez la page.</p>
                    </div>
                    {/* Carte 3 : Chiffrement local */}
                    <div className="group p-4 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-emerald-200/40 dark:border-emerald-700/30 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center min-h-[120px] backdrop-blur-xl">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="6" className="fill-white/10" />
                          <path d="M12 9v3l2 2" className="stroke-emerald-200 animate-pulse" />
                          <path d="M16 7.5a6 6 0 01-8 9" className="stroke-emerald-300/80" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1 text-xs">Chiffrement local</h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-200/90">Vos données sont protégées et inaccessibles à autrui.</p>
                    </div>
                  </div>
                  {/* Indicateurs visuels de sécurité */}
                  <div className="flex items-center justify-center gap-3 mb-2 animate-fadeIn" style={{ animationDelay: "0.5s" }}>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span className="text-xs text-blue-700 dark:text-blue-200 font-medium">Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.3s]"></span>
                      <span className="text-xs text-indigo-700 dark:text-indigo-200 font-medium">Chiffré</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.6s]"></span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-200 font-medium">Éphémère</span>
                    </div>
                  </div>
                  {/* Call-to-action clair glass premium */}
                  <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-blue-200/40 dark:border-blue-700/30 backdrop-blur-xl shadow-inner animate-fadeIn transition-all duration-300 hover:scale-105 hover:shadow-indigo-400/30 hover:ring-2 hover:ring-indigo-400/40 group cursor-pointer" style={{ animationDelay: '0.6s' }}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {/* Icône bouclier stylisé */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#shield-gradient2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 drop-shadow animate-popIn">
                        <defs>
                          <linearGradient id="shield-gradient2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="60%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a21caf" />
                          </linearGradient>
                        </defs>
                        <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" className="fill-white/10" />
                        <path d="M9.5 12.5l2 2 3-3" className="stroke-emerald-200 animate-pulse" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-900 dark:text-blue-100 tracking-wide flex items-center gap-2">
                        Commencez à discuter en toute sérénité
                        {/* Badge confidentiel animé glass */}
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/40 dark:bg-slate-900/40 border border-blue-200/30 dark:border-blue-700/30 text-blue-900 dark:text-blue-100 text-[10px] font-bold shadow-lg animate-bouncePrivé select-none">Confidentiel</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 dark:text-blue-200/90 mt-1 font-medium">
                      Ce mode garantit une confidentialité absolue : vos messages sont <span className="underline underline-offset-2 decoration-emerald-400">éphémères</span>, <span className="underline underline-offset-2 decoration-blue-400">jamais stockés</span> et <span className="underline underline-offset-2 decoration-slate-400">protégés localement</span>.<br />
                      <span className="text-indigo-700 dark:text-indigo-300 font-semibold">Profitez d’un espace de discussion privé, sécurisé et sans trace.</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-center px-2 mb-4">
                {/* Hero section améliorée */}
                <div className="relative mb-4 group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
                    <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  {/* Animated status indicator */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  {/* Floating particles */}
                  <div className="absolute -top-3 -left-3 w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.5s] opacity-70 shadow-lg"></div>
                  <div className="absolute -bottom-3 -right-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:1s] opacity-70 shadow-md"></div>
                  <div className="absolute top-1/2 -left-4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:1.5s] opacity-70 shadow-md"></div>
                  <div className="absolute -top-2 right-3 w-1 h-1 bg-pink-400 rounded-full animate-bounce [animation-delay:2s] opacity-60 shadow-sm"></div>
                  {/* Pulsating circles */}
                  <div className="absolute inset-0 rounded-full border border-blue-300 animate-ping opacity-30"></div>
                  <div className="absolute inset-0 rounded-full border border-purple-300 animate-ping opacity-20 [animation-delay:1s]"></div>
                </div>
                <div className="max-w-xl mx-auto">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
                    Bienvenue sur NeuroChat
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-xs sm:text-sm leading-relaxed mb-4">
                    Découvrez le futur de la conversation avec l'IA : reconnaissance vocale avancée, langage naturel et réponses intelligentes.
                  </p>
                  {/* Feature Cards */}
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
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Parlez naturellement et écoutez les réponses</p>
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
                      Écrivez un message ou cliquez sur le micro pour parler.
                    </p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <>
              {/* Chat Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between py-2 mb-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md px-3 mx-1 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {messages.filter(msg => !(msg as RagContextMessage).isRagContext).length} message{messages.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      Conversation active
                    </div>
                  </div>
                </div>
                {/* Info button for overall chat context/settings if needed */}
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </Button>
              </div>

              {/* Message Mapping */}
              {messages.map((message, index) => {
                if ((message as RagContextMessage).isRagContext && index === messages.length - 1) {
                  const rag = message as RagContextMessage;
                  const passagesToShow = showAllPassages[rag.id] ? rag.passages : rag.passages.slice(0, 3);
                  return (
                    <div key={rag.id} className="animate-fadeIn my-2 px-1">
                      <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 rounded-xl p-3 shadow-sm">
                        <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Passages de la base de connaissances
                        </div>
                        <ol className="list-decimal pl-4 space-y-2 text-sm">
                          {passagesToShow.map((p) => (
                            <li key={p.id} className="relative group">
                              <span className="font-bold text-blue-900 dark:text-blue-100">{p.titre} : </span>
                              <span className="text-blue-900 dark:text-blue-100 bg-blue-100/60 dark:bg-blue-800/40 rounded px-1 py-0.5 leading-tight">
                                {p.contenu.length > 150 && !showAllPassages[rag.id] ? p.contenu.slice(0, 150) + '…' : p.contenu}
                              </span>
                              {p.sourceUrl && (
                                <a
                                  href={p.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  title="Voir la source"
                                >
                                  <ExternalLink className="w-3 h-3 mr-0.5" /> Source
                                </a>
                              )}
                            </li>
                          ))}
                        </ol>
                        {rag.passages.length > 3 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:no-underline mt-3"
                            onClick={() => togglePassagesVisibility(rag.id)}
                          >
                            {showAllPassages[rag.id] ? 'Réduire les passages' : `Afficher les ${rag.passages.length} passages`}
                            <ArrowDown className={cn("ml-1 h-3 w-3 transition-transform duration-300", showAllPassages[rag.id] && "rotate-180")} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                } else if (!(message as RagContextMessage).isRagContext) {
                  const msg = message as Message;
                  return (
                    <div key={msg.id} className="flex items-center gap-2">
                      {selectMode && (
                        <input
                          type="checkbox"
                          checked={selectedMessageIds.includes(msg.id)}
                          onChange={() => onSelectMessage && onSelectMessage(msg.id)}
                          className="accent-blue-600 w-4 h-4 mt-2"
                          title="Sélectionner ce message"
                        />
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
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn ml-2 sm:ml-3 mb-6"> {/* Adjusted margin for alignment */}
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn hover:scale-110 group z-20"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4 group-hover:animate-bounce" />
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}