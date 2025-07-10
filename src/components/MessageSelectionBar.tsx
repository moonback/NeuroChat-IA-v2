import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import React from 'react';

interface MessageSelectionBarProps {
  selectMode: boolean;
  onToggleSelectMode: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRequestDelete: () => void;
  showConfirmDelete: boolean;
  setShowConfirmDelete: (open: boolean) => void;
  onDeleteConfirmed: () => void;
}

export const MessageSelectionBar: React.FC<MessageSelectionBarProps> = ({
  selectMode,
  onToggleSelectMode,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onRequestDelete,
  showConfirmDelete,
  setShowConfirmDelete,
  onDeleteConfirmed,
}) => (
  <div className="flex gap-2 items-center mb-2 px-2">
    <Button
      variant={selectMode ? 'secondary' : 'outline'}
      size="sm"
      onClick={onToggleSelectMode}
    >
      {selectMode ? 'Annuler la sélection' : 'Sélectionner'}
    </Button>
    {selectMode && (
      <Button
        variant="outline"
        size="sm"
        onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
      >
        {selectedCount === totalCount ? 'Tout désélectionner' : 'Sélectionner tout'}
      </Button>
    )}
    {selectMode && selectedCount > 0 && (
      <Button
        variant="destructive"
        size="sm"
        onClick={onRequestDelete}
      >
        Supprimer la sélection ({selectedCount})
      </Button>
    )}
    <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {selectedCount} message{selectedCount > 1 ? 's' : ''} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Les messages sélectionnés seront définitivement supprimés de la conversation et de l'historique.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onDeleteConfirmed}>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
); 