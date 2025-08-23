/**
 * 🎙️ Modal des Paramètres ElevenLabs TTS
 * 
 * Interface complète pour configurer la synthèse vocale ElevenLabs
 * - Sélection de voix et modèles
 * - Paramètres avancés de qualité
 * - Prévisualisation et tests
 * - Gestion des réglages
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  RefreshCcw, 
  Play, 
  Volume2, 
  Sliders, 
  Activity, 
  UploadCloud, 
  DownloadCloud, 
  Trash2, 
  Info, 
  Settings,
  Zap,
  Globe,
  Mic,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useElevenLabsTTS, ElevenLabsTTSSettings } from '@/hooks/useElevenLabsTTS';

interface ElevenLabsTTSSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ElevenLabsTTSSettingsModal({ open, onClose }: ElevenLabsTTSSettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLSelectElement>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'voices' | 'settings' | 'advanced'>('voices');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const {
    isEnabled,
    isLoading,
    apiKeyValid,
    fallbackToNative,
    usageStats,
    voices,
    models,
    settings,
    currentVoice,
    currentModel,
    updateSettings,
    testVoice,
    resetSettings,
    exportSettings,
    importSettings,
    deleteSettings,
    refresh,
    frenchVoices,
    englishVoices,
  } = useElevenLabsTTS();

  // Focus auto sur le premier champ à l'ouverture
  useEffect(() => {
    if (open && firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [open]);

  // Raccourci clavier Échap pour fermer
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Charger la clé API depuis le localStorage au démarrage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('elevenlabs_api_key') || '';
    setApiKey(savedApiKey);
  }, []);

  // Sauvegarder la clé API
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Veuillez entrer une clé API');
      return;
    }

    try {
      // Sauvegarder dans le localStorage
      localStorage.setItem('elevenlabs_api_key', apiKey);
      
      // Mettre à jour dans le hook (si la fonction existe)
      toast.success('Clé API sauvegardée');
      
      // Recharger les données
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de la clé API');
    }
  };

  // Animation d'onde lors du test de la voix
  const handleTestVoice = async () => {
    if (!isEnabled || !apiKeyValid) {
      toast.error('ElevenLabs TTS non disponible');
      return;
    }

    setIsTesting(true);
    try {
      await testVoice();
      setTimeout(() => setIsTesting(false), 2000);
    } catch (error) {
      setIsTesting(false);
    }
  };

  // Feedback toast après chaque action
  const handleExport = () => {
    const url = exportSettings();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elevenlabs_tts_settings.json';
    a.click();
    toast.success('Réglages ElevenLabs exportés !');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ok = await importSettings(file);
      if (ok) {
        toast.success('Réglages ElevenLabs importés !');
      } else {
        toast.error('Erreur lors de l\'import.');
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('Supprimer définitivement les réglages ElevenLabs TTS ?')) {
      deleteSettings();
      toast.success('Réglages supprimés.');
    }
  };

  const handleReset = () => {
    resetSettings();
    toast.success('Réglages réinitialisés.');
  };

  const handleRefresh = async () => {
    await refresh();
  };

  // Rendu du statut de l'API
  const renderApiStatus = () => (
    <div className="mb-4 p-4 rounded-2xl border bg-gradient-to-br from-white/90 to-slate-50/60 dark:from-slate-900/80 dark:to-slate-950/40 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-slate-500" />
        <label className="font-semibold">Configuration API ElevenLabs</label>
      </div>
      
      <div className="space-y-3">
        {/* Champ de saisie de la clé API */}
        <div className="relative">
          <Input
            type={showApiKey ? 'text' : 'password'}
            placeholder="Entrez votre clé API ElevenLabs"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title={showApiKey ? 'Masquer la clé' : 'Afficher la clé'}
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Bouton de sauvegarde */}
        <Button
          onClick={handleSaveApiKey}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!apiKey.trim()}
        >
          Sauvegarder la clé API
        </Button>

        {/* Statut de l'API */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${apiKeyValid ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {apiKeyValid ? 'Clé API valide' : 'Clé API invalide ou manquante'}
          </span>
          {fallbackToNative && (
            <Badge variant="outline" className="ml-2 text-xs">
              Fallback TTS natif
            </Badge>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
          <div className="font-medium mb-1">Comment obtenir votre clé API :</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Créez un compte sur <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">elevenlabs.io</a></li>
            <li>Allez dans votre profil → API Key</li>
            <li>Copiez la clé et collez-la ci-dessus</li>
            <li>Cliquez sur "Sauvegarder la clé API"</li>
          </ol>
        </div>
      </div>
    </div>
  );

  // Rendu des statistiques d'utilisation
  const renderUsageStats = () => {
    if (!usageStats) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Statistiques d'utilisation</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Voix disponibles: <span className="font-semibold">{voices.length}</span></div>
          <div>Modèles: <span className="font-semibold">{models.length}</span></div>
          {usageStats.character_count && (
            <div>Caractères utilisés: <span className="font-semibold">{usageStats.character_count.toLocaleString()}</span></div>
          )}
        </div>
      </div>
    );
  };

  // Rendu des onglets
  const renderTabs = () => (
    <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      {[
        { id: 'voices', label: 'Voix', icon: Mic },
        { id: 'settings', label: 'Paramètres', icon: Settings },
        { id: 'advanced', label: 'Avancé', icon: Sliders },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );

  // Rendu de l'onglet Voix
  const renderVoicesTab = () => (
    <div className="space-y-4">
      {/* Sélection de voix */}
      <div className="bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/40 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="w-5 h-5 text-blue-500" />
          <label className="font-semibold">Voix ElevenLabs</label>
          {currentVoice && (
            <Badge variant="outline" className="ml-2">
              {currentVoice.category}
            </Badge>
          )}
        </div>
        
        <select
          ref={firstFieldRef}
          value={settings.voice_id}
          onChange={(e) => updateSettings({ voice_id: e.target.value })}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={voices.length === 0}
        >
          {voices.length === 0 && <option value="">Chargement des voix...</option>}
          {voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} [{voice.labels.language || 'N/A'}]
            </option>
          ))}
        </select>

        {currentVoice && (
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {currentVoice.description || 'Aucune description disponible'}
          </div>
        )}
      </div>

      {/* Sélection de modèle */}
      <div className="bg-gradient-to-br from-white/90 to-purple-50/60 dark:from-slate-900/80 dark:to-purple-950/40 rounded-2xl shadow-md border border-purple-100 dark:border-purple-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-purple-500" />
          <label className="font-semibold">Modèle de synthèse</label>
        </div>
        
        <select
          value={settings.model_id}
          onChange={(e) => updateSettings({ model_id: e.target.value })}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          disabled={models.length === 0}
        >
          {models.length === 0 && <option value="">Chargement des modèles...</option>}
          {models.map((model) => (
            <option key={model.model_id} value={model.model_id}>
              {model.name} [{model.language}]
            </option>
          ))}
        </select>

        {currentModel && (
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {currentModel.description || 'Aucune description disponible'}
          </div>
        )}
      </div>

      {/* Voix populaires par langue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {frenchVoices.length > 0 && (
          <div className="bg-gradient-to-br from-white/90 to-green-50/60 dark:from-slate-900/80 dark:to-green-950/40 rounded-2xl shadow-md border border-green-100 dark:border-green-900/30 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              🇫🇷 Voix françaises
            </h4>
            <div className="space-y-1">
              {frenchVoices.slice(0, 3).map((voice) => (
                <button
                  key={voice.voice_id}
                  onClick={() => updateSettings({ voice_id: voice.voice_id })}
                  className={`w-full text-left text-xs p-2 rounded transition-colors ${
                    settings.voice_id === voice.voice_id
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'hover:bg-green-50 dark:hover:bg-green-900/30'
                  }`}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {englishVoices.length > 0 && (
          <div className="bg-gradient-to-br from-white/90 to-orange-50/60 dark:from-slate-900/80 dark:to-orange-950/40 rounded-2xl shadow-md border border-orange-100 dark:border-orange-900/30 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              🇺🇸 Voix anglaises
            </h4>
            <div className="space-y-1">
              {englishVoices.slice(0, 3).map((voice) => (
                <button
                  key={voice.voice_id}
                  onClick={() => updateSettings({ voice_id: voice.voice_id })}
                  className={`w-full text-left text-xs p-2 rounded transition-colors ${
                    settings.voice_id === voice.voice_id
                      ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/30'
                  }`}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Rendu de l'onglet Paramètres
  const renderSettingsTab = () => (
    <div className="space-y-4">
      {/* Stabilité */}
      <div className="bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/40 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-500" />
          <label className="font-semibold">Stabilité</label>
          {settings.stability === 0.5 && (
            <Badge variant="outline" className="ml-2">Par défaut</Badge>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.stability}
          onChange={(e) => updateSettings({ stability: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
          <span>Variable</span>
          <span>Stable</span>
        </div>
      </div>

      {/* Similarité */}
      <div className="bg-gradient-to-br from-white/90 to-purple-50/60 dark:from-slate-900/80 dark:to-purple-950/40 rounded-2xl shadow-md border border-purple-100 dark:border-purple-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-5 h-5 text-purple-500" />
          <label className="font-semibold">Similarité</label>
          {settings.similarity_boost === 0.75 && (
            <Badge variant="outline" className="ml-2">Par défaut</Badge>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.similarity_boost}
          onChange={(e) => updateSettings({ similarity_boost: Number(e.target.value) })}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
          <span>Différente</span>
          <span>Similaire</span>
        </div>
      </div>

      {/* Style */}
      <div className="bg-gradient-to-br from-white/90 to-pink-50/60 dark:from-slate-900/80 dark:to-pink-950/40 rounded-2xl shadow-md border border-pink-100 dark:border-pink-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-pink-500" />
          <label className="font-semibold">Style</label>
          {settings.style === 0.0 && (
            <Badge variant="outline" className="ml-2">Par défaut</Badge>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.style}
          onChange={(e) => updateSettings({ style: Number(e.target.value) })}
          className="w-full accent-pink-500"
        />
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
          <span>Neutre</span>
          <span>Expressif</span>
        </div>
      </div>

      {/* Speaker Boost */}
      <div className="bg-gradient-to-br from-white/90 to-green-50/60 dark:from-slate-900/80 dark:to-green-950/40 rounded-2xl shadow-md border border-green-100 dark:border-green-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-5 h-5 text-green-500" />
          <label className="font-semibold">Amélioration du locuteur</label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.use_speaker_boost}
            onChange={(e) => updateSettings({ use_speaker_boost: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Activer l'amélioration du locuteur</span>
        </label>
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Améliore la clarté et la définition de la voix
        </div>
      </div>
    </div>
  );

  // Rendu de l'onglet Avancé
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      {/* Format de sortie */}
      <div className="bg-gradient-to-br from-white/90 to-indigo-50/60 dark:from-slate-900/80 dark:to-indigo-950/40 rounded-2xl shadow-md border border-indigo-100 dark:border-indigo-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-indigo-500" />
          <label className="font-semibold">Format de sortie</label>
        </div>
        <select
          value={settings.output_format}
          onChange={(e) => updateSettings({ output_format: e.target.value })}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="mp3_44100_128">MP3 44.1kHz 128kbps (Recommandé)</option>
          <option value="mp3_44100_96">MP3 44.1kHz 96kbps</option>
          <option value="mp3_44100_64">MP3 44.1kHz 64kbps</option>
          <option value="mp3_44100_32">MP3 44.1kHz 32kbps</option>
        </select>
      </div>

      {/* Actions de maintenance */}
      <div className="bg-gradient-to-br from-white/90 to-amber-50/60 dark:from-slate-900/80 dark:to-amber-950/40 rounded-2xl shadow-md border border-amber-100 dark:border-amber-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCcw className="w-5 h-5 text-amber-500" />
          <label className="font-semibold">Maintenance</label>
        </div>
        <div className="space-y-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 mr-2" />
            )}
            Rafraîchir les données
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-4xl px-2 sm:px-6 py-2 sm:py-6 rounded-3xl shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[95vh] overflow-y-auto">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-500" />
            <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              Paramètres ElevenLabs TTS
            </DrawerTitle>
            <button 
              onClick={onClose} 
              className="ml-auto text-slate-500 hover:text-red-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400" 
              title="Fermer" 
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DrawerHeader>

        {/* Statut de l'API */}
        {renderApiStatus()}

        {/* Statistiques d'utilisation */}
        {renderUsageStats()}

        {/* Onglets */}
        {renderTabs()}

        {/* Contenu des onglets */}
        <div className="mb-6">
          {activeTab === 'voices' && renderVoicesTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-6 items-center">
          <Button 
            onClick={handleTestVoice} 
            variant="outline" 
            className="flex-1 flex items-center gap-2" 
            disabled={!isEnabled || !apiKeyValid || isLoading}
          >
            <Play className="w-4 h-4" /> 
            Tester la voix
          </Button>
          <div className="relative flex items-center justify-center w-10 h-8">
            {isTesting && (
              <span className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
                <span className="block w-8 h-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full animate-pulse" style={{ opacity: 0.5 }}></span>
              </span>
            )}
          </div>
          <Button 
            onClick={handleReset} 
            variant="secondary" 
            className="flex-1 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> 
            Réinitialiser
          </Button>
        </div>

        {/* Boutons d'import/export */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleExport} variant="secondary" className="flex-1 flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> Exporter
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1 flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Importer
          </Button>
          <input type="file" accept="application/json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
          <Button onClick={handleDelete} variant="destructive" className="flex-1 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Supprimer
          </Button>
        </div>

        <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
          <Button onClick={onClose} className="w-full text-base py-3">
            Fermer
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
