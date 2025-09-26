import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Baby, Lock, X, KeyRound } from 'lucide-react';

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
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Changer le code PIN (mode enfant)
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Modifie le code PIN de protection du mode enfant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 flex flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Modification du code PIN de sécurité
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PIN actuel</label>
                  <input
                    ref={currentRef}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Confirme le PIN"
                    value={confirm}
                    onChange={(e) => { setConfirm(normalize(e.target.value)); setError(null); }}
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-red-600 text-center bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Mettre à jour
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer avec actions rapides */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Baby className="w-3 h-3 mr-1" />
                Mode enfant
              </Badge>
              <Badge variant="outline" className="text-xs">
                Modification PIN
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChildModeChangePinDialog;


