import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { sendMessageToGemini, GeminiGenerationConfig } from '@/services/geminiApi';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { toast } from 'sonner';
// Lazy-loaded components pour réduire le bundle initial
const TTSSettingsModalLazy = lazy(() => import('@/components/TTSSettingsModal').then(m => ({ default: m.TTSSettingsModal })));
import { Header } from '@/components/Header';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { searchDocuments } from '@/services/ragSearch';
const RagDocsModalLazy = lazy(() => import('@/components/RagDocsModal').then(m => ({ default: m.RagDocsModal })));
const HistoryModalLazy = lazy(() => import('@/components/HistoryModal').then(m => ({ default: m.HistoryModal })));
const MemoryModalLazy = lazy(() => import('@/components/MemoryModal').then(m => ({ default: m.MemoryModal })));
import type { DiscussionWithCategory } from '@/components/HistoryModal';

import { SYSTEM_PROMPT } from './services/geminiSystemPrompt';
import { getRelevantMemories, upsertMany } from '@/services/memory';
import { extractFactsFromText } from '@/services/memoryExtractor';
const GeminiSettingsDrawerLazy = lazy(() => import('@/components/GeminiSettingsDrawer').then(m => ({ default: m.GeminiSettingsDrawer })));
// Retrait du sélecteur de personnalités

import { PrivateModeBanner } from '@/components/PrivateModeBanner';
import { VocalModeIndicator } from '@/components/VocalModeIndicator';

import { type ReasoningStep } from '@/components/ReasoningTimeline';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  memoryFactsCount?: number;
}

interface Discussion {
  title: string;
  messages: Message[];
}

// Ajout d'un type spécial pour les messages contextuels RAG
type RagContextMessage = {
  id: string;
  passages: { id: number; titre: string; contenu: string }[];
  isRagContext: true;
  timestamp: Date;
};

// Mémoire utilisateur supprimée

// Similarité: vecteurs normalisés => cosinus = dot product

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const {
    speak,
    muted,
    mute,
    unmute,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    voiceURI,
    setVoiceURI,
    availableVoices,
    testVoice,
    resetSettings,
    exportSettings,
    importSettings,
    deleteSettings,
    stop,
  } = useSpeechSynthesis();
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<DiscussionWithCategory[]>([]);
  
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  
  // Personnalités retirées
  // Ajout du state pour le mode vocal automatique
  const [modeVocalAuto, setModeVocalAuto] = useState(false);
  // Ajout du state pour la modale de gestion des documents RAG
  const [showRagDocs, setShowRagDocs] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  // Ajout du state pour activer/désactiver le RAG
  const [ragEnabled, setRagEnabled] = useState(false);
  // --- Sélection multiple de messages pour suppression groupée ---
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [showConfirmDeleteMultiple, setShowConfirmDeleteMultiple] = useState(false);

  // Hyperparamètres Gemini
  const [geminiConfig, setGeminiConfig] = useState<GeminiGenerationConfig>({
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
  });
  const [showGeminiSettings, setShowGeminiSettings] = useState(false);
  // Gestion des presets Gemini
  const [presets, setPresets] = useState<{ name: string; config: GeminiGenerationConfig }[]>([]);

  // --- Mode privé/éphémère ---
  const [modePrive, setModePrive] = useState(false);
  // --- Timeline de raisonnement ---
  const [reasoningVisible, setReasoningVisible] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  // Affichage d'un toast d'avertissement lors de l'activation
  useEffect(() => {
    if (modePrive) {
      // toast.warning('Mode privé activé : les messages ne seront pas sauvegardés et seront effacés à la fermeture.');
    }
  }, [modePrive]);

  // --- Gestion de l'historique des discussions ---
  const LOCALSTORAGE_KEY = 'gemini_discussions';
  const LOCALSTORAGE_CURRENT = 'gemini_current_discussion';

  // Valeurs par défaut pour badge et reset individuel
  const DEFAULTS = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
    stopSequences: [],
    candidateCount: 1,
  };

  // Charger la dernière discussion au démarrage
  useEffect(() => {
    if (modePrive) {
      setMessages([]);
      return;
    }
    const saved = localStorage.getItem(LOCALSTORAGE_CURRENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      } catch {
        setMessages([]);
      }
    }
  }, [modePrive]);

  // Sauvegarder la discussion courante à chaque changement
  useEffect(() => {
    if (modePrive) return; // Pas de sauvegarde en mode privé
    localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify(messages));
  }, [messages, modePrive]);

  // Charger les presets au montage
  useEffect(() => {
    const raw = localStorage.getItem('gemini_presets');
    if (raw) {
      try {
        setPresets(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // Sauvegarder les presets à chaque modification
  useEffect(() => {
    localStorage.setItem('gemini_presets', JSON.stringify(presets));
  }, [presets]);

  // Sauvegarder une discussion dans l'historique (sans doublons consécutifs)
  const saveDiscussionToHistory = (discussion: Message[]) => {
    if (modePrive) return; // Pas de sauvegarde en mode privé
    if (!discussion.length) return;
    const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
    let history: Discussion[] = [];
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        // Migration si ancien format (Message[][])
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          history = parsed.map((msgs: Message[], idx: number) => ({
            title: `Discussion ${idx + 1}`,
            messages: msgs,
          }));
        } else {
          history = parsed;
        }
      } catch {}
    }
    // Vérifier si la dernière discussion est identique
    const isSame = (a: Message[], b: Message[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].text !== b[i].text || a[i].isUser !== b[i].isUser) return false;
      }
      return true;
    };
    if (history.length === 0 || !isSame(history[history.length - 1].messages, discussion)) {
      history.push({ title: `Discussion ${history.length + 1}`, messages: discussion });
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(history));
    }
  };

  // Nouvelle discussion
  const handleNewDiscussion = () => {
    if (!modePrive && messages.length > 0) {
      saveDiscussionToHistory(messages);
    }
    setMessages([]);
    if (!modePrive) localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify([]));
  };

  // Sauvegarde automatique à la fermeture/rafraîchissement de la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modePrive && messages.length > 0) {
        e.preventDefault();
        e.returnValue = 'Êtes-vous sûr de vouloir quitter ? Les messages privés seront effacés.';
        return 'Êtes-vous sûr de vouloir quitter ? Les messages privés seront effacés.';
      }
      if (!modePrive && messages.length > 0) {
        saveDiscussionToHistory(messages);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages, modePrive]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addMessage = (text: string, isUser: boolean, imageFile?: File): Message => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  // Prompt système unique (personnalités retirées)
  const getSystemPrompt = () => SYSTEM_PROMPT;

  const addRagContextMessage = (passages: { id: number; titre: string; contenu: string }[]) => {
    const ragMsg: RagContextMessage = {
      id: 'rag-' + Date.now(),
      passages,
      isRagContext: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, ragMsg as any]);
  };

  // --- Mémoire utilisateur ---

  const handleSendMessage = async (userMessage: string, imageFile?: File) => {
    // Préparer la timeline de raisonnement
    setReasoningVisible(true);
    const initialSteps: ReasoningStep[] = [
      ...(ragEnabled
        ? [{ key: 'rag', label: 'Recherche contextuelle (RAG)', status: 'running', start: performance.now(), detail: 'Analyse des documents…' } as ReasoningStep]
        : []),
      { key: 'buildPrompt', label: 'Construction du prompt', status: 'idle' },
      { key: 'callLLM', label: 'Appel du modèle', status: 'idle' },
      { key: 'tts', label: 'Synthèse vocale', status: 'idle' },
    ];
    setReasoningSteps(initialSteps);

    let ragStart = ragEnabled ? performance.now() : 0;
    let promptStart = 0;
    let llmStart = 0;
    let ttsStart = 0;
    // Arrêter immédiatement la reconnaissance vocale pour éviter qu'elle capte le TTS
    if (modeVocalAuto && listeningAuto) {
      stopAuto();
      resetAuto();
      // Nettoyer le timeout si il existe
      if (autoVoiceTimeout) {
        clearTimeout(autoVoiceTimeout);
        setAutoVoiceTimeout(null);
      }
      setTempTranscriptAuto('');
    }
    
    // Mémoire utilisateur retirée
    if (!isOnline) {
      toast.error('Pas de connexion Internet. Vérifie ta connexion réseau.');
      return;
    }
    // Étape RAG : recherche documentaire (seulement si activé)
    let passages: { id: number; titre: string; contenu: string }[] = [];
    if (ragEnabled) {
      passages = await searchDocuments(userMessage, 3);
      const ragEnd = performance.now();
      setReasoningSteps(prev => prev.map(s => s.key === 'rag' ? ({ ...s, status: 'done', end: ragEnd, durationMs: Math.round(ragEnd - (s.start || ragStart)), detail: `${passages.length} passage(s)` }) : s));
      if (passages.length > 0) {
        addRagContextMessage(passages);
      }
    }
    // Ajoute le message utilisateur localement
    const newMessage = addMessage(userMessage, true, imageFile);
    // Extraire et mémoriser immédiatement les faits utilisateur (indépendant du LLM)
    try {
      const userFacts = extractFactsFromText(userMessage, { source: 'user' });
      if (!modePrive && userFacts.length > 0) {
        upsertMany(userFacts.map((f) => ({ content: f.content, tags: f.tags, importance: f.importance, source: f.source })));
        // Marquer le message avec l'indicateur
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, memoryFactsCount: userFacts.length } : m));
      }
    } catch {}
    setIsLoading(true);
    try {
      // On prépare l'historique complet (y compris le message utilisateur tout juste ajouté)
      const fullHistory = [...messages, newMessage];
      // On ne garde que les messages qui ont un champ text (donc pas les messages RAG)
      const filteredHistory = fullHistory.filter(m => typeof m.text === 'string');
      // On construit le contexte documentaire pour le prompt
      setReasoningSteps(prev => prev.map(s => s.key === 'buildPrompt' ? ({ ...s, status: 'running', start: performance.now(), detail: 'Assemblage du contexte…' }) : s));
      promptStart = performance.now();
      let ragContext = '';
      let memoryContext = '';
      // Récupération mémoire pertinente
      try {
        const memItems = await getRelevantMemories(userMessage, 5);
        if (memItems.length > 0) {
          memoryContext = 'MÉMOIRE UTILISATEUR (faits importants connus):\n';
          memItems.forEach((m) => {
            memoryContext += `- ${m.content}\n`;
          });
          memoryContext += '\n';
        }
      } catch {}
      if (ragEnabled && passages.length > 0) {
        ragContext = 'Contexte documentaire :\n';
        passages.forEach((p) => {
          ragContext += `- [${p.titre}] ${p.contenu}\n`;
        });
        ragContext += '\n';
      }
      // Injection de la date et heure actuelle
      const now = new Date();
      const dateTimeInfo = `INFORMATIONS TEMPORELLES :\nDate et heure actuelles : ${now.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}\n\n`;

      // Important: ne pas inclure à nouveau la question utilisateur dans le prompt système
      // pour éviter qu'elle soit envoyée deux fois au modèle.
      const prompt = `${getSystemPrompt()}\n${dateTimeInfo}${memoryContext}${ragEnabled ? ragContext : ""}`;
      const promptEnd = performance.now();
      setReasoningSteps(prev => prev.map(s => s.key === 'buildPrompt' ? ({ ...s, status: 'done', end: promptEnd, durationMs: Math.round(promptEnd - (s.start || promptStart)), detail: `${prompt.length} caractères` }) : s));
      // LOG prompt final
      // console.log('[Prompt envoyé à Gemini]', prompt);
      setReasoningSteps(prev => prev.map(s => s.key === 'callLLM' ? ({ ...s, status: 'running', start: performance.now(), detail: 'Appel en cours…' }) : s));
      llmStart = performance.now();
      const response = await sendMessageToGemini(
        filteredHistory.map(m => ({ text: m.text, isUser: m.isUser })),
        imageFile ? [imageFile] : undefined,
        prompt,
        geminiConfig
      );
      const llmEnd = performance.now();
      setReasoningSteps(prev => prev.map(s => s.key === 'callLLM' ? ({ ...s, status: 'done', end: llmEnd, durationMs: Math.round(llmEnd - (s.start || llmStart)), detail: `${response.length} caractères` }) : s));
      // LOG réponse Gemini
      // console.log('[Réponse Gemini]', response);
      addMessage(response, false);
      
      // Indiquer que l'IA commence à parler
      setIsAISpeaking(true);
      setReasoningSteps(prev => prev.map(s => s.key === 'tts' ? ({ ...s, status: 'running', start: performance.now(), detail: 'Lecture de la réponse…' }) : s));
      ttsStart = performance.now();
      console.log('[Vocal Mode] IA commence à parler - microphone coupé');
      
      speak(response, {
        onEnd: () => {
          // Indiquer que l'IA a fini de parler
          setIsAISpeaking(false);
          const ttsEnd = performance.now();
          setReasoningSteps(prev => prev.map(s => s.key === 'tts' ? ({ ...s, status: 'done', end: ttsEnd, durationMs: Math.round(ttsEnd - (s.start || ttsStart)) }) : s));
          setTimeout(() => setReasoningVisible(false), 3000);
          console.log('[Vocal Mode] IA a fini de parler - préparation redémarrage microphone');
          
          // Utiliser les références pour éviter les valeurs obsolètes
          if (modeVocalAutoRef.current && !muted) {
            playBip();
            // Ajouter une pause de sécurité avant de redémarrer l'écoute
            setTimeout(() => {
              // Vérifications supplémentaires avec les références actuelles
              if (modeVocalAutoRef.current && !muted && !listeningAuto && !isAISpeakingRef.current) {
                console.log('[Vocal Mode] Redémarrage du microphone après pause de sécurité');
                startAuto();
              } else {
                console.log('[Vocal Mode] Redémarrage annulé - mode vocal désactivé manuellement');
              }
            }, 2000); // 2 secondes de pause pour être sûr que le TTS s'est arrêté
          }
        }
      });
      // toast.success('Réponse reçue !', { duration: 2000 });
    } catch (error) {
      setReasoningSteps(prev => prev.map(s => s.key === 'callLLM' && s.status === 'running' ? ({ ...s, status: 'error', end: performance.now(), durationMs: Math.round(performance.now() - (s.start || llmStart)), detail: 'Erreur lors de l\'appel' }) : s));
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Impossible d'obtenir une réponse de Gemini. Réessaie.";
      addMessage(`Désolé, j'ai rencontré une erreur : ${errorMessage}`, false);
      toast.error(errorMessage, {
        action: {
          label: 'Réessayer',
          onClick: () => handleSendMessage(userMessage, imageFile),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger l'historique au démarrage ou à l'ouverture du menu
  const loadHistory = () => {
    const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        // Migration si ancien format (Message[][])
        let discussions: Discussion[];
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          discussions = parsed.map((msgs: Message[]) => ({
            title: `Discussion`,
            messages: msgs.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })),
          }));
        } else {
          discussions = parsed.map((d: any) => ({
            title: d.title || 'Discussion',
            messages: d.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })),
          }));
        }
        setHistoryList(discussions.map((d: Discussion) => ({
          ...d,
          category: 'Discussion',
        })));
      } catch {
        setHistoryList([]);
      }
    } else {
      setHistoryList([]);
    }
  };

  // Ouvre le menu historique
  const handleOpenHistory = () => {
    loadHistory();
    setShowHistory(true);
  };
  const handleCloseHistory = () => setShowHistory(false);

  // Recharger une discussion
  const handleLoadDiscussion = (discussion: DiscussionWithCategory) => {
    setMessages(discussion.messages);
    localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify(discussion.messages));
    setShowHistory(false);
  };

  // Supprimer une discussion
  const handleDeleteDiscussion = (idx: number) => {
    const newHistory = [...historyList];
    newHistory.splice(idx, 1);
    setHistoryList(newHistory);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newHistory));
  };

  // Renommer une discussion (compatible avec le nouveau composant)
  const handleRenameDiscussion = (idx: number, newTitle: string) => {
    const newHistory = [...historyList];
    newHistory[idx] = { ...newHistory[idx], title: newTitle || `Discussion ${idx + 1}` };
    setHistoryList(newHistory);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newHistory));
  };

  // Ajout d'un toast lors de la réinitialisation
  const handleResetSettings = () => {
    resetSettings();
    toast.success('Réglages réinitialisés.');
  };



  // État pour gérer le délai d'attente du mode vocal auto
  const [autoVoiceTimeout, setAutoVoiceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tempTranscriptAuto, setTempTranscriptAuto] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const isAISpeakingRef = useRef(false);
  const modeVocalAutoRef = useRef(false);
  
  // Mettre à jour les références quand les états changent
  useEffect(() => {
    isAISpeakingRef.current = isAISpeaking;
  }, [isAISpeaking]);
  
  useEffect(() => {
    modeVocalAutoRef.current = modeVocalAuto;
  }, [modeVocalAuto]);

  // Hook reconnaissance vocale (mode vocal auto)
  const {
    listening: listeningAuto,
    start: startAuto,
    stop: stopAuto,
    reset: resetAuto,
    isSupported: isSupportedAuto,
  } = useSpeechRecognition({
    interimResults: true,
    lang: 'fr-FR',
    continuous: true, // Mode continu pour ne pas s'arrêter pendant les pauses
    onResult: (finalText) => {
      // Ne traiter que si le mode vocal auto est actif et l'IA ne parle pas
      if (modeVocalAutoRef.current && !isAISpeakingRef.current) {
        setTempTranscriptAuto(finalText);
        
        // Annuler le timeout précédent
        if (autoVoiceTimeout) {
          clearTimeout(autoVoiceTimeout);
        }
        
        // Créer un nouveau timeout de 3 secondes
        const timeout = setTimeout(() => {
          if (finalText && finalText.trim().length > 0 && !isAISpeakingRef.current && modeVocalAutoRef.current) {
            console.log('[Vocal Mode] Envoi automatique du message:', finalText.trim());
            handleSendMessage(finalText.trim());
            setTempTranscriptAuto('');
            resetAuto();
          } else if (isAISpeakingRef.current) {
            console.log('[Vocal Mode] Message ignoré car IA en train de parler');
          }
        }, 3000); // 3 secondes d'attente après la dernière parole
        
        setAutoVoiceTimeout(timeout);
      }
    },
    onEnd: (finalText) => {
      // Ne plus envoyer automatiquement ici - c'est géré par le timeout
      if (modeVocalAutoRef.current && finalText && !isAISpeakingRef.current) {
        setTempTranscriptAuto(finalText);
      }
    },
  });

  // Fonction utilitaire pour jouer un bip sonore
  function playBip() {
    const audio = new Audio('/bip.wav');
    audio.volume = 0.5;
    audio.play();
  }

  // Effet : démarrer/arrêter la reco vocale auto selon le mode
  useEffect(() => {
    if (modeVocalAuto) {
      if (!listeningAuto && isSupportedAuto && !isAISpeaking) {
        playBip();
        startAuto();
      }
    } else {
      if (listeningAuto) {
        stopAuto();
        resetAuto();
      }
      // Nettoyer le timeout quand on désactive le mode
      if (autoVoiceTimeout) {
        clearTimeout(autoVoiceTimeout);
        setAutoVoiceTimeout(null);
      }
      setTempTranscriptAuto('');
      setIsAISpeaking(false); // Nettoyer l'état de l'IA qui parle
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeVocalAuto, isAISpeaking]);

  // Effet : arrêter immédiatement la reconnaissance vocale quand l'IA commence à parler
  useEffect(() => {
    if (isAISpeaking && listeningAuto) {
      console.log('[Vocal Mode] Arrêt du microphone car IA en train de parler');
      stopAuto();
      resetAuto();
      // Nettoyer le timeout
      if (autoVoiceTimeout) {
        clearTimeout(autoVoiceTimeout);
        setAutoVoiceTimeout(null);
      }
      setTempTranscriptAuto('');
    }
  }, [isAISpeaking]); // Simplifier les dépendances

  // Si l'utilisateur mute ou stop la voix, désactive le mode vocal auto
  useEffect(() => {
    if (modeVocalAuto && muted) {
      setModeVocalAuto(false);
      stopAuto();
      resetAuto();
      // Nettoyer le timeout
      if (autoVoiceTimeout) {
        clearTimeout(autoVoiceTimeout);
        setAutoVoiceTimeout(null);
      }
      setTempTranscriptAuto('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  // Supprimer plusieurs discussions d'un coup (filtrage)
  const handleDeleteMultipleDiscussions = (indices: number[]) => {
    const indicesSet = new Set(indices);
    const newHistory = historyList.filter((_, idx) => !indicesSet.has(idx));
    setHistoryList(newHistory);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newHistory));
  };

  // Fonction pour supprimer un message par son id
  const handleDeleteMessage = (id: string) => {
    setMessages(prev => {
      const updated = prev.filter(msg => msg.id !== id);
      localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify(updated));
      // Mise à jour de l'historique : on retire le message de chaque discussion
      const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
      if (historyRaw) {
        try {
          const history = JSON.parse(historyRaw);
          const updatedHistory = history.map((discussion: any) => ({
            ...discussion,
            messages: discussion.messages.filter((msg: any) => msg.id !== id)
          }));
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedHistory));
        } catch {}
      }
      return updated;
    });
  };

  // Handler pour activer/désactiver le mode sélection
  const handleToggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedMessageIds([]); // On vide la sélection si on quitte le mode
      return !prev;
    });
  };

  // Handler pour sélectionner/désélectionner un message
  const handleSelectMessage = (id: string) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  // Handler pour supprimer plusieurs messages
  const handleDeleteMultipleMessages = () => {
    setMessages((prev) => {
      const updated = prev.filter((msg) => !selectedMessageIds.includes(msg.id));
      localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify(updated));
      // Mise à jour de l'historique : on retire les messages de chaque discussion
      const historyRaw = localStorage.getItem(LOCALSTORAGE_KEY);
      if (historyRaw) {
        try {
          const history = JSON.parse(historyRaw);
          const updatedHistory = history.map((discussion: any) => ({
            ...discussion,
            messages: discussion.messages.filter((msg: any) => !selectedMessageIds.includes(msg.id))
          }));
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedHistory));
        } catch {}
      }
      return updated;
    });
    setSelectedMessageIds([]);
    setSelectMode(false);
    setShowConfirmDeleteMultiple(false);
  };



  // Handler pour modifier un hyperparamètre Gemini
  const handleGeminiConfigChange = (key: keyof GeminiGenerationConfig, value: any) => {
    setGeminiConfig(cfg => ({ ...cfg, [key]: value }));
  };

  // Mémoire utilisateur supprimée: exemples retirés
  // Seuil de similarité ajustable
  // Mémoire utilisateur supprimée
  // Mémoire utilisateur supprimée

  // Mémoire utilisateur supprimée

  // Cache en mémoire des embeddings d'exemples { texteExemple: embedding }
  // Mémoire utilisateur supprimée

  // Charger le cache depuis localStorage et préchauffer l'embedder en idle
  // Mémoire utilisateur supprimée

  // Sauvegarde du cache d'embeddings en localStorage (debounced léger)
  // Mémoire utilisateur supprimée

  // Pré-calculer en arrière-plan les embeddings manquants pour les exemples (normalisés)
  // Mémoire utilisateur supprimée

  // Fonction asynchrone pour juger la pertinence sémantique (utilise les exemples et seuil du state)
  // Mémoire utilisateur supprimée

  // Nettoyer le timeout à la fermeture du composant
  useEffect(() => {
    return () => {
      if (autoVoiceTimeout) {
        clearTimeout(autoVoiceTimeout);
      }
    };
  }, [autoVoiceTimeout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Menu historique des discussions */}
      <Suspense fallback={null}>
        <HistoryModalLazy
          open={showHistory}
          onClose={handleCloseHistory}
          history={historyList}
          onLoad={handleLoadDiscussion}
          onDelete={handleDeleteDiscussion}
          onRename={handleRenameDiscussion}
          onDeleteMultiple={handleDeleteMultipleDiscussions}
        />
      </Suspense>

      <div className="w-full max-w-12xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col relative z-10">
        {/* Header compact performant */}
        <Header
          muted={muted}
          onMute={mute}
          onUnmute={unmute}
          onNewDiscussion={handleNewDiscussion}
          onOpenHistory={handleOpenHistory}
          onOpenTTSSettings={() => setShowTTSSettings(true)}
          onOpenRagDocs={() => setShowRagDocs(true)}
          onOpenMemory={() => setShowMemory(true)}
          
          stop={stop}
          modeVocalAuto={modeVocalAuto}
          setModeVocalAuto={setModeVocalAuto}
          hasActiveConversation={messages.length > 0}
          ragEnabled={ragEnabled}
          setRagEnabled={setRagEnabled}
          onOpenGeminiSettings={() => setShowGeminiSettings(true)}
          geminiConfig={geminiConfig}
          modePrive={modePrive}
          setModePrive={setModePrive}
          selectMode={selectMode}
          onToggleSelectMode={handleToggleSelectMode}
          selectedCount={selectedMessageIds.length}
          totalCount={messages.filter((m: any) => !m.isRagContext).length}
          onSelectAll={() => {
            const allIds = messages.filter((m: any) => !m.isRagContext).map((m: any) => m.id);
            setSelectedMessageIds(allIds);
          }}
          onDeselectAll={() => setSelectedMessageIds([])}
          onRequestDelete={() => setShowConfirmDeleteMultiple(true)}
          showConfirmDelete={showConfirmDeleteMultiple}
          setShowConfirmDelete={setShowConfirmDeleteMultiple}
          onDeleteConfirmed={handleDeleteMultipleMessages}
        />

        {/* Indicateur visuel du mode privé SOUS le header, centré */}
        <PrivateModeBanner visible={modePrive} />



        {/* Enhanced Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-slate-700/20 relative">
          <div className="flex-1 overflow-y-auto pb-20"> {/* Ajout du padding-bottom pour l'input */}
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onDeleteMessage={handleDeleteMessage}
            onReplyToMessage={(content: string) => {
              try {
                document.dispatchEvent(new CustomEvent('voice-input:prefill', { detail: String(content || '') }));
              } catch {}
            }}
              selectMode={selectMode}
              selectedMessageIds={selectedMessageIds}
              onSelectMessage={handleSelectMessage}
              modePrive={modePrive}
            />
          </div>
        </Card>
      </div>

      {/* Zone de saisie fixée en bas de l'écran */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700 px-2 pt-2 pb-2 backdrop-blur-xl">
        <VoiceInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          reasoningVisible={reasoningVisible}
          reasoningSteps={reasoningSteps}
          reasoningLoading={isLoading}
          reasoningSpeaking={isAISpeaking}
        />
      </div>

      <Suspense fallback={null}>
        <TTSSettingsModalLazy
          open={showTTSSettings}
          onClose={() => setShowTTSSettings(false)}
          rate={rate}
          setRate={setRate}
          pitch={pitch}
          setPitch={setPitch}
          volume={volume}
          setVolume={setVolume}
          voiceURI={voiceURI}
          setVoiceURI={setVoiceURI}
          availableVoices={availableVoices}
          testVoice={testVoice}
          resetSettings={handleResetSettings}
          exportSettings={exportSettings}
          importSettings={importSettings}
          deleteSettings={deleteSettings}
        />
      </Suspense>

      <VocalModeIndicator 
        visible={modeVocalAuto} 
        listening={listeningAuto}
        transcript={tempTranscriptAuto}
        muted={muted}
        timeoutActive={autoVoiceTimeout !== null}
        isAISpeaking={isAISpeaking}
      />

      {/* Suppression de l'overlay de timeline car affichage inline dans VoiceInput */}
      {/* Modale de gestion des documents RAG */}
      <Suspense fallback={null}>
        <RagDocsModalLazy open={showRagDocs} onClose={() => setShowRagDocs(false)} />
      </Suspense>

      {/* Modale de gestion de la mémoire */}
      <Suspense fallback={null}>
        {/** Import dynamique pour garder le bundle initial léger */}
        {showMemory && (
          <MemoryModalLazy open={showMemory} onClose={() => setShowMemory(false)} />
        )}
      </Suspense>

      {/* Modale latérale compacte pour les réglages Gemini */}
      <Suspense fallback={null}>
        <GeminiSettingsDrawerLazy
          open={showGeminiSettings}
          onOpenChange={setShowGeminiSettings}
          geminiConfig={geminiConfig}
          onConfigChange={handleGeminiConfigChange}
          onReset={() => setGeminiConfig(DEFAULTS)}
          onClose={() => setShowGeminiSettings(false)}
          DEFAULTS={DEFAULTS}
        />
      </Suspense>

      {/* Mémoire: gestion via modale */}

      
    </div>
  );
}

export default App;