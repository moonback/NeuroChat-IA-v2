import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function MessageBubble({ message, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex w-full mb-4 sm:mb-6",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 select-none items-center justify-center rounded-full shadow-lg",
          isUser 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        )}>
          {isUser ? <User className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bot className="h-4 w-4 sm:h-5 sm:w-5" />}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl",
          isUser
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-md"
            : "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md"
        )}>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{message}</p>
          <p className={cn(
            "text-xs mt-2 opacity-70 font-medium",
            isUser ? "text-white/80" : "text-slate-500 dark:text-slate-400"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}