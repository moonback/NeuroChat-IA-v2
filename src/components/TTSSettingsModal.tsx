import React, { useEffect, useRef, useState } from 'react';
import { X, RefreshCcw, Play, Volume2, Sliders, Activity, UploadCloud, DownloadCloud, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';

interface TTSSettingsModalProps {
  open: boolean;
  onClose: () => void;
  rate: number;
  setRate: (v: number) => void;
  pitch: number;
  setPitch: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  voiceURI: string;
  setVoiceURI: (v: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  testVoice: () => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (file: File) => Promise<boolean>;
  deleteSettings: () => void;
}

export function TTSSettingsModal({ open, onClose, rate, setRate, pitch, setPitch, volume, setVolume, voiceURI, setVoiceURI, availableVoices, testVoice, resetSettings, exportSettings, importSettings, deleteSettings }: TTSSettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLSelectElement>(null);
  const [isTesting, setIsTesting] = useState(false);

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

  // Animation d'onde lors du test de la voix
  const handleTestVoice = () => {
    setIsTesting(true);
    testVoice();
    setTimeout(() => setIsTesting(false), 1200);
  };

  // Feedback toast après chaque action
  const handleExport = () => {
    const url = exportSettings();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tts_settings.json';
    a.click();
    toast.success('Réglages exportés !');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ok = await importSettings(file);
      if (ok) {
        toast.success('Réglages importés !');
      } else {
        toast.error('Erreur lors de l\'import.');
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('Supprimer définitivement les réglages TTS ?')) {
      deleteSettings();
      toast.success('Réglages supprimés.');
    }
  };

  const handleReset = () => {
    resetSettings();
    toast.success('Réglages réinitialisés.');
  };
  

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-12xl px-2 sm:px-6 py-2 sm:py-6 rounded-3xl shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[95vh] overflow-y-auto">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              Réglages de la synthèse vocale
            </DrawerTitle>
            <button onClick={onClose} className="ml-auto text-slate-500 hover:text-red-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400" title="Fermer" aria-label="Fermer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </DrawerHeader>
        {/* Ancien contenu de la modale ici, sans le header/titre ni bouton fermer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Voix */}
          <div className="relative bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/40 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/30 p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="tts-voice" className="font-semibold flex items-center gap-1"><Volume2 className="w-4 h-4 text-blue-400" /> Voix</label>
              {voiceURI === (availableVoices[0]?.voiceURI || '') && (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-xs text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">par défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" title="Choisissez la voix utilisée pour la synthèse."><Info className="w-4 h-4" /></button>
              <button type="button" className="ml-2 text-xs text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded transition" onClick={() => setVoiceURI(availableVoices[0]?.voiceURI || '')}>Réinit.</button>
            </div>
            <select
              id="tts-voice"
              value={voiceURI}
              onChange={e => setVoiceURI(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={availableVoices.length === 0}
            >
              {availableVoices.length === 0 && <option value="">Aucune voix disponible</option>}
              {availableVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} {voice.default ? '(par défaut)' : ''} [{voice.lang}]
                </option>
              ))}
            </select>
          </div>
          {/* Vitesse */}
          <div className="relative bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/40 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/30 p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="tts-rate" className="font-semibold flex items-center gap-1"><Activity className="w-4 h-4 text-purple-400" /> Vitesse</label>
              {rate === 1 && (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-xs text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">par défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" title="Contrôle la vitesse de la voix (1 = normal)"><Info className="w-4 h-4" /></button>
              <button type="button" className="ml-2 text-xs text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded transition" onClick={() => setRate(1)}>Réinit.</button>
            </div>
            <input
              id="tts-rate"
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-blue-500"
              disabled={availableVoices.length === 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Lent</span>
              <span>Normal</span>
              <span>Rapide</span>
            </div>
          </div>
          {/* Tonalité */}
          <div className="relative bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/40 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/30 p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="tts-pitch" className="font-semibold flex items-center gap-1"><Sliders className="w-4 h-4 text-pink-400" /> Tonalité</label>
              {pitch === 1 && (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-xs text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">par défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" title="Contrôle la tonalité de la voix (1 = normal)"><Info className="w-4 h-4" /></button>
              <button type="button" className="ml-2 text-xs text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded transition" onClick={() => setPitch(1)}>Réinit.</button>
            </div>
            <input
              id="tts-pitch"
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={pitch}
              onChange={e => setPitch(Number(e.target.value))}
              className="w-full accent-purple-500"
              disabled={availableVoices.length === 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Grave</span>
              <span>Normal</span>
              <span>Aiguë</span>
            </div>
          </div>
          {/* Volume */}
          <div className="relative bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/40 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/30 p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="tts-volume" className="font-semibold flex items-center gap-1"><Volume2 className="w-4 h-4 text-green-400" /> Volume</label>
              {volume === 1 && (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-xs text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">par défaut</span>
              )}
              <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" title="Contrôle le volume de la voix (1 = fort, 0 = muet)"><Info className="w-4 h-4" /></button>
              <button type="button" className="ml-2 text-xs text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-1 rounded transition" onClick={() => setVolume(1)}>Réinit.</button>
            </div>
            <input
              id="tts-volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-green-500"
              disabled={availableVoices.length === 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Muet</span>
              <span>Moyen</span>
              <span>Fort</span>
            </div>
          </div>
        </div>
        {/* Animation d'onde lors du test de la voix, boutons, etc. */}
        <div className="flex gap-2 mt-6 items-center">
          <Button onClick={handleTestVoice} variant="outline" className="flex-1 flex items-center gap-2" disabled={availableVoices.length === 0}>
            <Play className="w-4 h-4" /> Tester la voix
          </Button>
          <div className="relative flex items-center justify-center w-10 h-8">
            {isTesting && (
              <span className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
                <span className="block w-8 h-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full animate-pulse" style={{ opacity: 0.5 }}></span>
              </span>
            )}
          </div>
          <Button onClick={handleReset} variant="secondary" className="flex-1 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Réinitialiser tout
          </Button>
        </div>
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
          <Button onClick={onClose} className="w-full text-base py-3">Fermer</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 