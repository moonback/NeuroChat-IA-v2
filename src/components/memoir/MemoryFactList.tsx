import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Edit3, Trash2, Save, X } from "lucide-react";
import type { MemoryFact } from "@/hooks/useMemory";

export interface MemoryFactListProps {
  memory: MemoryFact[];
  editingId: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  setEditingId: (v: string | null) => void;
  handleEditSave: (id: string) => void;
  handleEdit: (fact: MemoryFact) => void;
  handleRemoveFact: (id: string) => void;
  search: string;
}

export function MemoryFactList({ memory, editingId, editValue, setEditValue, setEditingId, handleEditSave, handleEdit, handleRemoveFact, search }: MemoryFactListProps) {
  const filteredMemory = useMemo(() => {
    if (!search.trim()) return memory;
    return memory.filter(fact => fact.content.toLowerCase().includes(search.toLowerCase()));
  }, [memory, search]);
  return (
    <div className="space-y-2">
      {filteredMemory.length === 0 && (
        <div className="text-center text-muted-foreground py-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Aucune information mémorisée.</p>
        </div>
      )}
      {filteredMemory.map(fact => (
        <div
          key={fact.id}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500 animate-fadeIn"
        >
          {editingId === fact.id ? (
            <div className="space-y-2">
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="text-sm"
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter") handleEditSave(fact.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                aria-label="Éditer l'information"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={() => handleEditSave(fact.id)} 
                  aria-label="Enregistrer"
                  className="flex-1 sm:flex-none"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Enregistrer
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setEditingId(null)} 
                  aria-label="Annuler"
                  className="flex-1 sm:flex-none"
                >
                  <X className="w-3 h-3 mr-1" />
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <span className="flex-1 text-sm leading-relaxed select-text cursor-pointer break-words" tabIndex={0} title={fact.content}>
                {fact.content}
              </span>
              <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleEdit(fact)} 
                  aria-label="Éditer"
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleRemoveFact(fact.id)} 
                  aria-label="Supprimer"
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 