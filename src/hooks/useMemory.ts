import { useState } from "react";

export interface MemoryFact {
  id: string;
  content: string;
  date: string;
}

const LOCALSTORAGE_KEY = "gemini_memory";

export function useMemory() {
  const [memory, setMemory] = useState<MemoryFact[]>(() => {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  const addFact = (content: string) => {
    const newFact: MemoryFact = {
      id: Date.now().toString(),
      content,
      date: new Date().toISOString(),
    };
    const updated = [...memory, newFact];
    setMemory(updated);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
  };

  const removeFact = (id: string) => {
    const updated = memory.filter(f => f.id !== id);
    setMemory(updated);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
  };

  const editFact = (id: string, newContent: string) => {
    const updated = memory.map(f => f.id === id ? { ...f, content: newContent } : f);
    setMemory(updated);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
  };

  return { memory, addFact, removeFact, editFact };
} 