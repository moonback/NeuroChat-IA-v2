import { Bot, User, Copy, Check, CheckCheck, Sparkles, Edit, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react'; // Added useRef, useEffect, useCallback
import { toast } from 'sonner';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'; // Added AlertDialog components

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isLatest?: boolean;
  imageUrl?: string;
  onEdit?: (newText: string) => void; // Added onEdit prop
  onDelete?: () => void; // Added onDelete prop
  onReply?: (messageContent: string) => void; // Added onReply prop, passing message content
  sources?: Array<{ title: string; url: string }>;
  generatedImage?: {
    imageUrl: string;
    prompt: string;
    model: string;
    generationTime: number;
    metadata?: {
      seed?: number;
      steps?: number;
      guidance?: number;
    };
  };
}

export function MessageBubble({ message, isUser, timestamp, isLatest = false, imageUrl, onEdit, onDelete, onReply, sources, generatedImage }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false); // New state for edit mode
  const [editValue, setEditValue] = useState(message); // State to hold edited text
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for delete confirmation dialog
  const [showConfirmEdit, setShowConfirmEdit] = useState(false); // State for edit confirmation dialog
  const [highlight, setHighlight] = useState<'edit' | 'delete' | null>(null); // State for visual highlight after action

  const editInputRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea in edit mode

  // Effect to focus and set cursor at the end of text when entering edit mode
  useEffect(() => {
    if (editing && editInputRef.current) {
      const input = editInputRef.current;
      requestAnimationFrame(() => {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
      });
    }
  }, [editing]);

  // Effect to clear highlight after a delay
  useEffect(() => {
    if (highlight) {
      const timeout = setTimeout(() => setHighlight(null), 1200);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);

  // --- Handlers (Memoized with useCallback for performance) ---

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Message copié dans le presse-papier !');
    } catch {
      toast.error('Échec de la copie du message');
    }
  }, [message]);

  

  const handleEdit = useCallback(() => {
    setEditing(true);
    setEditValue(message); // Initialize edit value with current message
  }, [message]);

  const handleEditCancel = useCallback(() => {
    setEditing(false);
    setEditValue(message); // Revert to original message on cancel
  }, [message]);

  const handleEditSave = useCallback(() => {
    // Only show confirmation if text has changed and is not empty
    if (editValue.trim() && editValue.trim() !== message.trim()) {
      setShowConfirmEdit(true);
    } else {
      setEditing(false); // Exit editing if no change or empty
    }
  }, [editValue, message]);

  const confirmEdit = useCallback(() => {
    if (onEdit && editValue.trim() && editValue.trim() !== message.trim()) {
      onEdit(editValue.trim());
      setHighlight('edit');
      toast.success('Message modifié avec succès.');
    }
    setEditing(false);
    setShowConfirmEdit(false);
  }, [onEdit, editValue, message]);

  const handleDeleteConfirmed = useCallback(() => {
    if (onDelete) {
      onDelete();
      setHighlight('delete');
      toast.success('Message supprimé avec succès.');
    }
    setShowConfirmDelete(false);
  }, [onDelete]);

  // Keyboard shortcut for saving/cancelling edit
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Enter to save, Shift+Enter for new line
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditSave, handleEditCancel]);

  return (
    <div
      className={cn(
        "flex w-full mb-6 group relative",
        isUser ? "justify-end" : "justify-start",
        highlight === 'edit' && 'animate-pulse bg-yellow-100 dark:bg-yellow-900/30', // Highlight for edited message
        highlight === 'delete' && 'animate-fadeOut', // Animation for deleted message
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Subtle background glow for latest message */}
      {isLatest && !isUser && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl -z-10" />
      )}

      <div className={cn(
        "flex max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] gap-3 sm:gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 select-none items-center justify-center rounded-2xl shadow-lg transition-all duration-300 hover:scale-105",
          isUser
            ? "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-green-500/25"
            : "bg-gradient-to-br from-violet-500 via-blue-500 to-indigo-600 text-white shadow-blue-500/25"
        )}>
          {isUser ? (
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
          )}

          {/* Enhanced online indicator for AI */}
          {!isUser && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
              <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {/* Sparkle effect for latest AI message */}
          {isLatest && !isUser && (
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col gap-2 flex-1">
          <div className={cn(
            "rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl border relative group/message",
            isUser
              ? "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white rounded-br-lg border-emerald-400/30 shadow-emerald-500/20"
              : "bg-gradient-to-br from-white via-slate-50 to-gray-50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg border-slate-200/50 dark:border-slate-600/30 shadow-slate-500/10",
            isLatest && !isUser && "ring-2 ring-blue-300/50 dark:ring-blue-600/50 ring-opacity-60 shadow-blue-500/20"
          )}
            onDoubleClick={() => isUser && onEdit && handleEdit()} // Double-click to edit for user messages
          >
            {/* Subtle inner glow */}
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 group-hover/message:opacity-100 transition-opacity duration-300",
              isUser ? "bg-gradient-to-br from-white/10 to-transparent" : "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
            )} />

            {/* Image display with enhanced styling */}
            {imageUrl && (
              <div className="relative mb-3 group">
                <img
                  src={imageUrl}
                  alt="Image envoyée"
                  loading="lazy"
                  decoding="async"
                  className="max-w-xs max-h-52 rounded-xl border-2 border-white/20 dark:border-slate-600/30 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  style={{ objectFit: 'contain' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}

            {/* Generated image display */}
            {generatedImage && (
              <div className="relative mb-3 group">
                <div className="relative">
                  <img
                    src={generatedImage.imageUrl}
                    alt={`Image générée: ${generatedImage.prompt}`}
                    loading="lazy"
                    decoding="async"
                    className="max-w-sm max-h-64 rounded-xl border-2 border-purple-200/50 dark:border-purple-600/30 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                    style={{ objectFit: 'contain' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badge généré par IA */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    IA Générée
                  </div>
                </div>
                
                {/* Informations sur la génération */}
                <div className="mt-2 p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      Prompt: {generatedImage.prompt.length > 80 ? `${generatedImage.prompt.substring(0, 80)}...` : generatedImage.prompt}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-purple-600 dark:text-purple-400">
                      <span>Modèle: {generatedImage.model.split('/')[1]}</span>
                      <span>•</span>
                      <span>{Math.round(generatedImage.generationTime / 1000)}s</span>
                      {generatedImage.metadata?.steps && (
                        <>
                          <span>•</span>
                          <span>{generatedImage.metadata.steps} étapes</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message text or edit input */}
            {editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  ref={editInputRef}
                  className="w-full rounded-lg border px-2 py-1 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-700 resize-y min-h-[40px]"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  rows={2}
                />
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleEditSave}
                    disabled={editValue.trim() === message.trim() || editValue.trim() === ''}
                  >
                    Valider
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleEditCancel}>Annuler</Button>
                </div>
                {/* Edit confirmation dialog */}
                <AlertDialog open={showConfirmEdit} onOpenChange={setShowConfirmEdit}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la modification&nbsp;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le message sera modifié. Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-2 p-2 rounded bg-slate-50 dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700">
                      {editValue}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmEdit}>Valider</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-medium">
                {message}
              </p>
            )}

            {/* Enhanced timestamp and status */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 dark:border-slate-600/20">
              <p className={cn(
                "text-xs font-medium opacity-70",
                isUser ? "text-white/80" : "text-slate-500 dark:text-slate-400"
              )}>
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Enhanced message status for user messages */}
              {isUser && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-white/70" />
                    <span className="text-xs text-white/70 font-medium">Envoyé</span>
                  </div>
                  {/* Indicateur de mémoire supprimé - système de mémoire retiré */}
                </div>
              )}
            </div>

            {/* Sources sous le message (uniquement pour messages IA) */}
            {!isUser && Array.isArray(sources) && sources.length > 0 && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                {sources.map((s, idx) => (
                  <div key={`${s.url}-${idx}`} className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                      {idx + 1}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline text-blue-700 dark:text-blue-300"
                      title={s.title}
                    >
                      {s.title || s.url}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced action buttons */}
          {(showActions || isLiked !== null) && !editing && ( // Hide actions when in editing mode
            <div className={cn(
              "flex items-center gap-1.5 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0",
              isUser ? "justify-end" : "justify-start"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className={cn(
                  "h-8 px-3 text-xs font-medium backdrop-blur-md border transition-all duration-200 hover:scale-105",
                  copied
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700"
                    : "bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border-white/30 dark:border-slate-700/30"
                )}
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copié!' : 'Copier'}
              </Button>

              {/* Edit button (only for user messages and if onEdit prop is provided) */}
              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {/* Delete button (only for user messages and if onDelete prop is provided) */}
              {isUser && onDelete && (
                <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmDelete(true)}
                      className="h-8 w-8 p-0"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce message&nbsp;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le message sera définitivement supprimé.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteConfirmed}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Reply button (if onReply prop is provided) */}
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message)} // Pass message content to reply handler
                  className="h-8 w-8 p-0"
                  title="Répondre"
                >
                  <Reply className="w-4 h-4" />
                </Button>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}