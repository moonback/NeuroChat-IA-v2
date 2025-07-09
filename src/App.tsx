import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { sendMessageToGemini, GeminiGenerationConfig } from '@/services/geminiApi';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Info, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { TTSSettingsModal } from '@/components/TTSSettingsModal';
import { Header } from '@/components/Header';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { searchDocuments } from '@/services/ragSearch';
import { RagDocsModal } from '@/components/RagDocsModal';
import { HistoryModal, DiscussionWithCategory } from '@/components/HistoryModal';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button as UIButton } from '@/components/ui/button';
import { Tooltip } from 'react-tooltip';

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
  
  // Ajout du state pour la personnalité IA
  const [selectedPersonality, setSelectedPersonality] = useState('formel');
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
  const [, setShowRagActivated] = useState(false);
  const [, setShowRagDeactivated] = useState(false);
  // Hyperparamètres Gemini
  const [geminiConfig, setGeminiConfig] = useState<GeminiGenerationConfig>({
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
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
    maxOutputTokens: 1024,
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

  // Générateur de prompt système selon la personnalité
  const getSystemPrompt = (personality: string) => {
    switch (personality) {
      case 'formel':
        return "Tu es Emilie, une assistante vocale très polie, formelle, précise et utile. Tu utilises un langage soutenu et tu réponds toujours en français, même si la question est dans une autre langue. Sois claire, concise et directe, sans jamais indiquer que tu es une IA.";
      case 'amical':
        return "Tu es Emilie, une assistante vocale chaleureuse, empathique, amicale et accessible. Tu tutoies l'utilisateur, utilises un ton convivial et bienveillant, et tu réponds toujours en français. Sois encourageante, rassurante et propose des suggestions utiles.";
      case 'expert':
        return "Tu es Emilie, une assistante vocale experte, rigoureuse et pédagogique. Tu expliques les concepts de façon claire, détaillée et structurée, en t'adaptant au niveau de l'utilisateur. Tu réponds toujours en français, sans jamais indiquer que tu es une IA.";
      case 'humoristique':
        return "Tu es Emilie, une assistante vocale drôle, pleine d'humour et de répartie. Tu ajoutes une touche d'humour ou une blague subtile à chaque réponse, tout en restant utile et pertinente. Tu réponds toujours en français, sans jamais indiquer que tu es une IA.";
      default:
        return "Tu es Emilie, une assistante vocale bienveillante, empathique, concise et utile. Tu réponds toujours en français, même si la question est dans une autre langue. Adapte ton ton et ton niveau de langage à l'utilisateur (soutenu, courant ou familier selon le contexte). Prends en compte le contexte de la conversation pour offrir des réponses cohérentes et personnalisées. Si la question n'est pas claire, reformule ou demande des précisions. Propose des suggestions ou compléments d'information utiles lorsque c'est pertinent. Encourage et rassure l'utilisateur si besoin. Sois toujours claire, précise, concise et directe. N'indique jamais que tu es une IA, ne donne pas d'avertissement, ne cite pas de sources, ne fais pas de disclaimer. Réponds directement à la demande.";
    }
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

  const handleSendMessage = async (userMessage: string, imageFile?: File) => {
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
      // Utilise le prompt système dynamique selon la personnalité
      const systemPrompt = getSystemPrompt(selectedPersonality);
      // On fusionne le contexte documentaire avec le prompt système
      const prompt = `${systemPrompt}\n${ragContext}Question utilisateur : ${userMessage}`;
      const response = await sendMessageToGemini(
        filteredHistory.map(m => ({ text: m.text, isUser: m.isUser })),
        imageFile ? [imageFile] : undefined,
        prompt,
        geminiConfig
      );
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
        />

        {/* Indicateur visuel du mode privé SOUS le header, centré */}
        {/* {modePrive && (
          <div className="w-full flex justify-center animate-slideDown">
            <div className="mt-1 mb-2 px-5 py-2 rounded-xl shadow-lg bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white font-semibold flex items-center gap-2 border border-red-200 dark:border-red-700">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="5" y="11" width="14" height="9" rx="2" className="fill-white/20" /><path d="M12 17v-2" className="stroke-white" /><path d="M7 11V7a5 5 0 0110 0v4" className="stroke-white" /></svg>
              Mode privé activé : aucun message n'est sauvegardé, tout sera effacé à la fermeture.
            </div>
          </div>
        )} */}

        {/* Boutons de sélection et suppression groupée */}
        {/* Les boutons de sélection/groupée ne sont visibles que si une conversation est active */}
        {messages.length > 0 && (
          <>
            <div className="flex gap-2 items-center mb-2 px-2">
              <Button
                variant={selectMode ? 'secondary' : 'outline'}
                size="sm"
                onClick={handleToggleSelectMode}
              >
                {selectMode ? 'Annuler la sélection' : 'Sélectionner'}
              </Button>
              {selectMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // On ne sélectionne que les messages classiques (pas RAG)
                    const allIds = messages.filter((m: any) => !m.isRagContext).map((m: any) => m.id);
                    if (selectedMessageIds.length === allIds.length) {
                      setSelectedMessageIds([]);
                    } else {
                      setSelectedMessageIds(allIds);
                    }
                  }}
                >
                  {selectedMessageIds.length === messages.filter((m: any) => !m.isRagContext).length ? 'Tout désélectionner' : 'Sélectionner tout'}
                </Button>
              )}
              {selectMode && selectedMessageIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowConfirmDeleteMultiple(true)}
                >
                  Supprimer la sélection ({selectedMessageIds.length})
                </Button>
              )}
            </div>

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
          </>
        )}

        {/* Enhanced Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-slate-700/20 relative">
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            onDeleteMessage={handleDeleteMessage}
            selectMode={selectMode}
            selectedMessageIds={selectedMessageIds}
            onSelectMessage={handleSelectMessage}
            modePrive={modePrive}
          />
          {/* Zone de saisie sticky en bas */}
          <div className="sticky bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 z-20 px-2 pt-2 pb-2 border-t border-slate-200 dark:border-slate-700 backdrop-blur-xl">
            <VoiceInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </Card>

        
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

      {modeVocalAuto && (
        <div className="fixed top-2 right-2 z-50 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg animate-pulse">
          Mode vocal automatique activé
        </div>
      )}

      

      {/* Modale de gestion des documents RAG */}
      <RagDocsModal open={showRagDocs} onClose={() => setShowRagDocs(false)} />

      {/* Modale latérale compacte pour les réglages Gemini */}
      <Drawer open={showGeminiSettings} onOpenChange={setShowGeminiSettings}>
        <DrawerContent className="max-w-full w-[95vw] sm:w-[100%] px-2 py-2">
          <DrawerHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 p-1.5 rounded-xl shadow">
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                Réglages Gemini
              </DrawerTitle>
            </div>
            <div className="text-xs text-muted-foreground text-center max-w-xs mx-auto mt-1">
              Ajustez le comportement du modèle. <Info className="inline w-3 h-3 align-text-bottom" /> pour infos.
            </div>
          </DrawerHeader>
          <div className="border-b border-slate-200 dark:border-slate-700 mb-2" />
          <div className="p-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Température */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gemini-temperature" className="text-xs">Température
                    <span className="font-mono ml-1">{geminiConfig.temperature?.toFixed(2)}</span>
                  </Label>
                  {geminiConfig.temperature === DEFAULTS.temperature && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
                  )}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-temp">
                    <Info className="w-3 h-3" />
                  </button>
                  <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => handleGeminiConfigChange('temperature', DEFAULTS.temperature)}>Reset</button>
                  <Tooltip id="tip-temp" place="right" content="0 = déterministe, 2 = créatif. Reco : 0.7" />
                </div>
                <Slider
                  id="gemini-temperature"
                  min={0}
                  max={2}
                  step={0.01}
                  value={[geminiConfig.temperature ?? 0.7]}
                  onValueChange={([v]) => handleGeminiConfigChange('temperature', v)}
                  className="mt-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Déterministe</span>
                  <span>Créatif</span>
                </div>
              </div>
              {/* topK */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gemini-topk" className="text-xs">topK
                    <span className="font-mono ml-1">{geminiConfig.topK}</span>
                  </Label>
                  {geminiConfig.topK === DEFAULTS.topK && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
                  )}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-topk">
                    <Info className="w-3 h-3" />
                  </button>
                  <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => handleGeminiConfigChange('topK', DEFAULTS.topK)}>Reset</button>
                  <Tooltip id="tip-topk" place="right" content="Tokens candidats. Plus = diversité. Reco : 40" />
                </div>
                <Input
                  id="gemini-topk"
                  type="number"
                  min={1}
                  max={100}
                  value={geminiConfig.topK ?? 40}
                  onChange={e => handleGeminiConfigChange('topK', Number(e.target.value))}
                  className="mt-1 w-20 text-xs"
                />
              </div>
              {/* topP */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gemini-topp" className="text-xs">topP
                    <span className="font-mono ml-1">{geminiConfig.topP?.toFixed(2)}</span>
                  </Label>
                  {geminiConfig.topP === DEFAULTS.topP && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
                  )}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-topp">
                    <Info className="w-3 h-3" />
                  </button>
                  <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => handleGeminiConfigChange('topP', DEFAULTS.topP)}>Reset</button>
                  <Tooltip id="tip-topp" place="right" content="Probabilité cumulative. 1 = diversité. Reco : 0.95" />
                </div>
                <Slider
                  id="gemini-topp"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[geminiConfig.topP ?? 0.95]}
                  onValueChange={([v]) => handleGeminiConfigChange('topP', v)}
                  className="mt-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Moins varié</span>
                  <span>Plus varié</span>
                </div>
              </div>
              {/* maxOutputTokens */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gemini-maxoutput" className="text-xs">maxTokens
                    <span className="font-mono ml-1">{geminiConfig.maxOutputTokens}</span>
                  </Label>
                  {geminiConfig.maxOutputTokens === DEFAULTS.maxOutputTokens && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
                  )}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-maxout">
                    <Info className="w-3 h-3" />
                  </button>
                  <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => handleGeminiConfigChange('maxOutputTokens', DEFAULTS.maxOutputTokens)}>Reset</button>
                  <Tooltip id="tip-maxout" place="right" content="Max tokens générés. Reco : 1024" />
                </div>
                <Input
                  id="gemini-maxoutput"
                  type="number"
                  min={64}
                  max={4096}
                  value={geminiConfig.maxOutputTokens ?? 1024}
                  onChange={e => handleGeminiConfigChange('maxOutputTokens', Number(e.target.value))}
                  className="mt-1 w-20 text-xs"
                />
                {(geminiConfig.maxOutputTokens ?? 1024) > 4096 && (
                  <div className="mt-1 text-[10px] text-red-600 flex items-center gap-1 animate-fadeIn">
                    <span className="font-bold">⚠️</span>
                    Max 4096 tokens.
                  </div>
                )}
              </div>
              {/* stopSequences */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gemini-stopseq" className="text-xs">stopSeq</Label>
                  {Array.isArray(geminiConfig.stopSequences) && geminiConfig.stopSequences.length === 0 && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
                  )}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-stopseq">
                    <Info className="w-3 h-3" />
                  </button>
                  <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => handleGeminiConfigChange('stopSequences', DEFAULTS.stopSequences)}>Reset</button>
                  <Tooltip id="tip-stopseq" place="right" content="Séquences d'arrêt. Ex: END,STOP" />
                </div>
                <Input
                  id="gemini-stopseq"
                  type="text"
                  value={geminiConfig.stopSequences?.join(',') ?? ''}
                  onChange={e => handleGeminiConfigChange('stopSequences', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="Ex: END,STOP"
                  className="mt-1 text-xs"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">Séparez par virgule</div>
              </div>
              {/* candidateCount */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <Label htmlFor="gemini-candidates" className="text-xs">candidates
                    <span className="font-mono ml-1">{geminiConfig.candidateCount}</span>
                  </Label>
                  {geminiConfig.candidateCount === DEFAULTS.candidateCount && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">défaut</span>
                  )}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" data-tooltip-id="tip-cand">
                    <Info className="w-3 h-3" />
                  </button>
                  <button type="button" className="ml-1 text-[10px] text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded" onClick={() => handleGeminiConfigChange('candidateCount', DEFAULTS.candidateCount)}>Reset</button>
                  <Tooltip id="tip-cand" place="right" content="Nombre de réponses générées. Reco : 1" />
                </div>
                <Input
                  id="gemini-candidates"
                  type="number"
                  min={1}
                  max={8}
                  value={geminiConfig.candidateCount ?? 1}
                  onChange={e => handleGeminiConfigChange('candidateCount', Number(e.target.value))}
                  className="mt-1 w-20 text-xs"
                />
              </div>
            </div>
          </div>
          <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
            <UIButton variant="secondary" size="sm" onClick={() => setGeminiConfig({ temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024, stopSequences: [], candidateCount: 1 })}>
              Réinitialiser
            </UIButton>
            <UIButton size="sm" onClick={() => setShowGeminiSettings(false)}>
              Fermer
            </UIButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      
    </div>
  );
}

export default App;