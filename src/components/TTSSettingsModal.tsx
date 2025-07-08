import React, { useEffect, useRef, useState } from 'react';
import { X, RefreshCcw, Play, Volume2, Sliders, Activity, UploadCloud, DownloadCloud, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  // Trouver la voix sélectionnée
  const selectedVoice = availableVoices.find(v => v.voiceURI === voiceURI);

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full p-1 bg-white dark:bg-slate-800 shadow-lg" aria-label="Fermer">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-500" /> Réglages de la synthèse vocale
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2" htmlFor="voice-select">
              <Volume2 className="w-4 h-4 text-blue-400" /> Voix&nbsp;:
            </label>
            <select
              ref={firstFieldRef}
              id="voice-select"
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
            {selectedVoice && (
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>{selectedVoice.name} [{selectedVoice.lang}] {selectedVoice.default && <span className="text-green-600">(par défaut)</span>}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2" htmlFor="rate-slider">
              <Activity className="w-4 h-4 text-purple-400" /> Vitesse&nbsp;: <span className="font-mono">{rate.toFixed(2)}</span>
            </label>
            <input
              id="rate-slider"
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
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2" htmlFor="pitch-slider">
              <Sliders className="w-4 h-4 text-pink-400" /> Tonalité&nbsp;: <span className="font-mono">{pitch.toFixed(2)}</span>
            </label>
            <input
              id="pitch-slider"
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
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2" htmlFor="volume-slider">
              <Volume2 className="w-4 h-4 text-green-400" /> Volume&nbsp;: <span className="font-mono">{volume.toFixed(2)}</span>
            </label>
            <input
              id="volume-slider"
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
        {/* Animation d'onde lors du test de la voix */}
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
            <RefreshCcw className="w-4 h-4" /> Réinitialiser
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
        <Button onClick={onClose} className="mt-4 w-full text-base py-3">Fermer</Button>
      </div>
    </div>
  ) : null;
} 