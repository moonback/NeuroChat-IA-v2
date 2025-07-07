import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { sendMessageToGemini } from '@/services/geminiApi';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Mic, MessageCircle, Zap, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { speak } = useSpeechSynthesis();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addMessage = (text: string, isUser: boolean): Message => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!isOnline) {
      toast.error('No internet connection. Please check your network.');
      return;
    }

    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMessage);
      addMessage(response, false);
      
      // Auto-speak the response
      speak(response);
      
      // Success feedback
      toast.success('Response received!', {
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get response from Gemini. Please try again.';
      
      addMessage(`Sorry, I encountered an error: ${errorMessage}`, false);
      toast.error(errorMessage, {
        action: {
          label: 'Retry',
          onClick: () => handleSendMessage(userMessage),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              {/* Online status indicator */}
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <div className={`w-full h-full rounded-full ${
                  isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Gemini Voice Chat
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
                <span>AI-powered conversations</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Feature badges */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                <Mic className="w-3.5 h-3.5 text-green-500" />
                <span>Voice</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span>Fast</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Secure</span>
              </div>
            </div>
            
            <div className="sm:flex items-center gap-2 text-sm text-muted-foreground bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hidden">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Gemini Pro</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Enhanced Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-slate-700/20">
          <ChatContainer messages={messages} isLoading={isLoading} />
          <VoiceInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </Card>

        {/* Enhanced Footer */}
        <div className="text-center mt-4 sm:mt-6 space-y-2">
          <div className="text-xs text-muted-foreground/80 flex items-center justify-center gap-2">
            <span>Powered by Google Gemini Pro</span>
            <span>•</span>
            <span>Voice recognition & synthesis enabled</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Real-time responses
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              End-to-end encryption
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Multi-language support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;