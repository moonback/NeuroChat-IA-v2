import React, { useState } from "react";
import { useMemory, MemoryFact } from "@/hooks/useMemory";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function MemoryModal({ open, onClose }: MemoryModalProps) {
  const { memory, addFact, removeFact, editFact } = useMemory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newFact, setNewFact] = useState("");

  const handleEdit = (fact: MemoryFact) => {
    setEditingId(fact.id);
    setEditValue(fact.content);
  };

  const handleEditSave = (id: string) => {
    if (editValue.trim()) {
      editFact(id, editValue.trim());
      setEditingId(null);
    }
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFact.trim()) {
      addFact(newFact.trim());
      setNewFact("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6">
        <DialogHeader className="mb-4">
          <h2 className="text-xl font-bold mb-2">Mémoire de l'utilisateur</h2>
          <p className="text-sm text-muted-foreground">Voici les informations mémorisées par l'IA. Vous pouvez les modifier, les supprimer ou en ajouter.</p>
        </DialogHeader>
        {/* Formulaire d'ajout manuel */}
        <form onSubmit={handleAddFact} className="flex gap-2 mb-4">
          <Input
            value={newFact}
            onChange={e => setNewFact(e.target.value)}
            placeholder="Ajouter une information (ex : J'habite à Lyon)"
            className="flex-1 text-sm"
            maxLength={120}
            aria-label="Ajouter une information à la mémoire"
          />
          <Button type="submit" variant="default" disabled={!newFact.trim()}>Ajouter</Button>
        </form>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {memory.length === 0 && <div className="text-center text-muted-foreground">Aucune information mémorisée.</div>}
          {memory.map(fact => (
            <div key={fact.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              {editingId === fact.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="flex-1 text-sm"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter") handleEditSave(fact.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <Button size="sm" variant="secondary" onClick={() => handleEditSave(fact.id)}>Enregistrer</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{fact.content}</span>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(fact)}>Éditer</Button>
                  <Button size="sm" variant="destructive" onClick={() => removeFact(fact.id)}>Supprimer</Button>
                </>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 