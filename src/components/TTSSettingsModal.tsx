import React from 'react';
import { X, RefreshCcw, Play } from 'lucide-react';
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Réglages de la synthèse vocale</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Voix :</label>
            <select
              value={voiceURI}
              onChange={e => setVoiceURI(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {availableVoices.length === 0 && <option value="">Aucune voix disponible</option>}
              {availableVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} {voice.default ? '(par défaut)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vitesse : <span className="font-mono">{rate.toFixed(2)}</span></label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Lent</span>
              <span>Normal</span>
              <span>Rapide</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tonalité : <span className="font-mono">{pitch.toFixed(2)}</span></label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={pitch}
              onChange={e => setPitch(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Grave</span>
              <span>Normal</span>
              <span>Aiguë</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Volume : <span className="font-mono">{volume.toFixed(2)}</span></label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Muet</span>
              <span>Moyen</span>
              <span>Fort</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={testVoice} variant="outline" className="flex-1 flex items-center gap-2"><Play className="w-4 h-4" /> Tester la voix</Button>
          <Button onClick={resetSettings} variant="ghost" className="flex-1 flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Réinitialiser</Button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleExport} variant="secondary" className="flex-1">Exporter</Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1">Importer</Button>
          <input type="file" accept="application/json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
          <Button onClick={handleDelete} variant="destructive" className="flex-1">Supprimer</Button>
        </div>
        <Button onClick={onClose} className="mt-4 w-full">Fermer</Button>
      </div>
    </div>
  );
} 