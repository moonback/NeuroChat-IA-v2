import React, { useState, useRef, useEffect } from "react";
import { useMemory, MemoryFact } from "@/hooks/useMemory";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { toast } from "sonner";
import { MemoryFactList } from "./MemoryFactList";
import { MemoryModalHeader } from "./MemoryModalHeader";
import { MemoryExamplesSection } from "./MemoryExamplesSection";
import { MemoryThresholdSection } from "./MemoryThresholdSection";
import { MemoryAddForm } from "./MemoryAddForm";
import { MemorySearchExportBar } from "./MemorySearchExportBar";
import { MemoryModalFooter } from "./MemoryModalFooter";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  examples: string[];
  setExamples: (ex: string[]) => void;
  semanticThreshold: number;
  setSemanticThreshold: (v: number) => void;
  semanticLoading?: boolean;
}

export function MemoryModal({ open, onClose, examples, setExamples, semanticThreshold, setSemanticThreshold, semanticLoading }: MemoryModalProps) {
  const { memory, addFact, removeFact, editFact } = useMemory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newFact, setNewFact] = useState("");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showExamples] = useState(false);

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
    }
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFact.trim()) {
      addFact(newFact.trim());
      setNewFact("");
    }
  };

  const handleRemoveFact = (id: string) => {
    removeFact(id);
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
    toast.success("Mémoire exportée avec succès!");
  };

  return (
    <Drawer open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DrawerContent className="max-w-full w-[95vw] sm:w-[100%] px-2 py-2 animate-fadeIn">
        <div className="flex items-center justify-between mb-2">
          <MemoryModalHeader />
          
        </div>
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-2 sm:py-4" style={{ maxHeight: '70vh' }}>
          {showExamples && (
            <div id="memory-examples-section">
              <MemoryExamplesSection examples={examples} setExamples={setExamples} />
            </div>
          )}
          <MemoryThresholdSection semanticThreshold={semanticThreshold} setSemanticThreshold={setSemanticThreshold} semanticLoading={semanticLoading} />
          <MemoryAddForm onAdd={handleAddFact} inputRef={inputRef} newFact={newFact} setNewFact={setNewFact} />
          <MemorySearchExportBar search={search} setSearch={setSearch} onExport={handleExport} />
          <MemoryFactList
            memory={memory}
            editingId={editingId}
            editValue={editValue}
            setEditValue={setEditValue}
            setEditingId={setEditingId}
            handleEditSave={handleEditSave}
            handleEdit={handleEdit}
            handleRemoveFact={handleRemoveFact}
            search={search}
          />
        </div>
        <MemoryModalFooter count={memory.length} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
}