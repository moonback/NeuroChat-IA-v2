import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Check, CheckCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isLatest?: boolean;
  imageUrl?: string;
}

export function MessageBubble({ message, isUser, timestamp, isLatest = false, imageUrl }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const displayedText = message;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Message copié dans le presse-papier !');
    } catch (err) {
      toast.error('Échec de la copie du message');
    }
  };

  const handleLike = (liked: boolean) => {
    setIsLiked(liked);
    toast.success(liked ? 'Merci pour ton retour !' : 'Avis pris en compte');
  };

  return (
    <div 
      className={cn(
        "flex w-full mb-6 group relative",
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Subtle background glow for latest message */}
      {isLatest && !isUser && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl -z-10" />
      )}
      
      <div className={cn(
        "flex max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] gap-3 sm:gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 select-none items-center justify-center rounded-2xl shadow-lg transition-all duration-300 hover:scale-105",
          isUser 
            ? "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-green-500/25" 
            : "bg-gradient-to-br from-violet-500 via-blue-500 to-indigo-600 text-white shadow-blue-500/25"
        )}>
          {isUser ? (
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
          
          {/* Enhanced online indicator for AI */}
          {!isUser && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
              <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
          
          {/* Sparkle effect for latest AI message */}
          {isLatest && !isUser && (
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Message content */}
        <div className="flex flex-col gap-2 flex-1">
          <div className={cn(
            "rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl border relative group/message",
            isUser
              ? "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white rounded-br-lg border-emerald-400/30 shadow-emerald-500/20"
              : "bg-gradient-to-br from-white via-slate-50 to-gray-50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg border-slate-200/50 dark:border-slate-600/30 shadow-slate-500/10",
            isLatest && !isUser && "ring-2 ring-blue-300/50 dark:ring-blue-600/50 ring-opacity-60 shadow-blue-500/20"
          )}>
            {/* Subtle inner glow */}
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 group-hover/message:opacity-100 transition-opacity duration-300",
              isUser ? "bg-gradient-to-br from-white/10 to-transparent" : "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
            )} />
            
            {/* Image display with enhanced styling */}
            {imageUrl && (
              <div className="relative mb-3 group">
                <img
                  src={imageUrl}
                  alt="Image envoyée"
                  className="max-w-xs max-h-52 rounded-xl border-2 border-white/20 dark:border-slate-600/30 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  style={{ objectFit: 'contain' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}
            
            {/* Message text with better typography */}
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-medium">
              {displayedText}
            </p>
            
            {/* Enhanced timestamp and status */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 dark:border-slate-600/20">
              <p className={cn(
                "text-xs font-medium opacity-70",
                isUser ? "text-white/80" : "text-slate-500 dark:text-slate-400"
              )}>
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              
              {/* Enhanced message status for user messages */}
              {isUser && (
                <div className="flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-white/70" />
                  <span className="text-xs text-white/70 font-medium">Envoyé</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced action buttons */}
          {(showActions || isLiked !== null) && (
            <div className={cn(
              "flex items-center gap-1.5 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0",
              isUser ? "justify-end" : "justify-start"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className={cn(
                  "h-8 px-3 text-xs font-medium backdrop-blur-md border transition-all duration-200 hover:scale-105",
                  copied
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700"
                    : "bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border-white/30 dark:border-slate-700/30"
                )}
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copié!' : 'Copier'}
              </Button>
              
              {!isUser && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(true)}
                    className={cn(
                      "h-8 px-3 text-xs font-medium backdrop-blur-md border transition-all duration-200 hover:scale-105",
                      isLiked === true
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 shadow-green-500/20"
                        : "bg-white/60 dark:bg-slate-800/60 hover:bg-green-50 dark:hover:bg-green-900/20 border-white/30 dark:border-slate-700/30 hover:border-green-200 dark:hover:border-green-700"
                    )}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {isLiked === true ? 'Aimé' : 'Aimer'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(false)}
                    className={cn(
                      "h-8 px-3 text-xs font-medium backdrop-blur-md border transition-all duration-200 hover:scale-105",
                      isLiked === false
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 shadow-red-500/20"
                        : "bg-white/60 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-900/20 border-white/30 dark:border-slate-700/30 hover:border-red-200 dark:hover:border-red-700"
                    )}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    {isLiked === false ? 'Pas aimé' : 'Pas fan'}
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/30 dark:border-slate-700/30 transition-all duration-200 hover:scale-105"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}