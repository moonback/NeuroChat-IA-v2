import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-lg"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}