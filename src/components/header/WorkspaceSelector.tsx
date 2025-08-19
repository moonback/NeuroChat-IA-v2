import React, { useState } from 'react';
import { Database, Pencil, PlusCircle, CheckSquare, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Workspace } from '@/types/header';

interface WorkspaceSelectorProps {
  modeEnfant?: boolean;
  workspaces?: Array<Workspace>;
  workspaceId?: string;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = React.memo(({ 
  modeEnfant, 
  workspaces, 
  workspaceId, 
  onChangeWorkspace, 
  onCreateWorkspace, 
  onRenameWorkspace, 
  onDeleteWorkspace 
}) => {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  
  if (modeEnfant || !workspaces || !onChangeWorkspace) return null;

  const currentWorkspace = workspaces.find(w => w.id === workspaceId);

  return (
    <>
      <button
        onClick={() => setShowWorkspaceModal(true)}
        className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-3 py-2 max-w-[200px] sm:max-w-none hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors group"
        title="Changer d'espace de travail"
        aria-label="Changer d'espace de travail"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Database className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
            {currentWorkspace?.name || 'Espace par défaut'}
          </span>
        </div>
        <Pencil className="w-3 h-3 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <WorkspaceSelectorModal
        open={showWorkspaceModal}
        onOpenChange={setShowWorkspaceModal}
        workspaces={workspaces}
        currentWorkspaceId={workspaceId}
        onChangeWorkspace={onChangeWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        onRenameWorkspace={onRenameWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
      />
    </>
  );
});

WorkspaceSelector.displayName = 'WorkspaceSelector';

interface WorkspaceSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: Array<Workspace>;
  currentWorkspaceId?: string;
  onChangeWorkspace?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}

const WorkspaceSelectorModal: React.FC<WorkspaceSelectorModalProps> = React.memo(({
  open,
  onOpenChange,
  workspaces,
  currentWorkspaceId,
  onChangeWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim() && onCreateWorkspace) {
      onCreateWorkspace();
      setNewWorkspaceName('');
      onOpenChange(false);
    }
  };

  const handleRenameWorkspace = () => {
    if (editingWorkspace && editName.trim() && onRenameWorkspace) {
      onRenameWorkspace(editingWorkspace.id, editName.trim());
      setEditingWorkspace(null);
      setEditName('');
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace && onDeleteWorkspace) {
      const ok = window.confirm(`Supprimer l'espace "${workspace.name}" ?\nToutes les données locales de cet espace seront perdues.`);
      if (ok) {
        onDeleteWorkspace(workspaceId);
        if (currentWorkspaceId === workspaceId) {
          onChangeWorkspace?.('default');
        }
      }
    }
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    onChangeWorkspace?.(workspaceId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Espaces de travail
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Gérez vos espaces de travail et changez d'environnement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Création d'un nouvel espace */}
          <div className="space-y-3">
            <Label htmlFor="new-workspace" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Créer un nouvel espace
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-workspace"
                placeholder="Nom de l'espace"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
              <Button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim()}
                size="sm"
                className="px-4"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer
              </Button>
            </div>
          </div>

          {/* Liste des espaces existants */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Espaces disponibles
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workspaces.map((workspace) => {
                const isCurrent = workspace.id === currentWorkspaceId;
                const isEditing = editingWorkspace?.id === workspace.id;
                const isDefault = workspace.id === 'default';

                return (
                  <div
                    key={workspace.id}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      isCurrent
                        ? 'border-blue-300 dark:border-blue-600 bg-blue-50/80 dark:bg-blue-950/40'
                        : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameWorkspace()}
                          autoFocus
                        />
                        <Button
                          onClick={handleRenameWorkspace}
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingWorkspace(null);
                            setEditName('');
                          }}
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium truncate ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {workspace.name}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full">
                                  Actuel
                                </span>
                              )}
                              {isDefault && (
                                <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                                  Par défaut
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isCurrent && (
                            <Button
                              onClick={() => handleSelectWorkspace(workspace.id)}
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                            >
                              Sélectionner
                            </Button>
                          )}
                          
                          {!isDefault && onRenameWorkspace && (
                            <Button
                              onClick={() => {
                                setEditingWorkspace(workspace);
                                setEditName(workspace.name);
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Renommer"
                              aria-label="Renommer l'espace de travail"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {!isDefault && onDeleteWorkspace && (
                            <Button
                              onClick={() => handleDeleteWorkspace(workspace.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                              title="Supprimer"
                              aria-label="Supprimer l'espace de travail"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="rounded-xl"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

WorkspaceSelectorModal.displayName = 'WorkspaceSelectorModal';
