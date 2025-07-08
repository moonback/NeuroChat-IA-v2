// Types globaux pour la compatibilité TypeScript avec l'API Web Speech
// (utile si le projet n'a pas @types/w3c-web-speech)

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: any) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    abort(): void;
    start(): void;
    stop(): void;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

import { useState, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string; // 'fr-FR' par défaut, sinon 'en-US'
  interimResults?: boolean; // true pour transcription en direct
  continuous?: boolean; // false = push-to-talk (arrêt auto après une phrase)
  onResult?: (text: string) => void; // callback sur résultat final
  onEnd?: (finalText: string) => void; // callback à la fin de la dictée
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialisation de l'API
  const getRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    if (!recognitionRef.current) {
      const rec: SpeechRecognition = new SpeechRecognition();
      rec.continuous = options.continuous ?? false;
      rec.interimResults = options.interimResults ?? true;
      rec.lang = options.lang || 'fr-FR';
      recognitionRef.current = rec;
    }
    return recognitionRef.current;
  }, [options.lang, options.interimResults, options.continuous]);

  // Démarrer la reconnaissance
  const start = useCallback(() => {
    setError(null);
    const recognition = getRecognition();
    if (!recognition) {
      setError("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }
    recognition.lang = options.lang || 'fr-FR';
    setTranscript('');
    let lastFinal = '';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }
      setTranscript(final + interim);
      lastFinal = final;
      if (final && options.onResult) {
        options.onResult(final.trim());
      }
    };
    recognition.onerror = (event: any) => {
      setError(event.error || 'Erreur de reconnaissance vocale');
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      if (options.onEnd) {
        options.onEnd(lastFinal.trim());
      }
    };
    try {
      recognition.start();
      setListening(true);
    } catch (e) {
      setError('Impossible de démarrer la reconnaissance vocale.');
    }
  }, [getRecognition, options.lang, options.onResult, options.onEnd]);

  // Arrêter la reconnaissance
  const stop = useCallback(() => {
    const recognition = getRecognition();
    if (recognition) {
      recognition.stop();
    }
    setListening(false);
  }, [getRecognition]);

  // Réinitialiser la transcription
  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    listening,
    transcript,
    error,
    start,
    stop,
    reset,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
} 