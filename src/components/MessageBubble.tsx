import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
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
  const displayedText = message;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
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
        "flex w-full mb-4 group",
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        "flex max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] gap-2 sm:gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 select-none items-center justify-center rounded-xl shadow-lg transition-all duration-200",
          isUser 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
            : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white"
        )}>
          {isUser ? (
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          
          {/* Online indicator for AI */}
          {!isUser && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-slate-900">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Message content */}
        <div className="flex flex-col gap-1 flex-1">
          <div className={cn(
            "rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl border relative",
            isUser
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-md border-green-400/20"
              : "bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md border-white/20 dark:border-slate-600/20",
            isLatest && !isUser && "ring-2 ring-blue-200 dark:ring-blue-800 ring-opacity-50"
          )}>
            {/* Affichage de l'image envoyée */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Image envoyée"
                className="max-w-xs max-h-48 rounded-lg mb-2 border"
                style={{ objectFit: 'contain' }}
              />
            )}
            {/* Message text */}
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
              {displayedText}
            </p>
            
            {/* Timestamp */}
            <div className="flex items-center justify-between mt-2">
              <p className={cn(
                "text-[10px] font-medium opacity-70",
                isUser ? "text-white/80" : "text-slate-500 dark:text-slate-400"
              )}>
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              
              {/* Message status for user messages */}
              {isUser && (
                <div className="flex items-center gap-0.5">
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/80 rounded-full"></div>
                  <span className="text-[10px] text-white/70 ml-1">Envoyé</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          {(showActions || isLiked !== null) && (
            <div className={cn(
              "flex items-center gap-1 transition-all duration-200",
              isUser ? "justify-end" : "justify-start"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-7 px-2 text-[11px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copier
              </Button>
              
              {!isUser && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(true)}
                    className={cn(
                      "h-7 px-2 text-[11px] backdrop-blur-sm border transition-all duration-200",
                      isLiked === true
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700"
                        : "bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border-white/20 dark:border-slate-700/20"
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
                      "h-7 px-2 text-[11px] backdrop-blur-sm border transition-all duration-200",
                      isLiked === false
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700"
                        : "bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border-white/20 dark:border-slate-700/20"
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
                className="h-7 w-7 p-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20"
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