import React from 'react';
import { Button } from '@/components/ui/button';
import type { ButtonProps, IconButtonProps, TileButtonProps } from '@/types/header';

export const ActionButton: React.FC<ButtonProps> = React.memo(({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  loading = false,
  ...props 
}) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    disabled={loading}
    data-tooltip-id="header-tooltip"
    data-tooltip-content={tooltip}
    className={`
      h-9 px-4 text-sm font-medium rounded-xl
      hover:bg-slate-100/80 dark:hover:bg-slate-800/80 
      transition-all duration-200 hover:scale-[1.02] active:scale-95 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 
      focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950
      backdrop-blur-sm border-0
      ${loading ? 'animate-pulse' : ''}
      ${className}
    `}
    {...props}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        {children}
      </div>
    ) : (
      children
    )}
  </Button>
));

ActionButton.displayName = 'ActionButton';

export const IconButton: React.FC<IconButtonProps> = React.memo(({ 
  children, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = "",
  active = false,
  ...props 
}) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    data-tooltip-id="header-tooltip"
    data-tooltip-content={tooltip}
    className={`
      h-9 w-9 p-0 rounded-xl transition-all duration-200 
      hover:scale-105 active:scale-95 backdrop-blur-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 
      focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950
      ${active ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-400/30' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </Button>
));

IconButton.displayName = 'IconButton';

export const TileButton: React.FC<TileButtonProps> = React.memo(({
  onClick,
  label,
  icon: Icon,
  active = false,
  intent = 'default',
  disabled = false,
  tooltip,
}) => {
  const intents: Record<string, string> = {
    default: 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60',
    danger: 'bg-red-50/80 dark:bg-red-950/40 border-red-200/60 dark:border-red-800/50',
    info: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/50',
    success: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/50',
    warning: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50',
  };
  const activeRing = active ? 'ring-1 ring-blue-400/40' : '';
  const intentBg = intents[intent] || intents.default;
  const textTone = active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300';
  const iconTone = active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-tooltip-id="header-tooltip"
      data-tooltip-content={tooltip || label}
      className={`group w-full h-16 rounded-xl border ${intentBg} ${activeRing} flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? 'bg-blue-100/70 dark:bg-blue-900/40' : 'bg-white/70 dark:bg-slate-800/60'} shadow-sm`}>
        <Icon className={`w-4 h-4 ${iconTone}`} />
      </div>
      <span className={`text-[10px] font-medium ${textTone} truncate w-full px-1 text-center`}>{label}</span>
    </button>
  );
});

TileButton.displayName = 'TileButton';

export const ButtonGroup: React.FC<{ children: React.ReactNode; className?: string }> = React.memo(({ children, className = "" }) => (
  <div className={`
    flex items-center gap-1 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 
    border border-slate-200/60 dark:border-slate-800/60 p-1.5 shadow-sm backdrop-blur-sm
    hover:shadow-md transition-all duration-200
    ${className}
  `}>
    {children}
  </div>
));

ButtonGroup.displayName = 'ButtonGroup';
