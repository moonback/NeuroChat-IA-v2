import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function MemoryExamplesSection({ examples, setExamples }: { examples: string[]; setExamples: (ex: string[]) => void }) {
  const [newExample, setNewExample] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExample.trim()) {
      setExamples([...examples, newExample.trim()]);
      setNewExample("");
      inputRef.current?.focus();
    }
  };
  const handleRemove = (idx: number) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl p-3 sm:p-4 mb-3 shadow-inner border border-blue-100 dark:border-slate-600">
      <div className="font-semibold text-blue-700 dark:text-blue-200 mb-2 text-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Exemples pour la détection sémantique
      </div>
      {examples.length > 0 && (
        <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {examples.map((ex, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg shadow-sm text-xs flex items-center justify-between gap-2 border border-blue-100 dark:border-slate-600 hover:shadow-md transition-shadow">
              <span className="flex-1 truncate" title={ex}>{ex}</span>
              <button 
                type="button" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full transition-colors flex-shrink-0" 
                onClick={() => handleRemove(idx)} 
                title="Supprimer"
                aria-label={`Supprimer l'exemple "${ex}"`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <Input
          ref={inputRef}
          value={newExample}
          onChange={e => setNewExample(e.target.value)}
          placeholder="Ajouter un exemple..."
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          maxLength={80}
          aria-label="Ajouter un nouvel exemple"
        />
        <Button 
          type="submit" 
          size="sm" 
          variant="secondary" 
          disabled={!newExample.trim()}
          className="px-4 py-2 text-xs sm:px-6"
        >
          <span className="sr-only">Ajouter</span>
          +
        </Button>
      </form>
    </div>
  );
} 