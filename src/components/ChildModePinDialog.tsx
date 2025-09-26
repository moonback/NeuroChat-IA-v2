import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Baby, Lock, X } from 'lucide-react';

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
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {modeActive ? 'Désactiver le mode enfant' : 'Activer le mode enfant'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {modeActive 
                    ? 'Saisis le code PIN pour désactiver le mode enfant'
                    : `Choisis un code PIN (au moins ${minLength} chiffres) pour protéger la désactivation`
                  }
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
                    {modeActive 
                      ? 'Code PIN requis pour désactiver'
                      : 'Protection par code PIN'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={modeActive ? 'Code PIN' : 'Nouveau code PIN'}
                  value={pin}
                  onChange={(e) => {
                    const next = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setPin(next);
                    setError(null);
                  }}
                />
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
                  {modeActive ? 'Désactiver' : 'Activer'}
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
                Protection PIN
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

export default ChildModePinDialog;


