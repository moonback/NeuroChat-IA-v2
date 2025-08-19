import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StatusIndicator } from './StatusIndicators';


interface LogoProps {
  onNewDiscussion: () => void;
  isOnline: boolean;
  quality: 'excellent' | 'good' | 'poor';
}

export const Logo: React.FC<LogoProps> = React.memo(({ onNewDiscussion, isOnline, quality }) => (
  <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={onNewDiscussion}>
    <div className="relative">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-active:scale-95 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-transparent to-white/10 group-hover:to-white/20 transition-all duration-300" />
      </div>
      <StatusIndicator isOnline={isOnline} quality={quality} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
        NeuroChat
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
        IA Conversationnelle
      </div>
    </div>
  </div>
));

Logo.displayName = 'Logo';
