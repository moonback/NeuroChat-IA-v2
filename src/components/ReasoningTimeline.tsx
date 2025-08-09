import React from 'react';
import { CheckCircle2, Loader2, XCircle, MinusCircle, Circle, Search, Braces, Network, Mic } from 'lucide-react';

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
}

function StatusIcon({ status }: { status: ReasoningStepStatus }) {
  switch (status) {
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />;
    case 'done':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case 'skipped':
      return <MinusCircle className="h-4 w-4 text-slate-400" />;
    case 'idle':
    default:
      return <Circle className="h-4 w-4 text-slate-300" />;
  }
}

function StepIcon({ step }: { step: ReasoningStep }) {
  switch (step.key) {
    case 'rag':
      return <Search className="h-4 w-4" />;
    case 'buildPrompt':
      return <Braces className="h-4 w-4" />;
    case 'callLLM':
      return <Network className="h-4 w-4" />;
    case 'tts':
      return <Mic className="h-4 w-4" />;
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

export const ReasoningTimeline: React.FC<ReasoningTimelineProps> = ({ visible, steps, loading, speaking, onClose }) => {
  if (!visible) return null;
  const anyRunning = steps.some((s) => s.status === 'running');

  return (
    <div className="fixed bottom-24 right-2 sm:right-4 z-40 w-[calc(100%-1rem)] sm:w-96 select-none">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Raisonnement en cours</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {anyRunning || loading || speaking ? 'Traitement…' : 'Terminé'}
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {steps.map((step) => (
            <div key={step.key} className="px-3 py-2 flex items-start gap-2">
              <div className="mt-0.5">
                <StatusIcon status={step.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <StepIcon step={step} />
                  <span className="text-slate-800 dark:text-slate-100">{step.label}</span>
                  {step.status === 'done' && (
                    <span className="ml-auto text-[11px] text-slate-500">{formatDuration(step.durationMs)}</span>
                  )}
                  {step.status === 'error' && (
                    <span className="ml-auto text-[11px] text-red-500">{formatDuration(step.durationMs)}</span>
                  )}
                </div>
                {step.detail && (
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">{step.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 py-2 flex items-center justify-end gap-2">
          {onClose && (
            <button
              type="button"
              className="text-[11px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={onClose}
            >
              Masquer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReasoningTimeline;


