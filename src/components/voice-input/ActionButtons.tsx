import React from 'react';
import { Paperclip, Bot, Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Provider } from '@/types/voiceInput';

interface ActionButtonsProps {
  // Fichier
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Agent
  provider: Provider;
  agentEnabled: boolean;
  onToggleAgent?: () => void;
  
  // Micro
  listening: boolean;
  isSupported: boolean;
  onMicClick: () => void;
  
  // Envoi
  hasContent: boolean;
  isLoading: boolean;
  onSend: () => void;
  
  // État
  disabled?: boolean;
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = React.memo(({
  onFileSelect,
  fileInputRef,
  provider,
  agentEnabled,
  onToggleAgent,
  listening,
  isSupported,
  onMicClick,
  hasContent,
  isLoading,
  onSend,
  disabled = false,
  className,
}) => {
  const getAgentButtonStyle = () => {
    if (agentEnabled) {
      if (provider === 'gemini') {
        return 'bg-gradient-to-br from-indigo-100/90 to-indigo-200/90 dark:from-indigo-900/50 dark:to-indigo-800/50 border-indigo-300/60 dark:border-indigo-600/60 shadow-lg shadow-indigo-500/20';
      } else {
        return 'bg-gradient-to-br from-purple-100/90 to-purple-200/90 dark:from-purple-900/50 dark:to-purple-800/50 border-purple-300/60 dark:border-purple-600/60 shadow-lg shadow-purple-500/20';
      }
    }
    
    return 'bg-gradient-to-br from-slate-100/90 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 hover:from-slate-200/90 hover:to-slate-300/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90';
  };

  const getAgentIconColor = () => {
    if (agentEnabled) {
      if (provider === 'gemini') {
        return 'text-indigo-600 dark:text-indigo-300 animate-pulse';
      } else {
        return 'text-purple-600 dark:text-purple-300 animate-pulse';
      }
    }
    return 'text-slate-600 dark:text-slate-300';
  };

  const getMicButtonStyle = () => {
    if (listening) {
      return 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-600 shadow-lg shadow-red-500/30';
    }
    
    return 'bg-gradient-to-br from-slate-100/90 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-700/90 hover:from-green-100/90 hover:to-green-200/90 dark:hover:from-green-900/50 dark:hover:to-green-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-green-300/60 dark:hover:border-green-600/60 shadow-lg hover:shadow-xl shadow-black/5 dark:shadow-black/20';
  };

  const getSendButtonStyle = () => {
    if (hasContent && !isLoading) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 scale-100 hover:scale-105';
    }
    
    return 'bg-gradient-to-br from-slate-200/90 to-slate-300/90 dark:from-slate-700/90 dark:to-slate-600/90 text-slate-400 dark:text-slate-500 shadow-lg opacity-60';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Bouton fichier */}
      <Button
        type="button"
        onClick={onFileSelect}
        disabled={disabled || isLoading}
        size="icon"
        variant="ghost"
        className={cn(
          "h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden group",
          "bg-gradient-to-br from-slate-100/90 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-700/90",
          "hover:from-blue-100/90 hover:to-blue-200/90 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50",
          "border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300/60 dark:hover:border-blue-600/60",
          "shadow-lg hover:shadow-xl shadow-black/5 dark:shadow-black/20"
        )}
        title="Joindre un fichier (image, PDF, DOCX)"
        aria-label="Joindre un fichier"
      >
        <Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </Button>

      {/* Toggle Agent (Gemini/Mistral) */}
      {(provider === 'gemini' || provider === 'mistral') && onToggleAgent && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onToggleAgent}
          disabled={disabled || isLoading}
          className={cn(
            "h-10 w-10 rounded-xl transition-all duration-300 relative group overflow-hidden",
            getAgentButtonStyle()
          )}
          title={agentEnabled ? `Désactiver ${provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}` : `Activer ${provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}`}
          aria-label={agentEnabled ? `Désactiver ${provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}` : `Activer ${provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Bot className={cn("w-5 h-5", getAgentIconColor())} />
        </Button>
      )}

      {/* Bouton micro */}
      <Button
        type="button"
        size="icon"
        onClick={onMicClick}
        disabled={disabled || !isSupported}
        className={cn(
          "h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden group",
          getMicButtonStyle()
        )}
        title={listening ? "Arrêter la dictée" : !isSupported ? "Non supporté" : "Démarrer la dictée"}
        aria-label={listening ? "Arrêter la dictée" : !isSupported ? "Non supporté" : "Démarrer la dictée"}
      >
        {listening ? (
          <MicOff className="h-5 w-5 animate-pulse" />
        ) : (
          <Mic className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </Button>

      {/* Bouton envoi */}
      <Button
        onClick={onSend}
        disabled={!hasContent || isLoading || disabled}
        size="icon"
        className={cn(
          "h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden group",
          getSendButtonStyle(),
          "disabled:cursor-not-allowed disabled:hover:scale-100"
        )}
        aria-label="Envoyer le message"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </Button>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';
