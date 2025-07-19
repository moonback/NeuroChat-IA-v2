import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { VRController } from './types';

interface VRVoiceInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  controllers: VRController[];
  isVRMode: boolean;
}

export const VRVoiceInput: React.FC<VRVoiceInputProps> = ({
  onSendMessage,
  isLoading,
  controllers,
  isVRMode
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  
  const voicePanelRef = useRef<HTMLDivElement>(null);

  // Hook de reconnaissance vocale
  const { start, stop, isSupported: speechSupported } = useSpeechRecognition({
    lang: 'fr-FR',
    interimResults: true,
    continuous: false,
    onResult: (text) => {
      setTranscript(text);
    },
    onEnd: (finalText) => {
      setIsListening(false);
      if (finalText.trim()) {
        onSendMessage(finalText);
        setTranscript('');
      }
    }
  });

  // Démarrer l'écoute vocale
  const handleStartVoice = () => {
    if (!isLoading && speechSupported) {
      setIsListening(true);
      setTranscript('');
      start();
    }
  };

  // Arrêter l'écoute vocale
  const handleStopVoice = () => {
    setIsListening(false);
    stop();
  };

  // Gestion des contrôleurs VR
  useEffect(() => {
    if (!isVRMode) return;

    controllers.forEach(controller => {
      // Détecter les clics sur le panneau vocal
      if (controller.buttons.some(btn => btn.pressed)) {
        const controllerPosition = {
          x: controller.position.x,
          y: controller.position.y,
          z: controller.position.z
        };

        // Vérifier si le contrôleur pointe vers le panneau vocal
        if (showVoicePanel && voicePanelRef.current) {
          // Logique de détection de collision simplifiée
          const distance = Math.sqrt(
            Math.pow(controllerPosition.x, 2) +
            Math.pow(controllerPosition.y, 2) +
            Math.pow(controllerPosition.z, 2)
          );

          if (distance < 2) {
            if (!isListening) {
              handleStartVoice();
            } else {
              handleStopVoice();
            }
          }
        }
      }
    });
  }, [controllers, isVRMode, showVoicePanel, isListening]);

  // Afficher le panneau vocal en VR
  useEffect(() => {
    if (isVRMode) {
      setShowVoicePanel(true);
    } else {
      setShowVoicePanel(false);
    }
  }, [isVRMode]);

  if (!isVRMode) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Panneau vocal en VR */}
      {showVoicePanel && (
        <div
          ref={voicePanelRef}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        >
          <div className="bg-black bg-opacity-80 text-white p-6 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-6">
              {/* Bouton microphone */}
              <button
                onClick={isListening ? handleStopVoice : handleStartVoice}
                disabled={isLoading || !speechSupported}
                className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                } ${isLoading || !speechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isListening ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  )}
                </svg>
              </button>

              {/* Indicateur de statut */}
              <div className="flex-1">
                <div className="text-lg font-semibold mb-2">
                  {isListening ? '🎤 Écoute en cours...' : '🎙️ Appuyez pour parler'}
                </div>
                {transcript && (
                  <div className="text-sm text-gray-300 mt-2 max-w-xs bg-white/10 p-2 rounded-lg">
                    💬 {transcript}
                  </div>
                )}
              </div>

              {/* Indicateur de compatibilité */}
              {!speechSupported && (
                <div className="text-sm text-red-400 bg-red-500/20 p-2 rounded-lg">
                  ⚠️ Reconnaissance vocale non supportée
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black bg-opacity-80 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-sm font-medium">🤖 IA en train de réfléchir...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 