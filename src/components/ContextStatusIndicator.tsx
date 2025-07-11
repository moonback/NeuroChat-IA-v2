import React from 'react';
import { MessageCircle, Brain, Archive, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextStatusIndicatorProps {
  totalMessages: number;
  contextMessages: number;
  memoryFacts: number;
  isOptimized: boolean;
  className?: string;
}

export const ContextStatusIndicator: React.FC<ContextStatusIndicatorProps> = ({
  totalMessages,
  contextMessages,
  memoryFacts,
  isOptimized,
  className,
}) => {
  const getStatusColor = () => {
    if (isOptimized) return 'text-orange-500 dark:text-orange-400';
    if (totalMessages > 40) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  const getStatusText = () => {
    if (isOptimized) return 'Contexte optimisé';
    if (totalMessages > 40) return 'Contexte long';
    return 'Contexte actif';
  };

  const getStatusIcon = () => {
    if (isOptimized) return <Archive className="w-3 h-3" />;
    if (totalMessages > 40) return <MessageCircle className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full border border-slate-200 dark:border-slate-700 shadow-sm",
      className
    )}>
      <div className={cn("flex items-center gap-1", getStatusColor())}>
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          <span>{contextMessages}/{totalMessages}</span>
        </div>
        
        {memoryFacts > 0 && (
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            <span>{memoryFacts}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextStatusIndicator; 