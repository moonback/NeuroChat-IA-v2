import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// Import des composants unifiés
import { UnifiedButton } from '@/components/ui/unified';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <UnifiedButton
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl transition-all duration-200 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-lg border border-white/20 dark:border-slate-700/20 group"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-transform duration-200 group-hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600 transition-transform duration-200 group-hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </UnifiedButton>
  );
}