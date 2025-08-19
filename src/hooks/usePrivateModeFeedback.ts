import { useRef, useState, useEffect } from 'react';

export function usePrivateModeFeedback(modePrive: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPrivateIndicator, setShowPrivateIndicator] = useState(false);

  useEffect(() => {
    if (!modePrive) {
      setShowPrivateIndicator(false);
      return;
    }

    setShowPrivateIndicator(true);

    // Audio feedback amélioré
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Masquer l'indicateur après 3 secondes
    const timer = setTimeout(() => setShowPrivateIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, [modePrive]);

  return { audioRef, showPrivateIndicator };
}
