import React from 'react';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SlashCommand } from '@/hooks/useVoiceInput';

interface SlashCommandsProps {
  commands: SlashCommand[];
  activeIndex: number;
  onSelect: (command: string) => void;
  className?: string;
}

export const SlashCommands: React.FC<SlashCommandsProps> = React.memo(({
  commands,
  activeIndex,
  onSelect,
  className,
}) => {
  if (commands.length === 0) return null;

  return (
    <div className={cn(
      "mt-2 animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
      className
    )}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
          <Command className="w-4 h-4" />
          <span className="font-medium">Commandes disponibles :</span>
        </div>
        <div className="w-full flex flex-wrap gap-2">
          {commands.map((command, idx) => (
            <Button
              key={command.cmd}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 px-3 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                activeIndex === idx
                  ? "bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-300/60 dark:border-blue-600/60 text-blue-700 dark:text-blue-300"
                  : "bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300"
              )}
              onClick={() => onSelect(command.cmd)}
              title={command.label}
              aria-label={`Commande: ${command.cmd} - ${command.label}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{command.icon}</span>
                <code className="font-mono text-xs font-medium">{command.cmd}</code>
                <span className="text-[10px] opacity-70 hidden sm:inline">• {command.label}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

SlashCommands.displayName = 'SlashCommands';
