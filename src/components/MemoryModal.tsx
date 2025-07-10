import React, { useState, useRef, useEffect, useMemo } from "react";
import { useMemory, MemoryFact } from "@/hooks/useMemory";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Download } from "lucide-react";
import { toast } from "sonner";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function MemoryModal({ open, onClose }: MemoryModalProps) {
  const { memory, addFact, removeFact, editFact } = useMemory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newFact, setNewFact] = useState("");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleEdit = (fact: MemoryFact) => {
    setEditingId(fact.id);
    setEditValue(fact.content);
  };

  const handleEditSave = (id: string) => {
    if (editValue.trim()) {
      editFact(id, editValue.trim());
      setEditingId(null);
      toast.success("Information modifiée.");
    }
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFact.trim()) {
      addFact(newFact.trim());
      setNewFact("");
      toast.success("Information ajoutée à la mémoire.");
    }
  };

  const handleRemoveFact = (id: string) => {
    removeFact(id);
    toast.success("Information supprimée.");
  };

  const handleExport = () => {
    const data = JSON.stringify(memory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "memoire_utilisateur.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Mémoire exportée au format JSON.");
  };

  const filteredMemory = useMemo(() => {
    if (!search.trim()) return memory;
    return memory.filter(fact => fact.content.toLowerCase().includes(search.toLowerCase()));
  }, [memory, search]);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-0 overflow-hidden animate-fadeIn">
        <div className="flex flex-col items-center pt-6 pb-2 px-6">
          <BookOpen className="w-10 h-10 text-blue-500 mb-2 animate-bounce" />
          <h2 className="text-xl font-bold mb-1">Mémoire de l'utilisateur</h2>
          <p className="text-sm text-muted-foreground text-center mb-2">Ajoutez, modifiez ou supprimez les informations mémorisées par l'IA. Ces informations sont utilisées pour personnaliser vos réponses.</p>
        </div>
        <form onSubmit={handleAddFact} className="flex gap-2 px-6 mb-1">
          <Input
            ref={inputRef}
            value={newFact}
            onChange={e => setNewFact(e.target.value)}
            placeholder="Ajouter une information (ex : J'habite à Lyon)"
            className="flex-1 text-sm"
            maxLength={120}
            aria-label="Ajouter une information à la mémoire"
          />
          <Button type="submit" variant="default" disabled={!newFact.trim()} aria-label="Ajouter">
            Ajouter
          </Button>
        </form>
        <div className="text-xs text-muted-foreground px-6 mb-2">Exemple : "Je préfère le thé au café", "Je suis développeur", "J'habite à Paris"</div>
        <div className="flex items-center gap-2 px-6 mb-3">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la mémoire..."
            className="flex-1 text-xs"
            aria-label="Rechercher dans la mémoire"
          />
          <Button variant="outline" size="icon" onClick={handleExport} title="Exporter la mémoire" aria-label="Exporter la mémoire">
            <Download className="w-4 h-4" />
          </Button>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-60 overflow-y-auto px-6 pb-2">
          {filteredMemory.length === 0 && <div className="text-center text-muted-foreground py-6">Aucune information mémorisée.</div>}
          {filteredMemory.map(fact => (
            <div
              key={fact.id}
              className="flex items-center gap-2 py-2 group transition-all duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg animate-fadeIn"
            >
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
                    aria-label="Éditer l'information"
                  />
                  <Button size="sm" variant="secondary" onClick={() => handleEditSave(fact.id)} aria-label="Enregistrer">Enregistrer</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)} aria-label="Annuler">Annuler</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm select-text cursor-pointer" tabIndex={0} title={fact.content}>{fact.content}</span>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(fact)} aria-label="Éditer">Éditer</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRemoveFact(fact.id)} aria-label="Supprimer">Supprimer</Button>
                </>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4 flex justify-end px-6 pb-4">
          <Button onClick={onClose} variant="secondary" aria-label="Fermer">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 