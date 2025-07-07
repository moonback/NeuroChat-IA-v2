import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { sendMessageToGemini } from '@/services/geminiApi';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Mic, MessageCircle } from 'lucide-react';
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
  const { speak } = useSpeechSynthesis();

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
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMessage);
      addMessage(response, false);
      
      // Auto-speak the response
      speak(response);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get response from Gemini. Please try again.';
      
      addMessage(`Sorry, I encountered an error: ${errorMessage}`, false);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-2 sm:px-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Gemini Voice Chat
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                AI-powered voice and text conversations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Mic className="w-4 h-4 text-green-500" />
              <span>Voice enabled</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <ChatContainer messages={messages} isLoading={isLoading} />
          <VoiceInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </Card>

        {/* Footer */}
        <div className="text-center mt-3 sm:mt-4 text-xs text-muted-foreground/70">
          Powered by Google Gemini Pro • Voice recognition & synthesis enabled
        </div>
      </div>
    </div>
  );
}

export default App;