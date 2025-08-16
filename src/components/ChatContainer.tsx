import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { 
  ArrowDown, Zap, Brain, Clock, Info, ExternalLink, Shield, X, Smile, BookOpen, 
  Sparkles, Activity, MessageSquare, Bot, User, ChevronUp, ChevronDown,
  Layers, Database, Globe, Eye
} from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  memoryFactsCount?: number;
  sources?: Array<{ title: string; url: string }>;
}

interface RagContextPassage {
  id: number;
  titre: string;
  contenu: string;
  sourceUrl?: string;
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
  onEditMessage?: (id: string, newText: string) => void;
  onDeleteMessage?: (id: string) => void;
  onReplyToMessage?: (messageContent: string) => void;
  selectMode?: boolean;
  selectedMessageIds?: string[];
  onSelectMessage?: (id: string) => void;
  modePrive?: boolean;
  modeEnfant?: boolean;
}

// Hook personnalisé pour la gestion du scroll intelligent
const useSmartScroll = (messages: ChatMessage[], isLoading: boolean) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleAtBottomChange = useCallback((atBottom: boolean) => {
    setIsNearBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 0);
  }, [messages.length]);

  const handleRangeChange = useCallback((range: any) => {
    if (messages.length > 0) {
      const progress = ((range.endIndex + 1) / messages.length) * 100;
      setScrollProgress(Math.min(progress, 100));
    }
  }, [messages.length]);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({ 
      index: messages.length + (isLoading ? 1 : 0), 
      behavior: 'smooth' 
    });
  }, [messages.length, isLoading]);

  const scrollToTop = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({ index: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isNearBottom, scrollToBottom]);

  return {
    virtuosoRef,
    showScrollButton,
    scrollProgress,
    handleAtBottomChange,
    handleRangeChange,
    scrollToBottom,
    scrollToTop
  };
};

// Composant amélioré pour les statistiques de conversation
const ConversationStats = ({ messages }: { messages: ChatMessage[] }) => {
  const userMessages = messages.filter(msg => !(msg as RagContextMessage).isRagContext && (msg as Message).isUser);
  const aiMessages = messages.filter(msg => !(msg as RagContextMessage).isRagContext && !(msg as Message).isUser);
  const ragContexts = messages.filter(msg => (msg as RagContextMessage).isRagContext);

  const stats = [
    {
      icon: User,
      label: 'Vos messages',
      value: userMessages.length,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50/80 dark:bg-blue-950/40'
    },
    {
      icon: Bot,
      label: 'Réponses IA',
      value: aiMessages.length,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50/80 dark:bg-purple-950/40'
    },
    {
      icon: Database,
      label: 'Contextes RAG',
      value: ragContexts.length,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className={`${stat.bgColor} p-4 rounded-xl border border-white/60 dark:border-slate-700/60 backdrop-blur-sm hover:scale-105 transition-all duration-300 group animate-in slide-in-from-bottom-4`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform duration-300`}>
            <stat.icon className="w-4 h-4 text-white" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {stat.value}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant Hero amélioré avec animations et interactivité
const HeroSection = ({ modeEnfant, modePrive }: { modeEnfant: boolean; modePrive: boolean }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    if (!modeEnfant && !modePrive) {
      const interval = setInterval(() => {
        setCurrentFeature(prev => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [modeEnfant, modePrive]);

  if (modeEnfant) {
    const features = [
      { 
        icon: Smile, 
        title: 'Amusant', 
        desc: 'Jeux, histoires et activités créatives', 
        color: 'from-pink-500 to-rose-500',
        emoji: '🎮'
      },
      { 
        icon: BookOpen, 
        title: 'Éducatif', 
        desc: 'Apprentissage adapté à votre âge', 
        color: 'from-violet-500 to-indigo-500',
        emoji: '📚'
      },
      { 
        icon: Shield, 
        title: 'Sécurisé', 
        desc: 'Environnement protégé et bienveillant', 
        color: 'from-emerald-500 to-teal-500',
        emoji: '🛡️'
      }
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Titre avec animation rainbow */}
          <div className="space-y-4">
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight animate-pulse">
                🌈 Espace Enfants 🌈
              </h2>
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Un endroit <span className="font-bold text-pink-600 dark:text-pink-400 animate-pulse">magique</span> pour 
              apprendre, jouer et découvrir ensemble !
            </p>
          </div>

          {/* Features avec animations staggered */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={feature.title}
                className="group p-6 bg-white/90 dark:bg-slate-800/90 rounded-3xl border-2 border-white/80 dark:border-slate-700/80 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-500 animate-in slide-in-from-bottom-4 cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-3 animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>
                    {feature.emoji}
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-[360deg] transition-transform duration-700`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to action amusant */}
          <div className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '600ms' }}>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-2xl border-2 border-yellow-200/60 dark:border-yellow-800/60">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                👋 <strong>Salut !</strong> Je suis ton assistant virtuel. 
                Raconte-moi ce que tu aimerais faire aujourd'hui !
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modePrive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 relative overflow-hidden">
        {/* Effets de fond animés */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-purple-900/10 to-blue-900/10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }} />
        
        <div className="max-w-lg mx-auto space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 blur-lg opacity-30 animate-pulse" />
              <h2 className="relative text-3xl sm:text-4xl font-black bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                🔒 Session Ultra-Privée
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Maximum de <span className="font-bold text-emerald-600 dark:text-emerald-400">confidentialité</span> 
              {' '}• Zéro <span className="font-bold text-blue-600 dark:text-blue-400">traçage</span> 
              {' '}• Auto-<span className="font-bold text-purple-600 dark:text-purple-400">destruction</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { 
                icon: Shield, 
                title: "Chiffrement", 
                desc: "Protection militaire", 
                color: "from-red-500 to-red-600",
                detail: "AES-256"
              },
              { 
                icon: Zap, 
                title: "Éphémère", 
                desc: "Suppression immédiate", 
                color: "from-purple-500 to-purple-600",
                detail: "Auto-delete"
              },
              { 
                icon: Eye, 
                title: "Invisible", 
                desc: "Aucune trace", 
                color: "from-blue-500 to-blue-600",
                detail: "Ghost mode"
              }
            ].map((feature, idx) => (
              <div 
                key={feature.title}
                className="group p-6 bg-white/10 dark:bg-slate-800/20 rounded-2xl border border-white/20 dark:border-slate-700/20 backdrop-blur-xl shadow-2xl hover:shadow-red-500/20 hover:scale-110 transition-all duration-500 animate-in slide-in-from-bottom-4 relative overflow-hidden"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:from-white/10 transition-all duration-500" />
                
                <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:rotate-12 transition-transform duration-300 relative z-10`}>
                  <feature.icon className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{feature.desc}</p>
                <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1 rounded">
                  {feature.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Indicateur de sécurité en temps réel */}
          <div className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms' }}>
            <div className="p-4 bg-gradient-to-r from-red-50/80 via-purple-50/80 to-blue-50/80 dark:from-red-950/20 dark:via-purple-950/20 dark:to-blue-950/20 rounded-xl border border-red-200/30 dark:border-red-800/30">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Sécurité active • Session chiffrée • Aucun log
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode normal avec features rotatives
  const normalFeatures = [
    {
      icon: Brain,
      title: "IA Avancée",
      desc: "Compréhension contextuelle et mémoire intelligente",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Globe,
      title: "Recherche Web",
      desc: "Informations en temps réel depuis internet",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "RAG Premium",
      desc: "Recherche dans vos documents personnels",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[400px] text-center px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-3xl mx-auto pt-40 space-y-10 relative z-10">
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 blur-2xl opacity-20 animate-pulse" />
            <h1 className="relative text-4xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-4">
              NeuroChat
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            L'IA conversationnelle <span className="font-bold text-indigo-600 dark:text-indigo-400">nouvelle génération</span> avec 
            support vocal, visuel et recherche documentaire <span className="font-bold text-purple-600 dark:text-purple-400">avancée</span>
          </p>
        </div>
        
        {/* Feature rotatif avec indicateur */}
        <div className="relative">
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              {normalFeatures.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentFeature ? 'bg-blue-500 w-6' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="h-32 flex items-center justify-center">
            <div 
              key={currentFeature}
              className="animate-in slide-in-from-bottom-4 fade-in-0 duration-500 text-center max-w-md"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${normalFeatures[currentFeature].color} rounded-2xl flex items-center justify-center mb-4 mx-auto hover:rotate-12 transition-transform duration-300`}>
                {React.createElement(normalFeatures[currentFeature].icon, { className: "w-8 h-8 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {normalFeatures[currentFeature].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {normalFeatures[currentFeature].desc}
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '800ms' }}>
          <div className="p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
              <strong>Prêt à commencer ?</strong> 🚀
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Posez votre première question ou téléchargez un document pour débuter !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal amélioré
export function ChatContainer({ 
  messages, 
  isLoading, 
  onEditMessage, 
  onDeleteMessage, 
  onReplyToMessage, 
  selectMode = false, 
  selectedMessageIds = [], 
  onSelectMessage, 
  modePrive = false, 
  modeEnfant = false 
}: ChatContainerProps) {
  // Éviter les warnings pour les paramètres non utilisés dans cette version
  void selectedMessageIds;
  void onSelectMessage;
  const {
    virtuosoRef,
    showScrollButton,
    scrollProgress,
    handleAtBottomChange,
    handleRangeChange,
    scrollToBottom,
    scrollToTop
  } = useSmartScroll(messages, isLoading);

  const [showAllPassages, setShowAllPassages] = useState<{ [id: string]: boolean }>({});
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [ragFilter, setRagFilter] = useState<'all' | 'messages' | 'rag'>('all');

  const togglePassagesVisibility = useCallback((id: string) => {
    setShowAllPassages(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleShowChatInfo = useCallback(() => setShowChatInfo(true), []);
  const handleCloseChatInfo = useCallback(() => setShowChatInfo(false), []);

  // Filtrer les messages selon le filtre RAG
  const filteredMessages = messages.filter(msg => {
    if (ragFilter === 'all') return true;
    if (ragFilter === 'rag') return (msg as RagContextMessage).isRagContext;
    return !(msg as RagContextMessage).isRagContext;
  });

  return (
    <div
      className={cn(
        "flex-1 relative transition-all duration-500",
        modePrive 
          ? "bg-gradient-to-br from-red-50/30 via-purple-50/40 to-blue-50/30 dark:from-red-950/20 dark:via-purple-950/30 dark:to-blue-950/20 ring-2 ring-red-400/20 shadow-2xl shadow-red-400/10" 
          : modeEnfant
          ? "bg-gradient-to-br from-pink-50/40 via-yellow-50/50 to-orange-50/40 dark:from-pink-950/20 dark:via-yellow-950/30 dark:to-orange-950/20"
          : "bg-gradient-to-br from-slate-50/60 via-white/80 to-blue-50/40 dark:from-slate-900/60 dark:via-slate-900/80 dark:to-slate-800/40",
        "backdrop-blur-xl"
      )}
      style={{ minHeight: '0', height: '100%', maxHeight: '100vh' }}
    >
      <div className="flex-1 h-full p-2 sm:p-4 pb-24">
        <div className="space-y-3 sm:space-y-4 min-h-[calc(60vh)] sm:min-h-0">
          {messages.length === 0 ? (
            <HeroSection modeEnfant={modeEnfant} modePrive={modePrive} />
          ) : (
            <>
              <Virtuoso
                ref={virtuosoRef}
                style={{ height: 'calc(100vh - 160px)' }}
                atBottomStateChange={handleAtBottomChange}
                rangeChanged={handleRangeChange}
                atBottomThreshold={200}
                followOutput="smooth"
                totalCount={filteredMessages.length + (isLoading ? 1 : 0)}
                components={{
                  Header: () => (
                    <div className="sticky top-0 z-20 mb-4 animate-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {messages.filter(msg => !(msg as RagContextMessage).isRagContext).length} message{messages.length !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Conversation active
                              </div>
                            </div>
                          </div>

                          {/* Barre de progression du scroll */}
                          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-32">
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                style={{ width: `${scrollProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 min-w-fit">
                              {Math.round(scrollProgress)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Filtre RAG */}
                          {messages.some(msg => (msg as RagContextMessage).isRagContext) && (
                            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              {[
                                { key: 'all', icon: Layers, tooltip: 'Tout' },
                                { key: 'messages', icon: MessageSquare, tooltip: 'Messages' },
                                { key: 'rag', icon: Database, tooltip: 'RAG' }
                              ].map(filter => (
                                <button
                                  key={filter.key}
                                  onClick={() => setRagFilter(filter.key as any)}
                                  className={cn(
                                    "p-1.5 rounded transition-all duration-200",
                                    ragFilter === filter.key
                                      ? "bg-blue-500 text-white shadow-sm"
                                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                  )}
                                  title={filter.tooltip}
                                >
                                  <filter.icon className="w-3.5 h-3.5" />
                                </button>
                              ))}
                            </div>
                          )}

                          <Button 
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-800"
                            onClick={handleShowChatInfo}
                            title="Informations de conversation"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }}
                itemContent={(index) => {
                  if (index >= filteredMessages.length) {
                    return <TypingIndicator />;
                  }
                  
                  const msg = filteredMessages[index];
                  
                  if ((msg as RagContextMessage).isRagContext) {
                    const ragMsg = msg as RagContextMessage;
                    const isExpanded = showAllPassages[ragMsg.id] || false;
                    const visiblePassages = isExpanded ? ragMsg.passages : ragMsg.passages.slice(0, 2);
                    
                    return (
                      <div className="mb-4 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 backdrop-blur-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <Database className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                Contexte RAG
                              </h3>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                {ragMsg.passages.length} document{ragMsg.passages.length > 1 ? 's' : ''} trouvé{ragMsg.passages.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {visiblePassages.map((passage, idx) => (
                              <div key={idx} className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                <div className="flex items-start gap-2">
                                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                      {passage.titre}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                                      {passage.contenu.slice(0, 150)}...
                                    </p>
                                  </div>
                                  {passage.sourceUrl && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-emerald-600 hover:text-emerald-700"
                                      onClick={() => window.open(passage.sourceUrl, '_blank')}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {ragMsg.passages.length > 2 && (
                            <div className="mt-3 flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePassagesVisibility(ragMsg.id)}
                                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Voir moins
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    Voir {ragMsg.passages.length - 2} de plus
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  const messageData = msg as Message;
                  return (
                    <div className={cn(
                      "animate-in slide-in-from-bottom-2 duration-300",
                      selectMode && "hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors"
                    )} style={{ animationDelay: `${index * 50}ms` }}>
                      <MessageBubble
                        key={messageData.id}
                        message={messageData.text}
                        isUser={messageData.isUser}
                        timestamp={messageData.timestamp}
                        imageUrl={messageData.imageUrl}
                        memoryFactsCount={messageData.memoryFactsCount}
                        sources={messageData.sources}
                        onEdit={onEditMessage ? (newText: string) => onEditMessage(messageData.id, newText) : undefined}
                        onDelete={onDeleteMessage ? () => onDeleteMessage(messageData.id) : undefined}
                        onReply={onReplyToMessage}
                      />
                    </div>
                  );
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Boutons de navigation flottants */}
      {showScrollButton && (
        <div className="fixed bottom-32 right-6 z-50 flex flex-col gap-2 animate-in slide-in-from-right-2 duration-300">
          <Button
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            title="Aller au début"
          >
            <ChevronUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
          <Button
            onClick={scrollToBottom}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            title="Aller à la fin"
          >
            <ArrowDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      )}

      {/* Modal d'informations de conversation */}
      {showChatInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Informations
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseChatInfo}
                className="h-8 w-8 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <ConversationStats messages={messages} />
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Activité récente
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {messages.length > 0 ? (
                    <>
                      <div>Dernier message: {messages[messages.length - 1]?.timestamp.toLocaleTimeString()}</div>
                      <div>Durée de la conversation: {Math.round((Date.now() - messages[0]?.timestamp.getTime()) / 60000)} min</div>
                    </>
                  ) : (
                    <div>Aucune activité</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}