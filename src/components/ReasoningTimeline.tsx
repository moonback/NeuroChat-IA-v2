import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, XCircle, MinusCircle, Circle, Search, Braces, Network, Mic, X, Pin, PinOff, Clipboard, List, Focus } from 'lucide-react';

export type ReasoningStepKey = 'rag' | 'buildPrompt' | 'callLLM' | 'tts';

export type ReasoningStepStatus = 'idle' | 'running' | 'done' | 'skipped' | 'error';

export interface ReasoningStep {
  key: ReasoningStepKey;
  label: string;
  status: ReasoningStepStatus;
  start?: number;
  end?: number;
  durationMs?: number;
  detail?: string;
}

export interface ReasoningTimelineProps {
  visible: boolean;
  steps: ReasoningStep[];
  loading?: boolean;
  speaking?: boolean;
  onClose?: () => void;
  autoCloseAfterStep?: ReasoningStepKey;
  autoCloseDelayMs?: number;
  disableAutoClose?: boolean;
  allowPin?: boolean;
  defaultPinned?: boolean;
  showProgress?: boolean;
  variant?: 'overlay' | 'inline';
}

function StatusIcon({ status }: { status: ReasoningStepStatus }) {
  switch (status) {
    case 'running':
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />;
    case 'done':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'error':
      return <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
    case 'skipped':
      return <MinusCircle className="h-3.5 w-3.5 text-slate-400" />;
    case 'idle':
    default:
      return <Circle className="h-3.5 w-3.5 text-slate-300" />;
  }
}

function StepIcon({ step }: { step: ReasoningStep }) {
  switch (step.key) {
    case 'rag':
      return <Search className="h-3.5 w-3.5" />;
    case 'buildPrompt':
      return <Braces className="h-3.5 w-3.5" />;
    case 'callLLM':
      return <Network className="h-3.5 w-3.5" />;
    case 'tts':
      return <Mic className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function formatDuration(ms?: number) {
  if (!ms || ms < 0) return '';
  if (ms < 1000) return `${ms} ms`;
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}

export const ReasoningTimeline: React.FC<ReasoningTimelineProps> = ({
  visible,
  steps,
  loading,
  speaking,
  onClose,
  autoCloseAfterStep,
  autoCloseDelayMs = 1000,
  disableAutoClose = false,
  allowPin = true,
  defaultPinned = false,
  showProgress = true,
  variant = 'overlay',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState<boolean>(defaultPinned);
  const [expandedKeys, setExpandedKeys] = useState<Set<ReasoningStepKey>>(new Set());
  const [lastCopiedKey, setLastCopiedKey] = useState<ReasoningStepKey | null>(null);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  // Afficher uniquement l'étape en cours (running)
  const runningSteps = useMemo(() => steps.filter((s) => s.status === 'running'), [steps]);
  const renderSteps = showAllSteps ? steps : runningSteps.length > 0 ? runningSteps : [];
  const anyRunning = useMemo(() => steps.some((s) => s.status === 'running'), [steps]);
  const allDone = useMemo(
    () => steps.length > 0 && steps.every((s) => s.status === 'done' || s.status === 'skipped') && !loading && !speaking,
    [steps, loading, speaking]
  );
  const targetStepDone = useMemo(() => {
    if (!autoCloseAfterStep) return false;
    const step = steps.find((s) => s.key === autoCloseAfterStep);
    if (!step) return false;
    return step.status === 'done' || step.status === 'error' || step.status === 'skipped';
  }, [steps, autoCloseAfterStep]);

  const doneCount = useMemo(
    () => steps.filter((s) => s.status === 'done' || s.status === 'skipped').length,
    [steps]
  );
  const progressPercent = useMemo(() => {
    if (!showProgress || steps.length === 0) return 0;
    const completed = doneCount;
    const percent = Math.round((completed / steps.length) * 100);
    return Number.isFinite(percent) ? percent : 0;
  }, [showProgress, steps.length, doneCount]);

  // Auto-fermeture quand tout est terminé
  useEffect(() => {
    if (!visible) return;
    // Priorité au déclencheur spécifique si fourni
    if (disableAutoClose || isPinned) return;
    if (autoCloseAfterStep && targetStepDone && onClose && !isHovered) {
      const t = setTimeout(() => onClose(), autoCloseDelayMs);
      return () => clearTimeout(t);
    }
    if (!autoCloseAfterStep && allDone && onClose && !isHovered) {
      const t = setTimeout(() => onClose(), 1200);
      return () => clearTimeout(t);
    }
  }, [visible, allDone, targetStepDone, autoCloseAfterStep, autoCloseDelayMs, onClose, isHovered, disableAutoClose, isPinned]);

  // Fermer sur Echap (sauf si épinglé)
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose && !isPinned) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose, isPinned]);

  if (!visible) return null;

  if (variant === 'inline') {
    return (
      <div
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-2 py-1 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showProgress && (
          <div className="h-1 bg-transparent">
            <div
              className="h-full bg-blue-500/70 dark:bg-blue-400/70 transition-[width] duration-300 ease-out rounded"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        <div className="mt-1 flex items-center justify-center">
          <button
            type="button"
            className="text-[10px] px-1.5 py-0.5 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            aria-label={showAllSteps ? "N'afficher que l'étape en cours" : 'Afficher toutes les étapes'}
            onClick={() => setShowAllSteps((v) => !v)}
          >
            {showAllSteps ? 'Afficher en cours' : 'Afficher tout'}
          </button>
        </div>
        <div className="mt-1 flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar justify-center">
            {renderSteps.map((step) => (
              <div key={step.key} className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300" title={step.detail || step.label}>
                <StatusIcon status={step.status} />
                <StepIcon step={step} />
                <span className="hidden sm:inline truncate max-w-[120px]">{step.label}</span>
              </div>
            ))}
            {renderSteps.length === 0 && !showAllSteps && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Aucune étape en cours</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/30 backdrop-blur-sm animate-in fade-in-0"
      role="dialog"
      aria-modal="true"
      onClick={() => !isPinned && onClose && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-lg animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-100">Raisonnement</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{doneCount}/{steps.length}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {anyRunning || loading || speaking ? 'Traitement…' : 'Terminé'}
            </div>
            <button
              type="button"
              aria-label={showAllSteps ? "N'afficher que l'étape en cours" : 'Afficher toutes les étapes'}
              className="inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setShowAllSteps((v) => !v)}
              title={showAllSteps ? 'Vue: en cours' : 'Vue: toutes'}
            >
              {showAllSteps ? (
                <Focus className="h-3.5 w-3.5" />
              ) : (
                <List className="h-3.5 w-3.5" />)
              }
            </button>
            {allowPin && (
              <button
                type="button"
                aria-label={isPinned ? 'Désépingler' : 'Épingler'}
                className={`inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  isPinned
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setIsPinned((v) => !v)}
              >
                {isPinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
              </button>
            )}
            {onClose && (
              <button
                type="button"
                aria-label="Fermer"
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={onClose}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        {showProgress && (
          <div className="h-1 bg-transparent">
            <div
              className="h-full bg-blue-500/70 dark:bg-blue-400/70 transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[55vh] overflow-y-auto">
          {renderSteps.map((step) => (
            <div
              key={step.key}
              className="px-3 py-2 flex items-center gap-2.5 select-none cursor-default mx-auto"
              role="button"
              tabIndex={0}
              aria-expanded={expandedKeys.has(step.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedKeys((prev) => {
                    const next = new Set(prev);
                    if (next.has(step.key)) next.delete(step.key);
                    else next.add(step.key);
                    return next;
                  });
                }
              }}
              onClick={() =>
                setExpandedKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(step.key)) next.delete(step.key);
                  else next.add(step.key);
                  return next;
                })
              }
            >
              <div className="mt-0">
                <StatusIcon status={step.status} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-center gap-2 text-[13px] leading-5">
                  <StepIcon step={step} />
                  <span className="text-slate-800 dark:text-slate-100 truncate">{step.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] ' +
                        (step.status === 'error'
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')
                      }
                    >
                      {formatDuration(step.durationMs)}
                    </span>
                    {step.detail && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        aria-label={lastCopiedKey === step.key ? 'Copié' : 'Copier le détail'}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (step.detail) {
                            navigator.clipboard.writeText(step.detail).catch(() => {});
                            setLastCopiedKey(step.key);
                            setTimeout(() => setLastCopiedKey((k) => (k === step.key ? null : k)), 1000);
                          }
                        }}
                        title={lastCopiedKey === step.key ? 'Copié' : 'Copier'}
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {step.detail && (
                  <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 transition-all text-center">
                    {expandedKeys.has(step.key) ? (
                      <div className="whitespace-pre-wrap break-words">{step.detail}</div>
                    ) : (
                      <div className="truncate">{step.detail}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {renderSteps.length === 0 && !showAllSteps && (
            <div className="px-3 py-6 text-center text-[12px] text-slate-500 dark:text-slate-400">Aucune étape en cours</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReasoningTimeline;


