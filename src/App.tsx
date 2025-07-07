import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { sendMessageToGemini } from '@/services/geminiApi';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Mic, MessageCircle, Zap, Shield, Globe, History, X, Settings2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { TTSSettingsModal } from '@/components/TTSSettingsModal';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Discussion {
  title: string;
  messages: Message[];
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
  } = useSpeechSynthesis();
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<Discussion[]>([]);
  const [editingTitleIdx, setEditingTitleIdx] = useState<number | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [showTTSSettings, setShowTTSSettings] = useState(false);

  // --- Gestion de l'historique des discussions ---
  const LOCALSTORAGE_KEY = 'gemini_discussions';
  const LOCALSTORAGE_CURRENT = 'gemini_current_discussion';

  // Charger la dernière discussion au démarrage
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

  // Sauvegarder une discussion dans l'historique (sans doublons consécutifs)
  const saveDiscussionToHistory = (discussion: Message[]) => {
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
    if (messages.length > 0) {
      saveDiscussionToHistory(messages);
    }
    setMessages([]);
    localStorage.setItem(LOCALSTORAGE_CURRENT, JSON.stringify([]));
  };

  // Sauvegarde automatique à la fermeture/rafraîchissement de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveDiscussionToHistory(messages);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

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

  const addMessage = (text: string, isUser: boolean): Message => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!isOnline) {
      toast.error('Pas de connexion Internet. Vérifie ta connexion réseau.');
      return;
    }

    // Ajoute le message utilisateur localement
    const newMessage = addMessage(userMessage, true);
    setIsLoading(true);

    try {
      // On prépare l'historique complet (y compris le message utilisateur tout juste ajouté)
      const fullHistory = [...messages, newMessage];
      const response = await sendMessageToGemini(fullHistory.map(m => ({ text: m.text, isUser: m.isUser })));
      addMessage(response, false);
      speak(response);
      toast.success('Réponse reçue !', { duration: 2000 });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Impossible d'obtenir une réponse de Gemini. Réessaie.";
      addMessage(`Désolé, j'ai rencontré une erreur : ${errorMessage}`, false);
      toast.error(errorMessage, {
        action: {
          label: 'Réessayer',
          onClick: () => handleSendMessage(userMessage),
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
        setHistoryList(discussions);
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
  const handleLoadDiscussion = (discussion: Discussion) => {
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

  // Renommer une discussion
  const handleStartEditTitle = (idx: number, currentTitle: string) => {
    setEditingTitleIdx(idx);
    setEditingTitleValue(currentTitle);
  };
  const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitleValue(e.target.value);
  };
  const handleEditTitleSave = (idx: number) => {
    const newHistory = [...historyList];
    newHistory[idx] = { ...newHistory[idx], title: editingTitleValue || `Discussion ${idx + 1}` };
    setHistoryList(newHistory);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newHistory));
    setEditingTitleIdx(null);
    setEditingTitleValue('');
  };
  const handleEditTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      handleEditTitleSave(idx);
    } else if (e.key === 'Escape') {
      setEditingTitleIdx(null);
      setEditingTitleValue('');
    }
  };

  // Ajout d'un toast lors de la réinitialisation
  const handleResetSettings = () => {
    resetSettings();
    toast.success('Réglages réinitialisés.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Menu historique des discussions */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
            <button onClick={handleCloseHistory} className="absolute top-3 right-3 text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-4">Discussions récentes</h2>
            {historyList.length === 0 ? (
              <div className="text-muted-foreground text-center">Aucune discussion sauvegardée.</div>
            ) : (
              <ul className="space-y-4">
                {historyList.map((discussion, idx) => (
                  <li key={idx} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition group flex items-center gap-2">
                    <div className="flex-1 min-w-0" onClick={() => handleLoadDiscussion(discussion)} style={{ cursor: 'pointer' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <History className="w-4 h-4 text-blue-500" />
                        {editingTitleIdx === idx ? (
                          <input
                            type="text"
                            value={editingTitleValue}
                            onChange={handleEditTitleChange}
                            onBlur={() => handleEditTitleSave(idx)}
                            onKeyDown={e => handleEditTitleKeyDown(e, idx)}
                            autoFocus
                            className="text-base font-semibold bg-transparent border-b border-blue-400 focus:outline-none px-1 w-40"
                          />
                        ) : (
                          <span className="font-semibold truncate" title={discussion.title}>{discussion.title || `Discussion ${idx + 1}`}</span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">{discussion.messages[0]?.timestamp ? new Date(discussion.messages[0].timestamp).toLocaleString() : ''}</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{discussion.messages.map(m => m.text).join(' ').slice(0, 80)}...</div>
                    </div>
                    {/* Boutons actions */}
                    <button
                      className="ml-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                      title="Renommer"
                      onClick={() => handleStartEditTitle(idx, discussion.title)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
                    </button>
                    <button
                      className="ml-1 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      title="Supprimer"
                      onClick={() => handleDeleteDiscussion(idx)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-12xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              {/* Online status indicator */}
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <div className={`w-full h-full rounded-full ${
                  isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Voice Chat
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
                <span>Des conversations IA, à ta façon</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
            
            
            <ThemeToggle />
            {/* Bouton mute/unmute TTS */}
            <button
              onClick={muted ? unmute : mute}
              className="ml-2 p-2 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20 transition-all duration-200"
              title={muted ? 'Activer la synthèse vocale' : 'Désactiver la synthèse vocale'}
            >
              {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-green-500" />}
            </button>
            {/* Bouton réglages TTS */}
            <button
              onClick={() => setShowTTSSettings(true)}
              className="ml-1 p-2 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/20 transition-all duration-200"
              title="Réglages synthèse vocale"
            >
              <Settings2 className="w-5 h-5 text-blue-500" />
            </button>
            {/* BOUTON NOUVELLE DISCUSSION */}
            <button
              onClick={handleNewDiscussion}
              className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              title="Nouvelle discussion"
            >
              Nouvelle discussion
            </button>
            {/* BOUTON HISTORIQUE */}
            <button
              onClick={handleOpenHistory}
              className="ml-2 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-100 font-semibold shadow hover:from-blue-100 hover:to-blue-300 dark:hover:from-blue-900 dark:hover:to-blue-800 transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-2"
              title="Afficher l'historique"
            >
              <History className="w-4 h-4" />
              Historique
            </button>
          </div>
        </div>

        {/* Enhanced Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-slate-700/20">
          <ChatContainer messages={messages} isLoading={isLoading} />
          <VoiceInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </Card>

        {/* Enhanced Footer */}
        {/* <div className="text-center mt-4 sm:mt-6 space-y-2">
          <div className="text-xs text-muted-foreground/80 flex items-center justify-center gap-2">
            <span>Propulsé par Google Gemini Pro</span>
            <span>•</span>
            <span>Reconnaissance et synthèse vocale activées</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Réponses instantanées
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Chiffrement de bout en bout
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Multilingue
            </span>
          </div>
        </div> */}
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
    </div>
  );
}

export default App;