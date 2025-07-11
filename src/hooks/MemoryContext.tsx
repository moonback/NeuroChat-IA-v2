import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface MemoryFact {
  id: string;
  content: string;
  date: string;
  category?: string;
}

const LOCALSTORAGE_KEY = "gemini_memory";

interface MemoryContextType {
  memory: MemoryFact[];
  addFact: (content: string, category?: string) => void;
  removeFact: (id: string) => void;
  editFact: (id: string, newContent: string, category?: string) => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memory, setMemory] = useState<MemoryFact[]>([]);

  // Chargement initial
  useEffect(() => {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    setMemory(raw ? JSON.parse(raw) : []);
  }, []);

  // Sauvegarde à chaque modification
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(memory));
  }, [memory]);

  const addFact = useCallback((content: string, category?: string) => {
    setMemory(prev => [
      ...prev,
      { id: Date.now().toString(), content, date: new Date().toISOString(), category }
    ]);
  }, []);

  const removeFact = useCallback((id: string) => {
    setMemory(prev => prev.filter(f => f.id !== id));
  }, []);

  const editFact = useCallback((id: string, newContent: string, category?: string) => {
    setMemory(prev => prev.map(f => f.id === id ? { ...f, content: newContent, category } : f));
  }, []);

  return (
    <MemoryContext.Provider value={{ memory, addFact, removeFact, editFact }}>
      {children}
    </MemoryContext.Provider>
  );
};

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error("useMemory doit être utilisé dans MemoryProvider");
  return ctx;
} 