import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { Loader2, Sparkles, ArrowDown, Trash2 } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

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
    <div className="flex-1 relative">
      <ScrollArea 
        className="h-full p-4 sm:p-6" 
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        <div className="space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] sm:min-h-[500px] text-center px-4">
              <div className="relative mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-3 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-4 -left-4 w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.5s] opacity-60"></div>
                <div className="absolute -bottom-4 -right-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:1s] opacity-60"></div>
                <div className="absolute top-1/2 -left-6 w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:1.5s] opacity-60"></div>
              </div>
              
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
                Bienvenue sur Voice Chat
              </h3>
              
              <p className="text-muted-foreground max-w-lg text-sm sm:text-base leading-relaxed mb-8">
                Découvre le futur de la conversation avec l'IA : reconnaissance vocale avancée, langage naturel et réponses intelligentes propulsées par Google Gemini Pro.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">IA avancée</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Compréhension contextuelle et réponses naturelles</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl border border-green-200/50 dark:border-green-700/30">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Prêt pour la voix</h4>
                  <p className="text-xs text-green-700 dark:text-green-300">Parle naturellement et écoute les réponses</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Temps réel</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Réponses instantanées et fluides</p>
                </div>
              </div>
              
              <div className="mt-8 text-xs text-muted-foreground/70">
                Commence par écrire un message ou clique sur le micro pour parler
              </div>
            </div>
          ) : (
            <>
              {/* Chat header with message count */}
              {messages.length > 0 && (
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-700/50 mb-6">
                  <div className="text-sm text-muted-foreground">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Effacer
                  </Button>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={message.id} className="animate-fadeIn">
                  <MessageBubble
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    isLatest={index === messages.length - 1}
                  />
                </div>
              ))}
            </>
          )}
          
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <TypingIndicator />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200 animate-fadeIn"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}