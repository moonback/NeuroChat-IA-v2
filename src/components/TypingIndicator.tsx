import { UnifiedContainer } from '@/components/ui/unified';

export function TypingIndicator() {
  return (
    <UnifiedContainer 
      className="flex items-center gap-3 py-2 px-3 rounded-xl shadow-lg w-fit border border-blue-300 dark:border-blue-800"
      mode="normal"
    >
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
    </UnifiedContainer>
  );
} 