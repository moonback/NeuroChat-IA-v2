import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChildModeChangePinDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmNewPin: (newPin: string) => void;
  isCurrentValid: (pin: string) => boolean;
  minLength?: number;
}

export const ChildModeChangePinDialog: React.FC<ChildModeChangePinDialogProps> = ({
  open,
  onClose,
  onConfirmNewPin,
  isCurrentValid,
  minLength = 4,
}) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const currentRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => currentRef.current?.focus(), 50);
    } else {
      setCurrent('');
      setNext('');
      setConfirm('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentValid(current)) {
      setError('PIN actuel incorrect.');
      return;
    }
    if (!next || next.length < minLength) {
      setError(`Le nouveau PIN doit contenir au moins ${minLength} chiffres.`);
      return;
    }
    if (next !== confirm) {
      setError('La confirmation du nouveau PIN ne correspond pas.');
      return;
    }
    onConfirmNewPin(next);
  };

  const normalize = (v: string) => v.replace(/\D/g, '').slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Changer le code PIN (mode enfant)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">PIN actuel</label>
            <input
              ref={currentRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="PIN actuel"
              value={current}
              onChange={(e) => { setCurrent(normalize(e.target.value)); setError(null); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nouveau PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Au moins ${minLength} chiffres`}
              value={next}
              onChange={(e) => { setNext(normalize(e.target.value)); setError(null); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmer le nouveau PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirme le PIN"
              value={confirm}
              onChange={(e) => { setConfirm(normalize(e.target.value)); setError(null); }}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Mettre à jour</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChildModeChangePinDialog;


