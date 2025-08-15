import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChildModePinDialogProps {
  open: boolean;
  modeActive: boolean;
  onClose: () => void;
  onConfirmPin: (pin: string) => void;
  requireToDisable?: boolean;
  minLength?: number;
}

export const ChildModePinDialog: React.FC<ChildModePinDialogProps> = ({
  open,
  modeActive,
  onClose,
  onConfirmPin,
  requireToDisable = true,
  minLength = 4,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setPin('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireToDisable && modeActive && pin.length < minLength) {
      setError(`Le code doit contenir au moins ${minLength} chiffres.`);
      return;
    }
    onConfirmPin(pin);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{modeActive ? 'Désactiver le mode enfant' : 'Activer le mode enfant'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {modeActive ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Saisis le code PIN pour désactiver le mode enfant.
            </p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Choisis un code PIN (au moins {minLength} chiffres) pour protéger la désactivation.
            </p>
          )}
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={modeActive ? 'Code PIN' : 'Nouveau code PIN'}
            value={pin}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, '').slice(0, 8);
              setPin(next);
              setError(null);
            }}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {modeActive ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChildModePinDialog;


