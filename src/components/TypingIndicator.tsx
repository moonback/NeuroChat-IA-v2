// import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-900/60 dark:to-indigo-900/40 shadow-lg w-fit border border-blue-300 dark:border-blue-800">
      {/* <Sparkles className="text-blue-600 dark:text-blue-200 animate-pulse" size={22} /> */}
      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center">
        <span className="inline-flex w-5 ml-1">
          {[...Array(3)].map((_, i) => (
            <span 
              key={i}
              className="animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              .
            </span>
          ))}
        </span>
      </span>
    </div>
  );
} 