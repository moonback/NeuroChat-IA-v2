import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Discussion {
  title: string;
  messages: Message[];
}

const LOCALSTORAGE_KEY = 'gemini_discussions';
const LOCALSTORAGE_CURRENT = 'gemini_current_discussion';

export function useDiscussions() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Discussion[]>([]);

  // Charger la discussion courante au démarrage
  useEffect(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_CURRENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      } catch {
        setMessages([]);
      }
    }
  }, []);

  // Sauvegarder la discussion courante à chaque changement
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify(messages));
  }, [messages]);

  // Charger l'historique
  const loadHistory = useCallback(() => {
    const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        let discussions: Discussion[];
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          discussions = parsed.map((msgs: Message[], idx: number) => ({
            title: `Discussion ${idx + 1}`,
            messages: msgs.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })),
          }));
        } else {
          discussions = parsed.map((d: any) => ({
            title: d.title || 'Discussion',
            messages: d.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })),
          }));
        }
        setHistory(discussions);
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, []);

  // Sauvegarder une discussion dans l'historique
  const saveDiscussionToHistory = useCallback((discussion: Message[]) => {
    if (!discussion.length) return;
    const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
    let historyArr: Discussion[] = [];
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          historyArr = parsed.map((msgs: Message[], idx: number) => ({
            title: `Discussion ${idx + 1}`,
            messages: msgs,
          }));
        } else {
          historyArr = parsed;
        }
      } catch {}
    }
    const isSame = (a: Message[], b: Message[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].text !== b[i].text || a[i].isUser !== b[i].isUser) return false;
      }
      return true;
    };
    if (historyArr.length === 0 || !isSame(historyArr[historyArr.length - 1].messages, discussion)) {
      historyArr.push({ title: `Discussion ${historyArr.length + 1}`, messages: discussion });
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(historyArr));
      setHistory(historyArr);
    }
  }, []);

  // Nouvelle discussion
  const newDiscussion = useCallback(() => {
    if (messages.length > 0) {
      saveDiscussionToHistory(messages);
    }
    setMessages([]);
    localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify([]));
  }, [messages, saveDiscussionToHistory]);

  // Charger une discussion
  const loadDiscussion = useCallback((discussion: Discussion) => {
    setMessages(discussion.messages);
    localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify(discussion.messages));
  }, []);

  // Supprimer une discussion
  const deleteDiscussion = useCallback((idx: number) => {
    const newHistory = [...history];
    newHistory.splice(idx, 1);
    setHistory(newHistory);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newHistory));
  }, [history]);

  // Renommer une discussion
  const renameDiscussion = useCallback((idx: number, newTitle: string) => {
    const newHistory = [...history];
    newHistory[idx] = { ...newHistory[idx], title: newTitle || `Discussion ${idx + 1}` };
    setHistory(newHistory);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newHistory));
  }, [history]);

  // Ajouter un message
  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  return {
    messages,
    setMessages,
    history,
    loadHistory,
    saveDiscussionToHistory,
    newDiscussion,
    loadDiscussion,
    deleteDiscussion,
    renameDiscussion,
    addMessage,
  };
} 