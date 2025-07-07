import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/30 shadow w-fit">
      <Sparkles className="text-blue-500 dark:text-blue-300 animate-pulse" size={18} />
      <span className="font-medium text-xs text-slate-700 dark:text-slate-200">
        L’IA est en train d’écrire
        <span className="inline-block w-3">
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-150">.</span>
          <span className="animate-bounce delay-300">.</span>
        </span>
      </span>
    </div>
  );
} 