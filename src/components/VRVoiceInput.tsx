import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VRVoiceInputProps {
  onSendMessage: (message: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

export const VRVoiceInput: React.FC<VRVoiceInputProps> = ({
  onSendMessage,
  onStartListening,
  onStopListening
}) => {
  const [transcript, setTranscript] = useState('');
  const [isVRVoiceActive, setIsVRVoiceActive] = useState(false);

  const {
    listening: speechListening,
    start,
    stop,
    reset
  } = useSpeechRecognition({
    lang: 'fr-FR',
    interimResults: true,
    continuous: false,
    onResult: (text) => {
      setTranscript(text);
    },
    onEnd: (finalText) => {
      if (finalText.trim()) {
        onSendMessage(finalText);
        setTranscript('');
        reset();
      }
    }
  });

  useEffect(() => {
    if (isVRVoiceActive && !speechListening) {
      start();
    } else if (!isVRVoiceActive && speechListening) {
      stop();
    }
  }, [isVRVoiceActive, speechListening, start, stop]);

  const handleVRVoiceToggle = () => {
    setIsVRVoiceActive(!isVRVoiceActive);
    if (!isVRVoiceActive) {
      onStartListening();
    } else {
      onStopListening();
    }
  };

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Indicateur de reconnaissance vocale */}
        {isVRVoiceActive && (
          <div className="bg-black/70 backdrop-blur-lg rounded-full p-4 border-2 border-blue-400 animate-pulse">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">
                {transcript || 'Écoute...'}
              </span>
            </div>
          </div>
        )}

        {/* Bouton de reconnaissance vocale */}
        <button
          onClick={handleVRVoiceToggle}
          className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
            isVRVoiceActive
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <div className="text-white text-2xl">
            {isVRVoiceActive ? '🎤' : '🎤'}
          </div>
        </button>

        {/* Instructions */}
        <div className="text-white text-xs text-center bg-black/50 backdrop-blur-lg rounded-lg p-2">
          <p>Cliquez pour {isVRVoiceActive ? 'arrêter' : 'commencer'} la reconnaissance vocale</p>
        </div>
      </div>
    </div>
  );
}; 