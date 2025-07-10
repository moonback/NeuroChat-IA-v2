import React, { useState, useRef, useEffect, useMemo } from "react";
import { useMemory, MemoryFact } from "@/hooks/useMemory";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Download, Search, Plus, Edit3, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  examples: string[];
  setExamples: (ex: string[]) => void;
  semanticThreshold: number;
  setSemanticThreshold: (v: number) => void;
  semanticLoading?: boolean;
}

function PersonalInfoExamples({ examples, setExamples }: { examples: string[]; setExamples: (ex: string[]) => void }) {
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
        <input
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
          <Plus className="w-3 h-3 mr-1" />
          Ajouter
        </Button>
      </form>
    </div>
  );
}

export function MemoryModal({ open, onClose, examples, setExamples, semanticThreshold, setSemanticThreshold, semanticLoading }: MemoryModalProps) {
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

  const filteredMemory = useMemo(() => {
    if (!search.trim()) return memory;
    return memory.filter(fact => fact.content.toLowerCase().includes(search.toLowerCase()));
  }, [memory, search]);

  return (
    <Drawer open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DrawerContent className="max-w-full w-[95vw] sm:w-[100%] px-2 py-2 animate-fadeIn">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full shadow">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <DrawerTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              Mémoire de l'utilisateur
            </DrawerTitle>
          </div>
          <div className="text-xs text-muted-foreground text-center max-w-xs mx-auto mt-1">
            Ajoutez, modifiez ou supprimez les informations mémorisées par l'IA. Ces informations sont utilisées pour personnaliser vos réponses.
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-2 sm:py-4" style={{ maxHeight: '70vh' }}>
          {/* Gestion des exemples */}
          <PersonalInfoExamples examples={examples} setExamples={setExamples} />
          {/* Seuil de similarité */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl p-3 sm:p-4 mb-4 shadow-inner border border-blue-100 dark:border-slate-600">
            <label htmlFor="semantic-threshold" className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-200 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Seuil de similarité sémantique : <span className="font-mono bg-blue-100 dark:bg-blue-900/60 px-2 py-1 rounded text-xs">{semanticThreshold}</span>
            </label>
            <input
              id="semantic-threshold"
              type="range"
              min={0.5}
              max={0.95}
              step={0.01}
              value={semanticThreshold}
              onChange={e => setSemanticThreshold(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-muted-foreground mt-1">Plus le seuil est élevé, plus la détection est stricte.</div>
            {semanticLoading && (
              <div className="flex items-center gap-2 mt-2 bg-blue-100 dark:bg-blue-900/60 rounded-lg px-3 py-2 animate-pulse">
                <svg className="animate-spin w-4 h-4 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-xs">Analyse sémantique en cours...</span>
              </div>
            )}
          </div>
          {/* Formulaire d'ajout */}
          <form onSubmit={handleAddFact} className="mb-4">
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
          {/* Barre de recherche et export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher dans la mémoire..."
                className="pl-10 text-sm"
                aria-label="Rechercher dans la mémoire"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport} 
              title="Exporter la mémoire" 
              aria-label="Exporter la mémoire"
              className="px-3 sm:px-4"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
          </div>
          {/* Liste des faits */}
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
        </div>
        <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
          <div className="flex-1 text-xs text-muted-foreground flex items-center">
            {filteredMemory.length} information{filteredMemory.length > 1 ? 's' : ''} mémorisée{filteredMemory.length > 1 ? 's' : ''}
          </div>
          <Button onClick={onClose} variant="secondary" aria-label="Fermer" className="px-6">
            Fermer
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}