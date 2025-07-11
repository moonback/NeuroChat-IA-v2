import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { sendMessageToGemini, GeminiGenerationConfig } from '@/services/geminiApi';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { toast } from 'sonner';
import { TTSSettingsModal } from '@/components/TTSSettingsModal';
import { Header } from '@/components/Header';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { searchDocuments } from '@/services/ragSearch';
import { RagDocsModal } from '@/components/RagDocsModal';
import { HistoryModal, DiscussionWithCategory } from '@/components/HistoryModal';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { SYSTEM_PROMPT } from './services/geminiSystemPrompt';
import { useMemory } from "@/hooks/useMemory";
import { MemoryModal } from '@/components/MemoryModal';
import { pipeline } from "@xenova/transformers";
import { GeminiSettingsDrawer } from '@/components/GeminiSettingsDrawer';
import { MessageSelectionBar } from '@/components/MessageSelectionBar';
import { PrivateModeBanner } from '@/components/PrivateModeBanner';
import { VocalModeIndicator } from '@/components/VocalModeIndicator';
import { RagStatusPopup } from '@/components/RagStatusPopup';
import { MemoryFeedback } from '@/components/MemoryFeedback';
import { memoryDetectionService } from '@/services/memoryDetection';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
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

// Initialisation du pipeline d'embeddings (hors composant)
let embedderPromise: Promise<any> | null = null;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
}

// Fonction utilitaire pour la similarité cosinus
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

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
  
  // Ajout du state pour la personnalité IA (par défaut : humoristique)
  const [selectedPersonality, setSelectedPersonality] = useState('humoristique');
  // Ajout du state pour le mode vocal automatique
  const [modeVocalAuto, setModeVocalAuto] = useState(false);
  // Ajout du state pour la modale de gestion des documents RAG
  const [showRagDocs, setShowRagDocs] = useState(false);
  // Ajout du state pour activer/désactiver le RAG
  const [ragEnabled, setRagEnabled] = useState(false);
  // --- Sélection multiple de messages pour suppression groupée ---
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [showConfirmDeleteMultiple, setShowConfirmDeleteMultiple] = useState(false);
  // Ajout du state pour activer/désactiver le RAG
  const [showRagActivated, setShowRagActivated] = useState(false);
  const [showRagDeactivated, setShowRagDeactivated] = useState(false);
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

  const { memory, addFact } = useMemory();

 

  const getSystemPrompt = (personality: string) => {
    let personalityAddition = '';
    switch (personality) {
      case 'formel':
        personalityAddition = "Adopte un ton très poli, formel et précis. Utilise un langage soutenu et reste toujours claire, concise et directe.";
        break;
      case 'amical':
        personalityAddition = "Sois chaleureuse, empathique et amicale. Tutoie l'utilisateur, utilise un ton convivial et bienveillant. Sois encourageante, rassurante et propose des suggestions utiles.";
        break;
      case 'expert':
        personalityAddition = "Sois experte, rigoureuse et pédagogique. Explique les concepts de façon claire, détaillée et structurée, en t'adaptant au niveau de l'utilisateur.";
        break;
      case 'humoristique':
        personalityAddition = "Ajoute une touche d'humour ou une blague subtile à chaque réponse, tout en restant utile et pertinente.";
        break;
      default:
        personalityAddition = "";
        break;
    }
    // On combine le prompt système de base avec l'ajout lié à la personnalité
    return SYSTEM_PROMPT + (personalityAddition ? " " + personalityAddition : "");
  };

  const addRagContextMessage = (passages: { id: number; titre: string; contenu: string }[]) => {
    const ragMsg: RagContextMessage = {
      id: 'rag-' + Date.now(),
      passages,
      isRagContext: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, ragMsg as any]);
  };

  // Détection automatique d'informations à mémoriser - VERSION OPTIMISÉE
  async function detectAndMemorize(text: string) {
    try {
      // Analyse de sentiment et contexte
      const sentiment = memoryDetectionService.analyzeSentiment(text);
      
      // Contexte de conversation (simplifié)
      const context = {
        previousMessages: messages.slice(-3).map(m => m.text),
        currentTopic: sentiment.intention === 'confidence' ? 'personnel' : undefined,
        userMood: sentiment.sentiment,
        timeOfDay: new Date().getHours() < 12 ? 'matin' : new Date().getHours() < 18 ? 'après-midi' : 'soir'
      };

      // Détection hybride avec le service avancé
      const detectedInfo = await memoryDetectionService.detectInformation(text, context);
      
      // Filtrage contre les informations existantes
      const validInfo = detectedInfo.filter(info => {
        const alreadyExists = memory.some(fact => 
          fact.content.toLowerCase().includes(info.content.toLowerCase()) ||
          info.content.toLowerCase().includes(fact.content.toLowerCase())
        );
        return !alreadyExists;
      });

      // Ajout à la mémoire avec feedback enrichi
      for (const info of validInfo) {
        addFact(info.content, info.category);
        
        // Emojis par catégorie
        const categoryEmojis = {
          identité: "👤", localisation: "📍", profession: "💼", préférences: "❤️",
          dates: "📅", relations: "👥", habitudes: "🔄", santé: "🏥",
          loisirs: "🎯", personnalité: "🧠"
        };
        
        const emoji = categoryEmojis[info.category as keyof typeof categoryEmojis] || "💭";
        const confidencePercent = Math.round(info.confidence * 100);
        const sourceText = info.source === 'regex' ? 'Pattern' : 
                          info.source === 'contextual' ? 'Contexte' : 'Sémantique';
        
        toast.success(`${emoji} Information ${info.category} mémorisée ! (${confidencePercent}% - ${sourceText})`, {
          duration: 3000,
          description: info.content.length > 50 ? info.content.substring(0, 50) + '...' : info.content
        });
      }

      return validInfo.length > 0;
    } catch (error) {
      console.error('Erreur détection mémoire:', error);
      return false;
    }
  }

  const handleSendMessage = async (userMessage: string, imageFile?: File) => {
    // Commande spéciale : ajout manuel à la mémoire via le chat
    const memoryCommand = userMessage.match(/^(enregistre dans la mémoire|ajoute à la mémoire|mémorise) *: *(.+)/i);
    if (memoryCommand) {
      const info = memoryCommand[2].trim();
      if (info) {
        // Patterns intelligents et détection par mots-clés (rapide)
        const patterns = [
          // Prénom
          { regex: /je m'appelle ([\w\- ]+)/i, label: "prénom" },
          { regex: /mon prénom est ([\w\- ]+)/i, label: "prénom" },
          { regex: /on m'appelle ([\w\- ]+)/i, label: "prénom" },
          // Ville
          { regex: /j'habite (à|au|en|aux)? ?([\w\- ]+)/i, label: "ville" },
          { regex: /je vis (à|au|en|aux)? ?([\w\- ]+)/i, label: "ville" },
          { regex: /je suis (à|au|en|aux)? ?([\w\- ]+)/i, label: "ville" },
          { regex: /ma ville est ([\w\- ]+)/i, label: "ville" },
          // Préférences générales
          { regex: /je préfère ([\w\- ]+)/i, label: "préférence" },
          { regex: /j'adore ([\w\- ]+)/i, label: "préférence" },
          { regex: /je n'aime pas ([\w\- ]+)/i, label: "préférence négative" },
          { regex: /mon (plat|animal|sport|film|livre|couleur|hobby|pays) préféré(e)? (est|sont)? ([\w\- ]+)/i, label: "préférence" },
          { regex: /ma (couleur|passion|activité) préférée (est|sont)? ([\w\- ]+)/i, label: "préférence" },
          // Métier
          { regex: /je travaille comme ([\w\- ]+)/i, label: "métier" },
          { regex: /mon métier est ([\w\- ]+)/i, label: "métier" },
          { regex: /je suis (un |une |)([\w\- ]+)/i, label: "métier" },
          // Date de naissance
          { regex: /je suis né(e)? le ([0-9]{1,2} [a-zéû]+ [0-9]{4})/i, label: "date de naissance" },
          { regex: /ma date de naissance est le? ([0-9]{1,2} [a-zéû]+ [0-9]{4})/i, label: "date de naissance" },
          { regex: /je fête mon anniversaire le ([0-9]{1,2} [a-zéû]+ [0-9]{4})/i, label: "date de naissance" },
          // Autres infos
          { regex: /mon animal préféré est ([\w\- ]+)/i, label: "animal préféré" },
          { regex: /ma couleur préférée est ([\w\- ]+)/i, label: "couleur préférée" },
          { regex: /mon sport favori est ([\w\- ]+)/i, label: "sport favori" },
          { regex: /ma passion est ([\w\- ]+)/i, label: "passion" },
        ];
        let pertinent = false;
        for (const p of patterns) {
          if (p.regex.test(info)) {
            pertinent = true;
            break;
          }
        }
        // Fallback : détection par mots-clés sémantiques
        if (!pertinent) {
          const keywords = [
            "prénom", "nom", "ville", "habite", "vis", "travaille", "métier", "préféré", "préférée", "préférés", "préférées",
            "animal", "couleur", "sport", "passion", "date de naissance", "anniversaire", "plat", "hobby", "pays", "activité"
          ];
          const lowerInfo = info.toLowerCase();
          if (keywords.some(kw => lowerInfo.includes(kw))) {
            pertinent = true;
          }
        }
        // Si toujours pas pertinent, on tente l'analyse sémantique locale
        if (!pertinent) {
          setSemanticLoading(true);
          addMessage("Analyse sémantique en cours...", false);
          pertinent = await isPersonalInfoSemantic(info);
          setSemanticLoading(false);
        }
        if (pertinent) {
          addFact(info);
          addMessage(`Information pertinente ajoutée à la mémoire !${semanticScore !== null ? ` (score : ${(semanticScore * 100).toFixed(1)}%)` : ''}`, false);
          toast.success("Information pertinente ajoutée à la mémoire !");
        } else {
          addMessage(`Information non pertinente, non ajoutée à la mémoire.${semanticScore !== null ? ` (score : ${(semanticScore * 100).toFixed(1)}%)` : ''}`, false);
          toast.info("Information non pertinente, non ajoutée à la mémoire.");
        }
        setSemanticScore(null);
        return; // On n'envoie pas à l'IA, c'est une commande locale
      }
    }
    await detectAndMemorize(userMessage);
    if (!isOnline) {
      toast.error('Pas de connexion Internet. Vérifie ta connexion réseau.');
      return;
    }
    // Étape RAG : recherche documentaire (seulement si activé)
    let passages: { id: number; titre: string; contenu: string }[] = [];
    if (ragEnabled) {
      passages = await searchDocuments(userMessage, 3);
      if (passages.length > 0) {
        addRagContextMessage(passages);
      }
    }
    // Ajoute le message utilisateur localement
    const newMessage = addMessage(userMessage, true, imageFile);
    setIsLoading(true);
    try {
      // On prépare l'historique complet (y compris le message utilisateur tout juste ajouté)
      const fullHistory = [...messages, newMessage];
      // On ne garde que les messages qui ont un champ text (donc pas les messages RAG)
      const filteredHistory = fullHistory.filter(m => typeof m.text === 'string');
      // On construit le contexte documentaire pour le prompt
      let ragContext = '';
      if (ragEnabled && passages.length > 0) {
        ragContext = 'Contexte documentaire :\n';
        passages.forEach((p) => {
          ragContext += `- [${p.titre}] ${p.contenu}\n`;
        });
        ragContext += '\n';
      }
      // Injection de la mémoire dans le prompt système
      const memorySummary = memory.length
        ? `Contexte utilisateur à mémoriser et à utiliser dans toutes tes réponses :\n${memory.map(f => "- " + f.content).join("\n")}\n\nTu dois toujours utiliser ces informations pour personnaliser tes réponses, même si l'utilisateur ne les mentionne pas.\n`
        : "";
      // LOG mémoire injectée
      // console.log('[Mémoire utilisateur injectée]', memorySummary);
      const prompt = `${getSystemPrompt(selectedPersonality)}\n${memorySummary}${ragEnabled ? ragContext : ""}Question utilisateur : ${userMessage}`;
      // LOG prompt final
      // console.log('[Prompt envoyé à Gemini]', prompt);
      const response = await sendMessageToGemini(
        filteredHistory.map(m => ({ text: m.text, isUser: m.isUser })),
        imageFile ? [imageFile] : undefined,
        prompt,
        geminiConfig
      );
      // LOG réponse Gemini
      // console.log('[Réponse Gemini]', response);
      addMessage(response, false);
      speak(response, {
        onEnd: () => {
          if (modeVocalAuto && !muted) {
            playBip();
            startAuto();
          }
        }
      });
      // toast.success('Réponse reçue !', { duration: 2000 });
    } catch (error) {
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
    continuous: false,
    onResult: (/* finalText */) => {
      // Rien ici, on attend la fin
    },
    onEnd: (finalText) => {
      if (modeVocalAuto && finalText && finalText.trim().length > 0) {
        handleSendMessage(finalText.trim());
        resetAuto();
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
      if (!listeningAuto && isSupportedAuto) {
        playBip();
        startAuto();
      }
    } else {
      if (listeningAuto) {
        stopAuto();
        resetAuto();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeVocalAuto]);

  // Si l'utilisateur mute ou stop la voix, désactive le mode vocal auto
  useEffect(() => {
    if (modeVocalAuto && muted) {
      setModeVocalAuto(false);
      stopAuto();
      resetAuto();
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

  // Afficher un popup animé quand le RAG s'active ou se désactive
  useEffect(() => {
    if (ragEnabled) {
      setShowRagActivated(true);
      const timeout = setTimeout(() => setShowRagActivated(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      setShowRagDeactivated(true);
      const timeout = setTimeout(() => setShowRagDeactivated(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [ragEnabled]);

  // Handler pour modifier un hyperparamètre Gemini
  const handleGeminiConfigChange = (key: keyof GeminiGenerationConfig, value: any) => {
    setGeminiConfig(cfg => ({ ...cfg, [key]: value }));
  };

  const [showMemoryModal, setShowMemoryModal] = useState(false);
  // Exemples d'informations personnelles pertinentes (état modifiable)
  const [examples, setExamples] = useState<string[]>([
    "Je m'appelle Lucie",
    "Mon prénom est Paul",
    "J'habite à Paris",
    "Je vis à Marseille",
    "Je préfère le thé au café",
    "Je suis développeur",
    "Ma couleur préférée est le bleu",
    "Je suis né le 12 mars 1990",
    "Mon sport favori est le tennis",
    "Ma passion est la photographie",
    "Mon animal préféré est le chat",
    "Je travaille comme infirmière",
    "Mon métier est enseignant"
  ]);
  // Seuil de similarité ajustable
  const [semanticThreshold, setSemanticThreshold] = useState(0.7);
  // Loader et feedback UX
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticScore, setSemanticScore] = useState<number | null>(null);

  // Fonction asynchrone pour juger la pertinence sémantique (utilise les exemples et seuil du state)
  const isPersonalInfoSemantic = async (text: string): Promise<boolean> => {
    const embedder = await getEmbedder();
    const [inputEmbedding] = await embedder(text);
    const exampleEmbeddingsLocal = await Promise.all(examples.map((e: string) => embedder(e).then((res: number[][]) => res[0])));
    const similaritiesLocal = exampleEmbeddingsLocal.map((ex: number[]) => cosineSimilarity(inputEmbedding, ex));
    const maxSim = Math.max(...similaritiesLocal);
    setSemanticScore(maxSim);
    return maxSim > semanticThreshold;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Menu historique des discussions */}
      <HistoryModal
        open={showHistory}
        onClose={handleCloseHistory}
        history={historyList}
        onLoad={handleLoadDiscussion}
        onDelete={handleDeleteDiscussion}
        onRename={handleRenameDiscussion}
        onDeleteMultiple={handleDeleteMultipleDiscussions}
      />

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
          selectedPersonality={selectedPersonality}
          onChangePersonality={setSelectedPersonality}
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
          onOpenMemoryModal={() => setShowMemoryModal(true)}
        />

        {/* Indicateur visuel du mode privé SOUS le header, centré */}
        <PrivateModeBanner visible={modePrive} />
        <RagStatusPopup activated={showRagActivated} deactivated={showRagDeactivated} />

        {/* Boutons de sélection et suppression groupée */}
        {/* Les boutons de sélection/groupée ne sont visibles que si une conversation est active */}
        {messages.length > 0 && (
          <MessageSelectionBar
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
        )}

        {/* Confirmation globale suppression multiple */}
        <AlertDialog open={showConfirmDeleteMultiple} onOpenChange={setShowConfirmDeleteMultiple}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer {selectedMessageIds.length} message{selectedMessageIds.length > 1 ? 's' : ''} ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Les messages sélectionnés seront définitivement supprimés de la conversation et de l'historique.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMultipleMessages}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Enhanced Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-slate-700/20 relative">
          <div className="flex-1 overflow-y-auto pb-20"> {/* Ajout du padding-bottom pour l'input */}
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onDeleteMessage={handleDeleteMessage}
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
        <VoiceInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <MemoryFeedback loading={semanticLoading} score={semanticScore} />
      </div>

      <TTSSettingsModal
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

      <VocalModeIndicator visible={modeVocalAuto} />

      

      {/* Modale de gestion des documents RAG */}
      <RagDocsModal open={showRagDocs} onClose={() => setShowRagDocs(false)} />

      {/* Modale latérale compacte pour les réglages Gemini */}
      <GeminiSettingsDrawer
        open={showGeminiSettings}
        onOpenChange={setShowGeminiSettings}
        geminiConfig={geminiConfig}
        onConfigChange={handleGeminiConfigChange}
        onReset={() => setGeminiConfig(DEFAULTS)}
        onClose={() => setShowGeminiSettings(false)}
        DEFAULTS={DEFAULTS}
      />

      <MemoryModal
        open={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        examples={examples}
        setExamples={setExamples}
        semanticThreshold={semanticThreshold}
        setSemanticThreshold={setSemanticThreshold}
        semanticLoading={semanticLoading}
      />
    </div>
  );
}

export default App;