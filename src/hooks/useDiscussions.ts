import { useState, useEffect, useCallback } from 'react';
// ☁️ Service de synchronisation cloud
import cloudSyncService from '@/services/cloudSync';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Discussion {
  title: string;
  messages: Message[];
  childMode?: boolean;
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
  const loadHistory = useCallback(async () => {
    // Chargement local
    const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
    let discussions: Discussion[] = [];
    
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          discussions = parsed.map((msgs: Message[], idx: number) => ({
            title: `Discussion ${idx + 1}`,
            messages: msgs.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })),
            childMode: false,
          }));
        } else {
          discussions = parsed.map((d: any) => ({
            title: d.title || 'Discussion',
            messages: d.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })),
            childMode: !!d.childMode,
          }));
        }
      } catch {
        discussions = [];
      }
    }

    // ☁️ Chargement depuis le cloud si disponible
    if (cloudSyncService.isAvailable()) {
      try {
        const cloudResponse = await cloudSyncService.getConversations({ limit: 100 });
        if (cloudResponse.success && cloudResponse.data.conversations.length > 0) {
          // Fusionner les conversations locales et cloud
          const cloudDiscussions = cloudResponse.data.conversations.map(conv => ({
            title: conv.title,
            messages: [], // Les messages seront chargés à la demande
            childMode: conv.child_mode,
            cloudId: conv.id,
            lastUpdated: new Date(conv.updated_at)
          }));
          
          // TODO: Implémenter la logique de fusion intelligente
          // Pour l'instant, on garde les locales et on ajoute les cloud
          discussions = [...discussions, ...cloudDiscussions];
        }
      } catch (error) {
        console.warn('Erreur chargement cloud:', error);
      }
    }

    setHistory(discussions);
  }, []);

  // Sauvegarder une discussion dans l'historique
  const saveDiscussionToHistory = useCallback(async (discussion: Message[]) => {
    if (!discussion.length) return;
    
    // Sauvegarde locale
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
      const newDiscussion = { title: `Discussion ${historyArr.length + 1}`, messages: discussion, childMode: false };
      historyArr.push(newDiscussion);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(historyArr));
      setHistory(historyArr);

      // ☁️ Synchronisation cloud si disponible
      if (cloudSyncService.isAvailable()) {
        try {
          await cloudSyncService.createConversation({
            title: newDiscussion.title,
            initial_messages: newDiscussion.messages.map(msg => ({
              content: msg.text,
              is_user: msg.isUser,
              metadata: { timestamp: msg.timestamp.toISOString() }
            }))
          });
        } catch (error) {
          console.warn('Erreur synchronisation cloud:', error);
        }
      }
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

  // ☁️ Fonction de synchronisation manuelle avec le cloud
  const syncWithCloud = useCallback(async () => {
    if (!cloudSyncService.isAvailable()) {
      throw new Error('Service cloud non disponible');
    }

    try {
      // Charger les conversations du cloud
      const cloudResponse = await cloudSyncService.getConversations({ limit: 1000 });
      
      if (cloudResponse.success) {
        // TODO: Implémenter la logique de synchronisation bidirectionnelle complète
        // - Comparer les timestamps
        // - Résoudre les conflits
        // - Mettre à jour les conversations locales
        // - Envoyer les nouvelles conversations locales
        
        console.log('Synchronisation cloud réussie:', cloudResponse.data.conversations.length, 'conversations');
        return cloudResponse.data.conversations;
      }
    } catch (error) {
      console.error('Erreur synchronisation cloud:', error);
      throw error;
    }
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
    syncWithCloud,
  };
} 