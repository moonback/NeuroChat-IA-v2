import { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import WorkspaceOpeningDialog from '@/components/WorkspaceOpeningDialog';
import { ChatContainer } from '@/components/ChatContainer';
import { VoiceInput } from '@/components/VoiceInput';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWAMeta } from '@/components/PWAMeta';
import { PWAShortcuts } from '@/components/PWAShortcuts';
import { GeminiGenerationConfig } from '@/services/geminiApi';
import type { MistralGenerationConfig } from '@/services/mistralApi';
import { streamMessage, type LlmConfig } from '@/services/llm';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { toast } from 'sonner';
// 🔐 Services de sécurité AES-256 niveau gouvernemental
import { enableSecureStorage, disableSecureStorage, initializeSecureStorage } from '@/services/secureStorage';
// Services de mémoire sécurisée supprimés - système de mémoire retiré
import { initializeKeyManager, shutdownKeyManager, getKeyManagerStats } from '@/services/keyManager';
import { selfTest as cryptoSelfTest } from '@/services/encryption';
// 🔐 Chiffrement persistant pour mode normal
import { 
  initializePersistentEncryption,
  savePersistentEncrypted,
  loadPersistentEncrypted
} from '@/services/persistentEncryption';
// 🔍 Monitoring de sécurité et performance
import { startMonitoring, stopMonitoring } from '@/services/monitoringService';
// Tests des alertes (à supprimer en production)
import '@/utils/alertTest';

// Constantes pour le debug
const ENCRYPTION_ENABLED_KEY = 'nc_encryption_enabled';
const MASTER_PASSWORD_KEY = 'nc_master_password_encrypted';
// Lazy-loaded components pour réduire le bundle initial
const TTSSettingsModalLazy = lazy(() => import('@/components/TTSSettingsModal').then(m => ({ default: m.TTSSettingsModal })));
const ImageGenerationModalLazy = lazy(() => import('@/components/ImageGenerationModal').then(m => ({ default: m.ImageGenerationModal })));
import { Header } from '@/components/Header';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { searchDocuments } from '@/services/ragSearch';
const RagDocsModalLazy = lazy(() => import('@/components/RagDocsModal').then(m => ({ default: m.RagDocsModal })));
const HistoryModalLazy = lazy(() => import('@/components/HistoryModal').then(m => ({ default: m.HistoryModal })));
// MemoryModal supprimé - système de mémoire retiré

import type { DiscussionWithCategory } from '@/components/HistoryModal';

import { SYSTEM_PROMPT } from './services/geminiSystemPrompt';
// Services de mémoire supprimés - système de mémoire retiré
const GeminiSettingsDrawerLazy = lazy(() => import('@/components/GeminiSettingsDrawer').then(m => ({ default: m.GeminiSettingsDrawer })));
const OpenAISettingsDrawerLazy = lazy(() => import('@/components/OpenAISettingsDrawer').then(m => ({ default: m.OpenAISettingsDrawer })));
const MistralSettingsDrawerLazy = lazy(() => import('@/components/MistralSettingsDrawer').then(m => ({ default: m.MistralSettingsDrawer })));
// Retrait du sélecteur de personnalités

import { PrivateModeBanner } from '@/components/PrivateModeBanner';
import { ChildModeBanner } from '@/components/ChildModeBanner';
import { ChildModePinDialog } from '@/components/ChildModePinDialog';
import { ChildModeChangePinDialog } from '@/components/ChildModeChangePinDialog';
import { VocalModeIndicator } from '@/components/VocalModeIndicator';
import { RagSidebar } from '@/components/RagSidebar';
import { RagSidebarDrawer } from '@/components/RagSidebarDrawer';
import { WebSourcesSidebar } from '@/components/WebSourcesSidebar';
import { WebSourcesDrawer } from '@/components/WebSourcesDrawer';
import type { WebSource } from '@/components/WebSourcesSidebar';
import { AgentStatus } from '@/components/AgentStatus';
import { useWorkspace, useWorkspaceOpeningModal } from '@/hooks/useWorkspace';

// Timeline retirée

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  // memoryFactsCount supprimé - système de mémoire retiré
  sources?: Array<{ title: string; url: string }>;
  generatedImage?: {
    imageUrl: string;
    prompt: string;
    model: string;
    generationTime: number;
    metadata?: {
      seed?: number;
      steps?: number;
      guidance?: number;
    };
  };
}

interface Discussion {
  title: string;
  messages: Message[];
  childMode?: boolean;
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
  // 🔐 Initialisation du système de sécurité au démarrage
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Test d'auto-vérification du chiffrement
        const cryptoTest = await cryptoSelfTest();
        if (!cryptoTest) {
          // console.error('⚠️ Échec du test de chiffrement - Fonctionnalités de sécurité désactivées');
          // toast.error('Système de chiffrement non disponible - Évitez le mode privé');
          return;
        }
        
        // Initialisation des services de sécurité
        initializeSecureStorage();
        initializeKeyManager();
        
        // 🔍 Démarrer le monitoring de sécurité et performance
        startMonitoring();
        
        // // Le chiffrement est maintenant obligatoire - pas de diagnostic nécessaire
        // console.log('🔐 Initialisation du chiffrement obligatoire...');
        
        // Initialisation du chiffrement persistant pour mode normal
        const persistentInitialized = await initializePersistentEncryption();
        setPersistentEncryptionEnabled(persistentInitialized);
        
        if (persistentInitialized) {
          // console.log('✅ Chiffrement persistant activé avec succès');
          // toast.success('🔐 Chiffrement AES-256 activé', {
          //   description: 'Vos conversations sont maintenant protégées par défaut',
          //   duration: 3000,
          // });
        } else {
          // console.error('❌ ÉCHEC CRITIQUE: Le chiffrement obligatoire n\'a pas pu être activé');
          toast.error('Erreur système critique', {
            description: 'Le chiffrement AES-256 obligatoire n\'a pas pu être initialisé',
            duration: 10000,
          });
        }
        
        // console.log('🔐 Système de sécurité AES-256 initialisé avec succès');
      } catch {
        // console.error('Erreur d\'initialisation de la sécurité:', error);
        toast.error('Erreur lors de l\'initialisation du système de sécurité');
      }
    };
    
    initializeSecurity();
    
    // Nettoyage à la fermeture du composant
    return () => {
      shutdownKeyManager();
      stopMonitoring();
    };
  }, []);

  // --- Espaces de travail via hooks ---
  const { workspaceId, setWorkspaceId, workspaces, createWorkspace, renameWorkspace, deleteWorkspace, wsKey } = useWorkspace();
  const { open: workspaceOpeningOpen, setOpen: setWorkspaceOpeningOpen, name: workspaceOpeningName } = useWorkspaceOpeningModal(workspaceId, workspaces);
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
  const [showImageGeneration, setShowImageGeneration] = useState(false);
  // showMemory supprimé - système de mémoire retiré
  // Ajout du state pour activer/désactiver le RAG
  const [ragEnabled, setRagEnabled] = useState(false);
  // Ajout du state pour activer/désactiver la recherche web
  const [webEnabled, setWebEnabled] = useState<boolean>(false);
  // État de chargement spécifique à la recherche web
  const [isWebSearching, setIsWebSearching] = useState<boolean>(false);
  const [isRagSearching, setIsRagSearching] = useState<boolean>(false);
  // Documents RAG utilisés dans la conversation courante
  const [usedRagDocs, setUsedRagDocs] = useState<Array<{ id: string; titre: string; contenu: string; extension?: string; origine?: string }>>([]);
  // Sidebar RAG mobile
  const [showRagSidebarMobile, setShowRagSidebarMobile] = useState(false);
  
  // Sources web utilisées dans la conversation courante
  const [usedWebSources, setUsedWebSources] = useState<WebSource[]>([]);
  // Sidebar Web mobile
  const [showWebSidebarMobile, setShowWebSidebarMobile] = useState(false);
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
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'mistral'>(
    (localStorage.getItem('llm_provider') as 'gemini' | 'openai' | 'mistral') || 'gemini'
  );
  const [mistralConfig, setMistralConfig] = useState<MistralGenerationConfig>({
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 4096,
    model: (import.meta.env.VITE_MISTRAL_MODEL as string) || 'mistral-small-latest',
  });
  const [openaiConfig, setOpenaiConfig] = useState({
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 4096,
    model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini',
  });
  // Heuristiques automatiques RAG/Web + mots-clés
  const [autoRagEnabled, setAutoRagEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('auto_rag_enabled') === 'true'; } catch { return true; }
  });
  const [ragKeywords, setRagKeywords] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('auto_rag_keywords');
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore parsing errors
    }
    return ['doc', 'docs', 'pdf', 'mémoire', 'memoire', 'note', 'dossier', 'annexe', 'rapport', 'spécification', 'spec', 'slides', 'présentation'];
  });
  useEffect(() => { try { localStorage.setItem('auto_rag_enabled', autoRagEnabled ? 'true' : 'false'); } catch { /* Ignore storage errors */ } }, [autoRagEnabled]);
  // Mémoriser les arrays pour éviter les re-renders inutiles
  const memoizedRagKeywords = useMemo(() => ragKeywords, [ragKeywords]);
  
  useEffect(() => { try { localStorage.setItem('auto_rag_keywords', JSON.stringify(ragKeywords)); } catch { /* Ignore storage errors */ } }, [ragKeywords]);
  const [showGeminiSettings, setShowGeminiSettings] = useState(false);
  const [showOpenAISettings, setShowOpenAISettings] = useState(false);
  const [showMistralSettings, setShowMistralSettings] = useState(false);
  const [mistralAgentEnabled, setMistralAgentEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('mistral_agent_enabled') === 'true'; } catch { return false; }
  });
  const [geminiAgentEnabled, setGeminiAgentEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('gemini_agent_enabled') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('mistral_agent_enabled', mistralAgentEnabled ? 'true' : 'false'); } catch { /* Ignore storage errors */ }
  }, [mistralAgentEnabled]);
  useEffect(() => {
    try { localStorage.setItem('gemini_agent_enabled', geminiAgentEnabled ? 'true' : 'false'); } catch { /* Ignore storage errors */ }
  }, [geminiAgentEnabled]);
  // Gestion des presets Gemini
  const [presets, setPresets] = useState<{ name: string; config: GeminiGenerationConfig }[]>([]);

  // Hauteur dynamique de la zone d'entrée (VoiceInput) pour éviter le chevauchement
  const [inputHeight, setInputHeight] = useState<number>(120);
  const voiceInputContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = voiceInputContainerRef.current || document.getElementById('voice-input-wrapper');
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      // Marge supplémentaire pour éviter tout chevauchement
      setInputHeight(Math.max(96, Math.round(rect.height + 28)));
    });
    ro.observe(el);
    // Mesure initiale
    const rect = el.getBoundingClientRect();
    setInputHeight(Math.max(96, Math.round(rect.height + 28)));
    return () => ro.disconnect();
  }, []);

  // Ouvrir les réglages OpenAI via event du Header
  useEffect(() => {
    const handler = () => setShowOpenAISettings(true);
    document.addEventListener('openai:settings:open', handler);
    return () => document.removeEventListener('openai:settings:open', handler);
  }, []);

  // Ouvrir les réglages Mistral via event du Header
  useEffect(() => {
    const handler = () => setShowMistralSettings(true);
    document.addEventListener('mistral:settings:open', handler);
    return () => document.removeEventListener('mistral:settings:open', handler);
  }, []);

  // --- Mode privé/éphémère ---
  const [modePrive, setModePrive] = useState(false);
  // --- Chiffrement persistant pour mode normal ---
  const [persistentEncryptionEnabled, setPersistentEncryptionEnabled] = useState<boolean>(false);

  // --- Mode enfant (protégé par PIN) ---
  const [modeEnfant, setModeEnfant] = useState<boolean>(localStorage.getItem('mode_enfant') === 'true');
  const [childPin, setChildPin] = useState<string>(localStorage.getItem('mode_enfant_pin') || '');
  const [showChildPinDialog, setShowChildPinDialog] = useState<boolean>(false);
  const [showChildChangePinDialog, setShowChildChangePinDialog] = useState<boolean>(false);
  // --- Mode réponses structurées ---
  const [structuredMode, setStructuredMode] = useState<boolean>(() => {
    try { return localStorage.getItem('structured_mode') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('structured_mode', structuredMode ? 'true' : 'false'); } catch { /* Ignore storage errors */ }
  }, [structuredMode]);
  // --- Timeline de raisonnement ---
  // Timeline retirée
  // 🔐 Gestion du mode privé avec chiffrement AES-256
  useEffect(() => {
    const handlePrivateModeChange = async () => {
      if (modePrive) {
        try {
                  // Activation du mode privé sécurisé
        enableSecureStorage();
          
          // Effacer les messages actuels pour sécurité
          setMessages([]);
          setUsedRagDocs([]);
          setUsedWebSources([]);
          
          // Toast de confirmation avec détails de sécurité
          // toast.success('🔐 Mode Privé Ultra-Sécurisé Activé', {
          //   description: 'Protection AES-256 • Auto-destruction • Zéro persistance',
          //   duration: 3000,
          // });
          
          // Afficher les stats de sécurité
          const keyStats = getKeyManagerStats();
          if (keyStats) {
            console.log('🔐 Statistiques de sécurité:', keyStats);
          }
          
        } catch (error) {
          console.error('Erreur activation mode privé:', error);
          toast.error('Échec de l\'activation du mode privé sécurisé');
          setModePrive(false); // Revenir en mode normal
        }
      } else {
        try {
                  // Désactivation du mode privé
        disableSecureStorage();
          
          toast.info('🔓 Mode Privé Désactivé', {
            description: 'Toutes les données temporaires ont été détruites',
            duration: 2000,
          });
          
        } catch (error) {
          console.error('Erreur désactivation mode privé:', error);
        }
      }
      
      // Exposer l'état pour d'autres services (ex: memoryExtractor)
      try {
        localStorage.setItem('mode_prive', modePrive ? 'true' : 'false');
      } catch {
        // Ignore storage errors
      }
    };
    
    handlePrivateModeChange();
  }, [modePrive]);

  // Persistance du mode enfant
  useEffect(() => {
    try {
      localStorage.setItem('mode_enfant', modeEnfant ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
    // En mode enfant, forcer le mode privé à false
    if (modeEnfant && modePrive) setModePrive(false);
  }, [modeEnfant, modePrive]);

  // --- Gestion de l'historique des discussions ---
  const LOCALSTORAGE_KEY_BASE = 'gemini_discussions';
  const LOCALSTORAGE_CURRENT_BASE = 'gemini_current_discussion';

  // Valeurs par défaut pour badge et reset individuel
  const DEFAULTS = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
    stopSequences: [],
    candidateCount: 1,
  };

  // Charger la dernière discussion au démarrage (avec déchiffrement optionnel)
  useEffect(() => {
    if (modePrive) {
      setMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      const key = wsKey(workspaceId, LOCALSTORAGE_CURRENT_BASE);
      
      try {
        let savedData = null;
        
        // Vérifier d'abord le type de données stockées
        const saved = localStorage.getItem(key);
        if (saved) {
          if (saved.startsWith('NEUROCHT_PERSIST_')) {
            // Données chiffrées détectées
            if (persistentEncryptionEnabled) {
              savedData = await loadPersistentEncrypted(key);
            } else {
              console.warn('⚠️ Données chiffrées détectées mais chiffrement non activé');
              // Proposer de réactiver le chiffrement ou ignorer
              savedData = null;
            }
          } else {
            // Données non chiffrées
            try {
              savedData = JSON.parse(saved);
            } catch (parseError) {
              console.error('Erreur parsing JSON:', parseError);
              // Nettoyer les données corrompues
              localStorage.removeItem(key);
              savedData = null;
            }
          }
        }
        
        if (savedData && Array.isArray(savedData)) {
          setMessages(savedData.map((msg: Message) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error);
        setMessages([]);
      }
    };
    
    loadMessages();
  }, [modePrive, workspaceId, persistentEncryptionEnabled, wsKey]);

  // Sauvegarder la discussion courante à chaque changement (avec chiffrement optionnel)
  useEffect(() => {
    if (modePrive) return; // Pas de sauvegarde en mode privé
    
    const saveMessages = async () => {
      const key = wsKey(workspaceId, LOCALSTORAGE_CURRENT_BASE);
      
      if (persistentEncryptionEnabled) {
        // Mode chiffré persistant
        try {
          await savePersistentEncrypted(key, messages);
        } catch (error) {
          console.error('Erreur sauvegarde chiffrée:', error);
          // Fallback en mode normal
          localStorage.setItem(key, JSON.stringify(messages));
        }
      } else {
        // Mode normal
        localStorage.setItem(key, JSON.stringify(messages));
      }
    };
    
    saveMessages();
  }, [messages, modePrive, workspaceId, persistentEncryptionEnabled, wsKey]);

  // Charger les presets au montage
  useEffect(() => {
    const raw = localStorage.getItem(wsKey(workspaceId, 'gemini_presets'));
    if (raw) {
      try {
        setPresets(JSON.parse(raw));
      } catch {
        // Ignore parsing errors
      }
    } else {
      setPresets([]);
    }
  }, [workspaceId, wsKey]);

  // Sauvegarder les presets à chaque modification
  useEffect(() => {
    localStorage.setItem(wsKey(workspaceId, 'gemini_presets'), JSON.stringify(presets));
  }, [presets, workspaceId, wsKey]);

  // En mode enfant, forcer RAG OFF et empêcher l'ouverture des réglages
  useEffect(() => {
    if (modeEnfant && ragEnabled) {
      setRagEnabled(false);
    }
  }, [modeEnfant, ragEnabled]);

  // 🔐 Surveiller les changements d'état du chiffrement persistant
  useEffect(() => {
    const checkPersistentState = () => {
      const isEnabled = localStorage.getItem(ENCRYPTION_ENABLED_KEY) === 'true';
      const hasPassword = localStorage.getItem(MASTER_PASSWORD_KEY) !== null;
      const hasDerivationKey = localStorage.getItem('nc_derivation_key') !== null;
      
      console.log('🔍 État du chiffrement persistant:', {
        isEnabled,
        hasPassword,
        hasDerivationKey,
        currentState: persistentEncryptionEnabled
      });
    };
    
    // Vérification périodique
    const interval = setInterval(checkPersistentState, 10000); // Toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, [persistentEncryptionEnabled]);

  // Sauvegarder une discussion dans l'historique (sans doublons consécutifs)
  const saveDiscussionToHistory = useCallback((discussion: Message[]) => {
    if (modePrive) return; // Pas de sauvegarde en mode privé
    if (!discussion.length) return;
    const historyRaw = localStorage.getItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE));
    let history: Discussion[] = [];
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        // Migration si ancien format (Message[][])
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          history = parsed.map((msgs: Message[], idx: number) => ({
            title: `Discussion ${idx + 1}`,
            messages: msgs,
            childMode: false,
          }));
        } else {
          history = parsed;
        }
      } catch {
        // Ignore parsing errors
      }
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
      // Titre par défaut: 1er message utilisateur tronqué ou date
      const firstUser = discussion.find(m => m.isUser)?.text || '';
      const defaultTitle = firstUser
        ? (firstUser.length > 40 ? firstUser.slice(0, 40) + '…' : firstUser)
        : new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      history.push({ title: defaultTitle, messages: discussion, childMode: modeEnfant });
      localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE), JSON.stringify(history));
    }
  }, [modePrive, workspaceId, wsKey, modeEnfant]);

  // Nouvelle discussion
  const handleNewDiscussion = () => {
    if (!modePrive && messages.length > 0) {
      saveDiscussionToHistory(messages);
    }
    setMessages([]);
    setUsedRagDocs([]);
    setUsedWebSources([]);
    if (!modePrive) localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_CURRENT_BASE), JSON.stringify([]));
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
  }, [messages, modePrive, saveDiscussionToHistory]);

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

  const addMessage = (text: string, isUser: boolean, imageFile?: File, sources?: Array<{ title: string; url: string }>, generatedImage?: Message['generatedImage']): Message => {
    // Validation des paramètres
    if (typeof text !== 'string') {
      console.error('Erreur: le texte du message doit être une chaîne de caractères');
      return {} as Message;
    }
    
    // Générer un ID unique avec timestamp et random pour éviter les collisions
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const message: Message = {
      id: messageId,
      text: text.trim(),
      isUser,
      timestamp: new Date(),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      sources,
      generatedImage,
    };
    
    // Vérifier qu'il n'y a pas de doublon avant d'ajouter
    setMessages(prev => {
      // Vérifier si un message identique existe déjà
      const duplicateExists = prev.some(m => 
        m.text === message.text && 
        m.isUser === message.isUser && 
        Math.abs(m.timestamp.getTime() - message.timestamp.getTime()) < 1000 // Dans la même seconde
      );
      
      if (duplicateExists) {
        console.warn('Message dupliqué détecté, ignoré:', message);
        return prev;
      }
      
      return [...prev, message];
    });
    
    return message;
  };

  // Fonction pour gérer la génération d'images
  const handleImageGenerated = useCallback((imageUrl: string, prompt: string) => {
    // Créer un message utilisateur avec l'image générée
    addMessage(
      `🎨 Image générée: "${prompt}"`,
      true,
      undefined,
      undefined,
      {
        imageUrl,
        prompt,
        model: 'stabilityai/stable-diffusion-xl-base-1.0', // Modèle par défaut
        generationTime: 0, // Sera mis à jour par le modal
        metadata: {
          steps: 20,
          guidance: 7.5
        }
      }
    );

    // Créer une réponse IA qui commente l'image
    addMessage(
      `Voici l'image que j'ai générée pour vous ! 🎨\n\n**Prompt utilisé:** "${prompt}"\n\nL'image a été créée avec l'IA Stable Diffusion XL. Vous pouvez la télécharger ou l'utiliser dans votre conversation.`,
      false
    );

    toast.success('Image générée et ajoutée à la conversation !');
  }, [addMessage]);

  // Gestion PIN mode enfant
  const handleConfirmChildPin = (pin: string) => {
    // Si le mode est actif, on vérifie pour désactiver
    if (modeEnfant) {
      if (pin && childPin && pin === childPin) {
        setModeEnfant(false);
        setShowChildPinDialog(false);
      } else {
        toast.error('Code PIN incorrect.');
      }
      return;
    }
    // Si le mode est inactif, définir le PIN si vide et activer
    if (!childPin) {
      if (!pin || pin.length < 4) {
        toast.error('Choisis un code PIN d’au moins 4 chiffres.');
        return;
      }
      setChildPin(pin);
      try { localStorage.setItem('mode_enfant_pin', pin); } catch {
        // Ignore storage errors
      }
    }
    setModeEnfant(true);
    setShowChildPinDialog(false);
  };

  const handleCloseChildPin = () => setShowChildPinDialog(false);

  // 🔐 Plus de données orphelines possibles - chiffrement permanent et obligatoire

  // 🔐 Le chiffrement est maintenant permanent et obligatoire - pas de désactivation possible

  // Prompt système avec règles additionnelles en mode privé
  const getSystemPrompt = () => {
    const base = SYSTEM_PROMPT;
    if (modePrive) {
      const privateBlock = [
        'MODE PRIVÉ ACTIF :',
        "- Ne conserve, n'invoque ni ne fais référence à aucune mémoire ou historique.",
        "- Ne propose pas de sauvegarder des informations personnelles.",
        "- Évite de demander des données sensibles (email, téléphone, adresse, identifiants). Si nécessaire, demande un consentement explicite et propose des alternatives.",
        "- Réponds de manière concise et éphémère. Ne fais pas de suivi hors de ce message.",
        "- Si l’utilisateur demande des fonctions liées à la mémoire, précise poliment que la mémoire est désactivée en mode privé."
      ].join('\n');
      return `${base}\n\n${privateBlock}`;
    }
    if (modeEnfant) {
      const childBlock = [
        'MODE ENFANT ACTIF :',
        '- Adopte toujours un ton chaleureux, simple et ludique, parfait pour les enfants.',
        '- Évite absolument tout sujet sensible, violent ou inapproprié ; privilégie les thèmes éducatifs et rassurants.',
        '- Explique avec des phrases courtes, des exemples concrets et des analogies faciles à comprendre.',
        '- Propose régulièrement des mini-jeux, devinettes ou quiz pour rendre la discussion interactive et amusante.',
        "- Pour toute action comme télécharger, acheter ou partager, demande systématiquement l'avis d'un adulte avant d'aller plus loin.",
        "- N'affiche jamais de liens externes bruts ; si un lien est nécessaire, invite toujours à demander l'aide d'un adulte."
      ].join('\n');
      return `${base}\n\n${childBlock}`;
    }
    if (structuredMode) {
      const structuredBlock = [
        'MODE RÉPONSES STRUCTURÉES ACTIF :',
        '### 1. RÉSUMÉ EXPRESS',
        '- Synthèse en 1-2 phrases maximum',
        '- Points clés immédiatement visibles',
        '',
        '### 2. ACTION / MÉTHODE',
        '- Maximum 5 étapes numérotées',
        '- Ordre logique et pratique',
        '- Instructions claires et concises',
        '',
        '### 3. PRÉCISIONS UTILES',
        '- Exemples concrets si pertinent',
        '- Points d\'attention et limites',
        '- Alternatives possibles',
        '',
        '### 4. SUITE (si nécessaire)',
        '- Prochaines étapes recommandées',
        '- Ressources additionnelles',
        '',
        'Note: Adapter le format selon la complexité:',
        '- Question simple = Résumé + Action uniquement',
        '- Question complexe = Structure complète',
        '- Listes uniquement si nécessaire pour la clarté'
      ].join('\n');
      return `${base}\n\n${structuredBlock}`;
    }
    return base;
  };

  const addRagContextMessage = (passages: { id: number; titre: string; contenu: string }[]) => {
    const ragMsg: RagContextMessage = {
      id: 'rag-' + Date.now(),
      passages,
      isRagContext: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, ragMsg as unknown as Message]);
  };



  const handleSendMessage = async (userMessage: string, imageFile?: File) => {

    // Vérifier que le message n'est pas vide
    if (!userMessage.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }

    // Préparer la timeline de raisonnement
    // Timeline retirée

    // Temps RAG (non utilisé visuellement depuis retrait de la timeline)
    // let ragStart = ragEnabled ? performance.now() : 0;
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
    // Heuristiques d'activation automatique RAG selon la requête
    const lower = userMessage.toLowerCase();
    const autoUseRag = autoRagEnabled && memoizedRagKeywords.some(kw => new RegExp(`(^|\b)${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\b|$)`, 'i').test(lower));

    // Étape RAG : recherche documentaire (si activé, auto, ou agent provider)
    let passages: Array<{ id: string; titre: string; contenu: string; extension?: string; origine?: string }> = [];
    if (ragEnabled || autoUseRag || (provider === 'mistral' && mistralAgentEnabled) || (provider === 'gemini' && geminiAgentEnabled)) {
      setIsRagSearching(true);
      try {
        passages = await searchDocuments(userMessage, 3, workspaceId);
        // Timeline retirée
        if (passages.length > 0) {
          const simplePassages = passages.map((p, idx) => ({ id: idx, titre: p.titre, contenu: p.contenu }));
          addRagContextMessage(simplePassages);
          // Mémoriser les documents utilisés (unicité par id)
          setUsedRagDocs(prev => {
            const byId = new Map<string, { id: string; titre: string; contenu: string; extension?: string; origine?: string }>();
            [...prev, ...passages].forEach(d => byId.set(String(d.id), { ...d, id: String(d.id) }));
            return Array.from(byId.values());
          });
        }
      } finally {
        setIsRagSearching(false);
      }
    }
    // Étape Web : recherche en ligne (si activée ou auto)
    let webContext = '';
    let webSources: Array<{ title: string; url: string }> = [];
    
    // 🔍 Recherche web intelligente : activée manuellement OU en fallback si pas de réponse
    const shouldSearchWebInitially = webEnabled;
    
    // Fonction pour détecter si l'IA a besoin d'informations web
    const needsWebSearch = (response: string): boolean => {
      const lowerResponse = response.toLowerCase();
      const indicators = [
        'je ne sais pas',
        'je ne connais pas',
        'je n\'ai pas d\'information',
        'je n\'ai pas accès',
        'mes connaissances',
        'ma base de données',
        'je ne peux pas',
        'impossible de',
        'pas d\'information récente',
        'données obsolètes',
        'information non disponible',
        'je ne trouve pas',
        'aucune information'
      ];
      return indicators.some(indicator => lowerResponse.includes(indicator));
    };
    
    // Fonction pour nettoyer le texte TTS (supprimer les références de sources)
    const cleanTextForTTS = (text: string): string => {
      return text
        .replace(/###.*$/gm, '') // Supprimer les sections ###
        .replace(/\[\d+\]/g, '') // Supprimer les références [1], [2], etc.
        .replace(/\(\d+\)/g, '') // Supprimer les références (1), (2), etc.
        .replace(/\s+/g, ' ') // Normaliser les espaces
        .trim();
    };
    
    if (shouldSearchWebInitially) {
      try {
        setIsWebSearching(true);
        const { searchWeb } = await import('@/services/webSearch');
        const webResults = await searchWeb(userMessage, 5, { enrich: false });
        if (webResults.length > 0) {
          webContext = 'RÉSULTATS WEB RÉCENTS :\n';
          webResults.slice(0, 5).forEach((r, idx) => {
            const snippet = (r.snippet || '').replace(/\s+/g, ' ').slice(0, 360);
            webContext += `- (${idx + 1}) [${r.title}] ${snippet}\nSource: ${r.url}\n`;
          });
          webContext += '\n';
          webSources = webResults.slice(0, 5).map(r => ({ title: r.title, url: r.url }));
          
          // Ajouter les nouvelles sources à la liste des sources utilisées (messageId sera mis à jour après)
          const newWebSources: WebSource[] = webResults.slice(0, 5).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.snippet,
            timestamp: new Date().toISOString(),
            messageId: `temp-${Date.now()}`, // Temporaire, sera mis à jour après création du message
          }));
          
          setUsedWebSources(prev => {
            // Éviter les doublons par URL
            const existingUrls = new Set(prev.map(s => s.url));
            const uniqueNewSources = newWebSources.filter(s => !existingUrls.has(s.url));
            return [...prev, ...uniqueNewSources];
          });
        }
      } catch (error) {
        console.warn('Erreur recherche web:', error);
        // Ajouter une alerte pour informer l'utilisateur
        addMessage('⚠️ Erreur lors de la recherche web. Vérifiez votre connexion internet.', false);
      } finally {
        setIsWebSearching(false);
      }
    }
    
    // Ajoute le message utilisateur localement
    const newMessage = addMessage(userMessage, true, imageFile);
    
    // Mettre à jour les messageId des sources web avec le vrai ID
    if (webEnabled && webSources.length > 0) {
      setUsedWebSources(prev => 
        prev.map(source => 
          source.messageId?.startsWith('temp-') 
            ? { ...source, messageId: newMessage.id }
            : source
        )
      );
    }
    // Extraction de mémoire utilisateur supprimée - système de mémoire retiré
    setIsLoading(true);
    try {
      // On prépare l'historique complet (y compris le message utilisateur tout juste ajouté)
      const fullHistory = [...messages, newMessage];
      // On ne garde que les messages qui ont un champ text (donc pas les messages RAG)
      const filteredHistory = fullHistory.filter(m => typeof m.text === 'string');
      // On construit le contexte documentaire pour le prompt
       // Timeline retirée
      let ragContext = '';
      // Récupération mémoire utilisateur supprimée - système de mémoire retiré
      const memoryContext = '';
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
      const prompt = `${getSystemPrompt()}\n${dateTimeInfo}${memoryContext}${(ragEnabled || autoUseRag) ? ragContext : ""}${webContext}`;
       // Timeline retirée
      // LOG prompt final
      const llmCfg: LlmConfig = {
        provider,
        gemini: geminiConfig,
        openai: openaiConfig,
        mistral: mistralConfig,
      };
      
      // Placeholder de réponse AI et streaming
      const aiMsg = addMessage('', false, undefined, webSources.length ? webSources : undefined);
      let acc = '';
      
      // Vérification de sécurité pour éviter la duplication
      if (!aiMsg || aiMsg.id === newMessage.id) {
        console.error('Erreur: ID de message dupliqué détecté');
        toast.error('Erreur interne. Veuillez réessayer.');
        return;
      }
      
      await streamMessage(
        llmCfg,
        filteredHistory.map(m => ({ text: m.text, isUser: m.isUser })),
        imageFile ? [imageFile] : undefined,
        prompt,
        {
          onToken: (token) => {
            acc += token;
            setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, text: (m.text || '') + token } : m));
          },
          onDone: () => {
            // 🔍 Vérifier si l'IA a besoin d'informations web (fallback intelligent)
            if (!webEnabled && needsWebSearch(acc)) {
              console.log('🔍 L\'IA indique un manque de connaissances - déclenchement recherche web automatique');
              
              // Ajouter un message informatif
              addMessage('🔍 Je ne connais pas cette information. Laissez-moi rechercher sur internet...', false);
              
              // Déclencher la recherche web automatique
              setTimeout(async () => {
                try {
                  setIsWebSearching(true);
                  const { searchWeb } = await import('@/services/webSearch');
                  const webResults = await searchWeb(userMessage, 5, { enrich: false });
                  
                  if (webResults.length > 0) {
                    // Construire le contexte web
                    let fallbackWebContext = 'RÉSULTATS WEB RÉCENTS :\n';
                    webResults.slice(0, 5).forEach((r, idx) => {
                      const snippet = (r.snippet || '').replace(/\s+/g, ' ').slice(0, 360);
                      fallbackWebContext += `- (${idx + 1}) [${r.title}] ${snippet}\nSource: ${r.url}\n`;
                    });
                    fallbackWebContext += '\n';
                    
                    // Ajouter les sources web
                    const fallbackWebSources: WebSource[] = webResults.slice(0, 5).map(r => ({
                      title: r.title,
                      url: r.url,
                      snippet: r.snippet,
                      timestamp: new Date().toISOString(),
                      messageId: newMessage.id,
                    }));
                    
                    setUsedWebSources(prev => {
                      const existingUrls = new Set(prev.map(s => s.url));
                      const uniqueNewSources = fallbackWebSources.filter(s => !existingUrls.has(s.url));
                      return [...prev, ...uniqueNewSources];
                    });
                    
                    // Relancer la requête avec les informations web
                    const fallbackPrompt = `${prompt}\n\n${fallbackWebContext}`;
                    const fallbackAiMsg = addMessage('', false, undefined, fallbackWebSources.map(r => ({ title: r.title, url: r.url })));
                    let fallbackAcc = '';
                    
                    await streamMessage(
                      llmCfg,
                      filteredHistory.map(m => ({ text: m.text, isUser: m.isUser })),
                      imageFile ? [imageFile] : undefined,
                      fallbackPrompt,
                      {
                        onToken: (token) => {
                          fallbackAcc += token;
                          setMessages(prev => prev.map(m => m.id === fallbackAiMsg.id ? { ...m, text: (m.text || '') + token } : m));
                        },
                        onDone: () => {
                          setIsAISpeaking(true);
                          const ttsText = cleanTextForTTS(fallbackAcc);
                          speak(ttsText, {
                            onEnd: () => {
                              setIsAISpeaking(false);
                              if (modeVocalAutoRef.current && !muted) {
                                playBip();
                                setTimeout(() => {
                                  if (modeVocalAutoRef.current && !muted && !listeningAuto && !isAISpeakingRef.current) {
                                    startAuto();
                                  }
                                }, 1000);
                              }
                            }
                          });
                        }
                      }
                    );
                  } else {
                    addMessage('❌ Aucun résultat trouvé sur internet pour cette question.', false);
                  }
                } catch (error) {
                  console.warn('Erreur recherche web fallback:', error);
                  addMessage('⚠️ Erreur lors de la recherche web automatique.', false);
                } finally {
                  setIsWebSearching(false);
                }
              }, 1000); // Délai pour laisser le temps à l'utilisateur de voir le message
              
              return; // Sortir de la fonction pour éviter le TTS de la première réponse
            }
            
            // Indiquer que l'IA commence à parler
            setIsAISpeaking(true);
            console.log('[Vocal Mode] IA commence à parler - microphone coupé');
            const ttsText = cleanTextForTTS(acc);
            speak(ttsText, {
              onEnd: () => {
                setIsAISpeaking(false);
                console.log('[Vocal Mode] IA a fini de parler - préparation redémarrage microphone');
                if (modeVocalAutoRef.current && !muted) {
                  playBip();
                  setTimeout(() => {
                    if (modeVocalAutoRef.current && !muted && !listeningAuto && !isAISpeakingRef.current) {
                      console.log('[Vocal Mode] Redémarrage du microphone après pause de sécurité');
                      startAuto();
                    } else {
                      console.log('[Vocal Mode] Redémarrage annulé - mode vocal désactivé manuellement');
                    }
                  }, 2000);
                }
              }
            });
          },
          onError: (err) => {
            console.error('Streaming error:', err);
            // En cas d'erreur, supprimer le message AI vide
            setMessages(prev => prev.filter(m => m.id !== aiMsg.id));
            toast.error('Erreur lors de la génération de la réponse');
          }
        }
      );
      // toast.success('Réponse reçue !', { duration: 2000 });
    } catch (error) {
      // Timeline retirée
      const errorMessage = error instanceof Error 
        ? error.message 
         : "Impossible d'obtenir une réponse du modèle. Réessaie.";
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
    const historyRaw = localStorage.getItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE));
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
          discussions = parsed.map((d: Discussion) => ({
            title: d.title || 'Discussion',
            messages: d.messages.map((msg: Message) => ({ ...msg, timestamp: new Date(msg.timestamp) })),
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
    localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_CURRENT_BASE), JSON.stringify(discussion.messages));
    setShowHistory(false);
  };

  // Supprimer une discussion
  const handleDeleteDiscussion = (idx: number) => {
    const newHistory = [...historyList];
    newHistory.splice(idx, 1);
    setHistoryList(newHistory);
    localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE), JSON.stringify(newHistory));
  };

  // Renommer une discussion (compatible avec le nouveau composant)
  const handleRenameDiscussion = (idx: number, newTitle: string) => {
    const newHistory = [...historyList];
    if (!newTitle.trim()) {
      // Recalcul de titre par défaut depuis le 1er message utilisateur
      const firstUser = newHistory[idx].messages.find(m => m.isUser)?.text || '';
      newTitle = firstUser
        ? (firstUser.length > 40 ? firstUser.slice(0, 40) + '…' : firstUser)
        : `Conversation ${idx + 1}`;
    }
    newHistory[idx] = { ...newHistory[idx], title: newTitle };
    setHistoryList(newHistory);
    localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE), JSON.stringify(newHistory));
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
  // Paramètres du mode vocal auto (persistés)
  const [autoVoiceConfig, setAutoVoiceConfig] = useState<{ silenceMs: number; minChars: number; minWords: number; cooldownMs: number }>(() => {
    try {
      const raw = localStorage.getItem('auto_voice_cfg');
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore parsing errors
    }
    return { silenceMs: 2500, minChars: 6, minWords: 2, cooldownMs: 1500 };
  });
  useEffect(() => {
    try { localStorage.setItem('auto_voice_cfg', JSON.stringify(autoVoiceConfig)); } catch {
      // Ignore storage errors
    }
  }, [autoVoiceConfig]);
  // Anti-doublon et cooldown
  const lastAutoSentAtRef = useRef<number>(0);
  const lastAutoTextRef = useRef<string>('');
  
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
        // Cooldown pour éviter les envois trop rapprochés
        const now = Date.now();
        if (now - lastAutoSentAtRef.current < autoVoiceConfig.cooldownMs) {
          return;
        }

        setTempTranscriptAuto(finalText);

        // Annuler le timeout précédent
        if (autoVoiceTimeout) {
          clearTimeout(autoVoiceTimeout);
        }

        // Validation de texte (longueur minimale, mots, fillers)
        const isAcceptable = (text: string): boolean => {
          const t = (text || '').trim();
          if (t.length < autoVoiceConfig.minChars) return false;
          const words = t.split(/\s+/).filter(Boolean);
          if (words.length < autoVoiceConfig.minWords) return false;
          const fillers = ['euh', 'heu', 'hum', 'hmm', 'bah', 'ben', 'heu…', 'euh…'];
          if (fillers.includes(t.toLowerCase())) return false;
          // Éviter d'envoyer deux fois le même texte
          if (t.toLowerCase() === lastAutoTextRef.current.toLowerCase()) return false;
          // Éviter d'envoyer le même que le dernier message utilisateur
          const lastUser = [...messages].reverse().find(m => m.isUser)?.text || '';
          if (lastUser && t.toLowerCase() === lastUser.toLowerCase()) return false;
          return true;
        };

        // Créer un nouveau timeout basé sur le silence configuré
        const timeout = setTimeout(() => {
          if (!isAISpeakingRef.current && modeVocalAutoRef.current) {
            const candidate = (finalText || '').trim();
            if (isAcceptable(candidate)) {
              console.log('[Vocal Mode] Envoi automatique du message:', candidate);
              playBip();
              lastAutoTextRef.current = candidate;
              lastAutoSentAtRef.current = Date.now();
              handleSendMessage(candidate);
              setTempTranscriptAuto('');
              resetAuto();
            } else {
              // Texte ignoré: on nettoie mais on continue à écouter
              setTempTranscriptAuto('');
              resetAuto();
            }
          } else if (isAISpeakingRef.current) {
            console.log('[Vocal Mode] Message ignoré car IA en train de parler');
          }
        }, autoVoiceConfig.silenceMs);

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
      lastAutoTextRef.current = '';
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
      // Empêcher la détection immédiate d'un doublon à la reprise
      lastAutoTextRef.current = '';
    }
  }, [isAISpeaking, listeningAuto, stopAuto, resetAuto, autoVoiceTimeout]); // Ajouter toutes les dépendances

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
      lastAutoTextRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  // Supprimer plusieurs discussions d'un coup (filtrage)
  const handleDeleteMultipleDiscussions = (indices: number[]) => {
    const indicesSet = new Set(indices);
    const newHistory = historyList.filter((_, idx) => !indicesSet.has(idx));
    setHistoryList(newHistory);
    localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE), JSON.stringify(newHistory));
  };

  // Fonction pour supprimer un message par son id
  const handleDeleteMessage = (id: string) => {
    setMessages(prev => {
      const updated = prev.filter(msg => msg.id !== id);
      localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_CURRENT_BASE), JSON.stringify(updated));
      // Mise à jour de l'historique : on retire le message de chaque discussion
      const historyRaw = localStorage.getItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE));
      if (historyRaw) {
        try {
          const history = JSON.parse(historyRaw);
          const updatedHistory = history.map((discussion: Discussion) => ({
            ...discussion,
            messages: discussion.messages.filter((msg: Message) => msg.id !== id)
          }));
          localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE), JSON.stringify(updatedHistory));
        } catch {
          // Ignore parsing errors
        }
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
      localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_CURRENT_BASE), JSON.stringify(updated));
      // Mise à jour de l'historique : on retire les messages de chaque discussion
      const historyRaw = localStorage.getItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE));
      if (historyRaw) {
        try {
          const history = JSON.parse(historyRaw);
          const updatedHistory = history.map((discussion: Discussion) => ({
            ...discussion,
            messages: discussion.messages.filter((msg: Message) => !selectedMessageIds.includes(msg.id))
          }));
          localStorage.setItem(wsKey(workspaceId, LOCALSTORAGE_KEY_BASE), JSON.stringify(updatedHistory));
        } catch {
          // Ignore parsing errors
        }
      }
      return updated;
    });
    setSelectedMessageIds([]);
    setSelectMode(false);
    setShowConfirmDeleteMultiple(false);
  };



  // Handler pour modifier un hyperparamètre Gemini
  const handleGeminiConfigChange = (key: keyof GeminiGenerationConfig, value: unknown) => {
    // Conversion sécurisée du type unknown vers string | number
    const convertedValue = typeof value === 'string' || typeof value === 'number' ? value : String(value);
    setGeminiConfig(cfg => ({ ...cfg, [key]: convertedValue }));
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
      {/* Halo de fond en bas de page */}
      <div className="bottom-horizon-glow" aria-hidden="true" />
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
          onOpenImageGeneration={() => setShowImageGeneration(true)}
          // onOpenMemory supprimé - système de mémoire retiré
          workspaceId={workspaceId}
          workspaces={workspaces}
          onChangeWorkspace={(id) => setWorkspaceId(id)}
          onCreateWorkspace={createWorkspace}
          onRenameWorkspace={renameWorkspace}
          onDeleteWorkspace={deleteWorkspace}
          
          stop={stop}
          modeVocalAuto={modeVocalAuto}
          setModeVocalAuto={setModeVocalAuto}
          hasActiveConversation={messages.length > 0}
          ragEnabled={ragEnabled}
          setRagEnabled={setRagEnabled}
          webEnabled={webEnabled}
          setWebEnabled={setWebEnabled}
          structuredMode={structuredMode}
          setStructuredMode={setStructuredMode}
          webSearching={isWebSearching}
          onOpenGeminiSettings={() => { if (!modeEnfant) setShowGeminiSettings(true); }}
          geminiConfig={{ ...geminiConfig } as Record<string, unknown>}
          provider={provider}
          onChangeProvider={(p) => { setProvider(p as 'gemini' | 'openai' | 'mistral'); localStorage.setItem('llm_provider', p); }}
          modePrive={modePrive}
          setModePrive={setModePrive}
          // Chiffrement persistant

          modeEnfant={modeEnfant}
          onToggleModeEnfant={() => {
            // Si on désactive alors qu'il est actif -> demander le PIN
            if (modeEnfant) {
              setShowChildPinDialog(true);
              return;
            }
            // Si on active et qu'aucun PIN n'est défini -> demander un nouveau PIN
            if (!childPin) {
              setShowChildPinDialog(true);
            } else {
              setModeEnfant(true);
            }
          }}
          onOpenChildPinSettings={() => setShowChildChangePinDialog(true)}
          autoVoiceConfig={autoVoiceConfig}
          onUpdateAutoVoiceConfig={(key, value) => setAutoVoiceConfig(cfg => ({ ...cfg, [key]: value }))}
          selectMode={selectMode}
          onToggleSelectMode={handleToggleSelectMode}
          selectedCount={selectedMessageIds.length}
          totalCount={messages.filter((m: Message) => !(m as unknown as RagContextMessage).isRagContext).length}
          onSelectAll={() => {
            const allIds = messages.filter((m: Message) => !(m as unknown as RagContextMessage).isRagContext).map((m: Message) => m.id);
            setSelectedMessageIds(allIds);
          }}
          onDeselectAll={() => setSelectedMessageIds([])}
          onRequestDelete={() => setShowConfirmDeleteMultiple(true)}
          showConfirmDelete={showConfirmDeleteMultiple}
          setShowConfirmDelete={setShowConfirmDeleteMultiple}
          onDeleteConfirmed={handleDeleteMultipleMessages}
        />

        {/* Indicateur visuel du mode privé SOUS le header, centré (caché en mode enfant) */}
        <PrivateModeBanner visible={modePrive && !modeEnfant} />
        {/* Indicateur visuel du mode enfant */}
        <ChildModeBanner visible={modeEnfant} />



        {/* Enhanced Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/20 dark:ring-slate-700/20 relative">
          <div className="flex-1 overflow-y-auto relative" style={{ paddingBottom: inputHeight }}>
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onDeleteMessage={handleDeleteMessage}
            onReplyToMessage={(content: string) => {
              try {
                document.dispatchEvent(new CustomEvent('voice-input:prefill', { detail: String(content || '') }));
              } catch {
                // Ignore event dispatch errors
              }
            }}
              selectMode={selectMode}
              selectedMessageIds={selectedMessageIds}
              onSelectMessage={handleSelectMessage}
              modePrive={modePrive || modeEnfant}
              modeEnfant={modeEnfant}
            />
            {/* Sidebar RAG à droite (desktop) quand RAG/Web actif, agent actif, recherche en cours, ou résultats présents */}
            {((ragEnabled || ((provider === 'mistral' && mistralAgentEnabled) || (provider === 'gemini' && geminiAgentEnabled)) || isRagSearching || usedRagDocs.length > 0) && !modeEnfant) && (
              <>
                <div className="hidden lg:block">
                  <RagSidebar onOpenRagDocs={() => setShowRagDocs(true)} usedDocs={usedRagDocs} workspaceId={workspaceId} />
                </div>
                {/* Bouton flottant pour mobile */}
                <button
                  className="lg:hidden fixed right-3 bottom-28 z-40 rounded-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl border border-white/20"
                  onClick={() => setShowRagSidebarMobile(true)}
                  aria-label="Ouvrir les documents RAG"
                >
                  Docs
                </button>
                <RagSidebarDrawer
                  open={showRagSidebarMobile}
                  onClose={() => setShowRagSidebarMobile(false)}
                  usedDocs={usedRagDocs}
                  onOpenRagDocs={() => setShowRagDocs(true)}
                  workspaceId={workspaceId}
                />
              </>
            )}

            {/* Sidebar Web Sources à gauche (desktop) quand Web actif, agent actif, recherche en cours, ou sources présentes */}
            {((webEnabled || ((provider === 'mistral' && mistralAgentEnabled) || (provider === 'gemini' && geminiAgentEnabled)) || isWebSearching || usedWebSources.length > 0) && !modeEnfant) && (
              <>
                <div className="hidden lg:block">
                  <WebSourcesSidebar usedSources={usedWebSources} />
                </div>
                {/* Bouton flottant pour mobile */}
                <button
                  className="lg:hidden fixed left-3 bottom-28 z-40 rounded-full px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl border border-white/20"
                  onClick={() => setShowWebSidebarMobile(true)}
                  aria-label="Ouvrir les sources web"
                >
                  Web
                </button>
                <WebSourcesDrawer
                  open={showWebSidebarMobile}
                  onClose={() => setShowWebSidebarMobile(false)}
                  usedSources={usedWebSources}
                />
              </>
            )}
          </div>
          {/* Indicateur Agent Mistral */}
          {(provider === 'mistral' && mistralAgentEnabled) || (provider === 'gemini' && geminiAgentEnabled) ? (
            <div className="absolute right-3 bottom-28 z-40">
              <AgentStatus
                visible
                title={provider === 'gemini' ? 'Agent Gemini' : 'Agent Mistral'}
                steps={{
                  web: { state: isWebSearching ? 'running' : 'idle', label: 'Recherche web' },
                  rag: { state: isRagSearching ? 'running' : 'idle', label: 'Recherche documents' },
                  generate: { state: isLoading ? 'running' : 'idle', label: 'Génération de réponse' },
                }}
              />
            </div>
          ) : null}
        </Card>
      </div>

      {/* Dialog PIN pour activer/désactiver le mode enfant */}
      <ChildModePinDialog
        open={showChildPinDialog}
        modeActive={modeEnfant}
        onClose={handleCloseChildPin}
        onConfirmPin={handleConfirmChildPin}
        requireToDisable
        minLength={4}
      />

      <ChildModeChangePinDialog
        open={showChildChangePinDialog}
        onClose={() => setShowChildChangePinDialog(false)}
        isCurrentValid={(pin) => pin === childPin}
        onConfirmNewPin={(newPin) => {
          setChildPin(newPin);
          try { localStorage.setItem('mode_enfant_pin', newPin); } catch {
            // Ignore storage errors
          }
          setShowChildChangePinDialog(false);
          toast.success('PIN mis à jour.');
        }}
      />

      {/* Zone de saisie fixée en bas de l'écran */}
      <div id="voice-input-wrapper" ref={voiceInputContainerRef} className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700 px-2 pt-2 pb-2 backdrop-blur-xl">
        <VoiceInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          provider={provider}
          agentEnabled={(provider === 'gemini' && geminiAgentEnabled) || (provider === 'mistral' && mistralAgentEnabled)}
          onToggleAgent={() => {
            if (provider === 'gemini') setGeminiAgentEnabled(!geminiAgentEnabled);
            if (provider === 'mistral') setMistralAgentEnabled(!mistralAgentEnabled);
          }}
          webEnabled={webEnabled}
          webSearching={isWebSearching}
        />
      </div>

      <Suspense fallback={null}>
        <TTSSettingsModalLazy
          open={modeEnfant ? false : showTTSSettings}
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
        <RagDocsModalLazy open={modeEnfant ? false : showRagDocs} onClose={() => setShowRagDocs(false)} workspaceId={workspaceId} />
      </Suspense>

      {/* Modale de gestion de la mémoire supprimée - système de mémoire retiré */}

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
          agentEnabled={geminiAgentEnabled}
          onToggleAgent={(enabled) => setGeminiAgentEnabled(enabled)}
          autoRagEnabled={autoRagEnabled}
          ragKeywords={memoizedRagKeywords}
          onToggleAutoRag={setAutoRagEnabled}
          onChangeRagKeywords={setRagKeywords}
        />
      </Suspense>

      {/* Réglages OpenAI */}
      <Suspense fallback={null}>
        <OpenAISettingsDrawerLazy
          open={modeEnfant ? false : showOpenAISettings}
          onOpenChange={(open) => !modeEnfant && setShowOpenAISettings(open)}
          openaiConfig={openaiConfig}
          onConfigChange={(key, value) => setOpenaiConfig(cfg => ({ ...cfg, [key]: value }))}
          onReset={() => setOpenaiConfig({ temperature: 0.7, top_p: 0.95, max_tokens: 4096, model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini' })}
          onClose={() => setShowOpenAISettings(false)}
          DEFAULTS={{ temperature: 0.7, top_p: 0.95, max_tokens: 4096, model: (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini' }}
          autoRagEnabled={autoRagEnabled}
          ragKeywords={memoizedRagKeywords}
          onToggleAutoRag={setAutoRagEnabled}
          onChangeRagKeywords={setRagKeywords}
        />
      </Suspense>

      {/* Réglages Mistral */}
      <Suspense fallback={null}>
        <MistralSettingsDrawerLazy
          open={modeEnfant ? false : showMistralSettings}
          onOpenChange={(open) => !modeEnfant && setShowMistralSettings(open)}
          mistralConfig={mistralConfig}
                          onConfigChange={(key, value) => setMistralConfig(cfg => ({ ...cfg, [key]: value }))}
                onReset={() => setMistralConfig({ temperature: 0.7, top_p: 0.95, max_tokens: 4096, model: (import.meta.env.VITE_MISTRAL_MODEL as string) || 'mistral-small-latest' })}
          onClose={() => setShowMistralSettings(false)}
          DEFAULTS={{ temperature: 0.7, top_p: 0.95, max_tokens: 4096, model: (import.meta.env.VITE_MISTRAL_MODEL as string) || 'mistral-small-latest' }}
          agentEnabled={mistralAgentEnabled}
          onToggleAgent={(enabled) => setMistralAgentEnabled(enabled)}
          autoRagEnabled={autoRagEnabled}
          ragKeywords={memoizedRagKeywords}
          onToggleAutoRag={setAutoRagEnabled}
          onChangeRagKeywords={setRagKeywords}
        />
      </Suspense>

      {/* Mémoire: gestion via modale */}

      
      {/* Modale d'ouverture d'espace de travail */}
      <WorkspaceOpeningDialog open={workspaceOpeningOpen} onOpenChange={setWorkspaceOpeningOpen} name={workspaceOpeningName} />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* PWA Meta Management */}
      <PWAMeta />
      
      {/* PWA Shortcuts */}
      <PWAShortcuts 
        onNewDiscussion={handleNewDiscussion}
        onToggleVoice={() => setModeVocalAuto(!modeVocalAuto)}
        onTogglePrivateMode={() => setModePrive(!modePrive)}
      />
      
      {/* Modal de génération d'images */}
      <Suspense fallback={null}>
        <ImageGenerationModalLazy
          open={showImageGeneration}
          onClose={() => setShowImageGeneration(false)}
          onImageGenerated={handleImageGenerated}
        />
      </Suspense>
      
      {/* Le chiffrement est maintenant automatique et permanent */}
    </div>
  );
}

export default App;