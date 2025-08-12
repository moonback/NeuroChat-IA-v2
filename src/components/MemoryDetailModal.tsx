import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Save, X } from 'lucide-react';

interface MemoryDetailModalProps {
  open: boolean;
  onClose: () => void;
  status: 'idle' | 'running' | 'ready' | 'error';
  error?: string;
  summary: string;
  facts: string[];
  totalCount: number;
  shortCount: number;
  onForceUpdate: () => Promise<void>;
  onUpdateSummary: (text: string) => void;
  onUpdateFacts: (facts: string[]) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  open,
  onClose,
  status,
  error,
  summary,
  facts,
  totalCount,
  shortCount,
  onForceUpdate,
  onUpdateSummary,
  onUpdateFacts,
}) => {
  const [localSummary, setLocalSummary] = useState(summary);
  const [factsInput, setFactsInput] = useState(facts.join('\n'));
  const [saving, setSaving] = useState(false);
  const [forcing, setForcing] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalSummary(summary);
      setFactsInput(facts.join('\n'));
    }
  }, [open, summary, facts]);

  const infoText = useMemo(() => {
    return `Messages totaux: ${totalCount} • Fenêtre courte: ${shortCount} • État: ${status}`;
  }, [totalCount, shortCount, status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanedFacts = factsInput
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      onUpdateSummary(localSummary.trim());
      onUpdateFacts(cleanedFacts);
    } finally {
      setSaving(false);
    }
  };

  const handleForce = async () => {
    setForcing(true);
    try {
      await onForceUpdate();
    } finally {
      setForcing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle>Mémoire de la conversation</DialogTitle>
          <DialogDescription className="sr-only">
            Panneau de gestion de la mémoire longue: résumé et faits clés de la conversation, avec option de forcer une mise à jour
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">{infoText}</div>
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md p-2 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Résumé</label>
            <Textarea
              className="min-h-[120px]"
              value={localSummary}
              onChange={(e) => setLocalSummary(e.target.value)}
              placeholder="Résumé concis de la conversation…"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Faits clés (un par ligne)</label>
            <Textarea
              className="min-h-[120px] font-mono text-sm"
              value={factsInput}
              onChange={(e) => setFactsInput(e.target.value)}
              placeholder={'- objectif prioritaire\n- préférences utilisateur\n- contraintes importantes'}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose} className="gap-2">
              <X className="w-4 h-4" />
              Fermer
            </Button>
            <Button variant="ghost" onClick={handleForce} disabled={forcing} className="gap-2">
              {forcing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Forcer mise à jour
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryDetailModal;


