import { VrScene } from './VrScene';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useEffect } from 'react';

export interface VrAppProps {
  open: boolean;
  onClose: () => void;
  messages: { id: string; text: string; isUser: boolean }[];
  onSendMessage: (text: string) => void;
}

export function VrApp({ open, onClose, messages, onSendMessage }: VrAppProps) {
  const { speak } = useSpeechSynthesis();
  const { listening, start, stop, transcript, reset } = useSpeechRecognition({
    interimResults: false,
    continuous: false,
    lang: 'fr-FR',
  });

  useEffect(() => {
    if (!open) return;
    const last = messages[messages.length - 1];
    if (last && !last.isUser) {
      speak(last.text);
    }
  }, [messages, open, speak]);

  if (!open) return null;

  const handleMic = () => {
    if (listening) {
      stop();
      if (transcript.trim()) {
        onSendMessage(transcript.trim());
      }
      reset();
    } else {
      start();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <VrScene />
      <button
        onClick={onClose}
        className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg text-sm"
      >
        Quitter VR
      </button>
      <button
        onClick={handleMic}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg text-sm"
      >
        {listening ? 'Envoyer' : 'Parler'}
      </button>
    </div>
  );
}
