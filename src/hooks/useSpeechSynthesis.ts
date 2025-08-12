import { useCallback, useRef, useState, useEffect } from 'react';

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceURI?: string;
  onEnd?: () => void;
}

const LS_KEY = 'tts_settings';
const DEFAULTS = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: '',
  prosodyDynamic: true,
  dynamicVolume: true,
  segmentFade: true,
};

// Fonction utilitaire pour filtrer les caractères spéciaux
function filtrerCaracteresSpeciaux(texte: string): string {
  // Garde lettres, chiffres, accents, espaces et ponctuation de base
  return texte.replace(/[^a-zA-Z0-9À-ÿ\s.,!?'-]/g, '');
}

// Découper le texte en segments avec pauses naturelles (phrases, paragraphes)
function segmenterTextePourTTS(texte: string): { contenu: string; pauseMs: number }[] {
  const segments: { contenu: string; pauseMs: number }[] = [];
  // Normalise les retours à la ligne et supprime espaces inutiles
  const normalized = texte.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  // Séparation par paragraphes (double saut de ligne)
  const paragraphes = normalized.split(/\n{2,}/).map(t => t.trim()).filter(Boolean);

  // Fun util: ajoute une phrase avec pause adaptée selon ponctuation de fin
  const pushPhrase = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const last = trimmed[trimmed.length - 1] || '';
    const base = 360; // pause de base inter-phrases (ms)
    const extra = last === '.' ? 220 : last === '!' || last === '?' ? 280 : 0;
    segments.push({ contenu: trimmed, pauseMs: base + extra });
  };

  // Découpage
  paragraphes.forEach((para, pIdx) => {
    // Protéger les abréviations courantes pour éviter des découpes trop agressives
    const protectedPara = para.replace(/\b(p\.\s?ex|e\.g|i\.e|etc\.)/gi, (m) => m.replace(/\./g, '·'));
    // Découpe en phrases sur ponctuation forte suivie d’espace
    const phrases = protectedPara.split(/(?<=[.!?])\s+/).map(t => t.replace(/·/g, '.'));
    phrases.map(p => p.trim()).filter(Boolean).forEach((phr) => {
      // Sous-segmentation douce sur virgules et points-virgules
      const morceaux = phr.split(/([,;:])\s*/).filter(Boolean);
      if (morceaux.length <= 1) {
        pushPhrase(phr);
      } else {
        // Reconstituer alternant texte et séparateurs
        for (let i = 0; i < morceaux.length; i++) {
          const part = morceaux[i];
          // Séparateur = virgule/;/: induit une mini-pause
          if (/^[,;:]$/.test(part)) {
            // Mini-pause respiratoire
            segments.push({ contenu: '', pauseMs: part === ',' ? 160 : 200 });
          } else {
            // Si le prochain token est une ponctuation faible, on l’ajoutera via la pause du token après
            segments.push({ contenu: part, pauseMs: 0 });
          }
        }
        // Harmoniser: regrouper consécutifs sans pause en une phrase, et laisser les mini-pauses intactes
        const merged: { contenu: string; pauseMs: number }[] = [];
        let buffer = '';
        for (const seg of segments.splice(segments.length - morceaux.length, morceaux.length)) {
          if (seg.contenu) {
            buffer += (buffer ? ' ' : '') + seg.contenu;
          } else {
            if (buffer) {
              merged.push({ contenu: buffer, pauseMs: seg.pauseMs });
              buffer = '';
            } else {
              // pause seule
              merged.push(seg);
            }
          }
        }
        if (buffer) merged.push({ contenu: buffer, pauseMs: 0 });
        // Appliquer une pause de fin de phrase
        if (merged.length > 0) merged[merged.length - 1].pauseMs = 360;
        segments.push(...merged);
      }
    });
    if (pIdx < paragraphes.length - 1) {
      // Pause marquée entre paragraphes
      segments.push({ contenu: '', pauseMs: 800 });
    }
  });

  return segments.length > 0 ? segments : [{ contenu: texte, pauseMs: 0 }];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeProsodyAdjustments(content: string): { rateDelta: number; pitchDelta: number } {
  if (!content || !content.trim()) return { rateDelta: 0, pitchDelta: 0 };
  const trimmed = content.trim();
  const last = trimmed[trimmed.length - 1] || '';
  // Ajustements selon ponctuation de fin
  if (last === '?') {
    return { rateDelta: -0.05, pitchDelta: +0.12 };
  }
  if (last === '!') {
    return { rateDelta: +0.06, pitchDelta: +0.1 };
  }
  if (last === ',') {
    return { rateDelta: -0.02, pitchDelta: 0 };
  }
  // Ajustement léger selon longueur (phrases longues plus lentes)
  const lengthFactor = clamp((trimmed.length - 80) / 200, -0.05, 0.08); // -0.05 à +0.08
  return { rateDelta: -lengthFactor, pitchDelta: 0 };
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
  const [prosodyDynamic, setProsodyDynamic] = useState<boolean>(DEFAULTS.prosodyDynamic);
  const [dynamicVolume, setDynamicVolume] = useState<boolean>(DEFAULTS.dynamicVolume);
  const [segmentFade, setSegmentFade] = useState<boolean>(DEFAULTS.segmentFade);

  // Charger les réglages depuis le localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const { rate, pitch, volume, voiceURI, prosodyDynamic, dynamicVolume, segmentFade } = JSON.parse(saved);
        if (typeof rate === 'number') setRate(rate);
        if (typeof pitch === 'number') setPitch(pitch);
        if (typeof volume === 'number') setVolume(volume);
        if (typeof voiceURI === 'string') setVoiceURI(voiceURI);
        if (typeof prosodyDynamic === 'boolean') setProsodyDynamic(prosodyDynamic);
        if (typeof dynamicVolume === 'boolean') setDynamicVolume(dynamicVolume);
        if (typeof segmentFade === 'boolean') setSegmentFade(segmentFade);
      } catch {}
    }
  }, []);

  // Sauvegarder les réglages à chaque changement
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ rate, pitch, volume, voiceURI, prosodyDynamic, dynamicVolume, segmentFade }));
  }, [rate, pitch, volume, voiceURI, prosodyDynamic, dynamicVolume, segmentFade]);

  // Charger les voix disponibles
  useEffect(() => {
    function updateVoices() {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
      // Sélectionner la voix Google française par défaut si aucune voix n'est déjà sélectionnée
      if (!voiceURI && allVoices.length > 0) {
        // Cherche une voix Google française
        const googleFr = allVoices.find(v => v.lang === 'fr-FR' && v.name.toLowerCase().includes('google'));
        if (googleFr) {
          setVoiceURI(googleFr.voiceURI);
        } else {
          // Sinon, prend la première voix française disponible
          const fr = allVoices.find(v => v.lang === 'fr-FR');
          if (fr) {
            setVoiceURI(fr.voiceURI);
          }
        }
      }
    }
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceURI]);

  // Détecter la langue courante selon le texte (fr-FR ou en-US)
  const detectLang = useCallback((text: string): 'fr-FR' | 'en-US' => {
    const isFrench = /[éèêàùçôîûœ]/i.test(text) || /\b(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles|bonjour|merci|oui|non)\b/i.test(text);
    return isFrench ? 'fr-FR' : 'en-US';
  }, []);

  // Mettre à jour la langue courante à chaque speak
  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (muted || !('speechSynthesis' in window)) return;
    // Stop toute lecture en cours
    window.speechSynthesis.cancel();

    // Nettoyer et découper en segments
    const texteNettoye = filtrerCaracteresSpeciaux(text);
    const segments = segmenterTextePourTTS(texteNettoye);

    const detectedLang = options.lang || detectLang(text);
    setLang(detectedLang as 'fr-FR' | 'en-US');

    // Préparer la voix sélectionnée (réutilisée pour chaque segment)
    const pickVoice = (langPref: string): SpeechSynthesisVoice | undefined => {
      if (options.voiceURI) return voices.find(v => v.voiceURI === options.voiceURI);
      if (voiceURI) return voices.find(v => v.voiceURI === voiceURI);
      return (
        voices.find(v => v.lang === langPref && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang === langPref)
      );
    };
    const selectedVoice = pickVoice(detectedLang);

    // Chaînage des segments avec micro-pauses
    let index = 0;
    const speakNext = () => {
      if (index >= segments.length) {
        if (typeof options.onEnd === 'function') options.onEnd();
        return;
      }
      const { contenu, pauseMs } = segments[index++];
      if (!contenu || contenu.trim() === '') {
        // Juste une pause
        setTimeout(speakNext, pauseMs);
        return;
      }
      const utt = new window.SpeechSynthesisUtterance(contenu);
      // Prosodie dynamique
      const { rateDelta, pitchDelta } = prosodyDynamic ? computeProsodyAdjustments(contenu) : { rateDelta: 0, pitchDelta: 0 };
      const baseRate = options.rate ?? rate;
      const basePitch = options.pitch ?? pitch;
      utt.rate = clamp(baseRate + rateDelta, 0.6, 1.5);
      utt.pitch = clamp(basePitch + pitchDelta, 0.6, 2);
      // Variation légère de volume sur ponctuation pour respiration
      const last = contenu.trim().slice(-1);
      const volDelta = dynamicVolume && /[,.!?]/.test(last) ? -0.06 : 0;
      utt.volume = clamp((options.volume ?? volume) + volDelta, 0.2, 1);
      utt.lang = detectedLang;
      if (selectedVoice) utt.voice = selectedVoice;
      utteranceRef.current = utt;
      utt.onend = () => {
        if (pauseMs > 0) {
          // Smooth fade entre segments si activé
          if (segmentFade) {
            // Micro-décalage avant reprise
            setTimeout(speakNext, Math.max(60, pauseMs - 40));
          } else {
            setTimeout(speakNext, pauseMs);
          }
        } else {
          speakNext();
        }
      };
      window.speechSynthesis.speak(utt);
    };

    speakNext();
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
    const data = { rate, pitch, volume, voiceURI, prosodyDynamic, dynamicVolume, segmentFade };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  const importSettings = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const { rate, pitch, volume, voiceURI, prosodyDynamic, dynamicVolume, segmentFade } = JSON.parse(text);
      if (typeof rate === 'number') setRate(rate);
      if (typeof pitch === 'number') setPitch(pitch);
      if (typeof volume === 'number') setVolume(volume);
      if (typeof voiceURI === 'string') setVoiceURI(voiceURI);
      if (typeof prosodyDynamic === 'boolean') setProsodyDynamic(prosodyDynamic);
      if (typeof dynamicVolume === 'boolean') setDynamicVolume(dynamicVolume);
      if (typeof segmentFade === 'boolean') setSegmentFade(segmentFade);
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
    setProsodyDynamic(DEFAULTS.prosodyDynamic);
    setDynamicVolume(DEFAULTS.dynamicVolume);
    setSegmentFade(DEFAULTS.segmentFade);
  };

  // Ajout de la fonction stop pour annuler la lecture TTS en cours
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    speak,
    mute,
    unmute,
    stop,
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
    prosodyDynamic,
    setProsodyDynamic,
    dynamicVolume,
    setDynamicVolume,
    segmentFade,
    setSegmentFade,
  };
}