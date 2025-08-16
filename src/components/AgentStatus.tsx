import React from 'react';
import { Globe, Database, Sparkles, CheckCircle2, Clock } from 'lucide-react';

type StepKey = 'web' | 'rag' | 'generate';

export interface AgentStepStatus {
  state: 'idle' | 'running' | 'done';
  label: string;
}

export interface AgentStatusProps {
  visible: boolean;
  steps: Record<StepKey, AgentStepStatus>;
  className?: string;
  title?: string;
}

const StepRow: React.FC<{ icon: React.ReactNode; status: AgentStepStatus }> = ({ icon, status }) => {
  const color = status.state === 'done' ? 'text-emerald-600' : status.state === 'running' ? 'text-indigo-600' : 'text-slate-500';
  return (
    <div className={`flex items-center justify-between py-1.5`}>
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs font-medium">{status.label}</span>
      </div>
      <div>
        {status.state === 'done' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <Clock className={`w-4 h-4 ${color}`} />
        )}
      </div>
    </div>
  );
};

export const AgentStatus: React.FC<AgentStatusProps> = ({ visible, steps, className, title }) => {
  if (!visible) return null;
  return (
    <div className={`pointer-events-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-xl p-3 ${className || ''}`}>
      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1">{title || 'Agent'}</div>
      <div className="w-56">
        <StepRow icon={<Globe className="w-4 h-4" />} status={steps.web} />
        <StepRow icon={<Database className="w-4 h-4" />} status={steps.rag} />
        <StepRow icon={<Sparkles className="w-4 h-4" />} status={steps.generate} />
      </div>
    </div>
  );
};

export default AgentStatus;


