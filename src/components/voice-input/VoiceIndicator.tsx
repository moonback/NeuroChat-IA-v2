import React from 'react';
import { MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceIndicatorProps {
  onStop: () => void;
  className?: string;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = React.memo(({
  onStop,
  className,
}) => {
  return (
    <div className={`mt-3 animate-in slide-in-from-bottom-4 fade-in-0 duration-300 ${className || ''}`}>
      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-50/90 via-pink-50/90 to-red-50/90 dark:from-red-950/50 dark:via-pink-950/50 dark:to-red-950/50 border border-red-200/60 dark:border-red-800/60 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce shadow-md" 
                    style={{ 
                      animationDelay: `${i * 150}ms`, 
                      animationDuration: '1s' 
                    }} 
                  />
                ))}
              </div>
              <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-pulse" />
            </div>
            
            <div className="text-center sm:text-left">
              <div className="text-base font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                🎤 Dictée vocale active
              </div>
              <div className="text-sm text-red-600/80 dark:text-red-400/80">
                Parlez naturellement, arrêtez quand vous avez terminé
              </div>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={onStop}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/40 transition-all duration-200 px-6 py-3 rounded-xl border-2 border-red-400/30 group"
            aria-label="Arrêter la dictée vocale"
          >
            <MicOff className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Arrêter
          </Button>
        </div>
      </div>
    </div>
  );
});

VoiceIndicator.displayName = 'VoiceIndicator';
