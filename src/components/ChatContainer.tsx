// Composant principal amélioré avec design ultra-moderne
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
  const [headerHovered, setHeaderHovered] = useState(false);

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
        "flex-1 relative transition-all duration-700 group",
        modePrive 
          ? "bg-gradient-to-br from-red-50/40 via-purple-50/50 to-blue-50/40 dark:from-red-950/30 dark:via-purple-950/40 dark:to-blue-950/30" 
          : modeEnfant
          ? "bg-gradient-to-br from-pink-50/50 via-yellow-50/60 to-orange-50/50 dark:from-pink-950/30 dark:via-yellow-950/40 dark:to-orange-950/30"
          : "bg-gradient-to-br from-slate-50/70 via-white/90 to-blue-50/50 dark:from-slate-900/70 dark:via-slate-900/90 dark:to-slate-800/50",
        "backdrop-blur-2xl"
      )}
      style={{ minHeight: '0', height: '100%', maxHeight: '100vh' }}
    >
      {/* Effets de particules globaux */}
      <FloatingParticles 
        count={modePrive ? 8 : modeEnfant ? 12 : 6} 
        mode={modePrive ? 'prive' : modeEnfant ? 'enfant' : 'normal'} 
      />
      
      <div className="flex-1 h-full p-3 sm:p-6 pb-28">
        <div className="space-y-4 sm:space-y-6 min-h-[calc(60vh)] sm:min-h-0">
          {messages.length === 0 ? (
            <HeroSection modeEnfant={modeEnfant} modePrive={modePrive} />
          ) : (
            <>
              <Virtuoso
                ref={virtuosoRef}
                style={{ height: 'calc(100vh - 180px)' }}
                atBottomStateChange={handleAtBottomChange}
                rangeChanged={handleRangeChange}
                atBottomThreshold={200}
                followOutput="smooth"
                totalCount={filteredMessages.length + (isLoading ? 1 : 0)}
                components={{
                  Header: () => (
                    <div className="sticky top-0 z-30 mb-6 animate-in slide-in-from-top-2 duration-700">
                      <div 
                        className={cn(
                          "flex items-center justify-between p-6 rounded-3xl border backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden",
                          modePrive 
                            ? "bg-gradient-to-r from-red-50/90 via-purple-50/90 to-blue-50/90 dark:from-red-950/60 dark:via-purple-950/60 dark:to-blue-950/60 border-red-200/50 dark:border-red-800/50"
                            : modeEnfant
                            ? "bg-gradient-to-r from-pink-50/90 via-yellow-50/90 to-orange-50/90 dark:from-pink-950/60 dark:via-yellow-950/60 dark:to-orange-950/60 border-pink-200/50 dark:border-pink-800/50"
                            : "bg-white/95 dark:bg-slate-900/95 border-white/60 dark:border-slate-800/60"
                        )}
                        onMouseEnter={() => setHeaderHovered(true)}
                        onMouseLeave={() => setHeaderHovered(false)}
                      >
                        {/* Effet de brillance au hover */}
                        <div className={cn(
                          "absolute inset-0 transition-opacity duration-500",
                          headerHovered ? "opacity-100" : "opacity-0",
                          modePrive 
                            ? "bg-gradient-to-r from-red-400/10 via-purple-400/10 to-blue-400/10"
                            : modeEnfant
                            ? "bg-gradient-to-r from-pink-400/10 via-yellow-400/10 to-orange-400/10"
                            : "bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10"
                        )} />
                        
                        <div className="flex items-center gap-6 min-w-0 flex-1 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={cn(
                                "w-4 h-4 rounded-full animate-pulse shadow-lg",
                                modePrive ? "bg-red-500 shadow-red-500/50" : 
                                modeEnfant ? "bg-pink-500 shadow-pink-500/50" : 
                                "bg-emerald-500 shadow-emerald-500/50"
                              )} />
                              <div className={cn(
                                "absolute inset-0 rounded-full animate-ping opacity-40",
                                modePrive ? "bg-red-500" : 
                                modeEnfant ? "bg-pink-500" : 
                                "bg-emerald-500"
                              )} />
                            </div>
                            <div>
                              <div className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                {messages.filter(msg => !(msg as RagContextMessage).isRagContext).length} message{messages.length !== 1 ? 's' : ''}
                                {modePrive && <Shield className="w-4 h-4 text-red-500" />}
                                {modeEnfant && <Heart className="w-4 h-4 text-pink-500" />}
                              </div>
                              <div className={cn(
                                "text-xs font-medium flex items-center gap-2",
                                modePrive ? "text-red-600 dark:text-red-400" :
                                modeEnfant ? "text-pink-600 dark:text-pink-400" :
                                "text-emerald-600 dark:text-emerald-400"
                              )}>
                                <Activity className="w-4 h-4" />
                                {modePrive ? "Session Ultra-Sécurisée" : 
                                 modeEnfant ? "Mode Enfant Actif" : 
                                 "Conversation Active"}
                              </div>
                            </div>
                          </div>

                          {/* Barre de progression du scroll ultra-stylée */}
                          <div className="hidden md:flex items-center gap-3 flex-1 max-w-40">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-300 shadow-sm",
                                  modePrive 
                                    ? "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500"
                                    : modeEnfant
                                    ? "bg-gradient-to-r from-pink-500 via-yellow-500 to-orange-500"
                                    : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                                )}
                                style={{ width: `${scrollProgress}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 min-w-fit px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                              {Math.round(scrollProgress)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 relative z-10">
                          {/* Filtre RAG ultra-amélioré */}
                          {messages.some(msg => (msg as RagContextMessage).isRagContext) && (
                            <div className="hidden sm:flex items-center gap-1 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl shadow-inner backdrop-blur-sm">
                              {[
                                { key: 'all', icon: Layers, tooltip: 'Tout', color: 'text-slate-500' },
                                { key: 'messages', icon: MessageSquare, tooltip: 'Messages', color: 'text-blue-500' },
                                { key: 'rag', icon: Database, tooltip: 'RAG', color: 'text-emerald-500' }
                              ].map(filter => (
                                <button
                                  key={filter.key}
                                  onClick={() => setRagFilter(filter.key as 'all' | 'messages' | 'rag')}
                                  className={cn(
                                    "p-2 rounded-lg transition-all duration-300 relative group",
                                    ragFilter === filter.key
                                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                                  )}
                                  title={filter.tooltip}
                                >
                                  <filter.icon className="w-4 h-4" />
                                  {ragFilter === filter.key && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg animate-pulse" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          <Button 
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-10 w-10 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm group",
                              modePrive 
                                ? "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                : modeEnfant
                                ? "hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-600"
                                : "hover:bg-blue-100 dark:hover:bg-slate-800 text-blue-600"
                            )}
                            onClick={handleShowChatInfo}
                            title="Informations de conversation"
                          >
                            <Info className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }}
                itemContent={(index) => {
                  if (index >= filteredMessages.length) {
                    return (
                      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <TypingIndicator />
                      </div>
                    );
                  }
                  
                  const msg = filteredMessages[index];
                  
                  if ((msg as RagContextMessage).isRagContext) {
                    const ragMsg = msg as RagContextMessage;
                    const isExpanded = showAllPassages[ragMsg.id] || false;
                    const visiblePassages = isExpanded ? ragMsg.passages : ragMsg.passages.slice(0, 2);
                    
                    return (
                      <div className="mb-6 animate-in slide-in-from-left-2 duration-500 group" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="p-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-cyan-50/90 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-cyan-950/50 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/60 backdrop-blur-xl shadow-xl hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                          {/* Effet de brillance */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                <Database className="w-6 h-6 text-white drop-shadow-sm" />
                              </div>
                              <div>
                                <h3 className="text-base font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                  Contexte RAG Premium
                                  <Sparkles className="w-4 h-4 text-yellow-500 animate-spin" />
                                </h3>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  {ragMsg.passages.length} document{ragMsg.passages.length > 1 ? 's' : ''} trouvé{ragMsg.passages.length > 1 ? 's' : ''} • 
                                  <span className="ml-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 rounded-full text-xs">
                                    Pertinence élevée
                                  </span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {visiblePassages.map((passage, idx) => (
                                <div key={idx} className="group/item p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-emerald-100/80 dark:border-emerald-800/50 backdrop-blur-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                                  
                                  <div className="flex items-start gap-3 relative z-10">
                                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-sm group-hover/item:rotate-12 transition-transform duration-300">
                                      <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mb-2 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-300 transition-colors">
                                        {passage.titre}
                                      </h4>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed">
                                        {passage.contenu.slice(0, 200)}...
                                      </p>
                                      <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        📄 Document source • {passage.contenu.length} caractères
                                      </div>
                                    </div>
                                    {passage.sourceUrl && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl group-hover/item:scale-110 transition-all duration-300"
                                        onClick={() => window.open(passage.sourceUrl, '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {ragMsg.passages.length > 2 && (
                              <div className="mt-4 flex justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePassagesVisibility(ragMsg.id)}
                                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl px-6 py-3 font-semibold shadow-sm hover:shadow-md transition-all duration-300 group/button"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-5 h-5 mr-2 group-hover/button:animate-bounce" />
                                      Voir moins
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-5 h-5 mr-2 group-hover/button:animate-bounce" />
                                      Voir {ragMsg.passages.length - 2} document{ragMsg.passages.length - 2 > 1 ? 's' : ''} de plus
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  const messageData = msg as Message;
                  return (
                    <div 
                      className={cn(
                        "animate-in slide-in-from-bottom-3 fade-in-0 duration-500 group/message",
                        selectMode && "hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-2xl p-3 -m-3 transition-all duration-300"
                      )} 
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <MessageBubble
                        key={messageData.id}
                        message={messageData.text}
                        isUser={messageData.isUser}
                        timestamp={messageData.timestamp}
                        imageUrl={messageData.imageUrl}
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

      {/* Boutons de navigation flottants ultra-stylés */}
      {showScrollButton && (
        <div className="fixed bottom-36 right-8 z-50 flex flex-col gap-3 animate-in slide-in-from-right-3 duration-500">
          <Button
            onClick={scrollToTop}
            className={cn(
              "h-14 w-14 rounded-2xl text-white shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden backdrop-blur-sm",
              modePrive 
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                : modeEnfant
                ? "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
            )}
            title="Aller au début"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ChevronUp className="w-6 h-6 group-hover:scale-125 group-hover:-translate-y-1 transition-all duration-300 relative z-10" />
          </Button>
          <Button
            onClick={scrollToBottom}
            className={cn(
              "h-14 w-14 rounded-2xl text-white shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden backdrop-blur-sm",
              modePrive 
                ? "bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800"
                : modeEnfant
                ? "bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-700 hover:to-orange-800"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            )}
            title="Aller à la fin"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ArrowDown className="w-6 h-6 group-hover:scale-125 group-hover:translate-y-1 transition-all duration-300 relative z-10" />
          </Button>
        </div>
      )}

      {/* Modal d'informations ultra-améliorée */}
      {showChatInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300 backdrop-blur-sm">
          <div 
            className={cn(
              "rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-3xl border backdrop-blur-2xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-500 relative overflow-hidden",
              modePrive 
                ? "bg-gradient-to-br from-red-50/95 via-purple-50/95 to-blue-50/95 dark:from-red-950/90 dark:via-purple-950/90 dark:to-blue-950/90 border-red-200/50 dark:border-red-800/50"
                : modeEnfant
                ? "bg-gradient-to-br from-pink-50/95 via-yellow-50/95 to-orange-50/95 dark:from-pink-950/90 dark:via-yellow-950/90 dark:to-orange-950/90 border-pink-200/50 dark:border-pink-800/50"
                : "bg-white/95 dark:bg-slate-900/95 border-white/60 dark:border-slate-800/60"
            )}
          >
            {/* Effet de brillance */}
            <div className={cn(
              "absolute inset-0 opacity-30",
              modePrive 
                ? "bg-gradient-to-br from-red-400/10 via-purple-400/10 to-blue-400/10"
                : modeEnfant
                ? "bg-gradient-to-br from-pink-400/10 via-yellow-400/10 to-orange-400/10"
                : "bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10"
            )} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg",
                    modePrive 
                      ? "bg-gradient-to-r from-red-500 to-purple-500"
                      : modeEnfant
                      ? "bg-gradient-to-r from-pink-500 to-orange-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  )}>
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  Informations
                  {modePrive && <Shield className="w-5 h-5 text-red-500" />}
                  {modeEnfant && <Heart className="w-5 h-5 text-pink-500" />}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseChatInfo}
                  className="h-10 w-10 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all duration-300"
                >
                  <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              </div>
              
              <div className="space-y-8">
                <ConversationStats messages={messages} />
                
                <div className={cn(
                  "p-6 rounded-2xl border backdrop-blur-sm",
                  modePrive 
                    ? "bg-red-50/80 dark:bg-red-950/40 border-red-200/50 dark:border-red-800/50"
                    : modeEnfant
                    ? "bg-pink-50/80 dark:bg-pink-950/40 border-pink-200/50 dark:border-pink-800/50"
                    : "bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50"
                )}>
                  <h4 className="font-black text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      modePrive 
                        ? "bg-gradient-to-r from-red-500 to-purple-500"
                        : modeEnfant
                        ? "bg-gradient-to-r from-pink-500 to-orange-500"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500"
                    )}>
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    Activité récente
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3">
                    {messages.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl">
                          <span>Dernier message:</span>
                          <span className="font-medium">{messages[messages.length - 1]?.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl">
                          <span>Durée conversation:</span>
                          <span className="font-medium">{Math.round((Date.now() - messages[0]?.timestamp.getTime()) / 60000)} min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl">
                          <span>Mode actuel:</span>
                          <span className={cn(
                            "font-medium px-2 py-1 rounded-full text-xs",
                            modePrive 
                              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                              : modeEnfant
                              ? "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          )}>
                            {modePrive ? "🔒 Ultra-Privé" : modeEnfant ? "👶 Enfant" : "💼 Enterprise"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        Aucune activité pour le moment
                      </div>
                    )}
                  </div>
                </div>

                {/* Section bonus selon le mode */}
                {modePrive && (
                  <div className="p-6 bg-gradient-to-r from-red-50/80 to-purple-50/80 dark:from-red-950/40 dark:to-purple-950/40 rounded-2xl border border-red-200/50 dark:border-red-800/50">
                    <h4 className="font-black text-base text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Protection Gouvernementale AES-256
                    </h4>
                    <div className="space-y-2 text-xs text-red-600 dark:text-red-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Chiffrement AES-256-GCM niveau militaire
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        PBKDF2 600,000 itérations (résistant force brute)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Authentification AEAD intégrée
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Gestion sécurisée des clés en mémoire
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Auto-destruction à la fermeture
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Zéro persistance sur disque
                      </div>
                    </div>
                  </div>
                )}

                {modeEnfant && (
                  <div className="p-6 bg-gradient-to-r from-pink-50/80 to-orange-50/80 dark:from-pink-950/40 dark:to-orange-950/40 rounded-2xl border border-pink-200/50 dark:border-pink-800/50">
                    <h4 className="font-black text-base text-pink-800 dark:text-pink-200 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Zone Sécurisée
                    </h4>
                    <div className="space-y-2 text-xs text-pink-600 dark:text-pink-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Contenu adapté à l'âge
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Surveillance parentale active
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Environnement 100% sûr
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { 
  ArrowDown, Zap, Brain, Clock, Info, ExternalLink, Shield, X, BookOpen, 
  Sparkles, Activity, MessageSquare, Bot, User, ChevronUp, ChevronDown,
  Layers, Database, Eye, Heart,
  Crown, Diamond, Flame
} from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  // memoryFactsCount supprimé - système de mémoire retiré
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

  const handleRangeChange = useCallback((range: { endIndex: number }) => {
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

// Composant de particules flottantes
const FloatingParticles = ({ count = 15, mode }: { count?: number; mode?: string }) => {
  const particles = Array.from({ length: count }, (_, i) => {
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 10;
    const duration = Math.random() * 8 + 12;
    
    let color = 'bg-blue-400/20';
    if (mode === 'enfant') color = 'bg-pink-400/30';
    if (mode === 'prive') color = 'bg-red-400/20';
    
    return { size, left, animationDelay, duration, color, id: i };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${particle.color} animate-pulse opacity-60`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.animationDelay}s`,
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            50% { transform: translateY(-50vh) rotate(180deg); }
          }
        `
      }} />
    </div>
  );
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
      color: 'from-violet-500 via-purple-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-violet-50/80 to-purple-50/80 dark:from-violet-950/40 dark:to-purple-950/40',
      sparkles: true
    },
    {
      icon: Bot,
      label: 'Réponses IA',
      value: aiMessages.length,
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40',
      sparkles: true
    },
    {
      icon: Database,
      label: 'Contextes RAG',
      value: ragContexts.length,
      color: 'from-orange-500 via-red-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-pink-50/80 dark:from-orange-950/40 dark:to-pink-950/40',
      sparkles: true
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className={`${stat.bgColor} p-5 rounded-2xl border border-white/80 dark:border-slate-700/60 backdrop-blur-md hover:scale-105 hover:rotate-1 transition-all duration-500 group relative overflow-hidden shadow-lg hover:shadow-2xl`}
          style={{ animationDelay: `${index * 150}ms` }}
        >
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Sparkles animées */}
          {stat.sparkles && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-3 h-3 text-yellow-400 animate-spin" />
            </div>
          )}
          
          <div className="relative z-10">
            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
              <stat.icon className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant Hero ultra-amélioré
const HeroSection = ({ modeEnfant, modePrive }: { modeEnfant: boolean; modePrive: boolean }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (modeEnfant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden">
        <FloatingParticles count={20} mode="enfant" />
        
        {/* Effets de fond dynamiques - style plus mature */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          {/* Titre avec style plus mature et sophistiqué */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 via-emerald-600 via-teal-600 via-orange-600 to-red-600 blur-2xl opacity-20 animate-pulse" />
              <h2 className="relative text-3xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 via-emerald-600 via-teal-600 via-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-4">
                🚀 Espace Enfant 🚀
                <div className="animate-pulse">
                  <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500" />
                </div>
              </h2>
              <div className="absolute -top-4 -right-4 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🎯</div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
              Bienvenue dans ton <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse">espace personnel</span> où 
              l'apprentissage devient une <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">expérience immersive</span> !
            </p>
          </div>

          
        </div>
      </div>
    );
  }

  if (modePrive) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x / window.innerWidth * 100}% ${mousePosition.y / window.innerHeight * 100}%, rgba(220, 38, 127, 0.1), transparent 50%)`
        }}
      >
        <FloatingParticles count={25} mode="prive" />
        
        {/* Effets de fond ultra-dynamiques */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 via-pink-600 to-blue-600 blur-3xl opacity-40 animate-pulse" />
              <h2 className="relative text-3xl sm:text-5xl font-black bg-gradient-to-r from-red-600 via-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-6">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 animate-pulse" />
                Session Ultra-Privée
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 animate-pulse" />
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl leading-relaxed max-w-4xl mx-auto">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600">Maximum Sécurité</span> 
              {' '}• <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Zero Traçage</span> 
              {' '}• <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">Auto-Destruction</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Shield, 
                title: "Protection Gouvernementale", 
                desc: "AES-256-GCM + PBKDF2 600k itérations + AEAD", 
                color: "from-red-500 via-red-600 to-red-700",
                detail: "🔐 MIL-GRADE",
                bgGradient: "from-red-500/20 to-red-600/20"
              },
              { 
                icon: Zap, 
                title: "Suppression Immédiate", 
                desc: "Auto-destruction en temps réel des données", 
                color: "from-purple-500 via-purple-600 to-purple-700",
                detail: "⚡ Instant Delete",
                bgGradient: "from-purple-500/20 to-purple-600/20"
              },
              { 
                icon: Eye, 
                title: "Mode Fantôme", 
                desc: "Invisibilité totale - aucune trace laissée", 
                color: "from-blue-500 via-blue-600 to-blue-700",
                detail: "👻 Ghost Mode",
                bgGradient: "from-blue-500/20 to-blue-600/20"
              }
            ].map((feature, idx) => (
              <div 
                key={feature.title}
                className="group relative"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-110`} />
                
                <div className="relative p-8 bg-white/10 dark:bg-slate-800/20 rounded-2xl border border-white/20 dark:border-slate-700/20 backdrop-blur-2xl shadow-2xl hover:shadow-red-500/20 hover:scale-110 hover:rotate-2 transition-all duration-700 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 group-hover:from-white/15 transition-all duration-500" />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 shadow-2xl`}>
                      <feature.icon className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="font-black text-base text-slate-800 dark:text-slate-200 mb-3">{feature.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{feature.desc}</p>
                    <div className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-100/50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border">
                      {feature.detail}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Diamond className="w-5 h-5 text-yellow-400 animate-spin" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicateur de sécurité en temps réel ultra-stylé */}
          <div className="animate-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: '700ms' }}>
            <div className="relative p-8 bg-gradient-to-r from-red-50/20 via-purple-50/20 via-pink-50/20 to-blue-50/20 dark:from-red-950/30 dark:via-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 rounded-2xl border border-red-200/30 dark:border-red-800/30 backdrop-blur-md shadow-2xl hover:shadow-4xl group transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-purple-400/10 to-blue-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="w-1 h-1 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                  Sécurité Ultra-Active
                  <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
                </span>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-800/20 px-3 py-1 rounded-full">
                  SESSION_ENCRYPTED_🔐
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode normal simplifié

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden">
      <FloatingParticles count={15} mode="normal" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 via-indigo-600 to-cyan-600 blur-2xl opacity-20 animate-pulse" />
            <h2 className="relative text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-3">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 animate-pulse" />
              NeuroChat Assistant IA
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin" />
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Assistant IA intelligent pour vos conversations et projets
          </p>
        </div>
        



      </div>
    </div>
  );
}