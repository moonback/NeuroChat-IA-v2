import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WorkspaceOpeningDialogProps {
  open: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceOpeningDialog({ open, name, onOpenChange }: WorkspaceOpeningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Chargement de l'espace de travail
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Ouverture de l'espace « {name} » en cours...
            Veuillez patienter quelques instants.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="h-12 w-12 rounded-full border-3 border-slate-200 border-t-indigo-600 animate-spin dark:border-slate-700" />
          <p className="text-sm text-gray-500 animate-pulse">
            Chargement des données...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WorkspaceOpeningDialog;


