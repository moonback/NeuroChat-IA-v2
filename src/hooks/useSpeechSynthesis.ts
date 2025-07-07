import { useCallback, useRef, useState, useEffect } from 'react';

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceURI?: string;
}

const LS_KEY = 'tts_settings';
const DEFAULTS = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: '',
};

// Fonction utilitaire pour filtrer les caractères spéciaux
function filtrerCaracteresSpeciaux(texte: string): string {
  // Garde lettres, chiffres, accents, espaces et ponctuation de base
  return texte.replace(/[^a-zA-Z0-9À-ÿ\s.,!?'-]/g, '');
}

export function useSpeechSynthesis() {
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [pitch, setPitch] = useState(DEFAULTS.pitch);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [voiceURI, setVoiceURI] = useState<string>(DEFAULTS.voiceURI);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lang, setLang] = useState<'fr-FR' | 'en-US'>('fr-FR');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Charger les réglages depuis le localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const { rate, pitch, volume, voiceURI } = JSON.parse(saved);
        if (typeof rate === 'number') setRate(rate);
        if (typeof pitch === 'number') setPitch(pitch);
        if (typeof volume === 'number') setVolume(volume);
        if (typeof voiceURI === 'string') setVoiceURI(voiceURI);
      } catch {}
    }
  }, []);

  // Sauvegarder les réglages à chaque changement
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ rate, pitch, volume, voiceURI }));
  }, [rate, pitch, volume, voiceURI]);

  // Charger les voix disponibles
  useEffect(() => {
    function updateVoices() {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    }
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Détecter la langue courante selon le texte (fr-FR ou en-US)
  const detectLang = useCallback((text: string): 'fr-FR' | 'en-US' => {
    const isFrench = /[éèêàùçôîûœ]/i.test(text) || /\b(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles|bonjour|merci|oui|non)\b/i.test(text);
    return isFrench ? 'fr-FR' : 'en-US';
  }, []);

  // Mettre à jour la langue courante à chaque speak
  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Nettoyer le texte avant la synthèse
    const texteNettoye = filtrerCaracteresSpeciaux(text);
    const utterance = new window.SpeechSynthesisUtterance(texteNettoye);
    utterance.rate = options.rate ?? rate;
    utterance.pitch = options.pitch ?? pitch;
    utterance.volume = options.volume ?? volume;
    const detectedLang = options.lang || detectLang(text);
    setLang(detectedLang as 'fr-FR' | 'en-US');
    // Choix de la voix
    let selectedVoice: SpeechSynthesisVoice | undefined = undefined;
    if (options.voiceURI) {
      selectedVoice = voices.find(v => v.voiceURI === options.voiceURI);
    } else if (voiceURI) {
      selectedVoice = voices.find(v => v.voiceURI === voiceURI);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === utterance.lang && v.name.toLowerCase().includes('google'))
        || voices.find(v => v.lang === utterance.lang);
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [muted, rate, pitch, volume, voiceURI, voices, detectLang]);

  const mute = useCallback(() => setMuted(true), []);
  const unmute = useCallback(() => setMuted(false), []);

  // Liste des voix pour la langue courante
  const availableVoices = voices.filter(v => v.lang === lang);

  // Tester la voix sélectionnée
  const testVoice = useCallback(() => {
    const sample = lang === 'fr-FR' ? 'Ceci est un test de synthèse vocale.' : 'This is a speech synthesis test.';
    speak(sample, { voiceURI });
  }, [lang, speak, voiceURI]);

  // Réinitialiser les réglages
  const resetSettings = useCallback(() => {
    setRate(DEFAULTS.rate);
    setPitch(DEFAULTS.pitch);
    setVolume(DEFAULTS.volume);
    setVoiceURI(DEFAULTS.voiceURI);
  }, []);

  // Ajout des fonctions d'export/import/suppression
  const exportSettings = () => {
    const data = { rate, pitch, volume, voiceURI };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  const importSettings = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const { rate, pitch, volume, voiceURI } = JSON.parse(text);
      if (typeof rate === 'number') setRate(rate);
      if (typeof pitch === 'number') setPitch(pitch);
      if (typeof volume === 'number') setVolume(volume);
      if (typeof voiceURI === 'string') setVoiceURI(voiceURI);
      return true;
    } catch {
      return false;
    }
  };

  const deleteSettings = () => {
    localStorage.removeItem(LS_KEY);
    setRate(DEFAULTS.rate);
    setPitch(DEFAULTS.pitch);
    setVolume(DEFAULTS.volume);
    setVoiceURI(DEFAULTS.voiceURI);
  };

  return {
    speak,
    mute,
    unmute,
    muted,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    voiceURI,
    setVoiceURI,
    availableVoices,
    lang,
    testVoice,
    resetSettings,
    exportSettings,
    importSettings,
    deleteSettings,
  };
}