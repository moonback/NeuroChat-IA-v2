import { useCallback, useRef, useState } from 'react';

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export function useSpeechSynthesis() {
  const [muted, setMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (muted || !('speechSynthesis' in window)) return;
    // Arrêter la lecture précédente
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    // Détection automatique de la langue
    const isFrench = /[éèêàùçôîûœ]/i.test(text) || /\b(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles|bonjour|merci|oui|non)\b/i.test(text);
    utterance.lang = options.lang || (isFrench ? 'fr-FR' : 'en-US');
    // Choix de la voix
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang === utterance.lang && voice.name.toLowerCase().includes('google')
    ) || voices.find(voice => voice.lang === utterance.lang);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [muted]);

  const mute = useCallback(() => setMuted(true), []);
  const unmute = useCallback(() => setMuted(false), []);

  return { speak, mute, unmute, muted };
}