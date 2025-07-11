import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

export function MemoryAddForm({ onAdd, inputRef, newFact, setNewFact }: { onAdd: (e: React.FormEvent) => void; inputRef: React.RefObject<HTMLInputElement>; newFact: string; setNewFact: (v: string) => void }) {
  return (
    <form onSubmit={onAdd} className="mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          ref={inputRef}
          value={newFact}
          onChange={e => setNewFact(e.target.value)}
          placeholder="Ajouter une information (ex : J'habite à Lyon)"
          className="flex-1 text-sm"
          maxLength={120}
          aria-label="Ajouter une information à la mémoire"
        />
        <Button 
          type="submit" 
          variant="default" 
          disabled={!newFact.trim()} 
          aria-label="Ajouter"
          className="px-4 sm:px-6 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Exemple : "Je préfère le thé au café", "Je suis développeur", "J'habite à Paris"
      </div>
    </form>
  );
} 